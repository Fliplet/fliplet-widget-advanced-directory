this["Fliplet"] = this["Fliplet"] || {};
this["Fliplet"]["Widget"] = this["Fliplet"]["Widget"] || {};
this["Fliplet"]["Widget"]["Templates"] = this["Fliplet"]["Widget"]["Templates"] || {};

this["Fliplet"]["Widget"]["Templates"]["build.advancedDirectoryFilterOverlay"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"list-default\">\n"
    + ((stack1 = container.invokePartial(partials.directory_filter_values,depth0,{"name":"directory_filter_values","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "</div>\n";
},"usePartial":true,"useData":true});

this["Fliplet"]["Widget"]["Templates"]["build.advancedDirectoryFilters"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "\n    <li class=\"linked data-linked\" data-type=\"filter\" data-filter=\""
    + alias2(alias1(depth0, depth0))
    + "\">\n        <span class=\"icon fa fa-angle-right\"></span>\n        <div class=\"list-desc\">\n            <p class=\"list-title\">"
    + alias2(alias1(depth0, depth0))
    + "</p>\n        </div>\n        <span class=\"buttonControl\"></span>\n    </li>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<ul>"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</ul>\n";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["build.advancedDirectoryFilterValues"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
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
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.values : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</ul>\n";
},"useData":true,"useDepths":true});

this["Fliplet"]["Widget"]["Templates"]["build.advancedDirectorySearchResultHeader"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "<div class=\"search-result-header-container\">\n  <div class=\"search-result-header\">\n    <a href=\"#\" class=\"btn btn-link pull-right search-result-clear\">"
    + container.escapeExpression((helpers.search_result_clear || (depth0 && depth0.search_result_clear) || alias2).call(alias1,depth0,{"name":"search_result_clear","hash":{},"data":data}))
    + "</a>\n    <h5>"
    + ((stack1 = (helpers.search_result_header || (depth0 && depth0.search_result_header) || alias2).call(alias1,depth0,{"name":"search_result_header","hash":{},"data":data})) != null ? stack1 : "")
    + "</h5>\n  </div>\n</div>\n";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["build.detailView"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div data-source-entry-id=\""
    + container.escapeExpression(((helper = (helper = helpers.ID || (depth0 != null ? depth0.ID : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"ID","hash":{},"data":data}) : helper)))
    + "\">\n  <div class=\"directory-detail-title\">Template not configured</div>\n  <div class=\"directory-detail-value\">\n    <em>Please configure the template via <strong>Developers > Detailview template</strong></em>\n  </div>\n</div>\n";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["build.listView"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "\n  <li class=\"linked data-linked\" data-type=\"entry\" data-index=\""
    + container.escapeExpression(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"index","hash":{},"data":data}) : helper)))
    + "\">\n    <div class=\"list-desc\">\n      <p class=\"list-title\"><em>Please configure the template for the widget via <strong>Developers > Listview template</strong></em></p>\n    </div>\n  </li>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<h3 class=\"container-fluid\">Template not configured</h3>\n<ul>"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
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