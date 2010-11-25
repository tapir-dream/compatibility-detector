// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'baseTagPositionDetector',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*
 *【思路】
 * 检测 BASE 标记，如果标记属于 BDOY 标记子元素，再得到所有 A 标记，
 * 遍历 A 标记，判断是否处于该 BASE 标记之后，如有则命中。
 *
 *
 *【messages.json】
 * "HJ2001": { "message": "各浏览器对 BASE 元素前后的超链接的默认 target 处理存在差异" },
 * "HJ2001_suggestion": { "message": "不要在 HEAD 元素之外定义 BASE 元素，保证各浏览器兼容。" },
 *
 */

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName != 'BASE')
    return;

  if ( document.getElementsByTagName('body')[0].compareDocumentPosition(node) != 20 )
    return;

  var Links = Array.prototype.slice.call(document.getElementsByTagName('A'));

  for (var i = 0,len = Links.length; i<len; i++){
      if ( node.compareDocumentPosition(Links[i]) === 2 ){
         this.addProblem('HJ2001', [node]);
	 return ;
      }
  }


}
); // declareDetector

});
