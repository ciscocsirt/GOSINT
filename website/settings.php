<?php
  require('inc/php/header.php');
?>

<!-- Tabs navigation begin -->
<ul class="nav nav-tabs">
  <li class="active" id="settingsClick"><a data-toggle="tab" href="#settingsTab">General</a></li>
  <li id="whitelistClick" ><a data-toggle="tab" href="#whitelistTab">Whitelists</a></li>
  <li id="feedsClick" ><a data-toggle="tab" href="#feedsTab">Indicator Feeds</a></li>
</ul>
<!-- Tabs navigation end -->

<!-- Tabs content begin -->
<div class="tab-content">

  <!-- Tab 1: Twitter, Threat Intel APIs, CRITs begin -->
  <div id="settingsTab" class="tab-pane fade in active">

    <!-- Twitter settings wrapper row begin -->
    <div class="row">

      <!-- Twitter settings wrapper row column -->
      <div class="col-lg-12">

        <h3>Twitter</h3>

        <!-- Twitter consumer key input begin -->
        <div class="form-group col-xs-6">
          <label for="twitterConsumerKey">Twitter Consumer Key</label>
          <input type="text" class="form-control" id="twitterConsumerKey" name="twitterConsumerKey" title="Your Twitter consumer key" placeholder="none" />
        </div>
        <!-- Twitter consumer key input end -->

        <!-- Twitter consumer secret input begin -->
        <div class="form-group col-xs-6">
          <label for="twitterConsumerSecret">Twitter Consumer Secret</label>
            <input type="text" class="form-control" id="twitterConsumerSecret" name="twitterConsumerSecret" placeholder="none" />
        </div>
        <!-- Twitter consumer secret input end -->

        <!-- Twitter access token input begin -->
        <div class="form-group col-xs-6">
          <label for="twitterAccessToken">Twitter Access Token</label>
          <input type="text" class="form-control" id="twitterAccessToken" name="twitterAccessToken" placeholder="none" />
        </div>
        <!-- Twitter access token input end -->

        <!-- Twitter access secret input begin -->
        <div class="form-group col-xs-6">
          <label for="twitterAccessSecret">Twitter Access Secret</label>
          <input type="text" class="form-control" id="twitterAccessSecret" name="twitterAccessSecret" placeholder="none" />
        </div>
        <!-- Twitter access secret input end -->

        <!-- Twitter users input begin -->
        <div class="form-group col-xs-12">
          <label for="twitterUsers">Twitter Users (comma separated)</label>
          <div id="twitterUsersWrap"><input data-toggle="tooltip" type="text" class="form-control" id="twitterUsers" name="twitterUsers" /></div>
        </div>
        <!-- Twitter users input end -->

      </div>
      <!-- Twitter settings wrapper row column -->

    </div>
    <!-- Twitter settings wrapper row end -->

    <hr/>

    <!-- Threat Intel settings wrapper row begin -->
    <div class="row">

      <!-- Threat Intel settings wrapper column begin -->
      <div class="col-lg-12">

        <h3>Threat Intel APIs</h3>

        <!-- AlienVault API key input begin -->
        <div class="form-group col-xs-4">
          <label for="alienVaultAPI">AlienVault API Key</label>
          <input type="text" class="form-control" id="alienVaultAPI" name="alienVaultAPI" placeholder="none" />
        </div>
        <!-- AlienVault API key input end -->

        <!-- VirusTotal API key input begin -->
        <div class="form-group col-xs-4">
          <label for="virustotalAPI">VirusTotal API Key</label>
          <input type="text" class="form-control" id="virustotalAPI" name="virustotalAPI" placeholder="none" />
        </div>
        <!-- VirusTotal API key input end -->

        <!-- VirusTotal Private API key selection begin -->
        <div class="form-group col-xs-4">
          <label for="virustotalAPIprivate">VirusTotal Private API Access</label>
          <input type="checkbox" class="form-control" id="virustotalAPIprivate" name="virustotalAPIprivate"  />
        </div>
        <!-- VirusTotal Private API key selection end -->

        <!-- Unbrella API key selection begin -->
        <div class="form-group col-xs-4">
          <label for="umbrellaAPI">Umbrella API Key</label>
          <input type="text" class="form-control" id="umbrellaAPI" name="umbrellaAPI" placeholder="none" />
        </div>
        <!-- Unbrella API key selection end -->

      </div>
      <!-- Threat Intel settings wrapper column begin -->

    </div>
    <!-- Threat Intel settings wrapper row end -->

    <hr/>

    <!-- CRITs settings wrapper row begin -->
    <div class="row">

      <!-- CRITs settings wrapper column begin -->
      <div class="col-lg-12">

        <h3>CRITs</h3>

        <!-- CRITs server input begin -->
        <div class="form-group col-xs-6">
          <label for="critsUser">CRITs Server</label>
          <input type="text" class="form-control" id="critsServer" name="critsServer" placeholder="none" />
        </div>
        <!-- CRITs server input end -->

        <!-- CRITs API User input begin -->
        <div class="form-group col-xs-6">
          <label for="critsUser">CRITs API User</label>
          <input type="text" class="form-control" id="critsUser" name="critsUser" placeholder="none" />
        </div>
        <!-- CRITs API User input end -->

        <!-- CRITs API Key input begin -->
        <div class="form-group col-xs-6">
          <label for="critsKey">CRITs API Key</label>
          <input type="text" class="form-control" id="critsKey" name="critsKey" placeholder="none" />
        </div>
        <!-- CRITs API Key input end -->

        <!-- CRITs Source Name input begin -->
        <div class="form-group col-xs-6">
          <label for="critsSource">CRITs Source Name</label>
          <input type="text" class="form-control" id="critsSource" name="critsSource" placeholder="gosint" />
        </div>
        <!-- CRITs Source Name input end -->

        <!-- Update settings button begin -->
        <div class="col-xs-12">
          <button class="updateSettings btn btn-primary">Update Settings</button>
        </div>
        <!-- Update settings button end -->

        <!-- Loading animation begin -->
        <div class="hidden sloading">
          <div class="spinnerLoader">
            <div class="cube1"></div>
            <div class="cube2"></div>
          </div>
        </div>
        <!-- Loading animation end -->

      </div>
      <!-- CRITs settings wrapper column begin -->

    </div>
    <!-- CRITs settings wrapper row end -->

  </div>
  <!-- Tab 1 end -->

  <!-- Tab 2: Whitelist settings begin -->
  <div id="whitelistTab" class="tab-pane fade">

    <!-- Whitelist settings wrapper row begin -->
    <div class="row">

      <!-- Whitelist settings wrapper column begin -->
      <div class="col-lg-12">

        <h3>Whitelists</h3>

        <!-- Alexa Domains Whitelist begin  -->
        <div class="form-group col-xs-12">
          <label for="alexaDomains">Alexa Domains Whitelist</label>
          <div id="alexaDomainsWrap"><input type="text" class="form-control" id="alexaDomains" name="alexaDomains" /></div>
        </div>
        <!-- Alexa Domains Whitelist end  -->

        <!-- General Domains Whitelist begin  -->
        <div class="form-group col-xs-12">
          <label for="whitelistDomains">General Domain Whitelists</label>
          <div id="whitelistDomainsWrap"><input type="text" class="form-control" id="whitelistDomains" name="whitelistDomains"  /></div>
        </div>
        <!-- General Domains Whitelist end  -->

        <!-- ISP Whitelist begin  -->
        <div class="form-group col-xs-12">
          <label for="whitelistISPs">ISPs Whitelists</label>
          <div id="whitelistISPsWrap"><input type="text" class="form-control" id="whitelistISPs" name="whitelistISPs"  /></div>
        </div>
        <!-- ISP Whitelist end  -->

        <!-- Update settings button begin -->
        <div class="col-xs-12">
          <button class="updateSettings btn btn-primary">Update Settings</button>
        </div>
        <!-- Update settings button end -->

        <!-- Loading animation begin -->
        <div class="hidden sloading">
          <div class="spinnerLoader">
            <div class="cube1"></div>
            <div class="cube2"></div>
          </div>
        </div>
        <!-- Loading animation end -->

      </div>
      <!-- Whitelist settings wrapper column begin -->

    </div>
    <!-- Whitelist settings wrapper row end -->

  </div>
  <!-- Tab 2 end -->

  <!-- Tab 3: Indicator feeds begin -->
  <div id="feedsTab" class="tab-pane fade">

    <!-- Indicator feeds wrapper row begin -->
    <div class="row">

      <!-- Indicator feeds wrapper column begin -->
      <div class="col-lg-12">

          <h3>Indicator Feeds</h3>

          <!-- DataTables Structure begin -->
          <table id="feedsTable" class="table table-striped display" style="width: 100%;">

            <!-- Column width definitions begin -->
            <colgroup>
                <col span="1" style="width: 25%;">
                <col span="1" style="width: 25%;">
                <col span="1" style="width: 10%;">
                <col span="1" style="width: 10%;">
                <col span="1" style="width: 10%;">
                <col span="1" style="width: 10%;">
                <col span="1" style="width: 10%;">
            </colgroup>
            <!-- Column width definitions end -->

            <!-- Column headers begin -->
            <thead>
              <tr>
                <th>name</th>
                <th>url</th>
                <th>parser</th>
                <th>crontime</th>
                <th>CSV indicator column</th>
                <th>CSV context column</th>
                <th class="movingCol">delete</th>
              </tr>
            </thead>
            <!-- Column headers end -->

            <!-- Column footers begin -->
            <tfoot>
              <tr>
                <th>name</th>
                <th>url</th>
                <th>parser</th>
                <th>crontime</th>
                <th>CSV indicator column</th>
                <th>CSV context column</th>
                <th>delete</th>
              </tr>
            </tfoot>
            <!-- Column footers end -->

          </table>
          <!-- DataTables Structure end -->

          <h3>Create New Feed</h3>

          <!-- New feed name begin -->
          <div class="form-group col-xs-6">
            <label for="feedName">Feed Name</label>
            <input type="text" class="form-control" id="feedName" name="feedName" placeholder="My new feed" />
          </div>
          <!-- New feed name end -->

          <!-- New feed URL begin -->
          <div class="form-group col-xs-6">
            <label for="feedURL">Feed URL</label>
            <input type="url" class="form-control" id="feedURL" name="feedURL" value="http://" />
          </div>
          <!-- New feed URL end -->

          <!-- New feed parse method begin -->
          <div class="form-group col-xs-2" >
            <label for="feedParser">Parse Method</label>
            <div id="feedParserWrap">
              <select id="feedParser" name="feedParser" class="form-control">
                <option value="csv">CSV</option>
                <option value="smart">Smart</option>
              </select>
            </div>
          </div>
          <!-- New feed parse method end -->

          <!-- New feed CSV indicator column definition begin -->
          <div class="form-group col-xs-2">
            <label for="csvIndicatorColumn">CSV Indicator Column</label>
            <input type="number" class="form-control" id="csvIndicatorColumn" name="csvIndicatorColumn" />
          </div>
          <!-- New feed CSV indicator column definition end -->

          <!-- New feed CSV context column definition begin -->
          <div class="form-group col-xs-2">
            <label for="csvContextColumn">CSV Context Column</label>
            <input type="number" class="form-control" id="csvContextColumn" name="csvContextColumn" />
          </div>
          <!-- New feed CSV context column end begin -->

          <!-- New feed cron configuration begin -->
          <div class="form-group col-xs-3">
            <label for="cronTime">Cron Time <a id="cronTimeDisplay" href="#">(options)</a></label>
            <input type="text" class="form-control" id="cronTime" name="cronTime" value="@daily"  />
          </div>
          <!-- New feed cron configuration end -->

          <!-- Cron time options table begin -->
          <div class="form-group col-xs-12" id="cronTimeOptions">
              <p><strong>Cron Time Options</strong></p>
              <p>Choose how often you would like to pull from the selected feed. See examples below.</p>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Entry</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>@weekly</td>
                    <td>Pull once a week, midnight on Sunday</td>
                  </tr>
                  <tr>
                    <td>@daily</td>
                    <td>Pull once a day, midnight</td>
                  </tr>
                  <tr>
                    <td>@hourly</td>
                    <td>Pull once an hour, beginning of hour</td>
                  </tr>
                  <tr>
                    <td>@every 12h</td>
                    <td>Pull every 12 hours</td>
                  </tr>
                  <tr>
                    <td>@every 3h30m</td>
                    <td>Pull every three hours, 30 minutes</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Cron time options table end -->

          <!-- Create Feed button begin -->
          <div class="form-group col-xs-12">
            <button id="createFeed" class="btn btn-primary">Create Feed</button>
          </div>
          <!-- Create Feed button end -->

        </div>
        <!-- Indicator feeds wrapper column end -->

      </div>
      <!-- Indicator feeds wrapper row end -->

  </div>
  <!-- Tab 3: Indicator feeds end -->

</div>
<!-- Tabs content end -->

<!-- Load Javascripts begin -->
<script src="inc/js/settings/settings.js"></script>
<script src="inc/js/general/bootstrap-tokenfield.js"></script>
<script src="inc/js/general/jquery.noty.packaged.min.js"></script>
<script src="inc/js/dataTables/jquery.dataTables.js"></script>
<script src="inc/js/dataTables/dataTables-plugins.js"></script>
<!-- Load Javascripts end -->

<!-- Load stylesheets begin -->
<link rel="stylesheet" href="inc/css/bootstrap-tokenfield.min.css" />
<link rel="stylesheet" href="inc/css/animate.css" />
<!-- Load stylesheets end -->

<?php
  require('inc/php/footer.php');
?>
