'use strict';

angular.module('courseconnect.directives')
.directive('friendsDirective', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/friendsList/friends.html'
    }
});