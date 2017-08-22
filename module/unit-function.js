const connect = require('./mysql');
module.exports = {
    sideTagArr: function(data,prop){
        var arr = [];
        data.forEach(function(item,index){
            //把数组方法封装起来
            //第一次直接创建子数组
            if(index === 0){
                arr.push(Array.apply(null,[item['tagname'],1]));
            }else{
                //把子数组的第一项组合成一个新数组
                //循环判断新数组，如果和新数据相同，则数量+1，否则创建新数组
                var sum = [];
                arr.forEach(function(val){
                    sum.push(val[0]);
                })
                var order = sum.indexOf(item['tagname']);
                if(order === -1){
                    arr.push(Array.apply(null,[item['tagname'],1]));
                }else{
                    arr[order][1]++;
                }
            }
        })
        return arr;
    },
    sideEssayArr: function(data,prop){
        var arr = [];
        data.forEach(function(item,index){
            // 把数组方法封装起来
            // 第一次直接创建子数组
            //注意date函数的区别
            //var str = DateToString(item[prop]);
            var str = item[prop].toLocaleDateString();
            if(index === 0){
                arr.push(Array.apply(null,[str,1]));
            }else{
                //把子数组的第一项组合成一个新数组
                //循环判断新数组，如果和新数据相同，则数量+1，否则创建新数组
                var sum = [];
                arr.forEach(function(val){
                    sum.push(val[0]);
                })
                var order = sum.indexOf(str);
                if(order === -1){
                    arr.push(Array.apply(null,[str,1]));
                }else{
                    arr[order][1]++;
                }
            }
        })
        return arr;
        function DateToString(str){
            //获取的是日期对象
            var year = str.getFullYear();
            var month = str.getMonth();
            var date = str.getDate();
            var resultStr = `${year}-${month}-${date}`;
            return resultStr;
        }
    },
    indexPro: function(dataList,pList,coms){
        dataList.forEach(function(item){
            pList.push(uPro(item));
            //创建多个promise对象，并分别给每个对象传入item参数
            //把每篇文章的uid替换成用户名
            function uPro(val){
                return function(){
                    var p = new Promise(function(resolve,reject){
                        connect('select * from userinfo where id =?',[val['uid']],
                            (err,user) => {
                                if(err){
                                    reject(err);
                                }else{
                                    if(user[0]){
                                        val['uid'] = user[0]['username'];
                                        resolve();
                                    }
                                    resolve();
                                }
                            })
                    })
                    return p;
                }
            }
        });
        dataList.forEach(function(item){
            pList.push(cPro(item));
            //将每篇文章的评论数存入数组
            function cPro(val){
                return function(){
                    var p = new Promise(function(resolve,reject){
                        connect('select * from comments where pid =?',[val['id']],
                            (err,comment) => {
                                if(err){
                                    reject(err);
                                }else{
                                    coms.push(comment.length);
                                    resolve();
                                }
                            })
                    })
                    return p;
                }
            }

        })
    },
    tagPro: function(dataList,pList,coms){

        dataList.forEach(function(item){
            pList.push(uPro(item[0]));
            //创建多个promise对象，并分别给每个对象传入item参数
            //把每篇文章的uid替换成用户名
            function uPro(val){
                return function(){
                    var p = new Promise(function(resolve,reject){
                        connect('select * from userinfo where id =?',[val['uid']],
                            (err,user) => {
                                if(err){
                                    reject(err);
                                }else{
                                    if(user[0]){
                                        val['uid'] = user[0]['username'];
                                        resolve();
                                    }
                                    resolve();
                                }
                            })
                    })
                    return p;
                }
            }
        });
        dataList.forEach(function(item){
            pList.push(cPro(item[0]));
            //将每篇文章的评论数存入数组
            function cPro(val){
                return function(){
                    var p = new Promise(function(resolve,reject){
                        connect('select * from comments where pid =?',[val['id']],
                            (err,comment) => {
                                if(err){
                                    reject(err);
                                }else{
                                    coms.push(comment.length);
                                    resolve();
                                }
                            })
                    })
                    return p;
                }
            }

        })
    },
    responseTime: function(){
        return function(req,res,next){
            req.startTime = new Date();
            var handleTime = function(){
                var endTime = new Date();
                var durTime = endTime - req.startTime;
                console.log(durTime);
            }
            //监听的方法是once，即监听一次后，并自动解除监听
            res.once('finish',handleTime);
            res.once('close',handleTime);
            return next();
        }
    },
    alert: function(){
        console.log(1);
    }
}
