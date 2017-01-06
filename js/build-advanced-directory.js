/*****************  AdvancedDirectory  *****************/
/*****************  AdvancedDirectory  *****************/
/*****************  AdvancedDirectory  *****************/

var messageTimeout;
var loadingTimeout;
var messageDelay = 5000; // "Loading..." text delay to display
var loadingOverlayDelay = 1000; // Time it takes to display the loading overlay after a click
var date_filter; // Filter used before pick date range when filtering by a date type field


var AdvancedDirectory = function (config, container) {
  var _this = this;

  this.data = config.rows;

  // Custom event to fire before an entry is rendered in the detailed view.
  var flDirectoryBeforeInit = new CustomEvent(
    "flDirectoryBeforeInit",
    {
      bubbles: true,
      cancelable: true,
      detail: {
        context: this
      }
    }
  );
  document.dispatchEvent(flDirectoryBeforeInit);

  // Function to run before initialising the directory.
  if (typeof config.before_init === 'function') {
    this.data = config.before_init(JSON.parse(JSON.stringify(this.data)));
  }

  this.config = $.extend({
    sort_order : "original",
    alphabetical_field : "",
    label_template : "",
    data_fields : [],
    filter_fields : [],
    search_fields : [],
    field_types : "" // Formatted as a JSON string to avoid invalid key characters (e.g. "?'#") violating CodeIgniter security
  }, config);
  this.$container = $(container).parents('body');
  this.$listContainer = this.$container.find('.directory-entries');
  this.$searchResultsContainer = this.$container.find('.search-result');
  this.deviceIsTablet = ( window.innerWidth >= 640 );
  this.navHeight = $('.fl-viewport-header').height() || 0;
  this.searchBarHeight = this.$container.find('.directory-search').outerHeight();
  this.directoryMode = this.$container.find('.container-fluid').attr('data-mode');
  this.filterOverlay = null;
  this.entryOverlay = null;
  this.searchResultData = [];
  this.supportLiveSearch = this.data.length <= 500;
  this.liveSearchInterval = 200;
  this.currentEntry;

  var folderID = this.config.folderConfig;

  function initialize () {
    if (_this.data.length) {
      _this.initialiseHandlebars();
      _this.init();
      _this.attachObservers();
      _this.parseQueryVars();
    } else {
      _this.directoryNotConfigured();
    }
  }

  Fliplet.Media.Folders.get(folderID).then(function (response) {
    response.files.forEach(renderThumb);
    initialize();
  }, function onMediaFolderError(err) {
    console.error(err);
    initialize();
  });

  function renderThumb(file) {
    // Returns placeholder if no match
    _this.data.forEach(function(entry) {
      if (file.url.indexOf( entry[_this.config.thumbnail_field]) !== -1 && entry[_this.config.thumbnail_field].trim() !== '') {
        entry[_this.config.thumbnail_field] = file.url;
      }
    });
  }

  if ( typeof this.config.field_types === 'string' && this.config.field_types.length ) {
    this.config.field_types = JSON.parse(this.config.field_types);
  }

  return this;
};

