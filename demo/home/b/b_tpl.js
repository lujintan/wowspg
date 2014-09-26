define(function() {
  
  (function() {
    dust.register("home/b_tpl", body_0);

    function body_0(chk, ctx) {
      return chk.write("<div class=\"mod-home-b-tpl\"><h1>This is the Module Home Page B</h1><div class=\"inner-content\">Wow Spg!!!</div></div>");
    }
    return body_0;
  })();
  return function(locals, callback) {
    var rendered;

    dust.render("home/b_tpl", locals, function(err, result) {
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