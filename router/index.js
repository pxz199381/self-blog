const express = require('express'),
    router = express.Router(),
    connect = require('../module/mysql.js'),
    io = require('../app.js').io,
    Q = require('q'),
    multer = require('../module/multer.js'),
    fs = require('fs'),
    path = require('path'),
    unitFunction = require('../module/unit-function');

router.get('/',(req,res) => {
    //给页面发送当前页面的id值
    const status = req.query.st;
    //根据穿过来的页数更新文章
    connect('select * from article order by time desc limit ?,3',[(req.query.page-1)*3||0],
        (err,dataList) => {
        var pList = [];
        var coms = [];
        //传给promise函数的第三个参数
        if(err){
            console.log(err);
        }
        unitFunction.indexPro(dataList,pList,coms);
        //当所有id都修改完成后再渲染模板
        pList.reduce(function(cur,next){
            return cur.then(next);
        },Promise.resolve())
            .then(function(){
                //获取文章总数
                connect('select * from article order by id desc',(err,dataAll) => {
                    if(err){
                        console.log(err);
                    }
                    //接收删除文章的flag为true，只有flag为true才生成弹窗事件
                    res.render('index',{
                        indexDatas: dataList,
                        indexComs: coms,
                        indexPages: dataAll.length
                    })
                })
            }).catch(function(err){
            console.log('reject');
            console.log(err);
        })
    })
})

router.get('/tag',(req,res) => {
    //获取当前标签，并发送到渲染的页面
    var tagName = req.query.tagname;
    res.locals.tagName = tagName;
    //获取热门标签的文章id
    connect('select * from tag where tagname =? order by pid desc limit ?,3',[tagName,(req.query.page-1)*3||0],
        (err,pTag) => {
            if(err){
                console.log(err);
            }else{
                var proList = [];
                var dataList = [];
                var coms = [];
                //根据文章id查询文章信息
                pTag.forEach(function(item){
                    proList.push(getArticle(item));
                    function getArticle(val){
                        return function(){
                            return new Promise(function(resolve,reject){
                                connect('select * from article where id =?',[val['pid']],
                                    (err,tArticles) => {
                                        if(err){
                                            console.log(err);
                                        }
                                        dataList.push(tArticles)
                                        resolve();
                                    })
                            })
                        }
                    }
                })
                proList.reduce(function(cur,next){
                    return cur.then(next)
                    },Promise.resolve())
                    .then(function(){
                        proList = [];
                        unitFunction.tagPro(dataList,proList,coms);
                        proList.reduce(function(cur,next){
                            return cur.then(next);
                        },Promise.resolve())
                            .then(function(){
                                connect('select * from tag where tagname =? order by pid desc',[tagName],
                                    (err,pageAll) => {
                                        if(err){
                                            console.log(err);
                                        }else{
                                            res.render('tag',{
                                                tagDatas: dataList,
                                                tagComs: coms,
                                                tagPages: pageAll.length
                                            });
                                        }
                                    })
                            }).catch(function(err){
                            console.log(err);
                        })
                    })
            }
        })
})

router.get('/essay/:date.html',(req,res) => {
    var rDate = req.params.date;
    res.locals.essayName = rDate;
    connect('select * from article where date(time) = str_to_date(?,"%Y-%m-%d") order by time desc limit ?,3',[rDate,(req.query.page-1)*3||0],
        (err,essays) => {
            var pList = [];
            var coms = [];
            //传给promise函数的第三个参数
            if(err){
                console.log(err);
            }
            unitFunction.indexPro(essays,pList,coms);
            //当所有id都修改完成后再渲染模板
            pList.reduce(function(cur,next){
                return cur.then(next);
            },Promise.resolve())
                .then(function(){
                    //获取文章总数
                    connect('select * from article where date(time) = str_to_date(?,"%Y-%m-%d")',[rDate],
                        (err,dataAll) => {
                        if(err){
                            console.log(err);
                        }
                        //接收删除文章的flag为true，只有flag为true才生成弹窗事件
                        res.render('essay',{
                            essayDatas: essays,
                            essayComs: coms,
                            essayPages: dataAll.length
                        })
                    })
                }).catch(function(err){
                console.log('reject');
                console.log(err);
            })
        })
})

