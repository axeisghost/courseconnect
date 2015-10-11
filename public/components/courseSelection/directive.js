'use strict';

angular.module('courseconnect.directives')
.directive('courseCandidateList', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/courseSelection/courseCandidateList.html'
    }
})
.directive('courseCandidateSectionItem', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/courseSelection/courseCandidateSectionItem.html'
    }
}).directive('sectionItem', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/courseSelection/sectionItem.html'
    }
});