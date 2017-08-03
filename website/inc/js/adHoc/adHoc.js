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
