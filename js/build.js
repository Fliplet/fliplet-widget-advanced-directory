var dataDirectory = {};
$('[data-directory-id]').each(function(){
  var container = this;
  var id = $(this).data('directory-id');
  var uuid = $(this).data('directory-uuid');
  var config = Fliplet.Widget.getData(id);
  if (config.source) {
    if (!config.enable_live_data) {
      return dataDirectory[id] = new AdvancedDirectory(config, container);
    }

    Fliplet.Storage.get('data-directory-rows-' + uuid)
      .then(function (rows) {
        if (rows) {
          config.rows = rows;
          dataDirectory[id] = new AdvancedDirectory(config, container);
        } else {
          dataDirectory[id] = new AdvancedDirectory(config, container);
        }

        if (Fliplet.Navigator.isOnline()) {
          Fliplet.DataSources.connect(config.source)
            .then(function (source) {
              return source.find();
            })
            .then(function (rows) {
              dataDirectory[id].data = rows.map(function (row) {
                row.data.dataSourceEntryId = row.id;
                return row.data;
              });

              Fliplet.Storage.set('data-directory-rows-' + uuid, dataDirectory[id].data);
              dataDirectory[id].init();
            });
        }
      });
  }
});
