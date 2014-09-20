var services = angular.module('pvlive.services', []);

services.service("pvlService", function( $http, $q ) {

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
        var request = $http({
            method: 'GET',
            url: "http://ponyvillelive.com/api/"+api_function,
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