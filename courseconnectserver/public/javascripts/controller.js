'use strict';

var app = angular.module('courseconnect.controllers', ['ui.calendar']);
app.controller('calendarController', function($scope) {
    /* config object */
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
        eventLimit: true
      }
    };
    $scope.eventSources = [];
});