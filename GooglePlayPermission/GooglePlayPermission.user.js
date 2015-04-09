// ==UserScript==
// @name        GooglePlayPermission
// @description List app permissions in Google Play search result page. Click on a permission to delete from the page every app that request it.
// @namespace   https://github.com/Lorentz83/
// @include     https://play.google.com/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.js
// @version     2.2
// @grant       none
// @license     GPLv2; http://www.gnu.org/licenses/
// @noframes
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

var PermissionFilters = function() {
    var This = this;

    this._getPermissionBox = function () {
        var fiters = $('#filterPermission');
        if ( fiters.size() == 0 ) {
            fiters = $('<ul id="filterPermission"/>');
            $('.cluster-heading').append(fiters);
        }
        return fiters;
    }
    
    this.getFilters = function (){
        var filters = [];
        This._getPermissionBox().find('li').each(function(){filters.push($(this).text())});
        return filters;
    }
    
    this.isFiltered = function (permissions){
        var filters = This.getFilters();
        for ( var i = 0 ; i<permissions.length ; i++ ){
            if ( $.inArray(permissions[i], filters) >= 0 ){
                return true;
            }
        }
        return false;
    }
    
    this._removeFilter = function(){
        $(this).remove();
        $(This).trigger('filterAltered', [ This.getFilters() ] );
    }
    
    this._addFilterBreadCrumb = function (permission){
        var removePerm = $('<li/>');
        removePerm.click(This._removeFilter);
        removePerm.text(permission);
        removePerm.appendTo(this._getPermissionBox());
    }

    this.addFilter = function(permission){
        this._addFilterBreadCrumb(permission);
        
        $(this).trigger('filterAdded', [permission] );
    }


}
var permissionFilterer = new PermissionFilters();

/////////////////////////////////

var AppCardManager = function(permissionFilterer){
    var This = this;
    
    this.permissionFilterer = permissionFilterer;
    
    this._parseReponse = function(data) {
        var details;
        data = data.replace(")]}'\n\n","details = ");
        eval(data);
        details = details[0][2][0][55][42656262][1];
	      //console.log(details)
        var permissions = [[],[],[]];
        details.forEach(function(el, idx){
            el.forEach(function (el, idx){
                if ( el[1].constructor === Array ) {
                    el[1].forEach(function(el, idx){
                        permissions[0].push(el[0]);
                    });
                } else {
                    permissions[2].push(el[1]);
                }
            });
        });
        return permissions;
    }
   
    this._loadPermissionAjaxSuccess = function (data, textStatus, jqXHR ) {
        var permissions = This._parseReponse(data);
        var permissionBox = this.permissionHtmlContainer;
        permissionBox.removeClass('loading');
        var permissionColors = ['red', 'yellow', 'green'];
        var isFiltered = false;
        for(var n = 0 ; n <= 2 ; n++){
            var ul = $('<ul/>');
            ul.css("border-left","2px solid "+permissionColors[n]);
            ul.appendTo(permissionBox);

            for (var i = 0 ; i<permissions[n].length ; i++ ){
                var li = $('<li/>');
                li.click(function(){This.permissionFilterer.addFilter($(this).text())});
                li.text(permissions[n][i]).appendTo(ul);
            }
            isFiltered = isFiltered || This.permissionFilterer.isFiltered(permissions[n]);
        }
        if (isFiltered)
            this.appHtmlContainer.slideUp(500);
    }
    
    this._loadPermissionAjaxFailure = function (qXHR, textStatus, errorThrown) {
        var permissionBox = this.permissionHtmlContainer;
        permissionBox.removeClass('loading');
        permissionBox.addClass('error');
        permissionBox.html('Error:<br/>' + errorThrown);
    }
    
    this.loadPermissionAjax = function (appHtmlContainer, permissionHtmlContainer, appID) {
        $.ajax({
          permissionHtmlContainer: permissionHtmlContainer,
          appHtmlContainer: appHtmlContainer,
          type: 'POST',
          url:  'https://play.google.com/store/xhr/getdoc?authuser=0',
          data: { ids: appID },
          dataType: 'text',
          success: This._loadPermissionAjaxSuccess,
          error: This._loadPermissionAjaxFailure
        });
    }
    
    this.i=3;
    this.loadPermissionForHtmlCard = function (index, element) { 
        //if ( This.i --< 0) return;
        var card = $(element);
        var href = $(element).find('.card-click-target').attr('href');
        if(href == null)
            return;
        var id = href.substring( href.indexOf('=') + 1 );
        card.append('<div class="permissionBox card-content"><div class="permission loading"></div></div>');
        This.loadPermissionAjax(card, card.find('.permission'), id); 
    }
    
    this.filterPermission = function(event, permission){
        var toDel = $('.card:has(.permission li:contains("'+permission+'"))');
        toDel.slideUp(500);
    }
    
    this.refilterPermission = function(event, permissions){
        $('.card:hidden').each(function(){
            var el = $(this);
            for (var n = 0 ; n<permissions.length ; n++) {
                if (el.find('.permission li:contains("'+permissions[n]+'"))').size()>0) {
                   return;
                }
            }
            el.slideDown(500)
        });
    }
    
    $(this.permissionFilterer).on('filterAdded', this.filterPermission);
    $(this.permissionFilterer).on('filterAltered', this.refilterPermission);
}