router.get('/document',(req,res) => {
        connect('select * from article where category = "文档教程" order by time desc limit ?,3',[(req.query.page-1)*3||0],
            (err,documents) => {
                var pList = [];
                var coms = [];
                //传给promise函数的第三个参数
                if(err){
                    console.log(err);
                }
                unitFunction.indexPro(documents,pList,coms);
                //当所有id都修改完成后再渲染模板
                pList.reduce(function(cur,next){
                    return cur.then(next);
                },Promise.resolve())
                    .then(function(){
                        //获取文章总数
                        connect('select * from article where category = "文档教程" order by id desc',(err,dataAll) => {
                            if(err){
                                console.log(err);
                            }
                            //接收删除文章的flag为true，只有flag为true才生成弹窗事件
                            res.render('document',{
                                docDatas: documents,
                                docComs: coms,
                                docPages: dataAll.length
                            })
                        })
                    }).catch(function(err){
                    console.log('reject');
                    console.log(err);
                })
            })
    })

router.get('/summary',(req,res) => {
    connect('select * from article where category = "个人总结" order by time desc limit ?,3',[(req.query.page-1)*3||0],
        (err,summarys) => {
            var pList = [];
            var coms = [];
            //传给promise函数的第三个参数
            if(err){
                console.log(err);
            }
            unitFunction.indexPro(summarys,pList,coms);
            //当所有id都修改完成后再渲染模板
            pList.reduce(function(cur,next){
                return cur.then(next);
            },Promise.resolve())
                .then(function(){
                    //获取文章总数
                    connect('select * from article where category = "个人总结" order by id desc',(err,dataAll) => {
                        if(err){
                            console.log(err);
                        }
                        //接收删除文章的flag为true，只有flag为true才生成弹窗事件
                        res.render('summary',{
                            summDatas: summarys,
                            summComs: coms,
                            summPages: dataAll.length
                        })
                    })
                }).catch(function(err){
                console.log('reject');
                console.log(err);
            })
        })
})

router.post('/article/inputPic',multer.array('inputPic',10),(req,res) => {
    //path.sep跟操作系统有关
    var sep = path.sep;
    //获取源图片的文件夹名
    var oldDir = path.dirname(req.files[0].path);
    //设置新的文件夹名
    var newDir = path.join(oldDir,'articlePic',`article_${req.body.pid}`);
    //创建promise队列
    var proList = [];
    //创建Promise函数
    var promisify = function(func){
        return function(){
            return new Promise(function(resolve,reject){
                func(resolve,reject);
            })
        }
    }
    //创建目录函数
    var createFolder = function(resolve){
        //判断url是文件夹名或是文件名
        if(!path.extname(newDir)){
            if(!fs.existsSync(newDir)){
                fs.mkdirSync(newDir);
                resolve();
                console.log('添加目录'+newDir+'成功');
            }else{
                resolve();
            }
        }else{
            var folders = path.dirname(newDir).split(sep);
            var p = '';
            while(folders.length){
                p += folders.shift() + sep;
                if(!fs.existsSync(p)){
                    fs.mkdirSync(p);
                    resolve();
                }else{
                    resolve();
                }
            }
        }
    }
    proList.push(promisify(createFolder))
    //将源图片copy到目的文件夹下
    req.files.forEach(function(item){
        proList.push(copyPro(item));
        //获取新的文件名
        function copyPro(item){
            return function(){
                return new Promise(function(resolve,reject){
                    var newFileName = path.join(newDir,path.basename(item.path));
                    var readStream = fs.createReadStream(item.path);
                    var writeStream = fs.createWriteStream(newFileName);
                    //当有数据流出时，写入数据
                    readStream.on('data',function(chunk){
                        if(writeStream.write(chunk) === false){
                            //如果缓冲区已满，暂停读取流
                            readStream.pause();
                        }
                    });
                    writeStream.on('drain',function(){
                        //写完后，继续读取
                        readStream.resume();
                    })
                    readStream.on('end',function(){
                        //没有数据时，关闭数据流
                        writeStream.end();
                        console.log('复制图片'+newFileName+'成功');
                        resolve();
                    })
                })
            }
        }

    });
    //将原图片删除
    req.files.forEach(function(item){
        proList.push(removePro(item));
        function removePro(item){
            return function(){
                return new Promise(function(resolve,reject){
                    fs.unlinkSync(item.path);
                    console.log('删除图片'+item.path+'成功');
                    resolve();
                })
            }
        }
    })
    proList.reduce(function(cur,next){
            return cur.then(next);
        },
        Promise.resolve())
        .then(function(){
            res.send('上传图片成功');
        })
        .catch(function(err){
            console.log('reject');
            console.log(err);
        })
})

