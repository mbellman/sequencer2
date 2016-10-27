<!doctype html>
<html>
	<head>
		<meta charset="UTF-8">
		<script type="text/javascript" src="js/almond.min.js"></script>
		<style type="text/css">
			@import url("style.css");
		</style>
	</head>
	<body>
		<main class="sequencer"></main>

		<script type="text/javascript" src="js/bundle.min.js"></script>
		<script>
			require(['Sequencer'], function (Sequencer) {
				Sequencer.main();
			});
		</script>
	</body>
</html>