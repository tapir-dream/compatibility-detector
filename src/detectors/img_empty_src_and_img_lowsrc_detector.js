// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'imgEmptySrcAndLowsrcDetector',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【说明】
 * 本例检测了两个RCA问题：空 src 的 img 标记和 img 的 lowsrc 属性
 *
 *【思路】
 * 检测所有 img input[type=image] 标记，如果被其不存在 src 属性或 src 属性值为空，则命中。
 * 检测所有 img input[type=image] 标记，如果被其不存在 src 属性或 src 属性值为空，并且存在 lowsrc 属性则命中。
 *
 *【messages.json】
 * "BT1038": { "message": "只有 IE 支持 IMG INPUT[type=image] 标记内的 lowsrc 属性"},
 * "BT1038_suggestion": { "message": "如无特殊应用需求，应避免使用 lowsrc 属性。" },
 *
 * "HO1002": { "message": "IMG 元素的 src 属性为空时其尺寸在各浏览器中不一致" },
 * "HO1002_suggestion": { "message": "为了防止这种无 \"src\" 的 IMG 元素对页面产生布局影响，需要设置这种 IMG 的 ‘display’ 特性为 'none'。" },
 */


function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  if ( node.tagName != 'IMG' && node.tagName != 'INPUT' )
    return;

  if ( node.tagName === 'INPUT' &&
       node.getAttribute('type') != 'image' )
    return;

  if ( !node.hasAttribute('src') || node.getAttribute('src') === '' )
    this.addProblem('HO1002', [node]);

  if ( ( !node.hasAttribute('src') || node.getAttribute('src') === '' ) && node.hasAttribute('lowsrc') )
    this.addProblem('BT1038', [node]);
}
); // declareDetector

});
