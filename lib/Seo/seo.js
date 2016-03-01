Meteor.startup(function() {
 if(Meteor.isClient){
      return SEO.config({
        title: 'Title',
        meta: {
          'description': 'No Description'
        },
        og: {
          'type': "website",
          'title': "Title",
          'site_name': "Title",
          'description': "No Description"
        }
      });
    }
});
