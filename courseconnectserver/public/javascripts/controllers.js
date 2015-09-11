'use strict';

var app = angular.module('courseconnect.controllers', ['ui.calendar']);

app.controller('calendarController', ['$scope', '$compile', 'parseCourseInfo', 
    'hasSectionConflict', function($scope, $compile, parseCourseInfo, hasSectionConflict) {
    /* config object */
    $scope.eventSource = [];
    var selectedSections = {};
    $scope.curCourse;
    $scope.curMajor;


    var exist = function(section) {
        return selectedSections[section._id] != null;
    };

    var isPreview = function(section){
        return exist(section) &&
            selectedSections[section._id]['isPreview'];
    }

    var conflitsWithCurrentSections = function(section) {
        for (var i in selectedSections) {
            if (selectedSections[i] &&
                hasSectionConflict(selectedSections[i].section,section)){
                return true;
            }
        }
        return false;
    }

    $scope.addSection = function(section,course,major,isPreview,color){
        if (!exist(section)){
            if (conflitsWithCurrentSections(section)){
                color = 'rgba(0,125,125, 0.3)';
            }
            $scope.eventSource.push(parseCourseInfo(major, course, section,color));
            selectedSections[section._id] = {
                "section" : section,
                "isPreview" : isPreview
            };
        }
    }

    $scope.removeSection = function(section, behavior){
        if (behavior === 'click' ||
                (behavior === 'mouseleave' && isPreview(section))){
            var index = 0;
            for (var i = 0; i < $scope.eventSource.length; i++) {
                if ($scope.eventSource[i][0]['id'] === section._id){
                    index = i;
                    break;
                }
            };
            $scope.eventSource.splice(index,1);
            selectedSections[section._id] = null;
        }
    }
    
    $scope.toggleSection = function(section,course,major,color) {
        $scope.curCourse = course;
        $scope.curMajor = major;
        if(exist(section)) {
            if(isPreview(section)){
                selectedSections[section._id]['isPreview'] = false;
            } else {
                $scope.removeSection(section, 'click');
            }
        } else {
            $scope.addSection(section,course,major,false,color);
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
            element.attr({'course-tooltip': JSON.stringify({
                title: event.title.split('\n')[2], 
                description: event.description
            })});
            $compile(element)($scope);
        }
      }
    }; 
}]);


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
    'getCourseoffQueryUrl','getHoursAndMinutes', 'colorFactory',
    function($scope, $http, getCourseoffQueryUrl, getHoursAndMinutes, colorFactory){
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
        $scope.sectionColor = colorFactory.getNextColor();
        $scope.sectionAvailable = function(){
            return $scope.instructors.length == 0;
        };
        $scope.$on("SchemeChanged", function(){
            $scope.sectionColor = colorFactory.getNextColor();
            console.log("new section color");
        })
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
         $facebook.logout().then(function() {
            $rootScope.isLoggedIn = false;
            $scope.name = '';
            $scope.picture = '';
            $rootScope.userid = '';
        });
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
        $facebook.api("/me/picture").then( 
            function(response) {
                $scope.picture = response.data.url;
            });
    }
    refresh();
}]);

app.controller('themeComtroller', ['$scope', 'colorFactory', function($scope, colorFactory){
    $scope.schemeList = colorFactory.getSchemeList();
    $scope.selectScheme = function(selection){
        colorFactory.changeScheme(selection);
        $scope.$broadcast("SchemeChanged");
    };
}]);
