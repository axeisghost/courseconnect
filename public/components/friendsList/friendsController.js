'use strict';

angular.module('courseconnect.controllers')
.controller('friendsController', ['$scope','$rootScope',
    function($scope,$rootScope){
    $rootScope.selectedFriend = null;
    $rootScope.rmedFriend = null;

    var addFriend = function(friend){
        $rootScope.selectedFriend = friend;
    };
    var removeFriend = function(friend){
        $rootScope.rmedFriend = $rootScope.selectedFriend;
        $rootScope.selectedFriend = null;
    };
    $scope.toggleFriend = function(friend){
        if($rootScope.selectedFriend == friend){
            removeFriend(friend);
        } else if(!$rootScope.selectedFriend){
            addFriend(friend);
            if($rootScope.rmedFriend) $rootScope.rmedFriend=null;
        } else{
            removeFriend($rootScope.selectedFriend);
            addFriend(friend);
        }
        if($rootScope.selectedFriend) console.log("selected friend: "+$rootScope.selectedFriend.name);
        if($rootScope.rmedFriend) console.log("recently removed friend: "+$rootScope.rmedFriend.name);
        $rootScope.showFriendSchedule();
    };
}]);