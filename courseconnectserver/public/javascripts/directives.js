'use strict';


var app = angular.module('courseconnect.directives', ['courseconnect.services']);
app.directive('majorSelectionPanel', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/majorSelectionList.html'
    }
});

app.directive('majorSelectionItem', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/majorSelectionItem.html'
    }
});

app.directive('majorCandidateList', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/majorCandidateList.html'
    }
});

app.directive('majorCandidateCourseItem', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/majorCandidateCourseItem.html'
    }
});

app.directive('courseCandidateList', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/courseCandidateList.html'
    }
});

app.directive('courseCandidateSectionItem', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/courseCandidateSectionItem.html'
    }
});

app.directive('sectionItem', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/sectionItem.html'
    }
});

app.directive('loginStatusBar', function(){
    return {
        restrict: 'E',
        templateUrl: 'html/loginStatusBar.html'
    }
});

app.directive('courseTooltip', function() {
    return {
        // Restrict it to be an attribute in this case
        restrict: 'A',
        // responsible for registering DOM listeners as well as updating the DOM
        link: function(scope, element, attrs) {
            var info = scope.$eval(attrs.courseTooltip);
            $(element).popover({placement: "auto",
                 title: info.title,
                 content:   '<h5>'+"Ref Number: \n"+'</h5>'+info.description.number+
                            '<h5>'+"Section: \n"+'</h5>'+info.description.section+
                            '<h5>'+"Credits: \n"+'</h5>'+info.description.credit+
                            '<h5>'+"Instructor: \n"+'</h5>'+info.description.instructor+
                            '<h5>'+"Location: \n"+'</h5>'+info.description.location,
                 trigger: "hover",
                 html: true,   
                 viewport: { selector: 'body', padding: 10}        
            });
        }
    };
});