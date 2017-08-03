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
