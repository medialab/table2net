<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Table 2 Net</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width">

<?php include('includes/config_management.php'); ?>
<?php include('includes/codetop.php'); ?>

        <style>

            body {
                padding-top: 60px;
                padding-bottom: 40px;
            }
        </style>

    </head>
    <body>
        <!--[if lt IE 7]>
            <p class="chromeframe">You are using an outdated browser. <a href="http://browsehappy.com/">Upgrade your browser today</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to better experience this site.</p>
        <![endif]-->

<?php include('includes/header.php'); ?>




        <div class="container">

            <!-- Main hero unit for a primary marketing message or call to action -->
            <div class="splash-unit row">
                <div class="span7">
                    <div class="image">
                        <a href="index.php"><img src="res/header.png"/></a>
                    </div>
                    <div class="title">
                        Table 2 Net
                    </div>
                </div>
                <div class="span5">
                    <div class="abstract">
                        <p><strong>Extract a network from a table.</strong> Set a column for nodes and a column for edges. It deals with multiple items per cell.</p>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="span12">
                    <h2>Load your CSV table</h2>
                    <p class="text-info">
                        It has to be <strong><a href='http://en.wikipedia.org/wiki/Comma-separated_values' target='_blank'>comma-separated</a></strong> and the first row must be dedicated to <strong>column names</strong>.
                    </p>
                </div>
            </div>
            <div class="row">
                <div class="span12">
                    <div id="csvloader" style="height: 50px">
                        <div class="input">
                            <input type="file" name="file" id='csvloader_input'/>
                            <span class="help-block">Note: you can drag and drop a file</span>
                        </div>
                        <div class="progress" style="display: none;">
                            <div class="bar" style="width: 0%;"></div>
                        </div>
                        <div class="alert" style="display: none;">
                        </div>
                    </div>
                    <div id="UI"></div>
                </div>
            </div>
            <div>
                <button hidden="true" id="submitButton" style="width: 200px; height: 30px;">Download</button>
            </div>
            
        </div>

        <?php include("includes/footer.php"); ?>

        <?php include("includes/codebottom.php"); ?>

        <script>
            document.getElementById('csvloader_input').addEventListener('change', fileLoader.handleFileSelect, false);
        </script>
    </body>
</html>
