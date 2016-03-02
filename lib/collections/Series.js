Series = new Mongo.Collection("series");

if (Meteor.isServer) {
  Meteor.publish("single_serie", function(id){
    return Series.find({_id: id});
  });
}
