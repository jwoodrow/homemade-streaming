var Future = Npm.require("fibers/future");
var exec = Npm.require("child_process").exec;
var fs = Npm.require('fs');

Meteor.startup(function () {
  cmd = "killall transmission-daemon && transmission";
  exec(cmd, function(){

  });
  UploadServer.init({
    tmpDir: process.env.PWD + '/.uploads/tmp',
    uploadDir: process.env.PWD + '/.uploads/',
    checkCreateDirectories: true, //create the directories for you
    finished: function(fileInfo, formFields) {
      var cleanPath = function(str){
        return str.replace(/ /g, "\\ ").replace(/\]/g, "\\]").replace(/\[/g, "\\[").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\'/g, "\\'");
      };
      path = process.env.PWD + '/.uploads' + cleanPath(fileInfo.path);
      dest = process.env.PWD + "/.storage/Torrents/Uploads/" + cleanPath(fileInfo.name);
      var torrent;
      torrent = Torrents.findOne({name: "Uploads"});
      if (torrent){
        files = torrent.files;
        console.log(torrent,files);
        files[files.length] = {
          name: fileInfo.name,
          path: "Uploads/" + cleanPath(fileInfo.name)
        };
        console.log(torrent,files);
        Torrents.update({_id: torrent._id}, {
          $set: {
            files: files
          }
        });
      } else {
        files = [{
          name: fileInfo.name,
          path: "Uploads/" + cleanPath(fileInfo.name)
        }];
        id = Torrents.insert({
          name: "Uploads",
          hash: "UPLOADS",
          completion: "100%",
          magnet: "upload",
          location: "upload"
        });
        Torrents.update({_id: id}, {
          $set: {
            files: files
          }
        });
      }
      cmd = "mkdir -p " + process.env.PWD + "/.storage/Torrents/Uploads && mv " + path + " " + dest;
      var future = new Future();
      exec(cmd, function(error, stdout, stderr){
        if (error){
          console.log(error);
        }
        future.return();
      });
      future.wait();
    }
  });
});
