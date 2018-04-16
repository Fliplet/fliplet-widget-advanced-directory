/*****************  AdvancedDirectory  *****************/
/*****************  AdvancedDirectory  *****************/
/*****************  AdvancedDirectory  *****************/

var messageTimeout;
var loadingTimeout;
var messageDelay = 5000; // 'Loading...' text delay to display
var loadingOverlayDelay = 1000; // Time it takes to display the loading overlay after a click
var date_filter; // Filter used before pick date range when filtering by a date type field

function html_entity_decode(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function splitByCommas(str) {
  if (Array.isArray(str)) {
    return str;
  }

  if (typeof str !== 'string') {
    return [str];
  }

  // Split a string by commas but ignore commas within double-quotes using Javascript
  // https://stackoverflow.com/questions/11456850/split-a-string-by-commas-but-ignore-commas-within-double-quotes-using-javascript
  var regexp = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
  var arr = [];
  var res;
  while ((res = regexp.exec(str)) !== null) {
    arr.push(res[0].replace(/(?:^")|(?:"$)/g, '').trim());
  }
  return arr;
}

var AdvancedDirectory = function (config, container) {
  var _this = this;

  this.config = $.extend({
    sort_order : 'original',
    alphabetical_field : '',
    alphabetical_fields : [],
    label_template : '',
    data_fields : [],
    filter_fields : [],
    search_fields : [],
    field_types : '', // Formatted as a JSON string to avoid invalid key characters (e.g. "?'#") violating CodeIgniter security
    search_only : false,
    mobile_mode : false,
    directory_enabled: true
  }, config);
  this.data = this.config.rows;
  delete this.config.rows;

  this.$container = $(container).parents('body');
  this.$listContainer = this.$container.find('.directory-entries');
  this.$searchResultsContainer = this.$container.find('.search-result');
  this.deviceIsTablet = (window.innerWidth >= 640 && window.innerHeight >= 640);
  this.navHeight = $('.fl-viewport-header').height() || 0;
  this.searchBarHeight = this.$container.find('.directory-search').outerHeight();
  this.directoryMode = this.$container.find('.container-fluid').attr('data-mode');
  this.filterOverlay = null;
  this.entryOverlay = null;
  this.searchResultData = [];
  this.liveSearchInterval = 200;
  this.currentEntry;

  this.checkMobileMode();

  // Custom event to fire before the directory is initialised
  this.trigger('flDirectoryBeforeInit');
  this.supportLiveSearch = this.data.length <= 500;

  this.checkMobileMode();

  if ( typeof this.config.field_types === 'string' && this.config.field_types.length ) {
    this.config.field_types = JSON.parse(this.config.field_types);
  }

  _this.init();
  if (!this.config.directory_enabled) return;
  _this.refreshDirectory();

  var folderID = this.config.folderConfig;
  Fliplet.Media.Folders.get(folderID).then(function (response) {
    response.files.forEach( function renderThumb (file) {
        // Returns placeholder if no match
        _this.data.forEach(function(entry) {
          if (file.name.indexOf( entry[_this.config.thumbnail_field]) !== -1 && entry[_this.config.thumbnail_field].trim() !== '') {
            entry[_this.config.thumbnail_field] = file.url;
          }
        });
      }
    );
  }, function onMediaFolderError(err) {
    console.error(err);
  });

  // Custom event to fire after the directory is initialised
  this.trigger('flDirectoryAfterInit');

  return this;
};

AdvancedDirectory.prototype.trigger = function(event, detail){
  var detail = $.extend({
    context: this
  }, detail || {});
  try {
    var customEvent = new CustomEvent(
      event,
      {
        bubbles: true,
        cancelable: true,
        detail: detail
      }
    );
    document.dispatchEvent(customEvent);
  } catch (e) {
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(event, true, true, detail);
    document.dispatchEvent(evt);
  }
};

AdvancedDirectory.prototype.getConfig = function(key){
  if (key.length && this.config.hasOwnProperty(key)) {
    return this.config[key];
  }
};

AdvancedDirectory.prototype.setConfig = function(key, value){
  if (key.length) {
    this.config[key] = value;
  }
};

AdvancedDirectory.prototype.initialiseHandlebars = function(){
  var _this = this;

  var lastAlphabetIndex = '';

  Handlebars.registerHelper('plaintext', function(key, obj){
    return $('<div></div>').html(obj[key]).text();
  });

  Handlebars.registerHelper('moment', function(key, format, obj){
    return moment(key).format(format);
  });

  Handlebars.registerHelper('alphabet_divider', function(){
    if (_this.config.sort_order !== 'alphabetical') {
      return '';
    }

    if (!_this.config.alphabetical_fields.length) {
      return '';
    }

    var field = _this.config.alphabetical_fields[0];

    var entryTitleTemplate = Handlebars.compile( '{{['+field+']}}' );
    var firstCharacterOfTitle;

    if (!entryTitleTemplate(this).length) {
      // Empty values are sorted with all other non-alphbetical values
      firstCharacterOfTitle = '#';
    } else {
      firstCharacterOfTitle = entryTitleTemplate(this)[0].toString().toUpperCase();

      if (!firstCharacterOfTitle.match(/[A-Za-z]/)) {
        firstCharacterOfTitle = '#';
      }
    }

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

    var splitTags = splitByCommas(tags);
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

AdvancedDirectory.prototype.alphaSortByAttr = function (data, attr) {
  if (!Array.isArray(data)) {
    return data;
  }
  attr = attr || '';
  return _.sortBy(data, function (obj) {
      obj[attr] = obj[attr] || '';
      var value = obj[attr].toString().toUpperCase();
      // Push all non-alphabetical values to after the 'z' character
      // based on Unicode values
      return value.match(/[A-Za-z]/)
        ? value
        : '{' + value;
  });
}

AdvancedDirectory.prototype.init = function() {
  this.initialiseHandlebars();
  this.attachObservers();
}

AdvancedDirectory.prototype.refreshDirectory = function() {
  this.checkMobileMode();

  if (!this.data.length) {
    return this.directoryNotConfigured();
  }

  this.renderDirectory();
  this.parseQueryVars();
}

AdvancedDirectory.prototype.renderDirectory = function(){
  var _this = this;

  this.verifyConfig();
  this.renderFilters();
  this.sortEntries();

  this.$container.find('.directory-entries').removeClass('not-configured');
  if (this.config.search_only) {
    this.activateSearch();
    setTimeout(function(){
      // _this.$container.find('.search').trigger( 'focus' );
    }, 0);
    return;
  }
  this.renderListView();

  // Custom event to fire after the directory list is rendered.
  this.trigger('flDirectoryListRendered');
};

AdvancedDirectory.prototype.verifyFields = function(fieldConfig){
  if ( !this.config.hasOwnProperty(fieldConfig)
    || !Array.isArray(this.config[fieldConfig]) ) return;

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

AdvancedDirectory.prototype.sortEntries = function(){
  var _this = this;
  listData = JSON.parse(JSON.stringify(this.data));
  switch (this.config.sort_order) {
    case 'alphabetical':
      if (this.config.alphabetical_field === '' && !this.config.alphabetical_fields.length) {
        break;
      }
      if (!this.config.alphabetical_fields.length) {
        this.config.alphabetical_fields = [this.config.alphabetical_field];
      }
      if (this.config.alphabetical_fields.length === 1) {
        this.$container.find('.directory-entries').addClass('list-index-enabled');
      }
      for (var i = this.config.alphabetical_fields.length-1; i >= 0; i--) {
        listData = this.alphaSortByAttr(listData, this.config.alphabetical_fields[i]);
      }
      break;
    case 'chronological':
      if (!this.config.chronological_field) {
        break;
      }
      listData = listData.sort(function (left, right) {
        var field = _this.config.chronological_field;
        return moment.utc(left[field]).diff(moment.utc(right[field]));
      });
      break;
    case 'reverse_chronological':
      if (!this.config.reverse_chronological_field) {
        break;
      }
      listData = listData.sort(function (left, right) {
        var field = _this.config.reverse_chronological_field;
        return moment.utc(right[field]).diff(moment.utc(left[field]));
      });
      break;
    case 'original':
    default:
      break;
  }
  this.data = listData;
};

AdvancedDirectory.prototype.renderListView = function(){
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

AdvancedDirectory.prototype.placeIndexList = function () {
  var $listIndex = this.$container.find('.directory-entries + .list-index');
  $listIndex.css('left', Math.round($('.directory-entries ul').width()));
};

AdvancedDirectory.prototype.renderIndexList = function(){
  if (!this.config.sort_order) return;

  var $listIndex = this.$container.find('.directory-entries + .list-index');
  $listIndex.html('');
  this.$container.find('.directory-entries .divider').each(function() {
    var letter = $(this).text();
    $listIndex.append('<span data-letter="' + letter + '">' + letter + '</span>');
  });

  $(document).on('touchstart mousedown', '.list-index span', $.proxy(this.listIndexTouchStart, this))
    .on('touchmove  mousemove', '.list-index span', $.proxy(this.listIndexTouchMove, this))
    .on('touchend   mouseup', '.list-index span', $.proxy(this.listIndexTouchEnd, this));

  this.placeIndexList();
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
      if (record[tags_field]) {
        var entryTags = splitByCommas(record[tags_field]);
        entryTags.forEach(function(tag) {
          tag = tag.trim();
          if (tag !== '' && values.indexOf(tag) === -1) {
            values.push(tag);
          }
        });
      }
    });

    values = _.sortBy(values);
  } else if (this.config.field_types[filter] === 'date') {
    var isMobile = Modernizr.mobile || Modernizr.tablet;
    var start_date;
    var end_date;

    if (isMobile && Modernizr.inputtypes.date) {
      start_date = getFormatedDate($('.start_date').val());
      end_date = getFormatedDate($('.finish_date').val());
    } else {
      start_date = getFormatedDate($('.start_date').datepicker("getDate"));
      end_date = getFormatedDate($('.finish_date').datepicker("getDate"));
    }
    return this.renderSearchResult( {
      type: 'filter',
      field: filter,
      value: [start_date, end_date]
    } );
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
        $('.list-default.directory-entries li:eq('+i+') .list-image').css('background-image', 'url(' + this.src + ')');
      }, false);

      img.src = imgURL;
    }
  });

  this.$container.on( 'click', '.data-linked', $.proxy( this.dataLinkClicked, this ) );
  $(window).on( 'resize', function(){
    _this.deviceIsTablet = (window.innerWidth >= 640 && window.innerHeight >= 640);
    _this.checkMobileMode();
    _this.resizeSearch();
    _this.navHeight = $('.fl-viewport-header').height() || 0;
    _this.searchBarHeight = _this.$container.find('.directory-search').outerHeight();
    _this.placeIndexList();
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
    this.$container.on( 'keyup paste change', '.search', function(e){
      _this.renderLiveSearch($(this).val());
    } );
  }
  this.$container.on( 'click', '.search-cancel', function(){
    _this.$container.find('.search').val('');
    _this.deactivateSearch();
    return false;
  } );
  this.$container.on( 'click', '.search-result-clear', function(){
    if (_this.liveSearchTimeout) {
      clearTimeout(_this.liveSearchTimeout);
      _this.liveSearchTimeout = null;
    }
    _this.$container.find('.search').val('');
    _this.switchMode('search');
    return false;
  } );

  this.$container.on( 'touchmove', '.search-result ul, .filters', function(){
    _this.$container.find('.search').trigger('blur');
  } );

  document.addEventListener('flDirectoryEntryBeforeRender', function () {
    _this.disableClicks();
    _this.removeLoading();
    loadingTimeout = setTimeout(function () {
      _this.addLoading();
    }, loadingOverlayDelay);
  }, false);

  document.addEventListener('flDirectoryEntryAfterRender', function () {
    _this.removeLoading();
  }, false);

  this.$container.on( 'click', '.date_cancel, .overlay-date-range .closeButton', function(){
    $('.overlay-date-range').removeClass('active');
  });
  this.$container.on( 'click', '.date_go', function(){
    $('.overlay-date-range').removeClass('active');
    _this.renderFilterValues(date_filter, _this.config.mobile_mode || !_this.deviceIsTablet);
  });
};

