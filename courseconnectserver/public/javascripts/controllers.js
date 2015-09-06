'use strict';

var app = angular.module('courseconnect.controllers', ['ui.calendar']);
app.controller('calendarController', ['$scope','parseCourseInfo', function($scope,
        parseCourseInfo) {
    /* config object */
    $scope.eventSource = [];
    $scope.selectedSectionID = {};
    $scope.curCourse;
    $scope.curMajor;
    
    $scope.toggleSection = function(section,course,major){
        $scope.curCourse = course;
        $scope.curMajor = major;
        if($scope.selectedSectionID[section._id] == true) {
            var index = $scope.eventSource.indexOf(parseCourseInfo(major, course, section,'rgb(0,125,125)'));
            $scope.eventSource.splice(index,1);
            $scope.selectedSectionID[section._id] = false;
        }
        else{
            $scope.eventSource.push(parseCourseInfo(major, course, section,'rgb(0,125,125)'));
            $scope.selectedSectionID[section._id] = true;
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
        eventLimit: true,
        eventRender: function(event, element) {
            console.log("description: "+event.description); 
            var title = event.title.split('\n')[2];
            $(element).popover({placement: "auto",
                 title: title,
                 content:   '<h5>'+"Ref Number: \n"+'</h5>'+event.description.number+
                            '<h5>'+"Section: \n"+'</h5>'+event.description.section+
                            '<h5>'+"Credits: \n"+'</h5>'+event.description.credit+'<h5>'+"Instructor: \n"+
                            '</h5>'+event.description.instructor+'<h5>'+"Location: \n"+
                            '</h5>'+event.description.location,
                 trigger: "hover",
                 html: true,   
                 viewport: { selector: 'body', padding: 10}        
            });
            
        }
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
app.controller('loginStatusController', ['$scope', '$rootScope', 
    '$facebook', function($scope, $rootScope, $facebook){
    $rootScope.isLoggedIn = false;
    $rootScope.userid = '';
    $scope.name = '';
    $scope.login = function() {
        $facebook.login().then(function() {
            refresh();
        });
    }
    $scope.logout = function() {
        $rootScope.isLoggedIn = false;
        $scope.name = '';
        $scope.picture = '';
        $rootScope.userid = '';
    }
    function refresh() {
        $facebook.api("/me").then( 
        function(response) {
            $scope.name = response.name;
            $rootScope.userid = response.id;
            $rootScope.isLoggedIn = true;
        },
        function(err) {
            $scope.name = '';
            $rootScope.userid = '';
            $rootScope.isLoggedIn = false;
        });
        $facebook.api("/984649201595148/picture").then( 
        function(response) {
            $scope.picture = response.data.url;
        });
    }
    refresh();
}]);
