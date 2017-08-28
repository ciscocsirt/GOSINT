package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"regexp"
	"strings"
	"time"

	"crypto/tls"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"

	"github.com/gorilla/mux"
	"github.com/mvdan/xurls"
	"github.com/parnurzeal/gorequest"
	"github.com/rs/xid"
)

// GetAllPre gathers all documents in the pre-processing collection and structures them in a JSON API response.
func GetAllPre(w http.ResponseWriter, r *http.Request) {
	sessionClone := Sessions.Clone()
	c := sessionClone.DB("test").C("pre_processing")

	switch r.Method {
	// Retrieve all the indicators in pre-processing and return them.
	case "GET":
		var results []RawIndicators
		_ = c.Find(nil).All(&results)
		if results != nil {
			m := AllResults{results}
			outData, _ := json.Marshal(m)
			w.Header().Set("Access-Control-Allow-Methods", "GET, PUT")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.Write(outData)
		} else {
			w.Header().Set("Access-Control-Allow-Methods", "GET, PUT")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			m := APIResponse{"none found"}
			outData, _ := json.Marshal(m)
			w.Write(outData)
		}
	// PUT HTTP method is used for editing indicators in pre-processing.
	case "PUT":
		var rawindicator RawIndicators
		body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
		if err != nil {
			panic(err)
		}
		if err := json.Unmarshal(body, &rawindicator); err != nil {
			w.Header().Set("Access-Control-Allow-Methods", "GET, PUT")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(422) // unprocessable entity
			if err := json.NewEncoder(w).Encode(err); err != nil {
				log.Println(err)
			}
		}

		length := len(rawindicator.Guid)
		if length != 20 {
			m := APIResponse{"Invalid GUID length"}
			outData, _ := json.Marshal(m)

			w.Header().Set("Access-Control-Allow-Methods", "POST")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.Write(outData)
		} else {

			log.Printf("Received request to update GUID %v in pre-processing\n", rawindicator.Guid)

			sessionClone := Sessions.Clone()
			c := sessionClone.DB("test").C("pre_processing")
			log.Println("Changes:")
			log.Println(rawindicator)
			log.Println("{indicator: " + rawindicator.Indicator + ", type: " + rawindicator.Ind_type + ", source: " + rawindicator.Source + ", context: " + rawindicator.Context + "}")

			change := mgo.Change{
				Update:    bson.M{"$set": bson.M{"indicator": rawindicator.Indicator, "ind_type": rawindicator.Ind_type, "source": rawindicator.Source, "context": rawindicator.Context, "tags": rawindicator.Tags}},
				ReturnNew: true,
			}

			var doc RawIndicators

			_, _ = c.Find(bson.M{"guid": rawindicator.Guid}).Apply(change, &doc)
			log.Printf("Successfully updated %v", doc.Guid)

			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			response := APIResponse{"Successfully edited indicator"}
			outData, _ := json.Marshal(response)
			w.Write(outData)
		}
	}
}

// GetSinglePre gathers a single in the pre-processing collection and structures it in a JSON API response or deletes it based of method use.
func GetSinglePre(w http.ResponseWriter, r *http.Request) {
	// Parse pre ID from URL which is a GUID for a single pre entry.
	vars := mux.Vars(r)
	preId := vars["preId"]

	sessionClone := Sessions.Clone()
	c := sessionClone.DB("test").C("pre_processing")

	switch r.Method {
	// GET request results in indicator for the GUID specified.
	case "GET":
		var results []ProcessedIndicator
		_ = c.Find(bson.M{"guid": preId}).All(&results)
		if results != nil {
			m := AllResultsPost{results}
			outData, _ := json.Marshal(m)
			w.Header().Set("Access-Control-Allow-Methods", "GET, DELETE")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.Write(outData)
		} else {
			w.Header().Set("Access-Control-Allow-Methods", "GET, DELETE")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			m := APIResponse{"none found"}
			outData, _ := json.Marshal(m)
			w.Write(outData)
		}
	// DELETE request results in indicator being deleted for the GUID specified.
	case "DELETE":
		err := c.Remove(bson.M{"guid": preId})
		if err != nil {
			switch err {
			default:
				w.Header().Set("Access-Control-Allow-Methods", "GET, DELETE")
				w.Header().Set("Access-Control-Allow-Origin", "*")
				w.Header().Set("Content-Type", "application/json; charset=UTF-8")
				m := APIResponse{"database error"}
				outData, _ := json.Marshal(m)
				w.Write(outData)
				log.Println("Failed delete pre-indicator: ", err)
				return
			case mgo.ErrNotFound:
				w.Header().Set("Access-Control-Allow-Methods", "GET, DELETE")
				w.Header().Set("Access-Control-Allow-Origin", "*")
				w.Header().Set("Content-Type", "application/json; charset=UTF-8")
				m := APIResponse{"none found"}
				outData, _ := json.Marshal(m)
				w.Write(outData)
				return
			}
		}
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.Header().Set("Access-Control-Allow-Methods", "GET, DELETE")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		response := APIResponse{"deleted " + preId}
		outData, _ := json.Marshal(response)
		w.Write(outData)
	}
}

