define(function() {
  // output/static/serviceprovider/js/tpl/index.serviceprovider_ser-pro-main.dust
  (function() {
    dust.register("header", body_0);

    function body_0(chk, ctx) {
      return chk.write("<ul class=\"nav-bar clearfix\"><li class=\"n-i\"><a href=\"?module=index&page=a\">ModuleIndex</a></li><li class=\"n-i\"><a href=\"?module=home&page=a\">ModuleHome</a></li></ul>");
    }
    return body_0;
  })();
  return function(locals, callback) {
    var rendered;

    dust.render("header", locals, function(err, result) {
      if (typeof callback === "function") {
        try {
          callback(err, result);
        } catch (e) {}
      }

      if (err) {
        throw err
      } else {
        rendered = result;
      }
    });

    return rendered;
  }
});