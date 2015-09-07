'use strict';

// courseoff_api_base = "https://soc.courseoff.com/";
// courseoff_api_college = "gatech"

// urls = {
//     majors : 
// }

var app = angular.module('courseconnect.services', []);

app.factory('getCourseoffQueryUrl', function() {
    var hierarchies = {
        'terms':'selectedTerm',
        'majors':'selectedMajor',
        'courses':'selectedCourse',
        'sections':'selectedSection'
    };
    return function(scope){
        var url = 'https://soc.courseoff.com/' + scope.selectedCollege;
        for(var key in hierarchies){
            var currentIdent = scope[hierarchies[key]];
            url += ('/' + key);
            if(currentIdent){
                url += ('/' + currentIdent);
            } else{
                return url;
            }
        }
        return url;
    };
});

app.factory('getHoursAndMinutes', function(){
    return function(time){
        var tempTime = {};
        tempTime.hour = time / 60 | 0;
        tempTime.minute = time % 60;
        return tempTime;
    };
});

app.factory('getMinutes', function(){
    return function(time){
        return time.hour * 60 + time.minute;
    };
});

app.factory('hasSectionConflict', ['getMinutes', function(getMinutes){
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
                console.log(earlierSection.endTime);
                console.log(laterSection.startTime);
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
}]);

app.factory('parseCourseInfo', ['getHoursAndMinutes', function(getHoursAndMinutes) {
    return function(major, course, section, color) {
        var weekdays = ['M','T','W','R','F']; 
        var ui_form = [];
        for(var i = 0; i < section.timeslots.length; i++){
            ui_form[i]={};
            ui_form[i]['title']= major['ident']+" - "+ course['ident']+
                "\nSection "+section['ident']+'\n'+''+course['name']+'\n';
            var startDate = new Date();
            var startTime = getHoursAndMinutes(section.timeslots[i].start_time);
            startDate.setHours(startTime.hour);
            startDate.setMinutes(startTime.minute);
            var endDate = new Date();
            var endTime = getHoursAndMinutes(section.timeslots[i].end_time);
            endDate.setHours(endTime.hour);
            endDate.setMinutes(endTime.minute);
            ui_form[i]['id'] = section._id;
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
    }
}]);

app.factory('colorFactory',function(){
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
    }
});