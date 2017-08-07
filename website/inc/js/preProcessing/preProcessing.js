// BASEURL and AJAXerrorHandler function defined in inc/js/general/generate.js

// Table global variable for access in accessory functions
var t = "";
// Enabled APIs
var enabledAPIs = {"virustotal": "false", "threatcrowd": "true", "umbrella": "false"};

$(document).ready(function() {

    loadTwitterWidget();

    // Attempt to load current indicators
    $.ajax({
        type: 'GET',
        url: BASEURL + "/pre/",
        success: function( data) {
            // API endpoint returned data
            successLoad(data);
        },
        error: function (request, status, error) {
            if (error == "Not Found") {
                // API endpoint returned Not Found, indicating no indicators present
                $(".noindicators").fadeIn(500);
                $(".taloading").hide();
            }
            else {
                // Some other error, probably connection related
                AJAXerrorHandler(request, status, error);
            }
        }
    });

    // Array storing bulk move indicators
    var selectedRows = [];

    // Keeping track of user workflow
    var currentIndicator, lastIndicator;
    var currentRow;

    // Modal tab click handlers
    $( "#analysisModal" ).on('click','#umbrellaTab', function() {
        resetTabs("#oanalysis");
    });

    $( "#analysisModal" ).on('click','#threatCrowdTab', function() {
        resetTabs("#tanalysis");
    });

    $( "#analysisModal" ).on('click','#virusTotalTab', function() {
        resetTabs("#vanalysis");
    });
    $( "#analysisModal" ).on('click','#everythingTab', function() {
        resetTabs("#eanalysis");
    });
    $( "#analysisModal" ).on('click','#embedTweetTab', function() {
        resetTabs("#embedTweet");
    });

    // Modal API button click handlers
    $( "#analysisModal" ).on('click','#modalUmbrella', function() {
        callCiscoUmbrella(currentIndicator);
    });

    $( "#analysisModal" ).on('click','#modalVirustotal', function() {
        callVirustotal(currentIndicator);
    });
    $( "#analysisModal" ).on('click','#modalThreatcrowd', function() {
        callThreatcrowd(currentIndicator);
    });
    $( "#analysisModal" ).on('click','#modalEmbedTweet', function() {
        getEmbeddedTweet(currentIndicator);
    });


    // Modal action button click handlers
    $( "#analysisModal" ).on('click','.deleteind', function() {
        deleteIndicator(currentIndicator, currentRow);
        currentIndicator = null;
        currentRow = null;
    });
    $( "#analysisModal" ).on('click','.postind', function() {
        postIndicator(currentIndicator, currentRow);
        currentIndicator = null;
        currentRow = null;
    });
    $( "#analysisModal" ).on('click','.bulkmove', function() {
        bulkMove(currentRow, selectedRows);
        currentIndicator = null;
        currentRow = null;
    });

    // Embedded tweet trigger
    $( "#preTable" ).on('click','.callet', function() {

      // Store last indicator, launch modal
      lastIndicator = currentIndicator;
      returnObj = initializeModal(lastIndicator, this);
      currentIndicator = returnObj.currentIndicator;
      currentRow = returnObj.currentRow;

      // Stylize selected row
      emphasizeRow(currentRow);

      // Call Twitter
      getEmbeddedTweet(currentIndicator);

      createModalButtons(currentIndicator);

      updateDisplay("#embedTweet", "#embedTweetTab", currentIndicator);
    });

    // VirusTotal Analysis trigger
    $( "#preTable" ).on('click','.callvt', function() {

      // Store last indicator, launch modal
      lastIndicator = currentIndicator;
      returnObj = initializeModal(lastIndicator, this);
      currentIndicator = returnObj.currentIndicator;
      currentRow = returnObj.currentRow;

      // Stylize selected row
      emphasizeRow(currentRow);

      // Call VirusTotal
      callVirustotal(currentIndicator);

      createModalButtons(currentIndicator);

      updateDisplay("#vanalysis", "#virusTotalTab", currentIndicator);
    });

    // ThreatCrowd Analysis trigger
    $( "#preTable" ).on('click','.calltc', function() {

      // Store last indicator, launch modal
      lastIndicator = currentIndicator;
      returnObj = initializeModal(lastIndicator, this);
      currentIndicator = returnObj.currentIndicator;
      currentRow = returnObj.currentRow;

      // Stylize selected row
      emphasizeRow(currentRow);

      // Call ThreatCrowd
      callThreatcrowd(currentIndicator);

      createModalButtons(currentIndicator);

      updateDisplay("#tanalysis", "#threatCrowdTab", currentIndicator);
    });

    // Cisco Umbrella Analysis trigger
    $( "#preTable" ).on('click','.callop', function() {

      // Store last indicator, launch modal
      lastIndicator = currentIndicator;
      returnObj = initializeModal(lastIndicator, this);
      currentIndicator = returnObj.currentIndicator;
      currentRow = returnObj.currentRow;

      // Stylize selected row
      emphasizeRow(currentRow);

      // Call Cisco Umbrella
      callCiscoUmbrella(currentIndicator);

      createModalButtons(currentIndicator);

      updateDisplay("#oanalysis", "#umbrellaTab", currentIndicator);
    });

    // Everything Analysis trigger
    $( "#preTable" ).on('click','.callev', function() {

      // Store last indicator, launch modal
      lastIndicator = currentIndicator;
      returnObj = initializeModal(lastIndicator, this);
      currentIndicator = returnObj.currentIndicator;
      currentRow = returnObj.currentRow;

      // Stylize selected row
      emphasizeRow(currentRow);

      // Call all APIs
      callEverything(currentIndicator);

      updateDisplay("#eanalysis", "#everythingTab", currentIndicator);
    });

    // Delete Pre-Proecessing indicator trigger
    $( "#preTable" ).on('click','.deleteind', function() {
      var tr = $(this).closest('tr');
      var data = t.row(tr).data();

      deleteIndicator(data, tr);

    });

    // Move to Post-Processing trigger
    $( "#preTable" ).on('click','.postind', function() {
      var tr = $(this).closest('tr');
      var data = t.row(tr).data();

      postIndicator(data, tr);
    });

    // Bulk move per indicator trigger
    $( "#preTable" ).on('click','.bulkmove', function() {

      // Select tr node
      currentRow = $(this).closest('tr');
      bulkMove(currentRow, selectedRows);

      // Reset indicator placeholders
      currentIndicator = null;
      currentRow = null;
    });

    // Select all trigger
    $( "#selectAll" ).click(function() {

      // Select all rows on current page
      var rows = t.rows({ page: 'current' }).nodes();

      // Get DataTables object for each row, then execute bulkMove for each
      for (var i = 0; i < rows.length; i++) {
          currentRow = $(rows[i]).closest('tr');
          bulkMove(currentRow, selectedRows);
      }

      // Reset indicator placeholders
      currentIndicator = null;
      currentRow = null;

    });

    // Bulk Move button post processing trigger
    $( "#bulkMovePost" ).click(function() {

      if (selectedRows.length == 0) {
          generate("error", "No indicators selected! Select indicators to move to post-processing.");
          return;
      }

      generate("information", "Moving "+selectedRows.length+" indicators into post-processing.");

      // Post each indicator into post-processing
      for (var i = 0; i < selectedRows.length; i++) {
        $.ajax({
              type: 'POST',
              url: BASEURL+"/post/",
              data: JSON.stringify(selectedRows[i]),
              success: function() { },
              failure: AJAXerrorHandler,
              dataType: 'json'
        });
        t.row('.rowhighlight').remove().draw(false);
      }

      generate("success", "Successfully moved "+selectedRows.length+" indicators.");

      // Reset selectedRows variable
      selectedRows.length = 0;
    });

    // Bulk delete trigger
    $( "#bulkDelete" ).click(function() {

      if (selectedRows.length == 0) {
          generate("error", "No indicators selected! Select indicators to delete.");
          return;
      }

      generate("information", "Deleting "+selectedRows.length+" indicators.");

      // Delete each indicator from pre-processing
      for (var i = 0; i < selectedRows.length; i++) {
        $.ajax({
            type: 'DELETE',
            url: BASEURL + "/pre/" + selectedRows[i].guid,
            success: function(result) {
              t.row('.rowhighlight').remove().draw(false);
            },
            error: AJAXerrorHandler
        });
      }

        generate("success", "Successfully deleted "+selectedRows.length+" indicators.");

        selectedRows.length = 0;
    });

});

