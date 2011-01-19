const DEFAULT_LOCALE = 'zh-cn'; // TODO: change to en when w3help ready.
const W3HELP_LOCALES = {
  'en': true,
  'zh-cn': true
};

const STATUS_BASE = 'base';
const STATUS_ADVANCED = 'advanced';

var w3helpLocale = chrome.i18n.getMessage('@@ui_locale');

// TODO: '@@ui_locale' can be en_GB
if (w3helpLocale)
  w3helpLocale = w3helpLocale.toLowerCase().replace('_', '-');
if (!W3HELP_LOCALES.hasOwnProperty(w3helpLocale))
  w3helpLocale = DEFAULT_LOCALE;
w3helpLocale = 'http://www.w3help.org/' + w3helpLocale;

// ----
// Helper functions

function stringTemplate(param) {
  return param.str.replace(param.regexp || /\${([^{}]*)}/g,
      function(a,b) {
        var r = param.obj[b];
        return (typeof r == 'string') ? r : a ;
      })
}

function $(id) {
  return document.getElementById(id);
}

function bulidHTMLView(templateObject, element) {
  var HTMTemplate = element.innerHTML;
  element.innerHTML = stringTemplate({
    str: HTMTemplate,
    obj: templateObject
  });
}

function log(message) {
  var backgroundPage = chrome.extension.getBackgroundPage();
  backgroundPage.log('(popup.js) ' + message);
}

// ----
// Event handlers

