this["Fliplet"] = this["Fliplet"] || {};
this["Fliplet"]["Widget"] = this["Fliplet"]["Widget"] || {};
this["Fliplet"]["Widget"]["Templates"] = this["Fliplet"]["Widget"]["Templates"] || {};

this["Fliplet"]["Widget"]["Templates"]["interface.dataAlphabeticalField"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "        <option value=\""
    + alias2(alias1(depth0, depth0))
    + "\">"
    + alias2(alias1(depth0, depth0))
    + "</option>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<select class=\"hidden-select form-control\" name=\"alphabetical_field\" id=\"data-alphabetical-fields-select\">\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</select>";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["interface.dataBrowseConfigurations"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return "    <tr>\n        <td>"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "</td>\n        <td>"
    + ((stack1 = (helpers.filterCheckbox || (depth0 && depth0.filterCheckbox) || alias2).call(alias1,depth0,{"name":"filterCheckbox","hash":{},"data":data})) != null ? stack1 : "")
    + "</td>\n        <td>"
    + ((stack1 = (helpers.searchCheckbox || (depth0 && depth0.searchCheckbox) || alias2).call(alias1,depth0,{"name":"searchCheckbox","hash":{},"data":data})) != null ? stack1 : "")
    + "</td>\n        <td>"
    + ((stack1 = (helpers.typeSelector || (depth0 && depth0.typeSelector) || alias2).call(alias1,depth0,{"name":"typeSelector","hash":{},"data":data})) != null ? stack1 : "")
    + "</td>\n    </tr>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<table class=\"table table-hover\">\n<thead>\n<tr>\n    <th>Fields</th>\n    <th class=\"text-center\">Use as filter</th>\n    <th class=\"text-center\">Use for search</th>\n    <th>Display option</th>\n</tr>\n</thead>\n<tbody>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</tbody>\n</table>";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["interface.dataSourceOptions"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <option value=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</option>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<option>&mdash; Select a table &mdash;</option>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["interface.dataTagsField"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "        <option value=\""
    + alias2(alias1(depth0, depth0))
    + "\">"
    + alias2(alias1(depth0, depth0))
    + "</option>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<select class=\"hidden-select form-control\" name=\"tags_field\" id=\"data-tags-fields-select\">\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</select>\n";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["interface.dataThumbnailField"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "        <option value=\""
    + alias2(alias1(depth0, depth0))
    + "\">"
    + alias2(alias1(depth0, depth0))
    + "</option>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<select class=\"hidden-select form-control\" name=\"thumbnail_field\" id=\"data-thumbnail-fields-select\">\n    <option value=\"\">Choose a field (optional)</option>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</select>";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["interface.dataTypeSelector"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<label class=\"select-proxy-display\" data-field=\""
    + container.escapeExpression(((helper = (helper = helpers.field || (depth0 != null ? depth0.field : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"field","hash":{},"data":data}) : helper)))
    + "\" data-type=\"type\">\n  <span class=\"icon fa fa-chevron-down\"></span>\n  <span class=\"select-value-proxy\">Display as text</span>\n  <select class=\"hidden-select form-control\">\n    <option value=\"text\">Display as text</option>\n    <option value=\"tel\">Tap to dial the number</option>\n    <option value=\"email\">Tap to send an email</option>\n    <option value=\"url\">Tap to visit webpage</option>\n      <option value=\"file\">Tap to open file</option>\n    <!-- <<option value=\"address\">Address</option> -->\n    <option value=\"image\">Display as an image</option>\n      <option value=\"accordion\">Display as an accordion</option>\n    <!-- <option value=\"datetime\">Date/time</option> -->\n      <option value=\"date\">Display as date</option>\n  </select>\n</label>\n";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["interface.files.app"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"col-xs-4 item-holder folder\" data-app-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n    <div class=\"image-holder\">\n        <div class=\"image-overlay\">\n            <i class=\"fa fa-folder\" aria-hidden=\"true\"></i>\n        </div>\n        <div class=\"image-info\">\n            <p>\n                <strong>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</strong>\n            </p>\n            <p>\n                Double click to open the folder\n            </p>\n        </div>\n    </div>\n    <div class=\"image-title\">\n        <p>\n            <strong>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</strong>\n        </p>\n    </div>\n</div>\n";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["interface.files.folder"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"col-xs-4 item-holder folder\" data-folder-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" data-parent-id=\""
    + alias4(((helper = (helper = helpers.parentId || (depth0 != null ? depth0.parentId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"parentId","hash":{},"data":data}) : helper)))
    + "\" }>\n    <div class=\"image-holder\">\n        <div class=\"image-overlay\">\n            <i class=\"fa fa-folder\" aria-hidden=\"true\"></i>\n        </div>\n        <div class=\"image-info\">\n            <p>\n                <strong>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</strong>\n            </p>\n            <p>\n                Double click to open the folder\n            </p>\n        </div>\n    </div>\n    <div class=\"image-title\">\n        <p>\n            <strong>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</strong>\n        </p>\n    </div>\n</div>\n";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["interface.files.noFiles"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"nofiles-msg\">\n    <p>This folder is empty.</p>\n</div>\n";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["interface.files.organization"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"col-xs-4 item-holder folder\" data-organization-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n    <div class=\"image-holder\">\n        <div class=\"image-overlay\">\n            <i class=\"fa fa-folder\" aria-hidden=\"true\"></i>\n        </div>\n        <div class=\"image-info\">\n            <p>\n                <strong>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</strong>\n            </p>\n            <p>\n                Double click to open the folder\n            </p>\n        </div>\n    </div>\n    <div class=\"image-title\">\n        <p>\n            <strong>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</strong>\n        </p>\n    </div>\n</div>\n";
},"useData":true});