/*
 * Function Name:  successLoad
 * Pre-Condition:  data contains response from API endpoint
 * Post-Condition: DataTable loaded, loading indicator hidden
 */
function successLoad(data) {

    // Load DataTable
    getIndicators(data);

    // Show DataTable and hide loading animation
    $("#preTable").fadeIn(500);
    $(".bulk").fadeIn(500);
    $(".taloading").hide();

}

/*
 * Function Name:  buildAPIButtons
 * Pre-Condition:  Use synchronously loaded settings JSON to determine which APIs are active
 * Post-Condition: HTML for supported APIs returned
 */
function buildAPIButtons(settings) {

      // Build HTML string based on if API enabled or not
      var returnStr = "<button class='btn btn-info calltc'>ThreatCrowd</button>";
      if(settings.vtkey !== "") {
        enabledAPIs.virustotal = "true";
        returnStr += "<button class='btn btn-info callvt'>VirusTotal</button>";
      }
      if (settings.opendnskey !== "") {
        enabledAPIs.umbrella = "true";
        returnStr = "<button class='btn btn-info callop'>Umbrella</button>" + returnStr;
      }
      returnStr += "<button class='btn btn-info callev'>Everything</button>";
      return returnStr;
}

/*
 * Function Name:  getIndicators
 * Pre-Condition:  data contains response from API endpoint
 * Post-Condition: DataTable loaded based on response
 */
