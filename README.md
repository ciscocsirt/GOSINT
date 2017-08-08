# GOSINT - Open Source Threat Intelligence Gathering and Processing Framework

The GOSINT framework is a project used for collecting, processing, and exporting high quality indicators of compromise (IOCs). GOSINT
allows a security analyst to collect and standardize structured and unstructured threat intelligence. Applying threat intelligence to security operations enriches alert data with additional confidence, context, and co-occurrence. This means that you apply research
from third parties to security event data to identify similar, or identical, indicators of malicious behavior. The framework is written in Go with a JavaScript frontend. 

![Alt Text](https://github.com/ciscocsirt/GOSINT/blob/master/gosint.gif)

----------------
## Installation

It is recommended that GOSINT be installed on a GNU/Linux system with the latest version of the Go language available. 
The document was prepared specifically for Ubuntu Server 16.04.2 LTS

#### Prequisites

GOSINT requires
- A working and up to date Go environment
- Mongo DB (Community Edition is ok)
- A reverse proxy/web server (NGINX preferred) 
- PHP  
 
You can use your preferred package manager to install most of these environments and applications. For aptitude:

```sudo apt-get install mongodb php-fpm nginx git```

> NOTE: Package managers may not provide up to date versions of the software and should be tested to ensure compatibility.  It is strongly recommended that Go be installed with the latest version from https://golang.org/dl/

> Package managers may name packages differently depending on the specific package manager or OS release repository. For example, php-fpm may not exist; php7.0-fpm may be the correct name of the package

#### Step by Step
Create a user for GOSINT to run on with minimal privileges.  This user will run the backend binary which is responsible for pulling indicators and exposing an API for the frontend to use:

```
sudo useradd -m gosint
su gosint
```

Install and test the Go environment. Complete the following steps to install Go 1.8:
- Download GNU/Linux Go 1.8 package

 64 Bit:
 ```cd ~ && wget https://storage.googleapis.com/golang/go1.8.linux-amd64.tar.gz```
 
 32 Bit:
 ```cd ~ && wget https://storage.googleapis.com/golang/go1.8.linux-386.tar.gz```
 
- Decompress archive
 
 64 Bit:
 ```tar zxvf go1.8.linux-amd64.tar.gz```

 32 Bit:
  ```tar zxvf go1.8.linux-386.tar.gz```

- Create project workspace

 ```mkdir ~/projects```

- Setup the environment

 ```
export GOROOT=$HOME/go
export PATH=$PATH:$GOROOT/bin
export GOPATH=$HOME/projects
export GOBIN=$GOPATH/bin
export PATH=$GOPATH:$GOBIN:$PATH
```

- Test Go environment using the instructions at https://golang.org/doc/install/source#testing

- Install godep vendor management

```
go get github.com/tools/godep
go install github.com/tools/godep
```

- Clone GOSINT repository into your ```src``` directory in your go environment and build it

```
cd ~/projects/src
git clone https://github.com/ciscocsirt/GOSINT
cd gosint
godep go build -o gosint
chmod +x gosint
```

- Test GOSINT build

```
./gosint 
```

> GOSINT should start and then error out trying to connect to the database if MongoDB has not yet been installed.

Install MongoDB and ensure it is ONLY listening on your local loopback interface (127.0.0.1/localhost) if you are running it on the same host as GOSINT. Allowing your database to listen on any externally facing ports is a security risk, and should not be done without proper precautions taken to prevent unauthorized access.  

You can use aptitude to install an older version with the command ```sudo apt-get install mongodb``` or you can follow the instructions at https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/ to install a more up to date version from the MongoDB repositories.

Install PHP (v5 or higher) and verify the installation was successful.

Install NGINX (or your preferred web server). You will need to configure NGINX to listen on a public interface at a port you specify.  It is recommended that you install a valid certificate for HTTPS and enable some form of authorization (local auth or LDAP) to prevent unauthorized access to GOSINT.  

The following is an example configuration used to accomplish this (your environment or setup may vary):

```
server {
    ssl_certificate /etc/nginx/ssl/nginx.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx.key;
    listen 443 ssl;

    root /var/wwwroot;
    index index.php index.html index.htm;
    try_files $uri $uri/ @apachesite;

    server_name someserver.yourcompany.com;

    gzip on;
    gzip_proxied any;
    gzip_types
        text/css
        text/javascript
        text/xml
        text/plain
        application/javascript
        application/x-javascript
        application/json;

    #location / {
    #    try_files $uri $uri/ =404;
    #}

    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }

    location @apachesite {
        auth_basic           "closed site";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://localhost:8000;
    }

    location ~ \.php$ {
        auth_basic           "closed site";
        auth_basic_user_file /etc/nginx/.htpasswd;
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/var/run/php/php7.0-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

> For ease of use, it is recommended you use a terminal multiplexer such as GNU screen to keep the terminal open that GOSINT is running in:
```screen -dm ./gosint```

> If an alternate IP is needed to be specified for the Mongo DB server, you can use the flag ```-mongo``` to change it from the default 127.0.0.1.  

Type ```./gosint -h``` for a list of available flags.

If GOSINT starts up without any errors, and you have NGINX setup properly, you should now be able to navigate to the address and port specified in your webserver configuration and access the GOSINT web interface.

----------------

## Configuration

GOSINT needs some quick initial configuration to start making use of the framework features.  All the settings you will need to specify can be found under the "Settings" tab.  

#### Twitter
**Twitter Consumer Key, Twitter Consumer Secret, Twitter Access Token, Twitter Access Secret:**
Create a Twitter App through [this link](https://apps.twitter.com/). Upon creation of the app, the above Keys and Tokens will be displayed. Copy these from Twitter into the respective fields in GOSINT.

**Twitter Users:**
In this field, enter the Twitter users that GOSINT should start following for relevant indicator information. Add new users by typing their usernames; separate users with a comma.


#### Indicator Feeds
**Table Overview:** The table provides the user with an overview of the currently configured feeds. Feeds may be deleted by clicking the *orange X button* in the delete column.

**Create New Feed:** This form located below the table is to create a new feed for GOSINT to parse indicators from.
- **Feed Name:** Enter an alphanumeric feed name.
- **Feed URL:** Enter the location of the feed.
- **Parse Method:** Select either CSV or Smart parse method. If CSV is selected, the user must enter the column numbers of where the indicators and contexts are in the **CSV Indicator Column** and **CSV Context Column** fields, respectively.
- **Cron Time:** Enter the frequency of how often to pull from the field.
```
Entry                  | Description                                | Equivalent To
-----                  | -----------                                | -------------
@yearly (or @annually) | Run once a year, midnight, Jan. 1st        | 0 0 0 1 1 *
@monthly               | Run once a month, midnight, first of month | 0 0 0 1 * *
@weekly                | Run once a week, midnight on Sunday        | 0 0 0 * * 0
@daily (or @midnight)  | Run once a day, midnight                   | 0 0 0 * * *
@hourly                | Run once an hour, beginning of hour        | 0 0 * * * *
```
> See https://godoc.org/gopkg.in/robfig/cron.v2 for more information.

- Upon successful creation of a feed, the new feed is displayed in the table overview.

#### Threat Intel APIs
**AlienVault API Key:** Create an API Key through [here](https://otx.alienvault.com/accounts/signup/). Enter the API key and setup your Alienvault feed to receive indicators through AlienVault OTX.

**VirusTotal API Key:** Create an API Key through [here](https://www.virustotal.com/en/documentation/public-api/). Enter the API key to receive additional enrichment for indicators in pre-processing.

**VirusTotal Private API Access:** Select this option only if the VirusTotal API key used is for the private version, not public.

> The public VirusTotal API, while sufficient for some features, is limited. Private API access will enable additional features in GOSINT such as reading comments for indicators on VirusTotal, allowing GOSINT to parse additional indicators from the comments.

#### [CRITs](https://crits.github.io/)
**CRITs Server:** Enter the full URL to the CRITs server that GOSINT should export indicators into.

**CRITs API User:** Enter the CRITs username that has API access.

**CRITs API Key:** Enter the respective CRITs user's API Key.

The second tab includes configuration options for whitelists.

#### Whitelists  
**Alexa Domains Whitelist:** This is intended to be used as an area for configuring the [Alexa top domains](http://www.alexa.com/topsites) you want to screen and reject indicators. For the most part, indicators involving these highly popular will not be malicious. Use this whitelist feature to make sure those top domains do not get recorded as IOCs.  

**Whitelist Domains:** In addition to the Alexa Whitelist, this section is for any additional domains you want to also prevent from entering the framework. Some examples are security vendor websites, trusted blogs, comment and syndication servers, public sandboxes, etc. 

**Whitelist ISPs:** Used to prevent IP addresses from specific ISPs from entering into the framework. This is accomplished by a reverse DNS lookup and keyword match against the ISP record. Be careful with this option as it could potentially ignore valid IOCs coming from a popular ISP.

> Use a comma to separate entries in the whitelist fields.  Be sure to click "Update Settings" when finished.

After configuration, GOSINT is ready for use! Begin by navigating to the Pre-Processing page, where indicators will display once parsed by GOSINT from your configured feeds.

----------------

## Use

### Pre-Processing

#### Overview
The pre-processing page is where indicators are displayed that GOSINT has parsed from various sources, such as Twitter and indicator feeds.

#### Searching/Sorting Indicators
GOSINT allows for searching and sorting the indicators. By default, indicators are sorted with the most recent indicators listed first.

However, the indicators can be sorted by any field, including type, source, and context. Click on the column title in order to sort the indicators by these fields.

We can also search for an indicator or for indicators from a specific source or with a specific context by using the search box located on the upper right of the table.

#### Editing Indicators
If we find that GOSINT has incorrectly parsed an indicator (for example, if GOSINT has not properly defanged an indicator), or if we would like to add additional context with an indicator, we can manually edit the indicator by clicking on any of its fields.

This opens a text box. Edit the field, and click confirm to save your changes.

In addition, tags can be inserted on a per-indicator basis. To add a tag to an indicator, select the text box under the *tags* column, and type the tag you would like to associate. Tags can consist of a single word or a phrase. Enter a comma or hit Enter/Return on your keyboard to finalize adding the tag to the indicator.

Remove a tag by clicking the *X* on the tag.

#### Querying Third Party APIs
The pre-processing page is a analysis workspace used to determine whether the pending indicators are malicious or not. GOSINT has various third-party tools available for enriching raw indicators with additional context. By default, GOSINT supports Cisco Umbrella, ThreatCrowd, and VirusTotal.

> If these third-party APIs are not properly configured, GOSINT will display a notice advising the user that these APIs should be configured in the Settings page.

To launch any of these APIs, click the buttons labeled *Umbrella, ThreatCrowd, or VirusTotal*. 

> Click the *Everything* button to call all available APIs at once.

When the 3rd party enrichment window is closed, the row containing the indicator becomes ***bold and italicized***.

#### Deleting Indicators

To delete an indicator that has been determined to be non-malicious, click the *orange X button*. This removes the indicator from the pre-processing table.

> Indicators that have been deleted are no longer visible on the pre-processing page again, however they are stored permanently in the backend of GOSINT to prevent their reoccurance.

#### Moving to Post-Processing

Once you confirm an indicator is valid and you want to keep it, click the *green right-direction arrow button*. The indicator is removed from the pre-processing table, and is added into the post-processing table.

#### Bulk Selecting Indicators

To bulk select indicators, click the *blue button with the bulleted items* for an indicator. Continue clicking this button for other indicators to add to the bulk selection.

Optionally, utilize the *Select All on Current Page* button on the bottom right of the table to select/deselect all indicators on the current page.

Click *Bulk Move to Post-Processing* and *Bulk Delete* to perform the respective bulk options on the bottom right of the table.

### Post-Processing

#### Overview
This page is where indicators that have been marked as malicious in pre-processing are loaded.

#### Searching/Sorting/Editing Indicators
As with the pre-processing page, we can search, sort and edit indicators.

#### Deleting Indicators
If an indicator was moved into post-processing by mistake, then we can remove the indicator by clicking the *orange X button* in the appropriate row.

### Transfer Station

#### Overview
This page is where we can select indicators in the post-processing stage for export into various locations.

Currently, GOSINT supports export into CSV and [CRITs](https://crits.github.io/). Additional export mechanisms are planned for integration into tools.

To select an indicator for export, simply click the appropriate indicator.

#### Exporting via CSV
To export via CSV, scroll down and *select CSV* as the export format.

This starts a CSV download containing the selected indicators.

#### Exporting via CRITs

[CRITs](https://crits.github.io/) is a well-known open-source malware and threat repository.

We can export indicators from GOSINT into CRITs by *selecting CRITs* as the export format.

> Ensure the appropriate settings are configured in the CRITs section of the settings page prior to utilizing CRITs export.
> Upon successful export via any mechanism, the indicators that were selected are removed from the post-processing stage.

### Ad Hoc Indicators

#### Overview
Let us say that we have found an external report on a recent strain of malware on the Internet. How can we parse these indicators on an ad-hoc basis and have these indicators added into GOSINT?
The ad hoc input page allows indicators to be parsed via URL, or a body of text.

**Input via URL:**  Enter a valid URL that contains parseable indicators.

**Input via General Text:** For an external report in PDF or some other format, copy the text from the report into the General Text section for parsing.

**Context:**	We can assign a specific context to the report, which will allow for these indicators to be assigned this context in pre-processing. For example, we can place the title of the report in the Context so we know where these indicators came from.

Click *Submit* to begin parsing the indicators. All indicators will display in the pre-processing stage with the associated context after GOSINT has parsed the indicators.

### Recipe Manager

#### Overview
The Recipe Manager allows the user to set up tasks for automation with GOSINT. Recipes can be set up to take indicators from certain sources, apply an optional operator to analyze the indicators, and then place these indicators in a destination.

#### Creating a Recipe
To create a recipe, drag a maximum of one source and maximum of one destination to the final recipe column on the right. The *Recipe Overview* section displays the recipe to be created.

Enter a title for the recipe, and click *Create Recipe* to create the recipe. The recipe is displayed in the *Past Recipes* section below the recipe maker.

Optionally, click *Reset Recipe* to clear out a pending recipe for creation and to start over.

> View and delete past recipes that have been created in the *Past Recipes* section of the Recipe Manager page.

### Metrics
The Metrics page displays interesting statistical information about indicators that have been processed with GOSINT.

**Indicators By Source:** This displays a pie chart of the source of all indicators processed with GOSINT.

**Indicators By Type:** This displays a pie chart of the type of all indicators processed with GOSINT.
