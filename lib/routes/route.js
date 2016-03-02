Router.configure({
  layoutTemplate: 'Layout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'Loading',
  progressTick: false,
  progressDelay: 100,
  progress: true,
  progressSpinner : false
});

Router.route('Torrents', {
  path: '/',
  waitOn: function() {
    return Meteor.subscribe('torrents');
  },
  data: function() {
    return Torrents.find().fetch();
  }
});

Router.route('/:torrent_id', {
  name: 'Torrent',
  waitOn: function() {
    var torrent_id = this.params.torrent_id;
    return [
      Meteor.subscribe('single_torrent', torrent_id)
    ];
  },
  data: function() {
    if (this.ready()) {
      var torrent_id = this.params.torrent_id;
      return Torrents.findOne(torrent_id);
    }
  },
})
