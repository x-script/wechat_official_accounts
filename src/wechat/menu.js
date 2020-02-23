/*
  自定义菜单
 */
const baseData = require('../config/baseData');

module.exports = {
  "button":[
    {
      "type": "click",
      "name": "首页",
      "key": "home"
    },
    {
      "type": "view",
      "name": "视图",
      "url": `${baseData.url}/search`
    },
    {
      "name": "菜单",
      "sub_button": [
        {
          "type": "click",
          "name": "帮助",
          "key": "help"
        }
      ]
    }
  ]
}