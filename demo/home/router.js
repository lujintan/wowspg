define(function(){
    return {
        ".*": {
            "block": {
                "main": {
                    "tpl": "home/layout",
                    "css": ["home/layout_css"],
                    "block": {
                        "home-main": {
                            "selector": ".mod-wow-home-main"
                        }
                    }
                }
            },
            "router": {
                "page=a": {
                    "block": {
                        "home-main": {
                            "tpl": "home/a/a_tpl",
                            "handler": {
                                "start": [],
                                "ready": ["home/a/a_handler_ready"],
                                "usable": []
                            },
                            "css": ["home/a/a_css"],
                            "ds": {
                                "error_info": {
                                    "code": "0",
                                    "message": "success"
                                },
                                "data": {
                                    "a": 1,
                                    "b": 2
                                }
                            },
                            "title": "Wow Demo -- module home page a"
                        }
                    }
                },

                "page=b": {
                    "block": {
                        "footer": {
                            "tpl": "home/b/footer",
                            "css": ["home/b/footer_css"]
                        },
                        "home-main": {
                            "tpl": "home/b/b_tpl",
                            "handler": {
                                "start": ["home/b/b_handler_start"],
                                "ready": ["home/b/b_handler_ready"],
                                "usable": ["home/b/b_handler_usable"]
                            },
                            "css": ["home/b/b_css1", "home/b/b_css2"],
                            "title": "Wow Demo -- module home page b"
                        }
                    }
                }
            }
        }
    };
});