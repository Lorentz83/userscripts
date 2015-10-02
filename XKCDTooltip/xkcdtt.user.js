// ==UserScript==
// @name           XKCD tooltip
// @namespace      https://github.com/Lorentz83
// @description    This script puts the xkcd tooltip under the picture and adds a link to explainxkcd.com
// @include        http*://xkcd.com/*
// @include        http*://www.xkcd.com/*
// @include        http*://what-if.xkcd.com/*
// @include        http*://www.what-if.xkcd.com/*
// @grant          none
// @version        1.1c
// @icon           https://raw.githubusercontent.com/Lorentz83/userscripts/master/XKCDTooltip/icon.png
// @updateURL      https://greasyfork.org/scripts/3188-xkcd-tooltip/code/XKCD%20tooltip.meta.js
// @downloadURL    https://greasyfork.org/scripts/3188-xkcd-tooltip/code/XKCD%20tooltip.user.js
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

var css = [];
var i = 0;
css[i++] = ".xkcdtooltip {";
css[i++] = "    background-color: #6e7b91; ";
css[i++] = "    box-shadow: 0 0 5px 0 gray; ";
css[i++] = "    color: #fff; ";
css[i++] = "    font-weight: bold; ";
css[i++] = "    border-color: #071419; ";
css[i++] = "    border-radius: 12px; ";
css[i++] = "}";
css[i++] = ".tooltip { ";
css[i++] = "    padding: 5px; ";
css[i++] = "    margin: 2ex auto 1ex; ";
css[i++] = "    font-size: 70%; ";
css[i++] = "    width: 60%; ";
css[i++] = "    border-style: solid; ";
css[i++] = "    border-width: 1.5px; ";
css[i++] = "}";

var addAfter = function (dom, newNode){
    dom.parentNode.insertBefore(newNode, dom.nextSibling);
}

var addTitleBox = function(img, after, cssClass) {
      var title = img.title;
      if(title.length == 0)
	 return null;
      //img.title='';
    
      var titleBox = document.createElement('div');
      titleBox.innerHTML = title;
      titleBox.classList.add('tooltip');
      titleBox.classList.add(cssClass);
  
      addAfter(after,titleBox);
      return titleBox;
}

window.onload = function() {  
  var comicBox = document.getElementById('comic');
  
  if (comicBox) {
      var img = comicBox.getElementsByTagName('img')[0];
      var titleBox = addTitleBox(img, comicBox, 'xkcdtooltip');
      var name = document.getElementById('ctitle').innerHTML;
      var a = document.createElement('a');
      var id = document.location.href.split('/')[3];
      a.href = 'http://www.explainxkcd.com/wiki/index.php?title=' + id;
      a.innerHTML = 'explain this';
      addAfter(titleBox,a);
  }
  
  var article = document.getElementsByTagName('article');
  if(article.length > 0){
    var imgs = article[0].getElementsByTagName('img');
    for (var i =0 ; i<imgs.length ; i++){
        addTitleBox(imgs[i], imgs[i], 'whatiftooltip');
    }
  }

  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css.join('\n');
  document.head.appendChild(style);
};
