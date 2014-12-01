TestCollection = new Meteor.Collection('testCollection');

Meteor.methods({
  "test/1": function() {
    console.log("Method 1 start");
    this.unblock();
    TestCollection.insert({date: new Date()});
    if (! this.isSimulation) {
      Meteor._sleepForMs(5000);
    }
  },

  "test/2": function() {
    console.log("Method 2 start");
    this.unblock();
    var inserted;
    if (! this.isSimulation) {
      TestCollection.insert({date: new Date()});
      Meteor._sleepForMs(5000);
    }
  },

  "test/3": function() {
    console.log("Method 3 start");
  }
});

///////////////////////

if (Meteor.isServer) {
  Meteor.publish('test-collection', function() {
    return TestCollection.find();
  });
}

///////////////////////

if (Meteor.isClient) {
  TestCollectionSub = Meteor.subscribe('test-collection');

  Template.main.helpers({
    m1Called: function() {
      return Session.equals('method-1', true);
    },

    m2Called: function() {
      return Session.equals('method-2', true);
    },

    m3Called: function() {
      return Session.equals('method-3', true);
    },

    subReady: function() {
      return TestCollectionSub.ready();
    },

    items: function() {
      return TestCollection.find();
    }
  });

  Template.main.events({
    'click #m1': function() {
      Session.set('method-1', true);
      Meteor.call('test/1', function() {
        console.log('Method 1 callback');
        Session.set('method-1', false);
      });
    },

    'click #m2': function() {
      Session.set('method-2', true);
      Meteor.call('test/2', function() {
        console.log('Method 2 callback');
        Session.set('method-2', false);
      });
    },

    'click #m3': function() {
      Session.set('method-3', true);
      Meteor.call('test/3', function() {
        console.log('Method 3 callback');
        Session.set('method-3', false);
      });
    },

    'click #resub': function() {
      TestCollectionSub.stop();
      TestCollectionSub = Meteor.subscribe('test-collection');
    }
  });
}
