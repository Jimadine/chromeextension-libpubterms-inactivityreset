(function() {
    var browser = navigator.userAgent;
    if (browser.indexOf('LOPAC') !== -1) var goHomeTimeOut = 30
    else if (browser.indexOf('WALKIN') !== -1) var goHomeTimeOut = 30
    else if (browser.indexOf('BORTH') !== -1) var goHomeTimeOut = 300
    else if (browser.indexOf('CHEM') !== -1) var goHomeTimeOut = 1200
    else var goHomeTimeOut = 30

    chrome.idle.setDetectionInterval(goHomeTimeOut);
    chrome.idle.onStateChanged.addListener(function(newState) {
        if (newState == 'idle') {
            chrome.history.search({
                'text': '',
                'maxResults': 2
            }, function(historyItems) {
                numVisits = historyItems.length;
                if (numVisits > 1) {
                    notification = new Notification('Browser will be reset in 30 seconds', {
                        body: 'Web browser has been inactive for ' + goHomeTimeOut + ' seconds. Move the mouse or type something within 30 seconds to stop Chrome quitting',
                        icon: '1429370080_sign-out-white-48.png',
                        requireInteraction: true
                    })
                    setTimeout(function() {
                        notification.close()
                        chrome.idle.queryState(goHomeTimeOut - 1, function(currState) {
                            if (currState == 'idle') {
                                chrome.browsingData.remove({}, {
                                    'appcache': true,
                                    'cache': true,
                                    'cookies': true,
                                    'downloads': true,
                                    'fileSystems': true,
                                    'formData': true,
                                    'history': true,
                                    'indexedDB': true,
                                    'localStorage': true,
                                    'pluginData': true,
                                    'passwords': true,
                                    'webSQL': true
                                }, function() {
                                    chrome.tabs.query({}, function(tabs) {
                                        for (var i = 0; i < tabs.length; i++) {
                                            chrome.tabs.remove(tabs[i].id);
                                        }
                                    })
                                })
                            }
                        })
                    }, 29000);
                }
            });
        }
    })
})();