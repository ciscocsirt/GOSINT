// BASEURL and AJAXerrorHandler function defined in inc/js/general/generate.js

// On document load
$(function() {

    // If user entering text in general text field, disable URL, and vice versa
    $("#generaltext").change(function (){
      $("#url").prop('disabled', true);
      if ($("#generaltext").val() == "") {
          $("#url").prop('disabled', false);
      }
    });

		$("#url").change(function (){
		    $("#generaltext").prop('disabled', true);
        if ($("#url").val() == "") {
          $("#generaltext").prop('disabled', false);
        }
    });

    $('#generaltext').tooltip({'trigger':'hover', 'title': 'General body of text to parse for new indicators'});
    $('#url').tooltip({'trigger':'hover', 'title': 'URL to parse for new indicators'});
    $('#context').tooltip({'trigger':'hover', 'title': 'Context to be associated with each new indicator generated'});

    $('#typeWrap').tooltip({'trigger':'hover', 'title': 'Type of indicator to investigate. Select "Smart" for GOSINT to auto-detect the type'});
    $('#indicatorWrap').tooltip({'trigger':'hover', 'title': 'Indicator to investigate'});

    $('#calltcAPI').tooltip({'trigger':'hover', 'title': 'Call ThreatCrowd API'});
    $('#callvtAPI').tooltip({'trigger':'hover', 'title': 'Call VirusTotal API'});
    $('#callumAPI').tooltip({'trigger':'hover', 'title': 'Call Umbrella API'});
    $('#callevAPI').tooltip({'trigger':'hover', 'title': 'Call All Available APIs'});

    // Hide analysis div on document load
    $("#analysis").hide();

    var enabledAPIs = {"virustotal": "false", "threatcrowd": "true", "umbrella": "false"};

    // Call Settings page to determine what APIs are enabled
    $.ajax({
        type: 'GET',
        async: false,
        url: BASEURL + "/settings/",
        success: function(data) {
            var apiButtons = buildAPIButtons(data, enabledAPIs);
            $("#buttonsAPI").html(apiButtons);
        },
            error: AJAXerrorHandler
    });

    // Threatcrowd click handler
    $('#calltcAPI').click(function() {
        var ind = $('#indicator').val();
        var indType = $("#indType option:selected").val();
        var result = sanitizeIndicator(ind, indType);
        if (!result) {
            return;
        }
        updateDisplay("#tanalysis", "#threatCrowdTab");
        $("#analysis").fadeIn(500);
        callThreatcrowd(result.ind, result.indType);
    });

    // Virustotal click handler
    $('#callvtAPI').click(function() {
        var ind = $('#indicator').val();
        var indType = $("#indType option:selected").val();
        var result = sanitizeIndicator(ind, indType);
        if (!result) {
            return;
        }
        updateDisplay("#vanalysis", "#virusTotalTab");
        $("#analysis").fadeIn(500);
        callVirustotal(result.ind, result.indType);
    });

    // Umbrella click handler
    $('#callumAPI').click(function() {
        var ind = $('#indicator').val();
        var indType = $("#indType option:selected").val();
        var result = sanitizeIndicator(ind, indType);
        if (!result) {
            return;
        }
        updateDisplay("#uanalysis", "#umbrellaTab");
        $("#analysis").fadeIn(500);
        callCiscoUmbrella(result.ind, result.indType);
    });

    // Everything click handler
    $('#callevAPI').click(function() {
        var ind = $('#indicator').val();
        var indType = $("#indType option:selected").val();
        var result = sanitizeIndicator(ind, indType);
        if (!result) {
            return;
        }
        updateDisplay("#eanalysis", "#everythingTab");
        $("#analysis").fadeIn(500);
        callEverything(result.ind, result.indType, enabledAPIs);
    });

    // Display loading icon while form submits
    $(document).on("click", "#adHocSubmit", function(){

        $(".ahloading").show();

        // Get values from form
        var url = $.trim($("#url").val());
        var generaltext = $.trim($("#generaltext").val());
        var context = $.trim($("#context").val());
        var mydata = "";

        // If general text was filled, replace all new lines to avoid problems in backend
        if (generaltext !== "") {
            generaltext = generaltext.replace(/(\r\n|\n|\r)/gm," ");
        }

        // Basic validation
        if (url === "" && generaltext === "") {
            generate("error", "At least one of URL or General Text must be filled in.");
            $(".ahloading").hide();
            return;
        }
        else if (context === "" ) {
            generate("error", "Context must have be a valid value.");
            $(".ahloading").hide();
            return;
        }
        else if (url !== "") {
            generate("information", "Attempting to pull ad hoc indicators from "+url+" with context "+context+".");
            mydata ='{"resource": "'+ url +'", "context": "'+ context +'"}';
        }
        else {
            generate("information", "Attempting to pull ad hoc indicators from provided general text with context "+context+".");
            mydata = '{"texttoparse": "'+ generaltext +'", "context": "'+ context +'"}'
        }

        // POST data to endpoint
        $.ajax({
            type: 'POST',
            url: BASEURL + "/adhoc/",
            data: mydata,
            beforeSend: function () {
                generate("information", "Submitting request to endpoint.");
            },
            success: function( data){
                generate("success", "Ad Hoc indicators successfully added into pre-processing.");

                // Reset form
                $(".ahloading").hide();
                $("#url").val("");
                $("#context").val("");
                $("#generaltext").val("");
                $("#url").prop('disabled', false);
                $("#generaltext").prop('disabled', false);
            },
            error: AJAXerrorHandler
        });
    });

});

