// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'relative_position_with_table_elements',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor


function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  var tableStyle = ['table-cell', 'table-row', 'table-caption'],
    dis = window.chrome_comp.getComputedStyle(node).display,
    pos = window.chrome_comp.getDefinedStylePropertyByName(node, true, 
      'position'),
    l = parseInt(window.chrome_comp.getDefinedStylePropertyByName(node, true, 
      'left')),
    t = parseInt(window.chrome_comp.getDefinedStylePropertyByName(node, true, 
      'top'));
  if ((tableStyle.indexOf(dis) != -1) && (pos === 'relative') && 
      (l != 0 || t != 0) ) {
    this.addProblem('RM8024', [node]);
  } 	 
}
); // declareDetector

});

