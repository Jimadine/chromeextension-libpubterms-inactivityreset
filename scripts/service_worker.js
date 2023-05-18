let detectionIntervalSeconds, graceSeconds, queryStateSeconds, browser

async function createOffscreen() {
  await chrome.offscreen.createDocument({
    url: '../docs/offscreen.html',
    reasons: ['BLOBS'],
    justification: 'keep service worker running',
  }).catch(() => {});
}
chrome.runtime.onStartup.addListener(createOffscreen);
self.onmessage = e => {}; // keepAlive
createOffscreen();

if (navigator.userAgentData) {
  let vendors = navigator.userAgentData.brands;
  browser = vendors.filter(e => e.brand === 'Google Chrome').length > 0 ? 'Chrome' : 'Chromium'
}

// Load the default values on extension installation
chrome.runtime.onInstalled.addListener(() => {
  setVars()
})

// Reload the values any time the extension first starts up
chrome.runtime.onStartup.addListener(() => {
  setVars()
})

// Reload the vars any time the user clicks "Save"
chrome.storage.onChanged.addListener(function(changes, namespace) {
  setVars()
});

function setVars() {
  chrome.storage.local.get(['detection_interval'], function(r) {
    detectionIntervalSeconds = parseInt(r.detection_interval) || 30; // See https://developer.chrome.com/apps/idle#method-setDetectionInterval
    chrome.idle.setDetectionInterval(detectionIntervalSeconds);
  });
}

chrome.idle.onStateChanged.addListener(function(newState) {
  if (newState == 'idle') {
    chrome.history.search({
      'text': '',
      'maxResults': 2
    }, function(historyItems) {
      numVisits = historyItems.length;
      if (numVisits > 1) {
        chrome.storage.local.get(['detection_interval', 'grace_period'], function(r) {
          detectionIntervalSeconds = parseInt(r.detection_interval) || 30; // See https://developer.chrome.com/apps/idle#method-setDetectionInterval
          graceSeconds = parseInt(r.grace_period) || 30; // Number of seconds after detectionIntervalSeconds to check for idleness
          queryStateSeconds = detectionIntervalSeconds + graceSeconds - 3; // When graceSeconds elapses we ask "has Chrome been idle for queryStateSeconds seconds. If so then clear and reset". Also subtract three seconds in case of delays
          let notificationId = (Math.floor(Math.random() * 1000)).toString()
          const title = `${browser} will be reset in ${graceSeconds} seconds`
          const options = {
            body: `Device has been inactive for ${detectionIntervalSeconds} seconds. Move the mouse or type something within ${graceSeconds} seconds to stop ${browser} quitting`,
            icon: '../icons/1429370080_sign-out-white-48.png',
            tag: notificationId,
            requireInteraction: true
          }
          self.registration.showNotification(title, options)
            .then(() => new Promise(resolve => setTimeout(resolve, graceSeconds * 1000)))
            .then(() => self.registration.getNotifications())
            .then(notifications => {
              const notification = notifications.find(notification => notification.tag === notificationId)
              if (notification) {
                notification.close()
              }
              chrome.idle.queryState(queryStateSeconds - 1, function(currState) {
                if (currState == 'idle') {
                  chrome.browsingData.remove({}, {
                    'appcache': true,
                    'cache': true,
                    'cacheStorage': true,
                    'cookies': true,
                    'downloads': true,
                    'fileSystems': true,
                    'formData': true,
                    'history': true,
                    'indexedDB': true,
                    'localStorage': true,
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
            })
        })
      }
    })
  }
})
