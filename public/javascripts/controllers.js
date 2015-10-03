'use strict';

var app = angular.module('courseconnect.controllers', ['ui.calendar']);

app.controller('calendarController', ['$scope', '$rootScope', '$compile', '$http', 'parseCourseInfo', 
    'hasSectionConflict', function($scope, $rootScope, $compile, $http, parseCourseInfo, hasSectionConflict) {
    /* config object */
    $scope.eventSource = [];
    $scope.storedManualEventSource = null;
    $rootScope.selectedSections = {};
    $scope.schedule = [];
    $scope.lockUpdate = true;
    
    $scope.$watchCollection('schedule', function() {
        if ((!$scope.lockUpdate) && $rootScope.isLoggedIn) {
            console.log('update stsart');
            $http.put('/users/' + $rootScope.user.id, $scope.schedule).success(function() {
                console.log('update complete');
            });
        }
    });

    $rootScope.$watch('isLoggedIn', function() {
        if ($rootScope.isLoggedIn) {
            $http.get('/users/' + $rootScope.user.id).success(function(res) {
                if (res) {
                    $scope.lockUpdate = true;
                    $scope.eventSource.splice(0,$scope.eventSource.length);
                    $rootScope.selectedSections = {};
                    res.schedule.forEach(function(s) {
                        $scope.addSection(s.section,s.course,false,s.color);
                    });
                    $scope.lockUpdate = false;
                }
            })
        }
    });
    
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
            // section.course = course;
            $rootScope.selectedSections[section._id] = {
                "section" : section,
                "isPreview" : isPreview
            };
            
            if (!isPreview) {
                $scope.schedule.push({section: section, course: course, color: color});
            }
        }
    }

    $rootScope.removeSection = function(section, behavior){
        var index = 0;
        if (behavior === 'click' ||
                (behavior === 'mouseleave' && isPreview(section))){
            for (var i = 0; i < $scope.eventSource.length; i++) {
                if ($scope.eventSource[i][0]['id'] === section._id){
                    index = i;
                    break;
                }
            };
            $scope.eventSource.splice(index,1);
            $rootScope.selectedSections[section._id] = null;
        }
        
        if (behavior == 'click') {
            for (var i = 0; i < $scope.schedule.length; i++) {
                if ($scope.schedule[i].section._id === section._id){
                    index = i;
                    break;
                }
            };
            $scope.schedule.splice(index,1);
        }
    }
    
    $rootScope.toggleSection = function(section,course,color) {
        if(exist(section)) {
            if(isPreview(section)){
                section.status = "selected";
                $rootScope.selectedSections[section._id]['isPreview'] = false;
                $scope.schedule.push({section: section, course: course, color: color});
            } else {
                section.status = "unselected";
                $scope.removeSection(section, 'click');
            }
        } else {
            section.status = "selected";
            $scope.addSection(section,course,false,color);
        }
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
