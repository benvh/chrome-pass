(function(global) {
    'use strict';

    /**
     * Get the active tab's url hostname
     *
     * @returns {Promise} resolves to the active tab's url hostname
     */
    function FetchActiveTabHostname() {
        return new Promise((resolve, reject) => {
            chrome.tabs.executeScript({ code: 'location.host' }, result =>{
                if(result) {
                    resolve(result[0].replace(/^www\./, ''));
                } else {
                    if(chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError.message);
                    } else {
                        reject('fatal error');
                    }
                }
            }); 
        });
    }

    /**
     * Send a native message and await the native messaging host's response
     *
     * @param {Object} message any jsonifiable data
     * @returns {Promise} resolves to the first response received after sending the message
     */
    function SendNativeMessage(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendNativeMessage('tech.benvh.chrome_pass', message, response => {
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
        return SendNativeMessage({ action: 'fetch_user_password', arguments: { hostname: hostname, username: username } })
            .then(response => response.data.password.trim());
    }

    /**
     * Populate the extension popup with all users for the given hosts
     * @returns {Promise}
     */
    function ListUsernamesForHostname(hostname) {
        return SendNativeMessage({ action: 'list_host_usernames', arguments: { hostname: hostname } })
            .then(response => response.data.usernames)
            .then(usernames => {
                usernames.forEach(username => {
                    const div = document.createElement('div');
                    div.classList.add('username-entry');
                    div.textContent = username;
                    div.addEventListener('click', HandleHostUsernameClick.bind(undefined, hostname, username));
                    document.body.appendChild(div);
                });
            })
            .catch(error => ShowError(`No users found for ${hostname}`));
    }

    /**
     * Click event handler for the username list entries shown in the extension popup.
     */
    function HandleHostUsernameClick(hostname, username) {
        FetchUserPasssword(hostname, username).then(password => InjectUsernameAndPassword(username, password));
    }

    /**
     * Call our injector content-script
     */
    function InjectUsernameAndPassword(username, password) {
        chrome.tabs.query({ active: true, currentWindow: true }, activeTabs => {
            chrome.tabs.sendMessage(activeTabs[0].id, { action: 'inject:username_password', username, password });
        });
    }

    /**
     * Utility method to render a username list
     */
    function ShowUsernames(usernames) {

    }

    /**
     * Utility method to show errors
     */
    function ShowError(message) {
        const errDiv = document.createElement('div');
        const errSad = document.createElement('div');
        errSad.classList.add('error-sad');
        errSad.textContent = ':(';

        errDiv.classList.add('error');
        errDiv.textContent = message;

        document.body.appendChild(errSad);
        document.body.appendChild(errDiv);
    }


    /**
     * Automatically list all available users when the popup is opened
     */
    global.addEventListener("load", function() {
        FetchActiveTabHostname()
            .then(hostname => ListUsernamesForHostname(hostname))
            .catch(message => ShowError('Not available for this tab'));

    });

    /**
     * Listen for messages from our injector content script
     */
    chrome.runtime.onMessage.addListener(message => {

    });

}(window));
