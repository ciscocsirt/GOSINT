// settings.js

// Global variables for list of feeds, associated DataTable, and list of settings
var currentFeeds = [], t = "", mysettings  = "";

$(document).ready(function() {

  // Load current indicator feeds
  getFeeds();

  // Load current settings
  $.ajax({
        type: 'GET',
        url: BASEURL + "/settings/",
        success: function( data){
            fillInCurrent(data);
            mysettings = data;
          },
        error: AJAXerrorHandler
    });

    var selectedRows = [];

    // Delete feed button handler
    $( "#feedsTable" ).on('click','.deletefeed', function() {
        var tr = $(this).closest('tr');
        var data = t.row(tr).data();

        generate("information", "Deleting feed "+data.name+".");

        // Get index of feed in array and remove feed
        var location = checkFeedInArray(data.name);
        currentFeeds.splice(location, 1);

        // Create new feeds object and POST object to endpoint
        feedsObj = new Object();
        feedsObj.feeds = currentFeeds;
        feedsJSON = JSON.stringify(feedsObj);

        $.ajax({
            type: 'POST',
            data: feedsJSON,
            url: BASEURL + "/settings/feeds/",
            success: function(result) {
                generate("success", "Successfully deleted feed.");
                t.destroy();
                getFeeds();
            },
            error: AJAXerrorHandler
        });
    });

    // Cron time options link handler
    $( "#cronTimeDisplay" ).click(function() {
      $("#cronTimeOptions").slideToggle(500);
      return false;
    });

    // Select Parser method change handler
    $('select').change(function() {
      var choice = $("#feedParser option:selected").val();
      if (choice == "csv") {
        $("#csvIndicatorColumn").prop('disabled', false);
        $("#csvContextColumn").prop('disabled', false);
      }
      else {
          $("#csvIndicatorColumn").prop('disabled', true);
          $("#csvContextColumn").prop('disabled', true);
      }
    });

    // Tooltips
    $('#twitterConsumerKey').tooltip({'trigger':'hover', 'title': 'Your Twitter consumer key'});
    $('#twitterConsumerSecret').tooltip({'trigger':'hover', 'title': 'Your Twitter consumer secret'});
    $('#twitterAccessToken').tooltip({'trigger':'hover', 'title': 'Your Twitter access token'});
    $('#twitterAccessSecret').tooltip({'trigger':'hover', 'title': 'Your Twitter access secret'});
    $('#twitterUsersWrap').tooltip({'trigger':'hover', 'title': 'Twitter users you would like to scrape for malicious indicators'});
    $('#alienVaultAPI').tooltip({'trigger':'hover', 'title': 'Your AlienVault API key'});
    $('#virustotalAPI').tooltip({'trigger':'hover', 'title': 'Your VirusTotal API key'});
    $('#umbrellaAPI').tooltip({'trigger':'hover', 'title': 'Your Cisco Umbrella API key'});
    $('#critsUser').tooltip({'trigger':'hover', 'title': 'Your CRITs username for export from transfer station'});
    $('#critsKey').tooltip({'trigger':'hover', 'title': 'Your CRITs API key for export from transfer station'});
    $('#critsServer').tooltip({'trigger':'hover', 'title': 'Your CRITs server for export from transfer station'});
    $('#critsSource').tooltip({'trigger':'hover', 'title': 'Name for the source for indicators exported via CRITs'});
    $('#alexaDomainsWrap').tooltip({'trigger':'hover', 'title': 'Domains from Alexa you would like to ignore from appearing in GOSINT'});
    $('#whitelistDomainsWrap').tooltip({'trigger':'hover', 'title': 'General domains you would like to ignore from appearing in GOSINT'});
    $('#whitelistISPsWrap').tooltip({'trigger':'hover', 'title': 'Internet Service Providers to ignore; for example, enter "google" to ignore any host from Google'});
    $('#feedName').tooltip({'trigger':'hover', 'title': 'Name of the feed to create'});
    $('#feedURL').tooltip({'trigger':'hover', 'title': 'URL of the feed to create'});
    $('#feedParserWrap').tooltip({'trigger':'hover', 'title': 'Select Smart to let the parser find indicators\nSelect CSV if the feed contains comma-separated values'});
    $('#csvIndicatorColumn').tooltip({'trigger':'hover', 'title': 'Column number of where indicators are in feed, where first column is zero (if CSV is selected)'});
    $('#csvContextColumn').tooltip({'trigger':'hover', 'title': 'Column number of where context is in feed, where first column is zero (if CSV is selected)'});
    $('#cronTime').tooltip({'trigger':'hover', 'title': 'How often to pull from this feed'});
    $('#virustotalAPIprivate').tooltip({'trigger':'hover', 'title': 'Check this box if your VirusTotal API key has private access'});

    var format = $( "#format" ).val();

});

/*
 * Function Name:  fillInCurrent
 * Pre-Condition:  AJAX call to settings API endpoint successful
 * Post-Condition: Update page with loaded information
 */
