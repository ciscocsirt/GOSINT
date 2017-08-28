package main

import (
	"log"
	"net"
	"strings"
	"time"

	"gopkg.in/mgo.v2/bson"

	"github.com/ammario/ipisp"
)

// InsertRaw is used for inserting new indicators in the pre-processing MongoDB collection.
func InsertRaw() {
	sessionClone := Sessions.Clone()
	defer sessionClone.Close()

	//Set timeout high to work with the growth of the historic collection.
	sessionClone.SetSocketTimeout(1 * time.Hour)

	for {
Loop:
		select {
		case v := <-InsertionQueue:
			h := sessionClone.DB("test").C("historic")
			count, err := h.Find(bson.M{"indicator": v.Indicator}).Count()
			if err != nil {
				FatalError(err)
			}
			// If indicator does exist in historic collection, skip inserting in DB.
			if count > 0 {
				//log.Printf("Indicator %v has already been seen.\n", v.Indicator)
				break Loop
			}

			// Check to see if domain matches Alexa domain or contains invalid characters.
			switch v.Ind_type {
			case "domain":
				domain := v.Indicator
				for _, top := range Config.AlexaDomains {
					if strings.EqualFold(domain, top) {
						log.Printf("Indicator %v found in Alexa top 10,000 domains", domain)
						break Loop
					} else if strings.ContainsAny(domain, "',`()*^&%$#@!") {
						log.Printf("Indicator %v contains invalid characters, dropping indicator.\n", domain)
						break Loop
					} else {
						continue
					}
				}
			// Check whitelist domains against URL and for invalid characters.
			case "url":
				url := v.Indicator
				for _, test := range Config.WhiteListDomains {
					if strings.Contains(url, test+"/") {
						log.Printf("Indicator %v found in Alexa top 10,000 domains", url)
						break Loop
					} else if strings.ContainsAny(url, "',`") {
						log.Println("Indicator %v contains invalid characters, dropping indicator.", url)
						break Loop
					} else {
						continue
					}
				}
			// Attempt to append some extra ASN and ISP information for the IP to the context.
			case "ip":
				ip := &v.Indicator
				context := &v.Context
				client, err := ipisp.NewDNSClient()

				if err != nil {
					log.Println("Error creating IP reverse lookup client: %v", err)
				}

				resp, err := client.LookupIP(net.ParseIP(*ip))

				if err != nil {
					log.Println("Error doing reverse lookup on %v: %v", *ip, err)
					break Loop
				}

				*context = *context + "| ASN: " + resp.ASN.String() + " ISP: " + resp.Name.Raw

				// Check the IP against the ISP whitelist so you can drop IPs from ISPs that are known good.
				for _, whitelist := range Config.WhitelistISP {
					whitelistisp := strings.ToLower(whitelist)
					isp := strings.ToLower(resp.Name.Raw)
					if strings.Contains(isp, whitelistisp) {
						log.Printf("Whitelisted ISP found, ignorring %v\n", *ip)
						break Loop
					}
				}

			default:
				break Loop
			}

			// Insert raw indicator document into historic.
			err = h.Insert(v)
			if err != nil {
				log.Println(err)
			}

			c := sessionClone.DB("test").C("pre_processing")

			// Insert raw indicator document into pre-processing.
			err = c.Insert(v)
			if err != nil {
				log.Println(err)
			}
			//sessionClone.Close()
			time.Sleep(3)
		}
	}
}

