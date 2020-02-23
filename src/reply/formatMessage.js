/*
  用来加工处理最终回复用户消息的模板（xml数据）
 */
module.exports = options => {
  let xmlData = `<xml>
    <ToUserName><![CDATA[${options.toUserName}]]></ToUserName>
    <FromUserName><![CDATA[${options.fromUserName}]]></FromUserName>
    <CreateTime>${options.createTime}</CreateTime>
    <MsgType><![CDATA[${options.msgType}]]></MsgType>`;
    
  if (options.msgType === 'text') {
    xmlData += `<Content><![CDATA[${options.content}]]></Content>`;
  } else if (options.msgType === 'image') {
    xmlData += `<Image><MediaId><![CDATA[${options.mediaId}]]></MediaId></Image>`;
  } else if (options.msgType === 'voice') {
    xmlData += `<Voice><MediaId><![CDATA[${options.mediaId}]]></MediaId></Voice>`;
  } else if (options.msgType === 'video') {
    xmlData += `<Video>
      <MediaId><![CDATA[${options.mediaId}]]></MediaId>
      <Title><![CDATA[${options.title}]]></Title>
      <Description><![CDATA[${options.description}]]></Description>
      </Video>`;
  } else if (options.msgType === 'music') {
    xmlData += `<Music>
      <Title><![CDATA[${options.title}]]></Title>
      <Description><![CDATA[${options.description}]]></Description>
      <MusicUrl><![CDATA[${options.musicUrl}]]></MusicUrl>
      <HQMusicUrl><![CDATA[${options.hqMusicUrl}]]></HQMusicUrl>
      <ThumbMediaId><![CDATA[${options.mediaId}]]></ThumbMediaId>
      </Music>`;
  } else if (options.msgType === 'news') {
    xmlData += `<ArticleCount>${options.content.length}</ArticleCount>
      <Articles>`;
  
    options.content.forEach(item => {
      xmlData += `<item>
        <Title><![CDATA[${item.title}]]></Title>
        <Description><![CDATA[${item.description}]]></Description>
        <PicUrl><![CDATA[${item.picUrl}]]></PicUrl>
        <Url><![CDATA[${item.url}]]></Url>
        </item>`
    })
  
    xmlData += `</Articles>`;
  }
  
  xmlData += '</xml>';

  return xmlData;
}