AdvancedDirectory.prototype.initialiseHandlebars = function(){
  var _this = this;

  var lastAlphabetIndex = '';

  Handlebars.registerHelper('plaintext', function(key, obj){
    return $('<div></div>').html(obj[key]).text();
  });

  Handlebars.registerHelper('moment', function(key, format, obj){
    return moment(obj[key]).format(format);
  });

  Handlebars.registerHelper('alphabet_divider', function(){
    if (_this.config.sort_order !== 'alphabetical') return '';

    var entryTitleTemplate = Handlebars.compile( "{{["+_this.config.alphabetical_field+"]}}" );
    var firstCharacterOfTitle = entryTitleTemplate( this )[0].toString().toUpperCase();
    if ( "1234567890".indexOf(firstCharacterOfTitle) > -1 ) firstCharacterOfTitle = '#';
    if ( firstCharacterOfTitle !== lastAlphabetIndex ) {
      lastAlphabetIndex = firstCharacterOfTitle;
      return Fliplet.Widget.Templates['build.listViewDivider'](firstCharacterOfTitle);
    }
  });

  Handlebars.registerHelper('search_result_header', function( data ){
    var output = '';

    switch (data.type) {
      case 'filter':
        output += 'Filtered by ';
        output += '<strong>' + data.value + '</strong>';
        break;
      case 'search':
        output += 'Search results';
        break;
    }

    return output;
  });

  Handlebars.registerHelper('search_result_clear', function( data ){
    switch (data.type) {
      case 'filter':
        return 'Clear filter';
        break;
      case 'search':
        return 'Clear search results';
        break;
      default:
        return 'Clear result'
        break;
    }
  });

  Handlebars.registerHelper('tag_filters', function (tagsField, entry) {
    var tags = entry[tagsField];
    if (!tags) {
      return '';
    }

    var splitTags = tags.split(",");
    return new Handlebars.SafeString(
      splitTags.map(function (tag) {
        tag = tag.trim();
        if (tag !== '') {
          return '<a class="data-linked" data-type="filter-value-tag" data-value="' + tag + '" data-filter="' + tagsField + '" href="#">' + tag + '</a> ';
        }

        return '';
      }).join('<span class="tag-seperation">, </span>')
    );
  });

  Handlebars.registerPartial('directory_filter_values', Fliplet.Widget.Templates['build.advancedDirectoryFilterValues']);
};

AdvancedDirectory.prototype.init = function(){
  this.verifyConfig();
  this.renderListView();
  this.renderFilters();

  // Custom event to fire after the directory list is rendered.
  var flDirectoryListRendered = new CustomEvent(
    "flDirectoryListRendered",
    {
      bubbles: true,
      cancelable: true
    }
  );
  document.dispatchEvent(flDirectoryListRendered);
};

AdvancedDirectory.prototype.verifyFields = function(fieldConfig){
  if ( !this.config.hasOwnProperty(fieldConfig)
    || this.config[fieldConfig].constructor.name !== 'Array' ) return;

  var arr = [];
  for ( var i = 0, l = this.config[fieldConfig].length; i < l; i++ ) {
    if ( this.config.data_fields.indexOf( this.config[fieldConfig][i] ) > -1 ) {
      arr.push( this.config[fieldConfig][i] );
    }
  }
  this.config[fieldConfig] = arr;
};

AdvancedDirectory.prototype.verifyConfig = function(){
  this.verifyFields('filter_fields');
  this.verifyFields('search_fields');
  this.verifyFields('detail_fields');
};

AdvancedDirectory.prototype.renderListView = function(){
  var _this = this;
  var listData = [];

  switch (this.config.sort_order) {
    case 'alphabetical':
      listData = this.data.sort( function(a,b){
        var attr = _this.config.alphabetical_field;
        if (!a[attr] || !b[attr]) {
          return 0;
        }

        if (a[attr].toString().toUpperCase() < b[attr].toString().toUpperCase())
          return -1;
        if (a[attr].toString().toUpperCase() > b[attr].toString().toUpperCase())
          return 1;
        return 0;
      } );
      this.$container.find('.directory-entries').addClass('list-index-enabled');
      break;
    case 'chronological':
      listData = this.data.sort(function (left, right) {
        var field = _this.config.chronological_field;
        return moment.utc(left[field]).diff(moment.utc(right[field]));
      });
      break;
    case 'reverse_chronological':
    listData = this.data.sort(function (left, right) {
      var field = _this.config.reverse_chronological_field;
      return moment.utc(right[field]).diff(moment.utc(left[field]));
    });
      break;
    case 'original':
    default:
      listData = this.data;
      break;
  }
  this.data = listData;

  var listViewTemplate = this.config.listviewTemplate
                            ? Handlebars.compile(this.config.listviewTemplate)
                            : Fliplet.Widget.Templates['build.listView'];
  var listViewHTML = listViewTemplate(this.data);

  this.$listContainer
    .html(listViewHTML)
    .find('.data-linked:not([data-type])')
      .attr('data-type', 'entry');
  if ( this.config.sort_order === 'alphabetical' ) {
    this.renderIndexList();
  }
};

