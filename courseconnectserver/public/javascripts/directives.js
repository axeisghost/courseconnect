'use strict';


var app = angular.module('courseconnect.directives', ['courseconnect.services']);
app.directive('majorSelectionPanel', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/majorSelectionList.html'
    }
});

app.directive('majorSelectionItem', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/majorSelectionItem.html'
    }
});

app.directive('majorCandidateList', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/majorCandidateList.html'
    }
});

app.directive('majorCandidateCourseItem', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/majorCandidateCourseItem.html'
    }
});

app.directive('courseCandidateList', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/courseCandidateList.html'
    }
});

app.directive('courseCandidateSectionItem', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/courseCandidateSectionItem.html'
    }
});

app.directive('sectionItem', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/sectionItem.html'
    }
});

app.directive('loginStatusBar', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/loginStatusBar.html'
    }
});