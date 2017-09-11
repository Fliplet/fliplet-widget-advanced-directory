var widgetId = Fliplet.Widget.getDefaultId();
var data = Fliplet.Widget.getData(widgetId) || {};
var dataDirectoryForm;

Fliplet.DataSources.get({ type: null })
  .then(function (dataSources) {
    if (!dataSources.length) {
      $('.no-data-source-prompt').show();
    }
    data.dataSources = dataSources;
    dataDirectoryForm = new DataDirectoryForm(data);
  });

// Fired from Fliplet Studio when the external save button is clicked
Fliplet.Widget.onSaveRequest(function () {
  dataDirectoryForm.saveDataDirectoryForm_();
  Fliplet.Widget.save(dataDirectoryForm.directoryConfig).then(function () {
    Fliplet.Studio.emit('reload-page-preview');
    Fliplet.Widget.complete();
  });
});
