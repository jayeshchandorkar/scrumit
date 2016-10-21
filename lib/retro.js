Tasks = new Mongo.Collection("tasks");
Donts = new Mongo.Collection("donts");

if (Meteor.isClient) {
  // This code only runs on the client
  Template.retro.helpers({
    tasks: function () {
       return Tasks.find({}, {sort: {createdAt: 1}});
    },
     donts: function () {
       return Donts.find({}, {sort: {createdAt: 1}});
    }
  });

  Template.retro.events({
  "submit .new-task": function (event) {
    // This function is called when the new task form is submitted

    var text = event.target.text.value;

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      createdBy : Meteor.user().username,
      upCount : 0,
      downCount : 0
    });

    // Clear form
    event.target.text.value = "";

    // Prevent default form submit
    return false;
  },
    "submit .new-dont": function (event) {
    // This function is called when the new task form is submitted

    var text = event.target.text.value;

    Donts.insert({
      text: text,
      createdAt: new Date() ,
      createdBy : Meteor.user().username, 
      upCount : 0,
      downCount : 0
    });

    // Clear form
    event.target.text.value = "";

    // Prevent default form submit
    return false;
  }
});
// In the client code, below everything else
Template.task.events({
  "click .toggle-checked": function () {
    // Set the checked property to the opposite of its current value
    Tasks.update(this._id, {$set: {checked: ! this.checked}});
  },
  "click .delete": function () {
    Tasks.remove(this._id);
  }
});

Template.dont.events({
  "click .toggle-checked": function () {
    // Set the checked property to the opposite of its current value
    Donts.update(this._id, {$set: {checked: ! this.checked}});
  },
  "click .delete": function () {
    Donts.remove(this._id);
  }
});


Template.dovote.events({
  "click #voteup": function () {
    this.upCount = this.upCount + 1;
    Tasks.update(this._id, this);
  },
  "click #votedown": function () {
    this.downCount = this.downCount + 1;    
    Tasks.update(this._id, this);
  }
});

Template.dontvote.events({
  "click #voteup": function () {
    this.upCount = this.upCount + 1;
    Donts.update(this._id, this);
  },
  "click #votedown": function () {
    this.downCount = this.downCount + 1;    
    Donts.update(this._id, this);
  }
});

}
