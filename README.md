# chromeextension-libpubterms-inactivityreset

A Chrome extension created for the University of York Library public catalogue terminals. The extension resets the browser session so that users' sessions are removed after a set period of inactivity. Browsing data is also removed.

Originally authored in 2015 for the Library Sunray thin clients, this version has been modified to work with newer versions of Google Chrome and Chromium, and aestheticized for Windows 10 Action Centre notifications (Dark mode).

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
