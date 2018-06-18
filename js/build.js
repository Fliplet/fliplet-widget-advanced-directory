var dataDirectory = {};
Fliplet().then(function () {
  $('[data-directory-id]').each(function(){
    var container = this;
    var id = $(this).data('directory-id');
    var uuid = $(this).data('directory-uuid');
    var config = Fliplet.Widget.getData(id);
    var pvKey = 'data-directory-source-' + uuid;

    Fliplet.Hooks.run('flDirectoryBeforeGetData', {
      config: config,
      container: container
    }).then(function() {
      if (config.getData) {
        if (typeof config.getData !== 'function') {
          throw new Error('getData is expected to be a function');
        }

        config.getData().then(function (rows) {
          config.rows = rows;
          dataDirectory[id] = new AdvancedDirectory(config, container);
        }).catch(function (err) {
          console.error('Could not initialise directory', err);
        });
      } else if (config.source) {
        // Always start by attempting to use locally cached data
        Fliplet.Storage.get(pvKey).then(function (cachedSource) {
          if (cachedSource) {
            config.rows = cachedSource.rows;
          } else {
            // First time loading the interface...
            // Cache the data on device with a timestamp
            cachedSource = {
              rows: config.rows,
              updatedAt: new Date().getTime()
            };
            Fliplet.Storage.set(pvKey, cachedSource);
          }

          dataDirectory[id] = new AdvancedDirectory(config, container);

          if (config.enable_live_data && Fliplet.Navigator.isOnline()) {
            var sourceUpdatedAt = cachedSource.updatedAt;

            Fliplet.DataSources.connect(config.source, { offline: false })
              .then(function (source) {
                return source.find();
              })
              .then(function (rows) {
                dataDirectory[id].data = rows.map(function (row) {
                  row.data.dataSourceEntryId = row.id;
                  return row.data;
                });

                Fliplet.Storage.set(pvKey, {
                  rows: dataDirectory[id].data,
                  updatedAt: new Date().getTime()
                });

                dataDirectory[id].trigger('flDirectoryBeforeInit');
                dataDirectory[id].refreshDirectory();
              });
          }
        });
      } else {
        if (Fliplet.UI) {
          Fliplet.UI.Toast('This directory is not properly configured.');
        }

        // Load empty directory
        config.rows = [];
        dataDirectory[id] = new AdvancedDirectory(config, container);
      }
    });
  });
});