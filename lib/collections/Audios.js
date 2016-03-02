Audios = new Mongo.Collection("audios");

AudioSchema = new SimpleSchema({
  language: {
    type: String,
    label: "Audio Language"
  },
  videoId: {
    type: String,
    label: "Video To Link The Audio With",
    autoform: {
        type: "select",
        options: function () {
          return Videos.find().map(function (video) {
            return {label: video.info.name, value: video._id};
          });
        }
    }
  },
  torrentId: {
    type: String,
    label: "Torrent To Source The Audio From",
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
    autoform: {
      type: "select",
      options: function () {
        docId = AutoForm.getFieldValue('torrentId', 'InsertAudioForm');
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
    autoValue: function(){
      if ( this.isUpdate || this.isInsert ) {
        return new Date;
      }
    }
  }
});

Audios.attachSchema(AudioSchema);

if (Meteor.isServer) {
  Meteor.publish('single_audio', function(id){
    return Audios.find({'_id': id});
  });
  Meteor.publish('audios_from_video', function(videoId){
    return Audios.find({"videoId": videoId});
  });
  Meteor.publish('audios', function(){
    return Audios.find({});
  });
}

Audios.allow({
  insert: function(doc){
    return true;
  },
  update: function(doc){
    return true;
  }
});
