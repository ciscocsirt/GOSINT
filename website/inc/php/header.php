<?php
    // Load necessary functions to output correct title tag in HTML head tag
    require_once 'title-selector.php';
?><!DOCTYPE HTML>

<html lang="en-US">

    <!-- Header begin -->
    <head>
        <meta charset="UTF-8">
        <title>GOSINT - <?php echo getTitle(); ?> </title>

        <!-- Load stylesheets -->
        <link href="inc/css/bootstrap.min.css" rel="stylesheet" />
        <link href="inc/css/simple-sidebar.css" rel="stylesheet" />
        <link href="inc/css/mycss.css" rel="stylesheet" />
        <link href="//cdn.datatables.net/select/1.2.0/css/select.dataTables.min.css" rel="stylesheet" />
        <link href="//cdn.datatables.net/1.10.12/css/jquery.dataTables.css" rel="stylesheet" />
        <link href="//code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css" rel="stylesheet" />

        <!-- Load jQuery from CDN, else fallback to local -->
        <script src="//s3.amazonaws.com/dynatable-docs-assets/js/jquery-1.9.1.min.js"></script>
        <script>window.jQuery || document.write('<script src="inc/js/general/jquery-1.9.1.min.js">\x3C/script>');</script>

        <!-- Load Bootstrap from CDN, else fallback to local -->
        <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
        <script>if(typeof($.fn.modal) === 'undefined') {console.log("local");document.write('<script src="/inc/js/general/bootstrap.min.js"><\/script>')};</script>

        <script src="inc/js/general/generate.js"></script>

    </head>
    <!-- Header end -->

    <body>
        <!-- Wrapper begin -->
        <section id="wrapper">

            <?php
                // Load sidebar
                require_once 'sidebar.php';
            ?>

            <!-- Page Content Wrapper begin -->
            <section id="page-content-wrapper">

                <!-- Container-Fluid begin -->
                <main class="container-fluid">
