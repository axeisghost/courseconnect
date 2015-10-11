'use strict';

angular.module('courseconnect.controllers')
.controller(
    'majorCandidate', ['$scope','$rootScope', '$http', 
    'getCourseoffQueryUrl', function($scope, $rootScope, $http, getCourseoffQueryUrl){
        $http.get(getCourseoffQueryUrl($rootScope,'courses')).then(
            function(response) {
            // this callback will be called asynchronously
            // when the response is available
                $scope.courses = response.data;
            }, function(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            });
        $scope.addCourseCandidates = function(course){
            $rootScope.selectedMajor = $scope.major.ident;
            course.major = $scope.major;
            $rootScope.selectedCourse = course.ident;
            $rootScope.selectedCourseName = course.name;
            if(!$rootScope.courseCandidates){
                $rootScope.courseCandidates = [];
            }
            $rootScope.courseCandidates.push(course);
        };
}]);