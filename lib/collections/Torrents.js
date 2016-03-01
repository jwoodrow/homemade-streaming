Torrents = new Mongo.Collection("torrents");

if (Meteor.isServer) {
  Meteor.publish('single_torrent', function(id){
    return Torrents.find({'_id': id});
  });
  Meteor.publish('torrents', function(){
    return Torrents.find();
  });
}
