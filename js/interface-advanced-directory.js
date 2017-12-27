/*****************  DataDirectoryForm  *****************/
/*****************  DataDirectoryForm  *****************/
/*****************  DataDirectoryForm  *****************/

var DataDirectoryForm = (function() {

  var $imagesContainer = $('.image-library');
  var upTo = [{ back: openRoot, name: 'Root'}];
  var folders;
  var apps;
  var organizations;
  var _this;
  var $dataSources = $('#data-sources');


  function addFolder(folder) {
    $imagesContainer.append(Fliplet.Widget.Templates['interface.files.folder'](folder));
  }

  function addApp(app) {
    $imagesContainer.append(Fliplet.Widget.Templates['interface.files.app'](app));
  }

  function addOrganization(organization) {
    $imagesContainer.append(Fliplet.Widget.Templates['interface.files.organization'](organization));
  }

  function noFiles() {
    $imagesContainer.html(Fliplet.Widget.Templates['interface.files.noFiles']());
  }

  function getApps() {
    return Fliplet.Apps
      .get()
      .then(function (apps) {
        return apps.filter(function (app) {
          return !app.legacy;
        });
      });
  }

  function init() {
    openRoot();
  }

  function openRoot() {
    // Clean library container
    $imagesContainer.html('');

    // Update paths
    updatePaths();

    var organizationId = Fliplet.Env.get('organizationId');
    return Promise.all([
      Fliplet.Organizations.get(),
      getApps()
    ])
      .then(function renderRoot(values) {
        organizations = values[0];
        apps = values[1];

        values[0].forEach(addOrganization);
        values[1].forEach(addApp);
      });
  }

  function openFolder(folderId) {
    Fliplet.Media.Folders.get({ type: 'folders', folderId: folderId })
      .then(renderFolderContent);
  }

  function openApp(appId) {
    Fliplet.Media.Folders.get({ type: 'folders', appId: appId })
      .then(renderFolderContent);
  }

  function openOrganization(organizationId) {
    Fliplet.Media.Folders.get({ type: 'folders', organizationId: organizationId })
      .then(renderFolderContent);
  }

  function renderFolderContent(values) {
    $('.folder-selection span').html('Select an folder below');
    $imagesContainer.html('');

    if (!values.folders.length) {
      return noFiles();
    }

    folders = values.folders;

    // Render folders and files
    _.sortBy(values.folders, ['name']).forEach(addFolder);
  }

  function updatePaths() {
    if (upTo.length === 1) {
      // Hide them
      $('.back-btn').hide();
      $('.breadcrumbs-select').hide();

      return;
    }

    // Show them
    $('.breadcrumbs-select').show();
    $('.back-btn').show();

    // Parent folder
    $('.up-to').html(upTo[upTo.length - 2].name);

    // Current folder
    $('.helper strong').html(upTo[upTo.length - 1].name);
  }

  function updateSelectText($el) {
    var selectedText = $el.find('option:selected').text();
    $el.parents('.select-proxy-display').find('.select-value-proxy').html(selectedText);
  }
  
  function codeMirrorConfig(mode) {
    return {
      mode: mode,
      lineNumbers: true,
      lineWrapping: true,
      autoRefresh: true,
      tabSize: 2,
      matchBrackets: true
    }
  }

  // Constructor
  function DataDirectoryForm( configuration ) {
    _this = this;

    this.tables = configuration.dataSources;
    this.source = '';

    if (configuration.source) {
      this.source = configuration.source;
      $('.options').show();
      $('.nav-tabs li#main-list-control').removeClass('disabled');
    }
    delete configuration.dataSources;

    this.directoryConfig = $.extend({
      sort_order: 'alphabetical',
      alphabetical_field: '',
      alphabetical_fields: [],
      chronological_field: '',
      reverse_chronological_field: '',
      filter_fields: [],
      search_fields: [],
      source: '',
      field_types: {},
      folderConfig: {},
      listviewTemplate: '',
      detailviewTemplate: '',
      customCss: '',
      customJs: ''
    }, configuration);
    if ( typeof this.directoryConfig.field_types === 'string' && this.directoryConfig.field_types.length ) {
      this.directoryConfig.field_types = JSON.parse(this.directoryConfig.field_types);
    }

    // if (typeof configuration.thumbnail_field !== 'undefined' && configuration.thumbnail_field !== '') {
    //   $('.thumbs-options').addClass('show');
    // }

    if (typeof configuration.folderConfig !== 'undefined' && configuration.thumbnail_field.length) {
      if ('organizationId' in configuration.folderConfig) {
        $('.item-holder[data-organization-id="'+configuration.folderConfig.organizationId+'"]').addClass('selected');
      } else if ('appId' in configuration.folderConfig) {
        $('.item-holder[data-app-id="'+configuration.folderConfig.appId+'"]').addClass('selected');
      } else if ('folderId' in configuration.folderConfig) {
        $('.item-holder[data-folder-id="'+configuration.folderConfig.folderId+'"]').addClass('selected');
      }
    }

    if (!this.directoryConfig.alphabetical_fields.length && this.directoryConfig.alphabetical_field !== '') {
      this.directoryConfig.alphabetical_fields = [this.directoryConfig.alphabetical_field];
    }

    this.listviewEditor = CodeMirror.fromTextArea(
      document.getElementById('listview-template'),
      codeMirrorConfig({
        name: 'handlebars',
        base: 'text/html'
      })
    );
    this.detailviewEditor = CodeMirror.fromTextArea(
      document.getElementById('detailview-template'),
      codeMirrorConfig({
        name: 'handlebars',
        base: 'text/html'
      })
    );
    this.customCssEditor = CodeMirror.fromTextArea(
      document.getElementById('custom-css'),
      codeMirrorConfig('text/css')
    );
    this.customJsEditor = CodeMirror.fromTextArea(
      document.getElementById('custom-js'),
      codeMirrorConfig('text/javascript')
    );

    this.initialiseHandlebars();
    this.parseSelectedTable(this.source);
    this.loadDataDirectoryForm();
    this.attachObservers_();
  }

  DataDirectoryForm.prototype = {
    // Public functions
    constructor: DataDirectoryForm,

    initialiseHandlebars: function(){
      Handlebars.registerHelper('select', function(value, options){
        var $el = $('<select />').html( options.fn(this) );
        $el.find('[value="' + value + '"]').attr('selected', true);
        return $el.html();
      });

      Handlebars.registerHelper('filterCheckbox', function(field){
        var $input = $([
          '<div class="checkbox checkbox-icon"><input data-field="',
          field,
          '" data-type="filter" type="checkbox" id="filter_',
          field,
          '">',
          '<label for="filter_',
          field,
          '"><span class="check"><i class="fa fa-check"></i></span></label></div>'
        ].join(''));

        if ( _this.directoryConfig.filter_fields.indexOf(field) > -1 ) {
          $input.find('input').attr('checked',true);
        }

        return $input[0].outerHTML;
      });

      Handlebars.registerHelper("searchCheckbox", function(field){
        var $input = $([
          '<div class="checkbox checkbox-icon"><input data-field="',
          field,
          '" data-type="search" type="checkbox" id="search_',
          field,
          '">',
          '<label for="search_',
          field,
          '"><span class="check"><i class="fa fa-check"></i></span></label></div>'
        ].join(''));

        if ( _this.directoryConfig.search_fields.indexOf(field) > -1 ) {
          $input.find('input').attr('checked',true);
        }

        return $input[0].outerHTML;
      });

      Handlebars.registerHelper('typeSelector', function(field){
        var typeSelectorTemplate = Fliplet.Widget.Templates['interface.dataTypeSelector']({ 'field': field });

        var fieldType = 'text';
        if ( typeof _this.directoryConfig.field_types[field] !== 'undefined' ) {
          fieldType = _this.directoryConfig.field_types[field];
        }

        var $select = $( typeSelectorTemplate );
        $select.find('[value="' + fieldType + '"]').attr('selected', true);

        return $select[0].outerHTML;
      });
    },

    parseSelectedTable: function(tableID, autoConfigure){
      if (tableID !== '') {
        for (var i = 0, l = _this.tables.length; i < l; i++) {
          if ( _this.tables[i].hasOwnProperty('id') && _this.tables[i].id == tableID ) {
            _this.source = _this.tables[i].id;
            _this.columns = _this.tables[i].columns;
            _this.rows = _this.tables[i].rows;

            if (!autoConfigure) {
              return;
            }

            _this.autoConfigureSearch();
            _this.autoConfigureFilter();
            _this.autoConfigureBrowse();
          }
        }
      }
    },

    loadDataDirectoryForm: function(){
      $dataSources.prop('disabled',false).html(Fliplet.Widget.Templates['interface.dataSourceOptions'](_this.tables));
      updateSelectText($dataSources);
      $('#data-alphabetical-fields').html(Fliplet.Widget.Templates['interface.dataFieldTokenField']({
        name: 'alphabetical_fields',
        id: 'data-alphabetical-fields-tokenfield'
      }));
      $('#data-alphabetical-fields-tokenfield').tokenfield('destroy').tokenfield({
        autocomplete: {
          source: _this.columns,
          delay: 100
        },
        showAutocompleteOnFocus: true
      });
      $('#data-chronological-fields').replaceWith(Fliplet.Widget.Templates['interface.dataFieldSelect']({
        fields: _this.columns,
        name: 'chronological_field',
        id: 'data-chronological-fields-select'
      }));
      $('#data-reverse-chronological-fields').replaceWith(Fliplet.Widget.Templates['interface.dataFieldSelect']({
        fields: _this.columns,
        name: 'reverse_chronological_field',
        id: 'data-reverse-chronological-fields-select'
      }));
      // $('#data-tags-fields').html(Fliplet.Widget.Templates['interface.dataTagsField'](_this.columns));
      // $('#data-thumbnail-fields').html(Fliplet.Widget.Templates['interface.dataThumbnailField'](_this.columns));

      if (!_this.tables.length) {
        $('#no-data-source-prompt').removeClass('hidden');
      }

      if (_this.source !== '') {
        $dataSources.val(_this.source);
        updateSelectText($dataSources);
        _this.loadConfigurations_();
      }

      if (!_this.columns || !_this.columns.length) {
        $('.options').hide();
        $('#manage-data').addClass('hidden');
        if (_this.source) {
          $('.options-no-columns').show();
        }
        $('.nav-tabs li#main-list-control').addClass('disabled');
        return;
      }
      $('.options').show();
      $('#manage-data').removeClass('hidden');
      $('.options-no-columns').hide();
      $('.nav-tabs li#main-list-control').removeClass('disabled');
    },

    createDataSource: function() {
      event.preventDefault();
      var name = prompt('Please type a name for your data source:');

      if (!name) {
        return;
      }

      Fliplet.DataSources.create({
        name: name,
        organizationId: Fliplet.Env.get('organizationId')
      }).then(function(ds) {
        _this.tables.push(ds);
        $dataSources.append('<option value="' + ds.id + '">' + ds.name + '</option>');
        $dataSources.val(ds.id).trigger('change');
      });
    },

    manageAppData: function() {
      console.log('TODO');
      // @TODO: Open overlay to data sources provider
    },

    autoConfigureSearch: function(){
      _this.directoryConfig.search_fields = (_this.columns && _this.columns.length > 4)
        ? _this.columns.slice(0,4)
        : _this.columns;
    },

    autoConfigureFilter: function(){
      _this.directoryConfig.filter_fields = (_this.columns && _this.columns.length > 3)
        ? _this.columns.slice(1,3)
        : _this.columns;
    },

    autoConfigureBrowse: function(){
      _this.directoryConfig.alphabetical_fields = (_this.columns && _this.columns.length)
        ? [_this.columns[0]]
        : [];
    },

    toggleFullscreen: function(fullscreen){
      if (typeof fullscreen === 'undefined') {
        fullscreen  = !$('body').hasClass('widget-mode-wide');
      }
      if (fullscreen) {
        $('body').addClass('widget-mode-wide');
        Fliplet.Studio.emit('widget-mode', 'wide');
        $('.fullscreen-toggle .toggle-label').text('Exit full screen');
        return;
      }
      $('body').removeClass('widget-mode-wide');
      Fliplet.Studio.emit('widget-mode', 'normal');
      $('.fullscreen-toggle .toggle-label').text('Full screen');
    },

    loadConfigurations_: function(){
      $('#data-sources option[value=""]').remove();
      $('a[href="#data-source"][data-toggle="tab"]').html('Change data source');
      $('.nav.nav-stacked li.disabled').removeClass('disabled');

      $('#data-browse-configurations').html(Fliplet.Widget.Templates['interface.dataBrowseConfigurations'](_this.columns));
      $('#data-browse-configurations select').each(function() {
        updateSelectText($(this));
      });

      $('#data-alphabetical-fields-tokenfield').tokenfield('setTokens', _this.directoryConfig.alphabetical_fields );

      $('#data-chronological-fields-select').val( _this.directoryConfig.chronological_field );
      updateSelectText($('#data-chronological-fields-select'));

      $('#data-reverse-chronological-fields-select').val( _this.directoryConfig.reverse_chronological_field );
      updateSelectText($('#data-reverse-chronological-fields-select'));

      $('[name=sort_order][value="' + _this.directoryConfig.sort_order + '"]').attr('checked',true);

      // $('#data-thumbnail-fields-select').val( _this.directoryConfig.thumbnail_field );
      // updateSelectText($('#data-thumbnail-fields-select'));

      if (_this.directoryConfig.enable_live_data) {
        $('#enable_live_data').prop('checked', true);
      }

      _this.listviewEditor.getDoc().setValue(_this.directoryConfig.listviewTemplate);
      _this.detailviewEditor.getDoc().setValue(_this.directoryConfig.detailviewTemplate);
      _this.customCssEditor.getDoc().setValue(_this.directoryConfig.customCss);
      _this.customJsEditor.getDoc().setValue(_this.directoryConfig.customJs);

      setTimeout(_this.refreshCodeEditors_, 0);
    },

    refreshCodeEditors_: function(){
      _this.listviewEditor.refresh();
      _this.detailviewEditor.refresh();
      _this.customCssEditor.refresh();
      _this.customJsEditor.refresh();
    },

    attachObservers_: function(){
      $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        $(window).trigger('resize');
        _this.toggleFullscreen(false);
        _this.refreshCodeEditors_();
      })

      $('.image-library')
        .on('dblclick', '[data-folder-id]', function () {
          var $el = $(this);
          var id = $el.data('folder-id');
          var backItem;

          // Store to nav stack
          backItem = _.find(folders, ['id', id]);
          backItem.back = function () {
            openFolder(id);
          };
          upTo.push(backItem);

          // Open
          openFolder(id);

          // Update paths
          updatePaths();
        })
        .on('dblclick', '[data-app-id]', function () {
          var $el = $(this);
          var id = $el.data('app-id');
          var backItem;

          // Store to nav stack
          backItem = _.find(apps, ['id', id]);
          backItem.back = function () {
            openApp(id);
          };
          upTo.push(backItem);

          // Open
          openApp(id);

          // Update paths
          updatePaths();
        })
        .on('dblclick', '[data-organization-id]', function () {
          var $el = $(this);
          var id = $el.data('organization-id');
          var backItem;

          // Store to nav stack
          backItem = _.find(organizations, ['id', id]);
          backItem.back = function () {
            openOrganization(id);
          };
          upTo.push(backItem);

          // Open
          openOrganization(id);

          // Update paths
          updatePaths();

        })
        .on('click', '[data-folder-id]', function () {
          var $el = $(this);
          // Removes any selected folder
          $('.folder').not(this).each(function(){
            $(this).removeClass('selected');
          });

          if ($el.hasClass('selected')) {
            $('.folder-selection span').html('Select a folder below');
            _this.folderConfig = {};
          } else {
            $('.folder-selection span').html('You have selected a folder');
            _this.folderConfig = { folderId: $el.data('folder-id') };
          }

          $el.toggleClass('selected');
        })
        .on('click', '[data-app-id]', function () {
          var $el = $(this);
          // Removes any selected folder
          $('.folder').not(this).each(function(){
            $(this).removeClass('selected');
          });

          if ($el.hasClass('selected')) {
            $('.folder-selection span').html('Select a folder below');
            _this.folderConfig = {};
          } else {
            $('.folder-selection span').html('You have selected a folder');
            _this.folderConfig = { appId: $el.data('app-id') };
          }

          $el.toggleClass('selected');
        })
        .on('click', '[data-organization-id]', function () {
          var $el = $(this);
          // Removes any selected folder
          $('.folder').not(this).each(function(){
            $(this).removeClass('selected');
          });

          if ($el.hasClass('selected')) {
            $('.folder-selection span').html('Select a folder below');
            _this.folderConfig = {};
          } else {
            $('.folder-selection span').html('You have selected a folder');
            _this.folderConfig = { organizationId: $el.data('organization-id') };
          }

          $el.toggleClass('selected');
        });

      $('.back-btn').click(function () {
        if (upTo.length === 1) {
          return;
        }

        upTo.pop();
        upTo[upTo.length-1].back();
        updatePaths();
      });

      $(document).on( "click", "#save-link", _this.saveDataDirectoryForm_ );
      $('#data-sources').on( 'change', $.proxy(_this.dataSourceChanged_,this) );
      // $('#data-source-tab').on( 'change', '#data-thumbnail-fields-select', _this.showThumbOptions_);
      $('.create-data-source').on('click', _this.createDataSource);
      $('#manage-data').on('click', _this.manageAppData);
      $('.nav.nav-stacked').on( 'click', 'li.disabled', function(){
        return false;
      } );

      $('.tab-content').on('change', '#data-tags-fields-select, #data-chronological-fields-select, #data-reverse-chronological-fields-select, #data-sources, #data-thumbnail-fields-select, #data-browse-configurations select', function () {
        updateSelectText($(this));
      });

      $(document).on('click', '.fullscreen-toggle', function(){
        _this.toggleFullscreen();
      })
    },

    saveDataDirectoryForm_: function(){
      _this.toggleFullscreen(false);

      var data = {
        source: $('#data-sources').val(),
        filter_fields: [],
        search_fields: [],
        data_fields: this.columns,
        field_types: {},
        folderConfig: _this.folderConfig,
        // show_subtitle: $("#show_subtitle").is(':checked'),
        // subtitle: $("#show_subtitle").is(':checked') ? $('#directory-browse-subtitle').val() : '',
        sort_order: $('[name=sort_order]:checked').val(),
        alphabetical_fields: $('#data-alphabetical-fields-tokenfield').val().split(',').map(function(x){
          return x.trim();
        }),
        chronological_field: $('#data-chronological-fields-select').val(),
        reverse_chronological_field: $('#data-reverse-chronological-fields-select').val(),
        // show_tags: $("#show_tags").is(':checked'),
        // tags_field: $("#show_tags").is(':checked') ? $('#data-tags-fields-select').val() : '',
        // thumbnail_field: $('#data-thumbnail-fields-select').val(),
        // show_thumb_list: ($('[name=enable_thumb_list]:checked').val() === "show" ? true : false),
        // show_thumb_detail: ($('[name=enable_thumb_details]:checked').val() === "show" ? true : false),
        enable_live_data: ($('#enable_live_data:checked').val() === "on" ? true : false),
        listviewTemplate: _this.listviewEditor.getValue(),
        detailviewTemplate: _this.detailviewEditor.getValue(),
        customCss: _this.customCssEditor.getValue(),
        customJs: _this.customJsEditor.getValue()
      };

      $('[data-type="filter"]:checked').each(function(){
        data.filter_fields.push( $(this).data('field') );
      });

      $('[data-type="search"]:checked').each(function(){
        data.search_fields.push( $(this).data('field') );
      });

      $('[data-type="type"]').each(function(){
        data.field_types[$(this).data('field')] = $(this).find('select').val();
      });
      data.field_types = JSON.stringify(data.field_types);

      data.rows = this.rows;

      this.directoryConfig = data;
    },

    dataSourceChanged_: function(e){
      if ( _this.source === '' || confirm('Are you sure you want to change the data source? This will reset your previous configuration for the directory.') ) {
        $('.options').show();
        $('.nav-tabs li.disabled').removeClass('disabled');
        _this.parseSelectedTable( $(e.target).val(), true );
        _this.loadDataDirectoryForm();
      } else {
        _this.source;
      }
    },

    showThumbOptions_: function(e){
      if ( $(this).val() !== '' ) {
        $('.thumbs-options').addClass('show');
      } else {
        $('.thumbs-options.show').removeClass('show');
      }
    }

  };

  // Init
  init();

  return DataDirectoryForm;
})();

/***************  END: DataSelectForm  ***************/
/***************  END: DataSelectForm  ***************/
/***************  END: DataSelectForm  ***************/
