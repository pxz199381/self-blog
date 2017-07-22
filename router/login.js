/**
 * Created by Administrator on 2017/7/19.
 */
const express = require('express'),
    router = express.Router(),
    connect = require('../module/mysql.js'),
crypto = require('crypto');
router.get('/',(req,res) => {
    res.render('login')
})
router.post('/',(req,res) => {
    const name = req.body.name,
        word = req.body.word,
    md5 = crypto.createHash('md5');
    // 同样登录的密码需要和注册时一样的加密方式才能比较
    const newWord = md5.update(word).digest('hex');
    connect('select * from userinfo where username = ?',[name],
        (err,data) => {
            if(data.length === 0){
                // 用ajax就不能用render方式传递数据
                // res.render('err');
                res.send('用户名不存在');
                return;
            }else{
                if(data[0]['password'] == newWord){
                    // 为了保存登录的信息设置cookie,如果有则视为登录状态
                    // 1 cookie名称2 数据3 过期时间
                    // 而且要放在发送数据前面
                    res.cookie('login',{username: name,password: newWord},{maxAge: 1000*60*60*24})
                    // 保存是否是管理员的信息，注意是req.session
                    // session是所有后台页面可以访问到的
                    // res.locals是只有当前页面可以访问到
                    req.session.admin = Number(data[0]['admin']);
                    res.json({
                        status: '登录成功'
                    })
                }else{
                    res.send('账号或密码错误')
                }
            }
        })
})
module.exports = router;