
// 请求数据模块
const rp = require('request-promise-native');

// 微信基础数据
const baseData = require('../config/baseData');
// 引入微信数据接口地址前缀
const urlPrefix = require('../config/wechatUrlPrefix');
// 引入工具方法
const { writeFileAsync, readFileAsync } = require('../utils/wechatTools');

class Wechat {
  constructor() {

  }


  /**
   * 获取 access_token
   * access_token 是公众号的全局唯一接口调用凭据，公众号调用各接口时都需使用 access_token。
   * @return {Promise}
   */
  fetchAccessToken() {
    // access_token 请求地址
    const url_prefix = `${urlPrefix.accessToken}&appid=${baseData.app_id}&secret=${baseData.appsecret}`;

    return new Promise((resolve, reject) => {
      rp({
        method: 'GET',
        url_prefix,
        json: true
      })
      .then(res => {
        // console.log(res)
        /*
          {
            access_token: '30_WgYdrgXB5Jzij5RdyEphdZalyQ_0mpsF8TLGdCQOVjFAUn_09sdJ6x_qbKWHh7BZbAKUYngmSWCnY061phk8VrTO2jJtnMJZ0KQkFXQQuWCC4zUJKUvsTyrDzaiIYoFR4uPgrcCJXxwPlbbWWHPcAIAJUC',
            expires_in: 7200
          }
        */

        // 设置过期时间 - 2小时过期，设置提前5分钟过期；
        res.expires_in = Date.now() + (res.expires_in - 300) * 1000;

        resolve(res);
      })
      .catch(err => {
        console.log(err);
        reject('fetchAccessToken() 出错: ' + err);
      });
    });
    
  }

  /**
   * 保存 access_token
   * @param {Object} data { access_token, expires_in }
   * @return {Promise}
   */
  saveAccessToken(data) {
    return writeFileAsync(data, 'access_token');
  }

  /**
   * 读取 access_token
   * @return {Promise}
   */
  readAccessToken() {
    return readFileAsync('access_token')
  }

  /**
   * 检测 access_token 是否有效
   * @param {Object} data { access_token, expires_in }
   * @return {Boolean}
   */
  isValidAccessToken(data) {
    // 检查参数是否有效
    if (!data && !data.access_token && !data.expires_in) {
      return false;
    }

    // 检擦 access_token 是否过期
    // if (data.expires_in < Data.now()) {
    //   return false;
    // } else {
    //   return true;
    // }

    return data.expires_in > Date.now();
  }

  /**
   * 可使用的 access_token
   */
  getAccessToken() {
    if (this.access_token && this.access_token_expires_in && this.isValidAccessToken(this)) {
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.access_token_expires_in
      })
    }

    return this
      .readToken()
      .then(async res => {
        if (this.isValidAccessToken(res)) {
          return Promise.resolve(res);
        } else {
          let res = await this.fetchAccessToken();

          await this.saveAccessToken(res);

          return Promise.resolve(res);
        }
      })
      .catch(async err => {
        let res = await this.fetchAccessToken();

        await this.saveAccessToken(res);
        
        return Promise.resolve(res);
      })
      .then(res => {
        // 缓存数据
        this.access_token = res.access_token;
        this.access_token_expires_in = res.expires_in;

        return Promise.resolve(res);
      })
  }

  /**
   * 获取 jsapi_ticket
   * jsapi_ticket 是公众号用于调用微信 JS 接口的临时票据。
   * @return {Promise}
   */
  fetchJsapiTicket() {
    return new Promise(async (resolve, reject) => {
      const result = await this.getAccessToken();
      // jsapi_ticket 请求地址
      const url_prefix = `${urlPrefix.jsApiTicket}&access_token=${result.access_token}`;

      rp({
        method: 'GET',
        url_prefix,
        json: true,
      })
      .then(res => {
        resolve({
          ticket: res.ticket,
          expires_in: Date.now() + (res.expires_in - 300) * 1000
        });
      })
      .catch(err => {
        console.log(err);
        reject('fetchJsapiTicket() 出错: ' + err);
      });
    });
  }

  /**
   * 保存 jsapi_ticket
   * @param {Object} data { ticket, expires_in }
   * @return {Promise}
   */
  saveJsapiTicket(data) {
    return writeFileAsync(data, 'jsapi_ticket');
  }

  /**
   * 读取 jsapi_ticket
   * @return {Promise}
   */
  readJsapiTicket() {
    return readFileAsync('jsapi_ticket');
  }

  /**
   * 检测 jsapi_ticket 是否有效
   * @param {Object} data { ticket, expires_in }
   * @return {Boolean}
   */
  isValidJsapiTicket(data) {
    // 检查参数是否有效
    if (!data && !data.ticket && !data.expires_in) {
      return false;
    }

    return data.expires_in > Data.now();
  }

  /**
   * 可使用的 jsapi_ticket
   */
  getJsapiTicket() {
    if (this.ticket && this.ticket_expires_in && this.isValidJsapiTicket(this)) {
      return Promise.resolve({
        ticket: this.ticket,
        expires_in: this.ticket_expires_in
      })
    }

    return this
      .readJsapiTicket()
      .then(async res => {
        if (this.isValidJsapiTicket(res)) {
          return Promise.resolve(res);
        } else {
          let res = await this.fetchJsapiTicket();

          await this.saveJsapiTicket(res);

          return Promise.resolve(res);
        }
      })
      .catch(async err => {
        let res = await this.fetchJsapiTicket();

        await this.saveJsapiTicket(res);
        
        return Promise.resolve(res);
      })
      .then(res => {
        // 缓存数据
        this.ticket = res.ticket;
        this.ticket_expires_in = res.expires_in;

        return Promise.resolve(res);
      })
  }
}


module.exports = Wechat;