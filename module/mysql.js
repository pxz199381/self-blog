const mysql = require('mysql');
module.exports = function(sql,values,callback){
    let config = mysql.createConnection({
        // 数据库的地址
        host:"127.0.0.1",
        // 数据库的地址
        user:"root",
        password:"",
        // 数据库端口
        port:"3306",
        // 使用哪个数据库
        database:"pxz"
    });
    // 开始连接
    config.connect();
    // 进行数据库操作  1. 数据库代码  2.回调
    config.query(sql,values,(err,data) => {
        callback&&callback(err,data);
    });
    // 结束连接
    config.end();
}
