Template.Torrents.onCreated(function() {
  Blaze._allowJavascriptUrls();
});

Template.Torrents.onRendered(function(){

});

Template.Torrents.helpers({
  torrents: function(){
    return Torrents.find({});
  }
});

Template.Torrents.events({
});

Template.Torrents.events({
});

Template.torrent.helpers({
  beforeDelete: function(){
    return function(collection, id) {
      if (confirm('Do you really want to remove this ?')) {
        this.remove();
      }
    }
  }
});

Template.serie.helpers({
  beforeDelete: function(){
    return function(collection, id) {
      if (confirm('Do you really want to remove this ?')) {
        this.remove();
      }
    }
  }
});

Template.video.helpers({
  beforeDelete: function(){
    return function(collection, id) {
      if (confirm('Do you really want to remove this ?')) {
        this.remove();
      }
    }
  }
});

Template.audio.helpers({
  beforeDelete: function(){
    return function(collection, id) {
      if (confirm('Do you really want to remove this ?')) {
        this.remove();
      }
    }
  }
});

Template.subtitle.helpers({
  beforeDelete: function(){
    return function(collection, id) {
      if (confirm('Do you really want to remove this ?')) {
        this.remove();
      }
    }
  }
});