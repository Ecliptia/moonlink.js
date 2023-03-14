let http = require('http')
let https = require('https')

module.exports = function(url, method, opts) {
  return new Promise((resolve) => {
    if (!method) method || 'GET'
    let url_ = new URL(url)
    opts.headers['User-Agent'] = 'MoonLink/Requester'
    opts.headers["Content-Type"] = "application/json"
    let request;
    if (url_.protocol === 'http:') request = http.request
    if (url_.protocol === 'https:') request = https.request
    const options = {
      port: url_.port ? url_.port : url_.protocol === 'http:' ? 80 : 443,
      method,
      ...opts
    };
    let req = request(url, options, (res) => {
      const chunks = [];
      res.on('data', async (chunk) => {
        chunks.push(chunk)
      })
      res.on('end', async () => {
        try {
          const data = Buffer.concat(chunks).toString();
          if (url_.pathname == '/version') resolve(data)
          resolve(JSON.parse(data))
        } catch (err) {
          resolve(err)
        }
      })
      res.on('error', (err) => {
        resolve(err)
      })
    })
    req.end()
  })
}