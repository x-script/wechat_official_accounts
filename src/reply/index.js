
const auth = require('./auth');
const parseData = require('./parseData');
const judgeType = require('./judgeType');
const formatMessage = require('./formatMessage');

module.exports = () => {
  return async (ctx) => {
    if (ctx.method === 'GET') {
      if (!auth(ctx.req)) ctx.body = 'error';

      ctx.body = ctx.query.echostr;
    } else if (ctx.method === 'POST') {
      if (!auth(ctx.query)) ctx.body = 'error';

      // 解析用户输入的数据
      const result_parseData = await parseData(ctx.req);
      // 判断回复的信息类型
      const result_options = await judgeType(result_parseData);
      // 格式化回复消息
      const result_formatMessage = formatMessage(result_options);

      ctx.body = result_formatMessage;
    } else {
      ctx.body = 'errro';
    }
  }
}