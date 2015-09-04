'use strict';

var app = angular.module('courseconnect.controllers', ['ui.calendar']);
app.controller('calendarController', ['$scope','getHoursAndMinutes', function($scope,
        getHoursAndMinutes) {
    /* config object */
    
    // $scope.eventSource = {
    //   url: "/user_schedule",
    // };
    
    // $scope.count=0;
    $scope.eventSource = [];
    $scope.selectedSectionIDs = {};
    $scope.curCourse;
    
    var course_info_converter = function(section,color){
        var weekdays = ['M','T','W','R','F']; 
        var ui_form = [];
        for(var i = 0; i < section.timeslots.length; i++){
            ui_form[i]={};
            ui_form[i]['title']= $scope.curCourse['name']+"\nSection "+section['ident'];
            var startDate = new Date();
            var startTime = getHoursAndMinutes(section.timeslots[i].start_time);
            startDate.setHours(startTime.hour);
            startDate.setMinutes(startTime.minute);
            var endDate = new Date();
            var endTime = getHoursAndMinutes(section.timeslots[i].end_time);
            endDate.setHours(endTime.hour);
            endDate.setMinutes(endTime.minute);
            ui_form[i]['start'] = startDate;
            ui_form[i]['end'] = endDate;
            ui_form[i]['dow'] = [weekdays.indexOf(section.timeslots[i]['day'])+1];
            ui_form[i]['backgroundColor'] = color;
        }
        return ui_form;
    };

    
    $scope.toggleSection = function(section,course){
        $scope.curCourse = course;
        if($scope.selectedSectionIDs[section._id] == undefined) {
            $scope.eventSource.push(course_info_converter(section,'rgb(0,125,125)'));
            $scope.selectedSectionIDs[section._id] = true;
        } 
        else if($scope.selectedSectionIDs[section._id] == true) {
            var index = $scope.eventSource.indexOf(course_info_converter(section,'rgb(0,125,125)'));
            $scope.eventSource.splice(index,1);
            $scope.selectedSectionIDs[section._id] = false;
        }
        else{
            $scope.eventSource.push(course_info_converter(section,'rgb(0,125,125)'));
            $scope.selectedSectionIDs[section._id] = true;
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
}]);


app.controller('accordionController', function ($scope) {
  $scope.oneAtATime = true;
  // $scope.addItem = function() {
  //   var newItemNo = $scope.items.length + 1;
  //   $scope.items.push('Item ' + newItemNo);
  // };
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
    'getCourseoffQueryUrl','getHoursAndMinutes', 
    function($scope, $http, getCourseoffQueryUrl, getHoursAndMinutes){
        $scope.$watch("selectedCourse",function(){
            $http.get(getCourseoffQueryUrl($scope)).then(
            function(response) {
                var sections = response.data;

                var parseSectionTimeSlots = function(timeSlots){
                    var sectionTimeSlots = {}
                    for(var i in timeSlots){
                        var key = timeSlots[i].start_time.toString() + 
                            timeSlots[i].end_time.toString();
                        if (sectionTimeSlots[key]){
                            sectionTimeSlots[key].days.push(timeSlots[i].day);
                        } else {
                            sectionTimeSlots[key] = {
                                startTime : getHoursAndMinutes(timeSlots[i].start_time),
                                endTime : getHoursAndMinutes(timeSlots[i].end_time),
                                days : [timeSlots[i].day]
                            };
                        }
                    }
                    var returnArray = []
                    for (var key in sectionTimeSlots){
                        returnArray.push(sectionTimeSlots[key]);
                    }
                    return returnArray;
                };

                $scope.instructors = [];
                for (var i = 0; i < sections.length; i++) {
                    var exist = false;
                    for(var j in $scope.instructors){
                        if(JSON.stringify(sections[i].instructor)===JSON.stringify($scope.instructors[j].instructorInfo)){
                            sections[i].sectionTimeSlot = parseSectionTimeSlots(sections[i].timeslots);
                            $scope.instructors[j].sections.push(sections[i]);
                            exist = true;
                            break;
                        }
                    }
                    if(!exist){
                        sections[i].sectionTimeSlot = parseSectionTimeSlots(sections[i].timeslots);
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