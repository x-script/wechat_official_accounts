const { resolve } = require('path');
const { writeFile, readFile } = require('fs');

// xml 数据转字符串模块
const { parseString } = require('xml2js');

module.exports = {
  // 接收流式数据
  getUserXMLDataAsync(req) {
    let xmlData = '';

    return new Promise((resolve, reject) => {
      req
        .on('data', data => {
          // data 数据为 buffer，需转为字符串
          xmlData += data.toString();
        })
        .on('end', () => {
          // end 事件当数据接收完时触发
          resolve(xmlData);
        })
    });
  },

  // 解析 xml 数据转为 js 对象
  parseXMLDataAsync(xmlData) {
    return new Promise((resolve, reject) => {
      parseString(xmlData, {trim: true}, (err, data) => {
        if (!err) {
          resolve(data);
        } else {
          reject('parseXMLAsync() 出错: ' + err);
        }
      });
    });
  },

  // 格式化 js 对象数据
  formatJsData(jsData) {
    let formatData = {};

    jsData = jsData.xml;

    if (typeof jsData === 'object') {
      for (let key in jsData) {
        let value = jsData[key];
        // 过滤空数据
        if (Array.isArray(value) && value.length > 0) {
          formatData[key] = value[0];
        }
      }
    }

    return formatData;
  },

  // 写入本地存储
  writeFileAsync(data, fileName) {
    const filePath = resolve(__dirname, `./${fileName}.txt`);

    data = JSON.stringify(data);

    return new Promise((resolve, reject) => {
      writeFile(filePath, data, err => {
        if (!err) {
          resolve();
        } else {
          console.log(err);
          reject(`writeFileAsync() 保存${fileName}出错: ` + err);
        }
      });
    });
  },

  // 读取本地存储
  readFileAsync(fileName) {
    const filePath = resolve(__dirname, `./${fileName}.txt`);

    return new Promise((resolve, reject) => {
      readFile(filePath, (err, data) => {
        if (!err) {
          data = JSON.parse(data);
          resolve(data);
        } else {
          console.log(err);
          reject('readFileAsync() 出错: ' + err);
        }
      });
    });
  },

  // 随机字符串
  randomString(length) {
    let result = '';
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    
    return result;
  }
}