if (Meteor.isClient) {
  Template.navItems.helpers({
    activeTemplate: function (template) {
      var currentRoute = Router.current();
      return currentRoute &&
        template === currentRoute.route.getName() ? 'active' : '';
    }
  });
  // Template.articles.helpers({
  //   maybeSelected: function () {
  //     var currentRoute = Router.current();
  //     return currentRoute &&
  //       this._id === currentRoute.params._id ? 'selected' : '';
  //   }
  // });

  Template.navLogin.helpers({
    activeTemplate: function (template) {
      var currentRoute = Router.current();
      return currentRoute &&
        template === currentRoute.route.getName() ? 'active' : '';
    }
  });


  Handlebars.registerHelper('isLoggedInUser', function(user){      
      return user == Meteor.user().username;
  });
}