var appCardManager = new AppCardManager(permissionFilterer);

//////////////////////////////////////////////////////

var MutationObservers = function(loadPermissionForCard){
    var This = this;
    this.loadPermissionForCard = loadPermissionForCard;
    this._mutationConfig = { attributes: false, childList: true, characterData: false, subtree: false };
    
     /** 
     * Greasemonkey doesn't recognize when a js manipulate the page history, so I make a manual check
     * https://developer.mozilla.org/en-US/docs/Web/Guide/DOM/Manipulating_the_browser_history
     */
    this.isValidUrl = function (url) {
        if( url.indexOf("https://play.google.com/store/search?") != -1 ) return true;
        if( url.indexOf("https://play.google.com/store/apps") != -1 ) return true;
        return false;
    }
    
    this.cardObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        for (var i=0 ; i<mutation.addedNodes.length; i++){
            This.loadPermissionForCard(i, mutation.addedNodes.item(i));
        }
      });
    });
    
    this.checkPage = function() {
        if(This.isValidUrl(window.location.href)){
            console.log('enable');
            $('#body-content').addClass('permissionStyle');
            var cardList = document.getElementsByClassName('card-list');
            if ( cardList.length > 0 ) { // we may be in a detail page
                This.cardObserver.observe(cardList[0], This._mutationConfig);
                $('.card').each( This.loadPermissionForCard );
            }
        }
    }
    
    this.newPageObserver = new MutationObserver(function(mutations){
        mutations.forEach(function(mutation) {
            if( $(mutation.removedNodes).find('.card-list').size() > 0 ){
                console.log('disable');
                This.cardObserver.disconnect();
                $('#body-content').removeClass('permissionStyle');
            }
            if( $(mutation.addedNodes).find('.card-list').size() > 0 ){
                This.checkPage();
            }
        });
    });
    console.log(window.location.href);
    if ( document.getElementById('body-content') != null ) {
        this.newPageObserver.observe(document.getElementById('body-content'), this._mutationConfig);
        this.checkPage();
    }
}

var observers = new MutationObservers(appCardManager.loadPermissionForHtmlCard);

//card apps square-cover tiny no-rationale
//card apps square-cover small no-rationale

var loading = 'data:image/gif;base64,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'+
'Cwg1RAAAOwAAAAAAAAAAAA==';


var i=0;
var css = [];
css[i++] = '<style type="text/css" id="permissionCss">';
css[i++] = ".permissionStyle div.card.apps.square-cover";
css[i++] = "     { width: 320px; height: 245px; }";
css[i++] = ".permissionStyle div.card-content";
css[i++] = "     { float: left;  width: 50%; }";
css[i++] = ".permission {";
css[i++] = "       width: 171px; height: 100%; ";
css[i++] = "       overflow: auto;";
css[i++] = "       transition: all .5s ease 0s;";
css[i++] = " }";
css[i++] = ".permission:hover { width: 160px; }";
css[i++] = ".permissionBox {";
css[i++] = "     background-color: #FFFFFF;";
css[i++] = "     float: right;";
css[i++] = "     height: 100%;";
css[i++] = "     width: 50%;";
css[i++] = "     word-wrap: break-word;";
css[i++] = "       overflow: hidden;";
css[i++] = " }";
css[i++] = ".permission ul { padding-left: 10px; width: 130px; list-style: disc outside none; }";
css[i++] = ".permission li { cursor: pointer; }";
css[i++] = ".permissionBox:after {";
css[i++] = "    background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%) repeat scroll 0 0 transparent;";
css[i++] = "    bottom: 0;";
css[i++] = "    content: ' ';";
css[i++] = "    height: 15px;";
css[i++] = "    position: absolute;";
css[i++] = "    width: 155px;";
css[i++] = "    transition: all .5s ease 0s;";
css[i++] = "}";
css[i++] = ".permissionBox:hover:after { height: 0; width: 144px;}";
css[i++] = ".loading { background: #fff url("+loading+") no-repeat scroll center center}";
css[i++] = "#filterPermission { background-color: white; font-size: 11px; font-weight: 300; padding-left: 4em; }";
css[i++] = ".permission.error { color: red; }";
css[i++] = '</style>';
$('head').append(css.join('\n'));

