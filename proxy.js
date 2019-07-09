const http = require('http')
const request = require('request')

const hostname = '127.0.0.1'
const port = 8010
const imgPort = 8011

// https://segmentfault.com/a/1190000009242864
// https://github.com/izzyleung/ZhihuDailyPurify/wiki/%E7%9F%A5%E4%B9%8E%E6%97%A5%E6%8A%A5-API-%E5%88%86%E6%9E%90

// 创建一个 API 代理服务
const apiServer = http.createServer((req, res) => {
  const url = 'http://news-at.zhihu.com/api/4' + req.url
  const options = {
    url: url
  }

  console.log(url)
  request.get(options, (err, response, body) => {
    if (!err && response.statusCode === 200) {
      res.setHeader('Content-type', 'text/plain;charset=UTF-8')
      // 允许跨域
      res.setHeader('Access-Control-Allow-Origin', '*')
      // 返回代理后的内容
      res.end(body)
    }
  })
})

// 创建一个图片代理五福
const imgServer = http.createServer((req, res) => {
  const url = req.url.split('/img/')[1]
  const options = {
    url: url,
    encoding: null
  }

  console.log(url)
  request.get(options, (err, response, body) => {
    if (!err && response.statusCode === 200) {
      const contentType = response.headers['content-type']
      res.setHeader('Content-type', contentType)
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.end(body)
    }
  })
})

// 监听 8010 端口
apiServer.listen(port, hostname, () => {
  /*
  如：
    真实接口为： http://news-at.zhihu.com/api/4/news/38922
    开发时为： http://127.0.0.1:8010/api/4/news/38922
  */
  console.log(`接口代理运行在 https//${hostname}:${port}/`)
})

// 监听 8011 端口
imgServer.listen(imgPort, hostname, () => {
  // 与上类似
  console.log(`图片代理运行在 https//${hostname}:${imgPort}/`)
})
