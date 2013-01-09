<!DOCTYPE html>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<html>
	<head>
<?php include("includes/head.php"); ?>
		<title>
			Table to Network
		</title>
	</head>
	<body>
		<div class="container_16">
			<header class="grid_16">
				<?php include("includes/header.php"); ?>
			</header>
		</div>

		<div id="main" class="container_16">
			<div class="grid_12" style="margin-bottom:500px;">
				<h3>Extract a GEXF network from a CSV table</h3>
				<input type="file" id="files" name="file" />
				<div id="progress_bar"><div id="progress_bar_message" class="percent">0%</div></div>
				<script>
					document.getElementById('files').addEventListener('change', fileLoader.handleFileSelect, false);
				</script>
				<div id="UI"></div>
				<div>
					<button hidden="true" id="submitButton" style="width: 200px; height: 30px;">Download</button>
				</div>
			</div>
			<div class="grid_4">
				<h3>How to...</h3>
				<ul>
					<li><b>Load a CSV file</b> from your computer</li>
					<li>Select the <b>type of graph</b> you want (bipartite or not)</li>
					<li>Select the <b>columns</b> used to make <b>nodes</b> and <b>edges</b></li>
					<li>Multiples items per cell are handled</li>
					<li><b>Download</b> the graph</li>
					<li>Open your graph in <a href="http://gephi.org">Gephi</a></li>
					<li>You can <b>merge</b> different graphs directly in Gephi*.</li>
				</ul>
				<small>* A given item from a given file always has the same id, whatever are the links. This way you can build multipartite graphs.</small>
			</div>
		<div class="container_16">
			<footer class="grid_16">
				<?php include("includes/footer.php"); ?>
			</footer>
		</div>
	</body>
</html>
