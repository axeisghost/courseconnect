'use strict';

// courseoff_api_base = "https://soc.courseoff.com/";
// courseoff_api_college = "gatech"

// urls = {
//     majors : 
// }

var app = angular.module('courseconnect.services', []);

app.factory('getCourseoffQueryUrl', function(){
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