var roomInfo = {};
//on用来监听事件 connection:当打开前端页面时触发
io.on('connection', socket => {
    var user = '';
    //获取socket连接用户的url
    var url = socket.request.headers.referer;
    var splitUrl = url.split('/');
    //提取到房间号信息
    var roomUrl = splitUrl[splitUrl.length-1];
    //过滤掉.html后缀
    var room = roomUrl.replace(/\.html$/,'');
    //响应某用户的加入房间请求
    socket.on('join',function(userName){
        // var dTime = Date.now();
        user = userName;
        //同时新建数组，保存着所有用户的昵称
        if(!roomInfo[room]){
            roomInfo[room] = [];
        }
        roomInfo[room].push(userName);
        //进入房间
        socket.join(room);
        //进入时的动态信息（提示信息，人员列表）
        //这里要用io不能用socket
        io.sockets.to(room).emit('sys',user+'加入了房间',roomInfo[room]);
        socket.emit('time',true);
        //在服务器提示用户进入信息
        console.log(user + '加入了' + room);
    })
    //响应离开房间请求
    socket.on('leave',function(){
        socket.emit('disconnect');
    })
    //离开房间
    socket.on('disconnect',function(){
        //删除昵称
        var index = roomInfo[room].indexOf(user);
        if(index != -1){
            roomInfo[room].splice(index,1);
        }
        //这个先后顺序很重要，如果在leave后面，则前台接收不到该信息
        io.sockets.in(room).emit('sys',user+'退出了房间',roomInfo[room]);
        socket.leave(room);
        //离开时的动态信息（提示信息，人员列表）
        //在服务器提示用户退出信息
        console.log(user + '退出了' + room);
    })
    //接收聊天信息
    socket.on('message',function(msg){
        //判断用户是否在聊天室
        if(roomInfo[room].indexOf(user) === -1){
            return false;
        }
        io.sockets.to(room).emit('msg',user,msg);
    })

})

