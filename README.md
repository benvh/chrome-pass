## Description
chrome-pass integrates your all-time favorite password manager [pass](https://www.passwordstore.org/) with chrome.

chrome-pass considers all top-level directories withing your password-store as "known-hosts". Any regular
files within these directories are considered usernames for those specific "known-hosts".

When you open the popup on a specific page, let's say github.com, chrome-pass will list all available users for
github.com (if there are any).

Fetching a password will actually call ```$ pass show <hostname>/<username>``` and return its value.


## Installing

#### Chrome extension
* Open *chrome://extensions* in a new tab
* Enable developer mode if it is disabled (there is a checkbox on the top of the page somewhere...)
* Click *load unpacked extensions* and add the *extensions* folder found in the root of this project

### Quick and dirty install script
* Once you have installed the chrome extension, chrome should have assigned it an ID.
* Copy it.
* Replace the placeholder ID inside install.sh with your extension ID.
* run install.sh


### Doing it by hand
You can always do all this stuff yourself...! Here's how:

#### 1. Build native app
* browse to the project root using your favorite terminal
* ```$ go build -o chrome_pass```  make sure the output is **chrome_pass** and not **chrome-pass**. Chrome doesn't like hyphens for some reason...

#### 2. Update the native messaging host config
* edit the *tech.benvh.chrome_pass.json* file
* replace ${EXTENSION_ID} with the extension id of chrome-pass found in your chrome extensions page
* replace ${BINARY_PATH} with the path to the recently build chrome_pass binary

#### 3. "Install" the native messaging host config
Copy the *tech.benvh.chrome_pass.json* file into your chrome NativeMessagingHosts dir

It should be one of the following locations 

```
$HOME/.google-chrome/NativeMessagingHosts
$HOME/.config/chromium/NativeMessagingHosts
```

* If it doesn't work right away restart chrome or reload the extension

## Usage
Once installed, the extension should show up as a button.

* Visit a website with which you want to authenticate
* Click the chrome-pass button. If there are any usernames registered for the current hostname they should show up
* Click any username and the credentials should automatically get entered as described below 

chrome-pass will try to insert the username in the focused input field. The password is injected
in the first ```<input type="password">``` field it can find
