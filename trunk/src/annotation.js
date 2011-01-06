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
var annotations = [];
var annotationsDiv = null;
var highlightDivs = [];
var balloonDiv = null;

function compareAnnotations(a1, a2) {
  var result = a1.top - a2.top;
  if (result)
    return result;
  result = a1.left - a2.left;
  return result ? result : a1.originalSequence - a2.originalSequence;
}

function updateAnnotationTopLeft(annotation) {
  annotation.rectangles = [];
  var rectsFromAncestor = [];
  for (var i = 0, c = annotation.nodes.length; i < c; i++) {
    var node = annotation.nodes[i];
    var rects = annotation.rectCallback(node);
    if (rects.fromAncestor) {
      // Don't use rects from ancestor for now.
      rectsFromAncestor = rectsFromAncestor.concat(rects);
    } else {
      annotation.rectangles = annotation.rectangles.concat(rects);
    }
  }

  if (!annotation.rectangles.length) {
    // Use ancestor rects only if there has no normal rects.
    annotation.rectangles = rectsFromAncestor;
  }

  var top = 0;
  var left = 0;
  // Use the first rect of the first node as the anchor position.
  if (annotation.rectangles.length) {
    top = annotation.rectangles[0].top;
    left = annotation.rectangles[0].left;
  }

  var changed = annotation.top != top || annotation.left != left;
  if (changed) {
    annotation.top = top;
    annotation.left = left;
  }
  return changed;
}

function preprocessAnnotations() {
  if (!annotations.length) {
    var sequence = 0;
    var problems = chrome_comp.CompDetect.getAllProblems();
    var issusId = document.documentElement.getAttribute('issusId');
    // console.log(issusId.split(','));
    document.documentElement.removeAttribute('issusId');
    for (var typeId in problems) {
      if(issusId && issusId.split(',').indexOf(typeId) != -1) {
        // console.log(issusId);
        var problem = problems[typeId];
      // Sanity check to ensure this entry is valid (not an injected property
      // by the host page.
        if (problem && problem.occurrences && problem.occurrences.length) {
          for (var i = 0, c = problem.occurrences.length; i < c; i++) {
            var annotation = problem.occurrences[i];
            annotation.problem = problem;
            // This sequence is to ensure the sorting is stable when multiple
            // annotations has the same position.
            annotation.originalSequnece = sequence++;
            annotations.push(annotation);
            updateAnnotationTopLeft(annotation);
          }
        }
      }

    }
    annotations.sort(compareAnnotations);
  }
}

// The 'this' object should be the tag div or balloon div.
function showHighlight() {
  hideHighlight();
  var annotation = annotations[this.annotationIndex];
  var className = annotation.isError ?
      'chrome-comp-highlight-error' : 'chrome-comp-highlight-warning';
  for (var i = 0, c = annotation.rectangles.length; i < c; i++) {
    var rect = annotation.rectangles[i];
    var highlightDiv;
    if (i < highlightDivs.length) {
      highlightDiv = highlightDivs[i];
    } else {
      highlightDiv = document.createElement('div');
      annotationsDiv.appendChild(highlightDiv);
      highlightDivs.push(highlightDiv);
    }
    highlightDiv.style.display = 'block';
    highlightDiv.className = className;
    highlightDiv.style.left = (rect.left - 1) + 'px';
    highlightDiv.style.top = (rect.top - 1) + 'px';
    highlightDiv.style.width = (rect.width - 1) + 'px';
    highlightDiv.style.height = (rect.height - 1)+ 'px';
  }
}

function hideHighlight() {
  for (var i = 0, c = highlightDivs.length; i < c; i++)
    highlightDivs[i].style.display = 'none';
}

