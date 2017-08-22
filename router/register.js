const express = require('express'),
    router = express.Router(),
    connect = require('../module/mysql.js'),
    crypto = require('crypto'),
    multer = require('../module/multer.js'),
    upload = multer.single('userpic'),
    fs = require('fs'),
    path = require('path');

router.get('/',(req,res) => {
    res.render('register')
})
router.post('/',(req,res,next) => {
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
},(req,res,next) => {
    //如果有错误信息，则渲染错误模板,否则正常处理
    if(req.err){
        res.send(req.err.error);
    }else{
        const name = req.body.usname,
            word = req.body.psword,
            nick = req.body.nkname,
            md5 = crypto.createHash('md5'),
            tm = new Date().toLocaleString().substring(0,18);
        // 查询条件：未注册过的
        //path.sep跟操作系统有关
        var sep = path.sep;
        //获取源图片的文件夹名
        var oldDir = path.dirname(req.file.path);
        //设置新的文件夹名
        var newDir,newFileName;
        //生成目录
        var createDir = function(resolve,reject){
            connect('select * from userinfo order by id desc limit 0,1',(err,data) => {
                if(err){
                    reject(err);
                }else{
                    //新id
                    if(data[0]){
                        var newId = data[0]['id']+1;
                    }
                    else{
                        var newId = 1;
                    }
                    //设置新的文件夹名
                    newDir = path.join(oldDir,'userPic',`user_${newId}`);
                    //获取新的文件名
                    newFileName = path.join(newDir,path.basename(req.file.path));
                    //创建目录
                    //判断url是文件夹名或是文件名
                    if(!path.extname(newDir)){
                        if(!fs.existsSync(newDir)){
                            fs.mkdirSync(newDir);
                            typeof(resolve) !== 'function' || resolve();
                        }
                    }else{
                        var folders = path.dirname(newDir).split(sep);
                        var p = '';
                        while(folders.length){
                            p += folders.shift() + sep;
                            if(!fs.existsSync(p)){
                                fs.mkdirSync(p);
                                typeof(resolve) !== 'function' || resolve();
                            }
                        }
                    }
                }
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
                console.log('复制图片'+newFileName+'成功');
                typeof(resolve) !== 'function' || resolve();
            })
        }
        //删除原图片
        var removePic = function(resolve){
            fs.unlinkSync(req.file.path);
            console.log('删除图片'+req.file.path+'成功');
            resolve();
        }
        var promisify = function(func){
            return function(){
                return new Promise(function(resolve,reject){
                    func(resolve,reject);
                })
            }
        }
        var pro_arr = [promisify(createDir),promisify(copyPic),promisify(removePic)];
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
                            connect('insert into userinfo (id,username,password,nickname,pic,regtime) values (0,?,?,?,?,?)',
                                [name,newWord,nick,picUrl,tm],
                                (err,data) => {
                                    if(err){
                                        res.render('err');
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

module.exports = router;