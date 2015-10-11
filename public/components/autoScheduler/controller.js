'use strict';

angular.module('courseconnect.controllers')
.controller('scheduler', ['$scope','$rootScope','getPossibleSchedules',
    function($scope,$rootScope,getPossibleSchedules){
    var coursesToBeScheduled = {};
    $rootScope.auto_schedules = [];
    $rootScope.selectedAutoSchedule = null;
    var auto_schedule = function(){
        var courses = [];
        for(var i in coursesToBeScheduled){
            if(coursesToBeScheduled[i]){
                courses.push(coursesToBeScheduled[i]);
            }
        }
        $rootScope.auto_schedules = getPossibleSchedules(courses);
    };
    var addCourse = function(course){
        coursesToBeScheduled[course.major.ident+course.ident] = course;
        auto_schedule();
    };
    var removeCourse = function(course){
        coursesToBeScheduled[course.major.ident+course.ident] = null;
        auto_schedule();
    };
    $scope.toggleCourse = function(course){
        if(coursesToBeScheduled[course.major.ident+course.ident]){
            removeCourse(course);
        } else{
            addCourse(course);
        }
    };
    $scope.setSelectedAutoSchedule = function(schedule){
        $rootScope.selectedAutoSchedule = schedule;
        $rootScope.showAutoSchedule();
    };
}]);