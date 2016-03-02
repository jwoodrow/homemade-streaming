Videos = new Mongo.Collection("videos");

if (Meteor.isServer) {
  Meteor.publish('single_video', function(id){
    return Videos.find({'_id': id});
  });
  Meteor.publish('videos_from_series', function(seriesId){
    return Videos.find({"info.seriesId": seriesId});
  });
}
