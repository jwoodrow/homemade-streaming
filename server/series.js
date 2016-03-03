var Future = Npm.require("fibers/future");
var exec = Npm.require("child_process").exec;
var fs = Npm.require('fs');

var cleanPath = function(str){
  return str.replace(/ /g, "\\ ").replace(/\]/g, "\\]").replace(/\[/g, "\\[").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\'/g, "\\'");
};

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

Series.before.remove(function(userId, doc){
  videos = Videos.find({"info.seriesId": doc._id}).fetch();
  _.forEach(videos, function(video, index, videos){
    Videos.remove({_id: video._id});
  });
  path = process.env.PWD + '/public/Series/' + cleanPath(doc.name);
  cmd = "rm -rf " + path;
  var future = new Future();
  exec(cmd, function(error, result){
    if (error){
      console.log(error);
    }
    future.return();
  });
  future.wait();
});
