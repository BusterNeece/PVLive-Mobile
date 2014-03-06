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
    app.initialize();
});

var gaPlugin;
var is_app = true;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        document.addListener('offline', this.onOffline, false);

        // Verify Internet connection.
        var networkState = checkConnection();
        if (networkState == Connection.NONE) {
            navigator.notification.alert('This app requires an internet connection.');
            return;
        }

        // Load Google Analytics.
        gaPlugin = window.plugins.gaPlugin;
        gaPlugin.init(successHandler, errorHandler, "UA-37359273-1", 15);

        // Load remote mobile page and inject into body.
        $('body').load('http://ponyvillelive.com/mobile body');
        /*
        $.ajax({
            url: 'http://ponyvillelive.com/mobile',
            dataType: 'html',
            success: function(data) {
                $('body').html($(data).html());
            },
            error: function(jqXHR, textStatus) {
                navigator.notification.alert('Could not load: '+textStatus);
            }
        });
        */

        // Trigger remote init scripts.
        initPage();
    },

    onOffline: function() {
        app.receivedEvent('offline');

        navigator.notification.alert('Internet connection lost!');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};
