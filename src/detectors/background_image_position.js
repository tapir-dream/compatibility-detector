// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'backgroundImagePosition',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有在 IE 中未触发 hasLayout 特性的拥有背景图片的元素
 * 若其未设定 background-origin:border-box 则发出警告
 *
 *【缺陷】
 * 
 */


function checkNode(node, additionalData) {
  function hasBackgroundImage(element) {
    return chrome_comp.getComputedStyle(element).backgroundImage != 'none';
  }

  function hasBorder(element) {
    var btw = parseInt(chrome_comp.getComputedStyle(element).borderTopWidth),
        blw = parseInt(chrome_comp.getComputedStyle(element).borderLeftWidth);
    return (btw != 0) || (blw != 0);
  }

  function getBackgroundOrigin(element) {
    return chrome_comp.getComputedStyle(element).backgroundOrigin;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.getComputedStyle(node).display == 'none')
    return;

  if (chrome_comp.hasLayoutInIE(node))
    return;

  if (!hasBackgroundImage(node))
    return;

  if (!hasBorder(node))
    return;

  if (getBackgroundOrigin(node) != 'border-box')
    this.addProblem('RC3005', [node]);
}
); // declareDetector

});

