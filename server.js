var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
    console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
    process.exit(1)
}

var server = http.createServer(function (request, response) {
    var parsedUrl = url.parse(request.url, true)
    var path = request.url
    var query = ''
    if (path.indexOf('?') >= 0) { query = path.substring(path.indexOf('?')) }
    var pathNoQuery = parsedUrl.pathname
    var queryObject = parsedUrl.query
    var method = request.method

    function readBody(request) {
        return new Promise((resolve, reject) => {
            let body = []
            request.on('data', (chunk) => {
                body.push(chunk)
            }).on('end', () => {
                body = Buffer.concat(body).toString()
                resolve(body)
            })
        })
    }

    /******** 从这里开始看，上面不要看 ************/

    console.log('HTTP 路径为\n' + path)
    if (path == '/style.css') {
        response.setHeader('Content-Type', 'text/css; charset=utf-8')
        response.write('body{background-color: #ddd;}h1{color: red;}')
        response.end()
    } else if (path == '/main.js') {
        response.setHeader('Content-Type', 'text/javascript; charset=utf-8')
        response.write('alert("这是JS执行的")')
        response.end()
    } else if (path === '/sign-up' && method === "GET") {
        let string = fs.readFileSync('./sign-up.html', 'utf-8')
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html,charset:utf-8')
        response.write(string)
        response.end()
    } else if (path === '/sign-up' && method === "POST") {
        //response.statusCode = 200
        readBody(request).then((body) => {
            let strings = body.split('&')
            console.log(strings)
            let hash = {}
            strings.forEach((string) => {
                let parts = string.split('=')
                let key = parts[0]
                let value = parts[1]
                hash[key] = decodeURIComponent(value)
            })
            console.log(hash)
            let { dub, email, password } = hash
            console.log(email)
            if (email.indexOf('@') === -1) {
                response.setHeader('Content-Type','application/json;chraset:utf-8')
                response.statusCode = 400
                response.write(`{
                    "errors":{"email":"invalid"}
                }`)
            } else {
                response.statusCode = 200
            }
            response.end()
        })

        
    } else if (path == '/') {
        response.setHeader('Content-Type', 'text/html; charset=utf-8')
        response.write('<!DOCTYPE>\n<html>' +
            '<head><link rel="stylesheet" href="/style.css">' +
            '</head><body>' +
            '<h1>你好</h1>' +
            '<script src="/main.js"></script>' +
            '</body></html>')
        response.end()
    } else {
        response.statusCode = 404
        response.end()
    }

    /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)