AdvancedDirectory.prototype.activateSearch = function(){
  this.$container.find('.search-cancel').css({
    'top': this.config.search_only ? '-9999px' : ''
  });
  this.$container.find('.directory-screen').css({
    'opacity': this.config.search_only ? '0' : '',
    'pointer-events': this.config.search_only ? 'none' : ''
  });

  if ( this.isMode('default') ) {
    this.$container.find('.filter-selected').html('');
  }
  if ( !this.isMode('search') && !this.isMode('filter-values') && !this.isMode('search-result') && !this.isMode('search-result-entry') ) {
    this.switchMode('search');
  }

  if (!this.config.search_only) {
    document.body.classList.add('fl-top-menu-hidden');
  }

  this.flViewportRedraw();
};

AdvancedDirectory.prototype.deactivateSearch = function(){
  if (this.config.search_only) {
    return;
  }

  this.$container.find('.search').trigger('blur');
  if ( !this.config.mobile_mode && this.deviceIsTablet && this.isMode('search-result-entry') ) {
    this.openDataEntry(0, 'entry', false);
  }
  this.switchMode('default');

  document.body.classList.remove('fl-top-menu-hidden');

  this.flViewportRedraw();
};

AdvancedDirectory.prototype.checkMobileMode = function(){
  if (this.config.mobile_mode) {
    this.$container.addClass('directory-mobile-mode');
  } else {
    this.$container.removeClass('directory-mobile-mode');
  }
};

