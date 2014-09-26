var router = {
    '.*': {
        block: {
            ds: '',
            dt: '',
            handler: {},

            header: {
                selector: '#gHeader',
                deps: ['main', 'footer']
            },
            main: {
                selector: '#gMain'
            },
            footer: {
                selector: '#gFooter'
            }
        },
        router: {
            '|module=index': {
                router: 'index/router'
            },
            'module=home': {
            	router: 'home/router'
            }
        }
    }
};