function getIndicators(data) {

    var apiButtons = "";

    // Call Settings page to determine what APIs are enabled
    $.ajax({
        type: 'GET',
        async: false,
        url: BASEURL + "/settings/",
        success: function(data) {
            apiButtons = buildAPIButtons(data);
        },
            error: AJAXerrorHandler
    });

    // Build DataTable
    t = $('#preTable').DataTable( {
      "data": data.data,
      "language": {
          "emptyTable": "No indicators found!",
      },
      "initComplete": function(settings, json) {

          // set tooltips
          $('.deleteind').tooltip({'trigger':'hover', 'title': 'Delete Indicator'});
          $('.postind').tooltip({'trigger':'hover', 'title': 'Move to Post-Processing'});
          $('.bulkmove').tooltip({'trigger':'hover', 'title': 'Bulk Move'});
          $('.contextLink').tooltip({'trigger':'hover', 'title': 'Open External Link'});
          $('.callop').tooltip({'trigger':'hover', 'title': 'Call Umbrella API'});
          $('.calltc').tooltip({'trigger':'hover', 'title': 'Call ThreatCrowd API'});
          $('.callvt').tooltip({'trigger':'hover', 'title': 'Call VirusTotal API'});
          $('.callev').tooltip({'trigger':'hover', 'title': 'Call All Available APIs'});

          if(enabledAPIs.umbrella == "false") {
            $('.oresults').hide();
            $('#umbrellaTab').hide();
            $('#oanalysis').hide();
            $('#APInotices').append('<p id="umbrellaNotice"><strong>Notice</strong> Cisco Umbrella API key is not defined in the settings and cannot be used for calling on indicators. \
                                     <a href="settings.php">Enter the API key</a> to utilize Cisco Umbrella API calls.</p>');
            $('#APInotices').slideDown("slow");
          }
          if(enabledAPIs.virustotal == "false") {
              $('.vresults').hide();
              $('#virusTotalTab').hide();
              $('#vanalysis').hide();
              $('#APInotices').append('<p id="virustotalNotice"><strong>Notice</strong> VirusTotal API key is not defined in the settings and cannot be used for calling on indicators. \
                                       <a href="settings.php">Enter the API key</a> to utilize VirusTotal API calls.</p>');
              $('#APInotices').slideDown("slow");
          }
      },

      // Disable searching and sorting on actions column
      "columnDefs": [
          {
            "targets": 0,
            "data": "guid",
            "visible": false
          },
          {
            "targets": 1,
            "data": "date",
            "render": function(data, type, row){
                // Parse date as UTC string and output appropriately
                return moment(data).utc().format( 'ddd DD MMM YYYY HH:mm:ss');
            },
            "type": "moment-js-date"
          },
          {
            "targets": 2,
            "data": "indicator"
          },
          {
            "targets": 3,
            "data": "type"
          },
          {
            "targets": 4,
            "data": "source"
          },
          {
            "targets": 5,
            "data": "context",
            "render": function(data, type, row){
              var text = data;
              var words = text.split(' ');
              var new_text = '';

              for (var i=0; i < words.length; i++) {
                  var word = words[i];
                  if ((word.indexOf('http://') === 0 || word.indexOf('www.') === 0) ||
                      word.indexOf('https://') === 0) {

                      word = '<a class="contextLink" href="' + word + '" target="_blank">' + word + "</a>";
                  }
                  new_text += word + ' ';
              }
              return new_text;
            }
          },
          {
            "targets": 6,
            "data": "tags"
          },
          {
            "targets": 'actionsCol',
            "data": null,
            "defaultContent": apiButtons,
            "sorting": false,
            "orderable": false,
            "type": "html"
          },
          {
            "targets": 'movingCol',
            "data": null,
            "defaultContent": "<button class='btn btn-warning deleteind' aria-label='Delete'> \
                    <span class='glyphicon glyphicon-remove' aria-hidden='true'></span> </button> \
                    <button class='btn btn-success postind' aria-label='Post-Processing'> \
                    <span class='glyphicon glyphicon-arrow-right' aria-hidden='true'></span></button> \
                    <button class='btn btn-primary bulkmove' aria-label='Bulk Move'> \
                    <span class='glyphicon glyphicon-th-list' aria-hidden='true'></span></button>",
            "sorting": false,
            "orderable": false,
            "type": "html"
          },
        ],
      'order': [[1, 'desc']],
      "rowCallback": function( row, data, dataIndex ) {

          $("td:eq(5)", row).html("<input class='tag-tokens' id='" + data.guid + "'></input>");

          var currentIndicator = data;

          if (data.tags.length != 0) {

            // Place a trigger function on createdToken. This will loop through
            // all tags if the indicator already has tags assigned
            $("td:eq(5) input", row) .on('tokenfield:createtoken', function (e) {

                // validate tag
                var result = validateWordOrSpaceClass(e.attrs.value.trim());
                if (!result) {
                    generate ("error", "Token contains invalid characters.");
                    e.preventDefault();
                    return false;
                }

            })
            .on('tokenfield:createdtoken', function (e) {
                // http://sliptree.github.io/bootstrap-tokenfield/
                insertTags(currentIndicator, e.attrs.value.trim());

            })
            .on('tokenfield:removedtoken', function (e) {
                removeTags(currentIndicator, e.attrs.value);

            })
            .tokenfield({tokens: data.tags});
          }
          else {
            $("td:eq(5) input", row) .on('tokenfield:createtoken', function (e) {

                // validate tag
                var result = validateWordOrSpaceClass(e.attrs.value.trim());
                if (!result) {
                    generate ("error", "Token contains invalid characters.");
                    e.preventDefault();
                    return false;
                }

            })
            .on('tokenfield:createdtoken', function (e) {
                // code to verify tokens
                insertTags(currentIndicator, e.attrs.value.trim());

            })
            .on('tokenfield:removedtoken', function (e) {
                removeTags(currentIndicator, e.attrs.value);

            })
            .tokenfield();
          }
      }
    });

    // Allow for editable cells
    t.MakeCellsEditable({
      "onUpdate": editTableCell,
      "inputCss":'my-input-class',
      "columns": [0,1,2,3,4,5],
      "confirmationButton": {
        "confirmCss": 'my-confirm-class',
        "cancelCss": 'my-cancel-class'
      },
      "inputTypes": [
        {
          "column":1,
          "type":"text",
          "options":null
        },
        {
          "column":2,
          "type":"text",
          "options":null
        },
        {
          "column":3,
          "type": "list",
          "options":[
            { "value": "domain", "display": "domain" },
            { "value": "ip", "display": "ip" },
            { "value": "url", "display": "url" }
          ]
        },
        {
          "column":4,
          "type":"text",
          "options":null
        },
        {
          "column":5,
          "type":"text",
          "options":null
        }
      ]
    });

    // Find all Twitter sourced indicators
    var indexes = t.rows().eq( 0 ).filter( function (rowIdx) {
      return t.cell( rowIdx, 4 ).data() === 'twitter' ? true : false;
    } );

    // Add View Tweet button to these indicators
    t.rows(indexes).every(function () {
      var myNode = this.node();
      $(myNode).find("td:nth-last-child(2)").prepend("<button class='btn btn-info callet'>View Tweet</button>" );
    });

}

