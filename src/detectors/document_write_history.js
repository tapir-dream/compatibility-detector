// @author : luyuan.china@gmail.com

addScriptToInject(function() {

var loaded = false;
var writeNative;
var writelnNative;

chrome_comp.CompDetect.declareDetector(

'documentWriteHistory',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  this.write_ = function () {
    if (loaded) {
      This.addProblem('BW1010', [document.documentElement]);
    } else {
      writeNative.apply(document, arguments);
    }
  }
  this.writeln_ = function () {
    if (loaded) {
      This.addProblem('BW1010', [document.documentElement]);
    } else {
      writelnNative.apply(document, arguments);
    }
  }
},

function setUp() {
  window.addEventListener('load', function () {
    loaded = true;
  }, false);
  writeNative = document.write;
  writelnNative = document.writeln;
  document.write = this.write_;
  document.writeln = this.writeln_;
  //chrome_comp.CompDetect.registerExistingMethodHook(
  //    document, 'write', this.write_);
},

function cleanUp() {
  document.write = writeNative;
  document.writeln = writelnNative;
  //chrome_comp.CompDetect.unregisterExistingMethodHook(
  //    document, 'write', this.write_);
}
); // declareDetector

});
