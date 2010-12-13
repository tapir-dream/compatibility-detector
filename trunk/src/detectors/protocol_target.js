// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'protocol_target',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor


function checkNode(node, additionalData) {
  function isBaseTargetBlank() {
    var baseList = document.getElementsByTagName('base');
    return { 
      IE: baseList.length > 0 && 
          baseList[baseList.length - 1].target.toLowerCase() == '_blank',
      Chrome: baseList.length > 0 && 
          baseList[0].target.toLowerCase() == '_blank'
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  
  if (node.tagName != 'A' && node.tagName != 'AREA')
    return;
  
  var href = node.href.trim(), reCus = /^\w*$/gi,
      map = {
        IE: {
          javascript: true,
          mailto: false,
          'view-source': true,
          custom: true
        },
        Chrome: {
          javascript: false,
          mailto: true,
          'view-source': true,
          custom: true
        },
      },
      protocol = href.split(':')[0],
      list = ['javascript', 'mailto', 'view-source'];
  if (list.indexOf(protocol) == -1 && reCus.test(protocol)) {
    protocol = 'custom';
  }
  if ((map.IE[protocol] && isBaseTargetBlank().IE) != (map.Chrome[protocol] &&
    isBaseTargetBlank().Chrome))
    this.addProblem('BX2032', [node]);
}
); // declareDetector

});

