var registeredAutoFormHooks = ['afForm'];

var collectionObj;

var afOnSuccessCallback = null;

var collectionObj = function(name) {
  return name.split('.').reduce(function(o, x) {
    return o[x];
  }, window);
};

Template.AutoFormModal.onCreated(function() {
  Blaze._allowJavascriptUrls();
  Session.set('afFormId', 'afForm');
});

Template.AutoFormModal.onRendered(function(){
});

AutoFormModalHook = {
  onSuccess: function(formType, result){
    $('.ui.modal').modal('hide');
  },
  onError: function(formType, error){
    console.log(error);
  }
};

AutoForm.addHooks('afForm', AutoFormModalHook);


Template.AutoFormModal.helpers({
  get: function(name){
    return Session.get(name);
  },
  collectionAndOperation: function(){
    return Session.get("afCollection") && Session.get("afOperation")
  },
  notRemove: function(){
    return Session.get('afOperation') != "remove"
  },
  remove: function(){
    return Session.get('afOperation') == "remove"
  }
});

Template.AutoFormModal.events({
  'click button:not(.close)': function() {
    var _id, collection, operation;
    console.log("hey");
    collection = Session.get('afCollection');
    operation = Session.get('afOperation');
    if (operation !== 'insert') {
      _id = Session.get('afDoc');
    }
    if (operation === 'remove') {
      console.log("hey2");
      console.log(collection);
      console.log(collectionObj(collection));
      return collectionObj(collection).remove(_id, function(e) {
        if (e) {
          return alert('Sorry, this could not be deleted.');
        } else {
          $('.ui.modal').modal('hide');
          return typeof afOnSuccessCallback === "function" ? afOnSuccessCallback() : void 0;
        }
      });
    }
  }
});

Template.AutoFormButton.onCreated(function() {
  Blaze._allowJavascriptUrls();
});

Template.AutoFormButton.onRendered(function(){
});

Template.AutoFormButton.helpers({
});

Template.AutoFormButton.events({
  'click .launch-modal': function(e, t){
    e.preventDefault();

    if (t.data.doc) {
      Session.set('afDoc', collectionObj(t.data.collection).findOne( {_id: t.data.doc} ));
      console.log(t.data.doc);
    }

    Session.set('afCollection', t.data.collection);
    Session.set('afOperation', t.data.operation);
    Session.set('afFields', t.data.fields);
    Session.set('afOmitFields', t.data.omitFields);
    Session.set('afTitle', t.data.title);
    Session.set('afFormId', t.data.formId);

    afOnSuccessCallback = t.data.onSuccess;

    if (!_.contains(registeredAutoFormHooks, t.data.formId)){
      AutoForm.addHooks(t.data.formId, {
        onSuccess: function(){
          $('#afModal').modal('hide');
        },
        onError: function(formType, error){
          console.log(error);
        }
      });
      registeredAutoFormHooks.push(t.data.formId);
    }

    if(t.data.operation == 'insert') {
      Session.set('afButtonContent', 'Create');
    } else if(t.data.operation == 'update') {
      Session.set('afButtonContent', 'Update');
    } else if(t.data.operation == 'remove') {
      Session.set('afButtonContent', 'Delete');
    }

    if (t.data.operation == 'remove') {
      Session.set('afButtonClasses', 'ui red button');
    } else {
      Session.set('afButtonClasses', 'ui green button');
    }

    if (t.data.operation == 'remove') {
      Session.set('afPrompt', 'Are you sure?');
    } else {
      Session.set('afPrompt', '');
    }

    $('.ui.modal').modal('show');
  },
  'click button:not(.close)': function() {
    var _id, collection, operation;
    console.log("hey");
    collection = Session.get('afCollection');
    operation = Session.get('afOperation');
    if (operation !== 'insert') {
      _id = Session.get('cmDoc')._id;
    }
    if (operation === 'remove') {
      console.log("hey2");
      console.log(collection);
      console.log(collectionObj(collection));
      return collectionObj(collection).remove(_id, function(e) {
        if (e) {
          return alert('Sorry, this could not be deleted.');
        } else {
          $('.ui.modal').modal('hide');
          return typeof afOnSuccessCallback === "function" ? afOnSuccessCallback() : void 0;
        }
      });
    }
  }
});
