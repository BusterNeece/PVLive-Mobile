var services = angular.module('pvlive.services', []);

services.service("loadingService", function($ionicLoading) {
    var loader;

    return ({
        show: show,
        hide: hide
    });

    function show()
    {
        loader = $ionicLoading.show({
            template: '<i class="icon ion-loading-d" style="font-size: 32px"></i>',
            animation: 'fade-in',
            noBackdrop: false
        });
    }
    function hide()
    {
        $ionicLoading.hide();
    }

});

services.service("radioService", function( $state, $rootScope, $timeout, apiService ) {

    var player = null;
    var stream = null;
    var station = null;

    var np_timeout;

    // Return public API.
    return({
        player: player,
        stream: stream,
        station: station,
        isPlaying: isPlaying,
        isStreamPlaying: isStreamPlaying,
        goToStream: goToStream,
        play: play,
        stop: stop
    });

    function isPlaying()
    {
        return (player != null && stream != null && station != null);
    }
    function isStreamPlaying(comp_stream)
    {
        return (isPlaying() && stream.id == comp_stream.id);
    }
    function goToStream()
    {
        $state.go('app.station', { 'stationId': station.station.id });
    }

    function play(new_station, new_stream)
    {
        if (stream)
        {
            if (stream.id == new_stream.id)
                return true;
            else
                stop();
        }

        stream = new_stream;
        station = new_station;

        if (window.cordova)
        {
            player = new Media(stream.url, function() {
                console.log("playAudio(): Audio Success");
            },
            function(err) {
                console.error("playAudio(): Audio Error");
                console.error(err);

                stop();
            },
            function(status) {
                console.log(status);
            });

            player.play();
        }
        else
        {
            if (player == null)
                player = document.createElement('audio');

            player.setAttribute('src', stream.url);
            player.play();
        }

        loadNowPlaying();

        // Always notify on the first song.
        notifyNewSong(stream.current_song);
    }

    function stop()
    {
        if (player !== null)
        {
            if (window.cordova)
            {
                player.stop();
                player.release();

                window.plugin.notification.local.cancelAll();
            }
            else
            {
                player.pause();
                player.setAttribute('src', '');
            }
        }

        stream = null;
        station = null;

        $timeout.cancel(np_timeout);
    }

    // Now-playing processing.
    function loadNowPlaying()
    {
        apiService.getNowPlayingStation(station.station.id).then(function(np)
        {
            station = np;

            processNowPlaying();

            $rootScope.$broadcast('radio:updated', np);

            if (np_timeout !== null)
                $timeout.cancel(np_timeout);

            np_timeout = $timeout(loadNowPlaying, 30000);
        });
    }

    function processNowPlaying()
    {
        var new_stream = _.find(station.streams, {'id': stream.id});

        // Detect song change.
        if (stream.current_song.id != new_stream.current_song.id)
        {
            document.getElementById('btn-like-song').classList.remove('positive');
            document.getElementById('btn-dislike-song').classList.remove('assertive');

            if (isPlaying())
                notifyNewSong(new_stream.current_song);
        }

        stream = new_stream;
    }

    function notifyNewSong(song)
    {
        console.log('Song Change: '+song.title+' by '+song.artist);

        if (window.cordova)
        {
            window.plugin.notification.local.cancelAll();

            window.plugin.notification.local.add({
                id:         song.id,
                message:    song.title+' by '+song.artist,
                title:      station.station.name,
                sound:      null,
                ongoing:    true,
                autoCancel: false
            });
        }
    }

});

services.service("apiService", function( $http, $q ) {

    // Return public API.
    return({
        getNowPlaying: getNowPlaying,
        getNowPlayingStation: getNowPlayingStation,
        getStations: getStations,
        getStation: getStation,
        getShows: getShows,
        getShow: getShow,
        getConventions: getConventions,
        getConvention: getConvention,
        voteLike: voteLike,
        voteDislike: voteDislike,
        voteClear: voteClear
    });

    /**
     * Public Methods
     */

    // Now-Playing Data
    function getNowPlaying()
    {
        return apiCall('nowplaying');
    }

    function getNowPlayingStation(station_id)
    {
        return apiCall('nowplaying/index/id/'+station_id);
    }

    // Stations (currently unused)
    function getStations()
    {
        return apiCall('station/list');
    }

    function getStation(station_id)
    {
        return apiCall('station/index/id/'+station_id);
    }

    // Shows (Podcasts)
    function getShows()
    {
        return apiCall('show/index');
    }

    function getShow(show_id)
    {
        return apiCall('show/index/id/'+show_id);
    }

    // Conventions
    function getConventions()
    {
        return apiCall('convention/list');
    }

    function getConvention(con_id)
    {
        return apiCall('convention/index/id/'+con_id);
    }

    // Song like/dislike voting
    function voteLike(sh_id)
    {
        return apiCall('song/like/sh_id/'+sh_id);
    }
    function voteDislike(sh_id)
    {
        return apiCall('song/dislike/sh_id/'+sh_id);
    }
    function voteClear(sh_id)
    {
        return apiCall('song/clearvote/sh_id/'+sh_id);
    }

    /**
     * Private Methods
     */

    function apiCall( api_function, api_params )
    {
        console.log('API Call: '+api_function);

        var request = $http({
            method: 'GET',
            url: "http://api.ponyvillelive.com/"+api_function,
            data: {
                service: 'pvlmobile'
            }
        });

        return( request.then( handleSuccess, handleError ) );
    }

    function handleError( response )
    {
        if (!angular.isObject( response.data.error ))
            return( $q.reject( "An unknown error occurred." ) );

        return( $q.reject( response.data.error ) );
    }

    // I transform the successful response, unwrapping the application data
    // from the API response payload.
    function handleSuccess( response )
    {
        if (response.data.status == 'success')
            return( response.data.result );
        else
            return handleError(response);
    }

});