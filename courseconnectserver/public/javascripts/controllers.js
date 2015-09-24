'use strict';

var app = angular.module('courseconnect.controllers', ['ui.calendar']);

app.controller('calendarController', ['$scope', '$rootScope', '$compile', 'parseCourseInfo', 
    'hasSectionConflict', function($scope, $rootScope, $compile, parseCourseInfo, hasSectionConflict) {
    /* config object */
    $scope.eventSource = [];
    $rootScope.selectedSections = {};

    var exist = function(section) {
        return $rootScope.selectedSections[section._id] != null;
    };

    var isPreview = function(section){
        return exist(section) &&
            $rootScope.selectedSections[section._id]['isPreview'];
    }

    var conflitsWithCurrentSections = function(section) {
        for (var i in $rootScope.selectedSections) {
            if ($rootScope.selectedSections[i] &&
                hasSectionConflict($rootScope.selectedSections[i].section,section)){
                return true;
            }
        }
        return false;
    }



    $rootScope.addSection = function(section,course,isPreview,color){
        if (!exist(section)){
            if (conflitsWithCurrentSections(section)){
                color = 'rgba(0,125,125, 0.3)';
            }
            $scope.eventSource.push(parseCourseInfo(course, section,color));
            $rootScope.selectedSections[section._id] = {
                "section" : section,
                "isPreview" : isPreview
            };
        }
    }

    $rootScope.removeSection = function(section, behavior){
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
            $rootScope.selectedSections[section._id] = null;
        }
    }
    
    $rootScope.toggleSection = function(section,course,color) {
        if(exist(section)) {
            if(isPreview(section)){
                section.status = "selected";
                $rootScope.selectedSections[section._id]['isPreview'] = false;
            } else {
                section.status = "unselected";
                $scope.removeSection(section, 'click');
            }
        } else {
            section.status = "selected";
            $scope.addSection(section,course,false,color);
        }
    };

    $rootScope.showAutoSchedule = function(schedule){
        $scope.eventSource.splice(0,$scope.eventSource.length)
        for (var i = 0; i < schedule.length; i++) {
            $scope.eventSource.push(parseCourseInfo(schedule[i].course, schedule[i],'rgba(0,125,100)'))
        };
    };

    $rootScope.showManualSchedule = function(){

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

app.controller('courseSelectionPanel', ['$scope', '$rootScope', '$http', 
    'getCourseoffQueryUrl', function($scope, $rootScope, $http, getCourseoffQueryUrl){
    $rootScope.selectedCollege = 'gatech';
    $rootScope.selectedTerm = '201508';
    $scope.majorCandidates = [];
    $http.get(getCourseoffQueryUrl($rootScope,'majors')).then(
        function(response) {
        // this callback will be called asynchronously
        // when the response is available
            $scope.majors = response.data;
        }, function(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        });
    $scope.addMajorCandidates = function(major){
        $rootScope.selectedMajor = major.ident;
        $scope.majorCandidates.push(major);
    }
}]);

app.controller('majorCandidate', ['$scope','$rootScope', '$http', 
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
            course.major = $scope.major.ident;
            $rootScope.selectedCourse = course.ident;
            if(!$rootScope.courseCandidates){
                $rootScope.courseCandidates = [];
            }
            $rootScope.courseCandidates.push(course);
        };
}]);

app.controller('courseCandidate', ['$scope', '$rootScope', '$http', 
    'getCourseoffQueryUrl','getHoursAndMinutes', 'colorFactory',
    function($scope, $rootScope, $http, getCourseoffQueryUrl, getHoursAndMinutes, colorFactory){
        $http.get(getCourseoffQueryUrl($rootScope,'sections')).then(
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
                sections[i].course = $
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
            }
            for (var i = 0; i < $scope.courseCandidates.length; i++) {
                if($scope.courseCandidates[i].major === $scope.selectedMajor &&
                    $scope.courseCandidates[i].ident === $scope.selectedCourse){
                    $scope.courseCandidates[i].sections = sections;
                    for(var j in sections){
                        sections[j].course = 
                        {
                            major : $scope.courseCandidates[i].major,
                            ident : $scope.courseCandidates[i].ident,
                            name : $scope.courseCandidates[i].name
                        };
                    }
                }
            };
        }, function(response) {
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
app.controller('scheduler', ['$scope','$rootScope','getPossibleSchedules',
    function($scope,$rootScope,getPossibleSchedules){
    var coursesToBeScheduled = {};
    $scope.schedules = [];
    var auto_schedule = function(){
        var courses = [];
        for(var i in coursesToBeScheduled){
            if(coursesToBeScheduled[i]){
                courses.push(coursesToBeScheduled[i]);
            }
        }
        $scope.schedules = getPossibleSchedules(courses);
    };
    var addCourse = function(course){
        coursesToBeScheduled[course.major+course.ident] = course;
        auto_schedule();
    };
    var removeCourse = function(course){
        coursesToBeScheduled[course.major+course.ident] = null;
        auto_schedule();
    };
    $scope.toggleCourse = function(course){
        if(coursesToBeScheduled[course.major+course.ident]){
            removeCourse(course);
        } else{
            addCourse(course);
        }
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
