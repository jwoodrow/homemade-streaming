var Future = Npm.require("fibers/future");
var exec = Npm.require("child_process").exec;
var fs = Npm.require('fs');

Meteor.startup(function () {
  UploadServer.init({
    tmpDir: process.env.PWD + '/.uploads/tmp',
    uploadDir: process.env.PWD + '/.uploads/',
    checkCreateDirectories: true, //create the directories for you
    finished: function(fileInfo, formFields) {
      console.log(fileInfo);
      console.log(formFields);
      var cleanPath = function(str){
        return str.replace(/ /g, "\\ ").replace(/\]/g, "\\]").replace(/\[/g, "\\[").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\'/g, "\\'");
      };
      path = process.env.PWD + '/.uploads' + cleanPath(fileInfo.path);
      dest = process.env.PWD + "/public/Torrents/Uploads/" + cleanPath(fileInfo.name);
      var torrent;
      if (torrent = Torrents.findOne({name: "Uploads"})){
        files = torrent.files;
        files[files.length] = {
          name: fileInfo.name,
          dest: dest
        };
        Torrents.update({_id: torrent._id}, {
          $set: {
            files: files
          }
        });
      } else {
        files = [{
          name: fileInfo.name,
          path: dest
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
      cmd = "mkdir -p " + process.env.PWD + "/public/Torrents/Uploads && mv " + path + " " + dest;
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
