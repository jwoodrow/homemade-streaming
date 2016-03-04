var Future = Npm.require("fibers/future");
var exec = Npm.require("child_process").exec;

var cleanPath = function(str){
  return str.replace(/ /g, "\\ ").replace(/\]/g, "\\]").replace(/\[/g, "\\[").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\'/g, "\\'");
};

Audios.after.insert(function(UserId, doc){
  var source = Torrents.findOne({_id: doc.Torrents});
  var audioFile = source.files[doc.fileId];
  var video = Videos.findOne({_id: doc.Videos});

  var srcPath = process.env.PWD + '/.storage/Torrents/' + cleanPath(audioFile.path);
  var extension = audioFile.name.split(".")[1];
  if (video.info.Series){
    var serie = Series.findOne({_id: video.info.Series})
    var dstPath = process.env.PWD + '/.storage/Series/' + cleanPath(serie.info.name) + "/" + video.info.seasonNumber + "/" + video.info.epNumber + "/audio/" + doc.language + "." + extension;
  } else {
    var dstPath = process.env.PWD + '/.storage/Movies/' + cleanPath(video.info.name) + "/audio/" + doc.language + "." + extension;
  }
  var future = new Future();
  var cmd;
  cmd = "cp " + srcPath + " " + dstPath;
  exec(cmd, function(error, stdout, stderr){
    if (error){
      console.log(error);
      throw (new Meteor.Error(500, "Failed to copy audio file.", error));
    }
    future.return();
  });
  future.wait();
});

Audios.after.remove(function(userId, doc){
  video = Videos.findOne({_id: doc.Videos});
  if (video.info.Series){
    serie = Series.findOne({_id: video.info.Series});
    path = process.env.PWD + '/.storage/Series/' + cleanPath(serie.info.name) + "/" + video.info.seasonNumber + "/" + video.info.epNumber + "/audio/" + doc.language + "*";
  } else {
    path = process.env.PWD + '/.storage/Movies/' + cleanName(video.info.name) + "/audio/" + doc.language + "*";
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
