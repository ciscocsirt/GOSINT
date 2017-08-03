<?php
    require('inc/php/header.php');
?>

<!-- Pre-Processing wrapper row begin -->
<div class="row">

    <!-- Pre-Processing wrapper column begin -->
    <div class="col-lg-12">

        <h1>Pre-Processing</h1>
        <p>Indicators that have been scraped by GOSINT are available for processing here.</p>

        <!-- Populate APInotices div if APIs are not set up -->
        <div class="alert alert-info" id="APInotices"></div>

        <!-- Loading animation begin -->
        <div class="taloading">
          <div class="spinnerLoader">
            <div class="cube1"></div>
            <div class="cube2"></div>
          </div>
          <p class="loadingInfo">Loading indicators...</p>
        </div>
        <!-- Loading animation end -->

        <!-- No indicator notice begin -->
        <div class="hidden noindicators">
          <p class="loadingInfo">No indicators found!<br/>Configure the Twitter parser or set up feeds in the <a href="settings.php">Settings</a><br/>to allow GOSINT to begin scraping for indicators from the Internet.</p>
        </div>
        <!-- No indicator notice end -->

        <!-- DataTables structure begin -->
        <table id="preTable" class="hidden table table-striped display" style="width:100%;">

          <!-- Column width definitions begin -->
          <colgroup>
              <col span="1" style="width: 13%;">
              <col span="1" style="width: 20%;">
              <col span="1" style="width: 8%;">
              <col span="1" style="width: 15%;">
              <col span="1" style="width: 20%;">
              <col span="1" style="width: 12%;">
              <col span="1" style="width: 7%;">
              <col span="1" style="width: 5%;">
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
              <th class="actionsCol">actions</th>
              <th class="movingCol">move</th>
            </tr>
          </thead>
          <!-- Column headers end -->

          <!-- Indicators loaded begin -->
          <tbody>
          </tbody>
          <!-- Indicators loaded end -->

          <!-- Column footers -->
          <tfoot>
            <tr>
              <th>guid</th>
              <th>date</th>
              <th>indicator</th>
              <th>type</th>
              <th>source</th>
              <th>context</th>
              <th>tags</th>
              <th>actions</th>
              <th>move</th>
            </tr>
          </tfoot>
          <!-- Column footers end -->

        </table>
        <!-- DataTables structure end -->

        <!-- Buttons for bulk operations begin -->
        <div class="row hidden bulk">
            <button class="btn btn-primary" id="bulkMovePost">Bulk Move to Post-Processing</button>
        </div>
        <div class="row hidden bulk">
            <button class="btn btn-primary" id="bulkDelete">Bulk Delete</button>
        </div>
        <!-- Buttons for bulk operations end -->

        <!-- Analysis modal begin -->
        <div id="analysisModal" class="modal" style="display:none" >

          <!-- Tabs navigation begin -->
          <ul class="nav nav-tabs">
            <li id="embedTweetTab"><a data-toggle="tab" href="#embedTweet">View Tweet</a></li>
            <li id="umbrellaTab"><a data-toggle="tab" href="#oanalysis">Umbrella</a></li>
            <li id="threatCrowdTab" ><a data-toggle="tab" href="#tanalysis">ThreatCrowd</a></li>
            <li id="virusTotalTab"><a data-toggle="tab" href="#vanalysis">VirusTotal</a></li>
            <li id="everythingTab"><a data-toggle="tab" href="#eanalysis">Everything</a></li>
          </ul>
          <!-- Tabs navigation end -->

          <!-- Tabs content begin -->
          <div class="tab-content">

              <!-- Buttons for indicator operations begin -->
              <div id="moveButtons">
                <a href="#"  rel="modal:close">
                  <button class='btn btn-warning deleteind' aria-label='Delete' title='Delete Indicator'>
                    <span class='glyphicon glyphicon-remove' aria-hidden='true'></span>
                  </button>
                </a>
                <a href="#"  rel="modal:close">
                  <button class='btn btn-success postind' aria-label='Post-Processing' title='Move to Post-Processing'>
                    <span class='glyphicon glyphicon-arrow-right' aria-hidden='true'></span>
                  </button>
                </a>
                <a href="#"  rel="modal:close">
                  <button class='btn btn-primary bulkmove' aria-label='Bulk Move' title='Bulk Move'>
                    <span class='glyphicon glyphicon-th-list' aria-hidden='true'></span>
                  </button>
                </a>
              </div>
              <!-- Buttons for indicator operations end -->

              <!-- Embedded Tweet tab begin -->
              <div id="embedTweet" class="hidden tab-pane fade">
                <div class="hidden etloading">
                  <div class="spinnerLoader">
                    <div class="cube1"></div>
                    <div class="cube2"></div>
                  </div>
                </div>
                <div class="embedTweetContent"></div>
              </div>
              <!-- Embedded Tweet tab end -->

              <!-- Cisco Umbrella tab begin -->
              <div id="oanalysis" class="tab-pane fade">
                <div class="hidden oloading">
                  <div class="spinnerLoader">
                    <div class="cube1"></div>
                    <div class="cube2"></div>
                  </div>
                </div>
                <div class="oresults"></div>
              </div>
              <!-- Cisco Umbrella tab end -->

              <!-- ThreatCrowd tab begin -->
              <div id="tanalysis" class="tab-pane fade">
                <div class="hidden tloading">
                  <div class="spinnerLoader">
                    <div class="cube1"></div>
                    <div class="cube2"></div>
                  </div>
                </div>
                <div class="tresults"></div>
              </div>
              <!-- ThreatCrowd tab end -->

              <!-- VirusTotal tab begin -->
              <div id="vanalysis" class="tab-pane fade">
                <div class="hidden vloading">
                  <div class="spinnerLoader">
                    <div class="cube1"></div>
                    <div class="cube2"></div>
                  </div>
                </div>
                <div class="vresults"></div>
              </div>
              <!-- VirusTotal tab end -->

              <!-- Everything tab begin -->
              <div id="eanalysis" class="tab-pane fade">

                <!-- Tweet content begin -->
                <div class="hidden etloading">
                  <div class="spinnerLoader">
                    <div class="cube1"></div>
                    <div class="cube2"></div>
                  </div>
                </div>
                <div class="embedTweetContent"></div>
                <!-- Tweet content end -->

                <!-- Cisco Umbrella content begin -->
                <div class="hidden oloading">
                  <div class="spinnerLoader">
                    <div class="cube1"></div>
                    <div class="cube2"></div>
                  </div>
                </div>
                <div class="oresults"></div>
                <!-- Cisco Umbrella content end -->

                <!-- ThreatCrowd content begin -->
                <div class="hidden tloading">
                  <div class="spinnerLoader">
                    <div class="cube1"></div>
                    <div class="cube2"></div>
                  </div>
                </div>
                <div class="tresults"></div>
                <!-- ThreatCrowd content end -->

                <!-- VirusTotal content begin -->
                <div class="hidden vloading">
                  <div class="spinnerLoader">
                    <div class="cube1"></div>
                    <div class="cube2"></div>
                  </div>
                </div>
                <div class="vresults"></div>
                <!-- VirusTotal content end -->

              </div>
              <!-- Everything tab end -->

          </div>
          <!-- Tabs content end -->

        </div>
        <!-- Everything tab begin -->

    </div>
    <!-- Pre-Processing wrapper column end -->

</div>
<!-- Pre-Processing wrapper row end -->

<!-- Load Javascripts begin -->
<script src="inc/js/dataTables/jquery.dataTables.js"></script>
<script src="inc/js/general/bootstrap-tokenfield.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.4/moment.min.js"></script>
<script>if(typeof(moment) === 'undefined') {console.log("local"); document.write('<script src="/inc/js/dataTables/moment.min.js"><\/script>')};</script>

<script src="inc/js/dataTables/dataTables-plugins.js"></script>
<script src="inc/js/general/tags.js"></script>
<script src="inc/js/preProcessing/preProcessing.js"></script>
<script src="inc/js/general/jquery.noty.packaged.min.js"></script>
<script src="inc/js/general/jquery.modal.min.js"></script>
<!-- Load Javascripts end -->

<!-- Load stylesheets begin -->
<link rel="stylesheet" property="stylesheet" href="inc/css/animate.css">
<link rel="stylesheet" href="inc/css/bootstrap-tokenfield.min.css" />
<link rel="stylesheet" property="stylesheet" href="inc/css/jquery.modal.min.css">
<!-- Load stylesheets end -->

<?php
  require('inc/php/footer.php');
?>
