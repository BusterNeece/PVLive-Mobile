var services = angular.module('pvlive.services', []);

services.service("pvlService", function( $http, $q ) {

    // Return public API.
    return({
        getNowPlaying: getNowPlaying,
        getNowPlayingStation: getNowPlayingStation,
        getStations: getStations,
        getStation: getStation,
        getShows: getShows,
        getShow: getShow
    });

    /**
     * Public Methods
     */

    function getNowPlaying()
    {
        return apiCall('nowplaying');
    }

    function getNowPlayingStation(station_id)
    {
        return apiCall('nowplaying/index/id/'+station_id);
    }

    function getStations()
    {
        return apiCall('station/list');
    }

    function getStation(station_id)
    {
        return apiCall('station/index/id/'+station_id);
    }

    function getShows()
    {
        return apiCall('show/index');
    }

    function getShow(show_id)
    {
        return apiCall('show/index/id/'+show_id);
    }

    /**
     * Private Methods
     */

    function apiCall( api_function, api_params )
    {
        var request = $http({
            method: "get",
            url: "http://ponyvillelive.com/api/"+api_function,
            params: api_params,
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