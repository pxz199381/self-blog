/**
 * Created by Administrator on 2017/7/19.
 */
const express = require('express'),
    router = express.Router(),
connect = require('../module/mysql.js'),
crypto = require('crypto');

router.use((req,res,next) => {
   if(req.session.admin){
       next();
   }else{
       res.send('请用管理员身份登录');
   }
})

router.get('/',(req,res) => {
    res.render('admin/admin')
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

router.get('/user/edit',(req,res) => {
    var result = JSON.parse(req.query['json'])
    res.render('admin/edit',{data: result})
})
router.post('/user/edit',(req,res) => {
    const name = req.body.nm,
        ad = req.body.ad,
        id = req.body.id;
    connect('update userinfo set username =?,admin =? where id = ?',[name,ad,id],
        (err,data) => {
            console.log(err);
        });
    res.json({
        status: '编辑成功'
    })
})

router.get('/user/add',(req,res) => {
    // 查询最后(id最大)的数据
    connect('select * from userinfo order by id desc limit 1',
        (err,data) => {
            res.locals.newId = data[0].id+1;
            res.render('admin/add')
        })
})
router.post('/user/add',(req,res) => {
    const nId = req.body.id,
        name = req.body.nm,
        word = req.body.wd,
        admn = req.body.ad;
    const md5 = crypto.createHash('md5');
    connect('select * from userinfo where username = ?',[name],(err,data) => {
        console.log(name);
        console.log(data);
        if(data.length === 0){
            const newWd = md5.update(word).digest('hex');
            connect('insert into userinfo (id,username,password,admin) values (?,?,?,?)',
            [nId,name,newWd,admn],(err,data) => {
                    if(err){
                        console.log(err);
                    }
                    res.json({
                        status: '添加成功'
                    })
                })
        }else{
            res.send('您的账号已被已被注册')
        }
    })
})
module.exports = router;

router.get('/article',(req,res) => {
    res.render('admin/article')
})