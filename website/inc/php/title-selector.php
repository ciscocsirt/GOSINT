<?php

      /*
       * Function Name:  contains
       * Pre-Condition:  $needle and $haystack are valid PHP strings
       * Post-Condition: Return True if $needle is present within $haystack, False otherwise
       */
      function contains($needle, $haystack) {
        return strpos($haystack, $needle) !== false;
      }

      /*
       * Function Name:  getTitle
       * Pre-Condition:  None
       * Post-Condition: Return string value containing title of current page user is on
       */
      function getTitle() {
        $page = $_SERVER['PHP_SELF'];

        // Iterate through potential pages
        if (contains('index.php', $page)) {
          $title = 'Dashboard';
        }

        else if (contains('pre-processing.php', $page)) {
          $title = 'Pre-Processing';
        }

        else if (contains('post-processing.php', $page)) {
          $title = 'Post-Processing';
        }

        else if (contains('transfer-station.php', $page)) {
          $title = 'Transfer Station';
        }

        else if (contains('metrics.php', $page)) {
          $title = 'Indicator Metrics';
        }

        else if (contains('settings.php', $page)) {
          $title = 'Settings';
        }

        else if (contains('ad-hoc.php', $page)) {
          $title = 'Ad Hoc Indicators';
        }

        else if (contains('recipe.php', $page)) {
          $title = 'Recipe Manager';
        }

        return $title;

      }
?>
