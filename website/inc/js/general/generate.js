/*
 * Function Name:  generate
 * Pre-Condition:  Type is one of (success, information, error, warning)
 * Post-Condition: Display notification on front end with specified config
 */
function generate(type, text) {

    var n = noty({
        text        : text,
        type        : type,
        dismissQueue: true,
        layout      : 'topRight',
        closeWith   : ['click'],
        theme       : 'relax',
        timeout     : 3000,
        maxVisible  : 10,
        animation   : {
            open  : 'animated bounceInRight',
            close : 'animated bounceOutRight',
            easing: 'swing',
            speed : 500
        }
    });
}

/*
 * Function Name:  AJAXerrorHandler
 * Pre-Condition:  Some functionality on our site has triggered this error
 * Post-Condition: Display error notification and hide loading (for pre-processing and ad-hoc)
 */
function AJAXerrorHandler (request, status, error) {
    generate("error", "Error in making AJAX request. Check console for details.");
    console.log(request);
    console.log(status);
    console.log(error);
    $(".oloading").hide();
    $(".tloading").hide();
    $(".vloading").hide();
    $(".ahloading").hide();
}

// Set BASEURL for API calls

// Prod

var BASEURL = window.location.protocol + "//" + window.location.hostname;

// Does GOSINT run on a port?
var port = window.location.port;
if (port !== "") {
    BASEURL += ":" + port;
}

// Is GOSINT being run in a directory?
var path = window.location.pathname;
var dir = path.substring(0, path.lastIndexOf('/'));
if (dir !== "") {
    BASEURL += dir;
}

BASEURL += "/api";
