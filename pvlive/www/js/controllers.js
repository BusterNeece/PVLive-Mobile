var controllers = angular.module('pvlive.controllers', []);

controllers.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

});

controllers.controller('StationsCtrl', function($scope, pvlService, $ionicModal, $timeout) {

    $scope.stations = [];

    loadNowPlaying();

    function loadNowPlaying()
    {
        pvlService.getNowPlaying().then(function(np) {
            $scope.stations = np;
        });
    }

});

controllers.controller('StationCtrl', function($scope, $ionicModal, $timeout) {

    $scope.playStream = function() {

    };

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