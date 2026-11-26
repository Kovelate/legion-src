#! /bin/bash

source .env

wget --no-verbose --tries 3 --timeout 3 --force-directories --input-file "paths" --header "Cookie: lsid=$LEGION_LSID"

biome check --write ./legiongame.gg # Biome тк быстрый и на Arch btw одной командой ставится + линтер этому коду явно не помешает ))