SuperCalendar = {
  events: {
    onEventClick: function (e, t, data) {
      var eventId = e.target.id || $(e.target).closest('.fc-event').attr('id');
      var calEvent = Calendar.findOne(eventId);

      AntiModals.overlay('event_details', {
        data: calEvent
      });
    },
    onDayClick: function (e, t, data) {
      var target = event;
      //var date = data.date;
      // var month = ('0' + (date.getMonth() + 1)).slice(-2);
      // var day = ('0' + date.getDate()).slice(-2);
      // var formattedDate = date.getFullYear() + '-' + month + '-' + day;
      // var hour = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
      // var timeData = {
      //   timeInputStyle: 'display: none;',
      //   hasTimeChecked: false,
      //   noTimeChecked: true
      // };

      // if (data.view.name === 'agendaWeek' ||
      //     data.view.name === 'agendaDay') {
      //   timeData = {
      //     timeInputStyle: 'display: block;',
      //     hasTimeChecked: true,
      //     noTimeChecked: false
      //   };
      // }

      
      AntiModals.overlay('new_event_modal', {
        data: {            
            title: data.title,
            start: moment(data.date).format('MM/DD/YYYY h:mm:ss a'),
            end: moment(data.date).add(1, 'hours').format('MM/DD/YYYY h:mm:ss a')           
          }
      });
    }
  },
  rendered: function () {
    var self = this;

    self.autorun(function () {
      if (! Session.get('superCalendarReady', true) ||
          typeof Calendar === 'undefined') {
        return;
      }
      var entries = Calendar.find().fetch();
      var $calendar = $('#calendar');
      var calElem = $calendar.html('');

      calElem.fullCalendar({
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay'
        },
        editable: true,
		eventDurationEditable : true,
		selectable: true,
        events: entries,
        eventRender: function (event, element) {
          $(element).attr('id', event._id);
        },
        dayClick: function (date, flag, e, view) {			
          return SuperCalendar.events.onDayClick.call(this, e, self, {
            date: date,
            view: view
          });
        },
        eventClick: function (date, e, view) {
          return SuperCalendar.events.onEventClick.call(this, e, self, {
            date: date,
            view: view
          });
        },
    		eventDrop: function( event) { 
    			Calendar.update({_id: event._id}, {
                title: event.title,
                start: event.start,
                end: event.end,
                allDay: event.allDay,
                eventType: event.eventType,
                members: event.members,
                color: event.color            
            });      
    		  }         
      });
        

        var calView = Session.get('currentCalView');
        if (calView != undefined) {
          $calendar.html('').fullCalendar( 'changeView', calView.name )
        }

    });
  }
};

