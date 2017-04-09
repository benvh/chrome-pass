(function(global) {
    'use strict';

    function InjectUsernameAndPassword(username, password) {
        if(document.activeElement) document.activeElement.value = username;
        const passwordElement = document.querySelector('input[type="password"]');
        if(passwordElement) passwordElement.value = password;
    }


    chrome.runtime.onMessage.addListener(message => {
        if(message.action === "inject:username_password") { 
            InjectUsernameAndPassword(message.username, message.password);
        }
    });


}(window));
