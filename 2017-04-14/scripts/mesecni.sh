#!/bin/sh

DATE="$(date +%Y-%m-%d)"
R="r.log"
IMEDAT=$DATE$R

VRSTICA="$(tail -1 /root/.forever/$IMEDAT)"

if [[ ${VRSTICA:0:1} = "2" ]]
then
    echo "$VRSTICA" >> "/root/.forever/log/mesecni.log"
fi