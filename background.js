(function() {
  var detectionIntervalSeconds, graceSeconds, queryStateSeconds

  function setVars() {
    chrome.storage.local.get(['detection_interval', 'grace_period'], function(result) {
      detectionIntervalSeconds = parseInt(result.detection_interval) || 30; // See https://developer.chrome.com/apps/idle#method-setDetectionInterval
      graceSeconds = parseInt(result.grace_period) || 30; // Number of seconds after detectionIntervalSeconds to check for idleness
      queryStateSeconds = detectionIntervalSeconds + graceSeconds - 3; // When graceSeconds elapses we ask "has Chrome been idle for queryStateSeconds seconds. If so then clear and reset". Also subtract three seconds in case of delays
      chrome.idle.setDetectionInterval(detectionIntervalSeconds);
    });
  }

  // Reload the vars any time the user clicks "Save"
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    setVars()
  });

  setVars()

  chrome.idle.onStateChanged.addListener(function(newState) {
    if (newState == 'idle') {
      chrome.history.search({
        'text': '',
        'maxResults': 2
      }, function(historyItems) {
        numVisits = historyItems.length;
        if (numVisits > 1) {
          notification = new Notification('Browser will be reset in ' +graceSeconds+ ' seconds', {
            body: 'Web browser has been inactive for ' + detectionIntervalSeconds + ' seconds. Move the mouse or type something within ' +graceSeconds+ ' seconds to stop Chrome quitting',
            icon: '1429370080_sign-out-white-48.png',
            requireInteraction: true
          })
          setTimeout(function() {
            notification.close()
            chrome.idle.queryState(queryStateSeconds, function(currState) {
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
          }, graceSeconds * 1000);
        }
      });
    }
  })
})();
