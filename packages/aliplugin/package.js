Package.describe({
    name: 'cafe4it:aliplugin',
    version: '0.0.1',
    // Brief, one-line summary of the package.
    summary: '',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.1.0.3');
    api.use(['http','underscore','momentjs:moment','check','meteorhacks:async','peerlibrary:async'],['server']);
    api.addFiles('aliplugin.js',['server']);
    api.export('ALI',['server']);
});

Package.onTest(function (api) {
    api.use(['tinytest','http','underscore','momentjs:moment','check']);
    api.use('cafe4it:aliplugin');
    api.addFiles('aliplugin-tests.js',['server']);
});
