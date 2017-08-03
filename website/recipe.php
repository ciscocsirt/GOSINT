<?php
  require('inc/php/header.php');
?>

<!-- Intro paragraph begin -->
<div class="row">
    <div class="col-lg-12">
        <h1>Recipe Manager</h1>
        <p>Use the recipe maker to set up tasks for automation for GOSINT.</p>
        <p>You can combine a source, optional operators, and destination, and GOSINT will take indicators from the source, apply the operators, and place them in the destination.</p>
    </div>
</div>
<!-- Intro paragraphe end -->

<!-- Sources selection begin -->
<div class="col-lg-3">
      <h3 class="recipeheader">Sources</h3>
      <div class="recipecontainer" id="sources">
        <div class="rloading">
          <div class="spinnerLoader">
            <div class="cube1"></div>
            <div class="cube2"></div>
          </div>
          <p class="loadingInfo">Loading sources...</p>
        </div>
      </div>
</div>
<!-- Sources selection end -->

<!-- Operators selection begin -->
<div class="col-lg-3">
      <h3 class="recipeheader">Operators</h3>
      <div class="recipecontainer" id="operators">
        <div class="rloading">
          <div class="spinnerLoader">
            <div class="cube1"></div>
            <div class="cube2"></div>
          </div>
          <p class="loadingInfo">Loading operators...</p>
        </div>
      </div>
</div>
<!-- Operators selection end -->

<!-- Destinations selection begin -->
<div class="col-lg-3">
      <h3 class="recipeheader">Destinations</h3>
      <div class="recipecontainer" id="destinations">
        <div class="rloading">
          <div class="spinnerLoader">
            <div class="cube1"></div>
            <div class="cube2"></div>
          </div>
          <p class="loadingInfo">Loading destinations...</p>
        </div>
      </div>
</div>
<!-- Destinations selection end -->

<!-- Final Recipe selection begin -->
<div class="col-lg-3">
      <h3 class="recipeheader">Final Recipe</h3>
      <div class="recipecontainer" id="finalrecipe"></div>
      <button id="resetRecipe" class="btn btn-danger">Reset Recipe</button>
</div>
<!-- Final Recipe selection end -->

<!-- Overview begin -->
<div class="row">
    <div class="col-lg-12">
        <h3>Recipe Overview</h3>
        <p>Process indicators from <span id="newrecipesource"></span>, apply <span id="newrecipeoperators"></span>, and place in <span id="newrecipedestination"></span></p>
    </div>
</div>
<!-- Overview end -->

<!-- Recipe name begin -->
<div class="row">
  <div class="col-lg-4">
    <div class="form-group">
      <label for="text">Title</label>
      <input type="text" class="form-control" id="newrecipetitle" name="newrecipetitle" placeholder="Name of your recipe">
    </div>
  </div>
</div>
<button id="createRecipe" class="btn btn-primary">Create Recipe</button>
<!-- Recipe name end -->

<hr/>

<!-- Past recipes begin -->
<div class="row" id="loadedRecipes">
    <div class="col-lg-12" >
        <h3>Past Recipes</h1>
        <p>Manage recipes you have created in the past.</p>

        <!-- DataTables Structure begin-->
        <table id="pastRecipes" class="table table-striped display" style="width:100%;">

          <!-- Column headers begin -->
          <thead>
            <tr>
              <th>guid</th>
              <th>title</th>
              <th>source</th>
              <th>operators</th>
              <th>destination</th>
              <th>delete</th>
            </tr>
          </thead>
          <!-- Column headers end -->

          <!-- Recipes loaded begin -->
          <tbody>
          </tbody>
          <!-- Recipes loaded end -->

        </table>
        <!-- DataTables Structure end-->

    </div>
</div>
<!-- Past recipes end -->

<!-- Load Javascripts begin -->
<script src="inc/js/dataTables/jquery.dataTables.js"></script>
<script src='inc/js/recipe/recipe.js'></script>
<script src="inc/js/general/jquery.noty.packaged.min.js"></script>
<!-- Load Javascripts end -->

<!-- Load stylesheets begin -->
<link rel="stylesheet" href="inc/css/dragula.min.css" />
<link rel="stylesheet" property="stylesheet" href="inc/css/animate.css">
<!-- Load stylesheets end -->

<?php
  require('inc/php/footer.php');
?>
