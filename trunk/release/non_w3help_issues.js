/*
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

addScriptToInject(function() {

// The definition of compatibility reason.
// ID of non W3Help issues must start with '##' to avoid potential conflict
// with that of W3help issues.
chrome_comp.nonW3helpIssues = {
  '##0000': {
    description: 'Got internal exception when running detectors',
    url: '',
    severityLevel: 9,
    suggestion: ''
  },
  '##0006': {
    description: 'Absolute font size in Quirks mode is not portable',
    severityLevel: 1
  },
  '##0018': {
    description: 'WMP Plugin has defined wrong type',
    severityLevel: 9
  },
  '##0019': {
    description: 'Plugin cannot be created or has wrong size',
    severityLevel: 9
  }
};

});
