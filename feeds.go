package main

import (
	"io"
	"log"
	"regexp"
	"strconv"
	"strings"
	"time"

	"encoding/csv"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"gopkg.in/robfig/cron.v2"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/dghubble/oauth1"
	"github.com/mvdan/xurls"
	"github.com/parnurzeal/gorequest"
	"github.com/rs/xid"
)

// GetCSVResource is the function that supplied with the parsed sources retrieves the intel from each feed.
func GetCSVResource(feed Source) {
	request := gorequest.New()
	resp, body, err := request.Get(feed.Url).End()
	if err != nil {
		log.Println(err)
		return
	}

	// Determine the coloumn that the indicators are in.
	indicatorcolumn, err2 := strconv.Atoi(feed.CSVIndicatorColumn)
	if err2 != nil {
		log.Println(err)
		return
	}

	// Determine the column that the indicator context is in.
	contextcolumn, err3 := strconv.Atoi(feed.CSVContextColumn)
	if err3 != nil {
		log.Println(err)
		return
	}
	r := csv.NewReader(strings.NewReader(body))
	for {
		record, err := r.Read()
		// Stop at EOF.
		if err == io.EOF {
			break
		}
		// Super hacky - fix this len check later!
		if len(record) > 1 {
			indicator := record[indicatorcolumn]
			// Sanitize indicator.
			indicator = Sanitize(indicator)

			// Generates the GUID used for tracking the indicator through the framework.
			guid := xid.New()
			ids := guid.String()

			// Gets the current time to create a date entry for indicator insertion in framework.
			now := time.Now()
			rfc := now.Format(time.RFC3339)

			indType := DetermineIndicatorType(indicator)

			// Take the appropriate action for the indicator based off the type.
			switch indType {
			case "ip":
				log.Printf("Found IP %v in %v.\n", indicator, feed.Name)
				var empty []string
				m := RawIndicators{ids, rfc, indicator, "ip", feed.Name, record[contextcolumn], empty, empty}
				go InsertRaw(m)
			case "url":
				log.Printf("Found URL %v in %v.\n", indicator, feed.Name)
				// Creates RawIndicators struct and inserts in the DB.
				var empty []string
				m := RawIndicators{ids, rfc, indicator, "url", feed.Name, record[contextcolumn], empty, empty}
				go InsertRaw(m)
			case "domain":
				log.Printf("Found Domain %v in %v.\n", indicator, feed.Name)
				// Creates RawIndicators struct and inserts in the DB.
				var empty []string
				m := RawIndicators{ids, rfc, indicator, "domain", feed.Name, record[contextcolumn], empty, empty}
				go InsertRaw(m)
			}
		}
	}

	// Check if feed was successfully retrieved or not.
	if resp.StatusCode == 200 {
		log.Println("Successfully retrieved " + feed.Url)
	} else {
		log.Println("Error retrieving resource: " + feed.Url)
	}
}

// ParseSources parses the structures of sources and sends them to be retrieved.
func ParseSources(source Source) {
	// Parsing sources and pulling indicators.
	log.Printf("Pulling feed from %v...\n", source.Name)

	parser := source.Parser
	switch parser {
	case "csv":
		go GetCSVResource(source)
	case "smart":
		go smartParse(source.Url, source.Name)
	}
}