/*
 * Function Name:  addOrRemove
 * Pre-Condition:  Row has been clicked and need to determine whether to add or remove row from array
 * Post-Condition: Array has been modified appropriately
 */
function addOrRemove(array, value) {
    var index = array.indexOf(value);

    if (index === -1) {
        // Add in value
        array.push(value);
        return true;
    } else {
        // Remove value
        array.splice(index, 1);
        return false;
    }
}

/*
 * Function Name:  callEverything
 * Pre-Condition:  Everything has been called for APIs
 * Post-Condition: Call each API function (VirusTotal, Threatcrowd, CiscoUmbrella)
 */
function callEverything(ind) {
    if (enabledAPIs.virustotal === "true") {
        callVirustotal(ind);
    }
    if (enabledAPIs.threatcrowd === "true") {
        callThreatcrowd(ind);
    }
    if (enabledAPIs.umbrella === "true") {
        callCiscoUmbrella(ind);
    }
    if (ind.source == "twitter") {
        getEmbeddedTweet(ind);
    }

}

/*
 * Function Name:  arrToList
 * Pre-Condition:  title and arr are valid Javascript objects
 * Post-Condition: Return string containing HTML unordered list
 */
function arrToList(title, arr) {
    var rstr = "<h4>"+title+"</h4>";
    rstr += "<ul>";
    for (var i=0; i<arr.length; i++) {
        rstr += "<li>"+arr[i]+"</li>";
    }
    rstr += "</ul>";
    return rstr;
}

/*
 * Function Name:  arrToTable
 * Pre-Condition:  title and arr are valid Javascript objects
 * Post-Condition: Return string containing HTML table
 */
function arrToTable(title, arr) {
    var rstr = "<h4>"+title+"</h4>";
    var i;
    rstr += "<table class='table table-striped'><thead class='thead-default'>";

    if (title === "Domain Resolutions") {
        rstr += "<tr><th>Last Resolved</th><th>IP Address</th></tr></thead>";
        for (i=0;i<arr.length; i++) {
            rstr += '<tr><td>'+arr[i].last_resolved+'</td><td>'+arr[i].ip_address+"</td></tr>";
        }
    }
    else if (title === "IP Resolutions") {
        rstr += "<tr><th>Last Resolved</th><th>Domain</th></tr></thead>";
        for (i=0;i<arr.length; i++) {
            rstr += '<tr><td>'+arr[i].last_resolved+'</td><td>'+arr[i].domain+"</td></tr>";
        }
    }
    else if (title === "Detected URLs") {
        rstr += "<tr><th>URL</th><th>Positive Count</th><th>Scan Date</th></tr></thead>";
        for (i=0;i<arr.length;i++) {
            rstr += '<tr><td>'+arr[i].url+'</td><td>'+arr[i].positives+'/'+arr[i].total+"</td>";
            rstr += "<td>"+arr[i].scan_date+"</td></tr>";
        }
    }
    else if (title === "Undetected Downloaded Samples" || title === "Detected Communicating Samples") {
        rstr += "<tr><th>Date</th><th>Positive Count</th><th>SHA256</th></tr></thead>";
        for (i=0;i<arr.length;i++) {
            rstr += '<tr><td>'+arr[i].date+'</td><td>'+arr[i].positives+'/'+arr[i].total+'</td>';
            rstr += '<td>' + arr[i].sha256 + '</td></tr>';
        }
    }

    rstr += '</table>';

    return rstr;
}

/*
 * Function Name: callVirustotal
 * Pre-Condition: ind is a well-formatted indicator
 * Post-Condition: html_passedback contains analysis from VirusTotal on the indicator
 */
