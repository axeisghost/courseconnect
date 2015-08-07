$(document).ready(function() {
    
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'agendaWeek,agendaDay'
        },
        views: {
            agenda: {
                // options apply to agendaWeek and agendaDay views
            },
            day: {
                // options apply to basicDay and agendaDay views
            }
        },
        minTime: "08:00:00",
        maxTime: "20:00:00",
        editable: false,
        weekends: false,
        allDaySlot: false,
        height: "auto",
        contentHeight: 160,
        defaultView: "agendaWeek",
        eventLimit: true, // allow "more" link when too many events
        eventSources:[
        {
            url: 'http://localhost:3000/json_agenda',
            error: function() {
            }
        }],                                 
        loading: function(bool) {
            $('#loading').toggle(bool);
        }
    });
    
});