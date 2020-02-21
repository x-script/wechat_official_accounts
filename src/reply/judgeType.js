
const rp = require('request-promise-native');

const baseData = require('../config/baseData');
//引入Theaters
// const Theaters = require('../model/Theaters');
//引入config
const {url} = require('../config/baseData');

module.exports = async parseData => {
  let options = {
    toUserName: parseData.FromUserName,
    fromUserName: parseData.ToUserName,
    createTime: Date.now(),
  }
  
  let content = '请输入正确关键字！';

  if (parseData.MsgType === 'text') {
    if (parseData.Content === 'test') {
      options.msgType = 'text';
      content = '收到test！';
    } else if (parseData.Content === '热门') {
      // const data = await Theaters.find({}, {title: 1, summary: 1, posterKey: 1, doubanId: 1, _id: 0});
      
      content = [];
      options.msgType = 'news';

      for (let i = 0; i < data.length; i++) {
        let item = data[i];

        content.push({
          title: item.title,
          description: item.summary,
          picUrl: `http://peicjnx2h.bkt.clouddn.com/${item.posterKey}`,
          url: `${url}/detail/${item.doubanId}`
        })
      }
      
    } else if (parseData.Content === '首页') {
      options.msgType = 'news';
      content = [{
        title: '硅谷电影预告片首页',
        description: '这里有最新的电影预告片~',
        picUrl: 'http://www.atguigu.com/images/logo.jpg',
        url: `${url}/movie`
      }];
    } else {
      //搜索用户输入指定电影信息
      //定义请求地址
      // const url = `https://api.douban.com/v2/movie/search?q=${parseData.Content}&count=8`;
      const url = 'https://api.douban.com/v2/movie/search';
      //发送请求
      // const {subjects} = rp({method: 'GET', url, json: true, qs: {q: parseData.Content, count: 8}});
      const data = await rp({method: 'GET', url, json: true, qs: {q: parseData.Content, count: 8}});
      const subjects = data.subjects;
      console.log(data);
      //判断subjects是否有值
      if (subjects && subjects.length) {
        //说明有数据,返回一个图文消息给用户
        //将回复内容初始化为空数组
        content = [];
        options.msgType = 'news';
        //通过遍历将数据添加进去
        for (let i = 0; i < subjects.length; i++) {
          let item = subjects[i];
          content.push({
            title: item.title,
            description: `电影评分为：${item.rating.average}`,
            picUrl: item.images.small,
            url: item.alt
          })
        }
      } else {
        //说明没有数据
        content = '暂时没有相关的电影信息';
      }
      
    }
  } else if (parseData.MsgType === 'voice') {
    console.log(55,parseData.Recognition);
    //搜索用户输入指定电影信息
    //定义请求地址
    // const url = `https://api.douban.com/v2/movie/search?q=${parseData.Recognition}&count=8`;
    const url = 'https://api.douban.com/v2/movie/search';
    //发送请求
    const {subjects} = await rp({method: 'GET', url, json: true, qs: {q: parseData.Recognition, count: 8}});
    //判断subjects是否有值
    if (subjects && subjects.length) {
      //说明有数据,返回一个图文消息给用户
      //将回复内容初始化为空数组
      content = [];
      options.msgType = 'news';
      //通过遍历将数据添加进去
      for (let i = 0; i < subjects.length; i++) {
        let item = subjects[i];
        content.push({
          title: item.title,
          description: `电影评分为：${item.rating.average}`,
          picUrl: item.images.small,
          url: item.alt
        })
      }
    } else {
      //说明没有数据
      content = '暂时没有相关的电影信息';
    }
  } else if (parseData.MsgType === 'event') {
    if (parseData.Event === 'subscribe') {
      //用户订阅事件
      content = '欢迎您关注硅谷电影公众号~ \n' +
      '回复 首页 查看硅谷电影预告片 \n' +
      '回复 热门 查看最热门的电影 \n' +
      '回复 文本 搜索电影信息 \n' +
      '回复 语音 搜索电影信息 \n' +
      '也可以点击下面菜单按钮，来了解硅谷电影公众号';
    } else if (parseData.Event === 'unsubscribe') {
      //用户取消订阅事件
      console.log('无情取关~');
    } else if (parseData.Event === 'CLICK') {
      content = '您可以按照以下提示来进行操作~ \n' +
        '回复 首页 查看硅谷电影预告片 \n' +
        '回复 热门 查看最热门的电影 \n' +
        '回复 文本 搜索电影信息 \n' +
        '回复 语音 搜索电影信息 \n' +
        '也可以点击下面菜单按钮，来了解硅谷电影公众号'
    }
  }
  
  options.content = content;
  
  return options;
}