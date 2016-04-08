// ==UserScript==
// @name           Google Images direct link
// @namespace      https://github.com/Lorentz83
// @description    Adds direct links to images and pages in google image search
// @include        http*://images.google.*/images*
// @include        http*://www.google.*/images*
// @include        http*://www.google.*/webhp*
// @include        http*://www.google.*/search?*
// @include        http*://www.google.*/imgres*
// @include        http*://images.google.*/search?*
// @include        https://encrypted.google.com/search?*
// @version        7.0
// @grant          none
// @icon           https://raw.githubusercontent.com/Lorentz83/userscripts/master/GoogleImageDirectLink/icon.png
// @updateURL      https://greasyfork.org/scripts/3187-google-images-direct-link/code/Google%20Images%20direct%20link.meta.js
// @downloadURL    https://greasyfork.org/scripts/3187-google-images-direct-link/code/Google%20Images%20direct%20link.user.js
// @supportURL     https://github.com/Lorentz83/userscripts
// @license        GPLv2; http://www.gnu.org/licenses/
// ==/UserScript==

/**
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var addCss = function ( /* args... */) {
  var css = new Array(arguments.length);
  for (var i = 0; i < arguments.length; i++) {
    css[i] = arguments[i];
  }
  var style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css.join('\n')));
  document.head.appendChild(style);
}

var parseUrl = function (url) {
  var pos = url.indexOf('?');
  if (pos < 0) {
    return [];
  }
  var qparms = url.substring(pos + 1);
  var rawparams = qparms.split('&');
  var par = [];
  for (var i = 0; i < rawparams.length; i++) {
    var p = rawparams[i].split('=');
    var key = decodeURIComponent(p[0]);
    var value = decodeURIComponent(p[1]);
    par[key] = value;
  }
  return par;
}

var getImageLinks = function (url) {
  var param = parseUrl(url);
  return {
    toImgHref: param['imgurl'],
    toPageHref: param['imgrefurl']
  };
}

var stopEvent = function (event) {
  event.stopPropagation();
}

var fixImageBox = function (div) {
  if (div.dataset.fixed) {
    return;
  }
  div.dataset.fixed = true;
  // useful objects
  var a = div.getElementsByTagName('a')[0];
  var span = div.querySelector('span.rg_ilmn');
  var links = getImageLinks(a.href);
  //mirror style to container
  div.style.height = a.style.height;
  div.style.width = a.style.width;
  div.style.left = a.style.left;
  //replace image anchor
  var newA = document.createElement('a');
  newA.style = a.style;
  while (a.childNodes.length) { 
    newA.appendChild(a.firstChild); 
  }
  newA.href = links.toImgHref;
  a.parentNode.replaceChild(newA, a);
  a = newA;
  //create the new container
  var newContainer = document.createElement('div');
  div.appendChild(newContainer);
  newContainer.className = 'newCont';
  newContainer.appendChild(a);
  newContainer.appendChild(span.parentNode);
  //create the link to the website
  var spanLink = document.createElement('a');
  spanLink.style.color = '#fff';
  spanLink.textContent = span.textContent;
  spanLink.href = links.toPageHref;
  while (span.firstChild) {
    span.removeChild(span.firstChild);
  }
  span.appendChild(spanLink);
  span.addEventListener('click', stopEvent, false);
}

var waitLink = {
  _conf: {
    attributes: true,
    attributeFilter: ['href']
  },
  _observer: new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.target.parentNode != null) {
        waitLink.prepareImageFix(mutation.target.parentNode)
      }
    });
  }),
  _watch: function (a) {
    waitLink._observer.observe(a, waitLink._conf);
  },
  reset: function () {
    waitLink._observer.disconnect();
  },
  prepareImageFix: function (div) {
    var as = div.getElementsByTagName('a');
    if (as.length > 0) {
      if (as[0].href != '') {
        fixImageBox(div);
      } else {
        waitLink._watch(as[0]);
      }
    }
  }
}

var fixInitialImages = function () {
  var container = document.getElementById('rg_s');
  var divs = container.children
  for (var i = 0; i < divs.length; i++) {
    var div = divs.item(i);
    waitLink.prepareImageFix(div);
  }
}

var newSearchObserver = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.target.id === 'rg_s') {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var newNode = mutation.addedNodes.item(i);
        if (newNode.classList && newNode.classList.contains('rg_el')) {
          waitLink.prepareImageFix(newNode);
        }
      }
    }
    if (mutation.target.id === 'rg') {
      waitLink.reset();
      fixInitialImages();
    }
  });
});

var biggerContainer = document.getElementById('center_col');
newSearchObserver.observe(biggerContainer, {childList: true,subtree: true});

fixInitialImages();

addCss(
  '.newCont { min-height: 30px; position: relative; height:100%; overflow: hidden; }',
  '.newCont>a { display: block; width: 100%; text-align: center; }',
  '.newCont>a>img { display: inline-block; }', '.newCont > a :not(img) { display: none; visibility: hidden; }',
  '.newCont .rg_ilmbg { display: none; left:0; }',
  '.newCont:hover .rg_ilmbg { display: block; }',
  '.newCont .rg_anbg, .newCont .rg_an { display: block; visibility: visible; text-align: left;}',
  '.imgSiteLnk {',
  '  background-color: rgba(255, 255, 255, 0.77);',
  '  bottom: 0;',
  '  color: #000000;',
  '  display: block;',
  '  line-height: normal;',
  '  position: absolute;',
  '  text-decoration: none;',
  '  width: 100%; ',
  '  display: none;',
  '}',
  '.imgPrev:hover .imgSiteLnk { display: block }'
);
