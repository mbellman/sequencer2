outfile="css/sequencer.css"

if [ -f $outfile ]; then
    rm $outfile
fi

echo "Compiling CSS...";
lessc --clean-css less/sequencer.less $outfile

if [ -f $outfile ]; then
	echo "Done.";
else
	echo "CSS compilation failed."
fi