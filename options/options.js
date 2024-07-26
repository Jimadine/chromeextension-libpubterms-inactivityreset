// Saves options using chrome.storage.local
var storage = chrome.storage.local;
var detection_interval_default = '30';
var grace_period_default = '30';

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
    var storedDetectionInterval = result.detection_interval || detection_interval_default
    var storedGracePeriod = result.grace_period || grace_period_default
    document.getElementById("detection_interval").value = storedDetectionInterval;
    document.getElementById("grace_period").value = storedGracePeriod;
  });
}

function resetNotify() {
  document.getElementById("detection_interval").defaultValue = detection_interval_default;
  document.getElementById("grace_period").defaultValue = grace_period_default;
  var statusEl = document.getElementById("status");
  statusEl.textContent = "Fields reset to defaults. Saving...";
  setTimeout(saveOptions,4000)
}

document.addEventListener('DOMContentLoaded', (function() {
  document.getElementById("form1").addEventListener('submit', (function(event) {
    event.preventDefault();
    saveOptions()
  }));
  restoreOptions();
  document.getElementById("form1").addEventListener('reset', (function(event) {
    resetNotify()
  }));

}));