// smartParse is a function to use the xurls library to pull all IP, URL, and domain indicators from a string and send them for DB insertion.
func smartParse(url string, name string) {
	request := gorequest.New()
	_, message, err := request.Get(url).End()
	if err != nil {
		log.Println(err)
		return
	}

	// Checking for domains, URLs, and IPs.
	foundIndicators := xurls.Relaxed.FindAllString(message, -1)
	for _, indicator := range foundIndicators {
		// Sanitize indicator.
		indicator = Sanitize(indicator)

		// Generates the GUID used for tracking the indicator through the framework.
		guid := xid.New()
		ids := guid.String()

		// Gets the current time to create a date entry for indicator insertion in framework.
		now := time.Now()
		rfc := now.Format(time.RFC3339)

		indType := DetermineIndicatorType(indicator)

		// Take the appropriate action for the indicator based off the type.
		switch indType {
		case "ip":
			log.Printf("Found IP %v in %v.\n", indicator, url)
			var empty []string
			m := RawIndicators{ids, rfc, indicator, "ip", name, url, empty, empty}
			go InsertRaw(m)
		case "url":
			log.Printf("Found URL %v in %v.\n", indicator, url)
			// Creates RawIndicators struct and inserts in the DB.
			var empty []string
			m := RawIndicators{ids, rfc, indicator, "url", name, url, empty, empty}
			go InsertRaw(m)
		case "domain":
			log.Printf("Found Domain %v in %v.\n", indicator, url)
			// Creates RawIndicators struct and inserts in the DB.
			var empty []string
			m := RawIndicators{ids, rfc, indicator, "domain", name, url, empty, empty}
			go InsertRaw(m)
		}
	}

	// Regexs for finding hashes.
	mdfiveregex, _ := regexp.Compile("\\b[a-fA-F0-9]{32}\\b")
	shaoneregex, _ := regexp.Compile("\\b[a-fA-F0-9]{40}\\b")
	shatwofiftysixregex, _ := regexp.Compile("\\b[a-fA-F0-9]{64}\\b")

	var hashes []Hash

	mdfive := mdfiveregex.FindAllString(message, -1)
	for _, md := range mdfive {
		hashes = append(hashes, Hash{
			hashtype: "md5",
			sum:      md,
		})
	}
	shaone := shaoneregex.FindAllString(message, -1)
	for _, md := range shaone {
		hashes = append(hashes, Hash{
			hashtype: "sha1",
			sum:      md,
		})
	}
	shatwofiftysix := shatwofiftysixregex.FindAllString(message, -1)
	for _, md := range shatwofiftysix {
		hashes = append(hashes, Hash{
			hashtype: "sha256",
			sum:      md,
		})
	}

	// Iterate over found hashes and insert them.
	for _, hash := range hashes {
		if Legit(hash) {
			// Generates the GUID used for tracking the indicator through the framework.
			guid := xid.New()
			ids := guid.String()

			// Gets the current time to create a date entry for indicator insertion in framework.
			now := time.Now()
			rfc := now.Format(time.RFC3339)

			var empty []string

			m := RawIndicators{ids, rfc, hash.sum, hash.hashtype, name, url, empty, empty}
			go InsertRaw(m)
		}
	}
}

// Has is a function for determining bytes seen in a byte array.
func Has(hash []byte, bite byte) bool {
	for _, value := range hash {
		if value == bite {
			return true
		}
	}
	return false
}

// Legit is a function for determining if a hash has a highly statistical probability of being real by checking how unique it is.
func Legit(hash Hash) bool {
	var unique []byte
	for _, value := range []byte(hash.sum) {
		if !Has(unique, value) {
			unique = append(unique, value)
		}
	}
	if hash.hashtype == "md5" {
		if len(unique) >= 7 {
			return true
		}
	}
	if hash.hashtype == "sha1" {
		if len(unique) >= 8 {
			return true
		}
	}
	if hash.hashtype == "sha256" {
		if len(unique) >= 10 {
			return true
		}
	}
	return false
}

