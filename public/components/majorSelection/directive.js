'use strict';

angular.module('courseconnect.directives')
.directive('majorSelectionPanel', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/majorSelection/majorSelectionList.html'
    }
})
.directive('majorSelectionItem', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/majorSelection/majorSelectionItem.html'
    }
})
.directive('majorCandidateList', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/majorSelection/majorCandidateList.html'
    }
})
.directive('majorCandidateCourseItem', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/majorSelection/majorCandidateCourseItem.html'
    }
});