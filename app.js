const Koa = require('koa');

// 消息回复模块
const reply = require('./src/reply')

const app = new Koa();

app.use(reply());

// 监听端口
const server = app.listen(3000, () => {
  console.log(`[Server] starting at port ${server.address().port}`)
})