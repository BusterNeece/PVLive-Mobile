var controllers = angular.module('pvlive.controllers', []);

controllers.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

});

controllers.controller('StationsCtrl', function($scope, pvlService, $ionicModal, $timeout) {

    var np_timeout = null;

    $scope.stations = {};
    $scope.reloadPage = function() { loadNowPlaying() };

    loadNowPlaying();

    function loadNowPlaying()
    {
        pvlService.getNowPlaying().then(function(np)
        {
            $scope.stations = {
                'radio': {
                    'name': 'Radio Stations',
                    'icon': 'ion-ios7-musical-notes',
                    'stations': _.where(np, {'status': 'online', 'station': { 'category': 'audio' }})
                },
                'video': {
                    'name': 'Video Streams',
                    'icon': 'ion-ios7-videocam',
                    'stations': _.where(np, {'status': 'online', 'station': { 'category': 'video' }})
                }
            };

            $scope.$broadcast('scroll.refreshComplete');

            if (np_timeout !== null)
                $timeout.cancel(np_timeout);

            np_timeout = $timeout(loadNowPlaying, 30000);
        });
    }

    $scope.$on("$destroy", function(event) {
        $timeout.cancel(np_timeout);
    });

});

controllers.controller('StationCtrl', function($scope, $stateParams, pvlService, $ionicModal, $timeout) {

    var np_timeout = null;
    var active_stream = null;

    $scope.station = {};
    $scope.stream = {};

    $scope.reloadPage = function() { loadNowPlaying() };
    $scope.isActiveStream = function(stream) {
        return (active_stream == stream.id);
    };

    $scope.playStream = function(stream)
    {
        active_stream = stream.id;

        processNowPlaying();
    };

    $scope.likeSong = function(song)
    {

    };
    $scope.dislikeSong = function(song)
    {

    };

    loadNowPlaying();

    function loadNowPlaying()
    {
        pvlService.getNowPlayingStation($stateParams.stationId).then(function(np)
        {
            $scope.station = np;

            processNowPlaying();

            $scope.$broadcast('scroll.refreshComplete');

            if (np_timeout !== null)
                $timeout.cancel(np_timeout);

            np_timeout = $timeout(loadNowPlaying, 30000);
        });
    }

    function processNowPlaying()
    {
        if (active_stream == null)
        {
            var default_stream = _.find($scope.station.streams, {'is_default': true});
            active_stream = default_stream.id;
        }

        var old_stream = $scope.stream;
        var new_stream = _.find($scope.station.streams, {'id': active_stream});

        $scope.stream = new_stream;
    }

    $scope.$on("$destroy", function(event) {
        $timeout.cancel(np_timeout);
    });

});

controllers.controller('PlaylistsCtrl', function($scope) {
    $scope.playlists = [
        { title: 'Reggae', id: 1 },
        { title: 'Chill', id: 2 },
        { title: 'Dubstep', id: 3 },
        { title: 'Indie', id: 4 },
        { title: 'Rap', id: 5 },
        { title: 'Cowbell', id: 6 }
    ];
});

controllers.controller('PlaylistCtrl', function($scope, $stateParams) {

});