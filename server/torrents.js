var Future = Npm.require("fibers/future");
var exec = Npm.require("child_process").exec;
var fs = Npm.require('fs');

var doNothing = function(){

};

var removeFile = function(filepath){
  var cmd = "rm " + filepath;
  var future = new Future();
  exec(cmd, function(error, stdout, stderr){
    future.return();
  });
  future.wait();
};

var createTorrent = function(source, torrentId){
  cmd = "transmission-remote -n 'transmission:transmission' -a " + source;
  var futureAdd = new Future();
  exec(cmd, function(error, stdout, stderr){
    if (error){
      console.log(error);
      throw (new Meteor.Error(500, 'Failed to add torrent.', error));
    }
    futureAdd.return();
  });
  futureAdd.wait();
  var output;
  cmd = "transmission-remote -n 'transmission:transmission' -l | awk '{print $1}'";
  var futureList = new Future();
  var error = false;
  exec(cmd, function(error, stdout, stderr){
    if (error){
      console.log(error);
      throw (new Meteor.Error(500, 'Failed to list torrents.', error));
      error = true;
    } else {
      output = stdout.toString();
    }
    futureList.return();
  });
  futureList.wait();
  var hash;
  var name;
  var res;
  output = output.split("\n");
  _.every(output, function(line){
    if (line !== "ID" && line !== "Sum:" && line != ""){
      var futureInfo = new Future();
      cmd = "transmission-remote -n 'transmission:transmission' -t" + parseInt(line) + " -i | awk -F':' '{print $2}'";
      exec(cmd, function(error, stdout, stderr){
        if (error){
          console.log(error);
    throw (new Meteor.Error(500, 'Failed to get torrent info.', error));
        } else {
          res = stdout.toString().split("\n");
        }
        futureInfo.return();
      });
      futureInfo.wait();
      tres = Torrents.find({hash: res[3]});
      if (tres.count() == 0){
        hash = res[3];
        name = res[2];
        return false;
      }
      else{
        return true;
      }
    }
    else{
      return true;
    }
  });
  id = Torrents.update({_id: torrentId}, {
    $set: {
    name: name,
    hash: hash,
    location: res[8].trim()
    }
  });
};

