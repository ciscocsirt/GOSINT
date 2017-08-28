package main

import (
	"flag"
	"log"
	"time"

	"net/http"
	"runtime/debug"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"gopkg.in/robfig/cron.v2"

	"github.com/gorilla/mux"
)

var (
	Sessions          *mgo.Session
	Config            Settings
	quitTwitterStream chan string
	threatFeeds       chan string
	alienvaultFeed    chan string
	serve             string
	metrics           Metrics
	InsertionQueue    chan RawIndicators
)

func init() {
	PrintLogo()
	mongo := flag.String("mongo", "127.0.0.1", "MongoDB IP")
	serve = *flag.String("serve", "127.0.0.1:8000", "Address and port to bind API to")
	flag.Parse()

	Config.MongoIP = *mongo

	// Mongo instance details.
	mongoDBDialInfo := &mgo.DialInfo{
		Addrs:    []string{Config.MongoIP},
		Timeout:  15 * time.Second,
		Database: "test",
	}

	var err error

	log.Println("Connecting to database...")
	// Set up Mongo connection.
	Sessions, err = mgo.DialWithInfo(mongoDBDialInfo)
	if err != nil {
		log.Println("Could not connect to MongoDB, please check configuration.")
		FatalError(err)
	}
	log.Println("Successfully connected to backend database.")

	sessionClone := Sessions.Clone()
	c := sessionClone.DB("test").C("settings")
	_ = c.Find(nil).One(&Config)
}

func main() {
	// Make queue for indicator insertion pipeline.
	InsertionQueue = make(chan RawIndicators, 10000)

	// Start indicator insertion worker.
	go InsertRaw()

	// Start source parsing.
	StartFeeds()

	// Create channels for quitting Twitter stream and feeds.
	quitTwitterStream = make(chan string)
	threatFeeds = make(chan string)
	alienvaultFeed = make(chan string)

	// Start Alienvault OTX feed if API key is configured.
	go StartAlienvault()

	// Start Twitter parser if API key is configured.
	StartTwitter()

	go GenerateMetrics()

	// Start orchestration and metrics functions on a cron schedule.
	c := cron.New()
	c.AddFunc("0 30 * * * *", func() { OrkaMon() })
	c.AddFunc("0 30 * * * *", func() { GenerateMetrics() })
	c.Start()
	log.Println("Orchestration started.")

	// Start the web server.
	r := mux.NewRouter()
	r.HandleFunc("/api/pre/", GetAllPre).Methods("GET", "PUT")
	r.HandleFunc("/api/pre/{preId:[a-z0-9]{20,21}}", GetSinglePre).Methods("GET", "DELETE")
	r.HandleFunc("/api/post/", Processed).Methods("GET", "POST", "PUT")
	r.HandleFunc("/api/post/{postId:[a-z0-9]{20,21}}", DeleteSinglePost).Methods("DELETE")
	r.HandleFunc("/api/post/csv/", DumpCSV).Methods("GET", "POST")
	r.HandleFunc("/api/post/crits/", SendToCrits).Methods("POST")
	r.HandleFunc("/api/adhoc/", GoGet).Methods("POST")
	r.HandleFunc("/api/whois/{domain}", GetOpenDNSWhois).Methods("GET")
	r.HandleFunc("/api/vt/domain/{domain}", GetVTDomain).Methods("GET")
	r.HandleFunc("/api/vt/ip/{ip}", GetVTIP).Methods("GET")
	r.HandleFunc("/api/vt/url/", GetVTURL).Methods("POST")
	r.HandleFunc("/api/vt/hash/{hash}", GetVTHash).Methods("GET")
	r.HandleFunc("/api/orka/", OrkaPlay).Methods("GET", "POST")
	r.HandleFunc("/api/orkadelete/{orkaId:[a-z0-9]{20,21}}", OrkaDelete).Methods("DELETE")
	r.HandleFunc("/api/orkamon/", CallOrkaMon).Methods("GET")
	r.HandleFunc("/api/settings/", EditSettings).Methods("GET", "POST")
	r.HandleFunc("/api/settings/feeds/", EditFeeds).Methods("GET", "POST")
	r.HandleFunc("/api/metrics/", GetMetrics).Methods("GET")
	log.Fatal(http.ListenAndServe(serve, r))

	// Kill orchestration cron job.
	c.Stop()
}

