#!/bin/bash

# NOTE: Please replace the chrome_extension_id with the id chrome assigned the extension
#       when manually installing it. The extension is currently not published and has no "fixed" id
chrome_extension_id="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

binary_out_path="$GOPATH/bin/chrome_pass"
native_host_config_file="tech.benvh.chrome_pass.json"

target_dir_chrome=$HOME/.config/google-chrome/NativeMessagingHosts
target_dir_chromium=$HOME/.config/chromium/NativeMessagingHosts
target_dir_final=""


# can't use go install since it installs chrome-pass instead of chrome_pass...
echo "* building binary"
go build -o chrome_pass

echo "* installing binary (${binary_out_path})"
echo ""
cp chrome_pass $binary_out_path


if [ -d $target_dir_chrome ]; then
    echo " * found for chrome directory ($target_dir_chrome)"
    echo ""
    target_dir_final=$target_dir_chrome

elif [ -d $target_dir_chromium ]; then
    echo "* found for chromium directory ($target_dir_chromium)"
    echo ""
    target_dir_final=$target_dir_chromium

else
    echo " * Couldn't find chrome or chromium directories (aborting)"
    echo " * removing installed binary"
    rm $binary_out_path
    exit 1
fi



native_host_config_output_path=$target_dir_final/$native_host_config_file
if [ -f $native_host_config_output_path ]; then
    echo "* Found existing native host config. "
    echo "* Backing up to $native_host_config_file.old"
    cp $native_host_config_output_path $native_host_config_output_path.old
fi

echo "* Installing native host config file in $target_dir_final"
echo ""
sed "s,\${BINARY_PATH},$binary_out_path,; s,\${EXTENSION_ID},$chrome_extension_id," <$native_host_config_file > $native_host_config_output_path
