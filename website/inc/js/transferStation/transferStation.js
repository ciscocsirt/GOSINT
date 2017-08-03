/*
 * A saveAs() FileSaver implementation.
 * 1.3.2
 * 2016-06-16 18:25:19
 *
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */
var saveAs=saveAs||function(e){"use strict";if(typeof e==="undefined"||typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=t.createElementNS("http://www.w3.org/1999/xhtml","a"),o="download"in r,a=function(e){var t=new MouseEvent("click");e.dispatchEvent(t)},i=/constructor/i.test(e.HTMLElement)||e.safari,f=/CriOS\/[\d]+/.test(navigator.userAgent),u=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},s="application/octet-stream",d=1e3*40,c=function(e){var t=function(){if(typeof e==="string"){n().revokeObjectURL(e)}else{e.remove()}};setTimeout(t,d)},l=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var o=e["on"+t[r]];if(typeof o==="function"){try{o.call(e,n||e)}catch(a){u(a)}}}},p=function(e){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)){return new Blob([String.fromCharCode(65279),e],{type:e.type})}return e},v=function(t,u,d){if(!d){t=p(t)}var v=this,w=t.type,m=w===s,y,h=function(){l(v,"writestart progress write writeend".split(" "))},S=function(){if((f||m&&i)&&e.FileReader){var r=new FileReader;r.onloadend=function(){var t=f?r.result:r.result.replace(/^data:[^;]*;/,"data:attachment/file;");var n=e.open(t,"_blank");if(!n)e.location.href=t;t=undefined;v.readyState=v.DONE;h()};r.readAsDataURL(t);v.readyState=v.INIT;return}if(!y){y=n().createObjectURL(t)}if(m){e.location.href=y}else{var o=e.open(y,"_blank");if(!o){e.location.href=y}}v.readyState=v.DONE;h();c(y)};v.readyState=v.INIT;if(o){y=n().createObjectURL(t);setTimeout(function(){r.href=y;r.download=u;a(r);h();c(y);v.readyState=v.DONE});return}S()},w=v.prototype,m=function(e,t,n){return new v(e,t||e.name||"download",n)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(e,t,n){t=t||e.name||"download";if(!n){e=p(e)}return navigator.msSaveOrOpenBlob(e,t)}}w.abort=function(){};w.readyState=w.INIT=0;w.WRITING=1;w.DONE=2;w.error=w.onwritestart=w.onprogress=w.onwrite=w.onabort=w.onerror=w.onwriteend=null;return m}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!==null){define("FileSaver.js",function(){return saveAs})}

// BASEURL and AJAXerrorHandler function defined in inc/js/general/generate.js

$(document).ready(function (){

  var selectedRows = [];

    $.ajax({
        type: 'GET',
        url: BASEURL + "/post/",
        success: function( data) {
            // API endpoint returned data
            successLoad(data);
            $(".noindicators").hide();
        },
        error: function (request, status, error) {
            if (error == "Not Found") {
                // API endpoint returned Not Found, indicating no indicators present
                $(".noindicators").fadeIn(500);
                $(".tloading").hide();
            }
            else {
                // Some other error, probably connection related
                AJAXerrorHandler(request, status, error);
            }
        }
    });

   // On click of row, add or remove data from selectedRows array
   // and toggle highlight on cells in row
   $( "#transferStation" ).on('click','tr', function() {

       var tr = $(this).closest('tr');
       var data = t.row(tr).data();

       // Check if click was against top row, do nothing
       if (data == null ) {
          return;
       }

       var td = tr.children();
       td.toggleClass("rowhighlight");
       tr.toggleClass("tselected");

       addOrRemove(selectedRows, data);

       $('#countSelected').text(selectedRows.length);
   });

    // Handle form submission event
    $('#transferSubmit').on('click', function(e){

        var arr = selectedRows;
        var format = $( "#format" ).val();
        var guids = [];

        if (arr.length == 0) {
            generate("error", "ERROR: At least one item must be selected for export.");
        }
        else if (format == "csv") {
            generate("information", "Preparing CSV for export.");

            csvJSON = buildJSON(arr, format);

            CSVCreator(csvJSON);
        }
        else if (format == "crits") {
            generate("information", "Preparing CRiTs for export.");

            critsJSON = buildJSON(arr, format);

            CRITSCreator(critsJSON);
        }

        // Support for other formats will go here (TAXII, etc)

        // Deselect rows and remove indicators from view
        for (var i = 0; i < arr.length; i++) {
            deleteIndicator(arr[i].guid);
        }
        t.rows('.tselected').remove().draw();

        // Clear out selectedRows variables
        selectedRows.length = 0;
        $('#countSelected').text("0");

        // Prevent actual form submission
        e.preventDefault();
    });
});

