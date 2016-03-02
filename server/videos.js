var ass2vtt = Meteor.npmRequire('ass-to-vtt');
var srt2vtt = Meteor.npmRequire('srt-to-vtt');
var fs = Npm.require('fs');
var Future = Npm.require("fibers/future");
var exec = Npm.require("child_process").exec;

var convertSrtToVtt = function(subtitle){
  path = process.env.PWD + '/public/';
  path = path + subtitle.path;
  dest = subtitle.path.split('/');
  dest2 = dest[dest.length - 1];
  dest2 = dest2.split('.');
  dest2[1] = "vtt";
  dest2 = dest2.join('.');
  dest[dest.length - 1] = dest2;
  dest = dest.join("/");
  dest2 = process.env.PWD + '/public/' + dest;

  fs.createReadStream(path)
    .pipe(srt2vtt)
    .pipe(fs.createWriteStream(dest2));

  name = subtitle.name.split('.');
  name[1] = "vtt";
  name = name.join(".");

  ret = {
    name: name,
    path: dest
  };
  return ret;
}

var convertAssToVtt = function(subtitle){
  path = process.env.PWD + '/public/';
  path = path + subtitle.path;
  dest = subtitle.path.split('/');
  dest2 = dest[dest.length - 1];
  dest2 = dest2.split('.');
  dest2[1] = "vtt";
  dest2 = dest2.join('.');
  dest[dest.length - 1] = dest2;
  dest = dest.join("/");
  dest2 = process.env.PWD + '/public/' + dest;

  fs.createReadStream(path)
    .pipe(ass2vtt)
    .pipe(fs.createWriteStream(dest2));

  name = subtitle.name.split('.');
  name[1] = "vtt";
  name = name.join(".");

  ret = {
    name: name,
    path: dest
  };
  return ret;
}

Meteor.methods({
  "AddSubtitleTrack": function(sourceTorrentId, subtitleFileId, language, videoId){
    var source = Torrents.findOne({_id: sourceTorrentId});
    var destination = Videos.findOne({_id: videoId});
    var subtitleFile = source.files[subtitleFileId];
    var subtitles = destination.subtitles;
    var copy = false;

    if (subtitleFile.name.split('.')[1] == "srt"){
      subtitleFile = convertSrtToVtt(subtitleFile);
    } else if (subtitleFile.name.split('.')[1] == "ass"){
      subtitleFile = convertAssToVtt(subtitleFile);
    } else if (subtitleFile.name.split('.')[1] == "vtt"){
      console.log("No conversion necessary");
      copy = true;
    } else {
      console.log("Not a valid subtitle format");
      return;
    }

    var srcPath = process.env.PWD + '/public/' + subtitleFile.path;
    if (destination.info.seriesId){
      var serie = Series.findOne({_id: destination.info.seriesId})
      var dstPath = process.env.PWD + '/public/Series/' + serie.name + "/" + destination.info.name + "/subtitles/" + language + ".vtt";
    } else {
      var dstPath = process.env.PWD + '/public/Movies/' + destination.info.name + "/subtitles/" + language + ".vtt";
    }
    var future = new Future();
    var cmd;
    if (copy){
      cmd = "cp " + srcPath + " " + dstPath;
    } else {
      cmd = "mv " + srcPath + " " + dstPath;
    }
    exec(cmd, function(error, stdout, stderr){
      if (error){
        console.log(error);
        throw (new Meteor.Error(500, "Failed to move/copy subtitle file.", error));
      }
      future.return();
    });
    future.wait();

    subtitles[subtitles.length] = {
      language: language
    };

    Videos.update({
      _id: videoId
    }, {
      $set: {
        subtitles: subtitles
      }
    });
  },
  "MoveAudioTrack": function(sourceTorrentId, audioFileId, language, videoId){
    var source = Torrents.findOne({_id: sourceTorrentId});
    var destination = Videos.findOne({_id: videoId});
    var audioFile = source.files[subtitleFileId];
    var audio = destination.subtitles;

    var srcPath = process.env.PWD + '/public/' + audioFile.path;
    var extension = audioFile.name.split(".")[1];
    if (destination.info.seriesId){
      var serie = Series.findOne({_id: destination.info.seriesId})
      var dstPath = process.env.PWD + '/public/Series/' + serie.name + "/" + destination.info.name + "/audio/" + language + "." + extension;
    } else {
      var dstPath = process.env.PWD + '/public/Movies/' + destination.info.name + "/audio/" + language + "." + extension;
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

    audio[audio.length] = {
      language: language
    };

    Videos.update({
      _id: videoId
    }, {
      $set: {
        audio: audio
      }
    });
  }
});

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
    cmd = "cp " + process.env.PWD + '/public/' + videoFile.path + " " + path + "/" + doc.info.quality + "." + extension;
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
    cmd = "cp " + process.env.PWD + '/public/' + videoFile.path + " " + path + "/" + quality + "." + extension;
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
