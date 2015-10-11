'use strict';

angular.module('courseconnect.services')
.factory('getCourseoffQueryUrl', function() {
    var hierarchies = {
        'terms':'selectedTerm',
        'majors':'selectedMajor',
        'courses':'selectedCourse',
        'sections':'selectedSection'
    };
    return function(scope, level){
        var url = 'https://soc.courseoff.com/' + scope.selectedCollege;
        for(var key in hierarchies){
            var currentIdent = scope[hierarchies[key]];
            url += ('/' + key);
            if (key === level){
                return url;
            }
            url += ('/' + currentIdent);
        }
        return url;
    };
})
.factory('getHoursAndMinutes', function(){
    return function(time){
        var tempTime = {};
        tempTime.hour = time / 60 | 0;
        tempTime.minute = time % 60;
        return tempTime;
    };
})
.factory('getMinutes', function(){
    return function(time){
        return time.hour * 60 + time.minute;
    };
})
.factory('hasSectionConflict', ['getMinutes', function(getMinutes){
    return function (section1, section2){
        for (var i = 0; i < section1.sectionTimeSlot.length; i++) {
            for (var j = 0; j < section2.sectionTimeSlot.length; j++) {
                var earlierSection = null;
                var laterSection = null;
                if (getMinutes(section1.sectionTimeSlot[i].startTime) <=
                    getMinutes(section2.sectionTimeSlot[j].startTime)) {
                    earlierSection = section1.sectionTimeSlot[i];
                    laterSection = section2.sectionTimeSlot[j];
                } else {
                    earlierSection = section2.sectionTimeSlot[j];
                    laterSection = section1.sectionTimeSlot[i];
                }
                // console.log(earlierSection.endTime);
                // console.log(laterSection.startTime);
                if (getMinutes(earlierSection.endTime) >= 
                    getMinutes(laterSection.startTime)) {
                    console.log('found problem');
                    for (var l = 0; l < earlierSection.days.length; l++) {
                        for (var k = 0; k < laterSection.days.length; k++) {
                            if (laterSection.days[k] == earlierSection.days[l]){
                                return true;
                            }
                        };
                        earlierSection.days[i]
                    };
                }
            };
        };
        return false;
    };
}])
.factory('conflictWithSections', ['hasSectionConflict', function(hasSectionConflict){
    return function(section, otherSections) {
        for (var i in otherSections) {
            if (otherSections[i] &&
                hasSectionConflict(otherSections[i],section)){
                return true;
            }
        }
        return false;
    };
}])
.factory('getPossibleSchedules', ['conflictWithSections', function(conflictWithSections){
    return function(courses){
        var schedules = [];
        for(var i in courses){
            var currentCourse = courses[i];
            var newSchedules = [];
            for(var j in currentCourse.sections){
                var currentSection = currentCourse.sections[j];
                if(i == 0){ //Handle the first course.
                    newSchedules.push([currentSection]); 
                } else if(schedules.length == 0) {
                    return [];
                } else {
                    for(var k in schedules){
                        var currentSchedule = schedules[k];
                        if(!conflictWithSections(currentSection,currentSchedule)){
                            var newSchedule = currentSchedule.concat(currentSection);
                            newSchedules.push(newSchedule);
                        }
                    }
                }
            }
            schedules = newSchedules;
        }
        return schedules;
    };
}])
.factory('parseCourseInfo', ['getHoursAndMinutes', function(getHoursAndMinutes) {
    return function(section, color) {
        var weekdays = ['M','T','W','R','F']; 
        var ui_form = [];
        for(var i = 0; i < section.timeslots.length; i++){
            ui_form[i]={};
            ui_form[i]['title']= section.majorIdent+" - "+ section.courseIdent+
                "\nSection "+section['ident']+'\n'+''+section.courseName+'\n';
            var startDate = new Date();
            var startTime = getHoursAndMinutes(section.timeslots[i].start_time);
            startDate.setHours(startTime.hour);
            startDate.setMinutes(startTime.minute);
            var endDate = new Date();
            var endTime = getHoursAndMinutes(section.timeslots[i].end_time);
            endDate.setHours(endTime.hour);
            endDate.setMinutes(endTime.minute);
            ui_form[i]['id'] = section.sectionID;
            ui_form[i]['start'] = startDate;
            ui_form[i]['end'] = endDate;
            ui_form[i]['dow'] = [weekdays.indexOf(section.timeslots[i]['day'])+1];
            ui_form[i]['backgroundColor'] = color;
            ui_form[i]['description'] ={};
            ui_form[i]['description']['section'] = section['ident'];
            ui_form[i]['description']['number'] = section.call_number;
            ui_form[i]['description']['credit'] = section.credits;
            ui_form[i]['description']['instructor'] = section.instructor.lname+", "+section.instructor.fname;
            ui_form[i]['description']['location'] = section.timeslots[i].location;
        }
        return ui_form;
    };
}])
.factory('colorFactory',function(){
    var colorSchemes = {
        defaultColor:['#F16745', '#FFC65D', '#7BC8A4', '#4CC3D9', '#93648D'],
        color1:['#FFCB74', '#F78D63', '#E2646D', '#C3658F', '#996E93'],
        color2:['#88B0C1', '#627192', '#4B4261', '#2F1232', '#ECE7E1'],
        color3:['#A1A584', '#CDD3A7', '#EFEAC0', '#9CB6B5', '#9ED5D2'],
    };
    var currentScheme = colorSchemes.defaultColor;
    return {
        getNextColor: function(){
            var whichColor = Math.floor((Math.random()*10))%5;
            return currentScheme[whichColor];
        },
        getSchemeList: function(){
            return colorSchemes;
        },
        getCurrentScheme: function(){
            return currentScheme;
        },
        changeScheme: function(selection){
            currentScheme = colorSchemes[selection];
        }
    };
});