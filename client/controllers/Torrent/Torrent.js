Template.Torrent.onCreated(function() {
  Blaze._allowJavascriptUrls();
});

Template.Torrent.onRendered(function(){
  Meteor.setTimeout(function(){
    var vid = document.getElementById('video');
    var aud = document.getElementById('audio');

    aud.currentTime = vid.currentTime;
    aud.play();
  }, 500);
});

Template.Torrent.helpers({
});

Template.Torrent.events({
  'click .removeTorrent': function(event, template){
    Meteor.call("deleteTorrent", template.data._id, function(){
      Router.go("/");
    });
  },
  'click .remove': function(event, template){
    Meteor.call("removeFile", template.data._id, parseInt($(event.target).parent().parent().parent().find(".index").html().trim()), function(){

    });
  }
});
