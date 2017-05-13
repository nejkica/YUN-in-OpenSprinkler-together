#!/bin/sh

local RLOG="$(ls -1t /root/.forever/ | head -2 | grep r)"
local SLOG="$(ls -1t /root/.forever/ | head -2 | grep s)"

curl -k -u kookaburra:"kookaburra@72" -T /root/.forever/$RLOG "https://kookaburra.si/owncloud/remote.php/webdav/Documents/ZalivanjeOSinYUNlog/"$RLOG
curl -k -u kookaburra:"kookaburra@72" -T /root/.forever/$SLOG "https://kookaburra.si/owncloud/remote.php/webdav/Documents/ZalivanjeOSinYUNlog/"$SLOG
