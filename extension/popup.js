(function(global) {
    'use strict';

    /**
     * Get the active tab's url hostname
     *
     * @returns {Promise} resolves to the active tab's url hostname
     */
    function FetchActiveTabHostname() {
        return new Promise(function(resolve, reject) {
            chrome.tabs.executeScript({ code: 'location.host' }, function(result) {
                resolve(result[0]);
            }); 
        });
    }

    /**
     * Send a native message and await the native messaging host's response
     *
     * @param {Object} message any jsonifiable data
     * @returns {Promise} resolves to the first responsive received after sending the message
     */
    function SendNativeMessage(message) {
        return new Promise(function(resolve, reject) {
            chrome.runtime.sendNativeMessage('tech.benvh.chrome_pass', message, function(response) {
                if(response == undefined || response.kind === 'error') {
                    reject(response);
                } else {
                    resolve(response);
                }
            });
        });
    }

    /**
     * Fetch a password for a hostname,username combination
     * 
     * @param {String} hostname
     * @param {String} username
     * @returns {Promise} resolve's to the user's password or throws an error if an error occured
     */
    function FetchUserPasssword(hostname, username) {
        return SendNativeMessage({ action: "fetch_user_password", arguments: { hostname: hostname, username: username } })
            .then(function(response) {
                return response.data.password.trim();
            });
    }

    /**
     * Populate the extension popup with all users for the given hosts
     * @returns {Promise}
     */
    function ListUsernamesForHostname(hostname) {
        return SendNativeMessage({ action: "list_host_usernames", arguments: { hostname: hostname } })
            .then(function(response) {
                return response.data.usernames;
            })
            .then(function(usernames) {
                console.log(usernames)
                usernames.forEach(function(username) {
                    var div = document.createElement('div');
                    div.classList.add('username-entry');
                    div.textContent = username;
                    div.addEventListener('click', HandleHostUsernameClick.bind(undefined, hostname, username));
                    document.body.appendChild(div);
                });
            })
            .catch(function(error) {
                // TODO: Proper error handling
                var div = document.createElement('div');
                div.textContent = "No users found for " + hostname;
                document.body.appendChild(div);
            });
    }

    /**
     * Click event handler for the username list entries shown in the extension popup.
     */
    function HandleHostUsernameClick(hostname, username) {
        FetchUserPasssword(hostname, username)
            .then(function(password) {
                InjectUsernameAndPassword(username, password);
            });
    }

    /**
     * Injects the username in the currently active field and inserts the password in the first password field it finds
     * TODO: Make this smarter?
     */
    function InjectUsernameAndPassword(username, password) {
        const injectUsernameScript = 'document.activeElement.value = "' + username + '";';
        const injectPasswordScript = 'document.querySelector("input\[type=\\"password\\"\]").value = "' + password + '";';
        chrome.tabs.executeScript({ code: injectUsernameScript });
        chrome.tabs.executeScript({ code: injectPasswordScript });
    }


    /**
     * Automatically list all available users when the popup is opened
     */
    global.addEventListener("load", function() {
        FetchActiveTabHostname()
            .then(function(hostname) {
                ListUsernamesForHostname(hostname);
            });

    });

}(window));