router.get('/article/articleDetail/:id.html',(req,res) => {
    const rId = req.params.id;
    connect('update article set count = count + 1 where id =?',[rId]);
    connect('select * from article where id =?',[rId],
        (err,data) => {
            if(err){
                console.log(err);
            }
            if(data.length === 0){
                res.status(404).render('err')
            }
            //从评论数据库抽取最新的两条显示出来
            connect('select * from comments where pid =? order by id desc limit 0,2',[rId],
                (cErr,cData) => {
                    var pList = [];
                    if(err){
                        console.log(cErr);
                    }
                    //获取发表评论用户的账号，并输出到模板里
                    cData.forEach(function(item){
                        pList.push(pro(item));
                        function pro(val){
                            var p = new Promise(function(resolve,reject){
                                connect('select * from userinfo where id = ?',[val['uid']],
                                    (err,user) => {
                                        if(err){
                                            reject(err);
                                        }else{
                                            val['uid'] = user[0]['username'];
                                            resolve();
                                        }
                                    })
                            })
                            return p;
                        }
                    })
                    Promise.all(pList).then(function(){
                        res.render('article/articleDetail',{
                            data: data,
                            cData: cData
                        })
                    })
                })
        })

})
router.post('/article/articleDetail/:id.html',(req,res) => {
    const nTime = new Date().toLocaleString().substring(0,18),
        uId = req.session.user.id;
    connect('insert into comments (id,uid,pid,content,time) values (0,?,?,?,?)',
    [uId,req.params.id,req.body.content,nTime],(err,data) => {
            if(err){
                console.log(err);
            }
            res.json({
                status: "发表成功"
            })
        })
})

router.get('/article/articleEdit/:id.html',(req,res) => {
    const rId = req.params.id;
    var tList = [];
    res.locals.isEdit = true;
    connect('select * from article where id =?',[rId],
        (err,data) => {
            if(err){
                console.log(err);
            }
            connect('select * from tag where pid =?',[rId],
                (err,tags) => {
                    if(err){
                        console.log(err);
                    }
                    tags.forEach(function(item){
                        tList.push(item.tagname);
                    })
                    var rTag = tList.join('\\');
                    res.render('admin/article',{data: data[0],tag: rTag})
                })
        })
})
router.post('/article/articleEdit/:id.html',(req,res) => {
    const pId =  req.params.id,
        tt = req.body.title,
        tg = req.body.tag,
        cate = req.body.category,
        au = req.body.author,
        summ = req.body.summary,
        con = req.body.content,
        uId = req.session.user.id,
        tm = new Date().toLocaleString().substring(0,18);
        var tSplit = tg.split('\\');
    // 将多个tag分别提取出来，存放到tag表格
    //update更新数据时limit只能有一个值，表示更新多少行后停止，不能跳过多少行再更新
    connect('update article set uid=?,title=?,category=?,author=?,summary=?,content=?,time=? where id = ?',
        [uId,tt,cate,au,summ,con,tm,pId],(err,article) => {
            if(err){
                console.log(err);
                res.status(404).send('提交失败')
            }
            connect('select * from tag where pid=? order by id',[pId],
                (err,tags) => {
                    tags.forEach(function(item,index){
                        connect('update tag set tagname=? where id=?',[tSplit[index],item['id']],
                            (err,tag) => {
                                if(err){
                                    console.log(err);

                                }
                            })
                    })
                })
            res.send('提交成功')
        })
})

router.get('/article/articleDelete/:id.html',(req,res,next) => {
    connect('select * from article where id =?',[req.params.id],
        (err,data) => {
            if(err){
                console.log(err);
            }
            if(data.length === 0){
                res.status(404).render('err');
                return;
            }
            connect('delete from article where id =?',[req.params.id],
                (err,data) => {
                    if(err){
                        console.log(err);
                    }
                    res.redirect('back');
                })
        })
})

router.get('/chat/:room.html',(req,res,next) => {
    if(res.locals.user){
        next();
    }else{
        next();
    }
},(req,res) => {
    var room = req.params.room;
    res.locals.room = room;
    res.locals.userList = roomInfo[room];
    res.render('chat');
})

router.use('/register',require('./register.js'))

router.use('/login',require('./login.js'))

router.use('/admin',require('./admin.js'))


router.get('/logout',(req,res) => {
    //把在线信息更新了
    connect('update userinfo set state = 0 where id = ?',[req.session.user.id],
        (err,data) => {
            if(err){
                console.log(err);
            }
            // 清除session和cookie
            res.clearCookie('saveId');
            delete req.session.user;
            // 网址重定向
            res.redirect('/')
        })
})
module.exports = router;