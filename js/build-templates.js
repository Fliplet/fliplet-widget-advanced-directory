Handlebars.templates = Handlebars.templates||{};
Handlebars.templates.splitViewFilterValues = Handlebars.compile([
  '<ul>{{#each values}}',
      '<li class="linked data-linked" data-type="{{../dataType}}" data-filter="{{../filter}}" data-value="{{this}}">',
          '<span class="icon fa fa-angle-right"></span>',
          '<div class="list-desc">',
              '<p class="list-title">{{this}}</p>',
          '</div>',
          '<span class="buttonControl"></span>',
      '</li>',
  '{{/each}}</ul>'
].join(''));
Handlebars.templates.splitViewFilters = Handlebars.compile([
  '<ul>{{#each this}}',
      '<li class="linked data-linked" data-type="filter" data-filter="{{this}}">',
          '<span class="icon fa fa-angle-right"></span>',
          '<div class="list-desc">',
              '<p class="list-title">{{this}}</p>',
          '</div>',
          '<span class="buttonControl"></span>',
      '</li>',
  '{{/each}}</ul>'
].join(''));
Handlebars.templates.splitViewFilterOverlay = Handlebars.compile([
  '<div class="list-default">',
      '{{> directory_filter_values}}',
  '</div>'
].join(''));
Handlebars.templates.splitViewSearchResult = Handlebars.compile([
  '<div class="search-result-header-container">',
    '<div class="search-result-header">',
      '<a href="#" class="btn btn-link pull-right search-result-clear">{{search_result_clear this}}</a>',
      '<h5>{{{search_result_header this}}}</h5>',
    '</div>',
  '</div>',
  '<ul>{{#each result}}',
    '<li class="linked data-linked {{#if ../has_thumbnail}}has-thumbs{{/if}}" data-type="search-result-entry" data-index="{{@index}}" data-source-entry-id="{{dataSourceEntryId}}">',
      '<span class="icon fa fa-angle-right"></span>',
      '{{#if ../has_thumbnail}}<div class="list-image"></div>{{/if}}',
      '<div class="list-desc">',
        '<p class="list-title">{{> entry_title}}</p>',
        '{{#if ../show_subtitle}}',
          '<p class="list-subtitle">{{> entry_subtitle}}</p>',
        '{{/if}}',
      '</div>',
      '<div class="list-tags">',
        '{{entry_tags this}}',
      '</div>',
      '<span class="buttonControl"></span>',
    '</li>',
  '{{/each}}</ul>'
].join(''));
Handlebars.templates.listViewDivider = Handlebars.compile([
  '<li class="divider" data-letter="{{this}}">{{this}}</li>'
].join(''));
Handlebars.templates.listView = Handlebars.compile([
  '<ul>{{#each this}}',
    '{{{alphabet_divider}}}',
    '<li class="linked data-linked" data-type="entry" data-index="{{@index}}" data-source-entry-id="{{dataSourceEntryId}}">',
      '<span class="icon fa fa-angle-right"></span>',
      '<div class="list-desc">',
        '<p class="list-title">{{plaintext "entry_title" this}}</p>',
        '<p class="list-subtitle">{{plaintext "entry_subtitle" this}}</p>',
      '</div>',
      '<div class="list-tags">',
        '{{entry_tags this}}',
      '</div>',
      '<span class="buttonControl"></span>',
    '</li>',
  '{{/each}}</ul>'
].join(''));
Handlebars.templates.detailView = Handlebars.compile([
  '<div data-source-entry-id="{{ID}}">',
    '<div class="directory-detail-title">{{[Title]}}</div>',
    '<div class="directory-detail-label">Location</div>',
    '<div class="directory-detail-value">{{[Location]}}</div>',
  '</div>  '
].join(''));