AdvancedDirectory.prototype.renderIndexList = function(){
  if ( !this.config.sort_order !== 'alphabetical' ) return;

  var $listIndex = this.$container.find('.directory-entries + .list-index');
  $listIndex.html('');
  this.$container.find('.directory-entries .divider').each(function(){
    var letter = $(this).text();
    $listIndex.append('<span data-letter="' + letter + '">' + letter + '</span>');
  });

  $(document).on(  'touchstart mousedown', '.list-index span', $.proxy( this.listIndexTouchStart, this ) )
    .on( 'touchmove  mousemove', '.list-index span', $.proxy( this.listIndexTouchMove , this ) )
    .on( 'touchend   mouseup'  , '.list-index span', $.proxy( this.listIndexTouchEnd  , this ) );
};

AdvancedDirectory.prototype.scrollToLetter = function(letter){
  var scrollToEl = $('.divider[data-letter="' + letter + '"]');
  if (!scrollToEl.length) return;
  var scrollTop = scrollToEl.offset().top + this.$container.find('.directory-entries').scrollTop() - this.searchBarHeight - this.navHeight;
  this.$container.find('.directory-entries')[0].scrollTop = scrollTop;
  this.flViewportRedraw();
};

AdvancedDirectory.prototype.listIndexTouchStart = function(e){
  e.preventDefault();
  this.listIndexIsTouched = true;

  var $target = $(e.target);
  this.scrollToLetter($target.data('letter'));
};

AdvancedDirectory.prototype.listIndexTouchMove = function(e){
  if (!this.listIndexIsTouched) return;
  e.preventDefault();
  var $target;
  if (e.type === 'mousemove') {
    $target = $(e.target);
  } else {
    e = e.originalEvent;
    $target = $(document.elementFromPoint(e.touches[0].pageX, e.touches[0].pageY));
  }

  this.scrollToLetter($target.data('letter'));
};

AdvancedDirectory.prototype.listIndexTouchEnd = function(e){
  this.listIndexIsTouched = false;
};

AdvancedDirectory.prototype.renderFilters = function(){

  if ( this.config.filter_fields.length ) {
    // 1 or more filter fields configured
    var directoryFilterHTML = Fliplet.Widget.Templates['build.advancedDirectoryFilters'](this.config.filter_fields);
    this.$container.find('.filter-list').html(directoryFilterHTML);
  } else {
    // No filter field configured
    this.$container.find('.search').attr('placeholder','Search');
    this.$container.find('.filters').remove();
  }
  this.$container.find('.search').attr('disabled',false);

};

AdvancedDirectory.prototype.renderFilterValues = function( filter, inOverlay ){
  if ( typeof inOverlay == 'undefined' ) inOverlay = false;

  var _this = this,
    tags_field = this.config.tags_field ? this.config.tags_field : '',
    values = [],
    data;

  // Check if it's the tag filter
  if (tags_field === filter) {
    this.data.forEach(function (record) {
      var entryTags = record[tags_field].split(',');
      entryTags.forEach(function(tag) {
        tag = tag.trim();
        if (tag !== "" && values.indexOf(tag) === -1) {
          values.push(tag);
        }
      });
    });

    values = values.sort(sortAlphabetically);
  } else if (_this.config.field_types[filter] === 'date') {
    var start_date = new Date($('.start_date').datepicker("getDate"))
    var end_date = new Date($('.finish_date').datepicker("getDate"))
        this.data.forEach(function(value, index) {
          var entryDate = new Date(value[filter]);
           if (entryDate >= start_date && entryDate <= end_date) {
             values.push(value[filter]);
           }
        });
  } else {
    values = this.getFilterValues( filter );
  }

  data = { filter : filter.trim(), values : values, dataType: (tags_field === filter) ? 'filter-value-tag' : 'filter-value'};

  if ( inOverlay ) {
    var overlayContent = Fliplet.Widget.Templates['build.advancedDirectoryFilterOverlay'](data);
    this.filterOverlay = new Fliplet.Utils.Overlay(overlayContent,{
      title: 'Filter by ' + filter,
      classes: 'overlay-directory',
      showOnInit: true,
      closeText: '<i class="fa fa-chevron-left"></i>',
      entranceAnim: 'slideInRight',
      exitAnim: 'slideOutRight',
      closeText: 'Cancel',
      afterClose: function(){
        _this.filterOverlay = null;
      }
    });
  } else {
    var advancedDirectoryFilterValuesHTML = Fliplet.Widget.Templates['build.advancedDirectoryFilterValues'](data);
    this.$container.find('.filter-value-list').html(advancedDirectoryFilterValuesHTML);
    this.$container.find('.filter-selected').html(filter);
    this.$container.find('.directory-filters')[0].scrollTop = 0;
    this.switchMode('filter-values');
  }
};

