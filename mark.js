var marked = require('marked'),
    fs = require('fs'),
    http = require('http');

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});

//增加的代码，用于个性化输出table
var renderer = new marked.Renderer();
renderer.table = function(header,body){
    return '<table class="table table-striped">'+header+body+'</table>'
}
fs.readFile('m1.md','utf-8',function(err,data){
    if(err) throw err;
    //HTML页头
    var header = '<!DOCTYPE html>'+
        '<html lang="zh-CN">'+
        '<head>'+
        '<title>Marked Demo</title>'+
        '<link rel="stylesheet" href="http://cdn.bootcss.com/bootstrap/3.3.2/css/bootstrap.min.css">'+
        '</head><body>';
    // HTML主体
    var body = marked(data,{renderer: renderer});
    //HTML页尾
    var footer = '<script src="http://cdn.bootcss.com/jquery/1.11.2/jquery.min.js"></script>'+
        '<script src="http://cdn.bootcss.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>'+
        '</body></html>';
    server(header+body+footer);
})

function server(html){
    http.createServer((req,res) => {
        res.writeHead(200,{'Content-Type': 'text/html;charset=utf-8'});
        res.end(html);
    }).listen(1337,'127.0.0.1');
    console.log('Server running at http://127.0.0.1:1337/')
}