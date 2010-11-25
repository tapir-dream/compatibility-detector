// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'backgroundImageOnBrokenInline',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有在拥有背景图片的纯行内元素，在其前后插入两个宽度为 0 的行内块元素
 * 若插入的两个行内块元素的纵坐标不相同，则代表此行内元素折行显示了，则发出警告
 *
 *【缺陷】
 * 
 */


function checkNode(node, additionalData) {
  function hasBackgroundImage(element) {
    return chrome_comp.getComputedStyle(element).backgroundImage != 'none';
  }

  function isBroken(element) {
    element.insertAdjacentHTML('beforeBegin', 
        '<span style="display:inline-block; height:20px;"></span>');
    element.insertAdjacentHTML('afterEnd', 
        '<span style="display:inline-block; height:20px;"></span>');
    var span1 = element.previousElementSibling,
        span2 = element.nextElementSibling,
        top1 = span1.getBoundingClientRect().top,
        top2 = span2.getBoundingClientRect().top;
    element.parentNode.removeChild(span1);
    element.parentNode.removeChild(span2);
    return (top1 != top2);
  }

  function isInline(element) {
    return chrome_comp.getComputedStyle(element).display == 'inline';
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.getComputedStyle(node).display == 'none')
    return;

  if (!isInline(node))
    return;

  if (!hasBackgroundImage(node))
    return;

  if (isBroken(node))
    this.addProblem('RC3004', [node]);
}
); // declareDetector

});