function callVirustotal(ind) {
    // Set up default paramaters for AJAX calls
    $.ajaxSetup({
        // If error, display error message
        error: AJAXerrorHandler
    });

    // Reset html to blank string
    $(".vresults").html("");

    // Placeholder text for return
    var html_passedback = "<h3 id='virusTotalTitle'>VirusTotal Results for "+ind.indicator+'</h3>';
    var url = "";

    // Instantiate div to display and start loading icon
    $("#errormsg").hide();
    $("#vanalysis").slideDown(500);
    $(".vloading").show();

    // generate('information', "VirusTotal called for "+ind.indicator+".");

    // Identify type of indicator and process differently based on type
    // For IP...
    if (ind.type === "ip") {

        url = BASEURL + "/vt/ip/" + ind.indicator;

        // Get JSON of VirusTotal call
        $.getJSON( url, function( data ) {

          // No data in VirusTotal
          if (data.response_code === 0) {
              html_passedback += "<h4>IP address not found</h4>";
              html_passedback += "VirusTotal does not have this IP address in their database. Please try again later.";
          }
          // Invalid format
          else if (data.response_code === -1) {
              html_passedback += "<h4>IP address invalid</h4>";
              html_passedback += "VirusTotal claims this IP address is invalid. Please try again later.";
          }
          // We haz data - parse response
          else {

              html_passedback += "<h4>Verbose Message</h4>" + data.verbose_msg;
              html_passedback += "<h4>As Owner</h4>" + data.as_owner;
              html_passedback += "<h4>Country</h4>" + data.country;

              // Check if certain information is present within the return JSON
              if (data.detected_urls.length > 0) {
                  html_passedback += arrToTable("Detected URLs", data.detected_urls);
              }
              if (data.detected_communicating_samples) {
                html_passedback += arrToTable("Detected Communicating Samples", data.detected_communicating_samples);
              }
              if (data.undetected_downloaded_samples) {
                html_passedback += arrToTable("Undetected Downloaded Samples", data.undetected_downloaded_samples);
              }
          }

          // Hide loading and pass back HTML
          $(".vloading").hide();
          $(".vresults").html(html_passedback);
          generate('success', "VirusTotal data successfully loaded.");
        });
    }

    // For Domain...
    else if (ind.type === "domain") {

      url = BASEURL + "/vt/domain/"+ind.indicator;

      $.getJSON( url, function( data ) {

        // No data in VirusTotal
        if (data.response_code === 0) {
            html_passedback += "<h4>Domain not found</h4>";
            html_passedback += "<p>VirusTotal does not have this domain in their database. Please try again later.</p>";
        }

        // Invalid format
        else if (data.response_code === -1) {
            html_passedback += "<h4>Domain invalid</h4>";
            html_passedback += "<p>VirusTotal claims this domain is invalid. Please try again later.</p>";
        }
        // We haz data - parse response
        else {
            html_passedback += "<h4>Verbose Message</h4>" + data.verbose_msg;

            if(data.resolutions) {
                html_passedback += arrToTable("Domain Resolutions", data.resolutions);
            }
            if (data.whois) {
                html_passedback += "<h4>WHOIS Information</h4>";
                html_passedback += '<textarea wrap="off" readonly="readonly" class="margin-top-1" style="border:1px dotted #cccccc; background: white; cursor:text; \
                box-shadow:none; width:98%; font-family:monospace; word-wrap: break-word; word-break: break-all; min-height:200px;">';
                html_passedback += data.whois + "</textarea>";
            }
            if(data.detected_urls) {
                html_passedback += arrToTable("Detected URLs", data.detected_urls);
            }
            if(data.undetected_downloaded_samples) {
                html_passedback += arrToTable("Undetected Downloaded Samples", data.undetected_downloaded_samples);
            }
            if (data.subdomains) {
                html_passedback += arrToList("Subdomains", data.subdomains);
            }
            if (data["BitDefender domain info"]) {
                html_passedback += "<h4>BitDefender domain info</h4>"+data["BitDefender domain info"];
            }
            if(data["Websense ThreatSeeker category"]) {
                html_passedback += "<h4>Websense ThreatSeeker category</h4>"+data["Websense ThreatSeeker category"];
            }
            if(data.categories) {
                html_passedback += arrToList("Categories", data.categories);
            }
            if(data.pcaps) {
                html_passedback += arrToList("PCAPS", data.pcaps);
            }
        }

        // Hide loading and pass back HTML
        $(".vloading").hide();
        $(".vresults").html(html_passedback);
        generate('success', "VirusTotal data successfully loaded.");
      });
    }

    // For URL...
    else if (ind.type === "url") {

      url = BASEURL + "/vt/url/";
      $.ajax({
          type: 'POST',
          url: url,
          data: '{"resource":"'+ind.indicator+'"}',
          contentType: 'application/json',
          dataType: 'json',
          success: function(data) {
            // No data
            if (data.response_code === 0) {
                html_passedback += "<h4>URL not found</h4>";
                html_passedback += "<p>VirusTotal does not have this URL in their database. Please try again later.</p>";
            }
            // Parse response
            else {
                $("#vtitle").html("<h4>VirusTotal Results for "+ind.indicator+'</h4>');
                html_passedback += "<h5>Verbose Message</h5>" + data.verbose_msg;
                html_passedback += "<h5>Scan Date</h5>" + data.scan_date;
                html_passedback += "<h5>Positive Count</h5>" + data.positives + '/' + data.total;
                html_passedback += "<h5>Permalink</h5><a target='_blank' href='" + data.permalink +"'>"+data.permalink+"</a>";
            }
            // Hide loading and pass back HTML
            $(".vloading").hide();
            $(".vresults").html(html_passedback);
            generate('success', "VirusTotal data successfully loaded.");
          }
        });
    }

    // For URL...
    else if (ind.type === "md5" || ind.type === "sha1" || ind.type === "sha256") {

      url = BASEURL + "/vt/hash/" + ind.indicator

      $.getJSON( url, function( data ) {
            // No data
            if (data.response_code === 0) {
                html_passedback += "<h4>Hash not found</h4>";
                html_passedback += "<p>VirusTotal does not have this hash in their database. Please try again later.</p>";
            }
            // Parse response
            else {
                $("#vtitle").html("<h4>VirusTotal Results for "+ind.indicator+'</h4>');
                html_passedback += "<h5>Verbose Message</h5>" + data.verbose_msg;
                html_passedback += "<h5>Scan Date</h5>" + data.scan_date;
                html_passedback += "<h5>Positive Count</h5>" + data.positives + '/' + data.total;
                html_passedback += "<h5>Permalink</h5><a target='_blank' href='" + data.permalink +"'>"+data.permalink+"</a><br/>";
                html_passedback += "<h5 style='display: inline-block;'>Scan Results</h5>";
                // html_passedback += "<a id='#toggleVtHashResults'>(toggle)</a>";
                html_passedback += "<div id='vtHashScanResults'><ul>"

                for (var key in data.scans) {
                    // skip loop if the property is from prototype
                    if (!data.scans.hasOwnProperty(key)) continue;

                    var obj = data.scans[key];

                    html_passedback += "<li><strong>"+ key + "</strong><ul>";

                    for (var prop in obj) {
                      // skip loop if the property is from prototype
                      if(!obj.hasOwnProperty(prop)) continue;
                      html_passedback += "<li><span class='uppercaseString'>" + prop + ": " + obj[prop] + "</span></li>";
                    }
                    html_passedback += "</ul></li>";
                }
                html_passedback + "</ul></div>";
                }

                // Hide loading and pass back HTML
                $(".vloading").hide();
                $(".vresults").html(html_passedback);
                generate('success', "VirusTotal data successfully loaded.");

        });
    }
}

