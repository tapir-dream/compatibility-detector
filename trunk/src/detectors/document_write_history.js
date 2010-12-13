/*
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

addScriptToInject(function() {

var loaded = false;
var writeNative;
var writelnNative;

chrome_comp.CompDetect.declareDetector(

'document_write_history',

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
},

function cleanUp() {
  document.write = writeNative;
  document.writeln = writelnNative;
}
); // declareDetector

});
