
// 加密模块
const sha1 = require('sha1');
// 微信基础数据
const baseData = require('../config/baseData');

module.exports = (data) => {
  const { signature, timestamp, nonce } = data;

  const sha1Data = sha1([timestamp, nonce, baseData.token].sort().join(''));

  return sha1Data === signature;
};