// Processed is a function to receive HTTP POST requests containing the processed indicator or a GET request to list all records.
func Processed(w http.ResponseWriter, r *http.Request) {
	// Switch to detect HTTP method.
	switch r.Method {
	// If GET is received, retrieve all post-processing documents.
	case "GET":
		sessionClone := Sessions.Clone()
		c := sessionClone.DB("test").C("post_processing")
		var results []ProcessedIndicator
		_ = c.Find(nil).All(&results)
		if results != nil {
			m := AllResultsPost{results}
			outData, _ := json.Marshal(m)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.Write(outData)
		} else {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			m := APIResponse{"none found"}
			outData, _ := json.Marshal(m)
			w.Write(outData)
		}
	// If POST is received, submit post-processing indicator document to databse.
	case "POST":
		var processedindicator ProcessedIndicator
		body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
		if err != nil {
			panic(err)
		}
		if err := json.Unmarshal(body, &processedindicator); err != nil {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(422) // unprocessable entity
			if err := json.NewEncoder(w).Encode(err); err != nil {
				log.Println(err)
			}
		}

		length := len(processedindicator.Indicator)
		if length == 0 {
			m := APIResponse{"Indicator field empty"}
			outData, _ := json.Marshal(m)

			w.Header().Set("Access-Control-Allow-Methods", "POST")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.Write(outData)
		} else {

			log.Printf("Received request to move %v to post-processing.\n", processedindicator.Indicator)

			// Connect to databse and insert document.
			sessionClone := Sessions.Clone()
			c := sessionClone.DB("test").C("post_processing")

			err = c.Insert(processedindicator)
			if err != nil {
				FatalError(err)
			} else {
				h := sessionClone.DB("test").C("post_processing")
				count, err := h.Find(bson.M{"guid": processedindicator.Guid}).Count()
				if err != nil {
					FatalError(err)
				}
				if count > 0 {
					d := sessionClone.DB("test").C("pre_processing")
					_, err := d.RemoveAll(bson.M{"guid": processedindicator.Guid})
					if err != nil {
						FatalError(err)
					}
					log.Printf("%v successfully transferred from pre-processing to post-processing.\n", processedindicator.Indicator)
				} else {
					log.Printf("Indicator %v already exists in post-processing.\n", processedindicator.Indicator)
				}
			}
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			response := APIResponse{"Successfully moved indicators"}
			outData, _ := json.Marshal(response)
			w.Write(outData)
		}
	// PUT HTTP method is used for updating post-processing indicators.
	case "PUT":
		var processedindicator ProcessedIndicator
		body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
		if err != nil {
			panic(err)
		}
		if err := json.Unmarshal(body, &processedindicator); err != nil {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(422) // unprocessable entity
			if err := json.NewEncoder(w).Encode(err); err != nil {
				log.Println(err)
			}
		}

		length := len(processedindicator.Guid)
		if length != 20 {
			m := APIResponse{"Invalid GUID length"}
			outData, _ := json.Marshal(m)

			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.Write(outData)
		} else {

			log.Printf("Received request to update GUID %v in post-processing\n", processedindicator.Guid)

			sessionClone := Sessions.Clone()
			c := sessionClone.DB("test").C("post_processing")
			log.Println("Changes:")
			log.Println(processedindicator)
			log.Println("{indicator: " + processedindicator.Indicator + ", type: " + processedindicator.Ind_type + ", source: " + processedindicator.Source + ", context: " + processedindicator.Context + "}")

			change := mgo.Change{
				Update:    bson.M{"$set": bson.M{"indicator": processedindicator.Indicator, "ind_type": processedindicator.Ind_type, "source": processedindicator.Source, "context": processedindicator.Context, "tags": processedindicator.Tags}},
				ReturnNew: true,
			}

			var doc ProcessedIndicator

			_, _ = c.Find(bson.M{"guid": processedindicator.Guid}).Apply(change, &doc)
			log.Printf("Successfully updated %v", doc.Guid)

			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			response := APIResponse{"Successfully edited indicator"}
			outData, _ := json.Marshal(response)
			w.Write(outData)
		}
	}
}

