wowspg
==========

##关于wowspg

### wow单页系统简介
wow单页系统可以帮助开发者快速搭建一套前端单页面应用，wow框架主要包含：

* wowspg —— 前端Javascript单页面框架，单页面应用前端基础库
* wowui —— 前端基础样式库
* wowbuilder —— 单页面框架自动化编译工具，前端人员可以按照传统方式进行开发，由wowbuilder编译成为单页面，同时支持打包、压缩、本地测试等前端开发相关工具
* wowstyleguide —— wow框架代码开发规范

### wowspg基础架构
wowspg作为wow系统js基础库，可以脱离wow系统单独运行，支持开发者通过前端路由配置来实现PC端和wise端浏览器单页面应用。wowspg源码使用TypeScript进行编写，基于AMD规范编译产出js文件至output目录。

![wowspg structure](./doc/image/wowspg_system_structure.jpg)

* 应用程序接口（Application）：开发者进行Block开发时需要实现的接口定义。主要包含：路由配置、Block 的前端模板、数据转换器、模板样式文件、模板逻辑处理器（其中包含block初始化即要执行的逻辑处理、block初始化完成时需要执行的处理器和block完全加载完是执行的处理器）
* 单页核心程序（single page core）：单页面架构的核心架构。主要包含：前端路由核心处理器、Block初始化程序、Block渲染器、页面更换的监听程序、页面历史缓存程序、历史记录处理器、DS处理器、错误处理器。
* 核心库（Libraries）：功单页面的核心程序调用的核心库。主要包含：AMD加载器（如：require），Promise处理器（如：when）、Css选择器支持（如：Sizzle or JQuery）。核心库可制定为实现AMD、Promise、Selector的其他基础库代替。
* 浏览器接口（Browser API）：单页核心架构主要使用的浏览器API，其中主要包括：History API。

开发人员需要实现Application部分定义的接口来实现自己的单页应用。

##使用指南
### Hellow Word

入口文件，初始化wowspg

```javascript
    requirejs(['wowspg/output/main'], function(wow){
        //wowspg 初始化
        //传入router配置
        wow.init(router);
    });
```

路由的相关配置

```javascript
    var router = {
        '.*': {     //需要匹配的路由正则
            block: {    //页面block配置，一个页面会分成n个block
                header: {   //key 为block的名字
                    selector: '#gHeader',   //block对应的页面位置（选择器）
                    tpl: 'header',      //模板amdID，页面加载时会异步引入tpl文件
                    deps: ['main', 'footer']    //该block依赖的block，当被依赖的模块渲染完成后才会进行该模块渲染
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
                '|module=index': 'index/router',    //子路由amdId，配置结构与当前路由结构一直，也可直接同步写入
                'module=home': 'home/router'
            }
        }
    };
```

详见，test目录文件

##wowspg 代码搭建

###第一步，根据页面功能进行页面划分，完成初步的路由建设

例：

<table>
    <thead>
        <tr>
            <td>path</td><td>一级页面</td><td>二级页面</td><td>三级页面</td><td>...</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>/pageA</td><td>功能页A</td><td></td><td></td><td></td>
        </tr>
        <tr>
            <td>/pageA/pageA-1</td><td></td><td>功能页A-1</td><td></td><td></td>
        </tr>
        <tr>
            <td>/pageA/pageA-2</td><td></td><td>功能页A-2</td><td></td><td></td>
        </tr>
        <tr>
            <td>/pageA/pageA-2/pageA-2-a</td><td></td><td></td><td>功能页A-2-a</td><td></td>
        </tr>
        <tr>
            <td>/pageB</td><td>功能页B</td><td></td><td></td><td></td>
        </tr>
    </tbody>
</table>

wowspg路由结构是一个树形拓扑结构，形如：

![wowspg_router_structure](./doc/image/wowspg_router_structure.jpg)

* 路由规则使用正则匹配url
* 上一级路由配置中可以通过正则指向下一级路由配置，下一级的路由配置可以直接写在当前配置文件，也可以指定一个amdID，在路由匹配阶段会异步加载下一级router config
* 上级路由匹配成功之后会再进行下一级路由配置，直到匹配完成。如：/pageA/pageA-2/pageA-2-a会匹配上图黄色路径的路由配置

###第二步，根据页面，进行页面片段（block）切分

* wowspg的block的概念类似于smarty的block
* router配置中，直接指向block信息配置，而不是page
* 下级router指向的block可以继承父级router的block或者祖先router的block
* 同一级router下得block可以相互依赖
* 存在依赖关系的block，在被依赖的block渲染结束才会渲染新的block

![wow_block_info](./doc/image/wow_block_info.jpg)



