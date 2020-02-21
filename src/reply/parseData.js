const { getUserXMLDataAsync, parseXMLDataAsync, formatJsData } = require('../utils/wechatTools')

module.exports = async data => {
  const xmlData = await getUserXMLDataAsync(data);
  // console.log(xmlData)
  /*
    <xml>
    <ToUserName><![CDATA[gh_2d786c3f6edb]]></ToUserName> 开发者id
    <FromUserName><![CDATA[obHNnv8uxoe5guY4t9N2o4E3RrH8]]></FromUserName> 用户 openid
    <CreateTime>1581943606</CreateTime> 发送时间戳
    <MsgType><![CDATA[text]]></MsgType> 发送信息类型
    <Content><![CDATA[1]]></Content> 发送的内容
    <MsgId>22647988229033111</MsgId> 消息id 微信服务器默认保存3天
    </xml>
  */

  
  const jsData = await parseXMLDataAsync(xmlData);

  return formatJsData(jsData);
};