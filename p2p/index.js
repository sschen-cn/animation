const options = process.argv?.splice(2)
const portMatch = options.join(' ').match(/--port=(\d+)/)
const helpMatch = options.join(' ').match(/--help/)
if (helpMatch) {
  console.log(`Usage: node index.js --port=<port>`)
  process.exit(0)
}

// 参数不为空 但无法匹配 输出--help提示
if (options.length !== 0 && !portMatch) {
  console.log(`Usage: node index.js --help to see available options.`)
  process.exit(0)
}

const address = `0.0.0.0`
const port = portMatch ? parseInt(portMatch[1], 10) : 3100

let net = require('net')
let server = net.createServer()
let socketMap = new Map()

server.on('connection', function (socket) {
  // 处理连接建立
  console.log(`客户端: ${socket.remoteAddress}:${socket.remotePort} 连接成功了。`)
  let responseMsg = {
    type: "heart",
    msg: {
      origin: {
        loacalAddress: socket.localAddress,
        localPort: socket.localPort,
      },
      remote: {
        remoteAddress: socket.remoteAddress,
        remotePort: socket.remotePort,
      }
    }
  }
  socket.write(JSON.stringify(responseMsg))

  socket.on('data', function (dataMeta) {
    // 处理数据接收
    let data = JSON.parse(dataMeta.toString())
    if (data.type === "heart") {
      console.log("heart", data.msg)
    } else if (data.type === "initP2P") {
      socketMap.set(data.msg.from, { socket, msg: data.msg })
    }
  })
})

server.listen(port, address, function () {
  console.log(`Server running at http://${address}:${port}`)
  setInterval(() => {
    socketMap.forEach((user, name) => {
      user.socket.write(JSON.stringify({
        type: "heart",
        msg: ""
      }))
    })
  }, 1500)

  server.on('error', (err) => {
    console.error('Server error:', err.message)
  })
})