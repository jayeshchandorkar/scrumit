Router.configure({
   layoutTemplate: 'layout'  //can be any template name
 });


Router.map(function () {
  this.route('home', {
    path: '/',
  });
  this.route('about');
  
  this.route('login');
  this.route('capacityView');
  this.route('calendarView');
  this.route('teamView');
  this.route('retrospective');

});

var mustBeSignedIn = function() {
    if (!(Meteor.user() || Meteor.loggingIn())) {
        Router.go('home');
    } else {
        this.next();
    }
};
var goHome = function() {
    if (Meteor.user()) {
        Router.go('capacityView');
    } else {
        this.next();
    }
};

Router.onBeforeAction(mustBeSignedIn, {except: ['home']});
//Router.onBeforeAction(goHome, {only: ['home']});
