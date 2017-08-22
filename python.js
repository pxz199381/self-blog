const http = require('http'),
options = {
    hostname: 'nodejs.cn',
    path: '/api',
    port: '80',
    headers: {
        'Content-Length': 'utf-8'
    }
};

//向外发起httpget请求
http.get(options,function(res){
    let html = '';
    //当请求有数据时触发
    res.on('data',function(data){
        html += data;
    });
    //当请求完成时触发
    res.on('end',function(){
        console.log(html);
    })
})