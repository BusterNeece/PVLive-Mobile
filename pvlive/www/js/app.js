// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var app = angular.module('pvlive', ['ionic', 'pvlive.controllers', 'pvlive.services']);

app.run(function($ionicPlatform, $rootScope)
{
    $ionicPlatform.ready(function()
    {
        // Ionic/Cordova Integration
        if(window.cordova && window.cordova.plugins.Keyboard)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // org.apache.cordova.statusbar required
        if(window.StatusBar)
            StatusBar.styleDefault();
    });
});

// Outside links open outside app.
app.directive('a', function ()
{
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            if ( !attrs.href ){
                return;
            }
            var url = attrs.href;
            if ( url.lastIndexOf('http',0) === 0 ){
                element.on('click',function(e){
                    e.preventDefault();
                    e.stopPropagation();

                    window.open(encodeURI(url), '_system', 'location=yes');
                });
            };
        }
    };
});

app.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider.state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    });

    $stateProvider.state('app.stations', {
      url: "/stations",
      views: {
          'menuContent' :{
              templateUrl: "templates/stations.html",
              controller: 'StationsCtrl'
          }
      }
    });

    $stateProvider.state('app.station', {
        url: "/station/:stationId",
        views: {
            'menuContent' :{
                templateUrl: "templates/station.html",
                controller: 'StationCtrl'
            }
        }
    });

    $stateProvider.state('app.shows', {
        url: "/shows",
        views: {
            'menuContent' :{
                templateUrl: "templates/shows.html",
                controller: 'ShowsCtrl'
            }
        }
    });

    $stateProvider.state('app.show', {
        url: "/show/:showId",
        views: {
            'menuContent' :{
                templateUrl: "templates/show.html",
                controller: 'ShowCtrl'
            }
        }
    });

    $stateProvider.state('app.conventions', {
        url: "/conventions",
        views: {
            'menuContent' :{
                templateUrl: "templates/conventions.html",
                controller: 'ConventionsCtrl'
            }
        }
    });

    $stateProvider.state('app.convention', {
        url: "/convention/:conventionId",
        views: {
            'menuContent' :{
                templateUrl: "templates/convention.html",
                controller: 'ConventionCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/stations');
});

