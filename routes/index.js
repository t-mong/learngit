var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Comment = require('../models/comment.js');

module.exports = function(app) {
    app.get('/', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 10 篇文章
        Post.getTen(null, page, function (err, posts, total) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '主页',
                posts: posts,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 2 + posts.length) == total,
                user: req.session.user,
                success: req.session.success,
                error: req.session.error
            });
        });
    });

    app.post('/reg', checkNotLogin);
    app.post('/reg', function (req, res) {
        console.log(' app.post(/reg) ');
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body.password_re;
        if (password_re != password) {
            req.session.title = '注册失败';
            req.session.user = null;
            req.session.success = null;
            req.session.error = '两次输入的密码不一致';
            return res.sendStatus(404);
        }
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            name: name,
            password: password,
            email: req.body.email
        });
        User.get(newUser.name, function (err, user) {
            if (err) {
                req.session.title = '注册失败';
                req.session.user = null;
                req.session.success = null;
                req.session.error = err;
                return res.sendStatus(404);
            }
            if (user) {
                req.session.title = '注册失败，用户已存在';
                req.session.error = '用户已存在';
                return res.sendStatus(404);
            }
            newUser.save(function (err, user) {
                if (err) {
                    req.session.error = err;
                    return res.redirect('/reg');
                }
                req.session.title = '注册成功';
                req.session.user = user;
                req.session.success = '注册成功';
                req.session.error = null;
                res.sendStatus(200);
            });
        });
    });

    app.post('/login', checkNotLogin);
    app.post('/login', function (req, res) {
        console.log(' app.post(/login) ');
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        User.get(req.body.name, function (err, user) {
            if (!user) {
                req.session.title = '登录失败';
                req.session.user = null;
                req.session.success = null;
                req.session.error = '用户不存在';
                return res.sendStatus(404);
            }
            if (user.password != password) {
                req.session.title = '登录失败';
                req.session.user = null;
                req.session.success = null;
                req.session.error = '密码错误';
                return res.sendStatus(404);
            }
            req.session.title = '登录成功';
            req.session.user = user;
            req.session.success = '登录成功';
            req.session.error = null;
            res.sendStatus(200);
        });
    });

    app.get('/post', checkLogin);
    app.get('/post', function (req, res) {
        console.log(' app.get(/post) ');
        res.render('post', {
            title: '发表',
            user: req.session.user,
            success: req.session.success,
            error: req.session.error
        });
    });

    app.post('/post', checkLogin);
    app.post('/post', function (req, res) {
        console.log('app.post(/post)')
        var currentUser = req.session.user,
            tags = [req.body.tag1, req.body.tag2, req.body.tag3],
            post = new Post(currentUser.name, currentUser.head, req.body.title, tags, req.body.post);
        post.save(function (err) {
            if (err) {
//                req.flash('error', err);
                req.session.error = err;
                return res.redirect('/');
            }
            req.session.title = '主页';
            req.session.success = '发布成功';
            req.session.error = null;
            res.redirect('/');//发表成功跳转到主页
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function (req, res) {
        console.log(' app.get(/logout) ');
        req.session.title = '登出成功';
        req.session.user = null;
        req.session.success = '登出成功';
        req.session.error = null;
        res.sendStatus(200);
    });

    app.get('/upload', checkLogin);
    app.get('/upload', function (req, res) {
        console.log('文件上传');
        res.render('upload', {
            title: '文件上传',
            user: req.session.user,
            success: req.session.success,
            error: req.session.error
        });
    });
    app.post('/upload', checkLogin);
    app.post('/upload', function (req, res) {
        req.session.title = "上传成功";
        req.session.success = "文件上传成功";
        res.redirect('/upload');
    });

    app.get('/archive', function (req, res) {
        Post.getArchive(function (err, posts) {
            if (err) {
//                req.flash('error', err);
                req.session.error = err;
                return res.redirect('/');
            }
            res.render('archive', {
                title: '存档',
                posts: posts,
                user: req.session.user,
//                success: req.flash('success').toString(),
                success: req.session.success,
//                error: req.flash('error').toString()
                error: req.session.error
            });
        });
    });

    app.get('/tags', function (req, res) {
        Post.getTags(function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('tags', {
                title: '标签',
                posts: posts,
                user: req.session.user,
//                success: req.flash('success').toString(),
                success: req.session.success,
//                error: req.flash('error').toString()
                error: req.session.error
            });
        });
    });

    app.get('/tags/:tag', function (req, res) {
        Post.getTag(req.params.tag, function (err, posts) {
            if (err) {
                req.flash('error',err);
                return res.redirect('/');
            }
            res.render('tag', {
                title: 'TAG:' + req.params.tag,
                posts: posts,
                user: req.session.user,
//                success: req.flash('success').toString(),
                success: req.session.success,
//                error: req.flash('error').toString()
                error: req.session.error
            });
        });
    });


    app.get('/search', function (req, res) {
        Post.search(req.query.keyword, function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('search', {
                title: "SEARCH:" + req.query.keyword,
                posts: posts,
                user: req.session.user,
//                success: req.flash('success').toString(),
                success:req.session.success,
//                error: req.flash('error').toString()
                error: req.session.error
            });
        });
    });

    app.get('/u/:name', function (req, res) {
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //检查用户是否存在
        User.get(req.params.name, function (err, user) {
            if (!user) {
                req.session.error = '用户不存在';
                return res.redirect('/');
            }
            //查询并返回该用户第 page 页的 10 篇文章
            Post.getTen(user.name, page, function (err, posts, total) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('user', {
                    title: user.name,
                    posts: posts,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * 2 + posts.length) == total,
                    user: req.session.user,
//                    success: req.flash('success').toString(),
                    success: req.session.success,
//                    error: req.flash('error').toString()
                    error: req.session.error
                });
            });
        });
    });

    app.get('/u/:name/:day/:title', function (req, res) {
        Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
            if (err) {
//                req.flash('error', err);
                req.session.error = err;
                return res.redirect('/');
            }
            res.render('article', {
                title: req.params.title,
                post: post,
                user: req.session.user,
//                success: req.flash('success').toString(),
                success: req.session.success,
//                error: req.flash('error').toString()
                error: req.session.error
            });
        });
    });

    app.post('/u/:name/:day/:title', function (req, res) {
        var date = new Date(),
            time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        var md5 = crypto.createHash('md5'),
            email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
            head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
        var comment = {
            name: req.body.name,
            head: head,
            email: req.body.email,
            website: req.body.website,
            time: time,
            content: req.body.content
        };
        var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
        newComment.save(function (err) {
            if (err) {
//                req.flash('error', err);
                req.session.error = err;
                return res.redirect('back');
            }
//            req.flash('success', '留言成功!');
            req.session.success = '留言成功';
            res.redirect('back');
        });
    });

    app.get('/edit/:name/:day/:title', checkLogin);
    app.get('/edit/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.edit(currentUser.name, req.params.day, req.params.title, function (err, post) {
            if (err) {
//                req.flash('error', err);
                req.session.error = err;
                return res.redirect('back');
            }
            res.render('edit', {
                title: '编辑',
                post: post,
                user: req.session.user,
//                success: req.flash('success').toString(),
                success: req.session.success,
//                error: req.flash('error').toString()
                error: req.session.error
            });
        });
    });

    app.post('/edit/:name/:day/:title', checkLogin);
    app.post('/edit/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
            var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
            if (err) {
//                req.flash('error', err);
                req.session.error = err;
                return res.redirect(url);//出错！返回文章页
            }
//            req.flash('success', '修改成功!');
            req.session.success = '修改成功';
            res.redirect(url);//成功！返回文章页
        });
    });

    app.get('/remove/:name/:day/:title', checkLogin);
    app.get('/remove/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
            if (err) {
//                req.flash('error', err);
                req.session.error = err;
                return res.redirect('back');
            }
//            req.flash('success', '删除成功!');
            req.session.success = '删除成功' ;
            res.redirect('/');
        });
    });

    app.get('/reprint/:name/:day/:title', checkLogin);
    app.get('/reprint/:name/:day/:title', function (req, res) {
        Post.edit(req.params.name, req.params.day, req.params.title, function (err, post) {
            if (err) {
                req.flash('error', err);
                return res.redirect(back);
            }
            var currentUser = req.session.user,
                reprint_from = {name: post.name, day: post.time.day, title: post.title},
                reprint_to = {name: currentUser.name, head: currentUser.head};
            Post.reprint(reprint_from, reprint_to, function (err, post) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('back');
                }
                req.flash('success', '转载成功!');
                var url = encodeURI('/u/' + post.name + '/' + post.time.day + '/' + post.title);
                //跳转到转载后的文章页面
                res.redirect(url);
            });
        });
    });


    app.post('/logout', checkNotLogin);
    app.post('/logout', function (req, res) {
        console.log(' app.get(/logout) ');
        req.session.title = '登出成功';
        req.session.user = null;
        req.session.success = '登出成功';
        req.session.error = null;
        res.sendStatus(200);
    });

    app.use(function (req, res) {
        res.render("404");
    });
    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.session.title = '登录失败';
            req.session.user = null;
            req.session.success = null;
            req.session.error = '未登录';
            res.redirect('/');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.session.title = '已登录';
            req.session.success = null;
            req.session.error = '已登录';
            res.redirect('/');
        }
        next();
    }
};