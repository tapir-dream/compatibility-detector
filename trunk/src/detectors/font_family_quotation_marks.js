// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'font_family_quotation_marks',

chrome_comp.CompDetect.ScanDomBaseDetector,

null,

function checkNode(node, context) {
  function isCommaInQuotationMarks(string) {
    try {
      var s = new Function('return [' + string + ']')();
      if (s.length > 1)
        return false;
      if (s[0].split(',').length <= 1)
        return false;
      return s;
    } catch (e) {
      return false;
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var ff = chrome_comp.getComputedStyle(node).fontFamily;
  if (isCommaInQuotationMarks(ff))
    this.addProblem('RY1001', [node]);
}
); // declareDetector

});

