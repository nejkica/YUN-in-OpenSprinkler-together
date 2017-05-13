#!/bin/sh

tail -672 "/root/.forever/log/tedenski.log" > "/root/.forever/log/tedenski.tmp"


mv "/root/.forever/log/dnevni.tmp" "/root/.forever/log/tedenski.log"
