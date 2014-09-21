var controllers = angular.module('pvlive.controllers', []);

controllers.controller('AppCtrl', function($scope) {});

/**
 * Stations Listing
 */
controllers.controller('StationsCtrl', function($scope, pvlService, $timeout) {

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

/**
 * Individual Station & Playback
 */
controllers.controller('StationCtrl', function($scope, $stateParams, pvlService, $timeout, $window) {

    var np_timeout = null;
    var active_stream = null;
    var playing_stream = null;
    var audio_element = null;

    $scope.station = {};
    $scope.stream = {};

    $scope.reloadPage = function() { loadNowPlaying() };

    // On-page conditionals.
    $scope.isActiveStream = function(stream) {
        return (active_stream == stream.id);
    };
    $scope.isPlaying = function(stream) {
        return (active_stream == stream.id && playing_stream == stream.id);
    };

    // On page triggered events.
    $scope.playStream = function(stream)
    {
        active_stream = stream.id;

        // Special handling for video streams.
        if (stream.type == "stream")
        {
            window.open(encodeURI(url), '_system', 'location=yes');
            return;
        }

        processNowPlaying();

        if ($scope.isPlaying(stream))
        {
            stopPlayer();
        }
        else
        {
            playStream(stream);
            notifyNewSong(stream.current_song);
        }
    };

    $scope.likeSong = function(song)
    {
        var like_btn = document.getElementById('btn-like-song');
        var dislike_btn = document.getElementById('btn-dislike-song');

        if (like_btn.classList.contains('positive'))
        {
            pvlService.voteClear(song.sh_id);

            like_btn.classList.remove('positive');
            dislike_btn.classList.remove('assertive');
        }
        else
        {
            pvlService.voteLike(song.sh_id);

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
            pvlService.voteClear(song.sh_id);

            like_btn.classList.remove('positive');
            dislike_btn.classList.remove('assertive');
        }
        else
        {
            pvlService.voteDislike(song.sh_id);

            like_btn.classList.remove('positive');

            dislike_btn.classList.add('assertive');
        }
    };

    // Now-playing processing.
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

        var song_changed;

        // Detect song change.
        if (old_stream.status && new_stream.status)
            song_changed = (old_stream.current_song.id != new_stream.current_song.id);
        else
            song_changed = true;

        if (song_changed)
        {
            document.getElementById('btn-like-song').classList.remove('positive');
            document.getElementById('btn-dislike-song').classList.remove('assertive');

            if (playing_stream)
                notifyNewSong(new_stream.current_song);
        }
    }

    function playStream(stream)
    {
        if (playing_stream)
        {
            if (playing_stream == stream.id)
                return true;
            else
                stopPlayer();
        }

        if (window.cordova)
        {
            audio_element = new Media(stream.url, function() {
                console.log("playAudio(): Audio Success");
            },
            function(err) {
                console.error("playAudio(): Audio Error");
                console.error(err);
            },
            function(status) {
                console.log(status);
            });

            audio_element.play();
        }
        else
        {
            if (audio_element == null)
                audio_element = document.createElement('audio');

            audio_element.setAttribute('src', stream.url);
            audio_element.play();
        }

        playing_stream = stream.id;
    }

    function stopPlayer()
    {
        if (audio_element !== null)
        {
            if (window.cordova)
            {
                audio_element.stop();
                audio_element.release();

                window.plugin.notification.local.cancelAll();
            }
            else
            {
                audio_element.pause();
                audio_element.setAttribute('src', '');
            }
        }

        playing_stream = null;
    }

    function notifyNewSong(song)
    {
        if (window.cordova)
        {
            window.plugin.notification.local.add({
                id:         song.id,
                message:    song.title+' by '+song.artist,
                title:      $scope.station.station.name,
                sound:      '',
                autoCancel: true
            });
        }
    }

    // Unload player on page switch.
    $scope.$on("$destroy", function(event) {
        stopPlayer();

        $timeout.cancel(np_timeout);
    });

});

/**
 * Shows Listing
 */
controllers.controller('ShowsCtrl', function($scope, pvlService, $ionicLoading)
{
    $scope.shows = {};
    $scope.reloadPage = function() { loadShows() };

    $scope.$on('$show', function(event) {
        $ionicLoading.show({
            template: 'Loading...'
        });
    });

    loadShows();

    function loadShows()
    {
        pvlService.getShows().then(function(shows)
        {
            $scope.shows = shows;

            $scope.$broadcast('scroll.refreshComplete');
            $ionicLoading.hide();
        });
    }

});

controllers.controller('ShowCtrl', function($scope, pvlService, $stateParams) {

    $scope.show = {};

    pvlService.getShow($stateParams.showId).then(function(show)
    {
        $scope.show = show;
    });

});

/**
 * Conventions Listing
 */
controllers.controller('ConventionsCtrl', function($scope, pvlService, $ionicLoading)
{
    $scope.cons = {};
    $scope.reloadPage = function() { loadConventions() };

    $scope.$on('$show', function(event) {
        $ionicLoading.show({
            template: 'Loading...'
        });
    });

    loadConventions();

    function loadConventions()
    {
        pvlService.getConventions().then(function(cons)
        {
            $scope.cons = _.where(cons, function (con) { return con.archives_count > 0; });

            $scope.$broadcast('scroll.refreshComplete');
            $ionicLoading.hide();
        });
    }

});

controllers.controller('ConventionCtrl', function($scope, pvlService, $stateParams) {

    $scope.con = {};

    pvlService.getConvention($stateParams.conventionId).then(function(con)
    {
        $scope.con = con;
    });

});