// StartTwitter determines if Twitter API keys are configured and if so it sends a signal to kill any running parser goroutines and restarts a new one with the new settings.
func StartTwitter() {
	if Config.TwitterConsumerKey != "" && Config.TwitterConsumerSecret != "" && Config.TwitterAccessToken != "" && Config.TwitterAccessSecret != "" {
		select {
		case quitTwitterStream <- "killed":
			log.Println("Twitter parser kill signal sent.")
		default:
			log.Println("Twitter parser not running, proceeding to start.")
		}
		go TwitterParser()
	} else {
		log.Println("Missing Twitter API keys... cannot start Twitter stream.")
	}
}

// StartFeeds determines if feeds are running and if so it sends a signal to kill any running feed cron jobs and restarts the feeds cron job with the updated settings.
func StartFeeds() {
	select {
	case threatFeeds <- "killed":
		log.Println("Feeds kill signal sent.")
	default:
		log.Println("Feeds not running, proceeding to start.")
	}
	go GatherFeeds()

}

// GatherFeeds looks in the configured settings for feeds and dispatches all of them in cron jobs.
func GatherFeeds() {
	sessionClone := Sessions.Clone()
	col := sessionClone.DB("test").C("feeds")
	var feedarray FeedArray

	_ = col.Find(nil).One(&feedarray)

	c := cron.New()
	for _, feed := range feedarray.Feeds {
		thisfeed := feed
		c.AddFunc(feed.CronTime, func() { ParseSources(thisfeed) })

	}
	c.Start()
	if len(feedarray.Feeds) == 0 {
		log.Println("No feeds found.")
	} else {
		log.Println("Feeds running.")
	}

	msgs := <-threatFeeds

	c.Stop()
	log.Println("Feeds cron jobs " + msgs + ".")
}

func GenerateMetrics() {
	var results []RawIndicators

	//Clear out old metrics
	metrics = Metrics{}

	sessionClone := Sessions.Clone()

	//Set timeout high to work with the growth of the historic collection.
	sessionClone.SetSocketTimeout(1 * time.Hour)

	c := sessionClone.DB("test").C("historic")

	// Set time for 30 days back for query.
	historicdate := bson.NewObjectIdWithTime(time.Now().Add(-720 * time.Hour))

	now := bson.NewObjectIdWithTime(time.Now())

	// Query historic collection for indicators seen within timeframe.
	err := c.Find(
		bson.M{
			"_id": bson.M{
				"$gte": historicdate,
				"$lt":  now,
			},
		}).All(&results)
	if err != nil {
		log.Println(err)
	}

	negdays := 0

	date := time.Now()

	// Iterate over last 30 days for count.
	for i := 0; i < 30; i++ {
		negdays = negdays + 1
		enddays := negdays + 1
		startdate := time.Date(date.Year(), date.Month(), date.Day()-negdays, 0, 0, 0, 0, date.Location())

		enddate := time.Date(date.Year(), date.Month(), date.Day()-enddays, 0, 0, 0, 0, date.Location())

		count := Count{Date: enddate, Number: 0}

		for _, historicindicator := range results {
			t, err := time.Parse(time.RFC3339, historicindicator.Date)
			if err != nil {
				continue
			}

			if t.Before(startdate) && t.After(enddate) {
				count.Number = count.Number + 1
			}
		}
		metrics.PerDay = append(metrics.PerDay, count)

	}

	var result2 []string

	// Find unique sources.
	err = c.Find(nil).Distinct("source", &result2)

	if err != nil {
		log.Println(err)
	}

	// Get counts per each source.
	for _, source := range result2 {
		numberindicators, err := c.Find(bson.M{"source": source}).Count()
		if err != nil {
			log.Println(err)
		}

		metricsource := MetricSource{Source: source, Number: numberindicators}

		metrics.PerSource = append(metrics.PerSource, metricsource)

	}

	// Find unique types of indicators.
	err = c.Find(nil).Distinct("ind_type", &result2)
	if err != nil {
		log.Println(err)
	}

	// Get counts per each type.
	for _, indtype := range result2 {
		numberindicators, err := c.Find(bson.M{"ind_type": indtype}).Count()
		if err != nil {
			log.Println(err)
		}

		metrictype := MetricType{Type: indtype, Number: numberindicators}

		metrics.PerType = append(metrics.PerType, metrictype)

	}
}


func FatalError(err error) {
	debug.PrintStack()
	log.Fatal(err)
}
