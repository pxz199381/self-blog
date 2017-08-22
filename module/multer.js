const multer = require('multer'),
    path = require('path'),
    fs = require('fs');

/*Multer在解析完请求体后，会向Request对象中添加一个body对象和一个file或files对象
 （上传多个文件时使用files对象 ）。其中，body对象中包含所提交表单中的文本字段（如果有）
 ，而file(或files)对象中包含通过表单上传的文件。*/


// 上传路径及命名配置
let storage = multer.diskStorage({
    destination: path.join(process.cwd(),'public/img'),
    filename: function(req,file,fn){
        let fileName = (file.originalname).split('.');
        //给传来的文件名后缀名提取出来，重新命名为时间戳+后缀名
        fn(null,`${Date.now()}.${fileName[fileName.length-1]}`);
    }
})

let fileFilter = function(req,file,fn){
    if(/image\/(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.mimetype)){
    //第二参数指示是否能上传 file.mimeType == 'image/gif'
        fn(null,true);
    }else{
        req.err = { result: 'fail', error: { code: 1002, message: 'File type is mismatch' } };
        fn(req.err);
    }
}

let upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024*1024
    }
})
module.exports = upload;