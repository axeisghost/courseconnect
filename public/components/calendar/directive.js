'use strict';

angular.module('courseconnect.directives')
.directive('calendar', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/calendar/view.html'
    }
})
.directive('courseTooltip', function() {
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