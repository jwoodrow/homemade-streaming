Template.Player.onCreated(function() {
  Blaze._allowJavascriptUrls();
});

Template.Player.onRendered(function(){
});

Template.Player.helpers({
  videoSource: function(video){
    var src = "";
    if (video.info.seriesId){
      serie = Series.findOne({_id: video.info.seriesId});
      src = "/Series/" + serie.name + "/" + video.info.seasonNumber + "/" + video.info.epNumber + "/" + video.info.quality + ".mp4";
    } else {
      src = "/Movies" + video.info.name + "/" + video.info.quality + ".mp4";
    }
    return src;
  },
  subtitleSource: function(subtitle){
    var src = "";
    var video = Videos.findOne({_id: subtitle.videoId});
    if (video.info.seriesId){
      serie = Series.findOne({_id: video.info.seriesId});
      src = "/Series/" + serie.name + "/" + video.info.seasonNumber + "/" + video.info.epNumber + "/subtitles/" + subtitle.language + ".vtt";
    } else {
      src = "/Movies" + video.info.name + "/subtitles/" + subtitle.language + ".vtt";
    }
    return src;
  }
});

Template.Player.events({
});
