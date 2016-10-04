declare -a files=("js/bundle.js" "js/bundle.min.js")

for file in "${files[@]}"
do
	if [ -f $file ]; then
		rm $file
	fi
done

echo "Compiling...";
tsc
if [ -f ${files[0]} ]; then
	echo "Compressing..."
	uglifyjs -o js/bundle.min.js js/bundle.js -c -m keep_fargs=true
	echo "Done."
else
	echo "Compilation failure."
fi