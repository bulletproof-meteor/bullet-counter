Counter = function (name, cursor, interval) {
  this.name = name;
  this.cursor = cursor;
  this.interval = interval || 1000 * 10;
  this._collectionName = 'counters-collection';
}

// every cursor must provide a collection name via this method
Counter.prototype._getCollectionName = function() {
  return "counter-" + this._collectionName;
};

// the api to publish
Counter.prototype._publishCursor = function(sub) {
  var self = this;
};