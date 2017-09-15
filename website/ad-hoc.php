<?php
    require('inc/php/header.php');
?>

<!-- Ad Hoc intro paragraph wrapper row begin -->
<div class="row">

  <!-- Ad Hoc intro paragraph wrapper column begin -->
  <div class="col-lg-12">

    <h1>Ad Hoc Operations</h1>
    <p>Use this page to perform ad hoc operations. Currently supported operations are:
      <ul>
        <li><strong>Ad Hoc Input</strong>: Enter any URL or a body of text to be parsed for potential indicators.</li>
        <li><strong>Ad Hoc Investigate</strong>: Enter an indicator and conduct analysis on it, via supported APIs.</li>
      </ul>

      <!-- Tabs navigation begin -->
      <ul class="nav nav-tabs">
        <li id="inputTab" class="active"><a data-toggle="tab" href="#adHocInput">Input</a></li>
        <li id="investigateTab"><a data-toggle="tab" href="#adHocInv">Investigate</a></li>
      </ul>
      <!-- Tabs navigation end -->

      <!-- Tabs content begin -->
      <div class="tab-content">

        <!-- Ad Hoc input tab begin -->
        <div id="adHocInput" class="tab-pane fade in active">

          <!-- Ad Hoc input wrapper row begin -->
          <div class="row">

            <!-- Ad Hoc indicators wrapper column begin -->
            <div class="col-lg-12">

            <h3>Ad Hoc Input</h3>
            <p>Use this tab to enter any URL or any general text to be parsed for potential indicators. These indicators will be placed in pre-processing with the provided context.</p>

            <!-- User form input begin -->
            <div id="userForm">

              <!-- URL input begin -->
              <div class="form-group">
                <label for="url">URL</label>
                <input type="url" class="form-control" id="url" name="url" placeholder="https://malwarebreakdown.com/2016/11/01/eitest-leads-to-rig-ek-185-141-26-72-185-141-25-207-and-185-141-25-234/">
              </div>
              <!-- URL input end -->

              <!-- General text input begin -->
              <div class="form-group">
                <label for="context">General Text</label>
                <textarea rows="4" class="form-control" id="generaltext" name="context" placeholder="General text to parse for indicators"></textarea>
              </div>
              <!-- General text input end -->

              <!-- Context input begin -->
              <div class="form-group">
                <label for="context">Context</label>
                <input type="text" class="form-control" id="context" name="context" placeholder="EITest Leads To Rig EK Server">
              </div>
              <!-- Context input end -->

              <button id="adHocSubmit" class="btn btn-primary">Submit</button>

              <!-- Loading animation begin -->
              <div style="display:none;" class="ahloading">
                <div class="circle"></div>
                <div class="circle1"></div>
              </div>
              <!-- Loading animation end -->

            </div>
            <!-- User form input end -->

          </div>
          <!-- Ad Hoc input wrapper column end -->

        </div>
        <!-- Ad Hoc input wrapper row end -->

      </div>
      <!-- Ad Hoc input tab end -->

      <!-- Ad Hoc investigate tab begin -->
      <div id="adHocInv" class="tab-pane fade in">

        <!-- Ad Hoc input wrapper row begin -->
        <div class="row">

          <!-- Ad Hoc input wrapper column begin -->
          <div class="col-lg-12">

            <h3>Ad Hoc Investigate</h3>
            <p>Use this tab to enter any URL to be queried by the API integrations within GOSINT.</p>

            <!-- Populate APInotices div if APIs are not set up -->
            <div class="alert alert-info" id="APInotices">
            </div>

            <!-- Indicator input begin -->
            <div id="adHocInvestigation">

                <!-- Indicator type input begin -->
                <div class="form-group col-lg-2">

                    <label for="indType">Indicator Type</label>

                    <!-- New feed parse method begin -->
                    <div id="typeWrap">
                        <select id="indType" name="indType" class="form-control">
                          <option value="smart">Smart</option>
                          <option value="domain">Domain</option>
                          <option value="ip">IP</option>
                          <option value="hash">MD5/SHA1/SHA256</option>
                          <option value="url">URL</option>
                        </select>
                      </div>
                      <!-- New feed parse method end -->

                </div>
                <!-- Indicator input type end -->

                <!-- Indicator input begin -->
                <div class="form-group col-lg-5" id="indicatorWrap">
                  <label for="indicator">Indicator</label>
                  <input type="text" class="form-control" id="indicator" name="indicator" placeholder="http://exampleurl.com/">
                </div>
                <!-- Indicator input end -->

                <!-- Actions begin -->
                <div class="form-group col-lg-4">
                  <label for="actions">Actions</label>
                  <div id="buttonsAPI"></div>
                </div>
                <!-- Actions end -->

              </div>
              <!-- Indicator input end -->

          </div>
          <!-- Ad Hoc input wrapper column end -->

        </div>
        <!-- Ad Hoc input wrapper row end -->

        <!-- Ad Hoc analysis wrapper row begin -->
        <div class="row" id="analysisWrap">

            <!-- Ad Hoc analysis wrapper column begin -->
            <div class="col-lg-12" id="analysis">

                <!-- Ad Hoc analysis panel begin -->
                <div class="panel with-nav-tabs panel-info">

                    <!-- Ad Hoc analysis panel heading begin -->
                    <div class="panel-heading">

                        <!-- Tabs navigation begin -->
                        <ul class="nav nav-tabs">
                          <li id="umbrellaTab" ><a data-toggle="tab" href="#uanalysis">Umbrella</a></li>
                          <li id="threatCrowdTab"><a data-toggle="tab" href="#tanalysis">ThreatCrowd</a></li>
                          <li id="virusTotalTab" ><a data-toggle="tab" href="#vanalysis">VirusTotal</a></li>
                          <li id="everythingTab" ><a data-toggle="tab" href="#eanalysis">Everything</a></li>
                        </ul>
                        <!-- Tabs navigation end -->

                    </div>
                    <!-- Ad Hoc analysis panel heading end -->

                    <!-- Ad Hoc analysis panel body begin -->
                    <div class="panel-body">

                      <!-- Tabs content begin -->
                      <div class="tab-content">

                        <!-- Cisco Umbrella tab begin -->
                        <div id="uanalysis" class="tab-pane fade in">
                          <div class="hidden uloading">
                            <div class="spinnerLoader">
                              <div class="cube1"></div>
                              <div class="cube2"></div>
                            </div>
                          </div>
                          <div class="uresults"></div>
                        </div>
                        <!-- Cisco Umbrella tab end -->

                        <!-- ThreatCrowd tab begin -->
                        <div id="tanalysis" class="tab-pane fade in">
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
                        <div id="vanalysis" class="tab-pane fade in">
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
                        <div id="eanalysis" class="tab-pane fade in">

                          <!-- Cisco Umbrella content begin -->
                          <div class="hidden uloading">
                            <div class="spinnerLoader">
                              <div class="cube1"></div>
                              <div class="cube2"></div>
                            </div>
                          </div>
                          <div class="uresults"></div>
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
                    <!-- Ad Hoc analysis panel body end -->

                </div>
                <!-- Ad Hoc analysis panel end -->

            </div>
            <!-- Ad Hoc analysis wrapper column end -->

          </div>
          <!-- Ad Hoc analysis wrapper row end -->

      </div>
      <!-- Ad Hoc analysis wrapper row end -->

    </div>
    <!-- Ad Hoc investigate tab end -->

  </div>
  <!-- Ad Hoc wrapper column end -->

</div>
<!-- Ad Hoc wrapper row end -->

<!-- Load Javascripts begin -->
<script src="inc/js/general/jquery.noty.packaged.min.js"></script>
<script src="inc/js/adHoc/adHoc.js"></script>
<!-- Load Javascripts end -->

<!-- Load stylesheets begin -->
<link rel="stylesheet" property="stylesheet" href="inc/css/animate.css">
<!-- Load stylesheets end -->

<?php
    require('inc/php/footer.php');
?>