AdvancedDirectory.prototype.switchMode = function(mode){
  /*
   * Modes: default, search, search-result, filter-values
   */

  var validModes = ['default', 'search', 'search-result', 'search-result-entry', 'filter-values'];
  mode = mode.trim().toLowerCase();

  if ( validModes.indexOf(mode) < 0 ) {
    mode = 'default';
  }

  this.$container.find('.container-fluid').attr('data-mode',mode);

  if ( mode === 'search' ) {
    this.searchResultData = [];
    if ( this.config.filter_fields.length === 1 ) {
      this.renderFilterValues( this.config.filter_fields[0] );
    }
  }

  this.resizeSearch();
  this.directoryMode = mode;

  this.flViewportRedraw();
};

AdvancedDirectory.prototype.isMode = function(mode){
  return this.directoryMode === mode;
};

AdvancedDirectory.prototype.attachObservers = function(){
  var _this = this;

  _this.data.forEach(function(entry, i) {
    var imgURL = entry[_this.config.thumbnail_field];
    if ( /^(f|ht)tps?:\/\//i.test(imgURL) ) {

      var img = new Image();

      img.addEventListener('load', function(){
        $('.list-default li:eq('+i+') .list-image').css('background-image', 'url(' + this.src + ')');
      }, false);

      img.src = imgURL;
    }
  });

  this.$container.on( 'click', '.data-linked', $.proxy( this.dataLinkClicked, this ) );
  $(window).on( 'resize', function(){
    _this.deviceIsTablet = window.innerWidth >= 640;
    _this.resizeSearch();
    _this.navHeight = $('.fl-viewport-header').height() || 0;
    _this.searchBarHeight = _this.$container.find('.directory-search').outerHeight();
  } );
  this.$container.find('.directory-search').on( 'click', function(){
    // Analytics - Track Event
    Fliplet.Analytics.trackEvent({category: 'directory', action: 'search'});

    _this.$container.find('.search').trigger( 'focus' );
  } ).on( 'submit', function(e){
    e.preventDefault();
    _this.renderSearchResult( {
      type: 'search',
      value: _this.$container.find('.search').val()
    } );
  } );
  this.$container.on( 'focus', '.search', $.proxy( this.activateSearch, this ) );
  if ( this.supportLiveSearch ) {
    this.$container.on( 'keydown paste input', '.search', function(e){
      _this.renderLiveSearch($(this).val());
    } );
  }
  $(this.$container).on( 'click', '.search-cancel', function(){
    _this.$container.find('.search').val('');
    _this.deactivateSearch();
    return false;
  } );
  $(this.$container).on( 'click', '.search-result-clear', function(){
    _this.$container.find('.search').val('');
    _this.switchMode('search');
    return false;
  } );

  $(this.$container).on( 'touchmove', '.search-result ul, .filters', function(){
    _this.$container.find('.search').trigger('blur');
  } );

  document.addEventListener("flDirectoryEntryBeforeRender", function () {
    _this.disableClicks();
    _this.removeLoading();
    loadingTimeout = setTimeout(function () {
      _this.addLoading();
    }, loadingOverlayDelay);
  }, false);

  document.addEventListener("flDirectoryEntryAfterRender", function () {
    _this.removeLoading();
  }, false);

  this.$container.on( 'click', '.date_cancel, .overlay-date-range .closeButton', function(){
    $('.overlay-date-range').removeClass('active');
  });
  this.$container.on( 'click', '.date_go', function(){
    $('.overlay-date-range').removeClass('active');
    _this.renderFilterValues(date_filter, !_this.deviceIsTablet)
  });
};

AdvancedDirectory.prototype.activateSearch = function(){
  if ( this.isMode('default') ) {
    this.$container.find('.filter-selected').html('');
  }
  if ( !this.isMode('search') && !this.isMode('filter-values') && !this.isMode('search-result') && !this.isMode('search-result-entry') ) {
    this.switchMode('search');
  }

  this.flViewportRedraw();
};

