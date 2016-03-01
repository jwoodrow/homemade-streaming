Template.Home.onCreated(function() {
  Blaze._allowJavascriptUrls();
});

function operateFormatter(value, row, index) {
  return [
    '<a rel="tooltip" title="Remove" class="table-action remove" href="javascript:void(0)" title="Remove">',
      '<i class="fa fa-remove"></i>',
    '</a>'
  ].join('');
}

Template.Home.onRendered(function(){

});

Template.Home.helpers({
  torrents: function(){
    return Torrents.find({});
  }
});

Template.Home.events({
  'submit .new_torrent': function(event){
    event.preventDefault();

    var magnet = event.target.magnet.value;

    Meteor.call("addTorrent", magnet, function(){

    });

    event.target.magnet.value = "";
  },
  'click .refresh': function(){
    torrents = Torrents.find().fetch();
    _.each(torrents, function(torrent, index){
      Meteor.call("updateTorrent", torrent._id, function(){

      });
    });
  },
  'change .file': function(ev){
    Meteor.saveFile(ev.target.files[0], ev.target.files[0].name);
  }
});

Template.torrent.events({
  'click .remove': function(event){
    id = $(event.target).parent().parent().prev().prev().prev().prev().html().trim();
    Meteor.call("deleteTorrent", id, function(){

    });
  }
});

Meteor.saveFile = function(blob, name, path, type, callback) {
  var fileReader = new FileReader(),
    method, encoding = 'binary', type = type || 'binary';
  switch (type) {
    case 'text':
      // TODO Is this needed? If we're uploading content from file, yes, but if it's from an input/textarea I think not...
      method = 'readAsText';
      encoding = 'utf8';
      break;
    case 'binary':
      method = 'readAsBinaryString';
      encoding = 'binary';
      break;
    default:
      method = 'readAsBinaryString';
      encoding = 'binary';
      break;
  }
  fileReader.onload = function(file) {
    Meteor.call('addTorrentFromFile', file.srcElement.result, name, path, encoding, callback);
  }
  fileReader[method](blob);
};
