// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'replaced_element_lineheight',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function testLineHeightChanged(nodeEl, refValue) {
    var oldInlineValue = nodeEl.style.lineHeight, newCompValue;
    nodeEl.style.lineHeight = 'normal';
    newCompValue = parseInt(chrome_comp.getComputedStyle(nodeEl).lineHeight);
    if (refValue == ((newCompValue) ? newCompValue : 'normal')) {
      nodeEl.style.lineHeight = (oldInlineValue) ? oldInlineValue : null;
      return false;
    } else {
      nodeEl.style.lineHeight = (oldInlineValue) ? oldInlineValue : null;
      return true;
    }
  }

  function testDefinedLineHeight(nodeEl, refValue) {
    var oldInlineValue = nodeEl.style.WebkitAppearance, newCompValue;
    nodeEl.style.WebkitAppearance = 'textfield';
    newCompValue = parseInt(chrome_comp.getComputedStyle(nodeEl).lineHeight);
    if (refValue == ((newCompValue) ? newCompValue : 'normal')) {
      nodeEl.style.WebkitAppearance = (oldInlineValue) ? oldInlineValue : null;
      return false;
    } else {
      nodeEl.style.WebkitAppearance = (oldInlineValue) ? oldInlineValue : null;
      return true;
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  
  if (!chrome_comp.isReplacedElement(node))
    return;
  
  if (node.tagName != 'INPUT')
    return;
  
  var type = node.type.toLowerCase(),
      compLineHeight = parseInt(chrome_comp.getComputedStyle(node).lineHeight),
      compHeight = parseInt(chrome_comp.getComputedStyle(node).height);
  if (type == 'text' || type == 'password') {
    if (compLineHeight == compHeight) {
      if (testLineHeightChanged(node, 
          (compLineHeight) ? compLineHeight : 'normal')) {
        this.addProblem('RD1012', [node]);
      }
    }
  } else if (type == 'button' || type == 'submit' || type == 'reset') {
      if(testDefinedLineHeight(node, 
          (compLineHeight) ? compLineHeight : 'normal'))
        this.addProblem('RD1012', [node]);
  }
  
}
); // declareDetector

});

