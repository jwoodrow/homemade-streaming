Torrents = new Mongo.Collection("torrents");

TorrentSchema = new SimpleSchema({
  magnet: {
    type: String,
    label: "Magnet URL"
  },
  name: {
    type: String,
    label: "Torrent Name",
    optional: true
  },
  hash: {
    type: String,
    label: "Torrent Hash",
    optional: true
  },
  location: {
    type: String,
    label: "Torrent Location",
    optional: true
  },
  completion: {
    type: String,
    label: "Torrent Completion",
    optional: true
  },
  files: {
    type: [ Object ],
    label: "Torrent Content",
    optional: true,
    autoValue: function(){
      if (this.isInsert){
        return [];
      }
    }
  },
  "files.$.name": {
    type: String,
    label: "File Name"
  },
  "files.$.path": {
    type: String,
    label: "File Path"
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
