const express = require('express'),
    router = express.Router(),
    connect = require('../module/mysql.js'),
    crypto = require('crypto'),
    multer = require('../module/multer.js'),
    upload = multer.single('userpic'),
    fs = require('fs'),
    path = require('path');

router.use((req,res,next) => {
   if(res.locals.userAdmin){
       next();
   }else{
       res.send('请用管理员身份登录');
   }
})


router.get('/user',(req,res) => {
    connect('select * from userinfo',(err,data) => {
        res.render('admin/user',{data: data})
    })
})
router.post('/user',(req,res) => {
    connect('delete from userinfo where id =?',[req.body.dId]);
    res.json({
        status: '删除成功'
    })

})

// 直接通过URL追加的方式传过来的js对象会被序列化为JSON
router.get('/user/edit',(req,res) => {
    var result = JSON.parse(req.query['json']);
    res.locals.userEdit = true;
    res.render('register',{data: result})
})
router.post('/user/edit',(req,res,next) => {
    //multer错误处理中间件
    //两种错误：1、文件大于1mb 2、文件类型不匹配
    //err.code只能接收第一种，所以把第二种错误以请求信息发过来
    //两种错误都保存的形式都为req.err
    upload(req,res,(err) => {
        if(err){
            if(err.code === 'LIMIT_FILE_SIZE'){
                req.err = { result: 'fail', error: { code: 1001, message: 'File is too big' } };
                next();
            }
            next();
        }
        next();
    })
},
    (req,res,next) => {
    //如果有错误信息，则渲染错误模板,否则正常处理
    if(req.err){
        res.send(req.err.error);
    }else{
        const uid = req.body.uid,
            name = req.body.usname,
            word = req.body.psword,
            nick = req.body.nkname,
            md5 = crypto.createHash('md5'),
            tm = new Date().toLocaleString().substring(0,18);
        // 查询条件：未注册过的
        //path.sep跟操作系统有关
        var sep = path.sep;
        //获取源图片的文件夹名
        var oldPic = req.file.path;
        var oldDir = path.dirname(oldPic);
        var fileName = path.basename(oldPic);
        //设置新的文件夹名
        var newDir = path.join(oldDir,'userpic','user_'+uid);
        var newFileName = path.join(newDir,fileName);
        //删除原图片
        var removePic = function(resolve){
            fs.unlinkSync(oldPic);
            console.log('删除图片'+oldPic+'成功');
            resolve();
        }
        //清空文件夹
        var clearDir = function(resolve){
            //读取该文件夹
            var files = fs.readdirSync(newDir);
            files.forEach(function(file){
                //删除文件
                fs.unlinkSync(newDir+sep+file);
                console.log('删除图片'+newDir+sep+file+'成功');
                resolve();
            })
        }
        //将源图片copy到目的文件夹下
        var copyPic = function(resolve,reject){
            var readStream = fs.createReadStream(req.file.path);
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
                typeof(resolve) !== 'function' || resolve();
            })
        }
        var promisify = function(func){
            return function(){
                return new Promise(function(resolve,reject){
                    func(resolve,reject);
                })
            }
        }
        var pro_arr = [promisify(clearDir),promisify(copyPic),promisify(removePic)];
        pro_arr.reduce(function(cur,next){
            return cur.then(next);
        },Promise.resolve())
            .then(function(){
                connect('select * from userinfo where username = ?',[name],
                    (err,data) => {
                        if(data.length === 0){
                            // md5算法加密方式，通过crypto加密模块引入， hex为编码格式
                            var newWord = md5.update(word).digest('hex');
                            //将图片地址转化为页面能识别的格式
                            var split = newFileName.split(path.sep);
                            var slice = split.slice(split.length-2);
                            var join = slice.join('/');
                            var picUrl = `/img/userpic/${join}`;
                            connect('update userinfo set username=?,password=?,nickname=?,pic=? where id=?',
                                [name,newWord,nick,picUrl,uid],
                                (err,data) => {
                                    if(err){
                                        res.render('err');
                                        console.log(err);
                                    }
                                    // 有提交则显示提交，无提交则不显示
                                    res.send('提交成功');
                                })
                        }else{
                            res.render('err');
                        }
                    })
            })
            .catch(function(err){
                console.log('reject');
                console.log(err);
            })
    }
})

router.get('/user/delete',(req,res) => {
    console.log(req.query);
    connect('delete from userinfo where id =?',[req.query.id],
        (err,data) => {
            if(err){
                console.log(err);
            }
            res.redirect('back');
        })
})

router.get('/article',(req,res) => {
    //获取上一篇文章id
    connect('select * from article order by id desc limit 0,1',(err,data) => {
        if(err){
            console.log(err);
        }
        var pId = data[0].id+1;
        res.render('admin/article',{pId: pId})
    })
})
//upload.single(''),接收单个文件对应form中上传文件标签的name
//upload.array('',length)，接收多个文件,接收为req.files
//upload.fields({name: 'a',maxCount: n},{name: 'b',maxCount: n})
//fields接收：req.files['a'][0]==>某一个文件 req.files['b']==>多个文件组
//req.file保存着上传信息
router.post('/article',(req,res) => {
    const tt = req.body.title,
        tg = req.body.tag,
        cate = req.body.category,
        au = req.body.author,
        summ = req.body.summary,
        con = req.body.content,
        uId = req.session.user.id,
        tm = new Date().toLocaleString().substring(0,18);
    var pId,
        tSplit = tg.split('\\');;
        //将多个tag分别提取出来，存放到tag表格
    connect('insert into article (id,uid,title,category,author,summary,content,time) values (0,?,?,?,?,?,?,?)',
        [uId,tt,cate,au,summ,con,tm],(err,data1) => {
            if(err){
                console.log(err);
                res.status(404).send('提交失败')
            }
            connect('select * from article order by id desc limit 0,1',(err,data2) => {
                if(err){
                    console.log(err);
                }
                pId = data2[0]['id'];
                tSplit.forEach(function(item){
                    connect('insert into tag (id,pid,tagname) values (0,?,?)',[pId,item],
                        (err,data) => {
                            if(err){
                                console.log(err);
                            }
                        })
                })
            })
            res.send('提交成功')
        })
})
module.exports = router;

