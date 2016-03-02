Template.AddVideo.onCreated(function() {
  Blaze._allowJavascriptUrls();
});

Template.AddVideo.onRendered(function(){
});

Template.AddVideo.helpers({
});

Template.AddVideo.events({
});

VideoHooks = {
  onSuccess: function(formType, result){
    Router.go("/videos/" + result);
  },
  onError: function(formType, error){
    console.log(error);
  }
};

AutoForm.addHooks('InsertVideoForm', VideoHooks);
