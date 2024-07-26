# chromeextension-libpubterms-inactivityreset

A Chrome extension created for the University of York Library public catalogue PCs. The extension resets the browser session so that all browsing data is removed after a set period of device inactivity and all browsing tabs are closed (leading to the closure of the parent `chrome.exe` process). It is then the responsibility of another process to relaunch the browser e.g. a script triggered by a scheduled task.

Originally authored in 2015 for the Library Sunray thin clients, this version has been modified to work with newer versions of Google Chrome and Chromium, and aestheticized for Windows 10 Action Centre notifications (Dark mode). Originally the tabs were closed in order to guarantee a fresh browsing session. The browsing history was also queried/stored separately, for statistical purposes,  though it's unclear whether this continued to work after we rolled out this extension, since the extension also deletes the browsing history (as is necessary in order to determine if initial user activity has occurred, to avoid unnecessary browser closures, e.g. when it's quiet and the PC is not in regular use). It would probably be possible to modify the extension to close all the existing tabs but open a new tab at the start page URL without closing the browser as part of this sequence. However, we have to have another process in place anyway, to test whether Chrome is running and if not relaunch it, because a user may close the browser themselves, which is an unavoidable and very likely scenario.

#### Options

The extension's options page provides two user-settable options:
- the Detection Interval in seconds. This defines how frequently the extension checks for inactivity.
- the Grace Period in seconds. This defines the period after notifying the user that the browser will be closed (provided no further activity).

The default values for both options are 30 seconds.

There is an alternative way to supply the values for the above options. You can set a custom user agent string (UAS) with the values tacked onto the end of the string in the following format:
```
d=X,g=Y
```
`d` represents `Detection Interval in seconds`, while `g` represents `Grace Period in seconds`.

Here's an example of a valid UAS:
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 d=45,g=50
```
To use this, you would need to launch Chrome with the `--user-agent` command line option, e.g.:
```
chrome.exe --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 d=45,g=50"
```
Note that if you choose to use this method of setting the options, it is highly recommended that you dynamically construct the custom UAS based on the real, current UAS of Chrome, + the values tacked onto the end. If you hard-code the entire string and use that in perpetuity, over time some web sites may falsely detect that you're using an outdated version of Chrome. Hint: on Chrome for Windows, you should be able to get the current UAS from the registry in `HKCU\Software\Google\Chrome\BLBeacon\version`.

Here's some example Powershell that can be adapted for your needs:
```
[string]$version = ((Get-ItemProperty "HKCU:\Software\Google\Chrome\BLBeacon").version) -replace '(\d+\.\d+)\.\d+\.\d+', '$1.0.0'
[string]$options = 'd=45,g=50'
[string]$customUAS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + $version + ' Safari/537.36 ' + $options
```
Note that when supplied via a custom UAS, very low options values — 14 seconds or less — should **not** be used for the following reasons:
- for the Detection Interval option value, the underlying `chrome.idle.setDetectionInterval` API method requires a minimum value of `15`
- for the Grace Period option value, for consistency, this option also requires a minimum value of `15` (though there are no underlying technical constraints on what this value could be set to)

The maximum values for both options are `3000` (50 minutes).

Options values set via the options page have the same limits; minimum values of `15` and maximum values of `3000` for both options. These limits are enforced by the HTML `min` attributes set in the page.

#### Testing
The extension can be tested either by:
- enabling `Developer mode` and loading it as an unpacked extension (via More Tools > Extensions), or
- by adding the `--load-extension="c:\path\to\extension"` to a `chrome.exe` shortcut target

![Screenshot of Inactivity Reset Chrome extension](https://lh3.googleusercontent.com/LRCgqrnpRKXh0gzKAjpmPgfFaEBdsUFmsdD_t0PqA1vVpuBGn_92Qsq8Ohso7ZX-jaEANhhUn6FAARNQOjF0mbXe=w640-h400-e365-rj-sc0x00ffffff)

#### Deployment & Availability
The extension was added to the Chrome Web Store via the [Developer Dashboard](https://chrome.google.com/webstore/devconsole). It is currently an `Unlisted` extension, meaning it's available to anyone with the URL, but isn't generally findable; this is because it is a bespoke extension that (currently) wouldn't be very useful for wider, public use.

#### Manifest V3
This version is a [Manifest V3 extension](https://developer.chrome.com/docs/extensions/mv3/intro/). As such, in this version there are some necessary changes to the way that the extension works:
- Background pages are no longer supported in MV3, with ephemeral Service Workers replacing them. A "hack" is required to persist Service Workers, in order to ensure that the `chrome.idle` detection continues to work. Further details below.
- Web notifications do not work with Service Workers. Instead, the Service Worker `showNotification()` method of the `ServiceWorkerRegistration` interface is used.

Persistent Service Workers hack:
```
From https://stackoverflow.com/a/66618269

Courtesy of Keven Augusto.

In Chrome 109 and newer you can use offscreen API to create an offscreen document and send some message from it every 30 second or less, to keep service worker running. Currently this document's lifetime is not limited (only audio playback is limited, which we don't use), but it's likely to change in the future.

manifest.json

    "permissions": ["offscreen"]

offscreen.html

    <script src="offscreen.js"></script>

offscreen.js

    setInterval(async () => {
      (await navigator.serviceWorker.ready).active.postMessage('keepAlive');
    }, 20e3);

background.js

    async function createOffscreen() {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['BLOBS'],
        justification: 'keep service worker running',
      }).catch(() => {});
    }
    chrome.runtime.onStartup.addListener(createOffscreen);
    self.onmessage = e => {}; // keepAlive
    createOffscreen();

Note 20e3 is scientific (or exponential) notation
```
