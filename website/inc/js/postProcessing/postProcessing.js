// BASEURL and AJAXerrorHandler function defined in inc/js/general/generate.js

// GlobalTable variable
var t = "";

// Set up table
$(document).ready(function() {

    // AJAX request to API endpoint to get data
    $.ajax({
        type: 'GET',
        url: BASEURL + "/post/",
        success: function( data) {
            // API endpoint returned data
            successLoad(data);
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

    // Delete Pre-Proecessing indicator trigger
    $( "#postTable" ).on('click','.deleteind', function() {
      var tr = $(this).closest('tr');
      var data = t.row(tr).data();

      deleteIndicator(data, tr);
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
    $("#postTable").fadeIn(500);
    $(".tloading").hide();
}

/*
 * Function Name:  getIndicators
 * Pre-Condition:  data contains response from API endpoint with fixed timestamps
 * Post-Condition: DataTable loaded based on response
 */
function getIndicators(data) {

    t = $('#postTable').DataTable( {
        "data": data.data,
        "language": {
            "emptyTable": "No indicators found!",
        },
        // Disable searching and sorting on actions column
        "columnDefs": [
          {
            "targets": 0,
            "data": "date",
            "render": function(data, type, row){
                // Parse date as UTC string and output appropriately
                return moment(data).utc().format( 'ddd DD MMM YYYY HH:mm:ss');
            },
            "type": "moment-js-date"
          },
          {
            "targets": 1,
            "data": "indicator"
          },
          {
            "targets": 2,
            "data": "type"
          },
          {
            "targets": 3,
            "data": "source"
          },
          {
            "targets": 4,
            "data": "context",
            "render": function (data, type, row) {
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
            "targets": 5,
            "data": "tags"
          },
          {
              "targets": 'deleteCol',
              "data": null,
              "defaultContent": "<button class='btn btn-warning deleteind' aria-label='Delete'> \
                                                  <span class='glyphicon glyphicon-remove' aria-hidden='true'></span> </button> ",
              "sorting": false,
              "orderable": false,
              "type": "html"
          }
        ],
        'order': [[0, 'desc']],
        "rowCallback": function( row, data, dataIndex ) {

          var currentIndicator = data;

          $("td:eq(5)", row).html("<input class='tag-tokens' id='" + data.guid + "'></input>");

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
                insertTags(currentIndicator, e.attrs.value);

            })
            .on('tokenfield:removedtoken', function (e) {
                removeTags(currentIndicator, e.attrs.value);

            })
            .tokenfield({tokens: data.tags});
          }

          else {

            $("td:eq(5) input", row).on('tokenfield:createtoken', function (e) {

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
                insertTags(currentIndicator, e.attrs.value);
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
          "columns": [0,1,2,3,4],
          "confirmationButton": {
              "confirmCss": 'my-confirm-class',
              "cancelCss": 'my-cancel-class'
          },
          "inputTypes": [
              {
                  "column":0,
                  "type":"text",
                  "options":null
              },
              {
                  "column":1,
                  "type":"text",
                  "options":null
              },
              {
                  "column":2,
                  "type": "list",
                  "options":[
                      { "value": "domain", "display": "domain" },
                      { "value": "ip", "display": "ip" },
                      { "value": "url", "display": "url" }
                  ]
              },
              {
                  "column":3,
                  "type":"text",
                  "options":null
              },
              {
                  "column":4,
                  "type":"text",
                  "options":null
              }
          ]
      });
}

// Called on edit of table cell
/*
 * Function Name:  editTableCell
 * Pre-Condition:  A cell within our DataTable has just been edited
 * Post-Condition: Submit edited changes to backend and reflect in frontend
 */
function editTableCell(updatedCell, updatedRow, oldValue) {
    // add some validation...
    generate("information", "Updating indicator "+updatedRow.data().indicator+" with new data.");
    // updatedRow.data().tags = updatedRow.data().tags.split(",");
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
 * Function Name:  deleteIndicator
 * Pre-Condition:  Delete button clicked via modal or table
 * Post-Condition: Send DELETE request to API endpoint and remove from front-end
 */
function deleteIndicator(indicator, currentRow) {

    generate("information", "Deleting indicator "+indicator.indicator+".");
    var deletethis = BASEURL+"/post/"+indicator.guid;
    $.ajax({
        type: 'DELETE',
        url: deletethis,
        success: function(result) {
            generate("success", "Successfully deleted indicator.");
            t.row(currentRow).remove().draw();
        },
        error: AJAXerrorHandler
    });
}

/*
 * Function Name:  validateWordOrSpaceClass
 * Pre-Condition:  User has input a tag or edited a field in an indicator's column
 * Post-Condition: Return true if parameter contains only characters in \w or \s class
 *                 Otherwise return false
 */
function validateWordOrSpaceClass(token) {
    return (/^([\w\s]+)$/).test(token);
}

/*
 * Function Name:  insertTags
 * Pre-Condition:  Tag has been inserted by user, or by system on loading of page
 * Post-Condition: No action if by page, update indicator if by user
 */
function insertTags(indicator, token) {

    // this function was called by page loading the indicator - take no action
    if (findIndex(token, indicator.tags) != -1) {
        return;
    }

    // function called by user adding tag
    else {
        indicator.tags.push(token);

        // post to endpoint here
        generate("information", "Updating indicator "+indicator.indicator+" with new tag.");

        $.ajax({
            type: 'PUT',
            url: BASEURL + "/post/",
            data: JSON.stringify(indicator),
            success: function( data){
                generate("success", "Successfully updated indicator "+indicator.indicator+".");
              },
            error: AJAXerrorHandler
        });
    }
}

/*
 * Function Name:  removeTags
 * Pre-Condition:  Tag has been removed by user
 * Post-Condition: Update indicator in backend
 */
function removeTags(indicator, token) {

    // post to endpoint
    generate("information", "Updating indicator "+indicator.indicator+" removing tag "+token+".");

    // find index and remove tag from
    var index = findIndex(token, indicator.tags);
    if (index > -1) {
        indicator.tags.splice(index, 1);

        $.ajax({
          type: 'PUT',
          url: BASEURL + "/post/",
          data: JSON.stringify(indicator),
          success: function( data){
            generate("success", "Successfully updated indicator "+indicator.indicator+".");
          },
          error: AJAXerrorHandler
        });
    }
    else {
      console.log ("unexpected error");
    }
}

/*
 * Function Name:  findIndex
 * Pre-Condition:  needle is a value we are trying to locate
 * Post-Condition: Return index if we find it in element, else return -1
 */
function findIndex(needle, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == needle) {
            return i;
        }
    }
    return -1;
}
