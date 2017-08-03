<?php
    require('inc/php/header.php');
?>

<!-- Ad Hoc indicators wrapper row begin -->
<div class="row">

    <!-- Ad Hoc indicators wrapper column begin -->
    <div class="col-lg-12">

          <h1>Ad Hoc Indicators</h1>
          <p>Use this page to enter any URL or any general text to be parsed for potential indicators. These indicators will be placed in pre-processing with the provided context.</p>

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
    <!-- Ad Hoc indicators wrapper column end -->

</div>
<!-- Ad Hoc indicators wrapper row end -->

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