function showBalloon(index) {
  if (index < 0 || index >= annotations.length)
    return;

  var annotation = annotations[index];
  var tagDiv = annotation.tagDiv;
  var navigationDiv;
  var descriptionDiv;
  var detailsDiv;
  var suggestionDiv;
  var moreInfoDiv;
  var previousLink;
  var nextLink;
  if (!balloonDiv) {
    balloonDiv = document.createElement('div');
    balloonDiv.className = 'chrome-comp-balloon';
    balloonDiv.onmouseover = showHighlight;
    balloonDiv.onmouseout = hideHighlight;

    var closeLink = document.createElement('a');
    closeLink.style.float = 'right';
    closeLink.innerText = chrome_comp.getMessage('close');
    closeLink.href = '#';
    closeLink.onclick = function() {
      balloonDiv.style.display = 'none';
      return false;
    };
    balloonDiv.appendChild(closeLink);

    navigationDiv = document.createElement('div');
    navigationDiv.innerText = '#'; // Just a place holder.
    previousLink = document.createElement('a');
    previousLink.innerText = chrome_comp.getMessage('previous');
    previousLink.href = '#';
    previousLink.onclick = function() {
      showBalloon(this.annotationIndex - 1);
      return false;
    };
    navigationDiv.appendChild(previousLink);
    nextLink = document.createElement('a');
    nextLink.innerText = chrome_comp.getMessage('next');
    nextLink.href = '#';
    nextLink.onclick = function() {
      showBalloon(this.annotationIndex + 1);
      return false;
    };
    navigationDiv.appendChild(nextLink);
    balloonDiv.appendChild(navigationDiv);

    descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'chrome-comp-description';
    balloonDiv.appendChild(descriptionDiv);
    detailsDiv = document.createElement('div');
    detailsDiv.className = 'chrome-comp-details';
    balloonDiv.appendChild(detailsDiv);
    suggestionDiv = document.createElement('div');
    suggestionDiv.className = 'chrome-comp-suggestion';
    balloonDiv.appendChild(suggestionDiv);
    moreInfoDiv = document.createElement('div');
    moreInfoDiv.className = 'chrome-comp-more-info';
    var moreInfo = document.createElement('a');
    moreInfo.innerText = chrome_comp.getMessage('moreInfo');
    moreInfo.target = '_blank';
    moreInfoDiv.appendChild(moreInfo);
    balloonDiv.appendChild(moreInfoDiv);
    annotationsDiv.appendChild(balloonDiv);
  } else {
    navigationDiv = balloonDiv.childNodes[1];
    descriptionDiv = navigationDiv.nextSibling;
    detailsDiv = descriptionDiv.nextSibling;
    suggestionDiv = detailsDiv.nextSibling;
    moreInfoDiv = suggestionDiv.nextSibling;
    previousLink = navigationDiv.childNodes[1];
    nextLink = navigationDiv.childNodes[2];
  }

  navigationDiv.firstChild.nodeValue =
      chrome_comp.getMessage('mOfN', [index + 1, annotations.length]) + ' ';
  previousLink.annotationIndex = index;
  nextLink.annotationIndex = index;
  previousLink.setAttribute('disabled', String(index == 0));
  nextLink.setAttribute('disabled', String(index == annotations.length - 1));

  var problem = annotation.problem;
  descriptionDiv.innerText = problem.issueDescription;
  var details = annotation.details;
  if (annotation.stack) {
    // Insert a zero-width space before all '/'s to make them line-breakable.
    details = (details ? details + '\n' : '') +
        annotation.stack.replace(/\//g, '\u200B/');
  }
  if (details) {
    detailsDiv.innerText = details;
    detailsDiv.style.display = 'block';
  } else {
    detailsDiv.style.display = 'none';
  }
  if (problem.suggestion) {
    suggestionDiv.innerText = chrome_comp.getMessage('suggestion') +
        problem.suggestion + (problem.issueUrl ? '...' : '');
    suggestionDiv.style.display = 'block';
  } else {
    suggestionDiv.style.display = 'none';
  }
  if (problem.issueUrl) {
    moreInfoDiv.firstChild.href = problem.issueUrl;
    moreInfoDiv.style.display = 'block';
  } else {
    moreInfoDiv.style.display = 'none';
  }

  balloonDiv.style.display = 'block ';
  balloonDiv.style.left = tagDiv.offsetLeft + 'px';
  balloonDiv.style.top = tagDiv.offsetTop + tagDiv.offsetHeight + 'px';
  if (tagDiv.offsetTop < window.scrollY) {
    window.scrollTo(window.scrollX, tagDiv.offsetTop);
  } else {
    var balloonBottom = balloonDiv.offsetTop + balloonDiv.offsetHeight;
    if (balloonBottom > window.scrollY + window.innerHeight) {
      balloonDiv.style.top = tagDiv.offsetTop - balloonDiv.offsetHeight + "px";
      window.scrollTo(window.scrollX, balloonBottom - window.innerHeight);
    }
  }
  if (tagDiv.offsetLeft < window.scrollX) {
    window.scrollTo(tagDiv.offsetLeft, window.scrollY);
  } else {
    var balloonRight = balloonDiv.offsetLeft + balloonDiv.offsetWidth;
    if (balloonRight > window.scrollX + window.innerWidth) {

      balloonDiv.style.left = tagDiv.offsetLeft - balloonDiv.offsetWidth +
          annotation.rectangles[0].width + "px";
      window.scrollTo(balloonRight - window.innerWidth, window.scrollY);
    }
  }
  balloonDiv.annotationIndex = index;
  showHighlight.apply(balloonDiv);
  window.console.log(annotation.problem.issueDescription);
  // Show the primary node in the console. In developer tool, the user can
  // see the details of the node in the console panel.
  if (annotation.nodes && annotation.nodes.length)
    window.console.log(annotation.nodes);
  if (annotation.stack)
    window.console.log(annotation.stack);
}

function onTagClick() {
  showBalloon(this.annotationIndex);
}

function isDescendentOf(e1, e2) {
  while (e1) {
    if (e1 == e2)
      return true;
    e1 = e1.parentNode;
  }
  return false;
}

function onDocumentMouseDown(event) {
  // Do nothing if the mouse is clicking on the scroll bar.
  if (event.target == document.documentElement &&
      (event.clientX > window.scrollX + document.documentElement.scrollWidth ||
       event.clientY > window.scrollY + document.documentElement.scrollHeight))
    return;
  if (balloonDiv && !isDescendentOf(event.target, balloonDiv))
    balloonDiv.style.display = 'none';
}

function onDocumentMouseWheel(event) {
  onDocumentMouseDown(event);
}  

function onDocumentKeyDown(event) {
  if (balloonDiv && balloonDiv.style.display == 'block') {
    switch (event.keyCode) {
      case 36: // Home
        showBalloon(0);
        break;
      case 37: // Arrow Left
      case 38: // Arrow Up
        showBalloon(balloonDiv.annotationIndex - 1);
        break;
      case 39: // Arrow Right
      case 40: // Arrow Down
        showBalloon(balloonDiv.annotationIndex + 1);
        break;
      case 35: // End
        showBalloon(annotations.length - 1);
        break;
      default:
        return;
    }
    event.stopPropagation();
    event.preventDefault();
  }
}

var refreshTimer;

function setAnnotationTagsPosition(annotations) {
  var lastOriginalLeft = 0;
  var lastOriginalTop = 0;
  var lastRight = 0;
  var lastBottom = 0;
  for (var i = 0, c = annotations.length; i < c; i++) {
    var annotation = annotations[i];
    var x = annotation.left;
    var y = annotation.top;
    if (x < lastOriginalLeft) {
      y = Math.max(lastBottom, y);
    } else if (x < lastRight) {
      if (y > lastOriginalTop)
        y = Math.max(lastBottom, y);
      else
        x = lastRight;
    }
    var tagDiv = annotation.tagDiv;
    tagDiv.style.left = x + 'px';
    tagDiv.style.top = y + 'px';

    lastOriginalLeft = annotation.left;
    lastOriginalTop = annotation.top;
    lastRight = x + tagDiv.offsetWidth;
    lastBottom = y + tagDiv.offsetHeight;
  }
}

function refreshAnnotations() {
  if (!annotationsDiv)
    return;
  var positionChanged = false;
  for (var i = 0, c = annotations.length; i < c; i++) {
    if (updateAnnotationTopLeft(annotations[i]))
      positionChanged = true;
  }
  if (positionChanged) {
    // Make a copy of the original annotations to ensure the original tag
    // numbers unchanged.
    var annotationsCopy = annotations.concat();
    annotationsCopy.sort(compareAnnotations);
    setAnnotationTagsPosition(annotationsCopy);
    // Simply hide the highlight to reduce the complexity.
    hideHighlight();
    // Refresh the position of the balloon.
    if (balloonDiv && balloonDiv.style.display == 'block')
      showBalloon(balloonDiv.annotationIndex);
  }
}

function showAnnotations() {
  annotations = [];
  if (annotationsDiv)
    return;
  preprocessAnnotations();
  if (!annotations.length)
    return;

  annotationsDiv = document.createElement('div');
  annotationsDiv.className = 'chrome-comp-annotations';
  document.body.appendChild(annotationsDiv);
  var styleElement = document.createElement('style');
  styleElement.innerText =
    // First try to reset all styles.
    // '.chrome-comp-annotations a:link' must be included here otherwise if
    // a 'a:link' rule in the page would have higher priority.
    '.chrome-comp-annotations *, .chrome-comp-annotations a:link {' +
      'margin: 0;' +
      'padding: 0;' +
      'border: none;' +
      'border-spacing: 0;' +
      'border-radius: 0;' +
      'background: transparent;' +
      'opacity: 1;' +
      'visibility: visible;' +
      'font: 12px sans-serif;' +
      'text-indent: 0;' +
      'text-decoration: none;' +
      'text-align: left;' +
      'color: black;' +
      'direction: ltr;' +
      'line-height: normal;' +
      'letter-spacing: 0;' +
      'vertical-align: baseline;' +
      'white-space: normal;' +
      'float: none;' +
      'min-width: 0;' +
      'min-height: 0;' +
      'max-width: none;' +
      'max-height: none;' +
      'width: auto;' +
      'height: auto;' +
      'overflow: display; }' +
    '.chrome-comp-annotations * { color: black; }' +
    '.chrome-comp-annotations div {' +
      'display: block; }' +
    '.chrome-comp-error, .chrome-comp-warning {' +
      'position: absolute;' +
      'color: white;' +
      'font-size: 10px;' +
      'padding: 1px;' +
      'border-radius: 3px;' +
      'min-width: 12px;' +
      'opacity: 0.9;' +
      'text-align: center;' +
      'cursor: pointer;' +
      'z-index: 100000000; }' +
    '.chrome-comp-error { ' +
      'background: -webkit-gradient(linear, left top, left bottom,' +
        'from(#F00), to(#B10));' +
      'border: solid thin #A10; }' +
    '.chrome-comp-warning { ' +
      'background: -webkit-gradient(linear, left top, left bottom,' +
        'from(#FA0), to(#B80));' +
      'border: solid thin #A70; }' +
    '.chrome-comp-error:hover,.chrome-comp-warning:hover {' +
      'opacity: 1 }' +
    '.chrome-comp-highlight-error {' +
      'position: absolute;' +
      'z-index: 99999999;' +
      'opacity: 0.5;' +
      'background:#F00;' +
      'border:solid thin #A10 }' +
    '.chrome-comp-highlight-warning {' +
      'position: absolute;' +
      'z-index: 99999999;' +
      'opacity: 0.5;' +
      'background:#FA0;' +
      'border:solid thin #A10; }' +
    '.chrome-comp-balloon {' +
      'position: absolute;' +
      'z-index: 100000001;' +
      'background: #FFC;' +
      'padding: 5px;' +
      'border: solid thin #888;' +
      'border-top-left-radius: 6px;' +
      'border-bottom-left-radius: 6px;' +
      'border-top-right-radius: 6px;' +
      'border-bottom-right-radius: 6px;' +
      'opacity: 0.9;' +
      'width: 350px;' +
      'overflow: hidden; }' +
    '.chrome-comp-navigation {' +
      'text-align: left;' +
      'white-space: pre;' +
      'padding-bottom: 3px; }' +
    '.chrome-comp-description {' +
      'font: bold 14px sans-serif; }' +
    '.chrome-comp-details {' +
      'white-space: pre-wrap; }' +
    '.chrome-comp-suggestion {' +
      'white-space: normal; }' +
    '.chrome-comp-more-info {' +
      'white-space: normal; }' +
    '.chrome-comp-annotations a, .chrome-comp-annotations a:link {' +
      'display: inline;' +
      'text-decoration: underline;' +
      'color: #11C;' +
      'cursor: pointer;' +
      'margin: 0px 3px; }' +
    '.chrome-comp-annotations a:hover {' +
      'color: #11C; }' +
    '.chrome-comp-annotations a:active {' +
      'color: #11C; }' +
    '.chrome-comp-annotations a[disabled="true"] {' +
      'text-decoration: none;' +
      'color: #666;' +
      'cursor: default; }';
  annotationsDiv.appendChild(styleElement);

  for (var i = 0, c = annotations.length; i < c; i++) {
    var annotation = annotations[i];
    var tag = document.createElement('div');
    annotation.isError =
        (annotation.severityLevel || annotation.problem.severityLevel) >= 7;
    tag.className = annotation.isError ?
         'chrome-comp-error' : 'chrome-comp-warning';
    tag.innerText = String(i + 1);
    annotationsDiv.appendChild(tag);
    annotation.tagDiv = tag;
    tag.annotationIndex = i;
    tag.onmouseover = showHighlight;
    tag.onmouseout = hideHighlight;
    tag.onclick = onTagClick;
  }

  setAnnotationTagsPosition(annotations);
  showBalloon(0);
  document.addEventListener('mousedown', onDocumentMouseDown, true);
  document.addEventListener('mousewheel', onDocumentMouseWheel, true);
  document.addEventListener('keydown', onDocumentKeyDown, true);
  refreshTimer = window.setInterval(refreshAnnotations, 300);
}

function hideAnnotations() {
  if (!annotationsDiv)
    return;

  document.body.removeChild(annotationsDiv);
  annotationsDiv = null;
  highlightDivs = [];
  balloonDiv = null;
  document.removeEventListener('mousedown', onDocumentMouseDown, true);
  document.removeEventListener('keydown', onDocumentKeyDown, true);
  window.clearInterval(refreshTimer);
}

document.documentElement.addEventListener('chrome_comp_AnnotationOn',
    function() {
      showAnnotations();
    });

document.documentElement.addEventListener('chrome_comp_AnnotationOff',
    function() {
      hideAnnotations();
    });
});

chrome.extension.onRequest.addListener(function (request, sender, response) {
  if (request.type == 'AnnotationOn') {
    document.documentElement.setAttribute('issusId', request.issusId);
  }
  var event = document.createEvent('Event');
  event.initEvent('chrome_comp_' + request.type, true, true);
  document.documentElement.dispatchEvent(event);
  response && response();
});
