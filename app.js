const Koa = require('koa');

// 数据库连接引擎
const connect = require('./src/model');
// 消息回复模块
const reply = require('./src/reply');

const app = new Koa();

;(async () => {
  await connect()
})()

app.use(reply());

// 监听端口
const server = app.listen(3000, () => {
  console.log(`[Server] starting at port ${server.address().port}`)
})