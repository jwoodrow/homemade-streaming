Template.Serie.onCreated(function() {
  Blaze._allowJavascriptUrls();
});

Template.Serie.onRendered(function(){
});

Template.Serie.helpers({
});

Template.Serie.events({
});

SerieHooks = {
  onSuccess: function(formType, result){
    console.log(result);
  },
  onError: function(formType, error){
    console.log(error);
  }
};

AutoForm.addHooks('UpdateSerieForm', SerieHooks);