// TwitterParser creates a Twitter Stream and parses incoming tweets for indicators.
func TwitterParser() {
	//Set credentials for oauth.
	config := oauth1.NewConfig(Config.TwitterConsumerKey, Config.TwitterConsumerSecret)
	token := oauth1.NewToken(Config.TwitterAccessToken, Config.TwitterAccessSecret)
	// OAuth1 http.Client will automatically authorize Requests.
	httpClient := config.Client(oauth1.NoContext, token)

	// Twitter Client.
	client := twitter.NewClient(httpClient)

	// Convenience Demux demultiplexed stream messages.
	demux := twitter.NewSwitchDemux()
	demux.Tweet = func(tweet *twitter.Tweet) {
		tweet.Text = Sanitize(tweet.Text)

		// this code will extract expanded URL's.
		for _, url := range tweet.Entities.Urls {
			if Config.VTKey == "true" {
				go getVT(url.ExpandedURL)
			}
			//if strings.Contains(url.ExpandedURL, "malware-traffic-analysis.net") {
			//	go SmartParse(url.ExpandedURL, "malware-traffic-analysis.net")
			//}
			//if strings.Contains(url.ExpandedURL, "malwarebreakdown.com") {
			//        go SmartParse(url.ExpandedURL, "malwarebreakdown.com")
			//}
		}

		// Checking for domains and URLs.
		foundIndicators := xurls.Relaxed.FindAllString(tweet.Text, -1)
		for _, indicator := range foundIndicators {
			// Generates the GUID used for tracking the indicator through the framework.
			guid := xid.New()
			ids := guid.String()

			// Gets the current time to create a date entry for indicator insertion in framework.
			now := time.Now()
			rfc := now.Format(time.RFC3339)

			context := tweet.Text + " | Tweeted by @" + tweet.User.Name + " - Tweet URL: https://twitter.com/statuses/" + tweet.IDStr

			if strings.Contains(indicator, "//t.co/") {
				// Ignore if indicator parsed is Twitter URL shortener domain t.co.
				continue
			}

			indType := DetermineIndicatorType(indicator)

			var empty []string

			// Take the appropriate action for the indicator based off the type.
			switch indType {
			case "ip":
				log.Printf("Found IP %v in tweet by %v.\n", indicator, tweet.User.ScreenName)
				m := RawIndicators{ids, rfc, indicator, "ip", "twitter", context, empty, empty}
				InsertRaw(m)
			case "url":
				log.Printf("Found URL %v in tweet by %v.\n", indicator, tweet.User.ScreenName)
				// Creates RawIndicators struct and inserts in the DB.
				m := RawIndicators{ids, rfc, indicator, "url", "twitter", context, empty, empty}
				InsertRaw(m)
			case "domain":
				log.Printf("Found Domain %v in tweet by %v.\n", indicator, tweet.User.ScreenName)
				// Creates RawIndicators struct and inserts in the DB.
				m := RawIndicators{ids, rfc, indicator, "domain", "twitter", context, empty, empty}
				InsertRaw(m)
			}
		}
	}
	// Lookup Twitter user IDs by user name.
	params := &twitter.UserLookupParams{ScreenName: Config.TwitterUsers}
	users, _, _ := client.Users.Lookup(params)

	var userIDs []string
	for _, id := range users {
		userIDs = append(userIDs, strconv.FormatInt(id.ID, 10))
	}

	// Filter used to declare users to monitor for new tweets.
	filterParams := &twitter.StreamFilterParams{
		Follow:        userIDs,
		StallWarnings: twitter.Bool(true),
	}
	stream, err := client.Streams.Filter(filterParams)
	if err != nil {
		FatalError(err)
	}

	// Receive messages from Twitter stream.
	go demux.HandleChan(stream.Messages)

	log.Println("Twitter stream running.")

	msgs := <-quitTwitterStream
	stream.Stop()
	log.Println("Twitter stream " + msgs + ".")
}
//getVT is a function for pulling the comments out of a file analysis from VirusTotal and send them to be parsed.
func getVT(url string) {
	// Check for SHA256 hash in URL which is an indication of a file analysis URL for VT.
	r, _ := regexp.Compile("[a-z0-9]{64}")
	matching := r.FindString(url)

	// If an IP, URL, or domain are found, send them to be inserted in the DB with the appropriate information.
	if matching != "" {
		res, err := http.Get("https://www.virustotal.com/vtapi/v2/comments/get?apikey=" + Config.VTKey + "&resource=" + matching)
		if err != nil {
			panic(err.Error())
		}

		body, err := ioutil.ReadAll(res.Body)
		if err != nil {
			panic(err.Error())
		}

		var s = new(CommentResponse)
		err2 := json.Unmarshal([]byte(body), &s)
		if err2 != nil {
			log.Println("Error unmarshling: ", err)
		}

		for _, comment := range s.Comments {
			go ParseIndicators(comment.Comment, url)
		}
	}
}