AdvancedDirectory.prototype.deactivateSearch = function(){
  this.$container.find('.search').trigger('blur');
  if ( this.deviceIsTablet && this.isMode('search-result-entry') ) {
    this.openDataEntry(0, 'entry', false);
  }
  this.switchMode('default');

  this.flViewportRedraw();
};

AdvancedDirectory.prototype.resizeSearch = function(){
  var _this = this;
  setTimeout(function(){
    if ( _this.isMode('search') || _this.isMode('filter-values') || _this.isMode('search-result') || _this.isMode('search-result-entry') ) {
      _this.$container.find('.search').css( 'width', _this.$container.find('.directory-search').width() - _this.$container.find('.search-cancel').outerWidth() + 8 );
    } else {
      _this.$container.find('.search').css( 'width', '' );
    }
  }, 0);
};

AdvancedDirectory.prototype.filterOverlayIsActive = function(){
  return this.filterOverlay instanceof Overlay;
};

AdvancedDirectory.prototype.entryOverlayIsActive = function(){
  return this.entryOverlay instanceof Overlay;
};

AdvancedDirectory.prototype.dataLinkClicked = function(e){

  this.flViewportRedraw();

  var _this = this;
  e.preventDefault();

  // Date
  if (_this.config.field_types[e.currentTarget.dataset.filter] === 'date' && e.currentTarget.dataset.type === 'filter') {
    date_filter = e.currentTarget.dataset.filter;
    $('.date-picker').datepicker();
    $('.overlay-date-range').addClass('active');
    return;
  }

  switch (e.currentTarget.dataset.type) {
    case 'filter-tag':
    case 'filter':
      var filter = e.currentTarget.dataset.filter;
      this.renderFilterValues( filter, !this.deviceIsTablet );
      break;
    case 'filter-value-tag':
      e.stopPropagation();
    case 'filter-value':
      this.renderSearchResult( {
        type: e.currentTarget.dataset.type,
        field: e.currentTarget.dataset.filter,
        value: e.currentTarget.dataset.value
      }, function(){
        if ( _this.filterOverlayIsActive() ) {
          _this.filterOverlay.close();
        }
        if ( _this.entryOverlayIsActive() ) {
          _this.entryOverlay.close();
        }
      } );
      break;
    case 'entry':
    case 'search-result-entry':
    default:
      this.openDataEntry(e.currentTarget.dataset.index, e.currentTarget.dataset.type);
      break;
  }
};

