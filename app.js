const http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    fs = require('fs'),
    ws = require('socket.io'),
    app = express(),
    marked = require('marked'),
    connect = require('./module/mysql.js');
//先连接一次http连接，并发送ws连接请求
// 服务器响应，建立ws连接
let wsServer =  http.createServer(app).listen(238);
let io = ws(wsServer);

    // express是创建服务器的框架
    // express初始化
// 响应浏览器的方法
module.exports = {
    app: app,
    io: io
};

// 设置静态资源目录js\css\img,可以设置网址路径'abc',访问abc时才可访问静态资源目录
app.use(express.static(__dirname+'/public'))

//接收json数据（尤其是post方式）
app.use(bodyParser.json())
// 可接收任何数据类型
app.use(bodyParser.urlencoded({ extended: true }))

//在创建cookieParser时(传入了secret字符串) , cookie也不会自动加密, 需要使用
// res.cookie(name, value , {singed: true}) 去创建加密的cookie, 以及使用req.signedCookies来获取解密后的cookie
app.use(cookieParser('pxz199381'))

// resave: 强制session保存到session store中
// rolling: 强制在每一个response中都发送session标识符的cookie,默认false
//saveUninitialized: 强制没有“初始化”的session保存到storage中，默认true
app.use(session({
    name: 'online',
    secret: 'pxz199381',
    resave: true,
    saveUninitialized: true
    })
)

// 设置模板引擎的目录
app.set('views',__dirname+'/views')
//设置是否启用视图编译缓存，启用将加快服务器执行效率
app.set("view cache",true);
// 设置使用的模板引擎
app.set('view engine','ejs')

//将自定义的功能中间件结合在一起
require('./module/configData.js')

//接收剪裁网页发送来的data数据，并用正则把前面无用的数据去掉，再转换为图片能用的数据
app.post('/pic',(req,res) => {
    const rData = req.body.data,
    sData = rData.replace(/^data:image\/\w+;base64,/,""),
    imgData = Buffer.from(sData,'base64'),
    fileName = Date.now();
    fs.writeFile(`./public/img/${fileName}.png`,imgData,(err,data) => {
        res.json({
            upImg: fileName
        })
    })
})


// 访问当前路径，交给index.js里的方法
app.use('/',require('./router/index.js'))

//富文本编辑器
app.use('/ueditor/ue',require('./ue.js'))



