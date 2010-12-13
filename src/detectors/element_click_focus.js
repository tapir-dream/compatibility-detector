// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'element_click_focus',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  window.addEventListener('load', function () {
      setTimeout(function () {
        var allElements = document.getElementsByTagName('*');
        var list = ['A', 'AREA', 'INPUT', 'EMBED', 'IFRAME', 'TABLE', 
            'CAPTION', 'TD', 'FIELDSET'];
        var typeList = ['text', 'password', 'file', 'hidden'];
        for (var i = 0, j = allElements.length; i < j; i++) {
          if (list.indexOf(allElements[i].tagName) == -1)
            continue;
          if (allElements[i].tagName == 'INPUT' && 
              typeList.indexOf(allElements[i].type.toLowerCase()) != -1)
            continue;
          var hasClick = allElements[i].onclick ||
              allElements[i].getAttribute('hasclick') == 'yes';
          var hasFocus = allElements[i].onfocus ||
              allElements[i].getAttribute('hasfocus') == 'yes';
          if (hasClick && hasFocus) {
            This.addProblem('SD9027', [allElements[i]]);
          }
        }
      }, 1000);
  }, false);
  this.addEventListener_ = function(result, originalArguments, callStack) {
      var list = ['A', 'AREA', 'INPUT', 'EMBED', 'IFRAME', 'TABLE', 
          'CAPTION', 'TD', 'FIELDSET'];
      if (list.indexOf(this.tagName) == -1)
        return;
      var typeList = ['text', 'password', 'file', 'hidden'];
      if (this.tagName == 'INPUT' && 
          typeList.indexOf(this.type.toLowerCase()) != -1)
        return
      var eventType = (originalArguments[0]) ? 
          originalArguments[0].toLowerCase() : 
          '';
      if (eventType == 'click')
        this.setAttribute('hasclick', 'yes');
      if (eventType == 'focus')
        this.setAttribute('hasfocus', 'yes');
  };
},

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      Node.prototype, 'addEventListener', this.addEventListener_);
  chrome_comp.CompDetect.registerExistingMethodHook(
      window.__proto__, 'addEventListener', this.addEventListener_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      Node.prototype, 'cloneNode', this.addEventListener_);
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      window.__proto__, 'cloneNode', this.addEventListener_);
}
); // declareDetector

});
