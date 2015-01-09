var router = {
    '.*': {
        block: {
            header: {
                selector: '#gHeader',
                tpl: 'header',
                deps: ['main', 'footer']
            },
            main: {
                selector: '#gMain'
            },
            footer: {
                selector: '#gFooter',
                tpl: 'footer',
                deps: ['main']
            }
        },
        router: {
            '|module=index': 'index/router',
            'module=home': 'home/router'
        }
    }
};