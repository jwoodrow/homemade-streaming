Router.configure({
  layoutTemplate: 'Layout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'Loading',
  progressTick: false,
  progressDelay: 100,
  progress: true,
  progressSpinner : false
});

Router.route('Home', {
  path: '/',
  waitOn: function() {
    return Meteor.subscribe('torrents');
  },
  data: function() {
    return Torrents.find().fetch();
  }
});
