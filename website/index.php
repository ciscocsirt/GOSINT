<!-- Header begin -->
<?php
  require('inc/php/header.php');
?>
<!-- Header end -->

<!-- Intro paragraph begin -->
<div class="row">
    <div class="col-lg-12">
        <h1>Welcome to GOSINT!</h1>
        <p>The GOSINT framework is a project used for collecting, processing, and exporting high quality indicators of compromise (IOCs). GOSINT allows a security analyst to collect and standardize structured and unstructured threat intelligence.</p>
        <p>Applying threat intelligence to security operations enriches alert data with additional confidence, context, and co-occurrence. This means that you apply research from third parties to security event data to identify similar, or identical, indicators of malicious behavior.</p>
    </div>
</div>
<!-- Intro paragraph end -->

<!-- Display charts begin -->
<div class="row">

  <!-- Inner chart column begin -->
  <div class="col-lg-12">

      <h1>Indicator Metrics</h1>
      <p>View a breakdown of the indicators currently loaded into GOSINT below.</p>

      <p class="loadingInfo">Loading metrics...</p>

      <!-- Inner chart div begin -->
      <div class="row">

        <!-- Padding begin -->
        <div class="col-lg-1">
            <span>&nbsp;</span>
        </div>
        <!-- Padding end -->

        <!-- Chart by source begin -->
        <div class="chart-container col-lg-4">
            <div id="perSourceChart"></div>
            <div class="perSourceChartLoader spinnerLoader">
              <div class="cube1"></div>
              <div class="cube2"></div>
            </div>
        </div>
        <!-- Chart by source end -->

        <!-- Padding begin -->
        <div class="col-lg-1">
            <span>&nbsp;</span>
        </div>
        <!-- Padding end -->

        <!-- Chart by type begin -->
        <div class="chart-container col-lg-4">
            <div id="perTypeChart"></div>
            <div class="perTypeChartLoader spinnerLoader">
              <div class="cube1"></div>
              <div class="cube2"></div>
            </div>
        </div>
        <!-- Chart by type end -->

      </div>
      <!-- Inner chart div end -->

  </div>
  <<!-- Inner chart column end -->

</div>
<!-- Display charts end -->


<!-- Load Javascripts begin -->
<script data-require="d3@*" data-semver="3.4.6" src="//cdnjs.cloudflare.com/ajax/libs/d3/3.4.6/d3.min.js"></script>
<script src="inc/js/metrics/metrics.js"></script>
<!-- Load Javascripts end -->

<!-- Footer begin -->
<?php
  require('inc/php/footer.php');
?>
<!-- Footer end -->
