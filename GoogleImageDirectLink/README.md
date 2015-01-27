Google Images direct link
=========================

**Summary**: Add direct links to images and pages in google image
search. 
Works in Chrome, Firefox and Opera. Please report any bug, I use only
Firefox, so some updates my break other browsers compatibility.

If you don't like the frame that Google Images leave in the pages when
you click on an image, this script is for you.
For each result image this script change the link to point directly to
the image, and add another link that point to the page that holds the
image.

Opera users please read [this](http://www.opera.com/docs/userjs/using/#securepages).

To install in google chrome Google chrome follow
[this](http://techie-buzz.com/browsers/chrome-blocking-extension-apps-scripts-chrome-web-store.html)
instructions or use the extension
[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en).

**Note:** The basic search is now broken.

## Changelog

### Version 5.4
- [bugfix](https://greasyfork.org/en/forum/discussion/2898/a-new-tab): chrome didn't open new tabs on middle click

### Version 5.3
- new (and useful) namespace
- updateURL and downloadURL point to greasyfork.org
- bugfix (nothing happened on left click on an image)

### Version 5.2
Bug fix: wrong url in youtube video preview

### Version 5.1
bug fixes:
- Direct link to pages in google search image preview (see here)
- URLs truncated after question mark (see here and here)

### Version 5
new features:
- Direct link to pages in google search image preview (see here)
- Direct link to images in similar image search (see here)

### Version 4.8a
Bugfix: removed garbage from links (see here)

### Version 4.8
Autoupdate and icon

### Version 4.7
bugfix: 
- The script now works also when search tools are used to refine search
- The image "age" doesn't cover the page link anymore

### Version 4.6
This is a quick fix, please report any bug.
- Updated to react to the new version of google images (Jan 2014).
- Basic search still doesn't work and other browsers
compatibility may be broken. 

### Version 4.5
Fixed a bug: the html generated was invalid, Firefox and Chrome work
regardless it, but opera has an unexpected behavior

### Version 4.4
Restored compatibility with Opera and Chrome (through Tampermonkey)
and code cleanup

### Version 4.2
Fixed a bug which prevents "open page" on some images

### Version 4.1
Bugfix and code cleanup

### Version 4.0
Quick and dirty fix for the new version of google images, please
report bugs and stay tuned for newer version :)

### Version 3.8
Restored google chrome compatibility

