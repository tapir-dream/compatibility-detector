// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'windowOnerror',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
},

function setUp() {
  var This = this;
  var originalWindowOnerror = window.onerror;
  chrome_comp.CompDetect.registerSimplePropertyHook(window, 'onerror',
      function(oldValue, newValue, reason) {
        var func = newValue.toString().replace(/alert/gi, '');
        if (new Function('return ' + func + '()')());
          This.addProblem('SD2020', [document.documentElement]);
        return originalWindowOnerror;
      });
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterSimplePropertyHook(window,
      'onerror', this.otherLanguagePropertyhandler_);
}
); // declareDetector

});
