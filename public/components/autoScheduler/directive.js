'use strict';

angular.module('courseconnect.directives')
.directive('scheduleCourseCandidateList', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/autoScheduler/scheduleCourseCandidateList.html'
    }
});