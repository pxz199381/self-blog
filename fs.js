//文件系统  操作文件
const fs = require('fs'),
path = require('path');

//在所有方法后面加上 Sync 代表同步执行，不加代表异步
//创建文件fs.open+ws
//删除文件fs.unlink
// 读取文件内容
// fs.readFile('./tips.txt','utf-8',(err,data) => {console.log(data);})
//创建目录fs.mkdir
//删除目录fs.rmdir
//读取文件夹
// fs.readdir('./views',(err,data) => {
//     console.log(data);
// })
//读取文件信息fs.stat
//检测文件是否可读写
/*fs.access('./sql.txt',fs.constants.R_OK|fs.constants.W_OK,(err,data) => {
    console.log(err);
})*/
//那数据追加到文件里
// fs.appendFile('./tips.txt','新家内容',(err,data) => {})
//写入内容
// fs.writeFile('./tips.txt','替换内容',(err,data) => {})
//转码 a为原文件的编码信息
// let img = Buffer.from(a,'base64')
// fs.writeFile('./b.img',img)

