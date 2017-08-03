package main

import (
	"time"
)

// RawIndicators is a structure for a raw indicator for insertion in the pre_processing collection of the DB.
type RawIndicators struct {
	Guid        string   `json:"guid"`
	Date        string   `json:"date"`
	Indicator   string   `json:"indicator"`
	Ind_type    string   `json:"type"`
	Source      string   `json:"source"`
	Context     string   `json:"context"`
	Tags        []string `json:"tags"`
	OrkaTracker []string `json:"orka"`
}

// ProcessedIndicator is a structure for a processed indicator for insertion in the processed collection of the DB.
type ProcessedIndicator struct {
	Guid      string   `json:"guid"`
	Date      string   `json:"date"`
	Indicator string   `json:"indicator"`
	Ind_type  string   `json:"type"`
	Source    string   `json:"source"`
	Context   string   `json:"context"`
	Tags      []string `json:"tags"`
}

// Source is a structure created from parsing the specified sources which is used for retrieving the resource.
type Source struct {
	Name               string `json:"name"`
	Url                string `json:"url"`
	Parser             string `json:"parser"`
	CronTime           string `json:"crontime"`
	CSVIndicatorColumn string `json:"csvindicatorcolumn"`
	CSVContextColumn   string `json:"csvcontextcolumn"`
}

//FeedArray is a structure for passing an array of sources.
type FeedArray struct {
	Feeds []Source `json:"feeds"`
}

// Dump is a structure for to receive the requested format and records to be dumped.
type Dump struct {
	Format  string         `json:"format"`
	Records []RecordToDump `json:"records"`
}

// AdHoc is a structure to receive the parameters for an ad-hoc resource consumption.
type AdHoc struct {
	Resource    string `json:"resource"`
	TextToParse string `json:"texttoparse"`
	Context     string `json:"context"`
}

// VTURL is a structure to receive the parameters for a VT URL API call.
type VTURL struct {
	Resource string `json:"resource"`
	Key      string `json:"key"`
}

// RecordToDump is a structure for an individual record to be dumped.
type RecordToDump struct {
	Guid string `json:"guid"`
}

// AllResults is a structure for the JSON API response containing all indicators contained in a collection.
type AllResults struct {
	Results []RawIndicators `json:"data"`
}

// AllResultsPost is a structure for the JSON API response containing all indicators contained in the post-processing collection.
type AllResultsPost struct {
	Results []ProcessedIndicator `json:"data"`
}

type CommentResponse struct {
	ResponseCode   int       `json:"response_code"`
	VerboseMessage string    `json:"verbose_message"`
	Resource       string    `json:"resource"`
	Comments       []Comment `json:"comments"`
}

type Comment struct {
	Date    string `json:"date"`
	Comment string `json:"comment"`
}

// APIResponse is a generic struct to use for an API call status return.
type APIResponse struct {
	Message string `json:"message"`
}

// Playbook entry for Orka to use.
type PlaybookEntry struct {
	Guid      string   `json:"guid"`
	Source    string   `json:"source"`
	Operators []string `json:"operators"`
	Dest      string   `json:"dest"`
	ID        string   `json:"id"`
}

// Settings structure for the framework.
type Settings struct {
	MongoIP               string   `json:"-"`
	TwitterUsers          []string `json:"twitterusers"`
	TwitterConsumerKey    string   `json:"twitterconsumerkey"`
	TwitterConsumerSecret string   `json:"twitterconsumersecret"`
	TwitterAccessToken    string   `json:"twitteraccesstoken"`
	TwitterAccessSecret   string   `json:"twitteraccesssecret"`
	VTKey                 string   `json:"vtkey"`
	VTIntel               string   `json:"vtintel"`
	OpenDNSKey            string   `json:"opendnskey"`
	CRITsKey              string   `json:"critskey"`
	CRITsUser             string   `json:"critsuser"`
	CRITsServer           string   `json:"critsserver"`
	CRITsSource           string   `json:"critssource"`
	AlienvaultKey         string   `json:"alienvault"`
	AlexaDomains          []string `json:"alexadomains"`
	WhiteListDomains      []string `json:"whitelistdomains"`
	WhitelistISP          []string `json:"whitelistisp"`
}

// OTXResponse is a structure to return the Alienvault OTX API to.
type OTXResponse struct {
	NextPage string        `json:"next"`
	Results  []AlienvaultIndicators `json:"results"`
}

// AlienvaultIndicators is a structure to hold an Alienvault OTX pulse in.
type AlienvaultIndicators struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Indicators  []struct {
		ID          string `json:"_id"`
		Indicator   string `json:"indicator"`
		Type        string `json:"type"`
		Description string `json:"description"`
	} `json:"indicators"`
}

// OTXSeen is a struct used to hold information for tracking Alienvault pulse IDs that have already been ingested.
type OTXSeen struct {
	Seen []string
}

// ReceipesConfigured is a struct to hold all the configured recipes in for an API response.
type RecipesConfigured struct {
	Recipes []PlaybookEntry `json:"recipes"`
}

// Hash is a struct to hold and track parsed hashes.
type Hash struct {
	hashtype string
	sum      string
}

// Metrics structure for the framework.
type Metrics struct {
	PerDay    []Count        `json:"perday,omitempty"`
	PerType   []MetricType   `json:"pertype,omitempty"`
	PerSource []MetricSource `json:"persource,omitempty"`
}

// Count is a struct used for the Metrics struct.
type Count struct {
	Date   time.Time `json:"date"`
	Number int       `json:"number"`
}

// MetricSource is a struct used for the Metrics struct.
type MetricSource struct {
	Source string `json:"source"`
	Number int    `json:"number"`
}

// MetricType is a struct used for the Metrics struct.
type MetricType struct {
	Type   string `json:"type"`
	Number int    `json:"number"`
}
