package main

import (
	"fmt"
	"log"
	"strings"

	"crypto/tls"

	"github.com/parnurzeal/gorequest"
	"gopkg.in/mgo.v2/bson"
)

// OrkaMon is a function for tracking which plays exist and then running them sequentually.
func OrkaMon() {
	sessionClone := Sessions.Clone()
	c := sessionClone.DB("test").C("playbook")

	var plays []PlaybookEntry
	_ = c.Find(nil).All(&plays)
	if plays != nil {
		for _, play := range plays {
			go PlayRun(play)
		}
	}
}

// PlayRun is a function for running a playbook entry received from OrkaMon.
func PlayRun(play PlaybookEntry) {
	var indicators []RawIndicators
	sessionClone := Sessions.Clone()
	c := sessionClone.DB("test").C("pre_processing")
	log.Printf("Take indicators from %v, process, and send to %v\n", play.Source, play.Dest)
	_ = c.Find(bson.M{"source": play.Source}).All(&indicators)

	ID := play.ID
	var indicators2 []RawIndicators

	// Check and make sure the indicator has not already been processed through this play.
	for _, entry := range indicators {
		if contains(entry.OrkaTracker, ID) == false {
			indicators2 = append(indicators2, entry)
		}
	}

	h := sessionClone.DB("test").C("pre_processing")

	// Mark all indicators as being processed by the play.
	h.UpdateAll(bson.M{"source": play.Source}, bson.M{"$addToSet": bson.M{"orkatracker": play.ID}})

	for _, operator := range play.Operators {
		log.Println(operator)
	}

	if play.Dest != "" {
		switch play.Dest {
		case "crits":
			go OrkaToCrits(indicators2)
		case "postprocessing":
			go SendToPost(indicators2)
		}
	}
}

// Function to see if a string slice contains a string.
func contains(array []string, test string) bool {
	for _, value := range array {
		if value == test {
			return true
		}
	}
	return false
}

// SendToPost is a gadget for the orchestration to be used for sending indicators to post-processing.
func SendToPost(indicators []RawIndicators) {
	// Connect to databse and insert document.
	sessionClone := Sessions.Clone()
	c := sessionClone.DB("test").C("post_processing")

	d := sessionClone.DB("test").C("pre_processing")

	for _, processedindicator := range indicators {
		log.Printf("Received request to move %v to post-processing.\n", processedindicator.Indicator)

		err := c.Insert(processedindicator)
		if err != nil {
			FatalError(err)
		}
		count, err := c.Find(bson.M{"guid": processedindicator.Guid}).Count()
		if err != nil {
			FatalError(err)
		}
		// Check if indicator is present in post-processing.
		if count > 0 {
			_, err := d.RemoveAll(bson.M{"guid": processedindicator.Guid})
			if err != nil {
				FatalError(err)
			}
			log.Printf("%v successfully transferred from pre-processing to post-processing.\n", processedindicator.Indicator)
		} else {
			log.Printf("Indicator %v failed to be moved to post-processing.\n", processedindicator.Indicator)

		}
	}
}

// OrkaToCrits is a gadget for the orchestration to be used for sending indicators to CRITs.
func OrkaToCrits(indicators []RawIndicators) {
	sessionClone := Sessions.Clone()
	d := sessionClone.DB("test").C("pre_processing")

	for _, processedindicator := range indicators {
		// Switch to conform GOSINT indicator types to CRITs indicator types.
		var indicator_type string

		switch processedindicator.Ind_type {
		case "domain":
			indicator_type = "Domain"
		case "url":
			indicator_type = "URI"
		case "ip":
			indicator_type = "IPv4 Address"
		case "sha256":
			indicator_type = "SHA256"
		case "md5":
			indicator_type = "MD5"
		}

		joinedTags := strings.Join(processedindicator.Tags, ",")
		if joinedTags == "" {
			joinedTags = "gosint"
		} else {
			joinedTags = joinedTags + ", gosint"
		}
		// Build structure for indicator to be sent to CRITs.
		jayson := fmt.Sprintf(`{"type":"%v", "indicator_confidence":"medium", "indicator_impact":"medium", "source":"%v", "value":"%v", "description":"%v", "reference":"gosint", "bucket_list":"%v"}`, indicator_type, Config.CRITsSource, processedindicator.Indicator, processedindicator.Context, joinedTags)
		request := gorequest.New().TLSClientConfig(&tls.Config{InsecureSkipVerify: true})
		jayson = strings.Replace(jayson, "\n", " ", -1)
		jayson = strings.Replace(jayson, "\r", " ", -1)
		// Make POST request to CRITs API to upload indicator.
		_, _, err := request.Post(Config.CRITsServer + "/api/v1/indicators/?username=" + Config.CRITsUser + "&api_key=" + Config.CRITsKey).
			Send(jayson).
			End()
		if err != nil {
			log.Println(err)
		}

		_, err2 := d.RemoveAll(bson.M{"guid": processedindicator.Guid})
		if err2 != nil {
			FatalError(err2)
		}
		log.Printf("%v successfully transferred from pre-processing to CRITs.\n", processedindicator.Indicator)
	}
}


