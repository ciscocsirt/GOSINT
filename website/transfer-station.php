<?php
  require('inc/php/header.php');
?>

<!-- Transfer Station wrapper row begin -->
<div class="row">

    <!-- Transfer Station wrapper column begin -->
    <div class="col-lg-12">

        <!-- Intro paragraph begin -->
        <h1>Transfer Station</h1>
        <p>Export indicators in the post-processing stage here.</p>
        <p>Available export mechanisms:</p>
        <ul>
          <li><strong>CSV</strong>: Comma-separated-value file that can be used to import indicators into third-party tools.</li>
          <li><strong>CRITs</strong>: Automated export of indicators into CRITs via CRITs API.</li>
        </ul>
        <!-- Intro paragraph end -->

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

        <!-- DataTables Structure begin -->
        <table id="transferStation" class="hidden table table-striped display" style="width:100%;">

          <!-- Column width definitions begin -->
          <colgroup>
              <col span="1" style="width: 13%;">
              <col span="1" style="width: 24%;">
              <col span="1" style="width: 11%;">
              <col span="1" style="width: 18%;">
              <col span="1" style="width: 21%;">
              <col span="1" style="width: 13%;">
          </colgroup>
          <!-- Column width definitions end -->

          <!-- Column headers begin -->
          <thead>
            <tr>
              <th>guid</th>
              <th>date</th>
              <th>indicator</th>
              <th>type</th>
              <th>source</th>
              <th>context</th>
              <th>tags</th>
            </tr>
          </thead>
          <!-- Column headers end -->

          <!-- Indicators loaded begin -->
          <tbody>
          </tbody>
          <!-- Indicators loaded end -->

          <!-- Column footers begin -->
          <tfoot>
            <tr>
              <th>guid</th>
              <th>date</th>
              <th>indicator</th>
              <th>type</th>
              <th>source</th>
              <th>context</th>
              <th>tags</th>
            </tr>
          </tfoot>
          <!-- Column footers end -->

        </table>
        <!-- DataTables Structure end -->

        <p class="hidden"><span id="countSelected">0</span> indicators selected</p>

        <!-- Buttons for bulk operations begin -->
        <div class="row hidden bulk">
            <button class="btn btn-primary" id="selectAll">Select All on Current Page</button>
        </div>
        <!-- Buttons for bulk operations end -->

        <!-- Export Indicators selection begin -->
        <div id="exportIndicators" class="hidden">

          <!-- Output Format selection begin -->
          <div class="row">
            <div class="form-group col-xs-2">
                <label for="outputFormat">Output Format</label>
                <select class="form-control" id="format" name="format">
                  <option value="csv">CSV</option>
                  <option value="crits">CRITS</option>
                </select>
            </div>
          </div>
          <!-- Output Format selection end -->

          <!-- Export button begin -->
          <div class="row">
            <div class="form-group col-xs-2">
                <button id="transferSubmit" class="btn btn-primary">Submit</button>
            </div>
          </div>
          <!-- Export button end -->

        </div>
        <!-- Export Indicators selection end -->

    </div>
    <!-- Transfer Station wrapper column end -->

</div>
<!-- Transfer Station wrapper row begin -->

<!-- Load Javascripts begin -->
<script src="inc/js/dataTables/jquery.dataTables.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.4/moment.min.js"></script>
<script src="inc/js/general/bootstrap-tokenfield.js"></script>
<script>if(typeof(moment) === 'undefined') {console.log("local"); document.write('<script src="/inc/js/dataTables/moment.min.js"><\/script>')};</script>
<script src="inc/js/dataTables/dataTables-plugins.js"></script>
<script src="inc/js/general/jquery.noty.packaged.min.js"></script>
<script src="inc/js/transferStation/transferStation.js"></script>

<!-- Load stylesheets begin -->
<link rel="stylesheet" href="inc/css/bootstrap-tokenfield.min.css" />
<link rel="stylesheet" href="inc/css/animate.css">
<!-- Load stylesheets end -->

<?php
  require('inc/php/footer.php');
?>
