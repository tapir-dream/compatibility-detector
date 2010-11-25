// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'flashPercentLoaded',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  this.PercentLoaded_ = function(result, originalArguments, callStack) {
    This.addProblem('BT9037', { nodes: [this], needsStack: true });
  };
},

function setUp() {
  chrome_comp.CompDetect.registerSimplePropertyHook(
      HTMLObjectElement.prototype, 'PercentLoaded', this.PercentLoaded_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterSimplePropertyHook(
      HTMLObjectElement.prototype, 'PercentLoaded', this.PercentLoaded_);
}
); // declareDetector

});