AdvancedDirectory.prototype.resizeSearch = function(){
  var _this = this;
  setTimeout(function(){
    if (_this.config.search_only) {
      return _this.$container.find('.search').css( 'width', '' );
    }

    if ( _this.isMode('search') || _this.isMode('filter-values') || _this.isMode('search-result') || _this.isMode('search-result-entry') ) {
      _this.$container.find('.search').css( 'width', _this.$container.find('.directory-search').width() - _this.$container.find('.search-cancel').outerWidth() + 8 );
    } else {
      _this.$container.find('.search').css( 'width', '' );
    }
  }, 0);
};

AdvancedDirectory.prototype.filterOverlayIsActive = function(){
  return this.filterOverlay instanceof Fliplet.Utils.Overlay;
};

AdvancedDirectory.prototype.entryOverlayIsActive = function(){
  return this.entryOverlay instanceof Fliplet.Utils.Overlay;
};

AdvancedDirectory.prototype.dataLinkClicked = function(e){

  this.flViewportRedraw();

  var _this = this;
  e.preventDefault();

  // Date
  if (_this.config.field_types[e.currentTarget.dataset.filter] === 'date' && e.currentTarget.dataset.type === 'filter') {
    date_filter = e.currentTarget.dataset.filter;
    $('.date-picker').datepicker();
    if (isMobile && Modernizr.inputtypes.date && 'ontouchstart' in document.documentElement) {
      $('.date-picker').datepicker('remove')
    }
    $('.overlay-date-range').addClass('active');
    return;
  }

  switch (e.currentTarget.dataset.type) {
    case 'filter-tag':
    case 'filter':
      var filter = e.currentTarget.dataset.filter;
      this.renderFilterValues( filter, (this.config.mobile_mode || !this.deviceIsTablet) );
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
        setTimeout(function(){
          if ( _this.searchResultData.length === 1 ) {
            _this.openDataEntry(0, 'search-result-entry');
          }
        }, 0);
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
  var $entrytitle = this.$container.find('li[data-type="' + type + '"][data-index=' + entryIndex + '] .list-title');
  var title = $entrytitle.text().trim();

  var dataArr = (type === 'search-result-entry') ? _this.searchResultData : _this.data;
  var detailData = {
    title: title,
    has_thumbnail : this.config.show_thumb_detail ? this.config.show_thumb_detail : false,
    data: dataArr[entryIndex]['dataSourceEntryId'] || '',
    fields: dataArr[entryIndex]
  };

  // @TODO: Review Thumbnail-related code
  // if (typeof this.config.thumbnail_field !== 'undefined' && this.config.thumbnail_field.trim() !== '') {
  //   detailData['has_thumbnail'] = (typeof this.config.thumbnail_field !== 'undefined' && this.config.thumbnail_field.trim() !== '' && this.config.show_thumb_detail ? this.config.show_thumb_detail : false );
  //   detailData['thumbnail'] = (type == 'search-result-entry') ? this.searchResultData[entryIndex][this.config.thumbnail_field] : this.data[entryIndex][this.config.thumbnail_field];
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
  this.trigger('flDirectoryEntryBeforeRender', {detailData: detailData});

  var after_render = function() {
    // Link taps listeners
    $('.directory-detail-value a').not('.data-linked').on('click', function(e){
      if ($(e.target).attr('href').indexOf('mailto') === 0) {
        // Analytics - Track Event
        Fliplet.Analytics.trackEvent({ category: 'directory', action: 'entry_email', title: title });

      } else if ($(e.target).attr('href').indexOf('tel') === 0) {
        // Analytics - Track Event
        Fliplet.Analytics.trackEvent({ category: 'directory', action: 'entry_phone', title: title });
      } else {
        // Analytics - Track Event
        Fliplet.Analytics.trackEvent({ category: 'directory', action: 'entry_email', title: title });
      }
    });
    $('.directory-detail-value a.data-linked').on('click', function(e){
      var filterType = (typeof $(e.target).data('type') !== 'undefined') ? $(e.target).data('type') : '';
      var filterValue = (typeof $(e.target).data('value') !== 'undefined') ? $(e.target).data('value') : '';

      // Analytics - Track Event
      Fliplet.Analytics.trackEvent({ category: 'directory', action: 'entry_email', title: filterType + ': ' + filterValue });
    });

    // Custom event to fire after an entry is rendered in the detailed view.
    _this.trigger('flDirectoryEntryAfterRender', {detailData: detailData});
  };

  if ( !this.config.mobile_mode && this.deviceIsTablet ) {
    this.$container.find('.directory-details .directory-details-content').html(html_entity_decode(detailViewHTML));
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
    Fliplet.Analytics.trackEvent({ category: 'directory', action: 'entry_open', title: title });
  }
};

AdvancedDirectory.prototype.disableClicks = function () {
  this.$container.find('.directory-list, .directory-details').addClass('disabled'); // Disables List
};

// Function that will fade in the loading overlay
AdvancedDirectory.prototype.addLoading = function () {
  // The following adds Loading Overlay to a specific area depending on the device width
  if (this.config.mobile_mode || !this.deviceIsTablet) {
    this.$container.find('.directory-list').find('.directory-loading').fadeIn(400);
  } else {
    this.$container.find('.directory-details').find('.directory-loading').fadeIn(400);
  }

  // Delay to display the 'Loading...' text
  messageTimeout = setTimeout(function () {
    $('.directory-loading .loading-text').hide().text('Loading...').fadeIn(250);
  }, messageDelay);
};

// Function that will remove the loading overlay and enable clicks
AdvancedDirectory.prototype.removeLoading = function () {
  clearTimeout(loadingTimeout); // Clears delay loading overlay
  clearTimeout(messageTimeout); // Clears delay for text to appear
  // The following removes Loading Overlay from a specific area depending on the device width
  if (this.config.mobile_mode || !this.deviceIsTablet) {
    this.$container.find('.directory-list').find('.directory-loading').fadeOut(400);
  } else {
    this.$container.find('.directory-details').find('.directory-loading').fadeOut(400);
  }

  this.$container.find('.directory-list, .directory-details').removeClass('disabled'); // Enables List
  $('.directory-loading .loading-text').text(''); // Resets Loading text
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
      valueHTML = splitByCommas(value.value).map(function (tag) {
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
    this.liveSearchTimeout = null;
  }
  this.liveSearchTimeout = setTimeout(function(){
    _this.renderSearchResult( {
      type: 'search',
      value: value
    } );
  }, this.liveSearchInterval);

};

AdvancedDirectory.prototype.renderSearchResult = function( options, callback ){
  options = options || {};

  if (!options.hasOwnProperty('userTriggered')) {
    options.userTriggered = true;
  }

  if (options.userTriggered) this.activateSearch();
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
    case 'filter-value':
      data.type = 'filter';
      data.field = options.field;
      data.value = options.value;
      data.result = this.filter( options.field, options.value );
      if (this.config.field_types[options.field] === 'date') {
        var startDate = options.value[0];
        var endDate = options.value[1];
        data.value = startDate.format("DD MMM ‘YY") + '&mdash;' + endDate.format("DD MMM ‘YY");
      }
      // Analytics - Track Event
      Fliplet.Analytics.trackEvent({ category: 'directory', action: 'filter', title: options.type + ': ' + options.value });
      break;
    case 'filter-value-tag':
      var filterByTag = function(value) {
        if (value[options.field]) {
          var splitTags = splitByCommas(value[options.field]);
          for (var i = 0; i < splitTags.length; i++) {
            if (splitTags[i].trim() === options.value.trim()) {
              return true;
            }
          }
        }

        return false;
      };

      data.type = 'filter';
      data.field = options.field;
      data.value = options.value;
      data.result = this.data.filter(filterByTag);

      // Analytics - Track Event
      Fliplet.Analytics.trackEvent({ category: 'directory', action: 'list_tag_filter', title: options.type + ': ' + options.value });

      break;
    case 'search':
    default:
      data.type = 'search';
      data.value = options.value;
      data.result = this.search( options.value );

      // Analytics - Track Event
      Fliplet.Analytics.trackEvent({ category: 'directory', action: 'search', title: options.type + ': ' + options.value });

      break;
  }

  this.searchResultData = data.result;
  var advancedDirectorySearchResultHeaderHTML = Fliplet.Widget.Templates['build.advancedDirectorySearchResultHeader'](data);
  var advancedDirectorySearchResultTemplate = this.config.listviewTemplate
    ? Handlebars.compile(this.config.listviewTemplate)
    : Fliplet.Widget.Templates['build.listView'];

  var advancedDirectorySearchResultHTML = advancedDirectorySearchResultTemplate(data.result);
  this.$searchResultsContainer
    .html(advancedDirectorySearchResultHeaderHTML)
    .append(advancedDirectorySearchResultHTML)
    .find('.data-linked[data-type="entry"]')
      .attr('data-type', 'search-result-entry')
    .end()
    .scrollTop(0);
  if (typeof callback === 'function') setTimeout(callback, 0);
};

AdvancedDirectory.prototype.search = function(search) {
  var entries = [];
  var searchFields = this.config.search_fields;
  // Escape search
  var s = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  var term = new RegExp(s, "i");

  this.data.forEach(function (entry) {
    for (var i = 0; i < searchFields.length; i++) {
      var value = entry[searchFields[i]];
      if (!value) {
        continue;
      }

      if (typeof value === 'string' && value.match(term)) {
        return entries.push(entry);
      }

      if (value === search) {
        entries.push(entry);
      }
    }
  });

  return entries;
};

AdvancedDirectory.prototype.filter = function( field, value ) {
  if (this.config.field_types[field] === 'date') {
    var startDate = value[0];
    var endDate = value[1];
    var output = _.filter(this.data, function(o){
      if (!o.hasOwnProperty(field) || !o[field]) {
        return false;
      }
      return moment(o[field]).isBetween(startDate, endDate, 'day', '[]');
    });
    return _.sortBy(output, [function(o){
      return parseInt(moment(o[field]).format('x'));
    }]);
  }

  var path = ':root > :has(."' + field + '":val("' + value + '"))';
  return JSONSelect.match( path, this.data );
}

AdvancedDirectory.prototype.getFilterValues = function(field) {
  var values = [];
  this.data.forEach(function getValues(entry) {
    var entryValue = entry[field];
    if (entryValue && values.indexOf(entryValue) === -1) {
      values.push(entryValue);
    }
  });

  return values.sort();
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
        if (query.entryId) {
          var $entry = this.$container.find('[data-type="entry"][data-source-entry-id="' + query.entryId + '"]');
          if (!$entry.length) {
            break;
          }

          this.openDataEntry(parseInt($entry.attr('data-index'), 10), 'entry', false);
        }
        break;
    }
  } else if ( !this.config.mobile_mode && this.deviceIsTablet && !this.config.search_only ) {
    // Open the first entry if on a tablet and search_only mode isn't on
    this.openDataEntry(0, 'entry', false);
  }
};

