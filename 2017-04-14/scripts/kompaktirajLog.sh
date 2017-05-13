#!/bin/sh
# kopiramo danasnjo log datoteko in jo potem kompaktiramo na vsako N vrstico

DATE="$(date +%Y-%m-%d)"
R="r.log"
W="w.log"
IMEDAT=$DATE$R
IMECILJ=$DATE$W

#cp "/root/.forever/$IMEDAT" "/root/.forever/log/$IMECILJ"

N=36

awk "NR == 1 || NR % $N == 0" "/root/.forever/$IMEDAT" > "/root/.forever/log/$IMECILJ"
