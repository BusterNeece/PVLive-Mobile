/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

$(function() {
    receivedEvent('onload');

    $.extend($.mobile.path, {
        getLocation: function( url ) {
            return $('[data-type="page"]').data('url');

            /*
            var uri = url ? this.parseUrl( url ) : location,
                hash = this.parseUrl( url || location.href ).hash;

            // mimic the browser with an empty string when the hash is empty
            hash = hash === "#" ? "" : hash;

            // Make sure to parse the url or the location object for the hash because using location.hash
            // is autodecoded in firefox, the rest of the url should be from the object (location unless
            // we're testing) to avoid the inclusion of the authority
            return uri.protocol + "//" + uri.host + uri.pathname + uri.search + hash;
            */
        },
        isExternal: function( url ) {
            return !(url.indexOf('ponyvillelive.com') >= 0);
        },
        isPermittedCrossDomainRequest: function( docUrl, reqUrl ) {
            return true;
        }
    });

});

$(document).on("mobileinit", function() {
    receivedEvent('mobileinit');

    console.log('CORS ' + $.support.cors);

    $.mobile.pushStateEnabled = false;
    $.mobile.autoInitializePage = false;
    $.mobile.allowCrossDomainPages = true;
});

$(document).on("pageinit", function() {
    receivedEvent('pageinit');
});

$(document).on('deviceready', function() {
    receivedEvent('deviceready');

    // Verify Internet connection.
    var networkState = navigator.network.connection.type;
    if (networkState == Connection.NONE) {
        alertMessage('This app requires an internet connection.');
        return;
    }

    // Load Google Analytics.
    try
    {
        gaPlugin = window.plugins.gaPlugin;
        gaPlugin.init(successHandler, errorHandler, "UA-37359273-1", 15);
    }
    catch(err) {}

    // Load remote mobile page and inject into body.
    $('body').load('http://ponyvillelive.com/mobile/index #webapp', function() {
        $('#page').addClass('page-mobile');
        
        console.log('Page loaded!');

        $.mobile.autoInitializePage = true;
        $.mobile.initializePage();
    });
});

$(document).on('offline', function() {
    receivedEvent('offline');

    alertMessage('Internet connection lost!');
});

/**
 * Custom Link Handling
 */

$(document).on('vClick', 'a', function(event) {
    event.preventDefault();

    var link_url = $(this).attr('href');
    console.log(link_url);
    return false;

    if (link_url.contains('/mobile/'))
        $.mobile.changePage(link_url);
    else
        window.open(link_url, '_blank', 'location=yes');
});

/**
 * Utility Functions
 */

function receivedEvent(id) {
    console.log('Received Event: ' + id);
}

function alertMessage(msg)
{
    console.log(msg);
    navigator.notification.alert(msg);
}