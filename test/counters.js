Tinytest.addAsync("Counters - simple", function(test, done) {
  var pubName = Random.id();
  var collName = Random.id();
  var coll = new Meteor.Collection(collName);
  coll.insert({aa: 10});
  coll.insert({aa: 20});

  Meteor.publish(pubName, function() {
    return new Counter('simple', coll.find());
  });

  var client = createClient();
  client._livedata_data = function(msg) {
    if(msg.msg == 'added' && msg.collection == 'counters-collection') {
      test.equal(msg.fields, {count: 2});
      client.disconnect();
      done();
    }    
  };

  client.subscribe(pubName);
});

Tinytest.addAsync("Counters - multiple counters", function(test, done) {
  var pubName = Random.id();
  var collName = Random.id();
  var coll = new Meteor.Collection(collName);
  coll.insert({aa: 10});
  coll.insert({aa: 20});

  Meteor.publish(pubName, function() {
    return [
      new Counter('simple', coll.find()),
      new Counter('simple2', coll.find())
    ];
  });

  var client = createClient();
  client._livedata_data = function(msg) {
    if(
        msg.msg == 'added' && 
        msg.collection == 'counters-collection' &&
        msg.id == 'simple2'
      ) {
      test.equal(msg.fields, {count: 2});
      client.disconnect();
      done();
    }    
  };

  client.subscribe(pubName);
});

Tinytest.addAsync("Counters - getting changes", function(test, done) {
  var pubName = Random.id();
  var collName = Random.id();
  var coll = new Meteor.Collection(collName);
  coll.insert({aa: 10});
  coll.insert({aa: 20});

  Meteor.publish(pubName, function() {
    return new Counter('simple', coll.find(), 500);
  });

  var client = createClient();
  client._livedata_data = function(msg) {
    if(
        msg.msg == 'added' && 
        msg.collection == 'counters-collection' &&
        msg.id == 'simple'
      ) {
      test.equal(msg.fields, {count: 2});
      coll.insert({aa: 20});
    }

    if(
        msg.msg == 'changed' && 
        msg.collection == 'counters-collection' &&
        msg.id == 'simple'
      ) {
      test.equal(msg.fields, {count: 3});
      client.disconnect();
      done();
    }
  };

  client.subscribe(pubName);
});

Tinytest.addAsync("Counters - stop publishing", function(test, done) {
  var pubName = Random.id();
  var collName = Random.id();
  var coll = new Meteor.Collection(collName);
  coll.insert({aa: 10});
  coll.insert({aa: 20});
  var completed = false;

  var counter = new Counter('simple', coll.find(), 500);
  var onStopCallback = function() {};
  var sub = {
    added: function(coll, id, fields) {
      test.equal(fields, {count: 2});
      Meteor.defer(function() {
        onStopCallback();
      });
      Meteor.setTimeout(function() {
        completed = true;
        done();
      }, 800);
    },
    changed: function() {
      if(!completed) {
        test.fail('cannot receive changes after stopping the subscription');
      }
    },
    onStop: function(callback) {
      onStopCallback = callback;
    }
  };

  counter._publishCursor(sub);
});

function createClient () {
  return DDP.connect(process.env.ROOT_URL);
}