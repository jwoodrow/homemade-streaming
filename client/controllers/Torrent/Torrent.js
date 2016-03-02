Template.Torrent.onCreated(function() {
  Blaze._allowJavascriptUrls();
});

Template.Torrent.onRendered(function(){
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
