const mongoose = require('mongoose')

const db = 'mongodb://localhost/nodes'

module.exports = () => {
  let maxConnectCount = 0
  let connectConfig = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  }

  mongoose.connect(db, connectConfig)
    
  return new Promise((resolve, reject) => {
    mongoose.connection.on('disconnected', () => {
      console.log('********* 数据库断开 *********')

      if (maxConnectCount < 3 ) {
        maxConnectCount++
        mongoose.connect(db, connectConfig)    
      } else {
        reject()
        throw new Error('数据库重连失败！')
      }
    })

    mongoose.connection.on('error', error => {
      console.log('********* 数据库错误 *********')

      if (maxConnectCount < 3) {
        maxConnectCount++
        mongoose.connect(db, connectConfig)   
      } else {
        reject(error)
        throw new Error('数据库重连失败！')
      }
    })

    mongoose.connection.once('open', () => {
      console.log('MongoDB connected successfully')
      
      resolve()   
    })
  })
}