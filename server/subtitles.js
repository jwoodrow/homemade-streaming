var ass2vtt = Meteor.npmRequire('ass-to-vtt');
var srt2vtt = Meteor.npmRequire('srt-to-vtt');
var fs = Npm.require('fs');
var readline = Npm.require('readline');
var stream = Npm.require('stream');
var Future = Npm.require("fibers/future");
var exec = Npm.require("child_process").exec;

var cleanPath = function(str){
  return str.replace(/ /g, "\\ ").replace(/\]/g, "\\]").replace(/\[/g, "\\[").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\'/g, "\\'");
};

var ass_to_vtt = function(file_in, file_out, cb) {
  var order = [],
  gotOrder = false;
  fs.writeFileSync(file_out, 'WEBVTT\n\n');
  readline.createInterface(
      fs.createReadStream(file_in),
      new stream
    ).on('line', (line)=>{
      if(/Format: /.test(line)){
        order = line.split('Format: ')[1].split(', ');
        if(order.indexOf('Text') !== -1){
          gotOrder = true;
        }
      }else if(gotOrder && /Dialogue: /.test(line)){
        var explode = line.split('Dialogue: ')[1].split(',');
        if(explode.length == order.length){
          var start = '0' + explode[order.indexOf('Start')],
          end = '0' + explode[order.indexOf('End')],
          txt = explode[order.indexOf('Text')],
          vtt = (start + ' --> ' + end + '\n' + txt + '\n\n');
        fs.appendFileSync(file_out, vtt);
        }
      }
  }).on('close', ()=>{
    cb(true);
  });
};

var convertSrtToVtt = function(subtitle){
  path = process.env.PWD + '/public/Torrents/';
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
};

var convertAssToVtt = function(subtitle){
  path = process.env.PWD + '/public/Torrents/';
  path = path + subtitle.path;
  dest = subtitle.path.split('/');
  dest2 = dest[dest.length - 1];
  dest2 = dest2.split('.');
  dest2[1] = "vtt";
  dest2 = dest2.join('.');
  dest[dest.length - 1] = dest2;
  dest = dest.join("/");
  dest2 = process.env.PWD + '/public/Torrents/' + dest;

  ass_to_vtt(path, dest2, function(){});

  name = subtitle.name.split('.');
  name[1] = "vtt";
  name = name.join(".");

  ret = {
    name: name,
    path: dest
  };
  return ret;
};

Subtitles.after.insert(function(userId, doc){
  var source = Torrents.findOne({_id: doc.torrentId});
  var video = Videos.findOne({_id: doc.videoId});
  var subtitleFile = source.files[doc.fileId];
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

  var srcPath = process.env.PWD + '/public/Torrents/' + cleanPath(subtitleFile.path);
  if (video.info.seriesId){
    var serie = Series.findOne({_id: video.info.seriesId})
    var dstPath = process.env.PWD + '/public/Series/' + cleanPath(serie.name) + "/" + video.info.seasonNumber + "/" + video.info.epNumber + "/subtitles/" + doc.language + ".vtt";
  } else {
    var dstPath = process.env.PWD + '/public/Movies/' + cleanPath(destination.info.name) + "/subtitles/" + doc.language + ".vtt";
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
});

Subtitles.after.remove(function(userId, doc){
  video = Videos.findOne({_id: doc.videoId});
  if (video.info.seriesId){
    serie = Series.findOne({_id: video.info.seriesId});
    path = process.env.PWD + '/public/Series/' + cleanPath(serie.name) + "/" + video.info.seasonNumber + "/" + video.info.epNumber + "/subtitles/" + doc.language + ".vtt";
  } else {
    path = process.env.PWD + '/public/Movies/' + cleanName(video.info.name) + "/subtitles/" + doc.language + ".vtt";
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
