if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
    
  Meteor.subscribe('calendar', function () {
	Session.set('superCalendarReady', true);
  });
  
  Template.event_details.events( {
  	'click #remove-event': function(){
  		Calendar.remove(this._id);
  		AntiModals.dismissAll();
  	},
    'click #edit-event': function(){
      var data = jQuery.extend({}, this);
      // TODO

      AntiModals.dismissAll();

      data.start = moment(data.start).format('MM/DD/YYYY h:mm:ss a');
      data.end = moment(data.end).format('MM/DD/YYYY h:mm:ss a');

      AntiModals.overlay('new_event_modal', {
        data: data
      });      
    }
  });

  Template.new_event_modal.rendered = function(){
    $('.datetimepicker').datetimepicker();
  };

  Template.eventTypeControl.helpers({
    eventTypes : function () {
      var types = [
        {label: 'Meeting', value: 'Meeting'},
        {label: 'Leave', value: 'Leave'},
        {label: 'Holiday', value: 'Holiday'}
      ];
      return types;
    }
  });

  Template.memberControl.helpers({
    allmembers : function () {
      return Meteor.users.find().fetch();
    }
  });

  Handlebars.registerHelper('mutiselected', function(key, values){
      var selected = false;
      if (jQuery.isArray(values)) {
        jQuery.each(values, function(value) {
          if (key == value) {
            selected = true;
          }
        });
      } else {
        selected = key == values;
      }
      return selected? {selected:'selected'}: '';
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
	Meteor.publish('calendar', function () {
	  return Calendar.find();
	});
  });
}






