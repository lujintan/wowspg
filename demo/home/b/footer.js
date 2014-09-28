define(function() {
  // output/static/serviceprovider/js/tpl/index.serviceprovider_ser-pro-main.dust
  (function() {
    dust.register("home/b/footer", body_0);

    function body_0(chk, ctx) {
      return chk.write("<div class=\"footer-a-bar\">This is the wowspg Module Home Page B Footer!!</div>");
    }
    return body_0;
  })();
  return function(locals, callback) {
    var rendered;

    dust.render("home/b/footer", locals, function(err, result) {
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