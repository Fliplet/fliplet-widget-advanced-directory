var dataDirectory = {};
document.addEventListener('DOMContentLoaded', function() {
  $('[data-directory-id]').each(function(){
    var container = this;
    var id = $(this).data('directory-id');
    var uuid = $(this).data('directory-uuid');
    var config = Fliplet.Widget.getData(id);
    var connection;

    if (!config.source) {
      // Start data directory with no data
      return dataDirectory[id] = new AdvancedDirectory(config, container);
    }

    // Load local data
    Fliplet.DataSources.connect(config.source)
      .then(function (source) {
        connection = source;
        return source.find();
      })
      .then(function (rows) {
        config.rows = formatRows(rows);

        // Start data directory
        dataDirectory[id] = new AdvancedDirectory(config, container);

        // Check if live data is enabled
        if (config.enable_live_data) {
          // Pull latest data
          connection.pull()
            .then(function (result) {
              if (!result.pulled) {
                return;
              }

              config.rows = formatRows(result.entries);
              dataDirectory[id].refreshDirectory();
            })
        }
      })
      .catch(function (error) {
        // Start data directory with no data
        dataDirectory[id] = new AdvancedDirectory(config, container);
      });
  });
});
