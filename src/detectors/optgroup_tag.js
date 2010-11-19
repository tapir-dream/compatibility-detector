addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'optgroup_tag',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  //检查节点类型是不是 OPTGROUP
  if (Node.ELEMENT_NODE != node.nodeType || node.tagName != 'OPTGROUP')
    return;
  //检查节点的父元素是不是select
  if(node.parentNode.tagName == "SELECT"){
    this.addProblem('HF2016', [node]);
  }
}
); // declareDetector

});