AdvancedDirectory.prototype.openDataEntry = function(entryIndex, type, trackEvent){
  var _this = this;

  if ( typeof type === 'undefined' ) type = 'entry';
  if ( typeof trackEvent === 'undefined' ) trackEvent = true;

  var $container = this.$listContainer;
  if (type === 'search-result-entry') {
    $container = this.$searchResultsContainer;
  }
  var $listEntry = this.$container.find('[data-type="' + type + '"][data-index="' + entryIndex + '"]');

  var detailData = {
    has_thumbnail : this.config.show_thumb_detail ? this.config.show_thumb_detail : false,
    fields : [],
    dataSourceEntryId: _this.data[entryIndex]['dataSourceEntryId'] || ''
  };

  // @TODO: Review Thumbnail-related code
  // if (typeof this.config.thumbnail_field !== 'undefined' && this.config.thumbnail_field.trim() !== '') {
  //   detailData['has_thumbnail'] = (typeof this.config.thumbnail_field !== 'undefined' && this.config.thumbnail_field.trim() !== '' && this.config.show_thumb_detail ? this.config.show_thumb_detail : false );
  //   detailData['thumbnail'] = (type == 'search-result-entry') ? this.searchResultData[entryIndex][this.config.thumbnail_field] : this.data[entryIndex][this.config.thumbnail_field];
  // }

  // for (var fieldIndex = 0, l = this.config.detail_fields.length; fieldIndex < l; fieldIndex++) {
  //   var fieldObj = this.getEntryField( entryIndex, fieldIndex, type );
  //   if (fieldObj.value.length) {
  //     detailData.fields.push( fieldObj );
  //   }
  // }

  var detailViewTemplate = this.config.detailviewTemplate
                            ? Handlebars.compile(this.config.detailviewTemplate)
                            : Fliplet.Widget.Templates['build.detailView'];
  var data = (type === 'search-result-entry')
                ? _this.searchResultData[entryIndex]
                : _this.data[entryIndex];
  var detailViewHTML = detailViewTemplate(data);

  if ( type === 'search-result-entry' ) {
    this.switchMode('search-result-entry');
  }

  // Custom event to fire before an entry is rendered in the detailed view.
  var flDirectoryEntryBeforeRender = new CustomEvent(
    "flDirectoryEntryBeforeRender",
    {
      bubbles: true,
      cancelable: true,
      detail: {
        detailData: detailData
      }
    }
  );
  document.dispatchEvent(flDirectoryEntryBeforeRender);

  var after_render = function() {
    // Link taps listeners
    $(".directory-detail-value a").not(".data-linked").on("click", function(e){
      if ($(e.target).attr("href").indexOf("mailto") === 0) {
        // Analytics - Track Event
        Fliplet.Analytics.trackEvent({ category: 'directory', action: 'entry_email', title: '' });

      } else if ($(e.target).attr("href").indexOf("tel") === 0) {
        // Analytics - Track Event
        Fliplet.Analytics.trackEvent({ category: 'directory', action: 'entry_phone', title: '' });
      } else {
        // Analytics - Track Event
        Fliplet.Analytics.trackEvent({ category: 'directory', action: 'entry_email', title: '' });
      }
    });
    $(".directory-detail-value a.data-linked").on("click", function(e){
      var filterType = (typeof $(e.target).data("type") !== "undefined") ? $(e.target).data("type") : "";
      var filterValue = (typeof $(e.target).data("value") !== "undefined") ? $(e.target).data("value") : "";

      // Analytics - Track Event
      Fliplet.Analytics.trackEvent({ category: 'directory', action: 'entry_email', title: filterType + ": " + filterValue });
    });

    // Custom event to fire after an entry is rendered in the detailed view.
    var flDirectoryEntryAfterRender = new CustomEvent(
      "flDirectoryEntryAfterRender",
      {
        bubbles: true,
        cancelable: true,
        detail: {
          detailData: detailData
        }
      }
    );
    document.dispatchEvent(flDirectoryEntryAfterRender);
  };

  // Function to run before rendering the entry
  if (typeof this.config.before_render_entry === 'function') {
    detailViewHTML = this.config.before_render_entry(detailData, detailViewHTML);
  }

  if ( this.deviceIsTablet ) {
    this.$container.find('.directory-details .directory-details-content').html(detailViewHTML);
    after_render();
    setTimeout(function(){
      _this.$container.find('li[data-type=' + type + '].active').removeClass('active');
      $listEntry.addClass('active');
    },0);
  } else {
    this.entryOverlay = new Fliplet.Utils.Overlay( detailViewHTML, {
      showOnInit : true,
      classes: 'overlay-directory',
      closeText: '<i class="fa fa-chevron-left"></i>',
      entranceAnim: 'slideInRight',
      exitAnim: 'slideOutRight',
      afterOpen: after_render,
      afterClose: function(){
        _this.entryOverlay = null;
        _this.currentEntry = null;
      }
    });
  }

  _this.currentEntry = {
    row: _this.data[entryIndex],
    detailData: detailData
  };

  // Analytics - Track Event
  if (trackEvent) {
    Fliplet.Analytics.trackEvent({ category: 'directory', action: 'entry_open', title: '' });
  }
};

AdvancedDirectory.prototype.disableClicks = function () {
  this.$container.find('.directory-list, .directory-details').addClass('disabled'); // Disables List
};

// Function that will fade in the loading overlay
AdvancedDirectory.prototype.addLoading = function () {
  // The following adds Loading Overlay to a specific area depending on the device width
  if (this.deviceIsTablet) {
    this.$container.find('.directory-details').find('.directory-loading').fadeIn(400);
  } else {
    this.$container.find('.directory-list').find('.directory-loading').fadeIn(400);
  }

  // Delay to display the "Loading..." text
  messageTimeout = setTimeout(function () {
    $('.directory-loading .loading-text').hide().text("Loading...").fadeIn(250);
  }, messageDelay);
};

