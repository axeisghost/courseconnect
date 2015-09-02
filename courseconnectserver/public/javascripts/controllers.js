'use strict';

var app = angular.module('courseconnect.controllers', ['ui.calendar']);
app.controller('calendarController', function($scope) {
    /* config object */
    
    // $scope.eventSource = {
    //   url: "/user_schedule",
    // };
    
    
    $scope.eventSource = [];
    $scope.selectedSectionIDs = [];
    $scope.curCourse;
    
    var json_conversion = function(section){
        var weekdays = ['M','T','W','R','F']; 
        var ui_form = [];
        for(var i = 0; i < section.timeslots.length; i++){
            ui_form[i]={};
            ui_form[i]['title']= $scope.curCourse['name'];
            var startDate = new Date();
            startDate.setHours(section.timeslots[i].start_time/60 | 0);
            startDate.setMinutes(section.timeslots[i].start_time - startDate.getHours()*60);
            var endDate = new Date();
            endDate.setHours(section.timeslots[i].end_time/60 | 0);
            endDate.setMinutes(section.timeslots[i].end_time - endDate.getHours()*60);
            ui_form[i]['start'] = startDate.toISOString();
            ui_form[i]['end'] = endDate.toISOString();
            ui_form[i]['dow'] = [weekdays.indexOf(section.timeslots[i]['day'])+1];
            console.log(ui_form[i]);
        }
        return ui_form;
    }

    var addSection = function(section){
        $scope.eventSource.push(json_conversion(section));
        selectedSectionIDs[section._id] = true;
    };

    var removeSection = function(section){
        var index = $scope.eventSource.indexOf(json_conversion(section));
        $scope.eventSource.splice(index,1);
        selectedSectionIDs[section._id] = false;
    };
    
    $scope.toggleSection = function(section,course){
        $scope.curCourse = course;
        if($scope.isSelected(section)) {
            removeSection(section);
        } else {
            addSection(section);
        }
    };

    $scope.isSelected = function(section){
        if($scope.selectedSectionIDs[section._id]){
            return true;
        } else {
            return false;
        }
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
    $scope.majorCandidates = [];
    $http.get(getCourseoffQueryUrl($scope)).then(
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
                var sections = response.data;
                $scope.instructors = [];
                for (var i = 0; i < sections.length; i++) {
                    var exist = false;
                    for(var j in $scope.instructors){
                        if(JSON.stringify(sections[i].instructor)===JSON.stringify($scope.instructors[j].instructorInfo)){
                            $scope.instructors[j].sections.push(sections[i]);
                           
                            exist = true;
                            break;
                        }
                    }
                    if(!exist){
                        var newInstructor = {"instructorInfo" : sections[i].instructor,
                            "sections" : [sections[i]]};
                        $scope.instructors.push(newInstructor);
                    }
                };
            }, function(response) {
            });
        });
        $scope.sectionAvailable = function(){
            return $scope.instructors.length == 0;
        };
}]);