/*
 * Function Name: callThreatcrowd
 * Pre-Condition: ind is a well-formatted indicator
 * Post-Condition: html_passedback contains analysis from ThreatCrowd on the indicator
 */
function callThreatcrowd(ind) {

      // Set up default paramaters for AJAX calls
      $.ajaxSetup({
          error: AJAXerrorHandler
      });

      $(".tresults").html("");

      if (ind.type === "md5" || ind.type === "sha1" || ind.type === "sha256") {
          html_passedback = "<h3 id='threatCrowdTitle'>ThreatCrowd Currently Not Supported For Hashes</h3>";
          html_passedback += "<p>ThreatCrowd implementation is still undergoing active development for hashes.</p>";
          $(".tloading").hide();
          $(".tresults").html(html_passedback);
      }

      else {


        var html_passedback = "<h3 id='threatCrowdTitle'>ThreatCrowd Report for "+ind.indicator+"</h3>";
        var url = "";

        $("#errormsg").hide();
        $("#tanalysis").slideDown(500);
        $(".tloading").show();

        // generate('information', "ThreatCrowd called for "+ind.indicator+".");

        // If IP...
        if (ind.type === "ip") {
            url = "https://www.threatcrowd.org/searchApi/v2/ip/report/?ip="+ind.indicator;

            $.getJSON( url, function( data ) {

              // No data in ThreatCrowd
              if (data.response_code === "0") {
                  html_passedback += "<h4>No results found</h4>";
                  html_passedback += "ThreatCrowd does not have this IP in their database. Please try again later.";
                }

                else if (data.response_code === "1") {
                    if (data.votes === -1) {
                        html_passedback += "<h4>This IP was voted to be malicious</h4>";
                      }
                      else {
                        html_passedback += "<h4>This IP was voted to be non-malicious</h4>";
                      }
                      if (data.resolutions) {
                        html_passedback += arrToTable("IP Resolutions", data.resolutions);
                      }
                      if (data.hashes.length > 0) {
                        html_passedback += arrToList("Hashes", data.hashes);
                      }
                      if (data.references.length > 0) {
                        html_passedback += arrToList("References", data.references);
                      }
                      // html_passedback += "<iframe src='http://www.threatcrowd.org/graphHtml.php?ip="+ind.indicator+"' frameborder='0' style='height: 100%; width: 100%; min-height: 600px;'></iframe>";

                      if (data.permalink) {
                        html_passedback += "<h4>Permalink</h4><a target='_blank' href='"+data.permalink+"'>"+data.permalink+"</a>+";
                      }
                    }
                    // Some other error
                    else {
                      html_passedback += "<h4 class='alert alert-danger'>Some error encountered</h4>";
                    }

                    // Hide loading and display HTML
                    $(".tloading").hide();
                    $(".tresults").html(html_passedback);
                    generate('success', "ThreatCrowd data successfully loaded.");
                  });
        }

        // If domain...
        else if (ind.type === "domain" || ind.type === "url") {
            url = "https://www.threatcrowd.org/searchApi/v2/domain/report/?domain="+ind.indicator;
            if (ind.type === "url") {
                // Extract domain from URL and submit with domain
                // ThreatCrowd does not accept URL submission on WHOIS request
                url = "https://www.threatcrowd.org/searchApi/v2/domain/report/?domain="+extractDomain(ind.indicator);
              }

              $.getJSON( url, function( data ) {

                // No data in ThreatCrowd
                if (data.response_code === "0") {
                  html_passedback += "<h4>No results found</h4>";
                  html_passedback += "ThreatCrowd does not have this domain in their database. Please try again later.";
                }
                // We haz data - parse response
                else if (data.response_code === "1") {

                  if (data.votes === -1) {
                      html_passedback += "<h4>This domain was voted to be malicious</h4>";
                    }
                    else {
                      html_passedback += "<h4>This domain was voted to be non-malicious</h4>";
                    }
                    if (data.resolutions.length > 0) {
                      html_passedback += arrToTable("Domain Resolutions", data.resolutions);
                    }
                    if (data.hashes.length > 0) {
                      html_passedback += arrToList("Hashes", data.hashes);
                    }
                    if (data.emails.length > 0) {
                      html_passedback += arrToList("Emails", data.emails);
                    }
                    if (data.subdomains.length > 0) {
                      html_passedback += arrToList("Subdomains", data.subdomains);
                    }
                    if (data.references.length > 0) {
                      html_passedback += arrToList("References", data.references);
                    }
                    if (data.permalink) {
                      html_passedback += "<h4>Permalink</h4><a target='_blank' href='"+data.permalink+"'>"+data.permalink+"</a>";
                    }
                  }
                  else {
                    html_passedback += "<h4 class='alert alert-danger'>Some error encountered</h4>";
                  }

            // Hide loading and display HTML
            $(".tloading").hide();
            $(".tresults").html(html_passedback);
            generate('success', "ThreatCrowd data successfully loaded.");
        });
      }
    }
}

