var cleanPath = function(str){
  return str.replace(/ /g, "\\ ").replace(/\]/g, "\\]").replace(/\[/g, "\\[").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\'/g, "\\'");
};

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
    return [
      Meteor.subscribe('torrents'),
      Meteor.subscribe('series'),
      Meteor.subscribe('videos'),
      Meteor.subscribe('audios'),
      Meteor.subscribe('subtitles')
    ];
  },
  data: function() {
    if (this.ready()) {
      return {
        Torrents: Torrents.find().fetch(),
        Series: Series.find().fetch(),
        Videos: Videos.find().fetch(),
        Audios: Audios.find().fetch(),
        Subtitles: Subtitles.find().fetch()
      };
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
        videos: Videos.find({"info.Series": serie_id}).fetch()
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
      if (video.info.Series){
        return {
          video: video,
          serie: Series.findOne({_id: video.info.Series})
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

Router.route('/videos/:video_id/player', {
  name: 'Player',
  waitOn: function() {
    video_id = this.params.video_id;
    return [
      Meteor.subscribe('single_video', video_id),
      Meteor.subscribe('series'),
      Meteor.subscribe('audios_from_video', video_id),
      Meteor.subscribe('subtitles_from_video', video_id)
    ];
  },
  data: function() {
    video_id = this.params.video_id;
    return {
      video: Videos.findOne({_id: video_id}),
      audios: Audios.find({Videos: video_id}).fetch(),
      subtitles: Subtitles.find({Videos: video_id}).fetch()
    };
  }
});

  var fail = function(response) {
    response.statusCode = 404;
    response.end();
  };

  Router.route('video/file/:video_id/:quality', {
    waitOn: function(){
      return [
        Meteor.subscribe('single_video', this.params.video_id),
        Meteor.subscribe('subtitles_from_video', this.params.video_id),
        Meteor.subscribe('audios_from_video', this.params.video_id),
        Meteor.subscribe('series')
      ];
    },
    where: 'server',
    action: function(){
      if (this.ready()){
        var fs = Npm.require('fs');
        var pwd = process.env.PWD;
        var path = pwd + '/.storage/'; // make sure to validate input here


        var videos = Videos.find({_id: this.params.video_id});

        if (videos.count() > 0) {

          var video = videos.fetch()[0];

          if (video.info.Series) {
            serie = Series.findOne({_id: video.info.Series});
            path += "Series/" + serie.info.name + "/" + video.info.seasonNumber + "/" + video.info.epNumber + "/" + this.params.quality + ".mp4";
          } else {
            path += "Movies/" + cleanPath(video.info.name) + "/" + this.params.quality + ".mp4";
          }
          
          // read the file
          var chunk = fs.createReadStream(path, { bufferSize: 64 * 1024 });

          // prepare HTTP headers
          var headers = {}, // add Content-type, Content-Lenght etc. if you need
              statusCode = 200; // everything is OK, also could be 404, 500 etc.

          // out content of the file to the output stream
          this.response.writeHead(statusCode, headers);
          chunk.pipe(this.response);

        } else {
          fail(this.response);
        }
      }
    }
  });

  Router.route('audio/file/:_id', function(){
    var path = pwd + '/.storage/'; // make sure to validate input here


    var audios = Audios.find({_id: this.params._id});

    if (audios.count() > 0) {
      var audio = audios.fetch()[0];
      var video = Video.findOne({_id: audio.Videos});

      if (video.info.Series) {
        serie = Series.findOne({_id: video.info.Series});
        path += "Series/" + video.info.seasonNumber + "/" + video.info.epNumber + "/audio/" + audio.language + "*";
      } else {
        path += "Movies/" + cleanPath(video.info.name) + "/audio/" + audio.language + "*";
      }

      // read the file
      var chunk = fs.createReadStream(path);

      // prepare HTTP headers
      var headers = {}, // add Content-type, Content-Lenght etc. if you need
          statusCode = 200; // everything is OK, also could be 404, 500 etc.

      // out content of the file to the output stream
      this.response.writeHead(statusCode, headers);
      chunk.pipe(this.response);
    } else {
      var chunk = new Stream;

      var headers = {}, // add Content-type, Content-Lenght etc. if you need
          statusCode = 404; // everything is OK, also could be 404, 500 etc.

      // out content of the file to the output stream
      this.response.writeHead(statusCode, headers);
      chunk.pipe(this.response);
    }
  });

  Router.route('subtitles/file/:_id', function(){
    var path = pwd + '/.storage/'; // make sure to validate input here


    var subtitles = Subtitles.find({_id: this.params._id});

    if (audios.count() > 0) {
      var subtitle = audios.fetch()[0];
      var video = Video.findOne({_id: subtitle.Videos});

      if (video.info.Series) {
        serie = Series.findOne({_id: video.info.Series});
        path += "Series/" + video.info.seasonNumber + "/" + video.info.epNumber + "/subtitles/" + subtitle.language + "*";
      } else {
        path += "Movies/" + cleanPath(video.info.name) + "/subtitles/" + subtitle.language + "*";
      }

      // read the file
      var chunk = fs.createReadStream(path);

      // prepare HTTP headers
      var headers = {}, // add Content-type, Content-Lenght etc. if you need
          statusCode = 200; // everything is OK, also could be 404, 500 etc.

      // out content of the file to the output stream
      this.response.writeHead(statusCode, headers);
      chunk.pipe(this.response);
    } else {
      var chunk = new Stream;

      var headers = {}, // add Content-type, Content-Lenght etc. if you need
          statusCode = 404; // everything is OK, also could be 404, 500 etc.

      // out content of the file to the output stream
      this.response.writeHead(statusCode, headers);
      chunk.pipe(this.response);
    }
  });
