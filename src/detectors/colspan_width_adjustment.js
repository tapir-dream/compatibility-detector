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

chrome_comp.CompDetect.declareDetector(

'colspan_width_adjustment',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName == 'TABLE') {
    var columnHasWidth = [];
    var columnSpans = [];
    // Span cells with specified width
    var spans = [];
    var rows = node.rows;
    for (var i = 0; i < rows.length; ++i) {
      var cells = rows[i].cells;
      for (var j = 0; j < cells.length; ++j) {
        var width =
            chrome_comp.getDefinedStylePropertyByName(cells[j], false, 'width');
        if (parseInt(width, 10) > 0) {
          var span = cells[j].colSpan;
          if (span > 1) {
            // Check whether there is already a cell with same span range
            var t = 0;
            for (; t < spans.length; ++t) {
              if (spans[t][0] == j && spans[t][1] == span)
                break;
            }
            // Duplicate span range
            if (t != spans.length) {
              // Row i has the same span range with previous one
              spans[t].push(i);
              continue;
            }
            spans.push([j, span, i]);
            var spanID = spans.length - 1;
            for (var k = j; k < j + span; ++k) {
              if (!columnSpans[k])
                columnSpans[k] = [spanID];
              else
                columnSpans[k].push(spanID);
            }
          } else {
            if (columnHasWidth[j])
              columnHasWidth[j].push(i);
            else
              columnHasWidth[j] = [i];
          }
        }
      }
    }
    // Check each span
    for (var i = 0, l = spans.length; i < l; ++i) {
      var span = spans[i];
      var hasWidthColumn = false;
      var hasAutoColumn = false;
      var autoColumnWidth = 0;
      var autoColumn;
      var nodes = [];
      for (var j = span[0]; j < span[1]; ++j) {
        // If a span cell overlaps with any other span, ignore checking for it.
        if (columnSpans[j].length > 1)
          continue;
        if (columnHasWidth[j]) {
          hasWidthColumn = true;
          for (var r = 0; r < columnHasWidth[j].length; ++r)
            nodes.push(rows[columnHasWidth[j][r]].cells[j]);
        } else {
          hasAutoColumn = true;
          autoColumnWidth = rows[0].cells[j].clientWidth;
          autoColumn = j;
        }
      }
      if (hasWidthColumn && hasAutoColumn) {
        var spanCells = [];
        for (var r = 2; r < span.length; ++r)
         spanCells.push(rows[span[r]].cells[span[0]]);
        var oldWidths = [];
        for (var k = 0; k < spanCells.length; ++k) {
          if (spanCells[k].width > 0) {
            oldWidths[k] = spanCells[k].width;
            spanCells[k].width = '0';
          } else {
            oldWidths[k] = spanCells[k].style.width;
            spanCells[k].style.width = '0';
          }
        }

        // Check whether the width of an auto column being spanned has been
        // changed
        if (autoColumnWidth != rows[0].cells[autoColumn].clientWidth)
          this.addProblem('HE1001', nodes);

        for (var k = 0; k < spanCells.length; ++k) {
          if (spanCells[k].width > 0)
            spanCells[k].width = oldWidths[k];
          else
            spanCells[k].style.width = oldWidths[k];
        }
      }
    }
  }
}
); // declareDetector

});
