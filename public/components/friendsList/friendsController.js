'use strict';

angular.module('courseconnect.controllers')
.controller('friendsController', ['$scope','$rootScope',
    function($scope,$rootScope,$uibModal){
    $rootScope.selectedFriend = null;
    $rootScope.rmedFriend = null;
    
    /**
     * TODO: set up invitation info for both users
     */
    $rootScope.inviting = false;
    $rootScope.invitedFriend= null;
    $scope.invite = function(friend){
        console.log(friend.name+" is invited");
        friend.inviting = 1;
        $rootScope.inviting = true;
        $rootScope.invitedFriend = friend;
    }

    var addFriend = function(friend){
        friend.status = "selected";
        $rootScope.selectedFriend = friend;
    };
    var removeFriend = function(friend){
        friend.status = "unselected";
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
    
    $rootScope.splitFriends = function() {
        
        for(var i in $rootScope.friends){
            var curFid = $rootScope.friends[i].id;
            //console.log("looking through friends schedule in splitfriends -> "+curFid);
            var hasSection = false;
            for(var j in $rootScope.friendScheds[curFid]){
                if($rootScope.friendScheds[curFid][j]==$rootScope.selectedSectionUI){
                    console.log($rootScope.friends[i].name+" is taking this section as well");
                    $rootScope.friends[i].taking = 1;
                    hasSection = true;
                } 
            }
            if(!hasSection) {
                console.log($rootScope.friends[i].name+" is not taking this section:(");
                $rootScope.friends[i].taking = -1;
            }
        }
        
    };
}]);