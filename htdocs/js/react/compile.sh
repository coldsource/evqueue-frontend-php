#!/bin/bash

cd "$(dirname "$0")"

babeljs --watch src --out-dir dist --presets react
