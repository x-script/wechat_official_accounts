
const { resolve, join } = require('path');
const { createReadStream, createWriteStream } = require('fs');
// 请求数据模块
const rp = require('request-promise-native');
const request = require('request');

// 微信基础数据
const baseData = require('../config/baseData');
// 引入微信数据接口地址前缀
const urlPrefix = require('../config/wechatUrlPrefix');
// 引入工具方法
const { writeFileAsync, readFileAsync } = require('../utils/wechatTools');
// 自定义菜单配置文件
const menuConfig = require('./menu')

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
    const url = `${urlPrefix.accessToken}&appid=${baseData.app_id}&secret=${baseData.appsecret}`;

    return new Promise((resolve, reject) => {
      rp({
        method: 'GET',
        url,
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
      .readAccessToken()
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
      const url = `${urlPrefix.jsApiTicket}&access_token=${result.access_token}`;

      rp({
        method: 'GET',
        url,
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

  /**
   * 创建自定义菜单
   * @param {Object} menuData
   * @return {Promise}
   */
  createMenu(menuData) {
    return new Promise(async (resolve, reject) => {
      if (!menuData) reject('createMenu() 没有传入菜单配置');

      try {
        const data = await this.getAccessToken();
        const url = `${urlPrefix.menu.create}access_token=${data.access_token}`;

        const result = await rp({
          method: 'POST',
          url,
          json: true,
          body: menuData
        });

        resolve(result);
      } catch (error) {
        reject('createMenu() 出错: ' + error);
      }
    });
  }

  /**
   * 删除自定义菜单
   * @return {Promise}
   */
  deleteMenu() {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.getAccessToken();
        const url = `${urlPrefix.menu.delete}access_token=${data.access_token}`;
        
        const result = await rp({
          method: 'GET',
          url,
          json: true
        });

        resolve(result);
      } catch (error) {
        reject('deleteMenu() 出错: ' + error);
      }
    })
  }

  //上传临时素材
  uploadTemporaryMaterial (type, fileName) {
    //获取文件的绝对路径
    const filePath = resolve(__dirname, '../media', fileName);
    
    return new Promise(async (resolve, reject) => {
      
      try {  //放置可能出错的代码
        //获取access_token
        const data = await this.fetchAccessToken();
        //定义请求地址
        const url = `${urlPrefix.temporary.upload}access_token=${data.access_token}&type=${type}`;
  
        const formData = {
          media: createReadStream(filePath)
        }
        //以form表单的方式发送请求
        const result = rp({method: 'POST', url, json: true, formData})
        //将数据返回给用户
        resolve(result);
      } catch (e) {
        //一旦try中的代码出了问题，就会走catch逻辑，处理错误
        reject('uploadTemporaryMaterial方法出了问题：' + e);
      }
      
    })
  }
  //获取临时素材
  getTemporaryMaterial (type, mediaId, fileName) {
    //获取文件的绝对路径
    const filePath = resolve(__dirname, '../media', fileName);
    
    return new Promise(async (resolve, reject) => {
      //获取access_token
      const data = await this.fetchAccessToken();
      //定义请求地址
      let url = `${urlPrefix.temporary.get}access_token=${data.access_token}&media_id=${mediaId}`;
      //判断是否是视频文件
      if (type === 'video') {
        //视频文件只支持http协议
        url = url.replace('https://', 'http://');
        //发送请求
        const data = await rp({method: 'GET', url, json: true});
        //返回出去
        resolve(data);
      } else {
        //其他类型文件
        request(url)
          .pipe(createWriteStream(filePath))
          .once('close', resolve)   //当文件读取完毕时，可读流会自动关闭，一旦关闭触发close事件，从而调用resolve方法通知外部文件读取完毕了
      }
      
    
    })
    
  }
  
  //上传永久素材
  uploadPermanentMaterial (type, material, body) {
    
    return new Promise(async (resolve, reject) => {
      try {
        //获取access_token
        const data = await this.fetchAccessToken();
        //请求的配置对象
        let options = {
          method: 'POST',
          json: true
        }
      
        if (type === 'news') {
          //上传图文消息
          options.url = `${urlPrefix.permanment.uploadNews}access_token=${data.access_token}`;
          options.body = material;
        } else if (type === 'pic') {
          //上传图文消息中的图片
          options.url = `${urlPrefix.permanment.uploadImg}access_token=${data.access_token}`;
          options.formData = {
            media: createReadStream(join(__dirname, '../media', material))
          }
        } else {
          //其他媒体素材的上传
          options.url = `${urlPrefix.permanment.uploadOthers}access_token=${data.access_token}&type=${type}`;
          options.formData = {
            media: createReadStream(join(__dirname, '../media', material))
          }
          //视频素材，需要多提交一个表单
          if (type === 'video') {
            options.body = body;
          }
        }
  
        //发送请求
        const result = await rp(options);
        //将返回值返回出去
        resolve(result);
      } catch (e) {
        reject('uploadPermanentMaterial方法出了问题：' + e);
      }
    
    })
  }
  //获取永久素材
  getPermanentMaterial (type, mediaId, fileName) {
    
    return new Promise(async (resolve, reject) => {
      try {
        //获取access_token
        const data = await this.fetchAccessToken();
        //定义请求地址
        const url = `${urlPrefix.permanment.get}access_token=${data.access_token}`;
  
        const options = {method: 'POST', url, json: true, body: {media_id: mediaId}};
        //发送请求
        if (type === 'news' || 'video') {
          const data = await rp(options);
          resolve(data);
        } else {
          request(options)
            .pipe(createWriteStream(join(__dirname, '../media', fileName)))
            .once('close', resolve)
        }
      } catch (e) {
        reject('getPermanentMaterial方法出了问题：' + e);
      }
      
    })
    
  }
  
  //上传素材
  uploadMaterial (type, material, body, isPermanent = true) {

    return new Promise(async (resolve, reject) => {
      try {
        //获取access_token
        const data = await this.fetchAccessToken();
        //请求的配置对象
        let options = {
          method: 'POST',
          json: true,
          formData: {
            media: createReadStream(join(__dirname, '../media', material))
          }
        }
    
        if (isPermanent) {
          //永久素材逻辑
          if (type === 'news') {
            //上传图文消息
            options.url = `${urlPrefix.permanment.uploadNews}access_token=${data.access_token}`;
            options.body = material;
            options.formData = null;
          } else if (type === 'pic') {
            //上传图文消息中的图片
            options.url = `${urlPrefix.permanment.uploadImg}access_token=${data.access_token}`;
          } else {
            //其他媒体素材的上传
            options.url = `${urlPrefix.permanment.uploadOthers}access_token=${data.access_token}&type=${type}`;
            //视频素材，需要多提交一个表单
            if (type === 'video') {
              options.body = body;
            }
          }
        } else {
          //临时素材逻辑
          options.url = `${urlPrefix.temporary.upload}access_token=${data.access_token}&type=${type}`;
        }
    
        //发送请求
        const result = await rp(options);
        //将返回值返回出去
        resolve(result);
      } catch (e) {
        reject('uploadPermanentMaterial方法出了问题：' + e);
      }
    })
  }
}

// 测试代码块
;(async () => {
  const wx = new Wechat();

  // 删除菜单
  await wx.deleteMenu();

  // 添加菜单
  const res = await wx.createMenu(menuConfig);
  console.log(res)
  
})();


module.exports = Wechat;