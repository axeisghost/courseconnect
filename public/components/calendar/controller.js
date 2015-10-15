'use strict';

angular.module('courseconnect.controllers')
.controller('calendarController', ['$scope', '$rootScope', '$compile', '$http', 'parseCourseInfo', 
    'hasSectionConflict', function($scope, $rootScope, $compile, $http, parseCourseInfo, hasSectionConflict) {
    /* config object */
    $scope.eventSource = [];
    $scope.storedManualEventSource = null;
    $scope.schedule = [];
    
    $rootScope.selectedSectionUI = null;
    /*
        format for friendScheds:
        {
        friend.id : [list_of_sections]        
        }
    */
    $rootScope.friendScheds = {};
    
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
            if(changedSection.section.sectionID == $scope.eventSource[i][0]['id']){
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
            var newSection = {
                section: section, 
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
        $rootScope.currentMode = "Auto-Schedule";
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
        $rootScope.currentMode = "Schedule";
        $scope.eventSource.splice(0,$scope.eventSource.length)
        if($scope.storedManualEventSource){
            for (var i in $scope.storedManualEventSource) {
                $scope.eventSource.push($scope.storedManualEventSource[i]);
            };
        }
        $scope.storedManualEventSource = null;
    };
    
    $rootScope.showFriendSchedule = function(){
        $rootScope.currentMode = "Friends";
        if(!$scope.storedManualEventSource){
            $scope.storedManualEventSource = angular.copy($scope.eventSource); //store current user's schedule
            // instantiate all friends' schedules
            // for(var i in $rootScope.friends) {
            //     var curF = $rootScope.friends[i];
            //     curF.taking = 0;
            //     console.log("checking on friends: "+curF.id);
            //     $http.get('/users/' + curF.id).success(function(res) {
            //         if (res) {
            //             res.schedule.forEach(function(s) {
            //                 $rootScope.friendScheds[curF.id] = [];
            //                 console.log("pushing "+curF.id+": "+s.section.sectionID+ " into friends schedules");
            //                 $rootScope.friendScheds[curF.id].push(s.section.sectionID);  
            //             });
            //         }
            //     })
            // }
        }
        
        //console.log("storedManualEventSource "+$scope.storedManualEventSource);
        if($rootScope.selectedFriend){
            if($rootScope.rmedFriend) {
                $scope.eventSource.splice(0,$scope.eventSource.length);
                if($scope.storedManualEventSource){
                    for (var i in $scope.storedManualEventSource) {
                        $scope.eventSource.push($scope.storedManualEventSource[i]);
                    };
                }
                
                // the following code picks out friend schedule to delete from the calendar -> supposedly no flash of empty cal, need to test after undefined section problem fixed
                // for(var i in $rootScope.selectedFriendSched) {
                //     for(var j=0; j<$scope.eventSource.length; j++) {
                //         if($scope.eventSource[j][0]['id']==$rootScope.selectedFriendSched[i][0]['id']) {
                //             $scope.eventSource.splice(j,1);
                //             break;
                //         }
                //     }
                // }
            }
            //console.log("getting "+$rootScope.selectedFriend.name+"'s schedule");
            var c =0;
            $http.get('/users/' + $rootScope.selectedFriend.id).success(function(res) {
                if (res) {
                    res.schedule.forEach(function(s) {
                        // console.log(c);
                        // c++;
                        // console.log("getting "+$rootScope.selectedFriend.name+"'s schedule: "+s.section.sectionID);
                        var converted = parseCourseInfo(s.section, 'rgba(0,0,0, 0.2)');
                        //$rootScope.selectedFriendSched.push(converted); //store current friend's schedule
                        $scope.eventSource.push(converted);
                        //$rootScope.addSection(s.section,false,'rgba(0,0,0, 0.2)',false);
                    });
                }
            })
        } else{
            if($rootScope.rmedFriend) { 
                // console.log("after removing storedManualEventSource "+$scope.storedManualEventSource);
                // console.log("removing "+$rootScope.rmedFriend.name+"'s schedule");
                
                // the following code first wipes out all sections and adds user's schedule -> flashes empty calendar 
                $scope.eventSource.splice(0,$scope.eventSource.length);
                if($scope.storedManualEventSource){
                    for (var i in $scope.storedManualEventSource) {
                        $scope.eventSource.push($scope.storedManualEventSource[i]);
                    };
                }
            }
        }
    };

    $scope.clickedSection = function(event, element){
        console.log(event.title+" selected section id: "+event.id);
        $rootScope.selectedSectionUI = event.id;
        if($rootScope.currentMode=="Friends") {
            console.log("calling splitfirends()")
            $rootScope.splitFriends();
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
        maxTime: "24:00:00",
        editable: false,
        weekends: false,
        allDaySlot: false,
        height: "auto",
        defaultView: "agendaWeek",
        eventLimit: true,
        eventClick: $scope.clickedSection,
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