function fillInCurrent(data) {

    $("#twitterConsumerKey").val(data.twitterconsumerkey);
    $("#twitterConsumerSecret").val(data.twitterconsumersecret);
    $("#twitterAccessToken").val(data.twitteraccesstoken);
    $("#twitterAccessSecret").val(data.twitteraccesssecret);
    $("#twitterUsers").tokenfield({tokens: data.twitterusers});
    $("#alienVaultAPI").val(data.alienvault);
    $("#virustotalAPI").val(data.vtkey);
    $("#umbrellaAPI").val(data.opendnskey);
    $("#critsUser").val(data.critsuser);
    $("#critsKey").val(data.critskey);
    $("#critsServer").val(data.critsserver);
    $("#critsSource").val(data.critssource);
    $("#alexaDomains").tokenfield({tokens: data.alexadomains});
    $("#whitelistDomains").tokenfield({tokens: data.whitelistdomains});
    $("#whitelistISPs").tokenfield({tokens: data.whitelistisp});

    if (data.vtintel === "true") {
        $('#virustotalAPIprivate').prop('checked', true);
    }
}

// Update settings click handler
$(document).on("click", ".updateSettings", function(){
    $(".sloading").show();

    // Create new JSON object
    var json = new Object();

    var twitterconsumerkey = $("#twitterConsumerKey").val();
    var twitterconsumersecret = $("#twitterConsumerSecret").val();
    var twitteraccesstoken = $("#twitterAccessToken").val();
    var twitteraccesssecret = $("#twitterAccessSecret").val();
    var alienvault = $("#alienVaultAPI").val();
    var opendnskey = $("#umbrellaAPI").val();
    var critsuser = $("#critsUser").val();
    var critskey = $("#critsKey").val();
    var critssource = $("#critsSource").val();
    var critsserver = $("#critsServer").val();
    var vtkey = $("#virustotalAPI").val();

    var twitterusersArr = $("#twitterUsers").tokenfield('getTokens');
    var twitterusers = [];
    for (var i = 0; i < twitterusersArr.length; i++) {
        twitterusers.push(twitterusersArr[i].value);
    }

    var vtintel = "";
    if ($("#virustotalAPIprivate").is(':checked')) {
        vtintel = "true";
    }
    else {
        vtintel = "false";
    }

    var alexadomains = [];
    var alexadomainsArr = $("#alexaDomains").tokenfield('getTokens');
    for (var i = 0; i < alexadomainsArr.length; i++) {
      alexadomains.push(alexadomainsArr[i].value);
    }

    var whitelistdomains = [];
    var whitelistdomainsArr = $("#whitelistDomains").tokenfield('getTokens');
    for (var i = 0; i < whitelistdomainsArr.length; i++) {
      whitelistdomains.push(whitelistdomainsArr[i].value);
    }

    var whitelistIPs = [];
    var whitelistIPsArr = $("#whitelistISPs").tokenfield('getTokens');
    for (var i = 0; i < whitelistIPsArr.length; i++) {
      whitelistIPs.push(whitelistIPsArr[i].value);
    }

    // Load JSON object with variables
    json.twitterconsumerkey = twitterconsumerkey;
    json.twitterconsumersecret = twitterconsumersecret;
    json.twitteraccesstoken = twitteraccesstoken;
    json.twitteraccesssecret = twitteraccesssecret;
    json.twitterusers = twitterusers;
    json.vtkey = vtkey;
    json.alienvault = alienvault;
    json.vtintel = vtintel;
    json.opendnskey = opendnskey;
    json.critsuser = critsuser;
    json.critskey = critskey;
    json.critsserver = critsserver;
    json.critssource = critssource;
    json.alexadomains = alexadomains;
    json.whitelistdomains = whitelistdomains;
    json.whitelistisp = whitelistIPs;
    json = JSON.stringify(json);

    // POST settings to endpoint
    $.ajax({
        type: 'POST',
        url: BASEURL + "/settings/",
        data: json,
        beforeSend: function () {
            generate("information", "Submitting update to endpoint.");
        },
        success: function( data){
          generate("success", "Settings successfully updated.");
          $(".sloading").hide();
        },
        error: AJAXerrorHandler
    });

});

