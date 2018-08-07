#!/bin/bash -e
#
# Package Augury into crx format Chrome extension
# (This will not be needed for official distribution)
# Based on https://developer.chrome.com/extensions/crx#scripts

node -v
npm -v

dir="temp"
key="key.pem"
name="augury"
files="manifest.json build images index.html frontend.html popup.html popup.js"

pub="$name.pub"
sig="$name.sig"
zip="$name.zip"
crx="$name.crx"
xpi="$name.xpi"

# Ensure environment variables exist ($sentry_key isnt used anywhere)
#sentry_key=${SENTRY_KEY:?"The environment variable 'SENTRY_KEY' must be set and non-empty"}

# assign build name to zip and crx file in circleci env
if [ $CIRCLE_BUILD_NUM ] || [ $CIRCLE_ARTIFACTS ]; then
  chrome_canary_zip="$name-$CIRCLE_BUILD_NUM.chrome.canary.zip"
  chrome_zip="$name-$CIRCLE_BUILD_NUM.chrome.zip"
  chrome_crx="$name-$CIRCLE_BUILD_NUM.chrome.crx"
  firefox_zip="$name-$CIRCLE_BUILD_NUM.firefox.zip"
  firefox_xpi="$name-$CIRCLE_BUILD_NUM.firefox.xpi"
else
  chrome_canary_zip="$name.chrome.canary.zip"
  chrome_zip="$name.chrome.zip"
  chrome_crx="$name.chrome.crx"
  firefox_zip="$name.firefox.zip"
  firefox_xpi="$name.firefox.xpi"
fi

trap 'rm -f "$pub" "$sig"' EXIT

function do_build {
  npm run build:prod:${BUILD_LOWERCASE}
}

function grab_files_and_zip {
  # copy all the files we need
  rm -rf $dir
  mkdir $dir
  cp -R $files $dir/
<<<<<<< HEAD
<<<<<<< HEAD
  rm $dir/build/*.map
=======
>>>>>>> origin/dev
=======
>>>>>>> upstream/augury2-poc

  # zip up the crx dir
  cwd=$(pwd -P)
  (cd "$dir" && zip -qr -9 -X "$cwd/$zip" .)
}

# generate private key key.pem if it doesn't exist already
if [ ! -f $key ]; then
  echo "$key doesn't exist."
  openssl genrsa -out key.pem 1024
fi

# ---------------------------------------------------------
# build for chrome (.crx, .zip) ---------------------------------

BUILD_LOWERCASE=chrome
do_build
grab_files_and_zip

cp $zip $chrome_zip

# signature
openssl sha1 -sha1 -binary -sign "$key" < "$zip" > "$sig"

# public key
openssl rsa -pubout -outform DER < "$key" > "$pub" 2>/dev/null

byte_swap () {
  # Take "abcdefgh" and return it as "ghefcdab"
  echo "${1:6:2}${1:4:2}${1:2:2}${1:0:2}"
}

crmagic_hex="4372 3234" # Cr24
version_hex="0200 0000" # 2
pub_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$pub" | awk '{print $5}')))
sig_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$sig" | awk '{print $5}')))
(
  echo "$crmagic_hex $version_hex $pub_len_hex $sig_len_hex" | xxd -r -p
  cat "$pub" "$sig" "$zip"
) > "$chrome_crx"

echo "Wrote $chrome_crx"
echo "<script>window.location.href = 'https://s3.amazonaws.com/batarangle.io/$crx';</script>" > download.html
echo "Wrote file"

# move files to artifacts folder in circleci
if [ $CIRCLE_ARTIFACTS ]; then
  mv $chrome_zip $CIRCLE_ARTIFACTS
  mv $chrome_crx $CIRCLE_ARTIFACTS
fi

# ---------------------------------------------------------
# build for firefox (.xpi, .zip) --------------------------------
# TODO: add digital signatures. (firefox requires add-on verification)

BUILD_LOWERCASE=firefox
do_build
grab_files_and_zip

cp $zip $firefox_zip
cp $zip $firefox_xpi

if [ $CIRCLE_ARTIFACTS ]; then
  mv $firefox_zip $CIRCLE_ARTIFACTS
  mv $firefox_xpi $CIRCLE_ARTIFACTS
fi

# ---------------------------------------------------------
# build canary (.zip) --------------------------------

BUILD_LOWERCASE=canary
do_build
grab_files_and_zip

cp $zip $chrome_canary_zip

if [ $CIRCLE_ARTIFACTS ]; then
  mv $chrome_canary_zip $CIRCLE_ARTIFACTS
fi

# ---------------------------------------------------------
# done. clean up ---------------------

rm 'manifest.json' # this file is generated by build process (browser specific)
rm -rf $dir
echo "Fin."
