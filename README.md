# chromeextension-libpubterms-inactivityreset

A Chrome extension created for the University of York Library public catalogue terminals. The extension resets the browser session so that users' sessions are removed after a set period of inactivity. Browsing data is also removed.

Originally authored in 2015 for the Library Sunray thin clients, this version has been modified to work with newer versions of Google Chrome and Chromium, and aestheticized for Windows 10 Action Centre notifications (Dark mode).

#### Testing
The extension can be tested either by:
- enabling `Developer mode` and loading it as an unpacked extension (via More Tools > Extensions), or
- by adding the `--load-extension="c:\path\to\extension"` to a `chrome.exe` shortcut target
