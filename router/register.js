/**
 * Created by Administrator on 2017/7/19.
 */
const express = require('express'),
    router = express.Router(),
connect = require('../module/mysql.js'),
crypto = require('crypto');

router.get('/',(req,res) => {
    res.render('register')
})
router.post('/',(req,res) => {
    const name = req.body.usname,
        word = req.body.psword,
    md5 = crypto.createHash('md5');
    // 查询条件：未注册过的
    connect('select * from userinfo where username = ?',[name],
        (err,data) => {
            if(data.length === 0){
                // md5算法加密方式，通过crypto加密模块引入， hex为编码格式
                let newWord = md5.update(word).digest('hex');
                connect('insert into userinfo (id,username,password,admin) values (0,?,?,false)', [name,newWord],
                    (err,data) => {
                        if(err){
                            res.render('err');
                            return;
                        }
                        // 有提交则显示提交，无提交则不显示
                        res.locals.result = '注册成功，去登陆';
                        res.locals.show = true;
                        res.render('register');
                    })
            }else{
                res.render('err');
            }
        })
})
module.exports = router;