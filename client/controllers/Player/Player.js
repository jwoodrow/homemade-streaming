Template.Player.onCreated(function() {
  Blaze._allowJavascriptUrls();
});

Template.Player.onRendered(function(){
});

Template.Player.helpers({
  videoSource: function(video){
    return "/video/file/" + video._id + "/720p";
  },
  subtitleSource: function(subtitle){
    return "/subtitles/file/" + subtitle._id;
  }
});

Template.Player.events({
});