/*
 * Function Name:  successLoad
 * Pre-Condition:  Indicators have been loaded via API endpoint
 * Post-Condition: DataTables structure shown to user
 */
function successLoad(data) {
    getIndicators(data);
    $(".hidden").fadeIn(500);
    $(".tloading").hide();
}

/*
 * Function Name:  getIndicators
 * Pre-Condition:  Indicators have been loaded via API endpoint
 * Post-Condition: DataTables structure configured
 */
function getIndicators(data) {

  t = $('#transferStation').DataTable( {

    "data": data.data,
    "language": {
        "emptyTable": "No indicators found!",
    },
    'columnDefs': [
      {
         'targets': 0,
         "data": 'guid',
         "visible": false,
      },
      {
         'targets': 1,
         "data": "date",
         "render": function(data, type, row){
             // Parse date as UTC string and output appropriately
             return moment(data).utc().format( 'ddd DD MMM YYYY HH:mm:ss');
         },
         "type": "moment-js-date"
      },
      {
         'targets': 2,
         "data": "indicator"
      },
      {
         'targets': 3,
         "data": "type"
      },
      {
         'targets': 4,
         "data": "source"
      },
      {
         'targets': 5,
         "data": "context"
      },
      {
         'targets': 6,
         "data": "tags"
      }
     ],
     'order': [[1, 'desc']],
     "rowCallback": function( row, data, dataIndex ) {

       var currentIndicator = data;

       $("td:eq(5)", row).html("<input class='tag-tokens' id='" + data.guid + "'></input>");
         // Place a trigger function on createdToken. This will loop through
         // all tags if the indicator already has tags assigned
        $("td:eq(5) input", row).tokenfield({tokens: data.tags});

        // Disable tag input field so user is unable to edit the tags
        $("td:eq(5) input", row).tokenfield('disable');
      }
 });
}

/*
 * Function Name:  buildJSON
 * Pre-Condition:  mydata is formatted in an expected manner
 * Post-Condition: Start download of CSV
 */
function buildJSON(arr, format) {
    // Build JSON for CSV API call
    csvObj = new Object();
    records = [];
    for (var i = 0; i < arr.length; i++) {
        indObj = new Object();
        indObj.guid = arr[i].guid;
        records.push(indObj);
    }
    csvObj.format = format;
    csvObj.records = records;

    csvJSON = JSON.stringify(csvObj);
    return csvJSON;
}

/*
 * Function Name:  CSVCreator
 * Pre-Condition:  mydata is formatted in an expected manner
 * Post-Condition: Start download of CSV
 */
function CSVCreator(mydata) {
    $.ajax({
        type: 'POST',
        url: BASEURL + "/post/csv/",
        data: mydata,
        success: function( data){

            // Here is where we want to iterate through the data in order
            // to replace the UNIX timestamp with the ISO timestamp
            var blob = new Blob([data], {type: "text/csv;charset=utf-8"});
            var today = new Date();
            var dd = today.getDate();
            var mm = (today.toLocaleString('en-us', { month: "short" }));
            var yyyy = today.getUTCFullYear();
            var hh = today.getUTCHours();
            var min = today.getUTCMinutes();
            var ss = today.getUTCSeconds();

            // Standardize output filename
            if(dd<10) {
              dd='0'+dd;
            }
            if(min<10) {
              min='0'+min;
            }
            if(hh<10) {
              hh='0'+hh;
            }
            if(ss<10) {
              ss='0'+ss;
            }

            today = mm+'-'+dd+'-'+yyyy;
            time = hh+'-'+min+'-'+ss;
            saveAs(blob, "transfer-"+today+"-"+time+"-UTC.csv");
            generate("success", "CSV successfully generated and downloaded.");

          },
        error: AJAXerrorHandler
    });
}

/*
 * Function Name:  CRITsCreator
 * Pre-Condition:  mydata is formatted in an expected manner
 * Post-Condition: Start export of CRITs
 */
function CRITSCreator(mydata) {
  $.ajax({
        type: 'POST',
        url: BASEURL + "/post/crits/",
        data: mydata,
        success: function( data){
            generate("success", "Indicators were successfully sent to CRiTs.");
          },
        error: AJAXerrorHandler
    });
}

/*
 * Function Name:  deleteIndicator
 * Pre-Condition:  guid is a valid ID referring to indicator that has been transferred
 * Post-Condition: Remove indicator from post-processing and transfer station
 */
function deleteIndicator(guid) {
    var deletethis = BASEURL+"/post/"+guid;
    $.ajax({
        type: 'DELETE',
        url: deletethis,
        success: function( data){
            console.log(guid);
          },
        error: AJAXerrorHandler
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
        array.push(value);
    }
    else {
        array.splice(index, 1);
    }
}
