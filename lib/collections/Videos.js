Videos = new Mongo.Collection("videos");

VideoSchema = new SimpleSchema({
  "info": {
    type: Object,
    omitOnShow: true
  },
  "info.name": {
    type: String,
    label: "Video's Name"
  },
  "info.description": {
    type: String,
    label: "Video's Description",
    optional: true
  },
  "info.epNumber": {
    type: Number,
    label: "Video's Episode Number",
    optional: true
  },
  "info.seasonNumber": {
    type: Number,
    label: "Video's Season Number",
    optional: true
  },
  "info.quality": {
    type: String,
    label: "Video's Quality",
    allowedValues: ['480p', '720p', '1080p']
  },
  "info.Series": {
    type: String,
    label: "Serie The Video Belongs To",
    optional: true,
    nameOnShow: true,
    autoform: {
        type: "select",
        options: function () {
          return Series.find().map(function (serie) {
            return {label: serie.info.name, value: serie._id};
          });
        }
    }
  },
  "info.Torrents": {
    type: String,
    label: "Torrent The Video Must Be Sourced From",
    omitOnShow: true,
    autoform: {
        type: "select",
        options: function () {
          return Torrents.find().map(function (torrent) {
            return {label: torrent.name, value: torrent._id};
          });
        }
    }
  },
  "info.fileId": {
    type: Number,
    label: "File To Select For The Video's Source",
    omitOnShow: true,
    autoform: {
        type: "select",
        options: function () {
            docId = AutoForm.getFieldValue('info.Torrents', 'InsertVideoForm');
            if (docId) {
              return Torrents.findOne({_id: docId}).files.map(function(file, index){
                return {
                  label: file.name,
                  value: index
                };
              });
            } else {
              return [];
            }
        }
    }
  },
  "info.createdAt": {
    type: Date,
    label: "Created On The",
    omitOnInsert: true,
    autoValue: function(){
      if ( this.isInsert ) {
        return new Date;
      }
    }
  },
  "info.updatedAt": {
    type: Date,
    label: "Last Updated On The",
    omitOnInsert: true,
    autoValue: function(){
      if ( this.isUpdate || this.isInsert ) {
        return new Date;
      }
    }
  }
});

Videos.attachSchema(VideoSchema);

if (Meteor.isServer) {
  Meteor.publish('single_video', function(id){
    return Videos.find({'_id': id});
  });
  Meteor.publish('videos_from_series', function(seriesId){
    return Videos.find({"info.Series": seriesId});
  });
  Meteor.publish('videos', function(){
    return Videos.find({});
  });
}


Videos.allow({
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