// Function that will remove the loading overlay and enable clicks
AdvancedDirectory.prototype.removeLoading = function () {
  clearTimeout(loadingTimeout); // Clears delay loading overlay
  clearTimeout(messageTimeout); // Clears delay for text to appear
  // The following removes Loading Overlay from a specific area depending on the device width
  if (this.deviceIsTablet) {
    this.$container.find('.directory-details').find('.directory-loading').fadeOut(400);
  } else {
    this.$container.find('.directory-list').find('.directory-loading').fadeOut(400);
  }

  this.$container.find('.directory-list, .directory-details').removeClass('disabled'); // Enables List
  $('.directory-loading .loading-text').text(""); // Resets Loading text
};

AdvancedDirectory.prototype.getEntryField = function( entryIndex, fieldIndex, type ){
  if ( typeof type === 'undefined' ) type = 'entry';

  var output = {};
  var label = this.config.detail_fields[fieldIndex];
  var value = (type == 'search-result-entry') ? this.searchResultData[entryIndex][label] : this.data[entryIndex][label];
  var fieldType = 'text';
  var valueHTML = '';

  if (typeof value === 'undefined') {
    return {
      'label' : label,
      'value' : ''
    }
  }

  if ( this.config.hasOwnProperty('field_types') && this.config.field_types.hasOwnProperty(label) ) {
    fieldType = this.config.field_types[label];
  }

  if ( fieldType === 'text' && this.config.filter_fields.indexOf(label) > -1 ) {
    fieldType = 'filter';
    value = {
      filter : label,
      value : value
    };
  }

  if ( fieldType === 'accordion' ) {
    fieldType = 'accordion';
    value = {
      id : fieldIndex,
      value : value,
      label : label
    };
  }

  var valueHTML;
  if ( (typeof value === 'object' && value && value.value && value.value.length) || (typeof value === 'string' && value.length) ) {
    if (this.config.show_tags && this.config.tags_field === label && fieldType === 'filter') {
      valueHTML = value.value.split(",").map(function (tag) {
        tag = tag.trim();
        if (tag !== '') {
          return '<a class="data-linked" data-type="filter-value-tag" data-value="'+tag+'" data-filter="'+value.filter+'" href="#">'+tag+'</a>';
        }

        return '';
      }).join(', ');
      valueHTML = '<div class="list-tags">' + valueHTML + '</div>';
    } else {
      valueHTML = Fliplet.Widget.Templates['build.directoryFieldType' + fieldType](value);
    }
  } else {
    valueHTML = '';
  }

  return {
    'label' : label,
    'value' : valueHTML
  }
};

AdvancedDirectory.prototype.renderLiveSearch = function( value ) {

  this.flViewportRedraw();

  var _this = this;
  if (this.liveSearchTimeout) {
    clearTimeout(this.liveSearchTimeout);
  }
  this.liveSearchTimeout = setTimeout(function(){
    _this.renderSearchResult( {
      type: 'search',
      value: value
    } );
  }, this.liveSearchInterval);

};

