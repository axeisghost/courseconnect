'use strict';


var app = angular.module('courseconnect.directives', ['courseconnect.services']);
app.directive('majorSelectionPanel', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/majorSelection.html'
    }
});

app.directive('majorSelectionItem', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/majorSelectionItem.html'
    }
});