define(function() {
  // output/static/serviceprovider/js/tpl/index.serviceprovider_ser-pro-main.dust
  (function() {
    dust.register("footer", body_0);

    function body_0(chk, ctx) {
      return chk.write("<div class=\"footer-bar\">This is the wowspg Footer!!</div>");
    }
    return body_0;
  })();
  return function(locals, callback) {
    var rendered;

    dust.render("footer", locals, function(err, result) {
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