var controllers = angular.module('pvlive.controllers', []);

controllers.controller('AppCtrl', function($scope, radioService) {
    $scope.radio = radioService;
});

/**
 * Stations Listing
 */
controllers.controller('StationsCtrl', function($scope, apiService, loadingService, $timeout) {

    var np_timeout = null;

    $scope.stations = {};
    $scope.reloadPage = function() { loadNowPlaying() };

    loadingService.show();
    loadNowPlaying();

    function loadNowPlaying()
    {
        apiService.getNowPlaying().then(function(np)
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
            loadingService.hide();

            if (np_timeout !== null)
                $timeout.cancel(np_timeout);

            np_timeout = $timeout(loadNowPlaying, 30000);
        });
    }

    $scope.$on("$destroy", function(event) {
        $timeout.cancel(np_timeout);
    });

});

/**
 * Individual Station & Playback
 */
controllers.controller('StationCtrl', function($scope, $rootScope, $stateParams, $window, apiService, radioService, loadingService) {

    $scope.active_stream = null;
    $scope.station = {};
    $scope.stream = {};

    loadingService.show();

    $scope.reloadPage = function() { loadNowPlaying() };

    // On-page conditionals.
    $scope.isActiveStream = function(stream) {
        return ($scope.active_stream == stream.id);
    };
    $scope.isPlaying = function(stream) {
        return (radioService.isStreamPlaying(stream));
    };

    // On page triggered events.
    $scope.playStream = function(stream)
    {
        $scope.active_stream = stream.id;

        // Special handling for video streams.
        if (stream.type == "stream")
        {
            $window.open(encodeURI(stream.url), '_system', 'location=yes');
            return;
        }

        processNowPlaying();

        if ($scope.isPlaying(stream))
            stopPlayer();
        else
            playStream(stream);
    };

    $scope.likeSong = function(song)
    {
        var like_btn = document.getElementById('btn-like-song');
        var dislike_btn = document.getElementById('btn-dislike-song');

        if (like_btn.classList.contains('positive'))
        {
            apiService.voteClear(song.sh_id);

            like_btn.classList.remove('positive');
            dislike_btn.classList.remove('assertive');
        }
        else
        {
            apiService.voteLike(song.sh_id);

            dislike_btn.classList.remove('assertive');

            like_btn.classList.add('positive');
        }
    };

    $scope.dislikeSong = function(song)
    {
        var like_btn = document.getElementById('btn-like-song');
        var dislike_btn = document.getElementById('btn-dislike-song');

        if (dislike_btn.classList.contains('assertive'))
        {
            apiService.voteClear(song.sh_id);

            like_btn.classList.remove('positive');
            dislike_btn.classList.remove('assertive');
        }
        else
        {
            apiService.voteDislike(song.sh_id);

            like_btn.classList.remove('positive');

            dislike_btn.classList.add('assertive');
        }
    };

    // Now-playing processing.
    loadNowPlaying();

    function loadNowPlaying()
    {
        apiService.getNowPlayingStation($stateParams.stationId).then(function(np)
        {
            $scope.station = np;

            processNowPlaying();

            $scope.$broadcast('scroll.refreshComplete');
            loadingService.hide();
        });
    }

    $scope.$on('radio:updated', function(event, np) {
        if (np.station.id == $scope.station.station.id)
        {
            $scope.station = np;
            processNowPlaying();
        }
    });

    function processNowPlaying()
    {
        if ($scope.active_stream == null)
        {
            if (radioService.stream)
            {
                $scope.active_stream = radioService.stream.id;
            }
            else
            {
                var default_stream = _.find($scope.station.streams, {'is_default': true});
                $scope.active_stream = default_stream.id;
            }
        }

        $scope.stream = _.find($scope.station.streams, {'id': $scope.active_stream});

        // Reset like/dislike buttons.
        document.getElementById('btn-like-song').classList.remove('positive');
        document.getElementById('btn-dislike-song').classList.remove('assertive');
    }

    function playStream(stream)
    {
        radioService.play($scope.station, stream);
    }

    function stopPlayer()
    {
        radioService.stop();
    }

});

/**
 * Shows Listing
 */
controllers.controller('ShowsCtrl', function($scope, apiService, loadingService)
{
    $scope.shows = {};
    $scope.reloadPage = function() { loadShows() };

    loadingService.show();

    loadShows();

    function loadShows()
    {
        apiService.getShows().then(function(shows)
        {
            $scope.shows = shows;

            $scope.$broadcast('scroll.refreshComplete');
            loadingService.hide();
        });
    }

});

controllers.controller('ShowCtrl', function($scope, $stateParams, apiService, loadingService) {

    $scope.show = {};

    loadingService.show();

    apiService.getShow($stateParams.showId).then(function(show)
    {
        $scope.show = show;

        loadingService.hide();
    });

});

/**
 * Conventions Listing
 */
controllers.controller('ConventionsCtrl', function($scope, apiService, loadingService)
{
    $scope.cons = {};
    $scope.reloadPage = function() { loadConventions() };

    loadingService.show();
    loadConventions();

    function loadConventions()
    {
        apiService.getConventions().then(function(cons)
        {
            $scope.cons = _.where(cons, function (con) { return con.archives_count > 0; });

            $scope.$broadcast('scroll.refreshComplete');
            loadingService.hide();
        });
    }

});

controllers.controller('ConventionCtrl', function($scope, $stateParams, apiService, loadingService)
{
    $scope.con = {};

    loadingService.show();

    apiService.getConvention($stateParams.conventionId).then(function(con)
    {
        $scope.con = con;

        loadingService.hide();
    });

});