/*
 * Function Name:  buildAPIButtons
 * Pre-Condition:  Use synchronously loaded settings JSON to determine which APIs are active
 * Post-Condition: HTML for supported APIs returned
 */
function buildAPIButtons(settings, enabledAPIs) {

      // Build HTML string based on if API enabled or not
      var returnStr = "<button class='btn btn-info adhoc-inv' id='calltcAPI'>ThreatCrowd</button>";
      if(settings.vtkey !== "") {
        enabledAPIs.virustotal = "true";
        returnStr += "<button class='btn btn-info adhoc-inv' id='callvtAPI'>VirusTotal</button>";
      }
      if (settings.opendnskey !== "") {
        enabledAPIs.umbrella = "true";
        returnStr = "<button class='btn btn-info adhoc-inv' id='callumAPI'>Umbrella</button>" + returnStr;
      }
      returnStr += "<button class='btn btn-info adhoc-inv' id='callevAPI'>Everything</button>";
      return returnStr;
}

/*
 * Function Name:  callEverything
 * Pre-Condition:  Everything has been called for APIs
 * Post-Condition: Call each API function (VirusTotal, Threatcrowd, CiscoUmbrella)
 */
function callEverything(ind, indType, enabledAPIs) {
    if (enabledAPIs.virustotal === "true") {
        callVirustotal(ind, indType);
    }
    if (enabledAPIs.threatcrowd === "true") {
        callThreatcrowd(ind, indType);
    }
    if (enabledAPIs.umbrella === "true") {
        callCiscoUmbrella(ind, indType);
    }
}

/*
 * Function Name:  sanitizeIndicator
 * Pre-Condition:  User has input an indicator in ad hoc investigate
 * Post-Condition: Generate error if indicator is malformed, otherwise return indicator and type
 */
function sanitizeIndicator(ind, indType) {

  // Blank indicator
  if (ind == "") {
      generate("error", "ERROR: Indicator field is blank");
      return false;
  }

  var domregex = /^((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}$/;
  var urlregex = /^(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})$/;
  var ipregex = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
  var md5regex = /^[a-fA-F0-9]{32}$/;
  var sha1regex = /^[a-fA-F0-9]{40}$/;
  var sha256regex = /^[a-fA-F0-9]{64}$/;

  // Try to auto-determine what the
  if (indType == "smart") {

      // Test for hash
      if (md5regex.test(ind) || sha1regex.test(ind) || sha256regex.test(ind)) {
          generate("information", "Determined the indicator as a hash.");
          return {ind: ind, indType: "hash"};
      }
      else if (ipregex.test(ind)) {
          generate("information", "Determined the indicator as an IP.");
          return {ind: ind, indType: "ip"};
      }
      else if (domregex.test(ind)) {
          generate("information", "Determined the indicator as a domain.");
          return {ind: ind, indType: "domain"};
      }
      else if (urlregex.test(ind)) {
          generate("information", "Determined the indicator as a URL.");
          return {ind: ind, indType: "url"};
      }
      else {
          generate("error", "Unable to determine the type of indicator.");
          return false;
      }
  }

  // Domain check
  if (indType == "domain") {
      if (ind.substring(0, 7) == "http://" || ind.substring(0,8) == "https://") {
          ind = extractDomain(ind);
      }
      if (!domregex.test(ind)) {
          generate("error", "ERROR: Domain is in invalid format.");
          return false;
      }
  }

  // URL check
  else if (indType == "url") {
      if (!urlregex.test(ind)) {
          generate("error", "ERROR: URL is in invalid format. (Did you include http://?)");
          return false;
      }
  }

  // IP check
  else if (indType == "ip") {
      if (!ipregex.test(ind)) {
          generate("error", "ERROR: IP is in invalid format.");
          return false;
      }
  }

  // Hash check
  else if (indType == "hash") {
      if (!md5regex.test(ind) && !sha1regex.test(ind) && !sha256regex.test(ind)) {
          generate("error", "ERROR: Hash is in invalid format.");
          return false;
      }
  }

  return {ind: ind, indType: indType};
}

/*
 * Function Name:  updateDisplay
 * Pre-Condition:  Third-party API for indicator was called
 * Post-Condition: Hide all other tab content, highlight tab, and display move buttons
 */