// TODO: break the huge anonymous into pieces
document.addEventListener('DOMContentLoaded', function() {
  log('DOMContentLoaded begin');
  // HTMLView i18n
  bulidHTMLView({
    popup_cannotDetect: chrome.i18n.getMessage('popup_cannotDetect'),
    popup_loading: chrome.i18n.getMessage('popup_loading'),
    popup_baseDetection: chrome.i18n.getMessage('popup_baseDetection'),
    popup_advancedDetection: chrome.i18n.getMessage(
        'popup_advancedDetection'),
    popup_detecting: chrome.i18n.getMessage('popup_detecting'),
    popup_noProblem: chrome.i18n.getMessage('popup_noProblem'),
    popup_issueDescription: chrome.i18n.getMessage('popup_issueDescription'),
    popup_issueCount: chrome.i18n.getMessage('popup_issueCount'),
    popup_detectionStatus: chrome.i18n.getMessage('popup_detectionStatus'),
    popup_checkboxEffectTip: chrome.i18n.getMessage('popup_checkboxEffectTip')
  }, $('warp'));

  var $body = document.body;
  var $tab = $('tab');
  var $content = $('content');
  var $baseDetection = $('base_detection');
  var $advancedDetection = $('advanced_detection');

  var backgroundPage = chrome.extension.getBackgroundPage();

  function showBaseDetectionResult(data) {
    log('showBaseDetectionResult begin');
    $content.className = 'processing';
    var result = [];

    var KB001 = chrome.i18n.getMessage('bd_aboutRCAorKB') +
        '<a href="' + w3helpLocale + '/kb/001" target="_blank">' +
        chrome.i18n.getMessage('KB001') + '</a>';

    if (data.documentMode.pageDTD) {
      result.push('<li>' + chrome.i18n.getMessage('bd_hasDTD'));
      if (data.documentMode.strangeName ||
          data.documentMode.strangePublicId ||
          data.documentMode.strangeSystemId)
        result.push(chrome.i18n.getMessage('bd_strangeDTD'));
      if (data.documentMode.hasCommentBeforeDTD)
        result.push(chrome.i18n.getMessage('bd_makeIEBeInQuirksMode') +
            chrome.i18n.getMessage('bd_aboutRCAorKB') +
            '<a href="' + w3helpLocale + '/causes/HG8001" target="_blank">' +
            chrome.i18n.getMessage('HG8001') + '</a>');
      if (data.documentMode.compatMode.IE ==
          data.documentMode.compatMode.WebKit) {
        var mode = (data.documentMode.compatMode.WebKit == 'S')
            ? '<em>' + chrome.i18n.getMessage('bd_S') + '</em>'
            : '<strong>' + chrome.i18n.getMessage('bd_Q') + '</strong>';
        result.push(chrome.i18n.getMessage('bd_sameDTD',
            ['<em>' + chrome.i18n.getMessage('bd_same') + '</em>', mode]));
        if (data.documentMode.compatMode.WebKit == 'Q') {
          result.push(chrome.i18n.getMessage('bd_inQuirksMode') +
              chrome.i18n.getMessage('bd_reducePossibility') + KB001);
        }
        result.push('</li>');
      } else {
        result.push('<li>' + chrome.i18n.getMessage('bd_differentDTD',
            ['<strong>' + chrome.i18n.getMessage('bd_different') +
            '</strong>']) + chrome.i18n.getMessage('bd_reducePossibility') +
            KB001 + '</li>');
      }
    } else {
      result.push('<li>' + chrome.i18n.getMessage('bd_noDTD',
          ['<strong>' + chrome.i18n.getMessage('bd_Q') + '</strong>']) +
          chrome.i18n.getMessage('bd_reducePossibility') + '</li>');
    }
    // Process data.DOM to HTML
    result.push('<li>' + chrome.i18n.getMessage('bd_nodeCount',
        ['<em>' + data.DOM.count + '</em>']) + '</li>');

    if (data.DOM.IECondComm.length)
      result.push('<li>' + chrome.i18n.getMessage('bd_IECondCommCount',
          ['<strong>' + data.DOM.IECondComm.length + '</strong>']) + '</li>');
    // Process data.STYLE to HTML
    result.push('<li>');
    if (data.STYLE.totalCount != 0) {
      result.push(chrome.i18n.getMessage('bd_styleTotalCount',
          ['<em>' + data.STYLE.totalCount + '</em>']));
      if (data.STYLE.noInHeadCount != 0) {
        result.push(chrome.i18n.getMessage('bd_styleNoInHeadCount',
            ['<strong>' + data.STYLE.noInHeadCount + '</strong>']));
      } else {
        result.push(chrome.i18n.getMessage('bd_noStyleNoInHeadCount'));
      }
    } else {
      result.push(chrome.i18n.getMessage('bd_noStyleTotalCount'));
    }
    result.push('</li>');
    // Process data.SCRIPT to HTML
    result.push('<li>');
    if (data.SCRIPT.totalCount != 0) {
      result.push(chrome.i18n.getMessage('bd_scriptTotalCount',
          ['<em>' + data.SCRIPT.totalCount + '</em>']));
      if (data.SCRIPT.noInHeadCount != 0) {
        result.push(chrome.i18n.getMessage('bd_scriptNoInHeadCount',
            ['<strong>' + data.SCRIPT.noInHeadCount + '</strong>']));
      } else {
        result.push(chrome.i18n.getMessage('bd_noScriptNoInHeadCount'));
      }
    } else {
      result.push(chrome.i18n.getMessage('bd_noScriptTotalCount'));
    }
    result.push('</li>');
    // Process data.HTMLBase.HTMLDeprecatedTag to HTML
    var deprecatedTag = [];
    for (var tag in data.HTMLBase.HTMLDeprecatedTag) {
      deprecatedTag.push(tag);
    }
    var deprecatedTagLength = deprecatedTag.length;
    if (deprecatedTagLength) {
      for (var i = 0; i < deprecatedTagLength; ++i) {
        result.push('<li>' + chrome.i18n.getMessage('bd_hasDeprecatedTag',
            ['<strong>' + deprecatedTag[i] + '</strong>']) + '</li>');
      }
    } else {
      result.push('<li>' +
          chrome.i18n.getMessage('bd_noDeprecatedTag') + '</li>');
    }
    // Process data.HTMLBase.HTMLDeprecatedAttribute to HTML
    var tagsHaveDeprecatedAttributes =
        Object.keys(data.HTMLBase.HTMLDeprecatedAttribute);
    var tagsLength = tagsHaveDeprecatedAttributes.length;
    if (tagsLength) {
      for (var i = 0; i < tagsLength; ++i) {
        var tagListString = [];
        var attrs =
            data.HTMLBase.HTMLDeprecatedAttribute[
              tagsHaveDeprecatedAttributes[i]
            ];
        for (var attr in attrs) {
          tagListString.push(attr);
        }
        result.push('<li>' +
            chrome.i18n.getMessage('bd_hasDeprecatedAttribute',
            ['<strong>' + tagsHaveDeprecatedAttributes[i] + '</strong>',
            '<strong>' + tagListString.join(' ') + '</strong>']) + '</li>');
      }
    } else {
      result.push('<li>' +
          chrome.i18n.getMessage('bd_noDeprecatedAttribute') + '</li>');
    }

    // Show result.
    $baseDetection.innerHTML = result.join('');
    $content.className = '';
  }

  /**
   * Change pop-up page's status.
   */
  function setStatus(status) {
    log('setStatus: ' + status);
    switch (status) {
      case 'disabled':
        $body.className = 'disabled';
        break;
      case 'loading':
        $body.className = 'loading';
        break;
      case STATUS_BASE:
        $body.className = 'base';
        break;
      case STATUS_ADVANCED:
        $body.className = 'advanced';
        break;
    }
  }

  var runBaseDetection = function() {};

  window.setDetectionFinishedMessage = function() {};
  window.updateSummary = function() {};
  window.updateDetectionResult = function() {};
  window.showNoProblemResult = function() {};
  window.restoreAnnotationCheck = function() {};

  // TODO: break the huge anonymous function into pieces
  chrome.tabs.getSelected(null, function(tab) {
    // Get current tab's id, many functions need it.
    var tabId = tab.id;

    // Advanced detection.
    window.advancedDetection = function() {
      var detectionResult = getDetectionResult(tabId);
      // If detection finished, then show result from cache.
      if (detectionResult.detected) {
        var problems = detectionResult.problems;
        if (Object.keys(problems).length == 0) {
          showNoProblemResult();
        } else {
          for (var typeId in problems) {
            var problem = problems[typeId];
            updateDetectionResult(tabId, typeId, problem);
            updateSummary(problem.severity);
          }
          setDetectionFinishedMessage();
          restoreAnnotationCheck();
        }
      } else {
        detectProblems();
      }
    }

    window.setDetectionFinishedMessage = function() {
      var detectionStatus = $('detectionStatus');
      detectionStatus.innerHTML = chrome.i18n.getMessage('detectionFinished');
    }

    /**
     * function updateSummary
     * @param {error | warning} type
     */
    window.updateSummary = function(type) {
      var detectionResult = getDetectionResult(tabId);
      var number = (type == 'warning')? 'totalWarnings' : 'totalErrors';
      var summary = chrome.i18n.getMessage(type + 'ProblemsSummary',
          [detectionResult[number]]);
      var allProblemsSummary = chrome.i18n.getMessage('allProblemsSummary',
          [detectionResult.totalProblems]);
      $(type + 'ProblemsSummary').innerHTML = summary;
      $('allProblemsSummary').innerHTML = allProblemsSummary;
    }

    window.updateDetectionResult = function(senderTabId, typeId, problem) {
      if (tabId != senderTabId)
        return;

      var detectionResult = getDetectionResult(tabId);
      var occurrencesNumber = problem.occurrencesNumber;

      var severity = problem.severity;
      $content.className = '';
      $('detectionResult').style.display = 'block';
      $(severity + 'Area').style.display = 'block';
      var table = $(severity + 'Problems').firstElementChild;
      var problemRow = $(typeId);
      if (problemRow) {
        problemRow.cells[2].innerText = occurrencesNumber;
      } else {
        var row = document.createElement('tr');
        row.setAttribute('id', typeId);
        table.appendChild(row);
        insertCell(row, problem.occurrencesNumber);
        insertCell(row, problem.description);
        var checkbox = insertCell(row, '<input type="checkbox" name="' +
            severity + '" class="issue">').firstElementChild;
        checkbox.addEventListener('click', toggleCheckProblem, false);
      }

      function insertCell(row, html) {
        var cell = row.insertCell(0);
        cell.innerHTML = html;
        return cell;
      }
    }

    window.showNoProblemResult = function() {
      $content.className = '';
      $('noProblemFoundInfo').style.display = 'block';
    }

    window.restoreAnnotationCheck = function() {
      var detectionResult = getDetectionResult(tabId);
      var annotatedReasons = detectionResult.annotatedReasons;
      Object.keys(annotatedReasons).forEach(function(reason) {
        $(reason).firstElementChild.firstElementChild.checked = true;
      });
      restoreCheckAll(document.getElementsByName('warning'), 'warning');
      restoreCheckAll(document.getElementsByName('error'), 'error');

      function restoreCheckAll(checkboxes, type) {
        for (var i = 0, length = checkboxes.length; i < length; ++i) {
          if (!checkboxes[i].checked)
            return;
        }
        $(type + 'CheckAll').checked = true;
      }
    }

    // use local variable: tabId
    runBaseDetection = function () {
      log('runBaseDetection begin');
      // TODO: check DetectionResult.baseResultHTML first
      chrome.tabs.sendRequest(tabId, {type: 'runBaseDetection'},
          showBaseDetectionResult);
    };

    var detectionResult = getDetectionResult(tabId);
    if (detectionResult.showAdvanced) {
      setStatus(STATUS_ADVANCED);
      advancedDetection();
    } else {
      setStatus(STATUS_BASE);
      runBaseDetection();
    }

    // Change the tab panel.
    log('$tab.addEventListener click');
    $tab.addEventListener('click', function(event) {
      var currentDetecionType = $body.className;
      var status = event.target.className;
      log('$tab click fired, status=' + status);
      if (status && currentDetecionType != status) {
        // TODO: modify this
        var detectionResult = getDetectionResult(tabId);
        detectionResult.showAdvanced = (status == 'advanced');
        if (detectionResult.showAdvanced) {
          setStatus(STATUS_ADVANCED);
          advancedDetection();
        } else {
          setStatus(STATUS_BASE);
          runBaseDetection();
        }
      }
    });

    function getDetectionResult(tabId) {
      return backgroundPage.getDetectionResult(tabId);
    }
    function detectProblems() {
      chrome.tabs.sendRequest(tabId, {type: 'DetectProblems'});
    }

    /**
     * Update annotation status
     * @param {Array} checkboxes
     */
    function updateAnnotatedStatus(checkboxes) {
      var detectionResult = getDetectionResult(tabId);
      var annotatedReasons = detectionResult.annotatedReasons;
      checkboxes.forEach(function(checkbox) {
        var reason = checkbox.parentNode.parentNode.id;
        if (annotatedReasons[reason] && !checkbox.checked)
          delete annotatedReasons[reason];
        else if (!annotatedReasons[reason] && checkbox.checked)
          annotatedReasons[reason] = true;
      });
      return Object.keys(annotatedReasons);
    }

    /**
     * Handle one checkbox click event.
     */
    function toggleCheckProblem() {
      var annotatedReasons = updateAnnotatedStatus([this]);
      backgroundPage.annotate(annotatedReasons);
      updateCheckAllStatus(this);
    }

    /**
     * Handle check all or check no checkbox click event.
     * @param {Element} checkAll
     * @param {String} type
     */
    function toggleCheckAllProblems(checkAll, type) {
      var checkboxes =
          Array.prototype.slice.call(document.getElementsByName(type));
      var checked = checkAll.checked;
      checkboxes.forEach(function(checkbox) {
        checkbox.checked = checked;
      });
      var problems = updateAnnotatedStatus(checkboxes);
      backgroundPage.annotate(problems);
    }

    function updateCheckAllStatus(checkbox) {
      var checkAll = $(checkbox.name + 'CheckAll');
      if (checkbox.checked) {
        var checkboxes = document.getElementsByName(checkbox.name);
        for (var i = 0, length = checkboxes.length; i < length; ++i) {
          if (!checkboxes[i].checked) {
            return;
          }
        }
        checkAll.checked = true;
      } else {
        checkAll.checked = false;
      }
    }

    $('errorCheckAll').addEventListener('click', function() {
      toggleCheckAllProblems(this, 'error');
    }, false);

    $('warningCheckAll').addEventListener('click', function() {
      toggleCheckAllProblems(this, 'warning');
    }, false);

  });
}, false);
