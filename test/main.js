/**
 * Created by lujintan on 11/28/14.
 */

require.config({
    baseUrl: ''
});

requirejs(['../output/main'], function(wow){
    wow.init(router);
});