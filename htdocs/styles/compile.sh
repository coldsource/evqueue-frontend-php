#!/bin/bash

cd "$(dirname "$0")"

sassc src/ui.scss >ui.css

while inotifywait -e CREATE,MODIFY,DELETE -q --exclude '/\.' -r ./src
do
	echo "Compiling CSS..."
	sassc src/ui.scss >ui.css
done
