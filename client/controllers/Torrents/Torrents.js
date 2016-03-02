Template.Home.onCreated(function() {
  Blaze._allowJavascriptUrls();
});

Template.Home.onRendered(function(){

});

Template.Home.helpers({
  torrents: function(){
    return Torrents.find({});
  }
});

Template.Home.events({
  'click .refresh': function(){
    torrents = Torrents.find().fetch();
    _.each(torrents, function(torrent, index){
      Meteor.call("updateTorrent", torrent._id, function(){

      });
    });
  },
  'change .file': function(ev){
    Meteor.saveFile(ev.target.files[0], ev.target.files[0].name);
  }
});

Template.torrent.events({
  'click .remove': function(event){
    id = $(event.target).parent().parent().prev().prev().prev().prev().html().trim();
    Meteor.call("deleteTorrent", id, function(){

    });
  }
});
