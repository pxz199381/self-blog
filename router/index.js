const express = require('express'),
    router = express.Router(),
    connect = require('../module/mysql.js');
router.get('/',(req,res) => {
    res.render('index')
})
router.use('/register',require('./register.js'))
router.use('/login',require('./login.js'))
router.use('/admin',require('./admin.js'))
router.get('/logout',(req,res) => {
        // 清除cookie
    res.clearCookie('login')
    // 网址重定向
    res.redirect('/')
})
module.exports = router;