'use strict';

angular.module('courseconnect.controllers')
.controller('calendarController', ['$scope', '$rootScope', '$compile', '$http', 'parseCourseInfo', 
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
                $scope.eventSource.push(parseCourseInfo($rootScope.selectedAutoSchedule[i],'rgba(0,125,100)'))
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
    
    $rootScope.showFriendSchedule = function(){
        if(!$scope.storedManualEventSource){
            $scope.storedManualEventSource = $scope.eventSource.splice(0,$scope.eventSource.length);
        } else{
            $scope.eventSource.splice(0,$scope.eventSource.length);
        }
        if($rootScope.selectedFriend){
            console.log("getting "+$rootScope.selectedFriend.name+"'s schedule");
            $http.get('/users/' + $rootScope.selectedFriend.id).success(function(res) {
                if (res) {
                    res.schedule.forEach(function(s) {
                        //console.log("getting "+$rootScope.selectedFriend.name+"'s schedule: "+s.section.call_number);
                        $scope.eventSource.push(parseCourseInfo(s.section));
                    });
                }
            })
            // if($rootScope.rmedFriend) {
            //     $http.get('/users/' + $rootScope.rmedFriend.id).success(function(res) {
            //         if (res) {
            //             res.schedule.forEach(function(s) {
            //                 //$scope.eventSource.splice(parseCourseInfo(s.section,'rgba(0,125,100)'));
            //             });
            //         }
            //     })    
            // }
        }
        // else{
        //     if($rootScope.rmedFriend) {
        //         $http.get('/users/' + $rootScope.rmedFriend.id).success(function(res) {
        //             if (res) {
        //                 res.schedule.forEach(function(s) {
        //                     //$scope.addSection(s.section,'click');
        //                 });
        //             }
        //         })    
        //     }
        // }
    };

    $scope.uiConfig = {
      calendar:{
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'agendaWeek agendaDay'
        },
        minTime: "08:00:00",
        maxTime: "24:00:00",
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
}])

.controller('controlPanelTab', ['$scope', function($scope) {
    $scope.operationModes = ['Schedule', 'Friends','Auto_Schedule'];
    $scope.currentMode = $scope.operationModes[0];
}])

.controller('courseSelectionPanel', ['$scope', '$rootScope', '$http', '$filter',
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