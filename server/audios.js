var Future = Npm.require("fibers/future");
var exec = Npm.require("child_process").exec;

var cleanPath = function(str){
  return str.replace(/ /g, "\\ ").replace(/\]/g, "\\]").replace(/\[/g, "\\[").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\'/g, "\\'");
};

Audios.after.insert(function(UserId, doc){
  var source = Torrents.findOne({_id: doc.torrentId});
  var audioFile = source.files[doc.fileId];
  var video = Videos.findOne({_id: doc.videoId});

  var srcPath = process.env.PWD + '/public/' + cleanPath(audioFile.path);
  var extension = audioFile.name.split(".")[1];
  if (video.info.seriesId){
    var serie = Series.findOne({_id: video.info.seriesId})
    var dstPath = process.env.PWD + '/public/Series/' + serie.name + "/" + video.info.seasonNumber + "/" + video.info.epNumber + "/audio/" + doc.language + "." + extension;
  } else {
    var dstPath = process.env.PWD + '/public/Movies/' + cleanPath(video.info.name) + "/audio/" + doc.language + "." + extension;
  }
  var future = new Future();
  var cmd;
  cmd = "cp " + srcPath + " " + dstPath;
  console.log(cmd);
  exec(cmd, function(error, stdout, stderr){
    if (error){
      console.log(error);
      throw (new Meteor.Error(500, "Failed to copy audio file.", error));
    }
    future.return();
  });
  future.wait();
});