// DeleteSinglePost gathers a single in the post-processing collection and deletes it.
func DeleteSinglePost(w http.ResponseWriter, r *http.Request) {
	// Parse GUID from URL.
	vars := mux.Vars(r)
	postID := vars["postId"]

	sessionClone := Sessions.Clone()
	c := sessionClone.DB("test").C("post_processing")

	err := c.Remove(bson.M{"guid": postID})
	if err != nil {
		switch err {
		default:
			w.Header().Set("Access-Control-Allow-Methods", "GET, DELETE")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			m := APIResponse{"database error"}
			outData, _ := json.Marshal(m)
			w.Write(outData)
			log.Println("Failed delete post-indicator: ", err)
			return
		case mgo.ErrNotFound:
			w.Header().Set("Access-Control-Allow-Methods", "GET, DELETE")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			m := APIResponse{"none found"}
			outData, _ := json.Marshal(m)
			w.Write(outData)
			return
		}
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Header().Set("Access-Control-Allow-Methods", "GET, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	response := APIResponse{"deleted " + postID}
	outData, _ := json.Marshal(response)
	w.Write(outData)
}

// DumpCSV is a function to recieve HTTP POST requests containing a list of GUID objects or choose all and dump them to CSV.
func DumpCSV(w http.ResponseWriter, r *http.Request) {
	// Switch to detect HTTP method.
	switch r.Method {
	// If GET is received, retrieve all post-processing documents and return CSV.
	case "GET":
		sessionClone := Sessions.Clone()
		c := sessionClone.DB("test").C("post_processing")
		var results []ProcessedIndicator
		_ = c.Find(nil).All(&results)

		//Set up CSV buffer
		var CSVResponse bytes.Buffer
		CSVResponse.WriteString("guid, date, indicator, type, source, context, tags\n")

		if results != nil {
			for _, entry := range results {
				newContext := strings.Replace(entry.Context, ",", " ", -1)
				newContext2 := strings.Replace(newContext, "\n", " ", -1)
				CSVResponse.WriteString(entry.Guid + ", " + entry.Date + ", " + entry.Indicator + ", " + entry.Ind_type + ", " + entry.Source + ", " + newContext2 + ", " + strings.Join(entry.Tags, " ") + "\n")
			}
			m := CSVResponse.Bytes()
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/csv; charset=UTF-8")
			w.Write(m)
		} else {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			m := APIResponse{"none found"}
			outData, _ := json.Marshal(m)
			w.Write(outData)
		}
	// If POST is received, parse body and get specified records.
	case "POST":
		var records Dump
		body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
		if err != nil {
			log.Println(err)
		}
		if err := json.Unmarshal(body, &records); err != nil {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(422) // unprocessable entity
			if err := json.NewEncoder(w).Encode(err); err != nil {
				log.Println(err)
			}
		}
		length := len(records.Records)
		if length == 0 {
			m := APIResponse{"No records specified"}
			outData, _ := json.Marshal(m)

			w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.Write(outData)
		} else {

			// Connect to database and retrieve specified records.
			sessionClone := Sessions.Clone()
			c := sessionClone.DB("test").C("post_processing")
			var results []ProcessedIndicator

			// Set up CSV buffer.
			var CSVResponse bytes.Buffer
			CSVResponse.WriteString("guid, date, indicator, type, source, context, tags\n")

			for _, record := range records.Records {
				_ = c.Find(bson.M{"guid": record.Guid}).All(&results)
				if results != nil {
					for _, entry := range results {
						newContext := strings.Replace(entry.Context, ",", " ", -1)
						newContext2 := strings.Replace(newContext, "\n", " ", -1)
						CSVResponse.WriteString(entry.Guid + ", " + entry.Date + ", " + entry.Indicator + ", " + entry.Ind_type + ", " + entry.Source + ", " + newContext2 + ", " + strings.Join(entry.Tags, " ") + "\n")
					}
				} else {
					w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
					w.Header().Set("Access-Control-Allow-Origin", "*")
					w.Header().Set("Content-Type", "application/json; charset=UTF-8")
					m := APIResponse{"none found"}
					outData, _ := json.Marshal(m)
					w.Write(outData)
				}
			}
			m := CSVResponse.Bytes()
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/csv; charset=UTF-8")
			w.Write(m)
		}
	}
}

// SendToCrits is a function to recieve HTTP POST requests containing a list of GUID objects or choose all and send them to CRITs.
func SendToCrits(w http.ResponseWriter, r *http.Request) {
	// Switch to detect HTTP method.
	switch r.Method {
	// If POST is received, parse body and get specified records.
	case "POST":
		var records Dump
		body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
		if err != nil {
			log.Println(err)
		}
		if err := json.Unmarshal(body, &records); err != nil {
			w.Header().Set("Access-Control-Allow-Methods", "POST")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(422) // unprocessable entity
			if err := json.NewEncoder(w).Encode(err); err != nil {
				log.Println(err)
			}
		}

		length := len(records.Records)
		if length == 0 {
			m := APIResponse{"No records specified"}
			outData, _ := json.Marshal(m)

			w.Header().Set("Access-Control-Allow-Methods", "POST")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.Write(outData)
		} else {

			// Connect to database and retrieve specified records.
			sessionClone := Sessions.Clone()
			c := sessionClone.DB("test").C("post_processing")
			var results []ProcessedIndicator

			for _, record := range records.Records {
				_ = c.Find(bson.M{"guid": record.Guid}).All(&results)
				if results != nil {
					for _, entry := range results {
						// Switch to conform GOSINT indicator types to CRITs indicator types.
						var indicator_type string

						switch entry.Ind_type {
						case "domain":
							indicator_type = "Domain"
						case "url":
							indicator_type = "URI"
						case "ip":
							indicator_type = "IPv4 Address"
						case "md5":
							indicator_type = "MD5"
						case "sha1":
							indicator_type = "SHA1"
						case "sha256":
							indicator_type = "SHA256"
						}

						joinedTags := strings.Join(entry.Tags, ",")
						if joinedTags == "" {
							joinedTags = "gosint"
						} else {
							joinedTags = joinedTags + ", gosint"
						}
						// Build structure for indicator to be sent to CRITs.
						jayson := fmt.Sprintf(`{"type":"%v", "indicator_confidence":"medium", "indicator_impact":"medium", "source": "%v", "reference": "gosint", "value":"%v", "description":"%v", "bucket_list":"%v"}`, indicator_type, Config.CRITsSource, entry.Indicator, entry.Context, joinedTags)
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
					}
				} else {
					w.Header().Set("Access-Control-Allow-Methods", "POST")
					w.Header().Set("Access-Control-Allow-Origin", "*")
					w.Header().Set("Content-Type", "application/json; charset=UTF-8")
					m := APIResponse{"none found"}
					outData, _ := json.Marshal(m)
					w.Write(outData)
				}
			}
			m := []byte(`{"response":"good"}`)
			w.Header().Set("Access-Control-Allow-Methods", "POST")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.Write(m)
		}
	}
}

// GoGet is a function to run ad-hoc analysis of a web resource for indicators.
func GoGet(w http.ResponseWriter, r *http.Request) {
	var adhoc AdHoc
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {
		panic(err)
	}
	if err := json.Unmarshal(body, &adhoc); err != nil {
		w.Header().Set("Access-Control-Allow-Methods", "POST")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(422) // unprocessable entity
		if err := json.NewEncoder(w).Encode(err); err != nil {
			log.Println(err)
		}
	}
	var message string
	// Determine if a URL is to be retrieved for analysis.
	if adhoc.Resource != "" {
		url := adhoc.Resource

		request := gorequest.New()
		_, page, errr := request.Get(url).End()
		if err != nil {
			log.Println(errr)
			return
		}
		message = page
		// Determine if submitted text is to be processed.
	} else if adhoc.TextToParse != "" {
		message = adhoc.TextToParse
		adhoc.Resource = "Text input"
		// Nothing submitted.
	} else {
		m := APIResponse{"Failed to find URL resource or text to parse."}
		outData, _ := json.Marshal(m)

		w.Header().Set("Access-Control-Allow-Methods", "POST")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.Write(outData)
	}

	message = strings.Replace(message, "hxxp", "http", -1)
	message = strings.Replace(message, "[.]", ".", -1)
	message = strings.Replace(message, "\\", "/", -1)
	message = strings.Replace(message, " . ", ".", -1)
	message = strings.Replace(message, "h**p", "http", -1)
	message = strings.Replace(message, "[", "", -1)
	message = strings.Replace(message, "]", "", -1)
	message = strings.Replace(message, "[dot]", ".", -1)
	message = strings.Replace(message, "(dot)", ".", -1)
	message = strings.Replace(message, "\n", " ", -1)
	message = strings.Replace(message, "\r", " ", -1)

	// Checking for domains and URLs.
	foundIndicators := xurls.Relaxed.FindAllString(message, -1)
	for _, indicator := range foundIndicators {
		// Generates the GUID used for tracking the indicator through the framework.
		guid := xid.New()
		ids := guid.String()

		// Gets the current time to create a date entry for indicator insertion in framework.
		now := time.Now()
		rfc := now.Format(time.RFC3339)

		r, _ := regexp.Compile("(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)")
		matching := r.FindString(indicator)
		// Tries to determine if an IP, URL, or domain.
		var empty []string
		if matching != "" {
			log.Printf("Found IP %v in %v.\n", matching, adhoc.Resource)
			m := RawIndicators{ids, rfc, matching, "ip", "ad-hoc", adhoc.Context+" | "+adhoc.Resource, empty, empty}
			InsertionQueue <- m
		} else if strings.Contains(indicator, "/") {
			log.Printf("Found URL %v in %v.\n", indicator, adhoc.Resource)
			// Creates RawIndicators struct and inserts in the DB.
			m := RawIndicators{ids, rfc, indicator, "url", "ad-hoc", adhoc.Context+" | "+adhoc.Resource, empty, empty}
			InsertionQueue <- m
		} else {
			log.Printf("Found Domain %v in %v.\n", indicator, adhoc.Resource)
			// Creates RawIndicators struct and inserts in the DB.
			m := RawIndicators{ids, rfc, indicator, "domain", "ad-hoc", adhoc.Context+" | "+adhoc.Resource, empty, empty}
			InsertionQueue <- m
		}
	}
	m := APIResponse{"success"}
	outData, _ := json.Marshal(m)

	w.Header().Set("Access-Control-Allow-Methods", "POST")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Write(outData)
}

// GetOpenDNSWhois is a wrapper for calling the Umbrella API for whois on behalf of the frontend.
func GetOpenDNSWhois(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	domain := strings.Split(vars["domain"], ":")

	request := gorequest.New()
	_, body, _ := request.Get("https://investigate.api.umbrella.com/whois/"+domain[0]).
		Set("Authorization", `Bearer `+Config.OpenDNSKey).
		End()
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Write([]byte(body))
}

// GetVTDomain is a wrapper for calling the VT API for a domain on behalf of the frontend.
func GetVTDomain(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	domain := strings.Split(vars["domain"], ":")

	request := gorequest.New()
	_, body, _ := request.Get("https://www.virustotal.com/vtapi/v2/domain/report?domain=" + domain[0] + "&apikey=" + Config.VTKey).End()
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Write([]byte(body))
}

// GetVTIP is a wrapper for calling the VT API for an IP on behalf of the frontend.
func GetVTIP(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	ip := vars["ip"]

	request := gorequest.New()
	_, body, _ := request.Get("https://www.virustotal.com/vtapi/v2/ip-address/report?ip=" + ip + "&apikey=" + Config.VTKey).End()
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Write([]byte(body))
}

// GetVTURL is a wrapper for calling the VT API for a URL on behalf of the frontend.
func GetVTURL(w http.ResponseWriter, r *http.Request) {
	var vturl VTURL
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {
		panic(err)
	}
	if err := json.Unmarshal(body, &vturl); err != nil {
		w.Header().Set("Access-Control-Allow-Methods", "POST")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(422) // unprocessable entity
		if err := json.NewEncoder(w).Encode(err); err != nil {
			log.Println(err)
		}
	}

	url := "https://www.virustotal.com/vtapi/v2/url/report?apikey=" + Config.VTKey + "&resource=" + vturl.Resource

	request := gorequest.New()
	_, body2, _ := request.Get(url).End()
	w.Header().Set("Access-Control-Allow-Methods", "POST")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Write([]byte(body2))
}

// GetVTHash is a wrapper for calling the VT API for a hash based file report on behalf of the frontend.
func GetVTHash(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	hash := vars["hash"]

	request := gorequest.New()
	_, body, _ := request.Post("https://www.virustotal.com/vtapi/v2/file/report").
		Send(`apikey=` + Config.VTKey + `&resource=` + hash).
		End()
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Write([]byte(body))
}

// OrkaPlay is a function for interfacing with plays via the API.
func OrkaPlay(w http.ResponseWriter, r *http.Request) {
	// Connect to database and retrieve specified records.
	sessionClone := Sessions.Clone()
	c := sessionClone.DB("test").C("playbook")

	// Switch to detect HTTP method.
	switch r.Method {
	// If POST is received, parse body and get specified records.
	case "POST":
		var play PlaybookEntry
		body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
		if err != nil {
			log.Println(err)
		}
		if err := json.Unmarshal(body, &play); err != nil {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(422) // unprocessable entity
			if err := json.NewEncoder(w).Encode(err); err != nil {
				log.Println(err)
			}
		}

		// Generate GUID for play.
		guid := xid.New()
		playguid := guid.String()
		play.Guid = playguid

		// Insert playbook entry into DB playbook.
		err = c.Insert(play)
		if err != nil {
			log.Println(err)
		}
		log.Println("Successfully entered play to DB, starting OrkaMon.")
		go OrkaMon()
	// Return all configured recipes.
	case "GET":
		var recipes RecipesConfigured
		_ = c.Find(nil).All(&recipes.Recipes)

		m := recipes
		outData, _ := json.Marshal(m)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.Write(outData)
	}
}

// OrkaDelete is a function for deleting recipes in the db.
func OrkaDelete(w http.ResponseWriter, r *http.Request) {
	// Parse Orka ID from URL which is a GUID for a single play.
	vars := mux.Vars(r)
	orkaid := vars["orkaId"]

	sessionClone := Sessions.Clone()
	c := sessionClone.DB("test").C("playbook")

	err := c.Remove(bson.M{"guid": orkaid})
	if err != nil {
		switch err {
		default:
			w.Header().Set("Access-Control-Allow-Methods", "GET, DELETE")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			m := APIResponse{"database error"}
			outData, _ := json.Marshal(m)
			w.Write(outData)
			log.Println("Failed delete recipe: ", err)
			return
		case mgo.ErrNotFound:
			w.Header().Set("Access-Control-Allow-Methods", "GET, DELETE")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			m := APIResponse{"none found"}
			outData, _ := json.Marshal(m)
			w.Write(outData)
			return
		}
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Header().Set("Access-Control-Allow-Methods", "GET, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	response := APIResponse{"deleted recipe " + orkaid}
	outData, _ := json.Marshal(response)
	w.Write(outData)
}

// CallOrkaMon is a function for re-initiating the orchestration code via the web API.
func CallOrkaMon(w http.ResponseWriter, r *http.Request) {
	go OrkaMon()
}

// EditSettings is a function for viewing and modifying the backend configuration through the web API.
func EditSettings(w http.ResponseWriter, r *http.Request) {
	sessionClone := Sessions.Clone()
	c := sessionClone.DB("test").C("settings")
	var settings Settings

	switch r.Method {
	// GET HTTP method is used for retrieving current settings.
	case "GET":
		_ = c.Find(nil).One(&settings)

		m := settings
		outData, _ := json.Marshal(m)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.Write(outData)

	// POST HTTP method is used for updating settings.
	case "POST":
		body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
		if err != nil {
			panic(err)
		}
		if err := json.Unmarshal(body, &Config); err != nil {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(422) // unprocessable entity
			if err := json.NewEncoder(w).Encode(err); err != nil {
				log.Println(err)
			}
		}

		change := mgo.Change{
			Update:    bson.M{"$set": bson.M{"twitterusers": Config.TwitterUsers, "twitterconsumerkey": Config.TwitterConsumerKey, "twitterconsumersecret": Config.TwitterConsumerSecret, "twitteraccesstoken": Config.TwitterAccessToken, "twitteraccesssecret": Config.TwitterAccessSecret, "vtkey": Config.VTKey, "opendnskey": Config.OpenDNSKey, "alexadomains": Config.AlexaDomains, "whitelistdomains": Config.WhiteListDomains, "whitelistisp": Config.WhitelistISP, "critsuser": Config.CRITsUser, "critskey": Config.CRITsKey, "critsserver": Config.CRITsServer, "critssource": Config.CRITsSource, "alienvaultkey": Config.AlienvaultKey, "vtintel": Config.VTIntel}},
			ReturnNew: true,
			Upsert:    true,
		}
		_, _ = c.Find(nil).Apply(change, &Config)
		log.Printf("Settings updated.")

		// Restart Twitter parser and Alienvault feed.
		go StartTwitter()
		go StartAlienvault()

		response := APIResponse{"Successfully edited config"}
		outData, _ := json.Marshal(response)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.Write(outData)
	}
}

// EditFeeds is a handler for viewing and modifying configured threat feeds to use for parsing.
func EditFeeds(w http.ResponseWriter, r *http.Request) {
	sessionClone := Sessions.Clone()
	c := sessionClone.DB("test").C("feeds")
	var feedarray FeedArray

	switch r.Method {
	// GET HTTP method is used for retrieving currently configured feeds.
	case "GET":
		_ = c.Find(nil).One(&feedarray)
		m := feedarray
		outData, _ := json.Marshal(m)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.Write(outData)
	// POST HTTP method is used for adding or deleting feeds.
	case "POST":
		body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
		if err != nil {
			panic(err)
		}
		if err := json.Unmarshal(body, &feedarray); err != nil {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(422) // unprocessable entity
			if err := json.NewEncoder(w).Encode(err); err != nil {
				log.Println(err)
			}
		}

		change := mgo.Change{
			Update:    bson.M{"$set": bson.M{"feeds": feedarray.Feeds}},
			ReturnNew: true,
			Upsert:    true,
		}
		var results FeedArray
		_, _ = c.Find(nil).Apply(change, &results)

		log.Println("Feeds updated.")
		go StartFeeds()
	}
}

// GetMetrics is a function to pull the latest metrics based off what is in the database.
func GetMetrics(w http.ResponseWriter, r *http.Request) {
	// JSON marshal response.
	outData, _ := json.Marshal(metrics)
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.Write(outData)
}
