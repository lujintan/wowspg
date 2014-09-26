define(function() {
  
  (function() {
    dust.register("index/a_tpl", body_0);

    function body_0(chk, ctx) {
      return chk.write("<div class=\"mod-index-a-tpl\"><h1>This is the Module Index Page A</h1><div class=\"inner-content\">Wow Spg!!!</div></div>");
    }
    return body_0;
  })();
  return function(locals, callback) {
    var rendered;

    dust.render("index/a_tpl", locals, function(err, result) {
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