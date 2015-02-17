Package.describe({
  "summary": "Let's Count",
  "version": "1.0.0",
  "name": "meteorhacks:counts"
});

Package.onUse(function(api) {
  configurePackage(api);
  api.export(['Counter']);
});

Package.on_test(function(api) {
  configurePackage(api);
  api.use([
    'tinytest',
    'random'
  ], ['client', 'server']);

  api.addFiles('test/counters.js', 'server');
});

function configurePackage(api) {
  api.versionsFrom('METEOR@0.9.1');
  api.addFiles('lib/server.js', 'server');
  api.addFiles('lib/client.js', 'client');
}
