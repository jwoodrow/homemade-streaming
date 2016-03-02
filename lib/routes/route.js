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
    if (this.ready()) {
      return {torrents: Torrents.find().fetch()};
    }
  }
});

Router.route('AddSerie', {
  path: '/add_serie'
});

Router.route('/series/:serie_id', {
  name: "Serie",
  waitOn: function() {
    var serie_id = this.params.serie_id;
    return [
      Meteor.subscribe('single_serie', serie_id),
      Meteor.subscribe('videos_from_series', serie_id)
    ];
  },
  data: function() {
    if (this.ready()) {
      var serie_id = this.params.serie_id;
      return {
        serie: Series.findOne(serie_id),
        videos: Videos.find({"info.seriesId": serie_id}).fetch()
      };
    }
  }
});

Router.route('AddVideo', {
  path: "/add_video",
  waitOn: function(){
    return [
      Meteor.subscribe("series"),
      Meteor.subscribe("torrents")
    ];
  },
  data: function(){
    if (this.ready()) {
      return {
        serie: Series.find().fetch(),
        torrents: Torrents.find().fetch()
      };
    }
  }
});

Router.route('/videos/:video_id', {
  name: "Video",
  waitOn: function(){
    video_id = this.params.video_id;
    return [
      Meteor.subscribe("single_video", video_id),
      Meteor.subscribe("series")
    ];
  },
  data: function() {
    if (this.ready()) {
      video_id = this.params.video_id;
      video = Videos.findOne({_id: video_id});
      if (video.info.seriesId){
        return {
          video: video,
          serie: Series.findOne({_id: video.info.serieId})
        };
      } else {
        return {
          video: video,
          serie: nil
        };
      }
    }
  }
})

Router.route('/torrents/:torrent_id', {
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
  }
});
