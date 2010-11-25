// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'floatCenterCssDetector',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有标记，如果被设置了 'float:center' 则命中
 *
 *【messages.json】
 * "RM1025": { "message": "Chrome Safari 认为 'float:center' 是合法值且其计算值为 'none'" },
 * "RM1025_suggestion": { "message": "避免使用非法的 'float' 特性值。" },
 */

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if ( window.chrome_comp.getDefinedStylePropertyByName(node, true, 'float') === 'center' )
    this.addProblem('RM1025', [node]);

}
); // declareDetector

});
