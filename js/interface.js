var widgetId = Fliplet.Widget.getDefaultId();
var data = Fliplet.Widget.getData(widgetId) || {};
var dataDirectoryForm;

Fliplet.DataSources.get({ type: null })
  .then(function (dataSources) {
    return Promise.all(dataSources.map(function (dataSource) {
      return Fliplet.DataSources.connect(dataSource.id)
        .then(function (source) {
          return source.find()
            .catch(function() {
              // Quick fix while we don't remove rows from the advanced directory
              // Data Sources with security enabled will fail to get the rows
              return Promise.resolve([]);
            });
        })
        .then(function (rows) {
          dataSource.rows = rows.map(function (row) {
            row.data.dataSourceEntryId = row.id;
            return row.data;
          });
          return Promise.resolve(dataSource);
        });
    }))
      .then(function (dataSources) {
        if (!dataSources.length) {
          $('.no-data-source-prompt').show();
        }
        data.dataSources = dataSources;
        dataDirectoryForm = new DataDirectoryForm(data);
      });
  });

// Fired from Fliplet Studio when the external save button is clicked
Fliplet.Widget.onSaveRequest(function () {
  dataDirectoryForm.saveDataDirectoryForm_();
  Fliplet.Widget.save(dataDirectoryForm.directoryConfig).then(function () {
    Fliplet.Studio.emit('reload-page-preview');
    Fliplet.Widget.complete();
  });
});
