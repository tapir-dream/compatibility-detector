// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'zoomStyleDetector',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*
 *【思路】
 * 检测所有标记，如果 zoom 样式值被设置为非 1，则命中。
 *
 *【messages.json】
 * "BX8017": { "message": "只有 IE Chrome Safari 支持 'zoom' 特性并且他们的具体实现方式不同"},
 * "BT1038_suggestion": { "message": "如无特殊应用需求，应避免使用 lowsrc 属性。" },
 *
 */

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  var nodeCssZoomValue = parseFloat(window.getComputedStyle(node, null).zoom));
  if ( isNaN(nodeCssZoomValue) ) nodeCssZoomValue = 1;
  if ( nodeCssZoomValue != 1 )
    this.addProblem('BX8017', [node]);

}
); // declareDetector

});