// ParseIndicators is a function to use the xurls library to pull all IP, URL, and domain indicators from a string and send them for DB insertion.
func ParseIndicators(message string, url string) {
	// Checking for domains and URLs.
	foundIndicators := xurls.Relaxed.FindAllString(message, -1)
	for _, indicator := range foundIndicators {
		// Generates the GUID used for tracking the indicator through the framework.
		guid := xid.New()
		ids := guid.String()

		// Gets the current time to create a date entry for indicator insertion in framework.
		now := time.Now()
		rfc := now.Format(time.RFC3339)

		var tags []string
		// Attempt to identify tags in comment to give better context.
		words := strings.Fields(message)
		for _, word := range words {
			if strings.HasPrefix(word, "#") {
				tags = append(tags, word)
			}
		}

		// Sanitize indicator for any de-fanging or illegal characters.
		indicator = Sanitize(indicator)

		// Attempt to mitigate bad parsing.
		s := strings.Split(indicator, "'")
		indicator = s[0]

		y := strings.Split(indicator, ",")
		indicator = y[0]

		indType := DetermineIndicatorType(indicator)

		var empty []string

		// Take the appropriate action for the indicator based off the type.
		switch indType {
		case "ip":
			log.Printf("Found IP %v in %v.\n", indicator, url)
			m := RawIndicators{ids, rfc, indicator, "ip", "virustotal", url, tags, empty}
			go InsertRaw(m)
		case "url":
			log.Printf("Found URL %v in %v.\n", indicator, url)
			// Creates RawIndicators struct and inserts in the DB.
			m := RawIndicators{ids, rfc, indicator, "url", "virustotal", url, tags, empty}
			go InsertRaw(m)
		case "domain":
			log.Printf("Found Domain %v in %v.\n", indicator, url)
			// Creates RawIndicators struct and inserts in the DB.
			m := RawIndicators{ids, rfc, indicator, "domain", "virustotal", url, tags, empty}
			go InsertRaw(m)
		}
	}
}

// StartAlienvault determines if an Alienvault OTX API key is configured and if so it sends a signal to kill any running Alienvault cron feed and restarts a new one with the new settings.
func StartAlienvault() {
	if Config.AlienvaultKey != "" {
		select {
		case alienvaultFeed <- "killed":
			log.Println("Alienvault kill signal sent.")
		default:
			log.Println("Alienvault feed not running, proceeding to start.")
		}
		time.Sleep(time.Second * 2)
		go AlienvaultFeedCron()
	} else {
		log.Println("Missing Alienvault OTX API key... cannot start feed.")
	}
}

// AlienvaultFeedCron is a function to setup the frequency in which the Alienvault API is crawled for new indicators.
func AlienvaultFeedCron() {
	c := cron.New()
	c.AddFunc("@daily", func() { GetAlienvault() })
	c.Start()
	log.Println("Alienvault feed started.")

	msgs := <-alienvaultFeed
	c.Stop()
	log.Println("Alienvault feed " + msgs + ".")
}

