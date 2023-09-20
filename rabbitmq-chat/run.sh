#! /usr/bin/env bash

node app.js 3000 &
node app.js 3001 &
node historyService &
