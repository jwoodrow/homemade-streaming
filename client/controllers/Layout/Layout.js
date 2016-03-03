Meteor.startup(function() {
  Uploader.finished = function(index, fileInfo, templateContext) {
    console.log(fileInfo);
  };
  AutoForm.setDefaultTemplate("semanticUI");
})
