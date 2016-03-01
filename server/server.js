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

var createTorrent = function(source, callback){
  cmd = "transmission-remote -n 'transmission:transmission' -a " + source;
  var futureAdd = new Future();
  exec(cmd, function(error, stdout, stderr){
    if (error){
      console.log(error);
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
      error = true;
    } else {
      output = stdout.toString();
    }
    futureList.return();
  });
  futureList.wait();
  if (!error){
    var hash;
    var name;
    output = output.split("\n");
    _.every(output, function(line){
      if (line !== "ID" && line !== "Sum:" && line != ""){
        var futureInfo = new Future();
        var res;
        cmd = "transmission-remote -n 'transmission:transmission' -t" + parseInt(line) + " -i | awk -F':' '{print $2}'";
        exec(cmd, function(error, stdout, stderr){
          if (error){
            console.log(error);
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
    Torrents.insert({
      name: name,
      hash: hash,
      completion: "0%",
      files: [],
      createdAt: new Date()
    });
    callback(source);
  } else {
    console.log("Torrent was not added");
  }
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

var downloadFile = function(blob, name, encoding, callback){
  var name = cleanName(name || 'file');
  var encoding = encoding || 'binary';
  var path = process.env.PWD + '/public/';
  filepath = path + name;

  var future = new Future();
  fs.writeFile(path + name, blob, encoding, function(error) {
    if (error) {
      console.log(error);
      throw (new Meteor.Error(500, 'Failed to save file.', error));
    } else {
      console.log('The file ' + name + ' (' + encoding + ') was saved to ' + path);
      future.return();
    }
  });

  future.wait();

  filepath = cleanPath(filepath);

  callback(filepath, removeFile);
};

var removeTorrent = function(torrent){
  var future = new Future();
  cmd = "transmission-remote -n 'transmission:transmission' -t" + torrent.hash + " --remove-and-delete";
  exec(cmd, function(error, stdout, stderr){
    if (error){
      console.log(error);
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

var moveToFtp = function(torrent){
  var hash = torrent.hash;
  var basepath = torrent.location;
  var files;
  var cmd = "transmission-remote -n 'transmission:transmission' -t " + hash + " -f | awk 'NR > 2 {print substr($0,index($0,$7))}'";
  var futureFiles = new Future();
  exec(cmd, function(error, stdout, stderr){
    if (error){
      console.log(error);
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
    }
    futureRemoveTorrent.return();
  });
  futureRemoveTorrent.wait();

  _.forEach(files, function(file, index){
    if(file != ""){
      originalpath = cleanPath(basepath + "/" + file);
      missingDirs = file.split('/');
      path = process.env.FTPDIR;
      destpath = cleanerPath(path + "/" + file);
      tmpPath = path;
      if (missingDirs.length > 1){
        _.forEach(missingDirs, function(dir, index){
          if (index < missingDirs.length - 1){
            tmpPath = cleanerPath(tmpPath + "/" + dir);
            cmd = "mkdir -p " + tmpPath;
            var futureDir = new Future();
            exec(cmd, function(error, stdout, stderr){
              if (error){
                console.log(error);
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
        }
        futureCopy.return();
      });
      futureCopy.wait();
      tFiles = torrent.files;
      tFiles[tFiles.length] = {
        name: missingDirs[missingDirs.length - 1],
        path: "ftp://127.0.0.1/" + cleanerPath(file)
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
};

var moveToPublic = function(torrent){
  var hash = torrent.hash;
  var basepath = torrent.location;
  var files;
  var cmd = "transmission-remote -n 'transmission:transmission' -t " + hash + " -f | awk 'NR > 2 {print substr($0,index($0,$7))}'";
  var futureFiles = new Future();
  exec(cmd, function(error, stdout, stderr){
    if (error){
      console.log(error);
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
    }
    futureRemoveTorrent.return();
  });
  futureRemoveTorrent.wait();

  _.forEach(files, function(file, index){
    if(file != ""){
      originalpath = cleanPath(basepath + "/" + file);
      missingDirs = file.split('/');
      path = process.env.PWD + '/public';
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
  addTorrent: function(magnet){
    createTorrent(magnet, doNothing);
  },
  addTorrentFromFile: function(blob, name, encoding){
    downloadFile(blob, name, encoding, createTorrent);
  },
  deleteTorrent: function(torrentId){
    torrent = Torrents.findOne(torrentId);
    var future = new Future();
    cmd = "transmission-remote -n 'transmission:transmission' -t" + torrent.hash + " --remove-and-delete";
    exec(cmd, function(error, stdout, stderr){
      if (error){
        console.log(error);
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
        console.log("move files to ftp");
        moveToPublic(torrent);
      }
    }
  }
})

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
