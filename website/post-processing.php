<?php
  require('inc/php/header.php');
?>

<!-- Post-Processing wrapper row begin -->
<div class="row">

    <!-- Post-Processing wrapper column begin -->
    <div class="col-lg-12">

        <h1>Post-Processing</h1>
        <p>Indicators that have been moved from pre-processing are available for viewing here.</p>

        <!-- Loading animation begin -->
        <div class="tloading">
          <div class="spinnerLoader">
            <div class="cube1"></div>
            <div class="cube2"></div>
          </div>
          <p class="loadingInfo">Loading indicators...</p>
        </div>
        <!-- Loading animation end -->

        <!-- No indicator notice begin -->
        <div class="hidden noindicators">
          <p class="loadingInfo">No indicators found!<br/>Move some from <a href="pre-processing.php">Pre-Processing</a> to view the indicators here.</p>
        </div>
        <!-- No indicator notice end -->

        <!-- DataTables structure begin -->
        <table id="postTable" class="hidden table table-striped display" style="width:100%;">

          <!-- Column width definitions begin -->
          <colgroup>
              <col span="1" style="width: 13%;">
              <col span="1" style="width: 23%;">
              <col span="1" style="width: 10%;">
              <col span="1" style="width: 17%;">
              <col span="1" style="width: 20%;">
              <col span="1" style="width: 12%;">
              <col span="1" style="width: 5%;">
          </colgroup>
          <!-- Column width definitions end -->

          <!-- Column headers begin -->
          <thead>
            <tr>
              <th>date</th>
              <th>indicator</th>
              <th>type</th>
              <th>source</th>
              <th>context</th>
              <th>tags</th>
              <th class="deleteCol">delete</th>
            </tr>
          </thead>
          <!-- Column headers end -->

          <!-- Column footers begin -->
          <tfoot>
              <tr>
                <th>date</th>
                <th>indicator</th>
                <th>type</th>
                <th>source</th>
                <th>context</th>
                <th>tags</th>
                <th>delete</th>
              </tr>
          </tfoot>
          <!-- Column headers end -->

        </table>
        <!-- DataTables structure end -->

    </div>
    <!-- Post-Processing wrapper column end -->

</div>
<!-- Post-Processing wrapper row end -->

<!-- Load Javascripts begin -->
<script src="inc/js/dataTables/jquery.dataTables.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.4/moment.min.js"></script>
<script src="inc/js/general/bootstrap-tokenfield.js"></script>
<script>if(typeof(moment) === 'undefined') {console.log("local"); document.write('<script src="/inc/js/dataTables/moment.min.js"><\/script>')};</script>

<script src="inc/js/dataTables/dataTables-plugins.js"></script>
<script src="inc/js/general/jquery.noty.packaged.min.js"></script>
<script src="inc/js/general/tags.js"></script>
<script src="inc/js/postProcessing/postProcessing.js"></script>
<!-- Load Javascripts end -->

<!-- Load stylesheets begin -->
<link rel="stylesheet" href="inc/css/bootstrap-tokenfield.min.css" />
<link rel="stylesheet" property="stylesheet" href="inc/css/animate.css">
<!-- Load stylesheets end -->

<?php
  require('inc/php/footer.php');
?>
