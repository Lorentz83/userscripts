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
 
var addAfter = function (dom, newNode){
    dom.parentNode.insertBefore(newNode, dom.nextSibling);
}

var addTitleBox = function(img, after) {
      var title = img.title;
      if(title.length == 0)
	 return;
      //img.title='';
    
      var titleBox = document.createElement('div');
      titleBox.innerHTML = title;
      titleBox.classList.add('box');
      titleBox.style.backgroundColor='#6e7b91';
      titleBox.style.boxShadow='0 0 5px 0 gray';
      titleBox.style.padding='5px';
      titleBox.style.width='60%';
      titleBox.style.margin='2ex auto 1ex';
      titleBox.style.fontSize='70%';
      titleBox.style.fontWeight='bold';
      titleBox.style.color='#fff';
  
      addAfter(after,titleBox);
      return titleBox;
}

window.onload = function() {  
  var comicBox = document.getElementById('comic');
  
  if (comicBox) {
      var img = comicBox.getElementsByTagName('img')[0];
      
      var titleBox = addTitleBox(img,comicBox);
    
    
    
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
        addTitleBox(imgs[i], imgs[i]);
    }
  }

};  
