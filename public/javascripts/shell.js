/**
 * Created by Huang on 2015/6/4.
 */

login.shell = (function(){
    // ------------------------ begin module scope variables -------------------------
    /*
     * 声明初始化模块作用域变量。一般会使用configMap来保存模块配置、使用stateMap来保存运行时
     * 状态值以及使用jQueryMap来缓存jQuery集合。
     *
     * */
     var
        configMap = {},
        stateMap = {},
        jqueryMap = {},
        setJqueryMap, configModule, initModule, loginBlog;
    // -------------------------- end module scope variables ------------------------


    // -------------------------- begin utility method ------------------------
    /*
     * 把所有私有的工具方法聚集在它们自己的区块里。这些方法不会操作dom，因此不需要浏览器
     * 就能执行。如果一个方法不是单个模块的工具方法，则应该把它移动共享的工具方法库里面，
     * 比如spa.util.js.
     *
     * */
    // -------------------------- end utility method ------------------------


    // -------------------------- begin dom method ------------------------
    /*
     *把所有私有的dom方法聚集在它们自己的区块里面。这些方法会访问和修改dom，因此需要浏览器
     * 才能运行。一个dom方法的例子是移动css sprite。setjQueryMap方法用来缓存jQuery集合。
     *
     * */
     setJqueryMap = function() {
         jqueryMap = {
             $searchBtn: $('#exampleInputAmount'),
             $searchBtnParent: $('.spa-shell-head-search'),

             $acctButton: $("#head-acct-dropdownMenu1"),
             $acctLogin: $("#acct-login"),
             $loginClick: $('#loginEventId'),  // 登录
             $loginName: $('#login-username'),
             $loginPwd: $('#login-password'),

             $acctReg: $("#acct-reg"),
             $registerClick: $('#registerEventId'),  // 注册
             $registerName: $('#reg-Username'),
             $registerPwd: $('#reg-password'),
             $registerPwdRepeat: $('#reg-password-repeat'),
             $registerEmail: $('#reg-email'),
             $acctLogout: $("#acct-logout"),   // 注销

             $mainNavHome: $('#main-nav-home'),
             $mainNavPost: $('#main-nav-post'),
             $mainNavUpload: $('#main-nav-upload'),

             $markdownTip: $("#markdown-tip"),
             $markdownHelpModal: $("#markdown-help-modal")
         };
     };

    var onClickSearch = function() {
        jqueryMap.$searchBtnParent.css('width', '30%').show(3000);
    };
    var onBlurSearch = function(){
        jqueryMap.$searchBtnParent.css('width', '9%').show(3000);
    };

     // -------------------------- end dom method ------------------------


    // -------------------------- begin event method ------------------------
    /*
     *把所有的私有事件处理程序聚集在它们自己的区块里面。这些方法会处理事件，比如按钮点击、
     * 按下按钮、浏览器容器缩放、或者接收web socket消息。事件处理程序一般会调用dom方法
     * 来修改dom，而不是它们自己直接去修改dom
     *
     * */
    var onClickLogin = function(){

        var loginName = jqueryMap.$loginName.val(),
            loginPwd = jqueryMap.$loginPwd.val(),
            data = {name: loginName, password: loginPwd};
        $.ajax({
            url : '/login',
            type: 'POST',
            data: data,
            success: function(data, status) {
                if( status== 'success') {
                    location.href = '/';
                }
            },
            error: function() {
                if( status == 'error' ) {
                    location.href = '/';
                }
            }
        })
    };

    var onClickRegister = function(){
        var $that = this;
        var regName = jqueryMap.$registerName.val(),
            regPwd = jqueryMap.$registerPwd.val(),
            regPwdRepeat = jqueryMap.$registerPwdRepeat.val(),
            regEmail = jqueryMap.$registerEmail.val(),
            data = {name: regName, password: regPwd,password_re: regPwdRepeat, email: regEmail};
        $.ajax({
            url: '/reg',
            type: 'POST',
            data: data,
            success:function(data, status){
                if(status == 'success') {
                    location.href = '/';
                }
            },
            error:function(data, status) {
                if(status == 'error'){
                    location.href = '/';
                }
            }
        });
    };

    var onClickLogout = function(){
        $.ajax({
            url : '/logout',
            type: 'GET',
            success: function(data, status) {
                if( status== 'success') {
                    location.href = '/';
                }
            },
            error: function() {
                if( status == 'error' ) {
                    location.href = '/';
                }
            }
        })
    };

    var onClickMainNavHome = function() {
        $.ajax({
            url : '/',
            type: 'GET',
            success: function(data, status) {
                if( status== 'success') {
                    location.href = '/';
                }
            },
            error: function() {
                if( status == 'error' ) {
                    location.href = '/';
                }
            }
        })
    };
    var onClickMainNavPost = function() {
        $.ajax({
            url : '/post',
            type: 'GET',
            success: function(data, status) {
                if( status== 'success') {
                    location.href = '/post';
                }
            },
            error: function() {
                if( status == 'error' ) {
                    location.href = '/';
                }
            }
        })
    };
    var onClickMainNavUpload = function() {
        $.ajax({
            url : '/upload',
            type: 'GET',
            success: function(data, status) {
                if( status== 'success') {
                    location.href = '/upload';
                }
            },
            error: function() {
                if( status == 'error' ) {
                    location.href = '/';
                }
            }
        })
    };

     // -------------------------- end event method ------------------------


    /*
     * 把所有的回调方法聚集在它们自己的区块里面。如果有回调函数，我们一般都会把它们放在事件
     * 处理程序和公开方法之间。它们是准公开方法，因为它们会被所服务的外部模块使用
     *
     * */


    // -------------------------- begin public method ------------------------
    /*
     *把所有的公开方法聚集在它们自己的区块里。这些方法是模块公开接口的部分。如果有的话，
     * 该区块应该包括configModule和initModule方法。
     *
     * */
    initModule = function () {
        setJqueryMap();
        jqueryMap.$loginClick.click(onClickLogin);
        jqueryMap.$searchBtn.focus(onClickSearch);
        jqueryMap.$searchBtn.blur(onBlurSearch);
        jqueryMap.$registerClick.click(onClickRegister);
        jqueryMap.$acctLogout.click(onClickLogout);
        jqueryMap.$mainNavHome.click(onClickMainNavHome);
        jqueryMap.$mainNavPost.click(onClickMainNavPost);
        jqueryMap.$mainNavUpload.click(onClickMainNavUpload);
        jqueryMap.$markdownTip.children().tooltip();
    }

    return { initModule: initModule };
     // -------------------------- end public method ------------------------
}());