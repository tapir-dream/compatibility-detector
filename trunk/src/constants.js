/*
 * Copyright 2011 Google Inc.
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

/**
 * @fileoverview Shared constants among background.html, popup.html and content
 *  scripts(loader.js, etc).
 */

// Used when saving a list.
var SEPARATOR = ',';

/**
 * Event name to trigger the compatibility detector to start.
 */
var EVENT_CHROME_COMP_LOAD = 'chrome_comp_load';

var EVENT_END_OF_DETECTION = 'chrome_comp_endOfDetection';

var EVENT_PROBLEM_DETECTED = 'chrome_comp_problemDetected';

var EVENT_GET_MESSAGE = 'chrome_comp_getMessage';
var ATTR__MESSAGE_RESULT = 'chrome_comp_messageResult';

var DISABLED_DETECTORS = 'chrome_comp_disabled_detectors';

var REQUEST_GET_DISABLED_DETECTORS = 'getDisabledDetectors';

var REQUEST_PAGE_LOAD = 'pageLoad';
var REQUEST_PAGE_UNLOAD = 'pageUnload';

var REQUEST_GET_CROSS_ORIGIN_CSS = 'getCrossOriginCSS';
var REQUEST_GET_CROSS_ORIGIN_CSS_FINISHED = 'getCrossOriginCSSFinished';

var REQUEST_DETECT_PROBLEMS = 'detectProblems';

var REQUEST_RUN_BASE_DETECTION = 'runBaseDetection';

var REQUEST_SET_STATUS = 'setStatus';

var REQUEST_COMPATIBILITY_RESULT = 'CompatibilityResult';

var REQUEST_END_OF_DETECTION = 'endOfDetection';
