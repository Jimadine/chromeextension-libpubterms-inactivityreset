// Saves options using chrome.storage.local
var storage = chrome.storage.local;

function saveOptions() {
  var statusEl = document.getElementById("status");
  // Save it using the Chrome extension storage API
  var result = {
    'detection_interval': document.getElementById("detection_interval").value,
    'grace_period': document.getElementById("grace_period").value
  }
  storage.set(result, function() {
    storage.get(result, function() {
      var storedDetectionInterval = result.detection_interval
      var storedGracePeriod = result.grace_period
      // Notify that we saved
      if (storedDetectionInterval != "" && storedGracePeriod != "") {
        statusEl.textContent = "Fields saved.";
      } else statusEl.textContent = "Save failure or empty/invalid field(s)";
    });
  });
}

// Restores input box value to saved value from chrome.storage
function restoreOptions() {
  var statusEl = document.getElementById("status");
  storage.get(['detection_interval', 'grace_period'], function(result) {
    var storedDetectionInterval = result.detection_interval || 30
    var storedGracePeriod = result.grace_period || 30
    document.getElementById("detection_interval").value = storedDetectionInterval;
    document.getElementById("grace_period").value = storedGracePeriod;
  });
}

document.addEventListener('DOMContentLoaded', (function() {
  document.getElementById("form1").addEventListener('submit', (function(event) {
    event.preventDefault();
    saveOptions()
  }));
  restoreOptions();
}));
