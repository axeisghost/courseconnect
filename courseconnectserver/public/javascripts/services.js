'use strict';

// courseoff_api_base = "https://soc.courseoff.com/";
// courseoff_api_college = "gatech"

// urls = {
//     majors : 
// }

var app = angular.module('courseconnect.services', []);
// app.factory('getNextStage', function(){
//     return function(currentStage){
//         nextStage = {
//             'terms' : 'majors',
//             'majors' : 'courses',
//             'courses' : 'sections',
//             'sections' : null
//         }
//         return nextStage[currentStage];
//     }
// });

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
// app.factory('getSubLevelInfo', ['$http', 'getNextStage', function($http, currentPath, currentStage, ident){
//     nextStage = getNextStage(currentStage);
//     if (nextStage){

//     } else{
//         return null;
//     }
// }]);