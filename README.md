# chromeextension-libpubterms-inactivityreset

A Chrome extension created for the University of York Library public catalogue terminals. The extension resets the browser session so that users' sessions are removed after a set period of inactivity. Browsing data is also removed.

Originally authored in 2015 for the Library Sunray thin clients, this version has been modified to work with newer versions of Google Chrome and Chromium, and aestheticized for Windows 10 Action Centre notifications (Dark mode).
#### Testing
The extension can be tested either by:
- enabling `Developer mode` and loading it as an unpacked extension (via More Tools > Extensions), or
- by adding the `--load-extension="c:\path\to\extension"` to a `chrome.exe` shortcut target

![Screenshot of Inactivity Reset Chrome extension](https://lh3.googleusercontent.com/LRCgqrnpRKXh0gzKAjpmPgfFaEBdsUFmsdD_t0PqA1vVpuBGn_92Qsq8Ohso7ZX-jaEANhhUn6FAARNQOjF0mbXe=w640-h400-e365-rj-sc0x00ffffff)

#### Deployment & Availability
The extension was added to the Chrome Web Store via the [Developer Dashboard](https://chrome.google.com/webstore/devconsole). It is currently an `Unlisted` extension, meaning it's available to anyone with the URL, but isn't generally findable; this is because it is a bespoke extension that (currently) wouldn't be very useful for wider, public use. An options page may be added in future, which would make it more generic.

Note that this Manifest Version 2 version of the extension doesn't have an options page, and gets its inactivity period from a custom user agent string, which must be set by whatever is launching Chrome (usually by way of `chrome.exe --user-agent '...'`). See the first six lines of `background.js`; all should then become clear. For versions of this extension with an options page, see the `ManifestV2` and `ManifestV3` branches of this repository.
