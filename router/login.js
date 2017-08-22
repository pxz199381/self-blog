/**
 * Created by Administrator on 2017/7/19.
 */
const express = require('express'),
    router = express.Router(),
    connect = require('../module/mysql.js'),
crypto = require('crypto');

router.get('/',(req,res) => {
    if(res.locals.user){
        res.redirect('../')
    }else{
        res.render('login')
    }
})
router.post('/',(req,res) => {
    const name = req.body.name,
        word = req.body.word
        save = req.body.isSave,
    md5 = crypto.createHash('md5');
    // 同样登录的密码需要和注册时一样的加密方式才能比较
    const newWord = md5.update(word).digest('hex');
    connect('select * from userinfo where username = ?',[name],
        (err,lData) => {
            if(lData.length === 0){
                res.send('用户名不存在');
                return;
            }else{
                if(lData[0]['password'] == newWord){
                    // 更新在线状态
                    connect('update userinfo set state = 1 where id = ?',[lData[0]['id']],
                        (err,sData) => {
                            if(err){
                                console.log(err);
                            }
                            connect('select * from userinfo where id = ?',[lData[0]['id']],
                                (err,uData) => {
                                   if(err){
                                       console.log(err);
                                   }
                                   req.session.user = uData[0];
                                   //如果保存记录，则设置保存时间
                                   if(save){
                                       req.session.cookie.maxAge = 1000*60*60*24;
                                       res.cookie('saveId',{name: req.session.user.id},{maxAge: 1000*60*60*24});
                                   }else{
                                       res.cookie('saveId',{name: req.session.user.id});
                                   }
                                   res.json({
                                        status: '登录成功'
                                   })
                                })
                        })
                }else{
                    res.send('账号或密码错误')
                }
            }
        })
})
module.exports = router;