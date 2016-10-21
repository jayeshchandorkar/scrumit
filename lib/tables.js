// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".




if (Meteor.isClient) {

//Adding for USERNAME only
Accounts.ui.config({
passwordSignupFields: "USERNAME_ONLY"
});

$('.carousel').carousel();



Template.addCapacityForm.rendered = function(){
$('.datetimepicker').datetimepicker();
};


var start = ""
var end = ""
var totalCapacity = 0;
Template.addCapacityForm.events({

'submit form': function(event){
  event.preventDefault();

  start = event.target.startDate.value;
  end = event.target.endDate.value;


  var users  = Meteor.users.find().fetch();
  console.log(users)

  var members = [];
  var filterStart = new Date(start);
  var filterEnd = new Date(end);
  var daysDifference = calculateDifference(filterStart, filterEnd);
  var memberJSON = {};
  var teamCapacity = 0;

  console.log("Users");
  console.log(users);
  for (var uIndex = users.length - 1; uIndex >= 0; uIndex--) {

    var memeberName =users[uIndex].username;

    console.log("searching for"+users[uIndex].username)
    var eventsForMember =   Calendar.find({ members: { $in: [memeberName] } }).fetch();

    var offDays = [];
    var meetingMins = 0;

    // Loop for holidays and leaves
    for (var i = eventsForMember.length - 1; i >= 0; i--) {
       console.log(eventsForMember[i])
      if(eventsForMember[i].eventType == 'Leave'  ||  eventsForMember[i].eventType == 'Holiday'){

          var eventOffDays = getDaysInRange(eventsForMember[i].start, eventsForMember[i].end);
          offDays = offDays.concat(eventOffDays);
      }
    }

    // Loop for meetings
    for (var i = eventsForMember.length - 1; i >= 0; i--) {
      if(eventsForMember[i].eventType  == 'Meeting' ){
        var durations = getDurationsForDays(eventsForMember[i].start, eventsForMember[i].end);
        console.log(durations);
        jQuery.each(durations, function(mDay, duration) {
          console.log(mDay + " : " + duration);
          var ignoreMeeting = false;
          for (var j = offDays.length - 1; j >= 0; j--) {            
            if(isSameDay(new Date(mDay), offDays[j])){
              ignoreMeeting = true;
            }
          };
          // consider only meeetings which are not on holidays/leaves day
          if(!ignoreMeeting){
            if(duration > 480){
              meetingMins +=  480;
            }else{
              meetingMins +=  duration;
            }
          }
        });
      }
    }
    var tempOffDays = [];
    for (var i = offDays.length - 1; i >= 0; i--) {
      // Check if the date is between selected range.
      if(filterStart < offDays[i] && filterEnd > offDays[i]){
          tempOffDays.push((offDays[i].getMonth() + 1) + "/" + offDays[i].getDate());
      }
    };
    offDays = eliminateDuplicates(tempOffDays);
    console.log("off days"+offDays);

    totalCapacity = (((daysDifference - offDays.length) * 8 * 60) - meetingMins)/60;

    teamCapacity = teamCapacity + totalCapacity;

    var entry = {member :memeberName,capacity: totalCapacity , datesOff : offDays , daysOffCount : offDays.length};
    memberJSON [entry.member] = entry;
   members.push(entry);
  };

  Session.set('members' , members);

  Session.set('teamCapacity' , teamCapacity);

}

});





Template.capacityBoard.helpers({
  teamTotalCapacity : function () {
    return Session.get('teamCapacity');
  },
teamMembers : function () {

  //alert();


// Session.set('members' , members);

  return Session.get('members');

},
tableSettings : function () {
  return {
    fields: [
    { key: 'member', label: 'Member' },
    { key: 'daysOffCount', label: 'Days off'},
    { key: 'datesOff', label: 'Dates off', tmpl: Template.daysOffClmn},
     { key: 'capacity', label: '% Utilization', fn: function (value, object) { return "100"; }},
    { key: 'capacity', label: 'Capacity (Hrs)' }
    ]
  };
}
});


Template.teamBoard.helpers({
users : function () {

  console.log(Meteor.users.find().fetch());
  return Meteor.users.find().fetch();

},
tableSettings : function () {
  return {
    fields: [
    { key: 'username', label: 'Member' },
    { key: 'username', label: '% Utilization', fn: function (value, object) { return "100"; }},
    { key: 'username', label: 'Country', fn: function (value, object) { return "India"; } }
    ]
  };
}
});

}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
Meteor.startup(function () {


});
}

