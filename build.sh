#!/bin/bash

currentFolder=$(pwd)

cd $currentFolder/src/functions

errorCode=0
for d in */; do
        cd "$d"
        echo "Processing $d"

        # build, run linter and unit tests
        npm install
        npm run lint
        if [[ $? -ne 0 ]]; then
            errorCode=1
        fi
        npm test
        if [[ $? -ne 0 ]]; then
            errorCode=1
        fi

        # Remove devDependencies
        npm prune --production
        cd ..
done

cd $currentFolder
exit $errorCode