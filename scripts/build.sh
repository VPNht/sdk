#!/bin/bash
cd "$( dirname "${BASH_SOURCE[0]}" )"
cd ../
rm -rf build

mkdir -p build/electron

# Build NWJS
cd examples/nwjs

yarn
yarn build

mv build/nwjs/ ../../build/nwjs

# Build Electron
cd ../electron
yarn
yarn package-all

mv release/mac ../../build/electron/osx64
mv release/win-unpacked ../../build/electron/win64
mv release/linux-unpacked ../../build/electron/linux64
