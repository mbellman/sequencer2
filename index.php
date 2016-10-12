<!doctype html>
<html>
	<head>
		<meta charset="UTF-8">
		<script type="text/javascript" src="js/almond.min.js"></script>
	</head>
	<body>
		<div class="hello">
			<span id="goodbye"></span>
		</div>

		<script type="text/javascript" src="js/bundle.min.js"></script>
		<script>
			require(['Sequencer'], function (Sequencer) {
				Sequencer.main();
			});
		</script>
	</body>
</html>