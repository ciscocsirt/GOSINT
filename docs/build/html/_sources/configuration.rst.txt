Configuration
=============

GOSINT needs some quick initial configuration to start making use of the framework features. All the settings you will need to specify can be found under the "Settings" tab.

Twitter
-------

- **Twitter Consumer Key, Twitter Consumer Secret, Twitter Access Token, Twitter Access Secret**

  - `Create a Twitter App <https://apps.twitter.com/>`_.

  - Upon creation of the app, the above Keys and Tokens will be displayed.

  - Copy these from Twitter into the respective fields in GOSINT.

- **Twitter Users**

  - In this field, enter the Twitter users that GOSINT should start following for relevant indicator information.

  - Add new users by typing their usernames; separate users with a comma.

Threat Intel APIs
-----------------

- **AlienVault API Key**

  - `Create an AlienVault API Key <https://otx.alienvault.com/accounts/signup/>`_. Enter the API key and setup your AlienVault feed to receive indicators through AlienVault OTX.

- **VirusTotal API Key**

  - `Create a VirusTotal API Key <https://www.virustotal.com/en/documentation/public-api/>`_. Enter the API key and setup your AlienVault feed to receive indicators through AlienVault OTX.

- **VirusTotal Private API Access**

  - Select this option only if the VirusTotal API key used is for the private version, not public.

  - The public VirusTotal API, while sufficient for some features, is limited. Private API access will enable additional features in GOSINT such as reading comments for indicators on VirusTotal, allowing GOSINT to parse additional indicators from the comments.

`CRITs <https://crits.github.io/>`_
-----------------------------------

- **CRITs Server**

  - Enter the full URL to the CRITs server that GOSINT should export indicators into.

- **CRITs API User**

  - Enter the CRITs username that has API access.

- **CRITs API Key**

  - Enter the respective CRITs user's API Key.

Whitelists
----------

- **Alexa Domains Whitelist**

  - This is intended to be used as an area for configuring the Alexa top domains you want to screen and reject indicators.

  - For the most part, indicators involving these highly popular domains will not be malicious.

  - Use this whitelist feature to make sure those top domains do not get recorded as IOCs.

- **Whitelist Domains**

  - In addition to the Alexa Whitelist, this section is for any additional domains you want to also prevent from entering the framework.

  - Some examples are security vendor websites, trusted blogs, comment and syndication servers, public sandboxes, etc.

- **Whitelist ISPs**

  - Used to prevent IP addresses from specific Internet Service Providers (ISPs) from entering into the framework.

  - This is accomplished by a reverse DNS lookup and keyword match against the ISP record.

  - Be careful with this option as it could potentially ignore valid IOCs coming from a popular ISP.

Indicator Feeds
---------------

- **Table Overview**

  - The table provides the user with an overview of the currently configured feeds.

  - Feeds may be deleted by clicking the orange X button in the delete column.

- **Create New Feed**

  - This form located below the table is to create a new feed for GOSINT to parse indicators from.

- **Feed Name**

  - Enter an alphanumeric feed name.

- **Feed URL**

  - Enter the location of the feed.

- **Parse Method**

  - Select either CSV or Smart parse method. If CSV is selected, the user must enter the column numbers of where the indicators and contexts are in the CSV Indicator Column and CSV Context Column fields, respectively.

- **Cron Time**

  - Enter the frequency of how often to pull from the field.

  - Upon successful creation of a feed, the new feed is displayed in the table overview.

  - `Click here for more detailed cron information <https://godoc.org/gopkg.in/robfig/cron.v2>`_

  ======================  ==========================================  =============
  Entry                   Description                                 Equivalent To
  ======================  ==========================================  =============
  @yearly (or @annually)  Run once a year, midnight, Jan. 1st         0 0 0 1 1 *
  @monthly                Run once a month, midnight, first of month  0 0 0 1 * *
  @weekly                 Run once a week, midnight on Sunday         0 0 0 * * 0
  @daily (or @midnight)   Run once a day, midnight                    0 0 0 * * *
  @hourly                 Run once an hour, beginning of hour         0 0 * * * *
  ======================  ==========================================  =============

After configuration, GOSINT is ready for use! Begin by navigating to the Pre-Processing page, where indicators will display once parsed by GOSINT from your configured feeds.
