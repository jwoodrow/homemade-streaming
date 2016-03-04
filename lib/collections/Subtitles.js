Subtitles = new Mongo.Collection("subtitles");

SubtitleSchema = new SimpleSchema({
  language: {
    type: String,
    label: "Subtitle Language"
  },
  code: {
    type: String,
    label: "Language Code"
  },
  Videos: {
    type: String,
    label: "Video To Link The Subtitle With",
    nameOnShow: true,
    autoform: {
        type: "select",
        options: function () {
          return Videos.find().map(function (video) {
            return {label: video.info.name, value: video._id};
          });
        }
    }
  },
  Torrents: {
    type: String,
    label: "Torrent To Source The Subtitle From",
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
  fileId: {
    type: Number,
    label: "Select The File To Source",
    omitOnShow: true,
    autoform: {
      type: "select",
      options: function () {
        docId = AutoForm.getFieldValue('Torrents', 'InsertSubtitleForm');
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

Subtitles.attachSchema(SubtitleSchema);

if (Meteor.isServer) {
  Meteor.publish('single_subtitle', function(id){
    return Subtitles.find({'_id': id});
  });
  Meteor.publish('subtitles_from_video', function(videoId){
    return Subtitles.find({"Videos": videoId});
  });
  Meteor.publish('subtitles', function(){
    return Subtitles.find({});
  });
}

Subtitles.allow({
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