/*
 * Function Name: extractDomain
 * Pre-Condition: url is a well-formed URL
 * Post-Condition: domain contains the extracted domain from the URL
 */
function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

/*
 * Function Name: callCiscoUmbrella
 * Pre-Condition: ind is a well-formatted indicator
 * Post-Condition: html_passedback contains analysis from Cisco Umbrella on the indicator
 */
function callCiscoUmbrella(ind) {

      $.ajaxSetup({
        error: AJAXerrorHandler
      });

      $(".oresults").html("");

      var html_passedback = "<h3 id='umbrellaTitle'>Cisco Umbrella Report for "+ind.indicator+"</h3>";
      var url = BASEURL + "/whois/"+ind.indicator;

      $("#errormsg").hide();
      $(".oloading").show();

      // generate('information', "Cisco Umbrella called for "+ind.indicator+".");

      if (ind.type === "url") {
          // Extract domain from URL and submit with domain
          // Cisco Umbrella does not accept URL submission on WHOIS request
          url = BASEURL + "/whois/"+extractDomain(ind.indicator);
      }

      $.getJSON( url, function( data ) {
        // No data in Cisco Umbrella

        if (data.errorMessage == "Not found") {
            html_passedback += "<h4>No results found</h4>";
            html_passedback += "Cisco Umbrella does not have this indicator in their database. Please try again later.";
        }

        else {
            var keys = Object.keys(data),
              i, len = keys.length;

            keys.sort();

            html_passedback += "<ul>";

            for (i = 0; i < len; i++) {
                k = keys[i];
                var result = k.replace( /([A-Z])/g, " $1" );
                var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
                if (data[k] === null || data[k] === "" || data[k] === [] ) {
                    continue;
                }
                else {
                    var str = "<li><span class='keyname'>"+finalResult+"</span>: "+data[k]+"</li>";
                }
                html_passedback += str;
            }
        html_passedback += "</ul>";
        }
        // Hide loading and display HTML
        $(".oloading").hide();
        $(".oresults").html(html_passedback);
        generate('success', "Cisco Umbrella data successfully loaded.");
      });

}

/*
 * Function Name:  editTableCell
 * Pre-Condition:  A cell within our DataTable has just been edited
 * Post-Condition: Submit edited changes to backend and reflect in frontend
 */
function editTableCell(updatedCell, updatedRow, oldValue) {

    generate("information", "Updating indicator "+updatedRow.data().indicator+" with new data.");
    $.ajax({
          type: 'PUT',
          url: BASEURL + "/pre/",
          data: JSON.stringify(updatedRow.data()),
          success: function( data){
              generate("success", "Successfully updated indicator "+updatedRow.data().indicator+".");
            },
          error: AJAXerrorHandler
      });
}

/*
 * Function Name:  createModalButtons
 * Pre-Condition:  Third-party API has been called for specific indicator
 * Post-Condition: If other API's have not been called then display button
 */
function createModalButtons(indicator) {
    if ($('.oresults').text() == '') {
        $('.oresults').html("<button id='modalUmbrella' class='btn btn-info modalbtn'>Cisco Umbrella</button>") ;
    }
    if ($('.tresults').text() == '') {
        $('.tresults').html("<button id='modalThreatcrowd' class='btn btn-info modalbtn'>ThreatCrowd</button>") ;
    }
    if ($('.vresults').text() == '') {
        $('.vresults').html("<button id='modalVirustotal' class='btn btn-info modalbtn'>VirusTotal</button>") ;
    }
}

/*
 * Function Name:  deleteIndicator
 * Pre-Condition:  Delete button clicked via modal or table
 * Post-Condition: Send DELETE request to API endpoint and remove from front-end
 */
function deleteIndicator(indicator, currentRow) {
    generate("information", "Deleting indicator "+indicator.indicator+".");
    var deletethis = BASEURL+"/pre/"+indicator.guid;
    $.ajax({
        type: 'DELETE',
        url: deletethis,
        success: function(result) {
            generate("success", "Successfully deleted indicator.");
            t.row(currentRow).remove().draw(false);
        },
        error: AJAXerrorHandler
    });
}

/*
 * Function Name:  postIndicator
 * Pre-Condition:  Move to post-processing button clicked via modal or table
 * Post-Condition: Send POST request to API endpoint and remove from front-end
 */
function postIndicator(indicator, currentRow) {
    $.ajax({
        type: 'POST',
        url: BASEURL+"/post/",
        data: JSON.stringify(indicator),
        success: function() { },
        failure: AJAXerrorHandler,
        dataType: 'json'
    });
    generate("success", "Successfully moved indicator to post-processing.");
    t.row(currentRow).remove().draw(false);
}

