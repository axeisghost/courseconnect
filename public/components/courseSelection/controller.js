'use strict';

angular.module('courseconnect.controllers')
.controller('courseCandidate', ['$scope', '$rootScope', '$http', 
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
            for (var i = 0; i < $rootScope.courseCandidates.length; i++) {
                if($rootScope.courseCandidates[i].ident === $scope.selectedCourse){
                    $rootScope.courseCandidates[i].sections = sections;
                    break;
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
        })
}]);