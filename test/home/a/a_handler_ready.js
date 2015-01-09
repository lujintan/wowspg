define(function(require, exports, module){

	return {
        //init function will be executed automatically when rending block
		init: function($wrap, data, params){
			$('.inner-content', $wrap).css('background', 'pink');
		},

        //destroy function will be executed automatically when cleaning block
        destroy: function(){
            console.log('Module Home Page A destroyed!');
        }
	};
});