'use strict';

var app = angular.module('courseconnect.controllers', ['ui.calendar']);

app.controller('calendarController', ['$scope', '$rootScope', '$compile', '$http', 'parseCourseInfo', 
    'hasSectionConflict', function($scope, $rootScope, $compile, $http, parseCourseInfo, hasSectionConflict) {
    /* config object */
    $scope.eventSource = [];
    $scope.storedManualEventSource = null;
    $scope.schedule = [];
    
    var syncDB = function(){
        $http.put('/users/' + $rootScope.user.id, $scope.schedule).success(function(res) {
            console.log(res);
        });
    };

    $rootScope.$watch('isLoggedIn', function() {
        if ($rootScope.isLoggedIn) {
            $http.get('/users/' + $rootScope.user.id).success(function(res) {
                if (res) {
                    $scope.eventSource.splice(0,$scope.eventSource.length);
                    res.schedule.forEach(function(s) {
                        $scope.addSection(s.section,false,s.color);
                    });
                }
            })
        }
    });
    
    var getSectionIndex = function(section) {
        for (var i = 0; i < $scope.schedule.length; i++) {
            if ($scope.schedule[i].section.sectionID === section.sectionID){
                return i;
            }
        }
        return -1;
    };

    var isPreview = function(section){
        var index = getSectionIndex(section);
        if(index >= 0){
            return $scope.schedule[index].isPreview;
        } else{
            return false;
        }
    }

    var conflitsWithCurrentSections = function(section) {
        for (var i = 0; i < $scope.schedule.length; i++) {
            if (hasSectionConflict($scope.schedule[i].section,section)){
                return true;
            }
        }
        return false;
    };

    /*refreshCalendar is used to update the calendar when adding or removing sections.
      The purpose of this function is to restrict the use of $scope.eventSource.

      Input : {
        section : seciton,
        color : color,
        isPreview : isPreview
      }
    */
    var refreshCalendar = function(changedSection){
        for (var i = 0; i < $scope.eventSource.length; i++) {
            if(changedSection.section.sectionID === $scope.eventSource[i][0]['id']){
                $scope.eventSource.splice(i,1);
                return;
            }
        }
        $scope.eventSource.push(
                    parseCourseInfo(changedSection.section,
                        changedSection.color));
    };

    $rootScope.addSection = function(section,isPreview,color){
        var index = getSectionIndex(section);
        if (index<0){
            if (conflitsWithCurrentSections(section)){
                color = 'rgba(0,125,125, 0.3)';
            }
            var newSection = {section: section, 
                                color: color,
                                isPreview: isPreview
                            };
            $scope.schedule.push(newSection);
            refreshCalendar(newSection);
        }
    }

    $rootScope.removeSection = function(section, behavior){
        if (behavior === 'click' ||
                (behavior === 'mouseleave' && isPreview(section))){
            var index = getSectionIndex(section);
            var removedSection = $scope.schedule.splice(index,1);
            refreshCalendar(removedSection[0]);
        }
    }
    
    $rootScope.toggleSection = function(section,color) {
        var index = getSectionIndex(section);
        if(index>=0) {
            if(isPreview(section)){
                section.status = "selected";
                $scope.schedule[index].isPreview = false;
                $scope.schedule.push({section: section, color: color});
            } else {
                section.status = "unselected";
                $scope.removeSection(section, 'click');
            }
        } else {
            section.status = "selected";
            $scope.addSection(section,false,color);
        }
        syncDB();
    };

    $rootScope.showAutoSchedule = function(){
        if(!$scope.storedManualEventSource){
            $scope.storedManualEventSource = $scope.eventSource.splice(0,$scope.eventSource.length);
        } else{
            $scope.eventSource.splice(0,$scope.eventSource.length);
        }
        if($rootScope.selectedAutoSchedule){
            for (var i = 0; i < $rootScope.selectedAutoSchedule.length; i++) {
                $scope.eventSource.push(parseCourseInfo($rootScope.selectedAutoSchedule[i].course, $rootScope.selectedAutoSchedule[i],'rgba(0,125,100)'))
            };
        }
    };

    $rootScope.showManualSchedule = function(){
        $scope.eventSource.splice(0,$scope.eventSource.length)
        if($scope.storedManualEventSource){
            for (var i in $scope.storedManualEventSource) {
                $scope.eventSource.push($scope.storedManualEventSource[i]);
            };
        }
        $scope.storedManualEventSource = null;
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
    $scope.operationModes = ['Schedule', 'Friends','Auto_Schedule'];
    $scope.currentMode = $scope.operationModes[0];
}]);

app.controller('courseSelectionPanel', ['$scope', '$rootScope', '$http', '$filter',
    'getCourseoffQueryUrl', function($scope, $rootScope, $http, $filter, getCourseoffQueryUrl){
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
    $scope.removeMajorCandidates = function(major, ev){
        ev.preventDefault();
        ev.stopPropagation();
        console.log("test enter remove major c");
        var index = $scope.majorCandidates.indexOf(major);
        if(index>-1){
            $scope.majorCandidates.splice(index, 1);
        }
    }
    $scope.removeCourseCandidate = function(course, ev){
        ev.preventDefault();
        ev.stopPropagation();
        console.log("test enter remove cource c");
        if($rootScope.courseCandidates){
            var index = $rootScope.courseCandidates.indexOf(course);
            if(index>-1){
                $rootScope.courseCandidates.splice(index, 1);
            }
        }
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
            course.major = $scope.major;
            $rootScope.selectedCourse = course.ident;
            $rootScope.selectedCourseName = course.name;
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
                sections[i].majorIdent = $scope.selectedMajor;
                sections[i].courseIdent = $scope.selectedCourse;
                sections[i].courseName = $scope.selectedCourseName;
                sections[i].sectionID = $scope.selectedMajor + $scope.selectedCourse + sections[i].ident;
            }
        }, function(response) {
        });
        $scope.sectionColor = colorFactory.getNextColor();
        $scope.sectionAvailable = function(){
            return $scope.instructors.length == 0;
        };
        $scope.$on("SchemeChanged", function(){
            $scope.sectionColor = colorFactory.getNextColor();
        })
}]);
app.controller('scheduler', ['$scope','$rootScope','getPossibleSchedules',
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
    $scope.setSelectedAutoSchedule = function(schedule){
        $rootScope.selectedAutoSchedule = schedule;
        $rootScope.showAutoSchedule();
    };
}]);
app.controller('loginStatusController', ['$scope', '$rootScope', 
    '$facebook', '$http', function($scope, $rootScope, $facebook, $http){
    $rootScope.isLoggedIn = false;
    $rootScope.user = {};
    $rootScope.friends = [];
    $scope.login = function() {
        $facebook.login().then(function() {
            refresh();
        });
    }
    $scope.logout = function() {
         $facebook.logout().then(function() {
            $rootScope.isLoggedIn = false;
            $rootScope.user = {};
            $rootScope.friends = [];
        });
    }
    function refresh() {
        $facebook.api("/me").then( 
            function(response) {
                $rootScope.user.id = response.id;
                $rootScope.user.name = response.name;
                $rootScope.isLoggedIn = true;
                
                $http.post('/users/' + $rootScope.user.id);
            },
            function(err) {
                $rootScope.user = {};
                $rootScope.isLoggedIn = false;
            });
        $facebook.api("/me/picture").then( 
            function(response) {
                $rootScope.user.picture = response.data.url;
            });
        $facebook.api("/me/friends").then( 
            function(response) {
                response.data.forEach(function(fdata) {
                    var friend = {};
                    friend.id = fdata.id;
                    friend.name = fdata.name;
                    $facebook.api("/" + fdata.id + "/picture").then( 
                        function(response) {
                            friend.picture = response.data.url;
                        });
                    $rootScope.friends.push(friend);
                });
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
