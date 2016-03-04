Torrents = new Mongo.Collection("torrents");

TorrentSchema = new SimpleSchema({
  magnet: {
    type: String,
    label: "Magnet URL",
    omitOnShow: true
  },
  name: {
    type: String,
    label: "Torrent Name",
    optional: true,
    omitOnInsert: true,
  },
  hash: {
    type: String,
    label: "Torrent Hash",
    optional: true,
    omitOnInsert: true,
    omitOnShow: true,
  },
  location: {
    type: String,
    label: "Torrent Location",
    optional: true,
    omitOnInsert: true,
    omitOnShow: true,
  },
  completion: {
    type: String,
    label: "Torrent Completion",
    optional: true,
    omitOnInsert: true,
  },
  files: {
    type: [ Object ],
    optional: true,
    omitOnInsert: true,
    autoValue: function(){
      if (this.isInsert){
        return [];
      }
    }
  },
  "files.$": {
    type: Object,
    label: "File",
    omitOnInsert: true
  },
  "files.$.name": {
    type: String,
    label: "File Name",
    omitOnInsert: true
  },
  "files.$.path": {
    type: String,
    label: "File Path",
    omitOnInsert: true
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

Torrents.attachSchema(TorrentSchema);

if (Meteor.isServer) {
  Meteor.publish('single_torrent', function(id){
    return Torrents.find({'_id': id});
  });
  Meteor.publish('torrents', function(){
    return Torrents.find();
  });
}

Torrents.allow({
  insert: function(){
    return true;
  },
  update: function(){
    return true;
  },
  remove: function(){
    return true;
  }
});
