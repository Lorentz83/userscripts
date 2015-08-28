// ==UserScript==
// @name           Google Images direct link
// @namespace      https://github.com/Lorentz83
// @description    Add direct link to images and pages in google image search
// @include        http*://images.google.*/images*
// @include        http*://www.google.*/images*
// @include        http*://www.google.*/webhp*
// @include        http*://www.google.*/search?*
// @include        http*://www.google.*/imgres*
// @include        http*://images.google.*/search?*
// @include        https://encrypted.google.com/search?*
// @version        6
// @grant          none
// @icon           https://raw.githubusercontent.com/Lorentz83/userscripts/master/GoogleImageDirectLink/icon.png
// @updateURL      https://greasyfork.org/scripts/3187-google-images-direct-link/code/Google%20Images%20direct%20link.meta.js
// @downloadURL    https://greasyfork.org/scripts/3187-google-images-direct-link/code/Google%20Images%20direct%20link.user.js
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

var isUndefined = function(val) {
	return ( (typeof val) === 'undefined' );
}
var decode = function(component) {
	if ( isUndefined(component) )
		return false;
	return decodeURIComponent(component);
}

var doubleDecode = function (component){
  if ( isUndefined(component) )
	return false;
  var tmp = decodeURIComponent(component);
  tmp = decodeURIComponent(tmp);
  return tmp;
}

var parseUrl = function (url) {
  var pos = url.indexOf('?');
  if (pos < 0)
    return [];
  var qparms = url.substring(pos+1);
  var rawparams = qparms.split('&');
  var par = [];
  for (var i=0 ; i<rawparams.length ; i++){
    var p = rawparams[i].split("=");
    par[p[0]] = p[1];
  }
  return par;
}

var getImageLinks = function (url) {
  var param = parseUrl(url);
  var links = new Object();
  links.toImgHref = decode(param["imgurl"]);
  links.toPageHref = decode(param["url"]);
  return links;  
}

var getNewImageLinks = function (url) {
  var param = parseUrl(url);
  var links = new Object();
  links.toImgHref = doubleDecode(param["imgurl"]);
  links.toPageHref = decode(param["imgrefurl"]);
  return links;  
}

var firstOrNull = function (elems) {
  return (elems.length > 0 ) ? elems[0] : null;
}

var hashRegEx = /imgrc=([^&]*)&/;


console.log("checking hash ",window.location.hash )
var match = hashRegEx.exec(window.location.hash);
var name = null;
if (match != null) {
  name = match[1];
} else {
  console.log("checking URL");
  var fir = parseUrl(window.location.href)['fir'];
  if ( fir!= null ){
    name = doubleDecode(fir).split(',')[0];
  }
}
if (name != null){
  console.log("big preview found, trying to redirect directly to the image", name);
  var els = document.getElementsByName(name);
  
  if (els.length > 0) {
    console.log("found image, trying to redirect directly to the image");
    var link = els[0].parentElement.href;
    console.log(link);
    var imgLink = getImageLinks(link).toImgHref;
        console.log(imgLink);

    if (imgLink != null) {
     window.location.replace(imgLink);
    }
  }
}

