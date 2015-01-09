/**
 * Created by lujintan on 11/28/14.
 */

require.config({
    baseUrl: ''
});

requirejs(['../lib/when/when', '../lib/sizzle', '../output/main'], function(when, sizzle, wow){
    wow.init(router, {
        type: 'hash',
        promise: when,
        selector: sizzle,
        handler: {
            loading: function($wrap) {
                var df = $.Deferred();
                $wrap.html('loading...');
                setTimeout(function(){
                    df.resolve();
                }, 1000);
                return df.promise();
            }
        }
    });
});