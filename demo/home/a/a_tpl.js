define(function() {
  
  (function() {
    dust.register("home/a_tpl", body_0);

    function body_0(chk, ctx) {
      return chk.write("<div class=\"mod-home-a-tpl\"><h1>This is the Module Home Page A</h1><div class=\"inner-content\">Wasai Spg!!!</div></div>");
    }
    return body_0;
  })();
  return function(locals, callback) {
    var rendered;

    dust.render("home/a_tpl", locals, function(err, result) {
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