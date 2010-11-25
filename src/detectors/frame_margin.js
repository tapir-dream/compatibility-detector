// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'frameMarginWidthAndHightDetector',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 过滤出 FRAME 和 IFRAME 标记
 * 检测 marginwidth  marginheight 属性，如果为非数字或非设置情况则命中
 *
 *【messages.json】
 * "HM1002": { "message": "各浏览器对 "marginwidth" 和 "marginheight" 属性的错误设定值的处理不同 },
 * "HM1002_suggestion": { "message": "在使用 \"marginwidth\" 和 \"marginheight\" 时应严格遵照规范中的描述，要对其设定大于等于零的数值。" },
 */

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName != 'FRAME' && node.tagName != 'IFRAME')
    return;

  var propertyValueRegExp_ = /(^\d+$)|(^\s*$)|^null$/;

  if ( !propertyValueRegExp_.test(node.getAttribute('marginwidth')))
    this.addProblem('HM1002', [node]);
  if ( !propertyValueRegExp_.test(node.getAttribute('marginheight')))
    this.addProblem('HM1002', [node]);

}
); // declareDetector

});
