// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'windowClose',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  this.close_ = function(result, originalArguments, callStack) {
    var referer = document.referer;
    var hisCount = history.length;
    alert(originalArguments.callee.caller.arguments[0]);
    var source = originalArguments.callee.caller.arguments[0].target;
    if ((!referer) && (hisCount > 1))
      This.addProblem('BX2012', [source]);
  };
},

function setUp() {
  //chrome_comp.CompDetect.registerExistingMethodHook(
  //    window, 'close', this.close_);
},

function cleanUp() {
  //chrome_comp.CompDetect.unregisterExistingMethodHook(
  //    window, 'close', this.close_);
}
); // declareDetector

});
