#!/bin/sh

tail -480 "/root/.forever/log/dnevni.log" > "/root/.forever/log/dnevni.tmp"


mv "/root/.forever/log/dnevni.tmp" "/root/.forever/log/dnevni.log"