// Create feeed button click handler
$(document).on("click", "#createFeed", function(){

    generate("information", "Creating feed.");

    // Allow alphanumeric, hyphens, and spaces
    var nameregex =  /^[\w\-\s]+$/;

    // Allow valid URLs
    var urlregex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/;

    var feedName = $("#feedName").val();
    var feedURL = $("#feedURL").val();
    var feedParser = $("#feedParser option:selected").val();
    if (feedParser === "csv") {
      var csvIndicatorColumn = $("#csvIndicatorColumn").val();
      var csvContextColumn = $("#csvContextColumn").val();
    }
    else {
      var csvIndicatorColumn = "";
      var csvContextColumn = "";
    }
    var cronTime = $("#cronTime").val();

    // Basic input validation
    if (feedName === "") {
        generate("error", "Feed name must be filled.");
        return;
    }
    if (checkFeedInArray(feedName) != -1) {
        generate("error", "A feed with the name "+feedName+" already exists.");
        return;
    }
    if (!nameregex.test(feedName)) {
        generate("error", "Feed name must only contain letters, numbers, spaces, and hyphens.");
        return;
    }
    if(feedURL === "") {
        generate("error", "Feed URL must be filled.");
        return;
    }
    if (!urlregex.test(feedURL)) {
        generate("error", "Feed URL must be a valid URL. (Did you include http://?)");
        return;
    }
    if (feedParser === "csv") {
        if (csvIndicatorColumn === "") {
            generate("error", "CSV Indicator Column must be filled.");
            return;
        }
        else if (!Number.isInteger(parseInt(csvIndicatorColumn)) || parseInt(csvIndicatorColumn) < 0) {
            generate("error", "CSV Indicator Column must only be a integer greater than 0.");
            return;
        }
        if (csvContextColumn === "") {
            generate("error", "CSV Context Column must be filled.");
            return;
        }
        else if (!Number.isInteger(parseInt(csvContextColumn)) || parseInt(csvContextColumn) < 0) {
            generate("error", "CSV Context Column must only be a integer greater than 0.");
            return;
        }
    }
    if (cronTime === "") {
        generate("error", "Cron Time must be filled.");
        return;
    }
    if (!cronTime.includes("@")){
        generate("error", "Cron Time is invalid. See options for valid input.");
        return;
    }

    // Create JSON structure
    var json = new Object();

    json.name = feedName;
    json.url = feedURL;
    json.parser = feedParser;
    json.crontime = cronTime;
    json.csvindicatorcolumn = csvIndicatorColumn;
    json.csvcontextcolumn = csvContextColumn;

    // Add into list of feeds and update table
    currentFeeds.push(json);

    // Send new structure to endpoint
    feedsObj = new Object();
    feedsObj.feeds = currentFeeds;
    feedsJSON = JSON.stringify(feedsObj);

    // POST new feeds structure
    $.ajax({
          type: 'POST',
          url: BASEURL+"/settings/feeds/",
          data: feedsJSON,
          success: function(data) {
              generate("success", feedName + " successfully added to the feeds.");

              // If table already exists, destroy it
              if (t != "") {
                  t.destroy();
              }

              // Reload feeds
              getFeeds();

              // Reset fields
              $("#feedName").val("");
              $("#feedURL").val("http://");
              $("#csvIndicatorColumn").val("");
              $("#csvContextColumn").val("");
              $("#cronTime").val("@daily");
          },
          failure: AJAXerrorHandler
    });

});

/*
 * Function Name:  getFeeds
 * Pre-Condition:  Document loaded
 * Post-Condition: Update page with loaded information
 */
function getFeeds() {
  $( "#feedsTable" ).hide();
  t = $('#feedsTable').DataTable( {

      // Initialize AJAX pull
      "ajax": {
          "url": BASEURL+"/settings/feeds/",
          "dataSrc": "feeds",
          "complete": function( data){
              currentFeeds = JSON.parse(data.responseText).feeds;
          },
          "error": AJAXerrorHandler
      },

      // Disable searching and sorting on actions column
      "columnDefs": [
      {
          "targets": 0,
          "data": "name",
          "width": "15%"
      },
      {
          "targets": 1,
          "data": "url",
          "width": "60%"
      },
      {
          "targets": 2,
          "data": "parser",
          "width": "5%"
      },
      {
          "targets": 3,
          "data": "crontime",
          "width": "5%"
      },
      {
          "targets": 4,
          "data": "csvindicatorcolumn",
          "width": "5%"
      },
      {
          "targets": 5,
          "data": "csvcontextcolumn",
          "width": "5%"
      },
      {
          "targets": 'movingCol',
          "data": null,
          "defaultContent": "<button class='btn btn-warning deletefeed' aria-label='Delete' title='Delete Feed'> \
                            <span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button>",
          "sorting": false,
          "orderable": false,
          "type": "html",
          "width": "5%"
      },
      ],
      "processing": true
  });
  $( "#feedsTable" ).fadeIn(750);
}


/*
 * Function Name:  editTableCell
 * Pre-Condition:  A cell within our DataTable has just been edited
 * Post-Condition: Submit edited changes to backend and reflect in frontend
 */
function editTableCell(updatedCell, updatedRow, oldValue) {
    // add some validation...
    generate("information", "Updating indicator "+updatedRow.data().indicator+" with new data.");
    $.ajax({
          type: 'PUT',
          url: BASEURL + "/post/",
          data: JSON.stringify(updatedRow.data()),
          success: function( data){
              generate("success", "Successfully updated indicator "+updatedRow.data().indicator+".");
            },
          error: AJAXerrorHandler
      });
}

/*
 * Function Name:  checkFeedInArray
 * Pre-Condition:  User is attempting to add a new feed
 * Post-Condition: If item in array, return index, if not in array return -1
 */
function checkFeedInArray(feedName) {
    for (var i = 0; i < currentFeeds.length; i++) {
        if (currentFeeds[i].name == feedName) {
            return i;
        }
    }
    return -1;
}