AdvancedDirectory.prototype.renderSearchResult = function( options, callback ){

  this.flViewportRedraw();

  // Return all results of search term is empty
  if (!options.value.length) {
    this.switchMode('search');
    return;
  };

  this.switchMode('search-result');
  var _this = this;
  var data = {
    has_thumbnail: this.config.show_thumb_list ? this.config.show_thumb_list : false,
    show_subtitle: this.config.show_subtitle ? this.config.show_subtitle : false,
    show_tags: this.config.show_tags ? this.config.show_tags : false,
    type: options.type,
    result: []
  };

  switch (options.type) {
    case 'filter':
      data.type = 'filter';
      data.field = options.field;
      data.value = options.value;
      data.result = this.filter( options.field, options.value );
      break;
    case 'filter-value-tag':
      var filterByTag = function(value) {
        var splitTags = value[options.field].split(',');
        for (var i = 0; i < splitTags.length; i++) {
          if (splitTags[i].trim() === options.value.trim()) {
            return true;
          }
        }

        return false;
      };

      data.type = 'filter';
      data.field = options.field;
      data.value = options.value;
      data.result = this.data.filter(filterByTag);

      // Analytics - Track Event
      Fliplet.Analytics.trackEvent({ category: 'directory', action: 'list_tag_filter', title: options.type + ": " + options.value });

      break;
    case 'search':
      data.type = 'search';
    case 'filter-value':
      data.type = 'filter';
    default:
      data.value = options.value;
      data.result = this.search( options.value );

      // Analytics - Track Event
      Fliplet.Analytics.trackEvent({ category: 'directory', action: 'filter', title: options.type + ": " + options.value });

      break;
  }

  this.searchResultData = data.result;
  var advancedDirectorySearchResultHeaderHTML = Fliplet.Widget.Templates['build.advancedDirectorySearchResultHeader'](data);
  var advancedDirectorySearchResultHTML = Fliplet.Widget.Templates['build.listView'](data.result);
  this.$searchResultsContainer
    .html(advancedDirectorySearchResultHeaderHTML)
    .append(advancedDirectorySearchResultHTML)
    .find('.data-linked[data-type="entry"]')
      .attr('data-type', 'search-result-entry')
    .end()
    .scrollTop(0);
  if (typeof callback === 'function') setTimeout(callback, 0);
};

AdvancedDirectory.prototype.search = function( value ) {
  var path = ':root > :has(';
  var searchFields = this.config.search_fields;

  for (var i = 0, l = searchFields.length; i < l; i++) {
    if (i > 0) path += ' , ';
    path += '."' + searchFields[i] + '":contains("' + value + '")';
  }
  path += ')';

  return JSONSelect.match( path, this.data );
}

AdvancedDirectory.prototype.filter = function( field, value ) {
  var path = ':root > :has(."' + field + '":val("' + value + '"))';

  return JSONSelect.match( path, this.data );
}

function sortAlphabetically(a,b) {
  // Sort by alphabet
  if (a.toString().toUpperCase() < b.toString().toUpperCase())
    return -1;
  if (a.toString().toUpperCase() > b.toString().toUpperCase())
    return 1;
  return 0;
}

AdvancedDirectory.prototype.getFilterValues = function( field ) {
  var path = '."'+field+'"';
  var values = JSONSelect.match( path, this.data );

  return values.sort(sortAlphabetically).reduce( function(a,b){
    // Remove duplicates
    if (a.indexOf(b) < 0 && b.trim() !== '' ) a.push(b);
    return a;
  }, [] );
};

AdvancedDirectory.prototype.parseQueryVars = function(){
  var query = Fliplet.Navigate.query;
  if (query.action) {
    switch (query.action) {
      case 'search':
        if (query.value) {
          this.presetSearch(query.value);
        }
        break;
      case 'filter':
        if (query.field && query.value) {
          this.presetFilter(query.field, query.value);
        }
        break;
      case 'open':
        break;
    }
  } else if ( this.deviceIsTablet ) {
    // Open the first entry if on a tablet
    this.openDataEntry(0, 'entry', false);
  }
};

AdvancedDirectory.prototype.presetSearch = function( value ){
  this.$container.find('.search').val( value );
  this.renderSearchResult( {
    type : 'search',
    value : value
  } );
  if (this.searchResultData.length === 1) {
    this.openDataEntry(0,'search-result-entry');
    if (!this.deviceIsTablet) {
      this.switchMode('default');
    }
  }
  this.flViewportRedraw();
};

AdvancedDirectory.prototype.presetFilter = function( field, value ){
  this.renderSearchResult( {
    type : 'filter',
    field : field,
    value : value
  } );
  this.flViewportRedraw();
};

AdvancedDirectory.prototype.directoryNotConfigured = function(){
  this.$container.find('.directory-entries').addClass('not-configured').html('No data is found for the directory');
};

AdvancedDirectory.prototype.flViewportRedraw = function(){
  $(document.body).css('-webkit-transform', 'scale(1)');
  setTimeout(function(){
    $(document.body).css('-webkit-transform', '');
  }, 0);
};

/***************  END: AdvancedDirectory  ***************/
/***************  END: AdvancedDirectory  ***************/
/***************  END: AdvancedDirectory  ***************/
