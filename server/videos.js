var Future = Npm.require("fibers/future");
var exec = Npm.require("child_process").exec;

var cleanPath = function(str){
  return str.replace(/ /g, "\\ ").replace(/\]/g, "\\]").replace(/\[/g, "\\[").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\'/g, "\\'");
};

Videos.after.insert(function(userId, doc){
  var source = Torrents.findOne({_id: doc.info.torrentId});
  var videoFile = source.files[doc.info.fileId];
  if (doc.info.seriesId){
    var series = Series.findOne({_id: doc.info.seriesId});

    var path = process.env.PWD + '/public/Series/' + series.name + "/" + doc.info.seasonNumber + "/" + doc.info.epNumber + "/";
    var future = new Future();
    cmd = "mkdir -p " + path + "{subtitles,audio}";
    exec(cmd, function(error, stdout, stderr){
      if (error){
        console.log(error);
        throw (new Meteor.Error(500, 'Failed to create directories.', error));
      }
      future.return();
    });
    future.wait();

    var futureMove = new Future();
    var extension = videoFile.name.split(".")[1];
    cmd = "cp " + process.env.PWD + '/public/' + cleanPath(videoFile.path) + " " + path + "/" + doc.info.quality + "." + extension;
    exec(cmd, function(error, stdout, stderr){
      if (error){
        console.log(error);
        throw (new Meteor.Error(500, "Failed to copy video", error));
      }
      futureMove.return();
    });
    futureMove.wait();
  } else {
    var path = process.env.PWD + '/public/Movies/' + cleanName(doc.info.name) + "/";
    var future = new Future();
    cmd = "mkdir -p " + path + "{subtitles,audio}";
    exec(cmd, function(error, stdout, stderr){
      if (error){
        console.log(error);
        throw (new Meteor.Error(500, 'Failed to create directories.', error));
      }
      future.return();
    });
    future.wait();

    var futureMove = new Future();
    var extension = videoFile.name.split(".")[1];
    cmd = "cp " + process.env.PWD + '/public/' + cleanPath(videoFile.path) + " " + path + "/" + quality + "." + extension;
    exec(cmd, function(error, stdout, stderr){
      if (error){
        console.log(error);
        throw (new Meteor.Error(500, "Failed to copy video", error));
      }
      futureMove.return();
    });
    futureMove.wait();
  }
});