function eliminateDuplicates(arr) {
  var i,
      len=arr.length,
      out=[],
      obj={};

  for (i=0;i<len;i++) {
    obj[arr[i]]=0;
  }
  for (i in obj) {
    out.push(i);
  }
  return out;
}

function isWeekend(date){
  if(date.getDay() === 0 || date.getDay() === 6)
    return true
  else
    return false;
}


function getDurationsForDays(start, end){
  var tempDate = new Date(start);
  var durations = {};
  while(tempDate <= end){
    if(!isSameDay(tempDate, start) && !isSameDay(tempDate, end)){
      // Full day covered
         durations[tempDate] = 24 * 60; 
    } else if(isSameDay(tempDate, start) && !isSameDay(tempDate, end)){
      durations[tempDate] = minutesUntilMidnight(tempDate);
    } else if (!isSameDay(tempDate, start) && isSameDay(tempDate, end)) {
      durations[tempDate] = minutesFromMidnight(tempDate);
    }else{
      durations[tempDate] = getMinsDiff(tempDate, end);
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }
  console.log("Meeting durations ");
  console.log(durations);
  return durations;
}

function getMinsDiff(start, end){
  return ((end - start)/1000/60);
}

function isSameDay(dateToCheck, actualDate){
  if(dateToCheck.getDate() == actualDate.getDate() 
        && dateToCheck.getMonth() == actualDate.getMonth()
        && dateToCheck.getFullYear() == actualDate.getFullYear())
    return true;
  else
    return false;
}

function minutesUntilMidnight(time) {
    var midnight = new Date(time);
    midnight.setHours( 24 );
    midnight.setMinutes( 0 );
    midnight.setSeconds( 0 );
    midnight.setMilliseconds( 0 );
    return Math.round(( midnight.getTime() - time.getTime() ) / 1000 / 60);
}

function minutesFromMidnight(time) {
    var midnight = new Date(time);
    midnight.setHours( 0 );
    midnight.setMinutes( 0 );
    midnight.setSeconds( 0 );
    midnight.setMilliseconds( 0 );
    return Math.round(( time.getTime() - midnight.getTime() ) / 1000 / 60);
}

function getDaysInRange(start, end){
  var days = [];
  var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
  var diffDays = Math.ceil(Math.abs((end.getTime() - start.getTime())/(oneDay)));
  var tempDate = start;
  for (var i = 0; i < diffDays; i++) {
      tempDate.setDate(tempDate.getDate() + i) ;
      if(!isWeekend(tempDate))
        days.push(new Date(tempDate));
  }
  return days;
}


function calculateDifference(startDate, endDate){

 // Validate input
 if (endDate < startDate)
  return 0;

  // Calculate days between dates
  var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
  startDate.setHours(0,0,0,1);  // Start just after midnight
  endDate.setHours(23,59,59,999);  // End just before midnight
  var diff = endDate - startDate;  // Milliseconds between datetime objects
  var days = Math.ceil(diff / millisecondsPerDay);

  // Subtract two weekend days for every week in between
  var weeks = Math.floor(days / 7);
  var days = days - (weeks * 2);

  // Handle special cases
  var startDay = startDate.getDay();
  var endDay = endDate.getDay();

  // Remove weekend not previously removed.
  if (startDay - endDay > 1)
    days = days - 2;

  // Remove start day if span starts on Sunday but ends before Saturday
  if (startDay == 0 && endDay != 6)
    days = days - 1

  // Remove end day if span ends on Saturday but starts after Sunday
  if (endDay == 6 && startDay != 0)
    days = days - 1

  return days;
}

