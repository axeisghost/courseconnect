'use strict';

var app = angular.module('courseconnect.controllers', ['ui.calendar']);
app.controller('calendarController', function($scope) {
    /* config object */
    $scope.eventSource = {
      url: "/user_schedule",
    };
    $scope.uiConfig = {
      calendar:{
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'agendaWeek agendaDay'
        },
        minTime: "08:00:00",
        maxTime: "22:00:00",
        editable: false,
        weekends: false,
        allDaySlot: false,
        height: "auto",
        defaultView: "agendaWeek",
        eventLimit: true
      }
    };
    
});

app.controller('controlPanelTab', ['$scope', function($scope) {
    $scope.operationModes = ['Schedule', 'Friends'];
    $scope.currentMode = $scope.operationModes[0];
}]);

app.controller('courseSelectionPanel', ['$scope', '$http', 
    'getCourseoffQueryUrl', function($scope, $http, getCourseoffQueryUrl){
    $scope.selectedCollege = 'gatech';
    $scope.selectedTerm = '201508';
    $scope.currentUrl = getCourseoffQueryUrl($scope);
    $scope.majorCandidates = [];
    $http.get($scope.currentUrl).then(
        function(response) {
        // this callback will be called asynchronously
        // when the response is available
            $scope.majors = response.data;
        }, function(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        });

    
}]);

app.controller('majorCandidate', ['$scope', '$http', 
    'getCourseoffQueryUrl', function($scope, $http, getCourseoffQueryUrl){
        $scope.courseCandidates = [];
        $scope.$watch("selectedMajor",function(){
            $http.get(getCourseoffQueryUrl($scope)).then(
            function(response) {
            // this callback will be called asynchronously
            // when the response is available
                $scope.courses = response.data;
            }, function(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            });
        });
}]);

app.controller('courseCandidate', ['$scope', '$http', 
    'getCourseoffQueryUrl', function($scope, $http, getCourseoffQueryUrl){
        $scope.$watch("selectedCourse",function(){
            $http.get(getCourseoffQueryUrl($scope)).then(
            function(response) {
            // this callback will be called asynchronously
            // when the response is available
                $scope.sections = response.data;
            }, function(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            });
        });
}]);