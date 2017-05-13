#!/bin/sh

tail -720 "/root/.forever/log/mesecni.log" > "/root/.forever/log/mesecni.tmp"


mv "/root/.forever/log/dnevni.tmp" "/root/.forever/log/mesecni.log"
