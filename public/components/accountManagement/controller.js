'use strict';

angular.module('courseconnect.controllers')
.controller('loginStatusController', ['$scope', '$rootScope', 
    '$facebook', '$http', function($scope, $rootScope, $facebook, $http){
    $rootScope.isLoggedIn = false;
    $rootScope.user = {};
    $rootScope.friends = [];
    $scope.login = function() {
        $facebook.login().then(function() {
            refresh();
        });
    }
    $scope.logout = function() {
         $facebook.logout().then(function() {
            $rootScope.isLoggedIn = false;
            $rootScope.user = {};
            $rootScope.friends = [];
        });
    }
    function refresh() {
        $facebook.api("/me").then( 
            function(response) {
                $rootScope.user.id = response.id;
                $rootScope.user.name = response.name;
                $rootScope.isLoggedIn = true;
                
                $http.post('/users/' + $rootScope.user.id);
            },
            function(err) {
                $rootScope.user = {};
                $rootScope.isLoggedIn = false;
            });
        $facebook.api("/me/picture").then( 
            function(response) {
                $rootScope.user.picture = response.data.url;
            });
        $facebook.api("/me/friends").then( 
            function(response) {
                response.data.forEach(function(fdata) {
                    var friend = {};
                    friend.id = fdata.id;
                    friend.name = fdata.name;
                    $facebook.api("/" + fdata.id + "/picture").then( 
                        function(response) {
                            friend.picture = response.data.url;
                        });
                    $rootScope.friends.push(friend);
                });
            });
    }
    refresh();
}]);