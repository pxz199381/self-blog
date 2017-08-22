const connect = require('./mysql.js'),
    main = require('../app.js'),
    unitFunction = require('./unit-function');
//这里是自定义的中间件

//保存账号信息中间件
main.app.use((req,res,next) => {
    //判断用户是否在线
    if(req.session.user){
        //把在线信息传递给模板
        //locals最好不要有多个链式属性，不然当父对象不存在时会报错
        res.locals.user = req.session.user;
        res.locals.userName = req.session.user.username;
        res.locals.nickName = req.session.user.nickname;
        res.locals.userAdmin = req.session.user.admin;
        res.locals.userPic = req.session.user.pic;
        next();
    }else{
        next();
    }
},(req,res,next) => {
    //如果服务器断开，则把浏览器里保存的用户id获取到，再并查询数据库
    if(req.cookies.saveId){
        var uId = req.cookies.saveId.name;
        connect('select * from userinfo where id = ?',[uId],
            (err,data) => {
                if(err){
                    console.log(err);
                }
                req.session.user = data[0];
                //把在线信息传递给模板
                res.locals.user = req.session.user;
                res.locals.userName = req.session.user.username;
                res.locals.nickName = req.session.user.nickname;
                res.locals.userAdmin = req.session.user.admin;
                res.locals.userPic = req.session.user.pic;
                next();
            })
    }else{
        next();
    }
})

//侧边栏文章信息中间件
main.app.use((req,res,next) => {
    //查找重复数据
    connect('select tagname,pid from tag where tagname in (select tagname from tag group by tagname having count(tagname) > 1)',
        (err,data) => {
            var arr = unitFunction.sideTagArr(data);
            //处理一下数组，按照数量从大到小排列
            for(var i=0;i<arr.length;i++){
                for(var j=i+1;j<arr.length;j++){
                    if(arr[i][1] < arr[j][1]){
                        var temp = arr[i];
                        arr[i] = arr[j];
                        arr[j] = temp;
                    }
                }
            }
            res.locals.hotTags = arr;
            next();
        })
})

//侧边栏新随笔信息中间件
main.app.use((req,res,next) => {
    //获四天内发布的文章
    connect('select * from article where date(time) between date_sub(curdate(), interval 4 day) and curdate() order by time desc',
        (err,essays) => {
            if(err){
                console.log(err);
            }else{
                //查找time项，并截取为标准格式
                var arr = [];
                var prop = 'time';
                var essayData = unitFunction.sideEssayArr(essays,prop);
                res.locals.newEssay = essayData;
                next();
            }
        })
})

//侧边栏阅读排行中间件
main.app.use((req,res,next) => {
    connect('select id,title,count from article order by count desc limit 0,3',
        (err,readingList) => {
            if(err){
                console.log(err);
            }else{
                res.locals.readingList = readingList;
                next();
            }
        })
})