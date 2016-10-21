Mesosphere.registerRule('checkDate', function (fieldValue, ruleValue) {
    if (!ruleValue) {
        return true;
    }

    var date = fieldValue.split('-'),
        today = new Date((new Date()).setHours(0, 0, 0, 0));

    date = new Date(date[0], date[1] - 1, date[2]);
    if (+date < +today) {
        return false;
    }
    return true;
});

Mesosphere.registerRule('checkTime', function (fieldValue, ruleValue) {
    if (!ruleValue) {
        return true;
    }
    var time = fieldValue.split(':'),
        now = new Date();

    time = new Date(now.setHours(time[0], time[1]));
    if (+time < +now) {
        return false;
    }
    return true;
});

Mesosphere({
    name: 'newEvent',
    method: 'addEvent',
    fields: {
        title: {
            required: true,
            format: 'alphanumeric',
            message: 'Invalid title: already exists or length bigger than 50 or invalid chars.',
            rules: {
                maxLength: 50
            }
        },
        start: {
            required: true,
            transforms: ['trim'],
            rules: {
                checkDate: true
            },
            /*format: /^2\d{3}-[0-1]\d-[0-3]\d$/,
            message: 'Invalid date: Format YYYY-MM-DD. Check if it\'s not past.'*/
        },
        end: {
            required: true,
            transforms: ['trim'],
            rules: {
                checkDate: true
            },
            /*format: /^2\d{3}-[0-1]\d-[0-3]\d$/,
            message: 'Invalid date: Format YYYY-MM-DD. Check if it\'s not past.'*/
        },
        allDay: {},
        eventType: {
            required: true
        },
        members: {
            required: true
        }
    },
    onFailure: function (errors) {
        var $alert = $('div#new-event-modal').find('div.alert'),
            messages = [];

        $alert.removeClass('hide alert-success').addClass('alert-error');
        messages = _.map(errors, function (val, err) {
            return $('<li>').text(val.message);
        });
        $alert.find('h4').text('Error!');
        $alert.find('ul').html('').append(messages);
    },
    onSuccess: function (data) {
      AntiModals.dismissAll();
      AntiModals.overlay('event_details', {
        data: {
          title: data.title,          
          start: data.start,
          end: data.end,
          allDay: data.allDay,
          eventType: data.eventType,
          members: data.members
        }
      });
    }
});

methods = {
    addEvent: function (rawFormData) {
        var validationObject = Mesosphere.newEvent.validate(rawFormData);
        if (validationObject.errors) {
            return;
        }

        var formData = validationObject.formData;

        //date = new Date(date[0], date[1] - 1, date[2]);
        /*if (time) {
            date = new Date(date.setHours(time[0], time[1]));
        }*/

        var allDay = formData.allDay 
            && (formData.allDay == 'on' || formData.allDay == 'true');

        if (allDay == undefined) {
            allDay = false;
        }

        var eventColor = '';
        switch (formData.eventType){
            case 'Meeting':
            eventColor = 'rgb(191, 187, 232)';
            break;

            case 'Leave':
            eventColor = 'rgb(227, 232, 187)';
            break;

            case 'Holiday':
            eventColor = 'rgb(229, 171, 164)';
            break;
        };
        

        var values = {
            title: formData.title,
            start: new Date(formData.start),
            end: new Date(formData.end),
            allDay: allDay,            
            eventType: formData.eventType,
            members: formData.members,
            color: eventColor
        };

        if (formData._id != undefined && formData._id != '') {
            Calendar.update({_id: formData._id}, values);
        } else {
            Calendar.insert(values);
        }
    }
};

Meteor.methods(methods);
