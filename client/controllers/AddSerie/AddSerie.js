Template.AddSerie.onCreated(function() {
  Blaze._allowJavascriptUrls();
});

Template.AddSerie.onRendered(function(){
});

Template.AddSerie.helpers({
});

Template.AddSerie.events({
});

SerieHooks = {
  onSuccess: function(formType, result){
    Router.go("/series/" + result);
  },
  onError: function(formType, error){
    console.log(error);
  }
};

AutoForm.addHooks('InsertSerieForm', SerieHooks);