function updateDisplay(currentDiv, currentTab) {

    // Select current tab as active
    $('#analysis li.active').removeClass('active');
    $('#analysis>.tab-content>div').removeClass('active in');
    $(currentDiv).addClass('active in');
    $(currentTab).addClass('active');

    // Update empty div with more useful text
    if ($('.vresults').text() == '') {
        $('.vresults').html("<p class='notLoadedAdHoc'>VirusTotal data not loaded.</p>") ;
    }
    if ($('.tresults').text() == '') {
        $('.tresults').html("<p class='notLoadedAdHoc'>ThreatCrowd data not loaded.</p>") ;
    }
    if ($('.uresults').text() == '') {
        $('.uresults').html("<p class='notLoadedAdHoc'>Umbrella data not loaded.</p>") ;
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
function callVirustotal(ind, indType) {
    // Set up default paramaters for AJAX calls
    $.ajaxSetup({
        // If error, display error message
        error: AJAXerrorHandler
    });

    // Reset html to blank string
    $(".vresults").html("");

    // Placeholder text for return
    var html_passedback = "<h3 id='virusTotalTitle'>VirusTotal Results for "+ind+'</h3>';
    var url = "";

    // Instantiate div to display and start loading icon
    $(".vloading").show();

    // generate('information', "VirusTotal called for "+ind+".");

    // Identify type of indicator and process differently based on type
    // For IP...
    if (indType === "ip") {

        url = BASEURL + "/vt/ip/" + ind;

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
    else if (indType === "domain") {

      url = BASEURL + "/vt/domain/"+ind;

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
    else if (indType === "url") {

      url = BASEURL + "/vt/url/";
      $.ajax({
          type: 'POST',
          url: url,
          data: '{"resource":"'+ind+'"}',
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
                $("#vtitle").html("<h4>VirusTotal Results for "+ind+'</h4>');
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
    else if (indType === "hash") {

      url = BASEURL + "/vt/hash/" + ind

      $.getJSON( url, function( data ) {
            // No data
            if (data.response_code === 0) {
                html_passedback += "<h4>Hash not found</h4>";
                html_passedback += "<p>VirusTotal does not have this hash in their database. Please try again later.</p>";
            }
            // Parse response
            else {
                $("#vtitle").html("<h4>VirusTotal Results for "+ind+'</h4>');
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
function callThreatcrowd(ind, indType) {

      // Set up default paramaters for AJAX calls
      $.ajaxSetup({
          error: AJAXerrorHandler
      });

      $(".tresults").html("");

      if (indType === "hash") {
          html_passedback = "<h3 id='threatCrowdTitle'>ThreatCrowd Currently Not Supported For Hashes</h3>";
          html_passedback += "<p>ThreatCrowd implementation is still undergoing active development for hashes.</p>";
          $(".tloading").hide();
          $(".tresults").html(html_passedback);
      }

      else {

        var html_passedback = "<h3 id='threatCrowdTitle'>ThreatCrowd Report for "+ind+"</h3>";
        var url = "";

        $(".tloading").show();

        // generate('information', "ThreatCrowd called for "+ind+".");

        // If IP...
        if (indType === "ip") {
            url = "https://www.threatcrowd.org/searchApi/v2/ip/report/?ip="+ind;

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
                      // html_passedback += "<iframe src='http://www.threatcrowd.org/graphHtml.php?ip="+ind+"' frameborder='0' style='height: 100%; width: 100%; min-height: 600px;'></iframe>";

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
        else if (indType === "domain" || indType === "url") {
            url = "https://www.threatcrowd.org/searchApi/v2/domain/report/?domain="+ind;
            if (indType === "url") {
                // Extract domain from URL and submit with domain
                // ThreatCrowd does not accept URL submission on WHOIS request
                url = "https://www.threatcrowd.org/searchApi/v2/domain/report/?domain="+extractDomain(ind);
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
 * Function Name: callCiscoUmbrella
 * Pre-Condition: ind is a well-formatted indicator
 * Post-Condition: html_passedback contains analysis from Cisco Umbrella on the indicator
 */
function callCiscoUmbrella(ind, indType) {

      $.ajaxSetup({
        error: AJAXerrorHandler
      });

      $(".uresults").html("");

      var html_passedback = "<h3 id='umbrellaTitle'>Cisco Umbrella Report for "+ind+"</h3>";
      var url = BASEURL + "/whois/"+ind;

      $(".uloading").html("");

      // generate('information', "Cisco Umbrella called for "+ind+".");

      if (indType === "url") {
          // Extract domain from URL and submit with domain
          // Cisco Umbrella does not accept URL submission on WHOIS request
          url = BASEURL + "/whois/"+extractDomain(ind);
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
        $(".uloading").hide();
        $(".uresults").html(html_passedback);
        generate('success', "Cisco Umbrella data successfully loaded.");
      });

}