AdvancedDirectory.prototype.presetSearch = function( value ){
  this.$container.find('.search').val( value );
  this.renderSearchResult( {
    type : 'search',
    value : value,
    userTriggered : false
  } );
  if (this.searchResultData.length === 1) {
    this.openDataEntry(0,'search-result-entry');
    if (this.config.mobile_mode || !this.deviceIsTablet) {
      this.switchMode('default');
    }
  }
  this.flViewportRedraw();
};

AdvancedDirectory.prototype.presetFilter = function( field, value ){
  this.renderSearchResult( {
    type : 'filter',
    field : field,
    value : value,
    userTriggered : false
  } );
  this.flViewportRedraw();
};

AdvancedDirectory.prototype.directoryNotConfigured = function(){
  this.$container.find('.directory-entries').addClass('not-configured').html('Loading...');
};

AdvancedDirectory.prototype.flViewportRedraw = function(){
  return new Promise(function (resolve, reject) {
    $(document.body).css({
      transform: 'scale(1)',
      position: 'absolute'
    });
    $(document.body).css({
      transform: '',
      position: ''
    });
    setTimeout(function(){
      resolve();
    }, 0);
  });
};

/***************  END: AdvancedDirectory  ***************/
/***************  END: AdvancedDirectory  ***************/
/***************  END: AdvancedDirectory  ***************/
