
// 微信请求数据接口地址

const prefix = `https://api.weixin.qq.com/`;

module.exports = {
  accessToken: `${prefix}cgi-bin/token?grant_type=client_credential`,
  jsApiTicket: `${prefix}cgi-bin/ticket/getticket?type=jsapi`,
  menu: {
    create: `${prefix}cgi-bin/menu/create?`,
    delete: `${prefix}cgi-bin/menu/delete?`,
  },
  temporary: {
    upload: `${prefix}cgi-bin/media/upload?`,
    get: `${prefix}cgi-bin/media/get?`
  },
  permanment: {
    uploadNews: `${prefix}cgi-bin/material/add_news?`,
    uploadImg: `${prefix}cgi-bin/media/uploadimg?`,
    uploadOthers: `${prefix}cgi-bin/material/add_material?`,
    get: `${prefix}cgi-bin/material/get_material?`
  },
  service: {
    create: `${prefix}customservice/kfaccount/add?`,
    delete: `${prefix}customservice/kfaccount/del?`,
    modify: `${prefix}customservice/kfaccount/update?`,
  }
};