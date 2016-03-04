Series = new Mongo.Collection("series");

SeriesSchema = new SimpleSchema({
  info: {
    type: Object,
    omitOnShow: true
  },
  "info.name": {
    type: String,
    label: "Serie's Name"
  },
  "info.description": {
    type: String,
    label: "Serie's Description",
    optional: true
  },
  createdAt: {
    type: Date,
    label: "Created On The",
    optional: true,
    omitOnInsert: true,
    autoValue: function(){
      if ( this.isInsert ) {
        return new Date;
      }
    }
  },
  updatedAt: {
    type: Date,
    label: "Last Updated On The",
    optional: true,
    omitOnInsert: true,
    autoValue: function(){
      if ( this.isUpdate || this.isInsert ) {
        return new Date;
      }
    }
  }
});

Series.attachSchema(SeriesSchema);

if (Meteor.isServer) {
  Meteor.publish("single_serie", function(id){
    return Series.find({_id: id});
  });
  Meteor.publish("series", function(){
    return Series.find({});
  })
}

Series.allow({
  insert: function(doc){
    return true;
  },
  update: function(doc){
    return true;
  },
  remove: function(doc){
    return true;
  }
});
