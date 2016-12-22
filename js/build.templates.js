this["Fliplet"] = this["Fliplet"] || {};
this["Fliplet"]["Widget"] = this["Fliplet"]["Widget"] || {};
this["Fliplet"]["Widget"]["Templates"] = this["Fliplet"]["Widget"]["Templates"] || {};

this["Fliplet"]["Widget"]["Templates"]["build.detailView"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div data-source-entry-id=\""
    + alias4(((helper = (helper = helpers.ID || (depth0 != null ? depth0.ID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ID","hash":{},"data":data}) : helper)))
    + "\">\n  <div class=\"directory-detail-title\">"
    + alias4(((helper = (helper = helpers.Title || (depth0 != null ? depth0.Title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Title","hash":{},"data":data}) : helper)))
    + "</div>\n  <div class=\"directory-detail-label\">Location</div>\n  <div class=\"directory-detail-value\">"
    + alias4(((helper = (helper = helpers.Location || (depth0 != null ? depth0.Location : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Location","hash":{},"data":data}) : helper)))
    + "</div>\n</div>\n";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["build.listView"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "\n  "
    + ((stack1 = ((helper = (helper = helpers.alphabet_divider || (depth0 != null ? depth0.alphabet_divider : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"alphabet_divider","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n  <li class=\"linked data-linked\" data-type=\"entry\" data-index=\""
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\">\n    <!-- <span class=\"icon fa fa-star\"></span> -->\n    <div class=\"list-desc\">\n      <p class=\"list-title\">"
    + alias4((helpers.plaintext || (depth0 && depth0.plaintext) || alias2).call(alias1,"Title",depth0,{"name":"plaintext","hash":{},"data":data}))
    + "</p>\n      <!-- <p class=\"survey-notification\"><span class=\"survey-warning\"><i class=\"fa fa-exclamation-circle\"></i> Please complete survey</span></p> -->\n      <p class=\"time-place\">"
    + alias4((helpers.moment || (depth0 && depth0.moment) || alias2).call(alias1,"Session start","HH:mm",depth0,{"name":"moment","hash":{},"data":data}))
    + " &ndash; "
    + alias4((helpers.moment || (depth0 && depth0.moment) || alias2).call(alias1,"Session end","HH:mm",depth0,{"name":"moment","hash":{},"data":data}))
    + " &#183; <span>"
    + alias4(((helper = (helper = helpers.Location || (depth0 != null ? depth0.Location : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Location","hash":{},"data":data}) : helper)))
    + "</span></p>\n    </div>\n    <div class=\"list-tags\">\n      "
    + alias4((helpers.tag_filters || (depth0 && depth0.tag_filters) || alias2).call(alias1,"Tags",depth0,{"name":"tag_filters","hash":{},"data":data}))
    + "\n    </div>\n  </li>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<ul>"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</ul>\n";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["build.listViewDivider"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "<li class=\"divider\" data-letter=\""
    + alias2(alias1(depth0, depth0))
    + "\">"
    + alias2(alias1(depth0, depth0))
    + "</li>\n";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["build.splitViewFilterOverlay"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"list-default\">\n"
    + ((stack1 = container.invokePartial(partials.directory_filter_values,depth0,{"name":"directory_filter_values","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "</div>\n";
},"usePartial":true,"useData":true});

this["Fliplet"]["Widget"]["Templates"]["build.splitViewFilters"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "\n    <li class=\"linked data-linked\" data-type=\"filter\" data-filter=\""
    + alias2(alias1(depth0, depth0))
    + "\">\n        <span class=\"icon fa fa-angle-right\"></span>\n        <div class=\"list-desc\">\n            <p class=\"list-title\">"
    + alias2(alias1(depth0, depth0))
    + "</p>\n        </div>\n        <span class=\"buttonControl\"></span>\n    </li>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<ul>"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</ul>\n";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["build.splitViewFilterValues"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "\n    <li class=\"linked data-linked\" data-type=\""
    + alias2(alias1((depths[1] != null ? depths[1].dataType : depths[1]), depth0))
    + "\" data-filter=\""
    + alias2(alias1((depths[1] != null ? depths[1].filter : depths[1]), depth0))
    + "\" data-value=\""
    + alias2(alias1(depth0, depth0))
    + "\">\n        <span class=\"icon fa fa-angle-right\"></span>\n        <div class=\"list-desc\">\n            <p class=\"list-title\">"
    + alias2(alias1(depth0, depth0))
    + "</p>\n        </div>\n        <span class=\"buttonControl\"></span>\n    </li>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "<ul>"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.values : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</ul>\n";
},"useData":true,"useDepths":true});

this["Fliplet"]["Widget"]["Templates"]["build.splitViewSearchResultHeader"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return "<div class=\"search-result-header-container\">\n  <div class=\"search-result-header\">\n    <a href=\"#\" class=\"btn btn-link pull-right search-result-clear\">"
    + container.escapeExpression((helpers.search_result_clear || (depth0 && depth0.search_result_clear) || alias2).call(alias1,depth0,{"name":"search_result_clear","hash":{},"data":data}))
    + "</a>\n    <h5>"
    + ((stack1 = (helpers.search_result_header || (depth0 && depth0.search_result_header) || alias2).call(alias1,depth0,{"name":"search_result_header","hash":{},"data":data})) != null ? stack1 : "")
    + "</h5>\n  </div>\n</div>\n";
},"useData":true});