// GetAlienvault is a function for gathering pulses from an Alienvault OTX account configured with subscriptions.
func GetAlienvault() {
	var pulses OTXResponse
	var otxseen OTXSeen

	sessionClone := Sessions.Clone()
	c := sessionClone.DB("test").C("otx")
	_ = c.Find(nil).One(&otxseen)

	page := 1

	killbit := false

Loop:
	for {
		if killbit == true {
			break Loop
		}

		// Clear out NextPage to either be repopulated with another page value or stay empty to kill the crawl.
		pulses.NextPage = ""
		url := "https://otx.alienvault.com:443/api/v1/pulses/subscribed?page=" + strconv.Itoa(page)

		// Call the Alienvault OTX API.
		request := gorequest.New()
		resp, body, _ := request.Get(url).
			Set("X-OTX-API-KEY", Config.AlienvaultKey).
			End()

		if resp.StatusCode != 200 {
			break Loop
		}


		if err := json.Unmarshal([]byte(body), &pulses); err != nil {
			log.Println(err)
		}

		// Iterate through pulses in API response and process them.
		for _, pulse := range pulses.Results {
			for _, indicator := range pulse.Indicators {

				context := pulse.Name + ": " + pulse.Description + "| https://otx.alienvault.com/pulse/" + pulse.ID + "/"

				context = strings.Replace(context, "\n", "", -1)
				context = strings.Replace(context, "\r", "", -1)

				// Break the crawl if the pulse ID matches a pulse ID that has been seen so we don't recrawl the entire API every time.
				for _, id := range otxseen.Seen {
					if pulse.ID == id {
						killbit = true
					}
				}
				// Generates the GUID used for tracking the indicator through the framework.
				guid := xid.New()
				ids := guid.String()

				// Gets the current time to create a date entry for indicator insertion in framework.
				now := time.Now()
				rfc := now.Format(time.RFC3339)
				// Creates RawIndicators struct and inserts in the DB.
				var empty []string

				var indicatortype string
				switch indicator.Type {
				case "domain":
					indicatortype = "domain"
				case "URL":
					indicatortype = "url"
				case "hostname":
					indicatortype = "domain"
				case "IPv4":
					indicatortype = "ip"
				case "FileHash-SHA256":
					indicatortype = "sha256"
				case "FileHash-MD5":
					indicatortype = "md5"
				default:
					continue
				}

				m := RawIndicators{ids, rfc, indicator.Indicator, indicatortype, "alienvaultotx", context, empty, empty}
				go InsertRaw(m)
			}
			// Add pulse ID to list of seen ones.
			otxseen.Seen = append(otxseen.Seen, pulse.ID)

			time.Sleep(time.Second * 1)

			// No more pages left in API, kill crawl for pulses.
			if pulses.NextPage == "" {
				break Loop
			}
		}
		page++
	}

	f := sessionClone.DB("test").C("otx")

	// Mark OTX pulses that have been seen so they are not crawled again.
	change := mgo.Change{
		Update: bson.M{"$set": bson.M{"seen": otxseen.Seen}},
		Upsert: true,
	}
	_, err := f.Find(nil).Apply(change, &otxseen)
	if err != nil {
		log.Println(err)
	}
}

// DetermineIndicatorType is a function to decide what type of indicator was found.
func DetermineIndicatorType(indicator string) string {
	r, _ := regexp.Compile("(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)")
	matching := r.FindString(indicator)

	// Sanitize indicator for any de-fanging or illegal characters.
	matching = Sanitize(matching)

	// Attempt to mitigate bad parsing.
	s := strings.Split(matching, "'")
	matching = s[0]

	y := strings.Split(matching, ",")
	matching = y[0]

	var indType string

	// Tries to determine if an IP, URL, or domain.
	if matching != "" {
		indType = "ip"
	} else if strings.Contains(indicator, "/") {
		indType = "url"
	} else {
		indType = "domain"
	}
	return indType
}

// Sanitize is a function to help de-fang and repair broken IOCs.
func Sanitize(indicator string) string {
	indicator = strings.Replace(indicator, "hxxp", "http", -1)
	indicator = strings.Replace(indicator, "[.]", ".", -1)
	indicator = strings.Replace(indicator, "\\", "/", -1)
	indicator = strings.Replace(indicator, " . ", ".", -1)
	indicator = strings.Replace(indicator, "h**p", "http", -1)
	indicator = strings.Replace(indicator, "[", "", -1)
	indicator = strings.Replace(indicator, "]", "", -1)
	indicator = strings.Replace(indicator, "[dot]", ".", -1)
	indicator = strings.Replace(indicator, "(dot)", ".", -1)
	indicator = strings.Replace(indicator, "\n", "", -1)
	indicator = strings.Replace(indicator, "\r", "", -1)

	return indicator
}
