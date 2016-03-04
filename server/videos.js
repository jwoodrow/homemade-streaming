var Future = Npm.require("fibers/future");
var exec = Npm.require("child_process").exec;

var cleanPath = function(str){
  return str.replace(/ /g, "\\ ").replace(/\]/g, "\\]").replace(/\[/g, "\\[").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\'/g, "\\'");
};

Videos.after.insert(function(userId, doc){
  var source = Torrents.findOne({_id: doc.info.Torrents});
  var videoFile = source.files[doc.info.fileId];
  if (doc.info.Series){
    var series = Series.findOne({_id: doc.info.Series});

    var path = process.env.PWD + '/.storage/Series/' + cleanPath(series.info.name) + "/" + doc.info.seasonNumber + "/" + doc.info.epNumber + "/";
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
    var extension = videoFile.name.split(".")[videoFile.name.split(".").length - 1];
    cmd = "cp " + process.env.PWD + '/.storage/Torrents/' + cleanPath(videoFile.path) + " " + path + "/" + doc.info.quality + "." + extension;
    exec(cmd, function(error, stdout, stderr){
      if (error){
        console.log(error);
        throw (new Meteor.Error(500, "Failed to copy video", error));
      }
      futureMove.return();
    });
    futureMove.wait();
  } else {
    var path = process.env.PWD + '/.storage/Movies/' + cleanPath(doc.info.name) + "/";
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
    var extension = videoFile.name.split(".")[videoFile.name.split(".").length - 1];
    cmd = "cp " + process.env.PWD + '/.storage/Torrents/' + cleanPath(videoFile.path) + " " + path + doc.info.quality + "." + extension;
    console.log(cmd);
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

Videos.before.remove(function(userId, doc){
  audios = Audios.find({Videos: doc._id}).fetch();
  subtitles = Subtitles.find({Videos: doc._id}).fetch();
  _.forEach(audios, function(audio, index){
    Audios.remove({_id: audio._id});
  });
  _.forEach(subtitles, function(subtitle, index){
    Subtitles.remove({_id: subtitle._id});
  });
  if (doc.info.Series){
    serie = Series.findOne({_id: doc.info.Series});
    path = process.env.PWD + '/.storage/Series/' + cleanPath(serie.info.name) + "/" + doc.info.seasonNumber + "/" + doc.info.epNumber;
  } else {
    path = process.env.PWD + '/.storage/Movies/' + cleanPath(doc.info.name);
  }
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
