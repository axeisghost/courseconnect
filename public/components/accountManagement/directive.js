'use strict';

angular.module('courseconnect.directives')
.directive('loginStatusBar', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/accountManagement/view.html'
    }
});