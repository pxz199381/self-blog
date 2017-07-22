/**
 * Created by Administrator on 2017/7/7.
 */
const http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    connect = require('./module/mysql.js');
    // express是创建服务器的框架
    // express初始化
app = express();
// 响应浏览器的方法
// app.get('/',(req,res) => {
//     res.send('hello world')
// });
// 设置静态资源目录js\css\img,可以设置网址路径'abc',访问abc时才可访问静态资源目录

app.use(express.static(__dirname+'/public'))

//接收json数据（尤其是post方式）
app.use(bodyParser.json())
// 可接收任何数据类型
app.use(bodyParser.urlencoded({ extended: true }))

//密钥,互相通信之间的加密
app.use(cookieParser('pxz199381'))
// 用户信息保存在服务器上面,但关闭浏览器时会被清空
//所以在下次打开浏览器时先进行此数据库查询
app.use(session( {secret: 'pxz199381',resave: true,saveUninitialized: true}))

// 设置模板引擎的目录
app.set('views',__dirname+'/views')
// app.use('/abc',express.static(__dirname+'/public'))
// 设置使用的模板引擎
app.set('view engine','ejs')

// 在使用了cookie-parser插件后可以访问cookie，并在保存给本地locals
//要放在路由上面
app.use((req,res,next) => {
    // 登录后会保存当前账户基础信息，保存到cookie中
    if(req.cookies['login']){
        res.locals.logName = req.cookies.login.username;
        if(req.session.admin == undefined){
            connect('SELECT * FROM userinfo where username = ?',[res.locals.logName],(err,data) => {
                req.session.admin = Number(data[0]['admin']);
                // 继续往下执行
            })
            next();
        }
        res.locals.admin = req.session.admin;
    }
    next();
})
// 访问当前路径，交给index.js里的方法
app.use('/',require('./router/index.js'))
http.createServer(app).listen(238)
