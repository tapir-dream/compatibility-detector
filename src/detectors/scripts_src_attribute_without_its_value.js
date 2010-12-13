// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'scripts_src_attribute_without_its_value',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType || node.tagName != 'SCRIPT')
    return;

  if ((node.hasAttribute('src')) && (node.getAttribute('src') == '') &&
      node.text.trim() != '') {
    this.addProblem('HS9001', [node]);
  }
}
); // declareDetector

});

