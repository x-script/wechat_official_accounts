**开发服务器与微信关系**
  用户请求 <=> 微信服务器 <=> 开发服务器

### 
**reply 模块**
  1. anth.js 验证模块

  ```
    // 微信服务器发送的请求验证数据
    {
      signature: 'a31c12b9cf471fe4fa1787c5a27fa85e3685c965', // 微信加密签名
      echostr: '2664356245204274806', // 微信随机字符串
      timestamp: '1581911152',  // 微信发送请求时的时间戳
      nonce: '2072637047' // 微信随机数字
    }
  ```
  - 将token、timestamp、nonce三个参数进行字典序排序
  - 将三个参数字符串拼接成一个字符串进行sha1加密
  - 返回对比结果

  2. paraseData.js 解析数据模块

  ```
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
  ```
  - 解析微信 xml 数据为 js 对象格式数据

  3. formatMessage.js 格式化为 xml 格式的回复信息

  > 验证结果为Ture
  >>  GET 请求 返回 echostr
  >>  POST 请求 返回 对应的 formatMessage 数据




