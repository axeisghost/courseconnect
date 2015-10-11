'use strict';

angular.module('courseconnect.directives')
.directive('themePicker', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/themePicker/view.html'
    }
});