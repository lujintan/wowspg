define(function() {
  // output/static/serviceprovider/js/tpl/index.serviceprovider_ser-pro-main.dust
  (function() {
    dust.register("home/layout", body_0);

    function body_0(chk, ctx) {
      return chk.write("<div class=\"mod-home-layout clearfix\"><div class=\"sb-wp\"><ul class=\"sb-l\"><li class=\"sb-i current\"><a class=\"sb-link\" href=\"?module=home&page=a\">PageA</a></li><li class=\"sb-i\"><a class=\"sb-link\" href=\"?module=home&page=b\">PageB</a></li></ul></div><!-- block for extends --><div class=\"mod-wow-home-main\"></div></div>");
    }
    return body_0;
  })();
  return function(locals, callback) {
    var rendered;

    dust.render("home/layout", locals, function(err, result) {
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