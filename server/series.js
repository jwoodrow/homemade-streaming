var Future = Npm.require("fibers/future");
var exec = Npm.require("child_process").exec;
var fs = Npm.require('fs');

Meteor.methods({
  CreateSerie: function(name, description){
    serie = {
      name: name,
      description: description
    };

    check(serie, Series.simpleSchema());
    return Series.insert(serie);
  }
});