var imgTable = firstOrNull(document.getElementsByClassName('images_table'));
if ( imgTable ) { // for basic version
  var imgCell = imgTable.getElementsByTagName('td');
  for( j=0 ; j<imgCell.length ; j++ ) {
    var imageAnchor = imgCell[j].getElementsByTagName('a')[0];
    var domainText =  imgCell[j].getElementsByTagName('cite')[0];
    console.log(imageAnchor.href);
    var links = getImageLinks(imageAnchor.href);
    //links.toPageHref = imageAnchor.href; // TODO fixme
    links.toImgHref = imageAnchor.href; // TODO fixme
    
    domainText.innerHTML = '<a href="' + links.toPageHref + '">' + domainText.innerHTML + '/&hellip;<\a>';
    imageAnchor.href = links.toImgHref;
  }
}
else { // standard version
  console.log("standard version");
  var stopEvent = function(event){
    event.stopPropagation() 
  }
  
  var fixStyle = function(target){
    if (target.style.color == 'gray')
      return; //only to avoid endless loops
    target.style.color = 'gray'; 
    var parent = target.parentNode;
    parent.style.height = target.style.height;
    parent.style.width = target.style.width;
    parent.style.left = target.style.left;
    
  }
  
  var fixBoxObserver = new MutationObserver(function(mutations){
    mutations.forEach(function(mutation) {
      var target = mutation.target;
      var parent = mutation.target.parentNode;
      if (mutation.attributeName === 'style'){
	      fixStyle(target);
      }
    });
  });
  var fixBoxMutationConfig = { attributes: true, childList: true, characterData: false, subtree: false };
    
  var fixImageBox = function(image){
    if ( /\blinkOk\b/.test(image.className) ) {
      return;
    }
    var span = image.querySelector('span.rg_ilmn');
    if (span !== null) {
      var a = firstOrNull(image.getElementsByTagName('a'));
      var links = getNewImageLinks(a.href);
      a.href = links.toImgHref;
      
      var newA = document.createElement('a');
      newA.style = a.style;
      newA.innerHTML = a.innerHTML;
      newA.href = a.href;
      a.parentNode.replaceChild(newA, a);
      a=newA;
      a.addEventListener('click', stopEvent, false);

      var newContainer = document.createElement('div');
      newContainer.className = 'newCont';

      a.parentNode.appendChild(newContainer);
      newContainer.appendChild(a);
      newContainer.appendChild(span.parentNode);

      fixStyle(a);
      
      var desc = span.innerHTML;
      span.innerHTML = '<a style="color:#fff" href="' + links.toPageHref + '">' + desc + '</a>';
      span.addEventListener('click', stopEvent, false);
      image.className += ' linkOk'
      fixBoxObserver.observe(a, fixBoxMutationConfig);
    }
    else {
      console.log("incomplete span");
      image.className += ' notComplete';
    }
  }
 
  var fixImages = function(){
    var imagesContainer = document.getElementById('rg_s');
	if ( imagesContainer == null ) return;
    var images = imagesContainer.getElementsByClassName('rg_di');
    for (var i = 0 ; i< images.length ; i++) {
      fixImageBox(images[i]);
    }
  }
  
  var newBoxMutationConfig = { attributes: false, childList: true, characterData: false, subtree: true };
  var newBoxObserver = new MutationObserver(function(mutations){
    var needFix = false;
    mutations.forEach(function(mutation) {
      needFix = needFix || mutation.target.id == 'rg_s';
    });
    if (needFix)
      fixImages();
  });

  fixImages();
  newBoxObserver.observe(document.body, newBoxMutationConfig);

  var css = [];  var i = 0;
  css[i++] = '.newCont { min-height: 30px; position: relative; height:100%; overflow: hidden; }';
  css[i++] = '.newCont>a { display: block; width: 100%; text-align: center; }';
  css[i++] = '.newCont>a>img { display: inline-block; }';
  css[i++] = '.newCont > a :not(img) { display: none; visibility: hidden; }';
  css[i++] = '.newCont .rg_ilmbg { display: none; left:0; }';
  css[i++] = '.newCont:hover .rg_ilmbg { display: block; }';
  
  css[i++] = '.imgSiteLnk {'; //img preview
  css[i++] = '  background-color: rgba(255, 255, 255, 0.77);';
  css[i++] = '  bottom: 0;';
  css[i++] = '  color: #000000;';
  css[i++] = '  display: block;';
  css[i++] = '  line-height: normal;';
  css[i++] = '  position: absolute;';
  css[i++] = '  text-decoration: none;';
  css[i++] = '  width: 100%; ';
  css[i++] = '  display: none }';
  css[i++] = '.imgPrev:hover .imgSiteLnk { display: block }';//img preview
  var style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css.join('\n')));
  document.head.appendChild(style);

  //img preview in google search (only links to page)
  var fixImagePreview = function(){
	var images = document.getElementsByClassName('bicc');
	console.log('img preview in google search ' + images.length);
	for (var i = 0 ; i<images.length ; i++) {
		var div = images[i];
    var anchor = div.getElementsByTagName('a');
		var img = div.getElementsByTagName('img');
		if ( img.length == 1 && div.className.indexOf('imgPrev')==-1 ) {
			div.className += ' imgPrev';
			//div.style.border = '4em solid black';
			var link = img[0].title;
			
			var a = document.createElement('a');
			a.href = link;
			a.className = 'imgSiteLnk';
			a.textContent = link.split('/')[2];
			div.appendChild(a);
		}
	}
  }
  var searchObserver = new MutationObserver(function(mutations){
	fixImagePreview();
  });
  searchObserver.observe(document.body, 
	{ 
		attributes: false, 
		childList: true, 
		characterData: false, 
		subtree: true 
	}
	);
  
  // visually similar search img preview (oly links to image)
  var similars = document.querySelectorAll('div#ires div.th a');
  console.log('visually similar search ' + similars.length)
  for (var i = 0 ; i < similars.length ; i++){
	var a = similars[i];
	var href = getNewImageLinks(a.href);
	if ( href.toImgHref === false  ) {
		continue;
	}
	var newA = document.createElement('a');
	newA.href = href.toImgHref;
	newA.appendChild(a.firstChild);
	a.parentNode.replaceChild(newA, a);
  }
  
  
  console.log('end standard version');
} //end standard version

