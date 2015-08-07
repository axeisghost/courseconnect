$(document).ready(function() {
    
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        defaultDate: '2015-02-1',
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        eventSources:[
        {
            url: 'http://localhost:3000/json_agenda',
            error: function() {
                $('#script-warning').show();
            }
        }],                                 
        loading: function(bool) {
            $('#loading').toggle(bool);
        }
    });
    
});