var cleanName = function(str){
  return str.replace(/\.\./g,'').replace(/\//g,'');
};

var cleanPath = function(str){
  return str.replace(/ /g, "\\ ").replace(/\]/g, "\\]").replace(/\[/g, "\\[").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\'/g, "\\'");
};

var cleanerPath = function(str){
  return str.replace(/ /g, "-").replace(/\]/g, "-").replace(/\[/g, "-").replace(/\(/g, "-").replace(/\)/g, "-").replace(/\'/g, "");
};

var removeTorrent = function(torrent){
  var future = new Future();
  cmd = "transmission-remote -n 'transmission:transmission' -t" + torrent.hash + " --remove-and-delete";
  exec(cmd, function(error, stdout, stderr){
    if (error){
      console.log(error);
      throw (new Meteor.Error(500, 'Failed to save file.', error));
    }
    future.return();
  });
  future.wait();
  Torrents.update(torrent._id, {
    $set: {
      hash: "COMPLETED"
    }
  });
}

var moveToPublic = function(torrent){
  var hash = torrent.hash;
  var basepath = torrent.location;
  var files;
  var cmd = "transmission-remote -n 'transmission:transmission' -t " + hash + " -f | awk 'NR > 2 {print substr($0,index($0,$7))}'";
  var futureFiles = new Future();
  exec(cmd, function(error, stdout, stderr){
    if (error){
      console.log(error);
      throw (new Meteor.Error(500, 'Failed to save file.', error));
    }
    files = stdout.toString().split("\n");
    futureFiles.return();
  });

  futureFiles.wait();

  futureRemoveTorrent = new Future();
  var cmd = "transmission-remote -n 'transmission:transmission' -t " + hash + " -S";
  exec(cmd, function(error, stdout, stderr){
    if (error){
      console.log(error);
      throw (new Meteor.Error(500, 'Failed to save file.', error));
    }
    futureRemoveTorrent.return();
  });
  futureRemoveTorrent.wait();

  _.forEach(files, function(file, index){
    if(file != ""){
      originalpath = cleanPath(basepath + "/" + file);
      missingDirs = file.split('/');
      path = process.env.PWD + '/public/Torrents';
      destpath = cleanPath(path + "/" + file);
      tmpPath = path;
      if (missingDirs.length > 1){
        _.forEach(missingDirs, function(dir, index){
          if (index < missingDirs.length - 1){
            tmpPath = cleanPath(tmpPath + "/" + dir);
            cmd = "mkdir -p " + tmpPath;
            var futureDir = new Future();
            exec(cmd, function(error, stdout, stderr){
              if (error){
                console.log(error);
      throw (new Meteor.Error(500, 'Failed to save file.', error));
              }
              futureDir.return();
            });
            futureDir.wait();
          }
        });
      }
      cmd = "mv " + originalpath + " " + destpath;
      var futureCopy = new Future();
      exec(cmd, function(error, stdout, stderr){
        if (error){
          console.log(error);
      throw (new Meteor.Error(500, 'Failed to save file.', error));
        }
        futureCopy.return();
      });
      futureCopy.wait();
      tFiles = torrent.files;
      tFiles[tFiles.length] = {
        name: missingDirs[missingDirs.length - 1],
        path: file
      };
      Torrents.update(torrent._id,
      {
        $set: {
          files: tFiles,
        }
      });
    }
  });
  removeTorrent(torrent);
}

Meteor.methods({
  deleteTorrent: function(torrentId){
    torrent = Torrents.findOne(torrentId);
    var future = new Future();
    cmd = "transmission-remote -n 'transmission:transmission' -t" + torrent.hash + " --remove-and-delete";
    exec(cmd, function(error, stdout, stderr){
      if (error){
        console.log(error);
      throw (new Meteor.Error(500, 'Failed to save file.', error));
      }
      future.return();
    });
    future.wait();
    Torrents.remove(torrentId);
  },
  updateTorrent: function(torrentId){
    torrent = Torrents.findOne(torrentId);
    if (torrent.completion != "100%"){
      var future = new Future();
      cmd = "transmission-remote -n 'transmission:transmission' -t" + torrent.hash + " -i | awk -F':' '{print $2}'";
      var res;
      exec(cmd, function(error, stdout, stderr){
        if (error){
          console.log(error);
        } else {
          res = stdout.toString().split("\n");
        }
        future.return();
      });
      future.wait();
      name = res[2];
      location = res[8].trim();
      percentage = res[9].trim();
      if (name != torrent.name || torrent.completion != "100%"){
        Torrents.update(torrentId, {
          $set: {
            name: name,
            location: location,
            completion: percentage
          }
        });
      }
      if (percentage == "100%"){
        moveToPublic(torrent);
      }
    }
  },
  removeFile: function(torrentId, fileIndex){
    var torrent = Torrents.findOne(torrentId);
    var files = torrent.files;
    var file = files[fileIndex];
    var path = file.path;

    path = process.env.PWD + '/public/Torrents/' + path;

    removeFile(cleanPath(path));

    files.splice(fileIndex, 1);

    Torrents.update({_id: torrentId}, {
      $set: {
        files: files
      }
    });
  }
});

Torrents.after.insert(function(userId, doc){
  createTorrent(doc.magnet, doc._id);
});

Torrents.after.remove(function(userId, doc){
  var cmd;
  if (doc.completion != "100%"){
    cmd = "transmission-remote -n 'transmission:transmission' -t" + torrent.hash + " --remove-and-delete";
  } else {
    var paths = "";
    _.forEach(doc.files, function(file){
      paths += " " + process.env.PWD + '/public/Torrents/' + cleanPath(file.path.split('/')[0]);
    });
    cmd = "rm -rf" + paths;
  }
  var future = new Future();
  exec(cmd, function(error, stdout, stderr){
    if (error){
      console.log(error);
    }
    future.return();
  });
  future.wait();
});

SyncedCron.add({
  name: 'update Torrents',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 5 seconds');
  },
  job: function() {
    torrents = Torrents.find().fetch();
    _.forEach(torrents, function(torrent, index){
      Meteor.call("updateTorrent", torrent._id, function(){

      });
    });
  }
});

SyncedCron.start();
