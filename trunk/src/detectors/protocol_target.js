// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'protocolTarget',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有 A 及 AREA 的元素，得到其 href 属性中的协议部分
 * 得到当前页面的 BASE target，此时考虑当拥有多个 BASE 元素时，Chrome 认为第一个有效而 IE 认为最后一个有效
 * 根据超链接的协议类型以及当前页面的 BASE target，若 IE 和 Chrome 中相同，则发出警告
 *
 *【缺陷】
 * 仅考虑了 IE 和 Chrome 之间的差异
 */


function checkNode(node, additionalData) {
  function isBaseTargetBlank() {
    var baseList = document.getElementsByTagName('base');
    return { 
      IE: baseList.length > 0 && 
          baseList[baseList.length - 1].target.toLowerCase() == '_blank',
      Chrome: baseList.length > 0 && 
          baseList[0].target.toLowerCase() == '_blank'
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  
  if (node.tagName != 'A' && node.tagName != 'AREA')
    return;
  
  var href = node.href.trim(), reCus = /^\w*$/gi,
      map = {
        IE: {
          javascript: true,
          mailto: false,
          'view-source': true,
          custom: true
        },
        Chrome: {
          javascript: false,
          mailto: true,
          'view-source': true,
          custom: true
        },
      },
      protocol = href.split(':')[0],
      list = ['javascript', 'mailto', 'view-source'];
  if (list.indexOf(protocol) == -1 && reCus.test(protocol)) {
    protocol = 'custom';
  }
  if ((map.IE[protocol] && isBaseTargetBlank().IE) != (map.Chrome[protocol] && isBaseTargetBlank().Chrome))
    this.addProblem('BX2032', [node]);
}
); // declareDetector

});

