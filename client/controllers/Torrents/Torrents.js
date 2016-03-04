Template.Torrents.onCreated(function() {
  Blaze._allowJavascriptUrls();
});

Template.Torrents.onRendered(function(){

});

var collectionObj = function(name) {
  return name.split('.').reduce(function(o, x) {
    return o[x];
  }, window);
};

var showArray = function(collection) {
  var schema = collection.simpleSchema();
  var ret = [];
  _.forEach(schema._schemaKeys, function(key) {
    if (key.indexOf('$') == -1 && !schema._schema[key].omitOnShow) {
      var name;
      if (schema._schema[key].type == Array) {
        name = "#" + schema._schema[key + ".$"].label;
      } else {
        name = schema._schema[key].label
      }
      ret.push({
        value: name,
        key: key,
        nameOnShow: schema._schema[key].nameOnShow
      });
    }
  });
  return ret;
};

var insertArray = function(collection){
  var schema = collection.simpleSchema();
  var ret = [];
  _.forEach(schema._schemaKeys, function(key) {
    if (schema._schema[key].omitOnInsert) {
      ret.push(key);
    }
  });
  return ret.join(',');
};

Template.Torrents.helpers({
  torrents: function(){
    return Torrents.find({});
  },
  getSchema: function(collectionName) {
    ret = showArray(collectionObj(collectionName));
    return ret;
  },
  toArray: function(object) {
    var ret = [];
    _.each(object, function(v, k) {
      var tmp = {
        key: k,
        value: v
      };
      ret.push(tmp);
    });
    return ret;
  },
  title: function(key){
    return "New " + key;
  },
  collection: function(key){
    return key;
  },
  getOmits: function(key){
    return insertArray(collectionObj(key));
  },
  formId: function(key){
    return "Insert" + key.substring(0, key.length - 1) + "Form";
  }
});

Template.Torrents.events({
});

Template.rows.helpers({
  beforeDelete: function(){
    return function(collection, id) {
      if (confirm('Do you really want to remove this ?')) {
        this.remove();
      }
    }
  },
  toArray: function(value, parentContext) {
    var collection = collectionObj(parentContext.key);
    var schemaArr = showArray(collection);
    var ret = [];

    _.forEach(schemaArr, function(element){
      if (element.nameOnShow) {
        var tmp = value;
        var keys = element.key.split('.');
        _.each(keys, function(key, i){
          tmp = tmp[key];
        });
        collectionName = element.key.split('.')[element.key.split('.').length - 1];
        collection2 = collectionObj(collectionName);
        nameSource = collection2.findOne({_id: tmp});
        ret.push({
          val: nameSource.info.name
        });
      } else if (element.value[0] != '#') {
        var tmp = value;
        var keys = element.key.split('.');
        _.each(keys, function(key){
          tmp = tmp[key];
        });
        ret.push({
          val: tmp
        });
      } else {
        var tmp = value;
        var keys = element.key.split('.');
        _.each(keys, function(key){
          tmp = tmp[key];
        });
        ret.push({
          val: tmp.length
        });
      }
    });
    return ret;
  },
  getKey: function(parentContext){
    return parentContext.key;
  }
});