/*
 * Function Name:  bulkMove
 * Pre-Condition:  Bulk Move button clicked via modal or table
 * Post-Condition: Add indicator to array of selectedRows
 */
function bulkMove(currentRow, selectedRows) {

    // Highlight cells in row
    var td = currentRow.children();
    td.toggleClass("rowhighlight");
    currentRow.toggleClass("rowhighlight");

    // Call function to either add indicator if not present, or remove if already
    // present in selectedRows
    var data = t.row(currentRow).data();
    var added = addOrRemove(selectedRows, data);

}

/*
 * Function Name:  resetTabs
 * Pre-Condition:  Tab clicked in modal
 * Post-Condition: Hide all other tab content besides current tab
 */
function resetTabs(currentDiv) {
    $('#analysisModal>.tab-content>div').css('display','none');
    $('#analysisModal>.tab-content>'+currentDiv).css('display','block');
    // Display move buttons for indicator
    $('#moveButtons').css('display','block');
    $('#moveButtons').css('float','right');
}

/*
 * Function Name:  updateDisplay
 * Pre-Condition:  Third-party API for indicator was called
 * Post-Condition: Hide all other tab content, highlight tab, and display move buttons
 */
function updateDisplay(currentDiv, currentTab, indicator) {

    // Hide all tab content besides current tab
    $('#analysisModal>.tab-content>div').css('display','none');
    $(currentDiv).css('display','block');

    // Select current tab as active
    $('#analysisModal>ul>li.active').removeClass('active');
    $('#analysisModal>.tab-content>div').removeClass('active in');
    $(currentDiv).addClass('active in');
    $(currentTab).addClass('active');

    // Display move buttons for indicator
    $('#moveButtons').css('display','block');
    $('#moveButtons').css('float','right');

    if (indicator.source == "twitter") {
        $("#embedTweetTab").show();
        $("#embedTweet").show();
        $('.embedTweetContent').html("<button id='modalEmbedTweet' class='btn btn-info modalbtn'>View Tweet</button>") ;
    }
    else {
        $("#embedTweetTab").hide();
        $("#embedTweet").hide();
    }
}

/*
 * Function Name:  emphasizeRow
 * Pre-Condition:  Third-party API for indicator was called
 * Post-Condition: Add emphasis class to selected row
 */
function emphasizeRow(currentRow) {
    var td = currentRow.children();
    $('table tr td').removeClass('emphasis');
    td.addClass("emphasis");
}

/*
 * Function Name:  initializeModal
 * Pre-Condition:  Third-party API for indicator was called
 * Post-Condition: Return currentIndicator and currentRow for future reference
 */
function initializeModal(lastIndicator, thisRow) {

    // Fade in modal
    $("#analysisModal").modal({
        fadeDuration: 200
    });

    // Store currentRow and currentIndicator
    currentRow = $(thisRow).closest('tr');
    var data = t.row(currentRow).data();
    currentIndicator = data;

    // If not the same indicator, then empty all analysis divs
    if ((typeof lastIndicator != "undefined") && (lastIndicator != currentIndicator)) {
      // clear out other divs
      $('#analysisModal>.tab-content>div>.tresults').empty();
      $('#analysisModal>.tab-content>div>.vresults').empty();
      $('#analysisModal>.tab-content>div>.oresults').empty();
      $('#analysisModal>.tab-content>div>.embedTweetContent').empty();

    }
    return {currentIndicator: currentIndicator, currentRow: currentRow};
}

/*
 * Function Name:  loadEmbeddedTweet
 * Pre-Condition:  Embedded tweet HTML contained in JSON response
 * Post-Condition: Load embedded tweet HTML in .embedTweetContent
 */
function loadEmbeddedTweet(json){

    // Hide loading indicator and load content
    $(".etloading").hide();
    generate('success', "Tweet successfully loaded.");
    $("#analysisModal>.tab-content>div>.embedTweetContent").html(json.html);
    $(".twitter-tweet-rendered").contents().find(".EmbeddedTweet").attr("style", "max-width:90% !important;");
    $(".twitter-tweet-rendered").contents().find(".EmbeddedTweet").attr("style", "display: none !important;");

    return;
}

/*
 * Function Name:  getEmbeddedTweet
 * Pre-Condition:  indicator is a Twitter sourced indicator
 * Post-Condition: AJAX response to Twitter for embedded tweet
 */
function getEmbeddedTweet(indicator) {

    // Show loading indicator
    $(".etloading").show();

    // Parse numeric tweet ID
    var tweetIDregex = /https:\/\/twitter.com\/statuses\/(\d*)/;
    var id = indicator.context.match(tweetIDregex)[1];

    // Attempt to load Tweet
    var getEmbedCall = "https://api.twitter.com/1/statuses/oembed.json?id=" + id;
    $.ajax({
        type: 'GET',
        dataType: "jsonp",
        url: getEmbedCall,
        jsonpCallback: "loadEmbeddedTweet",
        error: AJAXerrorHandler
    });

    return;
}

/*
 * Function Name:  loadTwitterWidgets
 * Pre-Condition:  Document loaded
 * Post-Condition: Load Twitter widget script code
 */
function loadTwitterWidget() {
    window.twttr = (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0],
      t = window.twttr || {};
      if (d.getElementById(id)) return t;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);

      t._e = [];
      t.ready = function(f) {
        t._e.push(f);
      };

      return t;
    }(document, "script", "twitter-wjs"));
}
