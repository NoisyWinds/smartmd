/*!
 * Smartmd.js v1.0.0
 * (c) 2018-2019 NoisyWinds
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Smartmd = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  function getCjsExportFromNamespace (n) {
  	return n && n.default || n;
  }

  var codemirror = createCommonjsModule(function (module, exports) {
  // CodeMirror, copyright (c) by Marijn Haverbeke and others
  // Distributed under an MIT license: https://codemirror.net/LICENSE

  // This is CodeMirror (https://codemirror.net), a code editor
  // implemented in JavaScript on top of the browser's DOM.
  //
  // You can find some technical background for some of the code below
  // at http://marijnhaverbeke.nl/blog/#cm-internals .

  (function (global, factory) {
    module.exports = factory();
  }(commonjsGlobal, (function () {
    // Kludges for bugs and behavior differences that can't be feature
    // detected are enabled based on userAgent etc sniffing.
    var userAgent = navigator.userAgent;
    var platform = navigator.platform;

    var gecko = /gecko\/\d/i.test(userAgent);
    var ie_upto10 = /MSIE \d/.test(userAgent);
    var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(userAgent);
    var edge = /Edge\/(\d+)/.exec(userAgent);
    var ie = ie_upto10 || ie_11up || edge;
    var ie_version = ie && (ie_upto10 ? document.documentMode || 6 : +(edge || ie_11up)[1]);
    var webkit = !edge && /WebKit\//.test(userAgent);
    var qtwebkit = webkit && /Qt\/\d+\.\d+/.test(userAgent);
    var chrome = !edge && /Chrome\//.test(userAgent);
    var presto = /Opera\//.test(userAgent);
    var safari = /Apple Computer/.test(navigator.vendor);
    var mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(userAgent);
    var phantom = /PhantomJS/.test(userAgent);

    var ios = !edge && /AppleWebKit/.test(userAgent) && /Mobile\/\w+/.test(userAgent);
    var android = /Android/.test(userAgent);
    // This is woefully incomplete. Suggestions for alternative methods welcome.
    var mobile = ios || android || /webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(userAgent);
    var mac = ios || /Mac/.test(platform);
    var chromeOS = /\bCrOS\b/.test(userAgent);
    var windows = /win/i.test(platform);

    var presto_version = presto && userAgent.match(/Version\/(\d*\.\d*)/);
    if (presto_version) { presto_version = Number(presto_version[1]); }
    if (presto_version && presto_version >= 15) { presto = false; webkit = true; }
    // Some browsers use the wrong event properties to signal cmd/ctrl on OS X
    var flipCtrlCmd = mac && (qtwebkit || presto && (presto_version == null || presto_version < 12.11));
    var captureRightClick = gecko || (ie && ie_version >= 9);

    function classTest(cls) { return new RegExp("(^|\\s)" + cls + "(?:$|\\s)\\s*") }

    var rmClass = function(node, cls) {
      var current = node.className;
      var match = classTest(cls).exec(current);
      if (match) {
        var after = current.slice(match.index + match[0].length);
        node.className = current.slice(0, match.index) + (after ? match[1] + after : "");
      }
    };

    function removeChildren(e) {
      for (var count = e.childNodes.length; count > 0; --count)
        { e.removeChild(e.firstChild); }
      return e
    }

    function removeChildrenAndAdd(parent, e) {
      return removeChildren(parent).appendChild(e)
    }

    function elt(tag, content, className, style) {
      var e = document.createElement(tag);
      if (className) { e.className = className; }
      if (style) { e.style.cssText = style; }
      if (typeof content == "string") { e.appendChild(document.createTextNode(content)); }
      else if (content) { for (var i = 0; i < content.length; ++i) { e.appendChild(content[i]); } }
      return e
    }
    // wrapper for elt, which removes the elt from the accessibility tree
    function eltP(tag, content, className, style) {
      var e = elt(tag, content, className, style);
      e.setAttribute("role", "presentation");
      return e
    }

    var range;
    if (document.createRange) { range = function(node, start, end, endNode) {
      var r = document.createRange();
      r.setEnd(endNode || node, end);
      r.setStart(node, start);
      return r
    }; }
    else { range = function(node, start, end) {
      var r = document.body.createTextRange();
      try { r.moveToElementText(node.parentNode); }
      catch(e) { return r }
      r.collapse(true);
      r.moveEnd("character", end);
      r.moveStart("character", start);
      return r
    }; }

    function contains(parent, child) {
      if (child.nodeType == 3) // Android browser always returns false when child is a textnode
        { child = child.parentNode; }
      if (parent.contains)
        { return parent.contains(child) }
      do {
        if (child.nodeType == 11) { child = child.host; }
        if (child == parent) { return true }
      } while (child = child.parentNode)
    }

    function activeElt() {
      // IE and Edge may throw an "Unspecified Error" when accessing document.activeElement.
      // IE < 10 will throw when accessed while the page is loading or in an iframe.
      // IE > 9 and Edge will throw when accessed in an iframe if document.body is unavailable.
      var activeElement;
      try {
        activeElement = document.activeElement;
      } catch(e) {
        activeElement = document.body || null;
      }
      while (activeElement && activeElement.shadowRoot && activeElement.shadowRoot.activeElement)
        { activeElement = activeElement.shadowRoot.activeElement; }
      return activeElement
    }

    function addClass(node, cls) {
      var current = node.className;
      if (!classTest(cls).test(current)) { node.className += (current ? " " : "") + cls; }
    }
    function joinClasses(a, b) {
      var as = a.split(" ");
      for (var i = 0; i < as.length; i++)
        { if (as[i] && !classTest(as[i]).test(b)) { b += " " + as[i]; } }
      return b
    }

    var selectInput = function(node) { node.select(); };
    if (ios) // Mobile Safari apparently has a bug where select() is broken.
      { selectInput = function(node) { node.selectionStart = 0; node.selectionEnd = node.value.length; }; }
    else if (ie) // Suppress mysterious IE10 errors
      { selectInput = function(node) { try { node.select(); } catch(_e) {} }; }

    function bind(f) {
      var args = Array.prototype.slice.call(arguments, 1);
      return function(){return f.apply(null, args)}
    }

    function copyObj(obj, target, overwrite) {
      if (!target) { target = {}; }
      for (var prop in obj)
        { if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop)))
          { target[prop] = obj[prop]; } }
      return target
    }

    // Counts the column offset in a string, taking tabs into account.
    // Used mostly to find indentation.
    function countColumn(string, end, tabSize, startIndex, startValue) {
      if (end == null) {
        end = string.search(/[^\s\u00a0]/);
        if (end == -1) { end = string.length; }
      }
      for (var i = startIndex || 0, n = startValue || 0;;) {
        var nextTab = string.indexOf("\t", i);
        if (nextTab < 0 || nextTab >= end)
          { return n + (end - i) }
        n += nextTab - i;
        n += tabSize - (n % tabSize);
        i = nextTab + 1;
      }
    }

    var Delayed = function() {this.id = null;};
    Delayed.prototype.set = function (ms, f) {
      clearTimeout(this.id);
      this.id = setTimeout(f, ms);
    };

    function indexOf(array, elt) {
      for (var i = 0; i < array.length; ++i)
        { if (array[i] == elt) { return i } }
      return -1
    }

    // Number of pixels added to scroller and sizer to hide scrollbar
    var scrollerGap = 30;

    // Returned or thrown by various protocols to signal 'I'm not
    // handling this'.
    var Pass = {toString: function(){return "CodeMirror.Pass"}};

    // Reused option objects for setSelection & friends
    var sel_dontScroll = {scroll: false}, sel_mouse = {origin: "*mouse"}, sel_move = {origin: "+move"};

    // The inverse of countColumn -- find the offset that corresponds to
    // a particular column.
    function findColumn(string, goal, tabSize) {
      for (var pos = 0, col = 0;;) {
        var nextTab = string.indexOf("\t", pos);
        if (nextTab == -1) { nextTab = string.length; }
        var skipped = nextTab - pos;
        if (nextTab == string.length || col + skipped >= goal)
          { return pos + Math.min(skipped, goal - col) }
        col += nextTab - pos;
        col += tabSize - (col % tabSize);
        pos = nextTab + 1;
        if (col >= goal) { return pos }
      }
    }

    var spaceStrs = [""];
    function spaceStr(n) {
      while (spaceStrs.length <= n)
        { spaceStrs.push(lst(spaceStrs) + " "); }
      return spaceStrs[n]
    }

    function lst(arr) { return arr[arr.length-1] }

    function map(array, f) {
      var out = [];
      for (var i = 0; i < array.length; i++) { out[i] = f(array[i], i); }
      return out
    }

    function insertSorted(array, value, score) {
      var pos = 0, priority = score(value);
      while (pos < array.length && score(array[pos]) <= priority) { pos++; }
      array.splice(pos, 0, value);
    }

    function nothing() {}

    function createObj(base, props) {
      var inst;
      if (Object.create) {
        inst = Object.create(base);
      } else {
        nothing.prototype = base;
        inst = new nothing();
      }
      if (props) { copyObj(props, inst); }
      return inst
    }

    var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
    function isWordCharBasic(ch) {
      return /\w/.test(ch) || ch > "\x80" &&
        (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch))
    }
    function isWordChar(ch, helper) {
      if (!helper) { return isWordCharBasic(ch) }
      if (helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch)) { return true }
      return helper.test(ch)
    }

    function isEmpty(obj) {
      for (var n in obj) { if (obj.hasOwnProperty(n) && obj[n]) { return false } }
      return true
    }

    // Extending unicode characters. A series of a non-extending char +
    // any number of extending chars is treated as a single unit as far
    // as editing and measuring is concerned. This is not fully correct,
    // since some scripts/fonts/browsers also treat other configurations
    // of code points as a group.
    var extendingChars = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;
    function isExtendingChar(ch) { return ch.charCodeAt(0) >= 768 && extendingChars.test(ch) }

    // Returns a number from the range [`0`; `str.length`] unless `pos` is outside that range.
    function skipExtendingChars(str, pos, dir) {
      while ((dir < 0 ? pos > 0 : pos < str.length) && isExtendingChar(str.charAt(pos))) { pos += dir; }
      return pos
    }

    // Returns the value from the range [`from`; `to`] that satisfies
    // `pred` and is closest to `from`. Assumes that at least `to`
    // satisfies `pred`. Supports `from` being greater than `to`.
    function findFirst(pred, from, to) {
      // At any point we are certain `to` satisfies `pred`, don't know
      // whether `from` does.
      var dir = from > to ? -1 : 1;
      for (;;) {
        if (from == to) { return from }
        var midF = (from + to) / 2, mid = dir < 0 ? Math.ceil(midF) : Math.floor(midF);
        if (mid == from) { return pred(mid) ? from : to }
        if (pred(mid)) { to = mid; }
        else { from = mid + dir; }
      }
    }

    // The display handles the DOM integration, both for input reading
    // and content drawing. It holds references to DOM nodes and
    // display-related state.

    function Display(place, doc, input) {
      var d = this;
      this.input = input;

      // Covers bottom-right square when both scrollbars are present.
      d.scrollbarFiller = elt("div", null, "CodeMirror-scrollbar-filler");
      d.scrollbarFiller.setAttribute("cm-not-content", "true");
      // Covers bottom of gutter when coverGutterNextToScrollbar is on
      // and h scrollbar is present.
      d.gutterFiller = elt("div", null, "CodeMirror-gutter-filler");
      d.gutterFiller.setAttribute("cm-not-content", "true");
      // Will contain the actual code, positioned to cover the viewport.
      d.lineDiv = eltP("div", null, "CodeMirror-code");
      // Elements are added to these to represent selection and cursors.
      d.selectionDiv = elt("div", null, null, "position: relative; z-index: 1");
      d.cursorDiv = elt("div", null, "CodeMirror-cursors");
      // A visibility: hidden element used to find the size of things.
      d.measure = elt("div", null, "CodeMirror-measure");
      // When lines outside of the viewport are measured, they are drawn in this.
      d.lineMeasure = elt("div", null, "CodeMirror-measure");
      // Wraps everything that needs to exist inside the vertically-padded coordinate system
      d.lineSpace = eltP("div", [d.measure, d.lineMeasure, d.selectionDiv, d.cursorDiv, d.lineDiv],
                        null, "position: relative; outline: none");
      var lines = eltP("div", [d.lineSpace], "CodeMirror-lines");
      // Moved around its parent to cover visible view.
      d.mover = elt("div", [lines], null, "position: relative");
      // Set to the height of the document, allowing scrolling.
      d.sizer = elt("div", [d.mover], "CodeMirror-sizer");
      d.sizerWidth = null;
      // Behavior of elts with overflow: auto and padding is
      // inconsistent across browsers. This is used to ensure the
      // scrollable area is big enough.
      d.heightForcer = elt("div", null, null, "position: absolute; height: " + scrollerGap + "px; width: 1px;");
      // Will contain the gutters, if any.
      d.gutters = elt("div", null, "CodeMirror-gutters");
      d.lineGutter = null;
      // Actual scrollable element.
      d.scroller = elt("div", [d.sizer, d.heightForcer, d.gutters], "CodeMirror-scroll");
      d.scroller.setAttribute("tabIndex", "-1");
      // The element in which the editor lives.
      d.wrapper = elt("div", [d.scrollbarFiller, d.gutterFiller, d.scroller], "CodeMirror");

      // Work around IE7 z-index bug (not perfect, hence IE7 not really being supported)
      if (ie && ie_version < 8) { d.gutters.style.zIndex = -1; d.scroller.style.paddingRight = 0; }
      if (!webkit && !(gecko && mobile)) { d.scroller.draggable = true; }

      if (place) {
        if (place.appendChild) { place.appendChild(d.wrapper); }
        else { place(d.wrapper); }
      }

      // Current rendered range (may be bigger than the view window).
      d.viewFrom = d.viewTo = doc.first;
      d.reportedViewFrom = d.reportedViewTo = doc.first;
      // Information about the rendered lines.
      d.view = [];
      d.renderedView = null;
      // Holds info about a single rendered line when it was rendered
      // for measurement, while not in view.
      d.externalMeasured = null;
      // Empty space (in pixels) above the view
      d.viewOffset = 0;
      d.lastWrapHeight = d.lastWrapWidth = 0;
      d.updateLineNumbers = null;

      d.nativeBarWidth = d.barHeight = d.barWidth = 0;
      d.scrollbarsClipped = false;

      // Used to only resize the line number gutter when necessary (when
      // the amount of lines crosses a boundary that makes its width change)
      d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null;
      // Set to true when a non-horizontal-scrolling line widget is
      // added. As an optimization, line widget aligning is skipped when
      // this is false.
      d.alignWidgets = false;

      d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;

      // Tracks the maximum line length so that the horizontal scrollbar
      // can be kept static when scrolling.
      d.maxLine = null;
      d.maxLineLength = 0;
      d.maxLineChanged = false;

      // Used for measuring wheel scrolling granularity
      d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null;

      // True when shift is held down.
      d.shift = false;

      // Used to track whether anything happened since the context menu
      // was opened.
      d.selForContextMenu = null;

      d.activeTouch = null;

      input.init(d);
    }

    // Find the line object corresponding to the given line number.
    function getLine(doc, n) {
      n -= doc.first;
      if (n < 0 || n >= doc.size) { throw new Error("There is no line " + (n + doc.first) + " in the document.") }
      var chunk = doc;
      while (!chunk.lines) {
        for (var i = 0;; ++i) {
          var child = chunk.children[i], sz = child.chunkSize();
          if (n < sz) { chunk = child; break }
          n -= sz;
        }
      }
      return chunk.lines[n]
    }

    // Get the part of a document between two positions, as an array of
    // strings.
    function getBetween(doc, start, end) {
      var out = [], n = start.line;
      doc.iter(start.line, end.line + 1, function (line) {
        var text = line.text;
        if (n == end.line) { text = text.slice(0, end.ch); }
        if (n == start.line) { text = text.slice(start.ch); }
        out.push(text);
        ++n;
      });
      return out
    }
    // Get the lines between from and to, as array of strings.
    function getLines(doc, from, to) {
      var out = [];
      doc.iter(from, to, function (line) { out.push(line.text); }); // iter aborts when callback returns truthy value
      return out
    }

    // Update the height of a line, propagating the height change
    // upwards to parent nodes.
    function updateLineHeight(line, height) {
      var diff = height - line.height;
      if (diff) { for (var n = line; n; n = n.parent) { n.height += diff; } }
    }

    // Given a line object, find its line number by walking up through
    // its parent links.
    function lineNo(line) {
      if (line.parent == null) { return null }
      var cur = line.parent, no = indexOf(cur.lines, line);
      for (var chunk = cur.parent; chunk; cur = chunk, chunk = chunk.parent) {
        for (var i = 0;; ++i) {
          if (chunk.children[i] == cur) { break }
          no += chunk.children[i].chunkSize();
        }
      }
      return no + cur.first
    }

    // Find the line at the given vertical position, using the height
    // information in the document tree.
    function lineAtHeight(chunk, h) {
      var n = chunk.first;
      outer: do {
        for (var i$1 = 0; i$1 < chunk.children.length; ++i$1) {
          var child = chunk.children[i$1], ch = child.height;
          if (h < ch) { chunk = child; continue outer }
          h -= ch;
          n += child.chunkSize();
        }
        return n
      } while (!chunk.lines)
      var i = 0;
      for (; i < chunk.lines.length; ++i) {
        var line = chunk.lines[i], lh = line.height;
        if (h < lh) { break }
        h -= lh;
      }
      return n + i
    }

    function isLine(doc, l) {return l >= doc.first && l < doc.first + doc.size}

    function lineNumberFor(options, i) {
      return String(options.lineNumberFormatter(i + options.firstLineNumber))
    }

    // A Pos instance represents a position within the text.
    function Pos(line, ch, sticky) {
      if ( sticky === void 0 ) sticky = null;

      if (!(this instanceof Pos)) { return new Pos(line, ch, sticky) }
      this.line = line;
      this.ch = ch;
      this.sticky = sticky;
    }

    // Compare two positions, return 0 if they are the same, a negative
    // number when a is less, and a positive number otherwise.
    function cmp(a, b) { return a.line - b.line || a.ch - b.ch }

    function equalCursorPos(a, b) { return a.sticky == b.sticky && cmp(a, b) == 0 }

    function copyPos(x) {return Pos(x.line, x.ch)}
    function maxPos(a, b) { return cmp(a, b) < 0 ? b : a }
    function minPos(a, b) { return cmp(a, b) < 0 ? a : b }

    // Most of the external API clips given positions to make sure they
    // actually exist within the document.
    function clipLine(doc, n) {return Math.max(doc.first, Math.min(n, doc.first + doc.size - 1))}
    function clipPos(doc, pos) {
      if (pos.line < doc.first) { return Pos(doc.first, 0) }
      var last = doc.first + doc.size - 1;
      if (pos.line > last) { return Pos(last, getLine(doc, last).text.length) }
      return clipToLen(pos, getLine(doc, pos.line).text.length)
    }
    function clipToLen(pos, linelen) {
      var ch = pos.ch;
      if (ch == null || ch > linelen) { return Pos(pos.line, linelen) }
      else if (ch < 0) { return Pos(pos.line, 0) }
      else { return pos }
    }
    function clipPosArray(doc, array) {
      var out = [];
      for (var i = 0; i < array.length; i++) { out[i] = clipPos(doc, array[i]); }
      return out
    }

    // Optimize some code when these features are not used.
    var sawReadOnlySpans = false, sawCollapsedSpans = false;

    function seeReadOnlySpans() {
      sawReadOnlySpans = true;
    }

    function seeCollapsedSpans() {
      sawCollapsedSpans = true;
    }

    // TEXTMARKER SPANS

    function MarkedSpan(marker, from, to) {
      this.marker = marker;
      this.from = from; this.to = to;
    }

    // Search an array of spans for a span matching the given marker.
    function getMarkedSpanFor(spans, marker) {
      if (spans) { for (var i = 0; i < spans.length; ++i) {
        var span = spans[i];
        if (span.marker == marker) { return span }
      } }
    }
    // Remove a span from an array, returning undefined if no spans are
    // left (we don't store arrays for lines without spans).
    function removeMarkedSpan(spans, span) {
      var r;
      for (var i = 0; i < spans.length; ++i)
        { if (spans[i] != span) { (r || (r = [])).push(spans[i]); } }
      return r
    }
    // Add a span to a line.
    function addMarkedSpan(line, span) {
      line.markedSpans = line.markedSpans ? line.markedSpans.concat([span]) : [span];
      span.marker.attachLine(line);
    }

    // Used for the algorithm that adjusts markers for a change in the
    // document. These functions cut an array of spans at a given
    // character position, returning an array of remaining chunks (or
    // undefined if nothing remains).
    function markedSpansBefore(old, startCh, isInsert) {
      var nw;
      if (old) { for (var i = 0; i < old.length; ++i) {
        var span = old[i], marker = span.marker;
        var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh);
        if (startsBefore || span.from == startCh && marker.type == "bookmark" && (!isInsert || !span.marker.insertLeft)) {
          var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh)
          ;(nw || (nw = [])).push(new MarkedSpan(marker, span.from, endsAfter ? null : span.to));
        }
      } }
      return nw
    }
    function markedSpansAfter(old, endCh, isInsert) {
      var nw;
      if (old) { for (var i = 0; i < old.length; ++i) {
        var span = old[i], marker = span.marker;
        var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh);
        if (endsAfter || span.from == endCh && marker.type == "bookmark" && (!isInsert || span.marker.insertLeft)) {
          var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh)
          ;(nw || (nw = [])).push(new MarkedSpan(marker, startsBefore ? null : span.from - endCh,
                                                span.to == null ? null : span.to - endCh));
        }
      } }
      return nw
    }

    // Given a change object, compute the new set of marker spans that
    // cover the line in which the change took place. Removes spans
    // entirely within the change, reconnects spans belonging to the
    // same marker that appear on both sides of the change, and cuts off
    // spans partially within the change. Returns an array of span
    // arrays with one element for each line in (after) the change.
    function stretchSpansOverChange(doc, change) {
      if (change.full) { return null }
      var oldFirst = isLine(doc, change.from.line) && getLine(doc, change.from.line).markedSpans;
      var oldLast = isLine(doc, change.to.line) && getLine(doc, change.to.line).markedSpans;
      if (!oldFirst && !oldLast) { return null }

      var startCh = change.from.ch, endCh = change.to.ch, isInsert = cmp(change.from, change.to) == 0;
      // Get the spans that 'stick out' on both sides
      var first = markedSpansBefore(oldFirst, startCh, isInsert);
      var last = markedSpansAfter(oldLast, endCh, isInsert);

      // Next, merge those two ends
      var sameLine = change.text.length == 1, offset = lst(change.text).length + (sameLine ? startCh : 0);
      if (first) {
        // Fix up .to properties of first
        for (var i = 0; i < first.length; ++i) {
          var span = first[i];
          if (span.to == null) {
            var found = getMarkedSpanFor(last, span.marker);
            if (!found) { span.to = startCh; }
            else if (sameLine) { span.to = found.to == null ? null : found.to + offset; }
          }
        }
      }
      if (last) {
        // Fix up .from in last (or move them into first in case of sameLine)
        for (var i$1 = 0; i$1 < last.length; ++i$1) {
          var span$1 = last[i$1];
          if (span$1.to != null) { span$1.to += offset; }
          if (span$1.from == null) {
            var found$1 = getMarkedSpanFor(first, span$1.marker);
            if (!found$1) {
              span$1.from = offset;
              if (sameLine) { (first || (first = [])).push(span$1); }
            }
          } else {
            span$1.from += offset;
            if (sameLine) { (first || (first = [])).push(span$1); }
          }
        }
      }
      // Make sure we didn't create any zero-length spans
      if (first) { first = clearEmptySpans(first); }
      if (last && last != first) { last = clearEmptySpans(last); }

      var newMarkers = [first];
      if (!sameLine) {
        // Fill gap with whole-line-spans
        var gap = change.text.length - 2, gapMarkers;
        if (gap > 0 && first)
          { for (var i$2 = 0; i$2 < first.length; ++i$2)
            { if (first[i$2].to == null)
              { (gapMarkers || (gapMarkers = [])).push(new MarkedSpan(first[i$2].marker, null, null)); } } }
        for (var i$3 = 0; i$3 < gap; ++i$3)
          { newMarkers.push(gapMarkers); }
        newMarkers.push(last);
      }
      return newMarkers
    }

    // Remove spans that are empty and don't have a clearWhenEmpty
    // option of false.
    function clearEmptySpans(spans) {
      for (var i = 0; i < spans.length; ++i) {
        var span = spans[i];
        if (span.from != null && span.from == span.to && span.marker.clearWhenEmpty !== false)
          { spans.splice(i--, 1); }
      }
      if (!spans.length) { return null }
      return spans
    }

    // Used to 'clip' out readOnly ranges when making a change.
    function removeReadOnlyRanges(doc, from, to) {
      var markers = null;
      doc.iter(from.line, to.line + 1, function (line) {
        if (line.markedSpans) { for (var i = 0; i < line.markedSpans.length; ++i) {
          var mark = line.markedSpans[i].marker;
          if (mark.readOnly && (!markers || indexOf(markers, mark) == -1))
            { (markers || (markers = [])).push(mark); }
        } }
      });
      if (!markers) { return null }
      var parts = [{from: from, to: to}];
      for (var i = 0; i < markers.length; ++i) {
        var mk = markers[i], m = mk.find(0);
        for (var j = 0; j < parts.length; ++j) {
          var p = parts[j];
          if (cmp(p.to, m.from) < 0 || cmp(p.from, m.to) > 0) { continue }
          var newParts = [j, 1], dfrom = cmp(p.from, m.from), dto = cmp(p.to, m.to);
          if (dfrom < 0 || !mk.inclusiveLeft && !dfrom)
            { newParts.push({from: p.from, to: m.from}); }
          if (dto > 0 || !mk.inclusiveRight && !dto)
            { newParts.push({from: m.to, to: p.to}); }
          parts.splice.apply(parts, newParts);
          j += newParts.length - 3;
        }
      }
      return parts
    }

    // Connect or disconnect spans from a line.
    function detachMarkedSpans(line) {
      var spans = line.markedSpans;
      if (!spans) { return }
      for (var i = 0; i < spans.length; ++i)
        { spans[i].marker.detachLine(line); }
      line.markedSpans = null;
    }
    function attachMarkedSpans(line, spans) {
      if (!spans) { return }
      for (var i = 0; i < spans.length; ++i)
        { spans[i].marker.attachLine(line); }
      line.markedSpans = spans;
    }

    // Helpers used when computing which overlapping collapsed span
    // counts as the larger one.
    function extraLeft(marker) { return marker.inclusiveLeft ? -1 : 0 }
    function extraRight(marker) { return marker.inclusiveRight ? 1 : 0 }

    // Returns a number indicating which of two overlapping collapsed
    // spans is larger (and thus includes the other). Falls back to
    // comparing ids when the spans cover exactly the same range.
    function compareCollapsedMarkers(a, b) {
      var lenDiff = a.lines.length - b.lines.length;
      if (lenDiff != 0) { return lenDiff }
      var aPos = a.find(), bPos = b.find();
      var fromCmp = cmp(aPos.from, bPos.from) || extraLeft(a) - extraLeft(b);
      if (fromCmp) { return -fromCmp }
      var toCmp = cmp(aPos.to, bPos.to) || extraRight(a) - extraRight(b);
      if (toCmp) { return toCmp }
      return b.id - a.id
    }

    // Find out whether a line ends or starts in a collapsed span. If
    // so, return the marker for that span.
    function collapsedSpanAtSide(line, start) {
      var sps = sawCollapsedSpans && line.markedSpans, found;
      if (sps) { for (var sp = (void 0), i = 0; i < sps.length; ++i) {
        sp = sps[i];
        if (sp.marker.collapsed && (start ? sp.from : sp.to) == null &&
            (!found || compareCollapsedMarkers(found, sp.marker) < 0))
          { found = sp.marker; }
      } }
      return found
    }
    function collapsedSpanAtStart(line) { return collapsedSpanAtSide(line, true) }
    function collapsedSpanAtEnd(line) { return collapsedSpanAtSide(line, false) }

    function collapsedSpanAround(line, ch) {
      var sps = sawCollapsedSpans && line.markedSpans, found;
      if (sps) { for (var i = 0; i < sps.length; ++i) {
        var sp = sps[i];
        if (sp.marker.collapsed && (sp.from == null || sp.from < ch) && (sp.to == null || sp.to > ch) &&
            (!found || compareCollapsedMarkers(found, sp.marker) < 0)) { found = sp.marker; }
      } }
      return found
    }

    // Test whether there exists a collapsed span that partially
    // overlaps (covers the start or end, but not both) of a new span.
    // Such overlap is not allowed.
    function conflictingCollapsedRange(doc, lineNo$$1, from, to, marker) {
      var line = getLine(doc, lineNo$$1);
      var sps = sawCollapsedSpans && line.markedSpans;
      if (sps) { for (var i = 0; i < sps.length; ++i) {
        var sp = sps[i];
        if (!sp.marker.collapsed) { continue }
        var found = sp.marker.find(0);
        var fromCmp = cmp(found.from, from) || extraLeft(sp.marker) - extraLeft(marker);
        var toCmp = cmp(found.to, to) || extraRight(sp.marker) - extraRight(marker);
        if (fromCmp >= 0 && toCmp <= 0 || fromCmp <= 0 && toCmp >= 0) { continue }
        if (fromCmp <= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.to, from) >= 0 : cmp(found.to, from) > 0) ||
            fromCmp >= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.from, to) <= 0 : cmp(found.from, to) < 0))
          { return true }
      } }
    }

    // A visual line is a line as drawn on the screen. Folding, for
    // example, can cause multiple logical lines to appear on the same
    // visual line. This finds the start of the visual line that the
    // given line is part of (usually that is the line itself).
    function visualLine(line) {
      var merged;
      while (merged = collapsedSpanAtStart(line))
        { line = merged.find(-1, true).line; }
      return line
    }

    function visualLineEnd(line) {
      var merged;
      while (merged = collapsedSpanAtEnd(line))
        { line = merged.find(1, true).line; }
      return line
    }

    // Returns an array of logical lines that continue the visual line
    // started by the argument, or undefined if there are no such lines.
    function visualLineContinued(line) {
      var merged, lines;
      while (merged = collapsedSpanAtEnd(line)) {
        line = merged.find(1, true).line
        ;(lines || (lines = [])).push(line);
      }
      return lines
    }

    // Get the line number of the start of the visual line that the
    // given line number is part of.
    function visualLineNo(doc, lineN) {
      var line = getLine(doc, lineN), vis = visualLine(line);
      if (line == vis) { return lineN }
      return lineNo(vis)
    }

    // Get the line number of the start of the next visual line after
    // the given line.
    function visualLineEndNo(doc, lineN) {
      if (lineN > doc.lastLine()) { return lineN }
      var line = getLine(doc, lineN), merged;
      if (!lineIsHidden(doc, line)) { return lineN }
      while (merged = collapsedSpanAtEnd(line))
        { line = merged.find(1, true).line; }
      return lineNo(line) + 1
    }

    // Compute whether a line is hidden. Lines count as hidden when they
    // are part of a visual line that starts with another line, or when
    // they are entirely covered by collapsed, non-widget span.
    function lineIsHidden(doc, line) {
      var sps = sawCollapsedSpans && line.markedSpans;
      if (sps) { for (var sp = (void 0), i = 0; i < sps.length; ++i) {
        sp = sps[i];
        if (!sp.marker.collapsed) { continue }
        if (sp.from == null) { return true }
        if (sp.marker.widgetNode) { continue }
        if (sp.from == 0 && sp.marker.inclusiveLeft && lineIsHiddenInner(doc, line, sp))
          { return true }
      } }
    }
    function lineIsHiddenInner(doc, line, span) {
      if (span.to == null) {
        var end = span.marker.find(1, true);
        return lineIsHiddenInner(doc, end.line, getMarkedSpanFor(end.line.markedSpans, span.marker))
      }
      if (span.marker.inclusiveRight && span.to == line.text.length)
        { return true }
      for (var sp = (void 0), i = 0; i < line.markedSpans.length; ++i) {
        sp = line.markedSpans[i];
        if (sp.marker.collapsed && !sp.marker.widgetNode && sp.from == span.to &&
            (sp.to == null || sp.to != span.from) &&
            (sp.marker.inclusiveLeft || span.marker.inclusiveRight) &&
            lineIsHiddenInner(doc, line, sp)) { return true }
      }
    }

    // Find the height above the given line.
    function heightAtLine(lineObj) {
      lineObj = visualLine(lineObj);

      var h = 0, chunk = lineObj.parent;
      for (var i = 0; i < chunk.lines.length; ++i) {
        var line = chunk.lines[i];
        if (line == lineObj) { break }
        else { h += line.height; }
      }
      for (var p = chunk.parent; p; chunk = p, p = chunk.parent) {
        for (var i$1 = 0; i$1 < p.children.length; ++i$1) {
          var cur = p.children[i$1];
          if (cur == chunk) { break }
          else { h += cur.height; }
        }
      }
      return h
    }

    // Compute the character length of a line, taking into account
    // collapsed ranges (see markText) that might hide parts, and join
    // other lines onto it.
    function lineLength(line) {
      if (line.height == 0) { return 0 }
      var len = line.text.length, merged, cur = line;
      while (merged = collapsedSpanAtStart(cur)) {
        var found = merged.find(0, true);
        cur = found.from.line;
        len += found.from.ch - found.to.ch;
      }
      cur = line;
      while (merged = collapsedSpanAtEnd(cur)) {
        var found$1 = merged.find(0, true);
        len -= cur.text.length - found$1.from.ch;
        cur = found$1.to.line;
        len += cur.text.length - found$1.to.ch;
      }
      return len
    }

    // Find the longest line in the document.
    function findMaxLine(cm) {
      var d = cm.display, doc = cm.doc;
      d.maxLine = getLine(doc, doc.first);
      d.maxLineLength = lineLength(d.maxLine);
      d.maxLineChanged = true;
      doc.iter(function (line) {
        var len = lineLength(line);
        if (len > d.maxLineLength) {
          d.maxLineLength = len;
          d.maxLine = line;
        }
      });
    }

    // BIDI HELPERS

    function iterateBidiSections(order, from, to, f) {
      if (!order) { return f(from, to, "ltr", 0) }
      var found = false;
      for (var i = 0; i < order.length; ++i) {
        var part = order[i];
        if (part.from < to && part.to > from || from == to && part.to == from) {
          f(Math.max(part.from, from), Math.min(part.to, to), part.level == 1 ? "rtl" : "ltr", i);
          found = true;
        }
      }
      if (!found) { f(from, to, "ltr"); }
    }

    var bidiOther = null;
    function getBidiPartAt(order, ch, sticky) {
      var found;
      bidiOther = null;
      for (var i = 0; i < order.length; ++i) {
        var cur = order[i];
        if (cur.from < ch && cur.to > ch) { return i }
        if (cur.to == ch) {
          if (cur.from != cur.to && sticky == "before") { found = i; }
          else { bidiOther = i; }
        }
        if (cur.from == ch) {
          if (cur.from != cur.to && sticky != "before") { found = i; }
          else { bidiOther = i; }
        }
      }
      return found != null ? found : bidiOther
    }

    // Bidirectional ordering algorithm
    // See http://unicode.org/reports/tr9/tr9-13.html for the algorithm
    // that this (partially) implements.

    // One-char codes used for character types:
    // L (L):   Left-to-Right
    // R (R):   Right-to-Left
    // r (AL):  Right-to-Left Arabic
    // 1 (EN):  European Number
    // + (ES):  European Number Separator
    // % (ET):  European Number Terminator
    // n (AN):  Arabic Number
    // , (CS):  Common Number Separator
    // m (NSM): Non-Spacing Mark
    // b (BN):  Boundary Neutral
    // s (B):   Paragraph Separator
    // t (S):   Segment Separator
    // w (WS):  Whitespace
    // N (ON):  Other Neutrals

    // Returns null if characters are ordered as they appear
    // (left-to-right), or an array of sections ({from, to, level}
    // objects) in the order in which they occur visually.
    var bidiOrdering = (function() {
      // Character types for codepoints 0 to 0xff
      var lowTypes = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN";
      // Character types for codepoints 0x600 to 0x6f9
      var arabicTypes = "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111";
      function charType(code) {
        if (code <= 0xf7) { return lowTypes.charAt(code) }
        else if (0x590 <= code && code <= 0x5f4) { return "R" }
        else if (0x600 <= code && code <= 0x6f9) { return arabicTypes.charAt(code - 0x600) }
        else if (0x6ee <= code && code <= 0x8ac) { return "r" }
        else if (0x2000 <= code && code <= 0x200b) { return "w" }
        else if (code == 0x200c) { return "b" }
        else { return "L" }
      }

      var bidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
      var isNeutral = /[stwN]/, isStrong = /[LRr]/, countsAsLeft = /[Lb1n]/, countsAsNum = /[1n]/;

      function BidiSpan(level, from, to) {
        this.level = level;
        this.from = from; this.to = to;
      }

      return function(str, direction) {
        var outerType = direction == "ltr" ? "L" : "R";

        if (str.length == 0 || direction == "ltr" && !bidiRE.test(str)) { return false }
        var len = str.length, types = [];
        for (var i = 0; i < len; ++i)
          { types.push(charType(str.charCodeAt(i))); }

        // W1. Examine each non-spacing mark (NSM) in the level run, and
        // change the type of the NSM to the type of the previous
        // character. If the NSM is at the start of the level run, it will
        // get the type of sor.
        for (var i$1 = 0, prev = outerType; i$1 < len; ++i$1) {
          var type = types[i$1];
          if (type == "m") { types[i$1] = prev; }
          else { prev = type; }
        }

        // W2. Search backwards from each instance of a European number
        // until the first strong type (R, L, AL, or sor) is found. If an
        // AL is found, change the type of the European number to Arabic
        // number.
        // W3. Change all ALs to R.
        for (var i$2 = 0, cur = outerType; i$2 < len; ++i$2) {
          var type$1 = types[i$2];
          if (type$1 == "1" && cur == "r") { types[i$2] = "n"; }
          else if (isStrong.test(type$1)) { cur = type$1; if (type$1 == "r") { types[i$2] = "R"; } }
        }

        // W4. A single European separator between two European numbers
        // changes to a European number. A single common separator between
        // two numbers of the same type changes to that type.
        for (var i$3 = 1, prev$1 = types[0]; i$3 < len - 1; ++i$3) {
          var type$2 = types[i$3];
          if (type$2 == "+" && prev$1 == "1" && types[i$3+1] == "1") { types[i$3] = "1"; }
          else if (type$2 == "," && prev$1 == types[i$3+1] &&
                   (prev$1 == "1" || prev$1 == "n")) { types[i$3] = prev$1; }
          prev$1 = type$2;
        }

        // W5. A sequence of European terminators adjacent to European
        // numbers changes to all European numbers.
        // W6. Otherwise, separators and terminators change to Other
        // Neutral.
        for (var i$4 = 0; i$4 < len; ++i$4) {
          var type$3 = types[i$4];
          if (type$3 == ",") { types[i$4] = "N"; }
          else if (type$3 == "%") {
            var end = (void 0);
            for (end = i$4 + 1; end < len && types[end] == "%"; ++end) {}
            var replace = (i$4 && types[i$4-1] == "!") || (end < len && types[end] == "1") ? "1" : "N";
            for (var j = i$4; j < end; ++j) { types[j] = replace; }
            i$4 = end - 1;
          }
        }

        // W7. Search backwards from each instance of a European number
        // until the first strong type (R, L, or sor) is found. If an L is
        // found, then change the type of the European number to L.
        for (var i$5 = 0, cur$1 = outerType; i$5 < len; ++i$5) {
          var type$4 = types[i$5];
          if (cur$1 == "L" && type$4 == "1") { types[i$5] = "L"; }
          else if (isStrong.test(type$4)) { cur$1 = type$4; }
        }

        // N1. A sequence of neutrals takes the direction of the
        // surrounding strong text if the text on both sides has the same
        // direction. European and Arabic numbers act as if they were R in
        // terms of their influence on neutrals. Start-of-level-run (sor)
        // and end-of-level-run (eor) are used at level run boundaries.
        // N2. Any remaining neutrals take the embedding direction.
        for (var i$6 = 0; i$6 < len; ++i$6) {
          if (isNeutral.test(types[i$6])) {
            var end$1 = (void 0);
            for (end$1 = i$6 + 1; end$1 < len && isNeutral.test(types[end$1]); ++end$1) {}
            var before = (i$6 ? types[i$6-1] : outerType) == "L";
            var after = (end$1 < len ? types[end$1] : outerType) == "L";
            var replace$1 = before == after ? (before ? "L" : "R") : outerType;
            for (var j$1 = i$6; j$1 < end$1; ++j$1) { types[j$1] = replace$1; }
            i$6 = end$1 - 1;
          }
        }

        // Here we depart from the documented algorithm, in order to avoid
        // building up an actual levels array. Since there are only three
        // levels (0, 1, 2) in an implementation that doesn't take
        // explicit embedding into account, we can build up the order on
        // the fly, without following the level-based algorithm.
        var order = [], m;
        for (var i$7 = 0; i$7 < len;) {
          if (countsAsLeft.test(types[i$7])) {
            var start = i$7;
            for (++i$7; i$7 < len && countsAsLeft.test(types[i$7]); ++i$7) {}
            order.push(new BidiSpan(0, start, i$7));
          } else {
            var pos = i$7, at = order.length;
            for (++i$7; i$7 < len && types[i$7] != "L"; ++i$7) {}
            for (var j$2 = pos; j$2 < i$7;) {
              if (countsAsNum.test(types[j$2])) {
                if (pos < j$2) { order.splice(at, 0, new BidiSpan(1, pos, j$2)); }
                var nstart = j$2;
                for (++j$2; j$2 < i$7 && countsAsNum.test(types[j$2]); ++j$2) {}
                order.splice(at, 0, new BidiSpan(2, nstart, j$2));
                pos = j$2;
              } else { ++j$2; }
            }
            if (pos < i$7) { order.splice(at, 0, new BidiSpan(1, pos, i$7)); }
          }
        }
        if (direction == "ltr") {
          if (order[0].level == 1 && (m = str.match(/^\s+/))) {
            order[0].from = m[0].length;
            order.unshift(new BidiSpan(0, 0, m[0].length));
          }
          if (lst(order).level == 1 && (m = str.match(/\s+$/))) {
            lst(order).to -= m[0].length;
            order.push(new BidiSpan(0, len - m[0].length, len));
          }
        }

        return direction == "rtl" ? order.reverse() : order
      }
    })();

    // Get the bidi ordering for the given line (and cache it). Returns
    // false for lines that are fully left-to-right, and an array of
    // BidiSpan objects otherwise.
    function getOrder(line, direction) {
      var order = line.order;
      if (order == null) { order = line.order = bidiOrdering(line.text, direction); }
      return order
    }

    // EVENT HANDLING

    // Lightweight event framework. on/off also work on DOM nodes,
    // registering native DOM handlers.

    var noHandlers = [];

    var on = function(emitter, type, f) {
      if (emitter.addEventListener) {
        emitter.addEventListener(type, f, false);
      } else if (emitter.attachEvent) {
        emitter.attachEvent("on" + type, f);
      } else {
        var map$$1 = emitter._handlers || (emitter._handlers = {});
        map$$1[type] = (map$$1[type] || noHandlers).concat(f);
      }
    };

    function getHandlers(emitter, type) {
      return emitter._handlers && emitter._handlers[type] || noHandlers
    }

    function off(emitter, type, f) {
      if (emitter.removeEventListener) {
        emitter.removeEventListener(type, f, false);
      } else if (emitter.detachEvent) {
        emitter.detachEvent("on" + type, f);
      } else {
        var map$$1 = emitter._handlers, arr = map$$1 && map$$1[type];
        if (arr) {
          var index = indexOf(arr, f);
          if (index > -1)
            { map$$1[type] = arr.slice(0, index).concat(arr.slice(index + 1)); }
        }
      }
    }

    function signal(emitter, type /*, values...*/) {
      var handlers = getHandlers(emitter, type);
      if (!handlers.length) { return }
      var args = Array.prototype.slice.call(arguments, 2);
      for (var i = 0; i < handlers.length; ++i) { handlers[i].apply(null, args); }
    }

    // The DOM events that CodeMirror handles can be overridden by
    // registering a (non-DOM) handler on the editor for the event name,
    // and preventDefault-ing the event in that handler.
    function signalDOMEvent(cm, e, override) {
      if (typeof e == "string")
        { e = {type: e, preventDefault: function() { this.defaultPrevented = true; }}; }
      signal(cm, override || e.type, cm, e);
      return e_defaultPrevented(e) || e.codemirrorIgnore
    }

    function signalCursorActivity(cm) {
      var arr = cm._handlers && cm._handlers.cursorActivity;
      if (!arr) { return }
      var set = cm.curOp.cursorActivityHandlers || (cm.curOp.cursorActivityHandlers = []);
      for (var i = 0; i < arr.length; ++i) { if (indexOf(set, arr[i]) == -1)
        { set.push(arr[i]); } }
    }

    function hasHandler(emitter, type) {
      return getHandlers(emitter, type).length > 0
    }

    // Add on and off methods to a constructor's prototype, to make
    // registering events on such objects more convenient.
    function eventMixin(ctor) {
      ctor.prototype.on = function(type, f) {on(this, type, f);};
      ctor.prototype.off = function(type, f) {off(this, type, f);};
    }

    // Due to the fact that we still support jurassic IE versions, some
    // compatibility wrappers are needed.

    function e_preventDefault(e) {
      if (e.preventDefault) { e.preventDefault(); }
      else { e.returnValue = false; }
    }
    function e_stopPropagation(e) {
      if (e.stopPropagation) { e.stopPropagation(); }
      else { e.cancelBubble = true; }
    }
    function e_defaultPrevented(e) {
      return e.defaultPrevented != null ? e.defaultPrevented : e.returnValue == false
    }
    function e_stop(e) {e_preventDefault(e); e_stopPropagation(e);}

    function e_target(e) {return e.target || e.srcElement}
    function e_button(e) {
      var b = e.which;
      if (b == null) {
        if (e.button & 1) { b = 1; }
        else if (e.button & 2) { b = 3; }
        else if (e.button & 4) { b = 2; }
      }
      if (mac && e.ctrlKey && b == 1) { b = 3; }
      return b
    }

    // Detect drag-and-drop
    var dragAndDrop = function() {
      // There is *some* kind of drag-and-drop support in IE6-8, but I
      // couldn't get it to work yet.
      if (ie && ie_version < 9) { return false }
      var div = elt('div');
      return "draggable" in div || "dragDrop" in div
    }();

    var zwspSupported;
    function zeroWidthElement(measure) {
      if (zwspSupported == null) {
        var test = elt("span", "\u200b");
        removeChildrenAndAdd(measure, elt("span", [test, document.createTextNode("x")]));
        if (measure.firstChild.offsetHeight != 0)
          { zwspSupported = test.offsetWidth <= 1 && test.offsetHeight > 2 && !(ie && ie_version < 8); }
      }
      var node = zwspSupported ? elt("span", "\u200b") :
        elt("span", "\u00a0", null, "display: inline-block; width: 1px; margin-right: -1px");
      node.setAttribute("cm-text", "");
      return node
    }

    // Feature-detect IE's crummy client rect reporting for bidi text
    var badBidiRects;
    function hasBadBidiRects(measure) {
      if (badBidiRects != null) { return badBidiRects }
      var txt = removeChildrenAndAdd(measure, document.createTextNode("A\u062eA"));
      var r0 = range(txt, 0, 1).getBoundingClientRect();
      var r1 = range(txt, 1, 2).getBoundingClientRect();
      removeChildren(measure);
      if (!r0 || r0.left == r0.right) { return false } // Safari returns null in some cases (#2780)
      return badBidiRects = (r1.right - r0.right < 3)
    }

    // See if "".split is the broken IE version, if so, provide an
    // alternative way to split lines.
    var splitLinesAuto = "\n\nb".split(/\n/).length != 3 ? function (string) {
      var pos = 0, result = [], l = string.length;
      while (pos <= l) {
        var nl = string.indexOf("\n", pos);
        if (nl == -1) { nl = string.length; }
        var line = string.slice(pos, string.charAt(nl - 1) == "\r" ? nl - 1 : nl);
        var rt = line.indexOf("\r");
        if (rt != -1) {
          result.push(line.slice(0, rt));
          pos += rt + 1;
        } else {
          result.push(line);
          pos = nl + 1;
        }
      }
      return result
    } : function (string) { return string.split(/\r\n?|\n/); };

    var hasSelection = window.getSelection ? function (te) {
      try { return te.selectionStart != te.selectionEnd }
      catch(e) { return false }
    } : function (te) {
      var range$$1;
      try {range$$1 = te.ownerDocument.selection.createRange();}
      catch(e) {}
      if (!range$$1 || range$$1.parentElement() != te) { return false }
      return range$$1.compareEndPoints("StartToEnd", range$$1) != 0
    };

    var hasCopyEvent = (function () {
      var e = elt("div");
      if ("oncopy" in e) { return true }
      e.setAttribute("oncopy", "return;");
      return typeof e.oncopy == "function"
    })();

    var badZoomedRects = null;
    function hasBadZoomedRects(measure) {
      if (badZoomedRects != null) { return badZoomedRects }
      var node = removeChildrenAndAdd(measure, elt("span", "x"));
      var normal = node.getBoundingClientRect();
      var fromRange = range(node, 0, 1).getBoundingClientRect();
      return badZoomedRects = Math.abs(normal.left - fromRange.left) > 1
    }

    // Known modes, by name and by MIME
    var modes = {}, mimeModes = {};

    // Extra arguments are stored as the mode's dependencies, which is
    // used by (legacy) mechanisms like loadmode.js to automatically
    // load a mode. (Preferred mechanism is the require/define calls.)
    function defineMode(name, mode) {
      if (arguments.length > 2)
        { mode.dependencies = Array.prototype.slice.call(arguments, 2); }
      modes[name] = mode;
    }

    function defineMIME(mime, spec) {
      mimeModes[mime] = spec;
    }

    // Given a MIME type, a {name, ...options} config object, or a name
    // string, return a mode config object.
    function resolveMode(spec) {
      if (typeof spec == "string" && mimeModes.hasOwnProperty(spec)) {
        spec = mimeModes[spec];
      } else if (spec && typeof spec.name == "string" && mimeModes.hasOwnProperty(spec.name)) {
        var found = mimeModes[spec.name];
        if (typeof found == "string") { found = {name: found}; }
        spec = createObj(found, spec);
        spec.name = found.name;
      } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec)) {
        return resolveMode("application/xml")
      } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+json$/.test(spec)) {
        return resolveMode("application/json")
      }
      if (typeof spec == "string") { return {name: spec} }
      else { return spec || {name: "null"} }
    }

    // Given a mode spec (anything that resolveMode accepts), find and
    // initialize an actual mode object.
    function getMode(options, spec) {
      spec = resolveMode(spec);
      var mfactory = modes[spec.name];
      if (!mfactory) { return getMode(options, "text/plain") }
      var modeObj = mfactory(options, spec);
      if (modeExtensions.hasOwnProperty(spec.name)) {
        var exts = modeExtensions[spec.name];
        for (var prop in exts) {
          if (!exts.hasOwnProperty(prop)) { continue }
          if (modeObj.hasOwnProperty(prop)) { modeObj["_" + prop] = modeObj[prop]; }
          modeObj[prop] = exts[prop];
        }
      }
      modeObj.name = spec.name;
      if (spec.helperType) { modeObj.helperType = spec.helperType; }
      if (spec.modeProps) { for (var prop$1 in spec.modeProps)
        { modeObj[prop$1] = spec.modeProps[prop$1]; } }

      return modeObj
    }

    // This can be used to attach properties to mode objects from
    // outside the actual mode definition.
    var modeExtensions = {};
    function extendMode(mode, properties) {
      var exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : (modeExtensions[mode] = {});
      copyObj(properties, exts);
    }

    function copyState(mode, state) {
      if (state === true) { return state }
      if (mode.copyState) { return mode.copyState(state) }
      var nstate = {};
      for (var n in state) {
        var val = state[n];
        if (val instanceof Array) { val = val.concat([]); }
        nstate[n] = val;
      }
      return nstate
    }

    // Given a mode and a state (for that mode), find the inner mode and
    // state at the position that the state refers to.
    function innerMode(mode, state) {
      var info;
      while (mode.innerMode) {
        info = mode.innerMode(state);
        if (!info || info.mode == mode) { break }
        state = info.state;
        mode = info.mode;
      }
      return info || {mode: mode, state: state}
    }

    function startState(mode, a1, a2) {
      return mode.startState ? mode.startState(a1, a2) : true
    }

    // STRING STREAM

    // Fed to the mode parsers, provides helper functions to make
    // parsers more succinct.

    var StringStream = function(string, tabSize, lineOracle) {
      this.pos = this.start = 0;
      this.string = string;
      this.tabSize = tabSize || 8;
      this.lastColumnPos = this.lastColumnValue = 0;
      this.lineStart = 0;
      this.lineOracle = lineOracle;
    };

    StringStream.prototype.eol = function () {return this.pos >= this.string.length};
    StringStream.prototype.sol = function () {return this.pos == this.lineStart};
    StringStream.prototype.peek = function () {return this.string.charAt(this.pos) || undefined};
    StringStream.prototype.next = function () {
      if (this.pos < this.string.length)
        { return this.string.charAt(this.pos++) }
    };
    StringStream.prototype.eat = function (match) {
      var ch = this.string.charAt(this.pos);
      var ok;
      if (typeof match == "string") { ok = ch == match; }
      else { ok = ch && (match.test ? match.test(ch) : match(ch)); }
      if (ok) {++this.pos; return ch}
    };
    StringStream.prototype.eatWhile = function (match) {
      var start = this.pos;
      while (this.eat(match)){}
      return this.pos > start
    };
    StringStream.prototype.eatSpace = function () {
        var this$1 = this;

      var start = this.pos;
      while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) { ++this$1.pos; }
      return this.pos > start
    };
    StringStream.prototype.skipToEnd = function () {this.pos = this.string.length;};
    StringStream.prototype.skipTo = function (ch) {
      var found = this.string.indexOf(ch, this.pos);
      if (found > -1) {this.pos = found; return true}
    };
    StringStream.prototype.backUp = function (n) {this.pos -= n;};
    StringStream.prototype.column = function () {
      if (this.lastColumnPos < this.start) {
        this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
        this.lastColumnPos = this.start;
      }
      return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0)
    };
    StringStream.prototype.indentation = function () {
      return countColumn(this.string, null, this.tabSize) -
        (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0)
    };
    StringStream.prototype.match = function (pattern, consume, caseInsensitive) {
      if (typeof pattern == "string") {
        var cased = function (str) { return caseInsensitive ? str.toLowerCase() : str; };
        var substr = this.string.substr(this.pos, pattern.length);
        if (cased(substr) == cased(pattern)) {
          if (consume !== false) { this.pos += pattern.length; }
          return true
        }
      } else {
        var match = this.string.slice(this.pos).match(pattern);
        if (match && match.index > 0) { return null }
        if (match && consume !== false) { this.pos += match[0].length; }
        return match
      }
    };
    StringStream.prototype.current = function (){return this.string.slice(this.start, this.pos)};
    StringStream.prototype.hideFirstChars = function (n, inner) {
      this.lineStart += n;
      try { return inner() }
      finally { this.lineStart -= n; }
    };
    StringStream.prototype.lookAhead = function (n) {
      var oracle = this.lineOracle;
      return oracle && oracle.lookAhead(n)
    };
    StringStream.prototype.baseToken = function () {
      var oracle = this.lineOracle;
      return oracle && oracle.baseToken(this.pos)
    };

    var SavedContext = function(state, lookAhead) {
      this.state = state;
      this.lookAhead = lookAhead;
    };

    var Context = function(doc, state, line, lookAhead) {
      this.state = state;
      this.doc = doc;
      this.line = line;
      this.maxLookAhead = lookAhead || 0;
      this.baseTokens = null;
      this.baseTokenPos = 1;
    };

    Context.prototype.lookAhead = function (n) {
      var line = this.doc.getLine(this.line + n);
      if (line != null && n > this.maxLookAhead) { this.maxLookAhead = n; }
      return line
    };

    Context.prototype.baseToken = function (n) {
        var this$1 = this;

      if (!this.baseTokens) { return null }
      while (this.baseTokens[this.baseTokenPos] <= n)
        { this$1.baseTokenPos += 2; }
      var type = this.baseTokens[this.baseTokenPos + 1];
      return {type: type && type.replace(/( |^)overlay .*/, ""),
              size: this.baseTokens[this.baseTokenPos] - n}
    };

    Context.prototype.nextLine = function () {
      this.line++;
      if (this.maxLookAhead > 0) { this.maxLookAhead--; }
    };

    Context.fromSaved = function (doc, saved, line) {
      if (saved instanceof SavedContext)
        { return new Context(doc, copyState(doc.mode, saved.state), line, saved.lookAhead) }
      else
        { return new Context(doc, copyState(doc.mode, saved), line) }
    };

    Context.prototype.save = function (copy) {
      var state = copy !== false ? copyState(this.doc.mode, this.state) : this.state;
      return this.maxLookAhead > 0 ? new SavedContext(state, this.maxLookAhead) : state
    };


    // Compute a style array (an array starting with a mode generation
    // -- for invalidation -- followed by pairs of end positions and
    // style strings), which is used to highlight the tokens on the
    // line.
    function highlightLine(cm, line, context, forceToEnd) {
      // A styles array always starts with a number identifying the
      // mode/overlays that it is based on (for easy invalidation).
      var st = [cm.state.modeGen], lineClasses = {};
      // Compute the base array of styles
      runMode(cm, line.text, cm.doc.mode, context, function (end, style) { return st.push(end, style); },
              lineClasses, forceToEnd);
      var state = context.state;

      // Run overlays, adjust style array.
      var loop = function ( o ) {
        context.baseTokens = st;
        var overlay = cm.state.overlays[o], i = 1, at = 0;
        context.state = true;
        runMode(cm, line.text, overlay.mode, context, function (end, style) {
          var start = i;
          // Ensure there's a token end at the current position, and that i points at it
          while (at < end) {
            var i_end = st[i];
            if (i_end > end)
              { st.splice(i, 1, end, st[i+1], i_end); }
            i += 2;
            at = Math.min(end, i_end);
          }
          if (!style) { return }
          if (overlay.opaque) {
            st.splice(start, i - start, end, "overlay " + style);
            i = start + 2;
          } else {
            for (; start < i; start += 2) {
              var cur = st[start+1];
              st[start+1] = (cur ? cur + " " : "") + "overlay " + style;
            }
          }
        }, lineClasses);
        context.state = state;
        context.baseTokens = null;
        context.baseTokenPos = 1;
      };

      for (var o = 0; o < cm.state.overlays.length; ++o) loop( o );

      return {styles: st, classes: lineClasses.bgClass || lineClasses.textClass ? lineClasses : null}
    }

    function getLineStyles(cm, line, updateFrontier) {
      if (!line.styles || line.styles[0] != cm.state.modeGen) {
        var context = getContextBefore(cm, lineNo(line));
        var resetState = line.text.length > cm.options.maxHighlightLength && copyState(cm.doc.mode, context.state);
        var result = highlightLine(cm, line, context);
        if (resetState) { context.state = resetState; }
        line.stateAfter = context.save(!resetState);
        line.styles = result.styles;
        if (result.classes) { line.styleClasses = result.classes; }
        else if (line.styleClasses) { line.styleClasses = null; }
        if (updateFrontier === cm.doc.highlightFrontier)
          { cm.doc.modeFrontier = Math.max(cm.doc.modeFrontier, ++cm.doc.highlightFrontier); }
      }
      return line.styles
    }

    function getContextBefore(cm, n, precise) {
      var doc = cm.doc, display = cm.display;
      if (!doc.mode.startState) { return new Context(doc, true, n) }
      var start = findStartLine(cm, n, precise);
      var saved = start > doc.first && getLine(doc, start - 1).stateAfter;
      var context = saved ? Context.fromSaved(doc, saved, start) : new Context(doc, startState(doc.mode), start);

      doc.iter(start, n, function (line) {
        processLine(cm, line.text, context);
        var pos = context.line;
        line.stateAfter = pos == n - 1 || pos % 5 == 0 || pos >= display.viewFrom && pos < display.viewTo ? context.save() : null;
        context.nextLine();
      });
      if (precise) { doc.modeFrontier = context.line; }
      return context
    }

    // Lightweight form of highlight -- proceed over this line and
    // update state, but don't save a style array. Used for lines that
    // aren't currently visible.
    function processLine(cm, text, context, startAt) {
      var mode = cm.doc.mode;
      var stream = new StringStream(text, cm.options.tabSize, context);
      stream.start = stream.pos = startAt || 0;
      if (text == "") { callBlankLine(mode, context.state); }
      while (!stream.eol()) {
        readToken(mode, stream, context.state);
        stream.start = stream.pos;
      }
    }

    function callBlankLine(mode, state) {
      if (mode.blankLine) { return mode.blankLine(state) }
      if (!mode.innerMode) { return }
      var inner = innerMode(mode, state);
      if (inner.mode.blankLine) { return inner.mode.blankLine(inner.state) }
    }

    function readToken(mode, stream, state, inner) {
      for (var i = 0; i < 10; i++) {
        if (inner) { inner[0] = innerMode(mode, state).mode; }
        var style = mode.token(stream, state);
        if (stream.pos > stream.start) { return style }
      }
      throw new Error("Mode " + mode.name + " failed to advance stream.")
    }

    var Token = function(stream, type, state) {
      this.start = stream.start; this.end = stream.pos;
      this.string = stream.current();
      this.type = type || null;
      this.state = state;
    };

    // Utility for getTokenAt and getLineTokens
    function takeToken(cm, pos, precise, asArray) {
      var doc = cm.doc, mode = doc.mode, style;
      pos = clipPos(doc, pos);
      var line = getLine(doc, pos.line), context = getContextBefore(cm, pos.line, precise);
      var stream = new StringStream(line.text, cm.options.tabSize, context), tokens;
      if (asArray) { tokens = []; }
      while ((asArray || stream.pos < pos.ch) && !stream.eol()) {
        stream.start = stream.pos;
        style = readToken(mode, stream, context.state);
        if (asArray) { tokens.push(new Token(stream, style, copyState(doc.mode, context.state))); }
      }
      return asArray ? tokens : new Token(stream, style, context.state)
    }

    function extractLineClasses(type, output) {
      if (type) { for (;;) {
        var lineClass = type.match(/(?:^|\s+)line-(background-)?(\S+)/);
        if (!lineClass) { break }
        type = type.slice(0, lineClass.index) + type.slice(lineClass.index + lineClass[0].length);
        var prop = lineClass[1] ? "bgClass" : "textClass";
        if (output[prop] == null)
          { output[prop] = lineClass[2]; }
        else if (!(new RegExp("(?:^|\s)" + lineClass[2] + "(?:$|\s)")).test(output[prop]))
          { output[prop] += " " + lineClass[2]; }
      } }
      return type
    }

    // Run the given mode's parser over a line, calling f for each token.
    function runMode(cm, text, mode, context, f, lineClasses, forceToEnd) {
      var flattenSpans = mode.flattenSpans;
      if (flattenSpans == null) { flattenSpans = cm.options.flattenSpans; }
      var curStart = 0, curStyle = null;
      var stream = new StringStream(text, cm.options.tabSize, context), style;
      var inner = cm.options.addModeClass && [null];
      if (text == "") { extractLineClasses(callBlankLine(mode, context.state), lineClasses); }
      while (!stream.eol()) {
        if (stream.pos > cm.options.maxHighlightLength) {
          flattenSpans = false;
          if (forceToEnd) { processLine(cm, text, context, stream.pos); }
          stream.pos = text.length;
          style = null;
        } else {
          style = extractLineClasses(readToken(mode, stream, context.state, inner), lineClasses);
        }
        if (inner) {
          var mName = inner[0].name;
          if (mName) { style = "m-" + (style ? mName + " " + style : mName); }
        }
        if (!flattenSpans || curStyle != style) {
          while (curStart < stream.start) {
            curStart = Math.min(stream.start, curStart + 5000);
            f(curStart, curStyle);
          }
          curStyle = style;
        }
        stream.start = stream.pos;
      }
      while (curStart < stream.pos) {
        // Webkit seems to refuse to render text nodes longer than 57444
        // characters, and returns inaccurate measurements in nodes
        // starting around 5000 chars.
        var pos = Math.min(stream.pos, curStart + 5000);
        f(pos, curStyle);
        curStart = pos;
      }
    }

    // Finds the line to start with when starting a parse. Tries to
    // find a line with a stateAfter, so that it can start with a
    // valid state. If that fails, it returns the line with the
    // smallest indentation, which tends to need the least context to
    // parse correctly.
    function findStartLine(cm, n, precise) {
      var minindent, minline, doc = cm.doc;
      var lim = precise ? -1 : n - (cm.doc.mode.innerMode ? 1000 : 100);
      for (var search = n; search > lim; --search) {
        if (search <= doc.first) { return doc.first }
        var line = getLine(doc, search - 1), after = line.stateAfter;
        if (after && (!precise || search + (after instanceof SavedContext ? after.lookAhead : 0) <= doc.modeFrontier))
          { return search }
        var indented = countColumn(line.text, null, cm.options.tabSize);
        if (minline == null || minindent > indented) {
          minline = search - 1;
          minindent = indented;
        }
      }
      return minline
    }

    function retreatFrontier(doc, n) {
      doc.modeFrontier = Math.min(doc.modeFrontier, n);
      if (doc.highlightFrontier < n - 10) { return }
      var start = doc.first;
      for (var line = n - 1; line > start; line--) {
        var saved = getLine(doc, line).stateAfter;
        // change is on 3
        // state on line 1 looked ahead 2 -- so saw 3
        // test 1 + 2 < 3 should cover this
        if (saved && (!(saved instanceof SavedContext) || line + saved.lookAhead < n)) {
          start = line + 1;
          break
        }
      }
      doc.highlightFrontier = Math.min(doc.highlightFrontier, start);
    }

    // LINE DATA STRUCTURE

    // Line objects. These hold state related to a line, including
    // highlighting info (the styles array).
    var Line = function(text, markedSpans, estimateHeight) {
      this.text = text;
      attachMarkedSpans(this, markedSpans);
      this.height = estimateHeight ? estimateHeight(this) : 1;
    };

    Line.prototype.lineNo = function () { return lineNo(this) };
    eventMixin(Line);

    // Change the content (text, markers) of a line. Automatically
    // invalidates cached information and tries to re-estimate the
    // line's height.
    function updateLine(line, text, markedSpans, estimateHeight) {
      line.text = text;
      if (line.stateAfter) { line.stateAfter = null; }
      if (line.styles) { line.styles = null; }
      if (line.order != null) { line.order = null; }
      detachMarkedSpans(line);
      attachMarkedSpans(line, markedSpans);
      var estHeight = estimateHeight ? estimateHeight(line) : 1;
      if (estHeight != line.height) { updateLineHeight(line, estHeight); }
    }

    // Detach a line from the document tree and its markers.
    function cleanUpLine(line) {
      line.parent = null;
      detachMarkedSpans(line);
    }

    // Convert a style as returned by a mode (either null, or a string
    // containing one or more styles) to a CSS style. This is cached,
    // and also looks for line-wide styles.
    var styleToClassCache = {}, styleToClassCacheWithMode = {};
    function interpretTokenStyle(style, options) {
      if (!style || /^\s*$/.test(style)) { return null }
      var cache = options.addModeClass ? styleToClassCacheWithMode : styleToClassCache;
      return cache[style] ||
        (cache[style] = style.replace(/\S+/g, "cm-$&"))
    }

    // Render the DOM representation of the text of a line. Also builds
    // up a 'line map', which points at the DOM nodes that represent
    // specific stretches of text, and is used by the measuring code.
    // The returned object contains the DOM node, this map, and
    // information about line-wide styles that were set by the mode.
    function buildLineContent(cm, lineView) {
      // The padding-right forces the element to have a 'border', which
      // is needed on Webkit to be able to get line-level bounding
      // rectangles for it (in measureChar).
      var content = eltP("span", null, null, webkit ? "padding-right: .1px" : null);
      var builder = {pre: eltP("pre", [content], "CodeMirror-line"), content: content,
                     col: 0, pos: 0, cm: cm,
                     trailingSpace: false,
                     splitSpaces: cm.getOption("lineWrapping")};
      lineView.measure = {};

      // Iterate over the logical lines that make up this visual line.
      for (var i = 0; i <= (lineView.rest ? lineView.rest.length : 0); i++) {
        var line = i ? lineView.rest[i - 1] : lineView.line, order = (void 0);
        builder.pos = 0;
        builder.addToken = buildToken;
        // Optionally wire in some hacks into the token-rendering
        // algorithm, to deal with browser quirks.
        if (hasBadBidiRects(cm.display.measure) && (order = getOrder(line, cm.doc.direction)))
          { builder.addToken = buildTokenBadBidi(builder.addToken, order); }
        builder.map = [];
        var allowFrontierUpdate = lineView != cm.display.externalMeasured && lineNo(line);
        insertLineContent(line, builder, getLineStyles(cm, line, allowFrontierUpdate));
        if (line.styleClasses) {
          if (line.styleClasses.bgClass)
            { builder.bgClass = joinClasses(line.styleClasses.bgClass, builder.bgClass || ""); }
          if (line.styleClasses.textClass)
            { builder.textClass = joinClasses(line.styleClasses.textClass, builder.textClass || ""); }
        }

        // Ensure at least a single node is present, for measuring.
        if (builder.map.length == 0)
          { builder.map.push(0, 0, builder.content.appendChild(zeroWidthElement(cm.display.measure))); }

        // Store the map and a cache object for the current logical line
        if (i == 0) {
          lineView.measure.map = builder.map;
          lineView.measure.cache = {};
        } else {
    (lineView.measure.maps || (lineView.measure.maps = [])).push(builder.map)
          ;(lineView.measure.caches || (lineView.measure.caches = [])).push({});
        }
      }

      // See issue #2901
      if (webkit) {
        var last = builder.content.lastChild;
        if (/\bcm-tab\b/.test(last.className) || (last.querySelector && last.querySelector(".cm-tab")))
          { builder.content.className = "cm-tab-wrap-hack"; }
      }

      signal(cm, "renderLine", cm, lineView.line, builder.pre);
      if (builder.pre.className)
        { builder.textClass = joinClasses(builder.pre.className, builder.textClass || ""); }

      return builder
    }

    function defaultSpecialCharPlaceholder(ch) {
      var token = elt("span", "\u2022", "cm-invalidchar");
      token.title = "\\u" + ch.charCodeAt(0).toString(16);
      token.setAttribute("aria-label", token.title);
      return token
    }

    // Build up the DOM representation for a single token, and add it to
    // the line map. Takes care to render special characters separately.
    function buildToken(builder, text, style, startStyle, endStyle, css, attributes) {
      if (!text) { return }
      var displayText = builder.splitSpaces ? splitSpaces(text, builder.trailingSpace) : text;
      var special = builder.cm.state.specialChars, mustWrap = false;
      var content;
      if (!special.test(text)) {
        builder.col += text.length;
        content = document.createTextNode(displayText);
        builder.map.push(builder.pos, builder.pos + text.length, content);
        if (ie && ie_version < 9) { mustWrap = true; }
        builder.pos += text.length;
      } else {
        content = document.createDocumentFragment();
        var pos = 0;
        while (true) {
          special.lastIndex = pos;
          var m = special.exec(text);
          var skipped = m ? m.index - pos : text.length - pos;
          if (skipped) {
            var txt = document.createTextNode(displayText.slice(pos, pos + skipped));
            if (ie && ie_version < 9) { content.appendChild(elt("span", [txt])); }
            else { content.appendChild(txt); }
            builder.map.push(builder.pos, builder.pos + skipped, txt);
            builder.col += skipped;
            builder.pos += skipped;
          }
          if (!m) { break }
          pos += skipped + 1;
          var txt$1 = (void 0);
          if (m[0] == "\t") {
            var tabSize = builder.cm.options.tabSize, tabWidth = tabSize - builder.col % tabSize;
            txt$1 = content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab"));
            txt$1.setAttribute("role", "presentation");
            txt$1.setAttribute("cm-text", "\t");
            builder.col += tabWidth;
          } else if (m[0] == "\r" || m[0] == "\n") {
            txt$1 = content.appendChild(elt("span", m[0] == "\r" ? "\u240d" : "\u2424", "cm-invalidchar"));
            txt$1.setAttribute("cm-text", m[0]);
            builder.col += 1;
          } else {
            txt$1 = builder.cm.options.specialCharPlaceholder(m[0]);
            txt$1.setAttribute("cm-text", m[0]);
            if (ie && ie_version < 9) { content.appendChild(elt("span", [txt$1])); }
            else { content.appendChild(txt$1); }
            builder.col += 1;
          }
          builder.map.push(builder.pos, builder.pos + 1, txt$1);
          builder.pos++;
        }
      }
      builder.trailingSpace = displayText.charCodeAt(text.length - 1) == 32;
      if (style || startStyle || endStyle || mustWrap || css) {
        var fullStyle = style || "";
        if (startStyle) { fullStyle += startStyle; }
        if (endStyle) { fullStyle += endStyle; }
        var token = elt("span", [content], fullStyle, css);
        if (attributes) {
          for (var attr in attributes) { if (attributes.hasOwnProperty(attr) && attr != "style" && attr != "class")
            { token.setAttribute(attr, attributes[attr]); } }
        }
        return builder.content.appendChild(token)
      }
      builder.content.appendChild(content);
    }

    // Change some spaces to NBSP to prevent the browser from collapsing
    // trailing spaces at the end of a line when rendering text (issue #1362).
    function splitSpaces(text, trailingBefore) {
      if (text.length > 1 && !/  /.test(text)) { return text }
      var spaceBefore = trailingBefore, result = "";
      for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        if (ch == " " && spaceBefore && (i == text.length - 1 || text.charCodeAt(i + 1) == 32))
          { ch = "\u00a0"; }
        result += ch;
        spaceBefore = ch == " ";
      }
      return result
    }

    // Work around nonsense dimensions being reported for stretches of
    // right-to-left text.
    function buildTokenBadBidi(inner, order) {
      return function (builder, text, style, startStyle, endStyle, css, attributes) {
        style = style ? style + " cm-force-border" : "cm-force-border";
        var start = builder.pos, end = start + text.length;
        for (;;) {
          // Find the part that overlaps with the start of this text
          var part = (void 0);
          for (var i = 0; i < order.length; i++) {
            part = order[i];
            if (part.to > start && part.from <= start) { break }
          }
          if (part.to >= end) { return inner(builder, text, style, startStyle, endStyle, css, attributes) }
          inner(builder, text.slice(0, part.to - start), style, startStyle, null, css, attributes);
          startStyle = null;
          text = text.slice(part.to - start);
          start = part.to;
        }
      }
    }

    function buildCollapsedSpan(builder, size, marker, ignoreWidget) {
      var widget = !ignoreWidget && marker.widgetNode;
      if (widget) { builder.map.push(builder.pos, builder.pos + size, widget); }
      if (!ignoreWidget && builder.cm.display.input.needsContentAttribute) {
        if (!widget)
          { widget = builder.content.appendChild(document.createElement("span")); }
        widget.setAttribute("cm-marker", marker.id);
      }
      if (widget) {
        builder.cm.display.input.setUneditable(widget);
        builder.content.appendChild(widget);
      }
      builder.pos += size;
      builder.trailingSpace = false;
    }

    // Outputs a number of spans to make up a line, taking highlighting
    // and marked text into account.
    function insertLineContent(line, builder, styles) {
      var spans = line.markedSpans, allText = line.text, at = 0;
      if (!spans) {
        for (var i$1 = 1; i$1 < styles.length; i$1+=2)
          { builder.addToken(builder, allText.slice(at, at = styles[i$1]), interpretTokenStyle(styles[i$1+1], builder.cm.options)); }
        return
      }

      var len = allText.length, pos = 0, i = 1, text = "", style, css;
      var nextChange = 0, spanStyle, spanEndStyle, spanStartStyle, collapsed, attributes;
      for (;;) {
        if (nextChange == pos) { // Update current marker set
          spanStyle = spanEndStyle = spanStartStyle = css = "";
          attributes = null;
          collapsed = null; nextChange = Infinity;
          var foundBookmarks = [], endStyles = (void 0);
          for (var j = 0; j < spans.length; ++j) {
            var sp = spans[j], m = sp.marker;
            if (m.type == "bookmark" && sp.from == pos && m.widgetNode) {
              foundBookmarks.push(m);
            } else if (sp.from <= pos && (sp.to == null || sp.to > pos || m.collapsed && sp.to == pos && sp.from == pos)) {
              if (sp.to != null && sp.to != pos && nextChange > sp.to) {
                nextChange = sp.to;
                spanEndStyle = "";
              }
              if (m.className) { spanStyle += " " + m.className; }
              if (m.css) { css = (css ? css + ";" : "") + m.css; }
              if (m.startStyle && sp.from == pos) { spanStartStyle += " " + m.startStyle; }
              if (m.endStyle && sp.to == nextChange) { (endStyles || (endStyles = [])).push(m.endStyle, sp.to); }
              // support for the old title property
              // https://github.com/codemirror/CodeMirror/pull/5673
              if (m.title) { (attributes || (attributes = {})).title = m.title; }
              if (m.attributes) {
                for (var attr in m.attributes)
                  { (attributes || (attributes = {}))[attr] = m.attributes[attr]; }
              }
              if (m.collapsed && (!collapsed || compareCollapsedMarkers(collapsed.marker, m) < 0))
                { collapsed = sp; }
            } else if (sp.from > pos && nextChange > sp.from) {
              nextChange = sp.from;
            }
          }
          if (endStyles) { for (var j$1 = 0; j$1 < endStyles.length; j$1 += 2)
            { if (endStyles[j$1 + 1] == nextChange) { spanEndStyle += " " + endStyles[j$1]; } } }

          if (!collapsed || collapsed.from == pos) { for (var j$2 = 0; j$2 < foundBookmarks.length; ++j$2)
            { buildCollapsedSpan(builder, 0, foundBookmarks[j$2]); } }
          if (collapsed && (collapsed.from || 0) == pos) {
            buildCollapsedSpan(builder, (collapsed.to == null ? len + 1 : collapsed.to) - pos,
                               collapsed.marker, collapsed.from == null);
            if (collapsed.to == null) { return }
            if (collapsed.to == pos) { collapsed = false; }
          }
        }
        if (pos >= len) { break }

        var upto = Math.min(len, nextChange);
        while (true) {
          if (text) {
            var end = pos + text.length;
            if (!collapsed) {
              var tokenText = end > upto ? text.slice(0, upto - pos) : text;
              builder.addToken(builder, tokenText, style ? style + spanStyle : spanStyle,
                               spanStartStyle, pos + tokenText.length == nextChange ? spanEndStyle : "", css, attributes);
            }
            if (end >= upto) {text = text.slice(upto - pos); pos = upto; break}
            pos = end;
            spanStartStyle = "";
          }
          text = allText.slice(at, at = styles[i++]);
          style = interpretTokenStyle(styles[i++], builder.cm.options);
        }
      }
    }


    // These objects are used to represent the visible (currently drawn)
    // part of the document. A LineView may correspond to multiple
    // logical lines, if those are connected by collapsed ranges.
    function LineView(doc, line, lineN) {
      // The starting line
      this.line = line;
      // Continuing lines, if any
      this.rest = visualLineContinued(line);
      // Number of logical lines in this visual line
      this.size = this.rest ? lineNo(lst(this.rest)) - lineN + 1 : 1;
      this.node = this.text = null;
      this.hidden = lineIsHidden(doc, line);
    }

    // Create a range of LineView objects for the given lines.
    function buildViewArray(cm, from, to) {
      var array = [], nextPos;
      for (var pos = from; pos < to; pos = nextPos) {
        var view = new LineView(cm.doc, getLine(cm.doc, pos), pos);
        nextPos = pos + view.size;
        array.push(view);
      }
      return array
    }

    var operationGroup = null;

    function pushOperation(op) {
      if (operationGroup) {
        operationGroup.ops.push(op);
      } else {
        op.ownsGroup = operationGroup = {
          ops: [op],
          delayedCallbacks: []
        };
      }
    }

    function fireCallbacksForOps(group) {
      // Calls delayed callbacks and cursorActivity handlers until no
      // new ones appear
      var callbacks = group.delayedCallbacks, i = 0;
      do {
        for (; i < callbacks.length; i++)
          { callbacks[i].call(null); }
        for (var j = 0; j < group.ops.length; j++) {
          var op = group.ops[j];
          if (op.cursorActivityHandlers)
            { while (op.cursorActivityCalled < op.cursorActivityHandlers.length)
              { op.cursorActivityHandlers[op.cursorActivityCalled++].call(null, op.cm); } }
        }
      } while (i < callbacks.length)
    }

    function finishOperation(op, endCb) {
      var group = op.ownsGroup;
      if (!group) { return }

      try { fireCallbacksForOps(group); }
      finally {
        operationGroup = null;
        endCb(group);
      }
    }

    var orphanDelayedCallbacks = null;

    // Often, we want to signal events at a point where we are in the
    // middle of some work, but don't want the handler to start calling
    // other methods on the editor, which might be in an inconsistent
    // state or simply not expect any other events to happen.
    // signalLater looks whether there are any handlers, and schedules
    // them to be executed when the last operation ends, or, if no
    // operation is active, when a timeout fires.
    function signalLater(emitter, type /*, values...*/) {
      var arr = getHandlers(emitter, type);
      if (!arr.length) { return }
      var args = Array.prototype.slice.call(arguments, 2), list;
      if (operationGroup) {
        list = operationGroup.delayedCallbacks;
      } else if (orphanDelayedCallbacks) {
        list = orphanDelayedCallbacks;
      } else {
        list = orphanDelayedCallbacks = [];
        setTimeout(fireOrphanDelayed, 0);
      }
      var loop = function ( i ) {
        list.push(function () { return arr[i].apply(null, args); });
      };

      for (var i = 0; i < arr.length; ++i)
        loop( i );
    }

    function fireOrphanDelayed() {
      var delayed = orphanDelayedCallbacks;
      orphanDelayedCallbacks = null;
      for (var i = 0; i < delayed.length; ++i) { delayed[i](); }
    }

    // When an aspect of a line changes, a string is added to
    // lineView.changes. This updates the relevant part of the line's
    // DOM structure.
    function updateLineForChanges(cm, lineView, lineN, dims) {
      for (var j = 0; j < lineView.changes.length; j++) {
        var type = lineView.changes[j];
        if (type == "text") { updateLineText(cm, lineView); }
        else if (type == "gutter") { updateLineGutter(cm, lineView, lineN, dims); }
        else if (type == "class") { updateLineClasses(cm, lineView); }
        else if (type == "widget") { updateLineWidgets(cm, lineView, dims); }
      }
      lineView.changes = null;
    }

    // Lines with gutter elements, widgets or a background class need to
    // be wrapped, and have the extra elements added to the wrapper div
    function ensureLineWrapped(lineView) {
      if (lineView.node == lineView.text) {
        lineView.node = elt("div", null, null, "position: relative");
        if (lineView.text.parentNode)
          { lineView.text.parentNode.replaceChild(lineView.node, lineView.text); }
        lineView.node.appendChild(lineView.text);
        if (ie && ie_version < 8) { lineView.node.style.zIndex = 2; }
      }
      return lineView.node
    }

    function updateLineBackground(cm, lineView) {
      var cls = lineView.bgClass ? lineView.bgClass + " " + (lineView.line.bgClass || "") : lineView.line.bgClass;
      if (cls) { cls += " CodeMirror-linebackground"; }
      if (lineView.background) {
        if (cls) { lineView.background.className = cls; }
        else { lineView.background.parentNode.removeChild(lineView.background); lineView.background = null; }
      } else if (cls) {
        var wrap = ensureLineWrapped(lineView);
        lineView.background = wrap.insertBefore(elt("div", null, cls), wrap.firstChild);
        cm.display.input.setUneditable(lineView.background);
      }
    }

    // Wrapper around buildLineContent which will reuse the structure
    // in display.externalMeasured when possible.
    function getLineContent(cm, lineView) {
      var ext = cm.display.externalMeasured;
      if (ext && ext.line == lineView.line) {
        cm.display.externalMeasured = null;
        lineView.measure = ext.measure;
        return ext.built
      }
      return buildLineContent(cm, lineView)
    }

    // Redraw the line's text. Interacts with the background and text
    // classes because the mode may output tokens that influence these
    // classes.
    function updateLineText(cm, lineView) {
      var cls = lineView.text.className;
      var built = getLineContent(cm, lineView);
      if (lineView.text == lineView.node) { lineView.node = built.pre; }
      lineView.text.parentNode.replaceChild(built.pre, lineView.text);
      lineView.text = built.pre;
      if (built.bgClass != lineView.bgClass || built.textClass != lineView.textClass) {
        lineView.bgClass = built.bgClass;
        lineView.textClass = built.textClass;
        updateLineClasses(cm, lineView);
      } else if (cls) {
        lineView.text.className = cls;
      }
    }

    function updateLineClasses(cm, lineView) {
      updateLineBackground(cm, lineView);
      if (lineView.line.wrapClass)
        { ensureLineWrapped(lineView).className = lineView.line.wrapClass; }
      else if (lineView.node != lineView.text)
        { lineView.node.className = ""; }
      var textClass = lineView.textClass ? lineView.textClass + " " + (lineView.line.textClass || "") : lineView.line.textClass;
      lineView.text.className = textClass || "";
    }

    function updateLineGutter(cm, lineView, lineN, dims) {
      if (lineView.gutter) {
        lineView.node.removeChild(lineView.gutter);
        lineView.gutter = null;
      }
      if (lineView.gutterBackground) {
        lineView.node.removeChild(lineView.gutterBackground);
        lineView.gutterBackground = null;
      }
      if (lineView.line.gutterClass) {
        var wrap = ensureLineWrapped(lineView);
        lineView.gutterBackground = elt("div", null, "CodeMirror-gutter-background " + lineView.line.gutterClass,
                                        ("left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px; width: " + (dims.gutterTotalWidth) + "px"));
        cm.display.input.setUneditable(lineView.gutterBackground);
        wrap.insertBefore(lineView.gutterBackground, lineView.text);
      }
      var markers = lineView.line.gutterMarkers;
      if (cm.options.lineNumbers || markers) {
        var wrap$1 = ensureLineWrapped(lineView);
        var gutterWrap = lineView.gutter = elt("div", null, "CodeMirror-gutter-wrapper", ("left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px"));
        cm.display.input.setUneditable(gutterWrap);
        wrap$1.insertBefore(gutterWrap, lineView.text);
        if (lineView.line.gutterClass)
          { gutterWrap.className += " " + lineView.line.gutterClass; }
        if (cm.options.lineNumbers && (!markers || !markers["CodeMirror-linenumbers"]))
          { lineView.lineNumber = gutterWrap.appendChild(
            elt("div", lineNumberFor(cm.options, lineN),
                "CodeMirror-linenumber CodeMirror-gutter-elt",
                ("left: " + (dims.gutterLeft["CodeMirror-linenumbers"]) + "px; width: " + (cm.display.lineNumInnerWidth) + "px"))); }
        if (markers) { for (var k = 0; k < cm.options.gutters.length; ++k) {
          var id = cm.options.gutters[k], found = markers.hasOwnProperty(id) && markers[id];
          if (found)
            { gutterWrap.appendChild(elt("div", [found], "CodeMirror-gutter-elt",
                                       ("left: " + (dims.gutterLeft[id]) + "px; width: " + (dims.gutterWidth[id]) + "px"))); }
        } }
      }
    }

    function updateLineWidgets(cm, lineView, dims) {
      if (lineView.alignable) { lineView.alignable = null; }
      for (var node = lineView.node.firstChild, next = (void 0); node; node = next) {
        next = node.nextSibling;
        if (node.className == "CodeMirror-linewidget")
          { lineView.node.removeChild(node); }
      }
      insertLineWidgets(cm, lineView, dims);
    }

    // Build a line's DOM representation from scratch
    function buildLineElement(cm, lineView, lineN, dims) {
      var built = getLineContent(cm, lineView);
      lineView.text = lineView.node = built.pre;
      if (built.bgClass) { lineView.bgClass = built.bgClass; }
      if (built.textClass) { lineView.textClass = built.textClass; }

      updateLineClasses(cm, lineView);
      updateLineGutter(cm, lineView, lineN, dims);
      insertLineWidgets(cm, lineView, dims);
      return lineView.node
    }

    // A lineView may contain multiple logical lines (when merged by
    // collapsed spans). The widgets for all of them need to be drawn.
    function insertLineWidgets(cm, lineView, dims) {
      insertLineWidgetsFor(cm, lineView.line, lineView, dims, true);
      if (lineView.rest) { for (var i = 0; i < lineView.rest.length; i++)
        { insertLineWidgetsFor(cm, lineView.rest[i], lineView, dims, false); } }
    }

    function insertLineWidgetsFor(cm, line, lineView, dims, allowAbove) {
      if (!line.widgets) { return }
      var wrap = ensureLineWrapped(lineView);
      for (var i = 0, ws = line.widgets; i < ws.length; ++i) {
        var widget = ws[i], node = elt("div", [widget.node], "CodeMirror-linewidget");
        if (!widget.handleMouseEvents) { node.setAttribute("cm-ignore-events", "true"); }
        positionLineWidget(widget, node, lineView, dims);
        cm.display.input.setUneditable(node);
        if (allowAbove && widget.above)
          { wrap.insertBefore(node, lineView.gutter || lineView.text); }
        else
          { wrap.appendChild(node); }
        signalLater(widget, "redraw");
      }
    }

    function positionLineWidget(widget, node, lineView, dims) {
      if (widget.noHScroll) {
    (lineView.alignable || (lineView.alignable = [])).push(node);
        var width = dims.wrapperWidth;
        node.style.left = dims.fixedPos + "px";
        if (!widget.coverGutter) {
          width -= dims.gutterTotalWidth;
          node.style.paddingLeft = dims.gutterTotalWidth + "px";
        }
        node.style.width = width + "px";
      }
      if (widget.coverGutter) {
        node.style.zIndex = 5;
        node.style.position = "relative";
        if (!widget.noHScroll) { node.style.marginLeft = -dims.gutterTotalWidth + "px"; }
      }
    }

    function widgetHeight(widget) {
      if (widget.height != null) { return widget.height }
      var cm = widget.doc.cm;
      if (!cm) { return 0 }
      if (!contains(document.body, widget.node)) {
        var parentStyle = "position: relative;";
        if (widget.coverGutter)
          { parentStyle += "margin-left: -" + cm.display.gutters.offsetWidth + "px;"; }
        if (widget.noHScroll)
          { parentStyle += "width: " + cm.display.wrapper.clientWidth + "px;"; }
        removeChildrenAndAdd(cm.display.measure, elt("div", [widget.node], null, parentStyle));
      }
      return widget.height = widget.node.parentNode.offsetHeight
    }

    // Return true when the given mouse event happened in a widget
    function eventInWidget(display, e) {
      for (var n = e_target(e); n != display.wrapper; n = n.parentNode) {
        if (!n || (n.nodeType == 1 && n.getAttribute("cm-ignore-events") == "true") ||
            (n.parentNode == display.sizer && n != display.mover))
          { return true }
      }
    }

    // POSITION MEASUREMENT

    function paddingTop(display) {return display.lineSpace.offsetTop}
    function paddingVert(display) {return display.mover.offsetHeight - display.lineSpace.offsetHeight}
    function paddingH(display) {
      if (display.cachedPaddingH) { return display.cachedPaddingH }
      var e = removeChildrenAndAdd(display.measure, elt("pre", "x"));
      var style = window.getComputedStyle ? window.getComputedStyle(e) : e.currentStyle;
      var data = {left: parseInt(style.paddingLeft), right: parseInt(style.paddingRight)};
      if (!isNaN(data.left) && !isNaN(data.right)) { display.cachedPaddingH = data; }
      return data
    }

    function scrollGap(cm) { return scrollerGap - cm.display.nativeBarWidth }
    function displayWidth(cm) {
      return cm.display.scroller.clientWidth - scrollGap(cm) - cm.display.barWidth
    }
    function displayHeight(cm) {
      return cm.display.scroller.clientHeight - scrollGap(cm) - cm.display.barHeight
    }

    // Ensure the lineView.wrapping.heights array is populated. This is
    // an array of bottom offsets for the lines that make up a drawn
    // line. When lineWrapping is on, there might be more than one
    // height.
    function ensureLineHeights(cm, lineView, rect) {
      var wrapping = cm.options.lineWrapping;
      var curWidth = wrapping && displayWidth(cm);
      if (!lineView.measure.heights || wrapping && lineView.measure.width != curWidth) {
        var heights = lineView.measure.heights = [];
        if (wrapping) {
          lineView.measure.width = curWidth;
          var rects = lineView.text.firstChild.getClientRects();
          for (var i = 0; i < rects.length - 1; i++) {
            var cur = rects[i], next = rects[i + 1];
            if (Math.abs(cur.bottom - next.bottom) > 2)
              { heights.push((cur.bottom + next.top) / 2 - rect.top); }
          }
        }
        heights.push(rect.bottom - rect.top);
      }
    }

    // Find a line map (mapping character offsets to text nodes) and a
    // measurement cache for the given line number. (A line view might
    // contain multiple lines when collapsed ranges are present.)
    function mapFromLineView(lineView, line, lineN) {
      if (lineView.line == line)
        { return {map: lineView.measure.map, cache: lineView.measure.cache} }
      for (var i = 0; i < lineView.rest.length; i++)
        { if (lineView.rest[i] == line)
          { return {map: lineView.measure.maps[i], cache: lineView.measure.caches[i]} } }
      for (var i$1 = 0; i$1 < lineView.rest.length; i$1++)
        { if (lineNo(lineView.rest[i$1]) > lineN)
          { return {map: lineView.measure.maps[i$1], cache: lineView.measure.caches[i$1], before: true} } }
    }

    // Render a line into the hidden node display.externalMeasured. Used
    // when measurement is needed for a line that's not in the viewport.
    function updateExternalMeasurement(cm, line) {
      line = visualLine(line);
      var lineN = lineNo(line);
      var view = cm.display.externalMeasured = new LineView(cm.doc, line, lineN);
      view.lineN = lineN;
      var built = view.built = buildLineContent(cm, view);
      view.text = built.pre;
      removeChildrenAndAdd(cm.display.lineMeasure, built.pre);
      return view
    }

    // Get a {top, bottom, left, right} box (in line-local coordinates)
    // for a given character.
    function measureChar(cm, line, ch, bias) {
      return measureCharPrepared(cm, prepareMeasureForLine(cm, line), ch, bias)
    }

    // Find a line view that corresponds to the given line number.
    function findViewForLine(cm, lineN) {
      if (lineN >= cm.display.viewFrom && lineN < cm.display.viewTo)
        { return cm.display.view[findViewIndex(cm, lineN)] }
      var ext = cm.display.externalMeasured;
      if (ext && lineN >= ext.lineN && lineN < ext.lineN + ext.size)
        { return ext }
    }

    // Measurement can be split in two steps, the set-up work that
    // applies to the whole line, and the measurement of the actual
    // character. Functions like coordsChar, that need to do a lot of
    // measurements in a row, can thus ensure that the set-up work is
    // only done once.
    function prepareMeasureForLine(cm, line) {
      var lineN = lineNo(line);
      var view = findViewForLine(cm, lineN);
      if (view && !view.text) {
        view = null;
      } else if (view && view.changes) {
        updateLineForChanges(cm, view, lineN, getDimensions(cm));
        cm.curOp.forceUpdate = true;
      }
      if (!view)
        { view = updateExternalMeasurement(cm, line); }

      var info = mapFromLineView(view, line, lineN);
      return {
        line: line, view: view, rect: null,
        map: info.map, cache: info.cache, before: info.before,
        hasHeights: false
      }
    }

    // Given a prepared measurement object, measures the position of an
    // actual character (or fetches it from the cache).
    function measureCharPrepared(cm, prepared, ch, bias, varHeight) {
      if (prepared.before) { ch = -1; }
      var key = ch + (bias || ""), found;
      if (prepared.cache.hasOwnProperty(key)) {
        found = prepared.cache[key];
      } else {
        if (!prepared.rect)
          { prepared.rect = prepared.view.text.getBoundingClientRect(); }
        if (!prepared.hasHeights) {
          ensureLineHeights(cm, prepared.view, prepared.rect);
          prepared.hasHeights = true;
        }
        found = measureCharInner(cm, prepared, ch, bias);
        if (!found.bogus) { prepared.cache[key] = found; }
      }
      return {left: found.left, right: found.right,
              top: varHeight ? found.rtop : found.top,
              bottom: varHeight ? found.rbottom : found.bottom}
    }

    var nullRect = {left: 0, right: 0, top: 0, bottom: 0};

    function nodeAndOffsetInLineMap(map$$1, ch, bias) {
      var node, start, end, collapse, mStart, mEnd;
      // First, search the line map for the text node corresponding to,
      // or closest to, the target character.
      for (var i = 0; i < map$$1.length; i += 3) {
        mStart = map$$1[i];
        mEnd = map$$1[i + 1];
        if (ch < mStart) {
          start = 0; end = 1;
          collapse = "left";
        } else if (ch < mEnd) {
          start = ch - mStart;
          end = start + 1;
        } else if (i == map$$1.length - 3 || ch == mEnd && map$$1[i + 3] > ch) {
          end = mEnd - mStart;
          start = end - 1;
          if (ch >= mEnd) { collapse = "right"; }
        }
        if (start != null) {
          node = map$$1[i + 2];
          if (mStart == mEnd && bias == (node.insertLeft ? "left" : "right"))
            { collapse = bias; }
          if (bias == "left" && start == 0)
            { while (i && map$$1[i - 2] == map$$1[i - 3] && map$$1[i - 1].insertLeft) {
              node = map$$1[(i -= 3) + 2];
              collapse = "left";
            } }
          if (bias == "right" && start == mEnd - mStart)
            { while (i < map$$1.length - 3 && map$$1[i + 3] == map$$1[i + 4] && !map$$1[i + 5].insertLeft) {
              node = map$$1[(i += 3) + 2];
              collapse = "right";
            } }
          break
        }
      }
      return {node: node, start: start, end: end, collapse: collapse, coverStart: mStart, coverEnd: mEnd}
    }

    function getUsefulRect(rects, bias) {
      var rect = nullRect;
      if (bias == "left") { for (var i = 0; i < rects.length; i++) {
        if ((rect = rects[i]).left != rect.right) { break }
      } } else { for (var i$1 = rects.length - 1; i$1 >= 0; i$1--) {
        if ((rect = rects[i$1]).left != rect.right) { break }
      } }
      return rect
    }

    function measureCharInner(cm, prepared, ch, bias) {
      var place = nodeAndOffsetInLineMap(prepared.map, ch, bias);
      var node = place.node, start = place.start, end = place.end, collapse = place.collapse;

      var rect;
      if (node.nodeType == 3) { // If it is a text node, use a range to retrieve the coordinates.
        for (var i$1 = 0; i$1 < 4; i$1++) { // Retry a maximum of 4 times when nonsense rectangles are returned
          while (start && isExtendingChar(prepared.line.text.charAt(place.coverStart + start))) { --start; }
          while (place.coverStart + end < place.coverEnd && isExtendingChar(prepared.line.text.charAt(place.coverStart + end))) { ++end; }
          if (ie && ie_version < 9 && start == 0 && end == place.coverEnd - place.coverStart)
            { rect = node.parentNode.getBoundingClientRect(); }
          else
            { rect = getUsefulRect(range(node, start, end).getClientRects(), bias); }
          if (rect.left || rect.right || start == 0) { break }
          end = start;
          start = start - 1;
          collapse = "right";
        }
        if (ie && ie_version < 11) { rect = maybeUpdateRectForZooming(cm.display.measure, rect); }
      } else { // If it is a widget, simply get the box for the whole widget.
        if (start > 0) { collapse = bias = "right"; }
        var rects;
        if (cm.options.lineWrapping && (rects = node.getClientRects()).length > 1)
          { rect = rects[bias == "right" ? rects.length - 1 : 0]; }
        else
          { rect = node.getBoundingClientRect(); }
      }
      if (ie && ie_version < 9 && !start && (!rect || !rect.left && !rect.right)) {
        var rSpan = node.parentNode.getClientRects()[0];
        if (rSpan)
          { rect = {left: rSpan.left, right: rSpan.left + charWidth(cm.display), top: rSpan.top, bottom: rSpan.bottom}; }
        else
          { rect = nullRect; }
      }

      var rtop = rect.top - prepared.rect.top, rbot = rect.bottom - prepared.rect.top;
      var mid = (rtop + rbot) / 2;
      var heights = prepared.view.measure.heights;
      var i = 0;
      for (; i < heights.length - 1; i++)
        { if (mid < heights[i]) { break } }
      var top = i ? heights[i - 1] : 0, bot = heights[i];
      var result = {left: (collapse == "right" ? rect.right : rect.left) - prepared.rect.left,
                    right: (collapse == "left" ? rect.left : rect.right) - prepared.rect.left,
                    top: top, bottom: bot};
      if (!rect.left && !rect.right) { result.bogus = true; }
      if (!cm.options.singleCursorHeightPerLine) { result.rtop = rtop; result.rbottom = rbot; }

      return result
    }

    // Work around problem with bounding client rects on ranges being
    // returned incorrectly when zoomed on IE10 and below.
    function maybeUpdateRectForZooming(measure, rect) {
      if (!window.screen || screen.logicalXDPI == null ||
          screen.logicalXDPI == screen.deviceXDPI || !hasBadZoomedRects(measure))
        { return rect }
      var scaleX = screen.logicalXDPI / screen.deviceXDPI;
      var scaleY = screen.logicalYDPI / screen.deviceYDPI;
      return {left: rect.left * scaleX, right: rect.right * scaleX,
              top: rect.top * scaleY, bottom: rect.bottom * scaleY}
    }

    function clearLineMeasurementCacheFor(lineView) {
      if (lineView.measure) {
        lineView.measure.cache = {};
        lineView.measure.heights = null;
        if (lineView.rest) { for (var i = 0; i < lineView.rest.length; i++)
          { lineView.measure.caches[i] = {}; } }
      }
    }

    function clearLineMeasurementCache(cm) {
      cm.display.externalMeasure = null;
      removeChildren(cm.display.lineMeasure);
      for (var i = 0; i < cm.display.view.length; i++)
        { clearLineMeasurementCacheFor(cm.display.view[i]); }
    }

    function clearCaches(cm) {
      clearLineMeasurementCache(cm);
      cm.display.cachedCharWidth = cm.display.cachedTextHeight = cm.display.cachedPaddingH = null;
      if (!cm.options.lineWrapping) { cm.display.maxLineChanged = true; }
      cm.display.lineNumChars = null;
    }

    function pageScrollX() {
      // Work around https://bugs.chromium.org/p/chromium/issues/detail?id=489206
      // which causes page_Offset and bounding client rects to use
      // different reference viewports and invalidate our calculations.
      if (chrome && android) { return -(document.body.getBoundingClientRect().left - parseInt(getComputedStyle(document.body).marginLeft)) }
      return window.pageXOffset || (document.documentElement || document.body).scrollLeft
    }
    function pageScrollY() {
      if (chrome && android) { return -(document.body.getBoundingClientRect().top - parseInt(getComputedStyle(document.body).marginTop)) }
      return window.pageYOffset || (document.documentElement || document.body).scrollTop
    }

    function widgetTopHeight(lineObj) {
      var height = 0;
      if (lineObj.widgets) { for (var i = 0; i < lineObj.widgets.length; ++i) { if (lineObj.widgets[i].above)
        { height += widgetHeight(lineObj.widgets[i]); } } }
      return height
    }

    // Converts a {top, bottom, left, right} box from line-local
    // coordinates into another coordinate system. Context may be one of
    // "line", "div" (display.lineDiv), "local"./null (editor), "window",
    // or "page".
    function intoCoordSystem(cm, lineObj, rect, context, includeWidgets) {
      if (!includeWidgets) {
        var height = widgetTopHeight(lineObj);
        rect.top += height; rect.bottom += height;
      }
      if (context == "line") { return rect }
      if (!context) { context = "local"; }
      var yOff = heightAtLine(lineObj);
      if (context == "local") { yOff += paddingTop(cm.display); }
      else { yOff -= cm.display.viewOffset; }
      if (context == "page" || context == "window") {
        var lOff = cm.display.lineSpace.getBoundingClientRect();
        yOff += lOff.top + (context == "window" ? 0 : pageScrollY());
        var xOff = lOff.left + (context == "window" ? 0 : pageScrollX());
        rect.left += xOff; rect.right += xOff;
      }
      rect.top += yOff; rect.bottom += yOff;
      return rect
    }

    // Coverts a box from "div" coords to another coordinate system.
    // Context may be "window", "page", "div", or "local"./null.
    function fromCoordSystem(cm, coords, context) {
      if (context == "div") { return coords }
      var left = coords.left, top = coords.top;
      // First move into "page" coordinate system
      if (context == "page") {
        left -= pageScrollX();
        top -= pageScrollY();
      } else if (context == "local" || !context) {
        var localBox = cm.display.sizer.getBoundingClientRect();
        left += localBox.left;
        top += localBox.top;
      }

      var lineSpaceBox = cm.display.lineSpace.getBoundingClientRect();
      return {left: left - lineSpaceBox.left, top: top - lineSpaceBox.top}
    }

    function charCoords(cm, pos, context, lineObj, bias) {
      if (!lineObj) { lineObj = getLine(cm.doc, pos.line); }
      return intoCoordSystem(cm, lineObj, measureChar(cm, lineObj, pos.ch, bias), context)
    }

    // Returns a box for a given cursor position, which may have an
    // 'other' property containing the position of the secondary cursor
    // on a bidi boundary.
    // A cursor Pos(line, char, "before") is on the same visual line as `char - 1`
    // and after `char - 1` in writing order of `char - 1`
    // A cursor Pos(line, char, "after") is on the same visual line as `char`
    // and before `char` in writing order of `char`
    // Examples (upper-case letters are RTL, lower-case are LTR):
    //     Pos(0, 1, ...)
    //     before   after
    // ab     a|b     a|b
    // aB     a|B     aB|
    // Ab     |Ab     A|b
    // AB     B|A     B|A
    // Every position after the last character on a line is considered to stick
    // to the last character on the line.
    function cursorCoords(cm, pos, context, lineObj, preparedMeasure, varHeight) {
      lineObj = lineObj || getLine(cm.doc, pos.line);
      if (!preparedMeasure) { preparedMeasure = prepareMeasureForLine(cm, lineObj); }
      function get(ch, right) {
        var m = measureCharPrepared(cm, preparedMeasure, ch, right ? "right" : "left", varHeight);
        if (right) { m.left = m.right; } else { m.right = m.left; }
        return intoCoordSystem(cm, lineObj, m, context)
      }
      var order = getOrder(lineObj, cm.doc.direction), ch = pos.ch, sticky = pos.sticky;
      if (ch >= lineObj.text.length) {
        ch = lineObj.text.length;
        sticky = "before";
      } else if (ch <= 0) {
        ch = 0;
        sticky = "after";
      }
      if (!order) { return get(sticky == "before" ? ch - 1 : ch, sticky == "before") }

      function getBidi(ch, partPos, invert) {
        var part = order[partPos], right = part.level == 1;
        return get(invert ? ch - 1 : ch, right != invert)
      }
      var partPos = getBidiPartAt(order, ch, sticky);
      var other = bidiOther;
      var val = getBidi(ch, partPos, sticky == "before");
      if (other != null) { val.other = getBidi(ch, other, sticky != "before"); }
      return val
    }

    // Used to cheaply estimate the coordinates for a position. Used for
    // intermediate scroll updates.
    function estimateCoords(cm, pos) {
      var left = 0;
      pos = clipPos(cm.doc, pos);
      if (!cm.options.lineWrapping) { left = charWidth(cm.display) * pos.ch; }
      var lineObj = getLine(cm.doc, pos.line);
      var top = heightAtLine(lineObj) + paddingTop(cm.display);
      return {left: left, right: left, top: top, bottom: top + lineObj.height}
    }

    // Positions returned by coordsChar contain some extra information.
    // xRel is the relative x position of the input coordinates compared
    // to the found position (so xRel > 0 means the coordinates are to
    // the right of the character position, for example). When outside
    // is true, that means the coordinates lie outside the line's
    // vertical range.
    function PosWithInfo(line, ch, sticky, outside, xRel) {
      var pos = Pos(line, ch, sticky);
      pos.xRel = xRel;
      if (outside) { pos.outside = true; }
      return pos
    }

    // Compute the character position closest to the given coordinates.
    // Input must be lineSpace-local ("div" coordinate system).
    function coordsChar(cm, x, y) {
      var doc = cm.doc;
      y += cm.display.viewOffset;
      if (y < 0) { return PosWithInfo(doc.first, 0, null, true, -1) }
      var lineN = lineAtHeight(doc, y), last = doc.first + doc.size - 1;
      if (lineN > last)
        { return PosWithInfo(doc.first + doc.size - 1, getLine(doc, last).text.length, null, true, 1) }
      if (x < 0) { x = 0; }

      var lineObj = getLine(doc, lineN);
      for (;;) {
        var found = coordsCharInner(cm, lineObj, lineN, x, y);
        var collapsed = collapsedSpanAround(lineObj, found.ch + (found.xRel > 0 ? 1 : 0));
        if (!collapsed) { return found }
        var rangeEnd = collapsed.find(1);
        if (rangeEnd.line == lineN) { return rangeEnd }
        lineObj = getLine(doc, lineN = rangeEnd.line);
      }
    }

    function wrappedLineExtent(cm, lineObj, preparedMeasure, y) {
      y -= widgetTopHeight(lineObj);
      var end = lineObj.text.length;
      var begin = findFirst(function (ch) { return measureCharPrepared(cm, preparedMeasure, ch - 1).bottom <= y; }, end, 0);
      end = findFirst(function (ch) { return measureCharPrepared(cm, preparedMeasure, ch).top > y; }, begin, end);
      return {begin: begin, end: end}
    }

    function wrappedLineExtentChar(cm, lineObj, preparedMeasure, target) {
      if (!preparedMeasure) { preparedMeasure = prepareMeasureForLine(cm, lineObj); }
      var targetTop = intoCoordSystem(cm, lineObj, measureCharPrepared(cm, preparedMeasure, target), "line").top;
      return wrappedLineExtent(cm, lineObj, preparedMeasure, targetTop)
    }

    // Returns true if the given side of a box is after the given
    // coordinates, in top-to-bottom, left-to-right order.
    function boxIsAfter(box, x, y, left) {
      return box.bottom <= y ? false : box.top > y ? true : (left ? box.left : box.right) > x
    }

    function coordsCharInner(cm, lineObj, lineNo$$1, x, y) {
      // Move y into line-local coordinate space
      y -= heightAtLine(lineObj);
      var preparedMeasure = prepareMeasureForLine(cm, lineObj);
      // When directly calling `measureCharPrepared`, we have to adjust
      // for the widgets at this line.
      var widgetHeight$$1 = widgetTopHeight(lineObj);
      var begin = 0, end = lineObj.text.length, ltr = true;

      var order = getOrder(lineObj, cm.doc.direction);
      // If the line isn't plain left-to-right text, first figure out
      // which bidi section the coordinates fall into.
      if (order) {
        var part = (cm.options.lineWrapping ? coordsBidiPartWrapped : coordsBidiPart)
                     (cm, lineObj, lineNo$$1, preparedMeasure, order, x, y);
        ltr = part.level != 1;
        // The awkward -1 offsets are needed because findFirst (called
        // on these below) will treat its first bound as inclusive,
        // second as exclusive, but we want to actually address the
        // characters in the part's range
        begin = ltr ? part.from : part.to - 1;
        end = ltr ? part.to : part.from - 1;
      }

      // A binary search to find the first character whose bounding box
      // starts after the coordinates. If we run across any whose box wrap
      // the coordinates, store that.
      var chAround = null, boxAround = null;
      var ch = findFirst(function (ch) {
        var box = measureCharPrepared(cm, preparedMeasure, ch);
        box.top += widgetHeight$$1; box.bottom += widgetHeight$$1;
        if (!boxIsAfter(box, x, y, false)) { return false }
        if (box.top <= y && box.left <= x) {
          chAround = ch;
          boxAround = box;
        }
        return true
      }, begin, end);

      var baseX, sticky, outside = false;
      // If a box around the coordinates was found, use that
      if (boxAround) {
        // Distinguish coordinates nearer to the left or right side of the box
        var atLeft = x - boxAround.left < boxAround.right - x, atStart = atLeft == ltr;
        ch = chAround + (atStart ? 0 : 1);
        sticky = atStart ? "after" : "before";
        baseX = atLeft ? boxAround.left : boxAround.right;
      } else {
        // (Adjust for extended bound, if necessary.)
        if (!ltr && (ch == end || ch == begin)) { ch++; }
        // To determine which side to associate with, get the box to the
        // left of the character and compare it's vertical position to the
        // coordinates
        sticky = ch == 0 ? "after" : ch == lineObj.text.length ? "before" :
          (measureCharPrepared(cm, preparedMeasure, ch - (ltr ? 1 : 0)).bottom + widgetHeight$$1 <= y) == ltr ?
          "after" : "before";
        // Now get accurate coordinates for this place, in order to get a
        // base X position
        var coords = cursorCoords(cm, Pos(lineNo$$1, ch, sticky), "line", lineObj, preparedMeasure);
        baseX = coords.left;
        outside = y < coords.top || y >= coords.bottom;
      }

      ch = skipExtendingChars(lineObj.text, ch, 1);
      return PosWithInfo(lineNo$$1, ch, sticky, outside, x - baseX)
    }

    function coordsBidiPart(cm, lineObj, lineNo$$1, preparedMeasure, order, x, y) {
      // Bidi parts are sorted left-to-right, and in a non-line-wrapping
      // situation, we can take this ordering to correspond to the visual
      // ordering. This finds the first part whose end is after the given
      // coordinates.
      var index = findFirst(function (i) {
        var part = order[i], ltr = part.level != 1;
        return boxIsAfter(cursorCoords(cm, Pos(lineNo$$1, ltr ? part.to : part.from, ltr ? "before" : "after"),
                                       "line", lineObj, preparedMeasure), x, y, true)
      }, 0, order.length - 1);
      var part = order[index];
      // If this isn't the first part, the part's start is also after
      // the coordinates, and the coordinates aren't on the same line as
      // that start, move one part back.
      if (index > 0) {
        var ltr = part.level != 1;
        var start = cursorCoords(cm, Pos(lineNo$$1, ltr ? part.from : part.to, ltr ? "after" : "before"),
                                 "line", lineObj, preparedMeasure);
        if (boxIsAfter(start, x, y, true) && start.top > y)
          { part = order[index - 1]; }
      }
      return part
    }

    function coordsBidiPartWrapped(cm, lineObj, _lineNo, preparedMeasure, order, x, y) {
      // In a wrapped line, rtl text on wrapping boundaries can do things
      // that don't correspond to the ordering in our `order` array at
      // all, so a binary search doesn't work, and we want to return a
      // part that only spans one line so that the binary search in
      // coordsCharInner is safe. As such, we first find the extent of the
      // wrapped line, and then do a flat search in which we discard any
      // spans that aren't on the line.
      var ref = wrappedLineExtent(cm, lineObj, preparedMeasure, y);
      var begin = ref.begin;
      var end = ref.end;
      if (/\s/.test(lineObj.text.charAt(end - 1))) { end--; }
      var part = null, closestDist = null;
      for (var i = 0; i < order.length; i++) {
        var p = order[i];
        if (p.from >= end || p.to <= begin) { continue }
        var ltr = p.level != 1;
        var endX = measureCharPrepared(cm, preparedMeasure, ltr ? Math.min(end, p.to) - 1 : Math.max(begin, p.from)).right;
        // Weigh against spans ending before this, so that they are only
        // picked if nothing ends after
        var dist = endX < x ? x - endX + 1e9 : endX - x;
        if (!part || closestDist > dist) {
          part = p;
          closestDist = dist;
        }
      }
      if (!part) { part = order[order.length - 1]; }
      // Clip the part to the wrapped line.
      if (part.from < begin) { part = {from: begin, to: part.to, level: part.level}; }
      if (part.to > end) { part = {from: part.from, to: end, level: part.level}; }
      return part
    }

    var measureText;
    // Compute the default text height.
    function textHeight(display) {
      if (display.cachedTextHeight != null) { return display.cachedTextHeight }
      if (measureText == null) {
        measureText = elt("pre");
        // Measure a bunch of lines, for browsers that compute
        // fractional heights.
        for (var i = 0; i < 49; ++i) {
          measureText.appendChild(document.createTextNode("x"));
          measureText.appendChild(elt("br"));
        }
        measureText.appendChild(document.createTextNode("x"));
      }
      removeChildrenAndAdd(display.measure, measureText);
      var height = measureText.offsetHeight / 50;
      if (height > 3) { display.cachedTextHeight = height; }
      removeChildren(display.measure);
      return height || 1
    }

    // Compute the default character width.
    function charWidth(display) {
      if (display.cachedCharWidth != null) { return display.cachedCharWidth }
      var anchor = elt("span", "xxxxxxxxxx");
      var pre = elt("pre", [anchor]);
      removeChildrenAndAdd(display.measure, pre);
      var rect = anchor.getBoundingClientRect(), width = (rect.right - rect.left) / 10;
      if (width > 2) { display.cachedCharWidth = width; }
      return width || 10
    }

    // Do a bulk-read of the DOM positions and sizes needed to draw the
    // view, so that we don't interleave reading and writing to the DOM.
    function getDimensions(cm) {
      var d = cm.display, left = {}, width = {};
      var gutterLeft = d.gutters.clientLeft;
      for (var n = d.gutters.firstChild, i = 0; n; n = n.nextSibling, ++i) {
        left[cm.options.gutters[i]] = n.offsetLeft + n.clientLeft + gutterLeft;
        width[cm.options.gutters[i]] = n.clientWidth;
      }
      return {fixedPos: compensateForHScroll(d),
              gutterTotalWidth: d.gutters.offsetWidth,
              gutterLeft: left,
              gutterWidth: width,
              wrapperWidth: d.wrapper.clientWidth}
    }

    // Computes display.scroller.scrollLeft + display.gutters.offsetWidth,
    // but using getBoundingClientRect to get a sub-pixel-accurate
    // result.
    function compensateForHScroll(display) {
      return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left
    }

    // Returns a function that estimates the height of a line, to use as
    // first approximation until the line becomes visible (and is thus
    // properly measurable).
    function estimateHeight(cm) {
      var th = textHeight(cm.display), wrapping = cm.options.lineWrapping;
      var perLine = wrapping && Math.max(5, cm.display.scroller.clientWidth / charWidth(cm.display) - 3);
      return function (line) {
        if (lineIsHidden(cm.doc, line)) { return 0 }

        var widgetsHeight = 0;
        if (line.widgets) { for (var i = 0; i < line.widgets.length; i++) {
          if (line.widgets[i].height) { widgetsHeight += line.widgets[i].height; }
        } }

        if (wrapping)
          { return widgetsHeight + (Math.ceil(line.text.length / perLine) || 1) * th }
        else
          { return widgetsHeight + th }
      }
    }

    function estimateLineHeights(cm) {
      var doc = cm.doc, est = estimateHeight(cm);
      doc.iter(function (line) {
        var estHeight = est(line);
        if (estHeight != line.height) { updateLineHeight(line, estHeight); }
      });
    }

    // Given a mouse event, find the corresponding position. If liberal
    // is false, it checks whether a gutter or scrollbar was clicked,
    // and returns null if it was. forRect is used by rectangular
    // selections, and tries to estimate a character position even for
    // coordinates beyond the right of the text.
    function posFromMouse(cm, e, liberal, forRect) {
      var display = cm.display;
      if (!liberal && e_target(e).getAttribute("cm-not-content") == "true") { return null }

      var x, y, space = display.lineSpace.getBoundingClientRect();
      // Fails unpredictably on IE[67] when mouse is dragged around quickly.
      try { x = e.clientX - space.left; y = e.clientY - space.top; }
      catch (e) { return null }
      var coords = coordsChar(cm, x, y), line;
      if (forRect && coords.xRel == 1 && (line = getLine(cm.doc, coords.line).text).length == coords.ch) {
        var colDiff = countColumn(line, line.length, cm.options.tabSize) - line.length;
        coords = Pos(coords.line, Math.max(0, Math.round((x - paddingH(cm.display).left) / charWidth(cm.display)) - colDiff));
      }
      return coords
    }

    // Find the view element corresponding to a given line. Return null
    // when the line isn't visible.
    function findViewIndex(cm, n) {
      if (n >= cm.display.viewTo) { return null }
      n -= cm.display.viewFrom;
      if (n < 0) { return null }
      var view = cm.display.view;
      for (var i = 0; i < view.length; i++) {
        n -= view[i].size;
        if (n < 0) { return i }
      }
    }

    function updateSelection(cm) {
      cm.display.input.showSelection(cm.display.input.prepareSelection());
    }

    function prepareSelection(cm, primary) {
      if ( primary === void 0 ) primary = true;

      var doc = cm.doc, result = {};
      var curFragment = result.cursors = document.createDocumentFragment();
      var selFragment = result.selection = document.createDocumentFragment();

      for (var i = 0; i < doc.sel.ranges.length; i++) {
        if (!primary && i == doc.sel.primIndex) { continue }
        var range$$1 = doc.sel.ranges[i];
        if (range$$1.from().line >= cm.display.viewTo || range$$1.to().line < cm.display.viewFrom) { continue }
        var collapsed = range$$1.empty();
        if (collapsed || cm.options.showCursorWhenSelecting)
          { drawSelectionCursor(cm, range$$1.head, curFragment); }
        if (!collapsed)
          { drawSelectionRange(cm, range$$1, selFragment); }
      }
      return result
    }

    // Draws a cursor for the given range
    function drawSelectionCursor(cm, head, output) {
      var pos = cursorCoords(cm, head, "div", null, null, !cm.options.singleCursorHeightPerLine);

      var cursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor"));
      cursor.style.left = pos.left + "px";
      cursor.style.top = pos.top + "px";
      cursor.style.height = Math.max(0, pos.bottom - pos.top) * cm.options.cursorHeight + "px";

      if (pos.other) {
        // Secondary cursor, shown when on a 'jump' in bi-directional text
        var otherCursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor CodeMirror-secondarycursor"));
        otherCursor.style.display = "";
        otherCursor.style.left = pos.other.left + "px";
        otherCursor.style.top = pos.other.top + "px";
        otherCursor.style.height = (pos.other.bottom - pos.other.top) * .85 + "px";
      }
    }

    function cmpCoords(a, b) { return a.top - b.top || a.left - b.left }

    // Draws the given range as a highlighted selection
    function drawSelectionRange(cm, range$$1, output) {
      var display = cm.display, doc = cm.doc;
      var fragment = document.createDocumentFragment();
      var padding = paddingH(cm.display), leftSide = padding.left;
      var rightSide = Math.max(display.sizerWidth, displayWidth(cm) - display.sizer.offsetLeft) - padding.right;
      var docLTR = doc.direction == "ltr";

      function add(left, top, width, bottom) {
        if (top < 0) { top = 0; }
        top = Math.round(top);
        bottom = Math.round(bottom);
        fragment.appendChild(elt("div", null, "CodeMirror-selected", ("position: absolute; left: " + left + "px;\n                             top: " + top + "px; width: " + (width == null ? rightSide - left : width) + "px;\n                             height: " + (bottom - top) + "px")));
      }

      function drawForLine(line, fromArg, toArg) {
        var lineObj = getLine(doc, line);
        var lineLen = lineObj.text.length;
        var start, end;
        function coords(ch, bias) {
          return charCoords(cm, Pos(line, ch), "div", lineObj, bias)
        }

        function wrapX(pos, dir, side) {
          var extent = wrappedLineExtentChar(cm, lineObj, null, pos);
          var prop = (dir == "ltr") == (side == "after") ? "left" : "right";
          var ch = side == "after" ? extent.begin : extent.end - (/\s/.test(lineObj.text.charAt(extent.end - 1)) ? 2 : 1);
          return coords(ch, prop)[prop]
        }

        var order = getOrder(lineObj, doc.direction);
        iterateBidiSections(order, fromArg || 0, toArg == null ? lineLen : toArg, function (from, to, dir, i) {
          var ltr = dir == "ltr";
          var fromPos = coords(from, ltr ? "left" : "right");
          var toPos = coords(to - 1, ltr ? "right" : "left");

          var openStart = fromArg == null && from == 0, openEnd = toArg == null && to == lineLen;
          var first = i == 0, last = !order || i == order.length - 1;
          if (toPos.top - fromPos.top <= 3) { // Single line
            var openLeft = (docLTR ? openStart : openEnd) && first;
            var openRight = (docLTR ? openEnd : openStart) && last;
            var left = openLeft ? leftSide : (ltr ? fromPos : toPos).left;
            var right = openRight ? rightSide : (ltr ? toPos : fromPos).right;
            add(left, fromPos.top, right - left, fromPos.bottom);
          } else { // Multiple lines
            var topLeft, topRight, botLeft, botRight;
            if (ltr) {
              topLeft = docLTR && openStart && first ? leftSide : fromPos.left;
              topRight = docLTR ? rightSide : wrapX(from, dir, "before");
              botLeft = docLTR ? leftSide : wrapX(to, dir, "after");
              botRight = docLTR && openEnd && last ? rightSide : toPos.right;
            } else {
              topLeft = !docLTR ? leftSide : wrapX(from, dir, "before");
              topRight = !docLTR && openStart && first ? rightSide : fromPos.right;
              botLeft = !docLTR && openEnd && last ? leftSide : toPos.left;
              botRight = !docLTR ? rightSide : wrapX(to, dir, "after");
            }
            add(topLeft, fromPos.top, topRight - topLeft, fromPos.bottom);
            if (fromPos.bottom < toPos.top) { add(leftSide, fromPos.bottom, null, toPos.top); }
            add(botLeft, toPos.top, botRight - botLeft, toPos.bottom);
          }

          if (!start || cmpCoords(fromPos, start) < 0) { start = fromPos; }
          if (cmpCoords(toPos, start) < 0) { start = toPos; }
          if (!end || cmpCoords(fromPos, end) < 0) { end = fromPos; }
          if (cmpCoords(toPos, end) < 0) { end = toPos; }
        });
        return {start: start, end: end}
      }

      var sFrom = range$$1.from(), sTo = range$$1.to();
      if (sFrom.line == sTo.line) {
        drawForLine(sFrom.line, sFrom.ch, sTo.ch);
      } else {
        var fromLine = getLine(doc, sFrom.line), toLine = getLine(doc, sTo.line);
        var singleVLine = visualLine(fromLine) == visualLine(toLine);
        var leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end;
        var rightStart = drawForLine(sTo.line, singleVLine ? 0 : null, sTo.ch).start;
        if (singleVLine) {
          if (leftEnd.top < rightStart.top - 2) {
            add(leftEnd.right, leftEnd.top, null, leftEnd.bottom);
            add(leftSide, rightStart.top, rightStart.left, rightStart.bottom);
          } else {
            add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom);
          }
        }
        if (leftEnd.bottom < rightStart.top)
          { add(leftSide, leftEnd.bottom, null, rightStart.top); }
      }

      output.appendChild(fragment);
    }

    // Cursor-blinking
    function restartBlink(cm) {
      if (!cm.state.focused) { return }
      var display = cm.display;
      clearInterval(display.blinker);
      var on = true;
      display.cursorDiv.style.visibility = "";
      if (cm.options.cursorBlinkRate > 0)
        { display.blinker = setInterval(function () { return display.cursorDiv.style.visibility = (on = !on) ? "" : "hidden"; },
          cm.options.cursorBlinkRate); }
      else if (cm.options.cursorBlinkRate < 0)
        { display.cursorDiv.style.visibility = "hidden"; }
    }

    function ensureFocus(cm) {
      if (!cm.state.focused) { cm.display.input.focus(); onFocus(cm); }
    }

    function delayBlurEvent(cm) {
      cm.state.delayingBlurEvent = true;
      setTimeout(function () { if (cm.state.delayingBlurEvent) {
        cm.state.delayingBlurEvent = false;
        onBlur(cm);
      } }, 100);
    }

    function onFocus(cm, e) {
      if (cm.state.delayingBlurEvent) { cm.state.delayingBlurEvent = false; }

      if (cm.options.readOnly == "nocursor") { return }
      if (!cm.state.focused) {
        signal(cm, "focus", cm, e);
        cm.state.focused = true;
        addClass(cm.display.wrapper, "CodeMirror-focused");
        // This test prevents this from firing when a context
        // menu is closed (since the input reset would kill the
        // select-all detection hack)
        if (!cm.curOp && cm.display.selForContextMenu != cm.doc.sel) {
          cm.display.input.reset();
          if (webkit) { setTimeout(function () { return cm.display.input.reset(true); }, 20); } // Issue #1730
        }
        cm.display.input.receivedFocus();
      }
      restartBlink(cm);
    }
    function onBlur(cm, e) {
      if (cm.state.delayingBlurEvent) { return }

      if (cm.state.focused) {
        signal(cm, "blur", cm, e);
        cm.state.focused = false;
        rmClass(cm.display.wrapper, "CodeMirror-focused");
      }
      clearInterval(cm.display.blinker);
      setTimeout(function () { if (!cm.state.focused) { cm.display.shift = false; } }, 150);
    }

    // Read the actual heights of the rendered lines, and update their
    // stored heights to match.
    function updateHeightsInViewport(cm) {
      var display = cm.display;
      var prevBottom = display.lineDiv.offsetTop;
      for (var i = 0; i < display.view.length; i++) {
        var cur = display.view[i], wrapping = cm.options.lineWrapping;
        var height = (void 0), width = 0;
        if (cur.hidden) { continue }
        if (ie && ie_version < 8) {
          var bot = cur.node.offsetTop + cur.node.offsetHeight;
          height = bot - prevBottom;
          prevBottom = bot;
        } else {
          var box = cur.node.getBoundingClientRect();
          height = box.bottom - box.top;
          // Check that lines don't extend past the right of the current
          // editor width
          if (!wrapping && cur.text.firstChild)
            { width = cur.text.firstChild.getBoundingClientRect().right - box.left - 1; }
        }
        var diff = cur.line.height - height;
        if (height < 2) { height = textHeight(display); }
        if (diff > .005 || diff < -.005) {
          updateLineHeight(cur.line, height);
          updateWidgetHeight(cur.line);
          if (cur.rest) { for (var j = 0; j < cur.rest.length; j++)
            { updateWidgetHeight(cur.rest[j]); } }
        }
        if (width > cm.display.sizerWidth) {
          var chWidth = Math.ceil(width / charWidth(cm.display));
          if (chWidth > cm.display.maxLineLength) {
            cm.display.maxLineLength = chWidth;
            cm.display.maxLine = cur.line;
            cm.display.maxLineChanged = true;
          }
        }
      }
    }

    // Read and store the height of line widgets associated with the
    // given line.
    function updateWidgetHeight(line) {
      if (line.widgets) { for (var i = 0; i < line.widgets.length; ++i) {
        var w = line.widgets[i], parent = w.node.parentNode;
        if (parent) { w.height = parent.offsetHeight; }
      } }
    }

    // Compute the lines that are visible in a given viewport (defaults
    // the the current scroll position). viewport may contain top,
    // height, and ensure (see op.scrollToPos) properties.
    function visibleLines(display, doc, viewport) {
      var top = viewport && viewport.top != null ? Math.max(0, viewport.top) : display.scroller.scrollTop;
      top = Math.floor(top - paddingTop(display));
      var bottom = viewport && viewport.bottom != null ? viewport.bottom : top + display.wrapper.clientHeight;

      var from = lineAtHeight(doc, top), to = lineAtHeight(doc, bottom);
      // Ensure is a {from: {line, ch}, to: {line, ch}} object, and
      // forces those lines into the viewport (if possible).
      if (viewport && viewport.ensure) {
        var ensureFrom = viewport.ensure.from.line, ensureTo = viewport.ensure.to.line;
        if (ensureFrom < from) {
          from = ensureFrom;
          to = lineAtHeight(doc, heightAtLine(getLine(doc, ensureFrom)) + display.wrapper.clientHeight);
        } else if (Math.min(ensureTo, doc.lastLine()) >= to) {
          from = lineAtHeight(doc, heightAtLine(getLine(doc, ensureTo)) - display.wrapper.clientHeight);
          to = ensureTo;
        }
      }
      return {from: from, to: Math.max(to, from + 1)}
    }

    // Re-align line numbers and gutter marks to compensate for
    // horizontal scrolling.
    function alignHorizontally(cm) {
      var display = cm.display, view = display.view;
      if (!display.alignWidgets && (!display.gutters.firstChild || !cm.options.fixedGutter)) { return }
      var comp = compensateForHScroll(display) - display.scroller.scrollLeft + cm.doc.scrollLeft;
      var gutterW = display.gutters.offsetWidth, left = comp + "px";
      for (var i = 0; i < view.length; i++) { if (!view[i].hidden) {
        if (cm.options.fixedGutter) {
          if (view[i].gutter)
            { view[i].gutter.style.left = left; }
          if (view[i].gutterBackground)
            { view[i].gutterBackground.style.left = left; }
        }
        var align = view[i].alignable;
        if (align) { for (var j = 0; j < align.length; j++)
          { align[j].style.left = left; } }
      } }
      if (cm.options.fixedGutter)
        { display.gutters.style.left = (comp + gutterW) + "px"; }
    }

    // Used to ensure that the line number gutter is still the right
    // size for the current document size. Returns true when an update
    // is needed.
    function maybeUpdateLineNumberWidth(cm) {
      if (!cm.options.lineNumbers) { return false }
      var doc = cm.doc, last = lineNumberFor(cm.options, doc.first + doc.size - 1), display = cm.display;
      if (last.length != display.lineNumChars) {
        var test = display.measure.appendChild(elt("div", [elt("div", last)],
                                                   "CodeMirror-linenumber CodeMirror-gutter-elt"));
        var innerW = test.firstChild.offsetWidth, padding = test.offsetWidth - innerW;
        display.lineGutter.style.width = "";
        display.lineNumInnerWidth = Math.max(innerW, display.lineGutter.offsetWidth - padding) + 1;
        display.lineNumWidth = display.lineNumInnerWidth + padding;
        display.lineNumChars = display.lineNumInnerWidth ? last.length : -1;
        display.lineGutter.style.width = display.lineNumWidth + "px";
        updateGutterSpace(cm);
        return true
      }
      return false
    }

    // SCROLLING THINGS INTO VIEW

    // If an editor sits on the top or bottom of the window, partially
    // scrolled out of view, this ensures that the cursor is visible.
    function maybeScrollWindow(cm, rect) {
      if (signalDOMEvent(cm, "scrollCursorIntoView")) { return }

      var display = cm.display, box = display.sizer.getBoundingClientRect(), doScroll = null;
      if (rect.top + box.top < 0) { doScroll = true; }
      else if (rect.bottom + box.top > (window.innerHeight || document.documentElement.clientHeight)) { doScroll = false; }
      if (doScroll != null && !phantom) {
        var scrollNode = elt("div", "\u200b", null, ("position: absolute;\n                         top: " + (rect.top - display.viewOffset - paddingTop(cm.display)) + "px;\n                         height: " + (rect.bottom - rect.top + scrollGap(cm) + display.barHeight) + "px;\n                         left: " + (rect.left) + "px; width: " + (Math.max(2, rect.right - rect.left)) + "px;"));
        cm.display.lineSpace.appendChild(scrollNode);
        scrollNode.scrollIntoView(doScroll);
        cm.display.lineSpace.removeChild(scrollNode);
      }
    }

    // Scroll a given position into view (immediately), verifying that
    // it actually became visible (as line heights are accurately
    // measured, the position of something may 'drift' during drawing).
    function scrollPosIntoView(cm, pos, end, margin) {
      if (margin == null) { margin = 0; }
      var rect;
      if (!cm.options.lineWrapping && pos == end) {
        // Set pos and end to the cursor positions around the character pos sticks to
        // If pos.sticky == "before", that is around pos.ch - 1, otherwise around pos.ch
        // If pos == Pos(_, 0, "before"), pos and end are unchanged
        pos = pos.ch ? Pos(pos.line, pos.sticky == "before" ? pos.ch - 1 : pos.ch, "after") : pos;
        end = pos.sticky == "before" ? Pos(pos.line, pos.ch + 1, "before") : pos;
      }
      for (var limit = 0; limit < 5; limit++) {
        var changed = false;
        var coords = cursorCoords(cm, pos);
        var endCoords = !end || end == pos ? coords : cursorCoords(cm, end);
        rect = {left: Math.min(coords.left, endCoords.left),
                top: Math.min(coords.top, endCoords.top) - margin,
                right: Math.max(coords.left, endCoords.left),
                bottom: Math.max(coords.bottom, endCoords.bottom) + margin};
        var scrollPos = calculateScrollPos(cm, rect);
        var startTop = cm.doc.scrollTop, startLeft = cm.doc.scrollLeft;
        if (scrollPos.scrollTop != null) {
          updateScrollTop(cm, scrollPos.scrollTop);
          if (Math.abs(cm.doc.scrollTop - startTop) > 1) { changed = true; }
        }
        if (scrollPos.scrollLeft != null) {
          setScrollLeft(cm, scrollPos.scrollLeft);
          if (Math.abs(cm.doc.scrollLeft - startLeft) > 1) { changed = true; }
        }
        if (!changed) { break }
      }
      return rect
    }

    // Scroll a given set of coordinates into view (immediately).
    function scrollIntoView(cm, rect) {
      var scrollPos = calculateScrollPos(cm, rect);
      if (scrollPos.scrollTop != null) { updateScrollTop(cm, scrollPos.scrollTop); }
      if (scrollPos.scrollLeft != null) { setScrollLeft(cm, scrollPos.scrollLeft); }
    }

    // Calculate a new scroll position needed to scroll the given
    // rectangle into view. Returns an object with scrollTop and
    // scrollLeft properties. When these are undefined, the
    // vertical/horizontal position does not need to be adjusted.
    function calculateScrollPos(cm, rect) {
      var display = cm.display, snapMargin = textHeight(cm.display);
      if (rect.top < 0) { rect.top = 0; }
      var screentop = cm.curOp && cm.curOp.scrollTop != null ? cm.curOp.scrollTop : display.scroller.scrollTop;
      var screen = displayHeight(cm), result = {};
      if (rect.bottom - rect.top > screen) { rect.bottom = rect.top + screen; }
      var docBottom = cm.doc.height + paddingVert(display);
      var atTop = rect.top < snapMargin, atBottom = rect.bottom > docBottom - snapMargin;
      if (rect.top < screentop) {
        result.scrollTop = atTop ? 0 : rect.top;
      } else if (rect.bottom > screentop + screen) {
        var newTop = Math.min(rect.top, (atBottom ? docBottom : rect.bottom) - screen);
        if (newTop != screentop) { result.scrollTop = newTop; }
      }

      var screenleft = cm.curOp && cm.curOp.scrollLeft != null ? cm.curOp.scrollLeft : display.scroller.scrollLeft;
      var screenw = displayWidth(cm) - (cm.options.fixedGutter ? display.gutters.offsetWidth : 0);
      var tooWide = rect.right - rect.left > screenw;
      if (tooWide) { rect.right = rect.left + screenw; }
      if (rect.left < 10)
        { result.scrollLeft = 0; }
      else if (rect.left < screenleft)
        { result.scrollLeft = Math.max(0, rect.left - (tooWide ? 0 : 10)); }
      else if (rect.right > screenw + screenleft - 3)
        { result.scrollLeft = rect.right + (tooWide ? 0 : 10) - screenw; }
      return result
    }

    // Store a relative adjustment to the scroll position in the current
    // operation (to be applied when the operation finishes).
    function addToScrollTop(cm, top) {
      if (top == null) { return }
      resolveScrollToPos(cm);
      cm.curOp.scrollTop = (cm.curOp.scrollTop == null ? cm.doc.scrollTop : cm.curOp.scrollTop) + top;
    }

    // Make sure that at the end of the operation the current cursor is
    // shown.
    function ensureCursorVisible(cm) {
      resolveScrollToPos(cm);
      var cur = cm.getCursor();
      cm.curOp.scrollToPos = {from: cur, to: cur, margin: cm.options.cursorScrollMargin};
    }

    function scrollToCoords(cm, x, y) {
      if (x != null || y != null) { resolveScrollToPos(cm); }
      if (x != null) { cm.curOp.scrollLeft = x; }
      if (y != null) { cm.curOp.scrollTop = y; }
    }

    function scrollToRange(cm, range$$1) {
      resolveScrollToPos(cm);
      cm.curOp.scrollToPos = range$$1;
    }

    // When an operation has its scrollToPos property set, and another
    // scroll action is applied before the end of the operation, this
    // 'simulates' scrolling that position into view in a cheap way, so
    // that the effect of intermediate scroll commands is not ignored.
    function resolveScrollToPos(cm) {
      var range$$1 = cm.curOp.scrollToPos;
      if (range$$1) {
        cm.curOp.scrollToPos = null;
        var from = estimateCoords(cm, range$$1.from), to = estimateCoords(cm, range$$1.to);
        scrollToCoordsRange(cm, from, to, range$$1.margin);
      }
    }

    function scrollToCoordsRange(cm, from, to, margin) {
      var sPos = calculateScrollPos(cm, {
        left: Math.min(from.left, to.left),
        top: Math.min(from.top, to.top) - margin,
        right: Math.max(from.right, to.right),
        bottom: Math.max(from.bottom, to.bottom) + margin
      });
      scrollToCoords(cm, sPos.scrollLeft, sPos.scrollTop);
    }

    // Sync the scrollable area and scrollbars, ensure the viewport
    // covers the visible area.
    function updateScrollTop(cm, val) {
      if (Math.abs(cm.doc.scrollTop - val) < 2) { return }
      if (!gecko) { updateDisplaySimple(cm, {top: val}); }
      setScrollTop(cm, val, true);
      if (gecko) { updateDisplaySimple(cm); }
      startWorker(cm, 100);
    }

    function setScrollTop(cm, val, forceScroll) {
      val = Math.min(cm.display.scroller.scrollHeight - cm.display.scroller.clientHeight, val);
      if (cm.display.scroller.scrollTop == val && !forceScroll) { return }
      cm.doc.scrollTop = val;
      cm.display.scrollbars.setScrollTop(val);
      if (cm.display.scroller.scrollTop != val) { cm.display.scroller.scrollTop = val; }
    }

    // Sync scroller and scrollbar, ensure the gutter elements are
    // aligned.
    function setScrollLeft(cm, val, isScroller, forceScroll) {
      val = Math.min(val, cm.display.scroller.scrollWidth - cm.display.scroller.clientWidth);
      if ((isScroller ? val == cm.doc.scrollLeft : Math.abs(cm.doc.scrollLeft - val) < 2) && !forceScroll) { return }
      cm.doc.scrollLeft = val;
      alignHorizontally(cm);
      if (cm.display.scroller.scrollLeft != val) { cm.display.scroller.scrollLeft = val; }
      cm.display.scrollbars.setScrollLeft(val);
    }

    // SCROLLBARS

    // Prepare DOM reads needed to update the scrollbars. Done in one
    // shot to minimize update/measure roundtrips.
    function measureForScrollbars(cm) {
      var d = cm.display, gutterW = d.gutters.offsetWidth;
      var docH = Math.round(cm.doc.height + paddingVert(cm.display));
      return {
        clientHeight: d.scroller.clientHeight,
        viewHeight: d.wrapper.clientHeight,
        scrollWidth: d.scroller.scrollWidth, clientWidth: d.scroller.clientWidth,
        viewWidth: d.wrapper.clientWidth,
        barLeft: cm.options.fixedGutter ? gutterW : 0,
        docHeight: docH,
        scrollHeight: docH + scrollGap(cm) + d.barHeight,
        nativeBarWidth: d.nativeBarWidth,
        gutterWidth: gutterW
      }
    }

    var NativeScrollbars = function(place, scroll, cm) {
      this.cm = cm;
      var vert = this.vert = elt("div", [elt("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar");
      var horiz = this.horiz = elt("div", [elt("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
      vert.tabIndex = horiz.tabIndex = -1;
      place(vert); place(horiz);

      on(vert, "scroll", function () {
        if (vert.clientHeight) { scroll(vert.scrollTop, "vertical"); }
      });
      on(horiz, "scroll", function () {
        if (horiz.clientWidth) { scroll(horiz.scrollLeft, "horizontal"); }
      });

      this.checkedZeroWidth = false;
      // Need to set a minimum width to see the scrollbar on IE7 (but must not set it on IE8).
      if (ie && ie_version < 8) { this.horiz.style.minHeight = this.vert.style.minWidth = "18px"; }
    };

    NativeScrollbars.prototype.update = function (measure) {
      var needsH = measure.scrollWidth > measure.clientWidth + 1;
      var needsV = measure.scrollHeight > measure.clientHeight + 1;
      var sWidth = measure.nativeBarWidth;

      if (needsV) {
        this.vert.style.display = "block";
        this.vert.style.bottom = needsH ? sWidth + "px" : "0";
        var totalHeight = measure.viewHeight - (needsH ? sWidth : 0);
        // A bug in IE8 can cause this value to be negative, so guard it.
        this.vert.firstChild.style.height =
          Math.max(0, measure.scrollHeight - measure.clientHeight + totalHeight) + "px";
      } else {
        this.vert.style.display = "";
        this.vert.firstChild.style.height = "0";
      }

      if (needsH) {
        this.horiz.style.display = "block";
        this.horiz.style.right = needsV ? sWidth + "px" : "0";
        this.horiz.style.left = measure.barLeft + "px";
        var totalWidth = measure.viewWidth - measure.barLeft - (needsV ? sWidth : 0);
        this.horiz.firstChild.style.width =
          Math.max(0, measure.scrollWidth - measure.clientWidth + totalWidth) + "px";
      } else {
        this.horiz.style.display = "";
        this.horiz.firstChild.style.width = "0";
      }

      if (!this.checkedZeroWidth && measure.clientHeight > 0) {
        if (sWidth == 0) { this.zeroWidthHack(); }
        this.checkedZeroWidth = true;
      }

      return {right: needsV ? sWidth : 0, bottom: needsH ? sWidth : 0}
    };

    NativeScrollbars.prototype.setScrollLeft = function (pos) {
      if (this.horiz.scrollLeft != pos) { this.horiz.scrollLeft = pos; }
      if (this.disableHoriz) { this.enableZeroWidthBar(this.horiz, this.disableHoriz, "horiz"); }
    };

    NativeScrollbars.prototype.setScrollTop = function (pos) {
      if (this.vert.scrollTop != pos) { this.vert.scrollTop = pos; }
      if (this.disableVert) { this.enableZeroWidthBar(this.vert, this.disableVert, "vert"); }
    };

    NativeScrollbars.prototype.zeroWidthHack = function () {
      var w = mac && !mac_geMountainLion ? "12px" : "18px";
      this.horiz.style.height = this.vert.style.width = w;
      this.horiz.style.pointerEvents = this.vert.style.pointerEvents = "none";
      this.disableHoriz = new Delayed;
      this.disableVert = new Delayed;
    };

    NativeScrollbars.prototype.enableZeroWidthBar = function (bar, delay, type) {
      bar.style.pointerEvents = "auto";
      function maybeDisable() {
        // To find out whether the scrollbar is still visible, we
        // check whether the element under the pixel in the bottom
        // right corner of the scrollbar box is the scrollbar box
        // itself (when the bar is still visible) or its filler child
        // (when the bar is hidden). If it is still visible, we keep
        // it enabled, if it's hidden, we disable pointer events.
        var box = bar.getBoundingClientRect();
        var elt$$1 = type == "vert" ? document.elementFromPoint(box.right - 1, (box.top + box.bottom) / 2)
            : document.elementFromPoint((box.right + box.left) / 2, box.bottom - 1);
        if (elt$$1 != bar) { bar.style.pointerEvents = "none"; }
        else { delay.set(1000, maybeDisable); }
      }
      delay.set(1000, maybeDisable);
    };

    NativeScrollbars.prototype.clear = function () {
      var parent = this.horiz.parentNode;
      parent.removeChild(this.horiz);
      parent.removeChild(this.vert);
    };

    var NullScrollbars = function () {};

    NullScrollbars.prototype.update = function () { return {bottom: 0, right: 0} };
    NullScrollbars.prototype.setScrollLeft = function () {};
    NullScrollbars.prototype.setScrollTop = function () {};
    NullScrollbars.prototype.clear = function () {};

    function updateScrollbars(cm, measure) {
      if (!measure) { measure = measureForScrollbars(cm); }
      var startWidth = cm.display.barWidth, startHeight = cm.display.barHeight;
      updateScrollbarsInner(cm, measure);
      for (var i = 0; i < 4 && startWidth != cm.display.barWidth || startHeight != cm.display.barHeight; i++) {
        if (startWidth != cm.display.barWidth && cm.options.lineWrapping)
          { updateHeightsInViewport(cm); }
        updateScrollbarsInner(cm, measureForScrollbars(cm));
        startWidth = cm.display.barWidth; startHeight = cm.display.barHeight;
      }
    }

    // Re-synchronize the fake scrollbars with the actual size of the
    // content.
    function updateScrollbarsInner(cm, measure) {
      var d = cm.display;
      var sizes = d.scrollbars.update(measure);

      d.sizer.style.paddingRight = (d.barWidth = sizes.right) + "px";
      d.sizer.style.paddingBottom = (d.barHeight = sizes.bottom) + "px";
      d.heightForcer.style.borderBottom = sizes.bottom + "px solid transparent";

      if (sizes.right && sizes.bottom) {
        d.scrollbarFiller.style.display = "block";
        d.scrollbarFiller.style.height = sizes.bottom + "px";
        d.scrollbarFiller.style.width = sizes.right + "px";
      } else { d.scrollbarFiller.style.display = ""; }
      if (sizes.bottom && cm.options.coverGutterNextToScrollbar && cm.options.fixedGutter) {
        d.gutterFiller.style.display = "block";
        d.gutterFiller.style.height = sizes.bottom + "px";
        d.gutterFiller.style.width = measure.gutterWidth + "px";
      } else { d.gutterFiller.style.display = ""; }
    }

    var scrollbarModel = {"native": NativeScrollbars, "null": NullScrollbars};

    function initScrollbars(cm) {
      if (cm.display.scrollbars) {
        cm.display.scrollbars.clear();
        if (cm.display.scrollbars.addClass)
          { rmClass(cm.display.wrapper, cm.display.scrollbars.addClass); }
      }

      cm.display.scrollbars = new scrollbarModel[cm.options.scrollbarStyle](function (node) {
        cm.display.wrapper.insertBefore(node, cm.display.scrollbarFiller);
        // Prevent clicks in the scrollbars from killing focus
        on(node, "mousedown", function () {
          if (cm.state.focused) { setTimeout(function () { return cm.display.input.focus(); }, 0); }
        });
        node.setAttribute("cm-not-content", "true");
      }, function (pos, axis) {
        if (axis == "horizontal") { setScrollLeft(cm, pos); }
        else { updateScrollTop(cm, pos); }
      }, cm);
      if (cm.display.scrollbars.addClass)
        { addClass(cm.display.wrapper, cm.display.scrollbars.addClass); }
    }

    // Operations are used to wrap a series of changes to the editor
    // state in such a way that each change won't have to update the
    // cursor and display (which would be awkward, slow, and
    // error-prone). Instead, display updates are batched and then all
    // combined and executed at once.

    var nextOpId = 0;
    // Start a new operation.
    function startOperation(cm) {
      cm.curOp = {
        cm: cm,
        viewChanged: false,      // Flag that indicates that lines might need to be redrawn
        startHeight: cm.doc.height, // Used to detect need to update scrollbar
        forceUpdate: false,      // Used to force a redraw
        updateInput: 0,       // Whether to reset the input textarea
        typing: false,           // Whether this reset should be careful to leave existing text (for compositing)
        changeObjs: null,        // Accumulated changes, for firing change events
        cursorActivityHandlers: null, // Set of handlers to fire cursorActivity on
        cursorActivityCalled: 0, // Tracks which cursorActivity handlers have been called already
        selectionChanged: false, // Whether the selection needs to be redrawn
        updateMaxLine: false,    // Set when the widest line needs to be determined anew
        scrollLeft: null, scrollTop: null, // Intermediate scroll position, not pushed to DOM yet
        scrollToPos: null,       // Used to scroll to a specific position
        focus: false,
        id: ++nextOpId           // Unique ID
      };
      pushOperation(cm.curOp);
    }

    // Finish an operation, updating the display and signalling delayed events
    function endOperation(cm) {
      var op = cm.curOp;
      if (op) { finishOperation(op, function (group) {
        for (var i = 0; i < group.ops.length; i++)
          { group.ops[i].cm.curOp = null; }
        endOperations(group);
      }); }
    }

    // The DOM updates done when an operation finishes are batched so
    // that the minimum number of relayouts are required.
    function endOperations(group) {
      var ops = group.ops;
      for (var i = 0; i < ops.length; i++) // Read DOM
        { endOperation_R1(ops[i]); }
      for (var i$1 = 0; i$1 < ops.length; i$1++) // Write DOM (maybe)
        { endOperation_W1(ops[i$1]); }
      for (var i$2 = 0; i$2 < ops.length; i$2++) // Read DOM
        { endOperation_R2(ops[i$2]); }
      for (var i$3 = 0; i$3 < ops.length; i$3++) // Write DOM (maybe)
        { endOperation_W2(ops[i$3]); }
      for (var i$4 = 0; i$4 < ops.length; i$4++) // Read DOM
        { endOperation_finish(ops[i$4]); }
    }

    function endOperation_R1(op) {
      var cm = op.cm, display = cm.display;
      maybeClipScrollbars(cm);
      if (op.updateMaxLine) { findMaxLine(cm); }

      op.mustUpdate = op.viewChanged || op.forceUpdate || op.scrollTop != null ||
        op.scrollToPos && (op.scrollToPos.from.line < display.viewFrom ||
                           op.scrollToPos.to.line >= display.viewTo) ||
        display.maxLineChanged && cm.options.lineWrapping;
      op.update = op.mustUpdate &&
        new DisplayUpdate(cm, op.mustUpdate && {top: op.scrollTop, ensure: op.scrollToPos}, op.forceUpdate);
    }

    function endOperation_W1(op) {
      op.updatedDisplay = op.mustUpdate && updateDisplayIfNeeded(op.cm, op.update);
    }

    function endOperation_R2(op) {
      var cm = op.cm, display = cm.display;
      if (op.updatedDisplay) { updateHeightsInViewport(cm); }

      op.barMeasure = measureForScrollbars(cm);

      // If the max line changed since it was last measured, measure it,
      // and ensure the document's width matches it.
      // updateDisplay_W2 will use these properties to do the actual resizing
      if (display.maxLineChanged && !cm.options.lineWrapping) {
        op.adjustWidthTo = measureChar(cm, display.maxLine, display.maxLine.text.length).left + 3;
        cm.display.sizerWidth = op.adjustWidthTo;
        op.barMeasure.scrollWidth =
          Math.max(display.scroller.clientWidth, display.sizer.offsetLeft + op.adjustWidthTo + scrollGap(cm) + cm.display.barWidth);
        op.maxScrollLeft = Math.max(0, display.sizer.offsetLeft + op.adjustWidthTo - displayWidth(cm));
      }

      if (op.updatedDisplay || op.selectionChanged)
        { op.preparedSelection = display.input.prepareSelection(); }
    }

    function endOperation_W2(op) {
      var cm = op.cm;

      if (op.adjustWidthTo != null) {
        cm.display.sizer.style.minWidth = op.adjustWidthTo + "px";
        if (op.maxScrollLeft < cm.doc.scrollLeft)
          { setScrollLeft(cm, Math.min(cm.display.scroller.scrollLeft, op.maxScrollLeft), true); }
        cm.display.maxLineChanged = false;
      }

      var takeFocus = op.focus && op.focus == activeElt();
      if (op.preparedSelection)
        { cm.display.input.showSelection(op.preparedSelection, takeFocus); }
      if (op.updatedDisplay || op.startHeight != cm.doc.height)
        { updateScrollbars(cm, op.barMeasure); }
      if (op.updatedDisplay)
        { setDocumentHeight(cm, op.barMeasure); }

      if (op.selectionChanged) { restartBlink(cm); }

      if (cm.state.focused && op.updateInput)
        { cm.display.input.reset(op.typing); }
      if (takeFocus) { ensureFocus(op.cm); }
    }

    function endOperation_finish(op) {
      var cm = op.cm, display = cm.display, doc = cm.doc;

      if (op.updatedDisplay) { postUpdateDisplay(cm, op.update); }

      // Abort mouse wheel delta measurement, when scrolling explicitly
      if (display.wheelStartX != null && (op.scrollTop != null || op.scrollLeft != null || op.scrollToPos))
        { display.wheelStartX = display.wheelStartY = null; }

      // Propagate the scroll position to the actual DOM scroller
      if (op.scrollTop != null) { setScrollTop(cm, op.scrollTop, op.forceScroll); }

      if (op.scrollLeft != null) { setScrollLeft(cm, op.scrollLeft, true, true); }
      // If we need to scroll a specific position into view, do so.
      if (op.scrollToPos) {
        var rect = scrollPosIntoView(cm, clipPos(doc, op.scrollToPos.from),
                                     clipPos(doc, op.scrollToPos.to), op.scrollToPos.margin);
        maybeScrollWindow(cm, rect);
      }

      // Fire events for markers that are hidden/unidden by editing or
      // undoing
      var hidden = op.maybeHiddenMarkers, unhidden = op.maybeUnhiddenMarkers;
      if (hidden) { for (var i = 0; i < hidden.length; ++i)
        { if (!hidden[i].lines.length) { signal(hidden[i], "hide"); } } }
      if (unhidden) { for (var i$1 = 0; i$1 < unhidden.length; ++i$1)
        { if (unhidden[i$1].lines.length) { signal(unhidden[i$1], "unhide"); } } }

      if (display.wrapper.offsetHeight)
        { doc.scrollTop = cm.display.scroller.scrollTop; }

      // Fire change events, and delayed event handlers
      if (op.changeObjs)
        { signal(cm, "changes", cm, op.changeObjs); }
      if (op.update)
        { op.update.finish(); }
    }

    // Run the given function in an operation
    function runInOp(cm, f) {
      if (cm.curOp) { return f() }
      startOperation(cm);
      try { return f() }
      finally { endOperation(cm); }
    }
    // Wraps a function in an operation. Returns the wrapped function.
    function operation(cm, f) {
      return function() {
        if (cm.curOp) { return f.apply(cm, arguments) }
        startOperation(cm);
        try { return f.apply(cm, arguments) }
        finally { endOperation(cm); }
      }
    }
    // Used to add methods to editor and doc instances, wrapping them in
    // operations.
    function methodOp(f) {
      return function() {
        if (this.curOp) { return f.apply(this, arguments) }
        startOperation(this);
        try { return f.apply(this, arguments) }
        finally { endOperation(this); }
      }
    }
    function docMethodOp(f) {
      return function() {
        var cm = this.cm;
        if (!cm || cm.curOp) { return f.apply(this, arguments) }
        startOperation(cm);
        try { return f.apply(this, arguments) }
        finally { endOperation(cm); }
      }
    }

    // Updates the display.view data structure for a given change to the
    // document. From and to are in pre-change coordinates. Lendiff is
    // the amount of lines added or subtracted by the change. This is
    // used for changes that span multiple lines, or change the way
    // lines are divided into visual lines. regLineChange (below)
    // registers single-line changes.
    function regChange(cm, from, to, lendiff) {
      if (from == null) { from = cm.doc.first; }
      if (to == null) { to = cm.doc.first + cm.doc.size; }
      if (!lendiff) { lendiff = 0; }

      var display = cm.display;
      if (lendiff && to < display.viewTo &&
          (display.updateLineNumbers == null || display.updateLineNumbers > from))
        { display.updateLineNumbers = from; }

      cm.curOp.viewChanged = true;

      if (from >= display.viewTo) { // Change after
        if (sawCollapsedSpans && visualLineNo(cm.doc, from) < display.viewTo)
          { resetView(cm); }
      } else if (to <= display.viewFrom) { // Change before
        if (sawCollapsedSpans && visualLineEndNo(cm.doc, to + lendiff) > display.viewFrom) {
          resetView(cm);
        } else {
          display.viewFrom += lendiff;
          display.viewTo += lendiff;
        }
      } else if (from <= display.viewFrom && to >= display.viewTo) { // Full overlap
        resetView(cm);
      } else if (from <= display.viewFrom) { // Top overlap
        var cut = viewCuttingPoint(cm, to, to + lendiff, 1);
        if (cut) {
          display.view = display.view.slice(cut.index);
          display.viewFrom = cut.lineN;
          display.viewTo += lendiff;
        } else {
          resetView(cm);
        }
      } else if (to >= display.viewTo) { // Bottom overlap
        var cut$1 = viewCuttingPoint(cm, from, from, -1);
        if (cut$1) {
          display.view = display.view.slice(0, cut$1.index);
          display.viewTo = cut$1.lineN;
        } else {
          resetView(cm);
        }
      } else { // Gap in the middle
        var cutTop = viewCuttingPoint(cm, from, from, -1);
        var cutBot = viewCuttingPoint(cm, to, to + lendiff, 1);
        if (cutTop && cutBot) {
          display.view = display.view.slice(0, cutTop.index)
            .concat(buildViewArray(cm, cutTop.lineN, cutBot.lineN))
            .concat(display.view.slice(cutBot.index));
          display.viewTo += lendiff;
        } else {
          resetView(cm);
        }
      }

      var ext = display.externalMeasured;
      if (ext) {
        if (to < ext.lineN)
          { ext.lineN += lendiff; }
        else if (from < ext.lineN + ext.size)
          { display.externalMeasured = null; }
      }
    }

    // Register a change to a single line. Type must be one of "text",
    // "gutter", "class", "widget"
    function regLineChange(cm, line, type) {
      cm.curOp.viewChanged = true;
      var display = cm.display, ext = cm.display.externalMeasured;
      if (ext && line >= ext.lineN && line < ext.lineN + ext.size)
        { display.externalMeasured = null; }

      if (line < display.viewFrom || line >= display.viewTo) { return }
      var lineView = display.view[findViewIndex(cm, line)];
      if (lineView.node == null) { return }
      var arr = lineView.changes || (lineView.changes = []);
      if (indexOf(arr, type) == -1) { arr.push(type); }
    }

    // Clear the view.
    function resetView(cm) {
      cm.display.viewFrom = cm.display.viewTo = cm.doc.first;
      cm.display.view = [];
      cm.display.viewOffset = 0;
    }

    function viewCuttingPoint(cm, oldN, newN, dir) {
      var index = findViewIndex(cm, oldN), diff, view = cm.display.view;
      if (!sawCollapsedSpans || newN == cm.doc.first + cm.doc.size)
        { return {index: index, lineN: newN} }
      var n = cm.display.viewFrom;
      for (var i = 0; i < index; i++)
        { n += view[i].size; }
      if (n != oldN) {
        if (dir > 0) {
          if (index == view.length - 1) { return null }
          diff = (n + view[index].size) - oldN;
          index++;
        } else {
          diff = n - oldN;
        }
        oldN += diff; newN += diff;
      }
      while (visualLineNo(cm.doc, newN) != newN) {
        if (index == (dir < 0 ? 0 : view.length - 1)) { return null }
        newN += dir * view[index - (dir < 0 ? 1 : 0)].size;
        index += dir;
      }
      return {index: index, lineN: newN}
    }

    // Force the view to cover a given range, adding empty view element
    // or clipping off existing ones as needed.
    function adjustView(cm, from, to) {
      var display = cm.display, view = display.view;
      if (view.length == 0 || from >= display.viewTo || to <= display.viewFrom) {
        display.view = buildViewArray(cm, from, to);
        display.viewFrom = from;
      } else {
        if (display.viewFrom > from)
          { display.view = buildViewArray(cm, from, display.viewFrom).concat(display.view); }
        else if (display.viewFrom < from)
          { display.view = display.view.slice(findViewIndex(cm, from)); }
        display.viewFrom = from;
        if (display.viewTo < to)
          { display.view = display.view.concat(buildViewArray(cm, display.viewTo, to)); }
        else if (display.viewTo > to)
          { display.view = display.view.slice(0, findViewIndex(cm, to)); }
      }
      display.viewTo = to;
    }

    // Count the number of lines in the view whose DOM representation is
    // out of date (or nonexistent).
    function countDirtyView(cm) {
      var view = cm.display.view, dirty = 0;
      for (var i = 0; i < view.length; i++) {
        var lineView = view[i];
        if (!lineView.hidden && (!lineView.node || lineView.changes)) { ++dirty; }
      }
      return dirty
    }

    // HIGHLIGHT WORKER

    function startWorker(cm, time) {
      if (cm.doc.highlightFrontier < cm.display.viewTo)
        { cm.state.highlight.set(time, bind(highlightWorker, cm)); }
    }

    function highlightWorker(cm) {
      var doc = cm.doc;
      if (doc.highlightFrontier >= cm.display.viewTo) { return }
      var end = +new Date + cm.options.workTime;
      var context = getContextBefore(cm, doc.highlightFrontier);
      var changedLines = [];

      doc.iter(context.line, Math.min(doc.first + doc.size, cm.display.viewTo + 500), function (line) {
        if (context.line >= cm.display.viewFrom) { // Visible
          var oldStyles = line.styles;
          var resetState = line.text.length > cm.options.maxHighlightLength ? copyState(doc.mode, context.state) : null;
          var highlighted = highlightLine(cm, line, context, true);
          if (resetState) { context.state = resetState; }
          line.styles = highlighted.styles;
          var oldCls = line.styleClasses, newCls = highlighted.classes;
          if (newCls) { line.styleClasses = newCls; }
          else if (oldCls) { line.styleClasses = null; }
          var ischange = !oldStyles || oldStyles.length != line.styles.length ||
            oldCls != newCls && (!oldCls || !newCls || oldCls.bgClass != newCls.bgClass || oldCls.textClass != newCls.textClass);
          for (var i = 0; !ischange && i < oldStyles.length; ++i) { ischange = oldStyles[i] != line.styles[i]; }
          if (ischange) { changedLines.push(context.line); }
          line.stateAfter = context.save();
          context.nextLine();
        } else {
          if (line.text.length <= cm.options.maxHighlightLength)
            { processLine(cm, line.text, context); }
          line.stateAfter = context.line % 5 == 0 ? context.save() : null;
          context.nextLine();
        }
        if (+new Date > end) {
          startWorker(cm, cm.options.workDelay);
          return true
        }
      });
      doc.highlightFrontier = context.line;
      doc.modeFrontier = Math.max(doc.modeFrontier, context.line);
      if (changedLines.length) { runInOp(cm, function () {
        for (var i = 0; i < changedLines.length; i++)
          { regLineChange(cm, changedLines[i], "text"); }
      }); }
    }

    // DISPLAY DRAWING

    var DisplayUpdate = function(cm, viewport, force) {
      var display = cm.display;

      this.viewport = viewport;
      // Store some values that we'll need later (but don't want to force a relayout for)
      this.visible = visibleLines(display, cm.doc, viewport);
      this.editorIsHidden = !display.wrapper.offsetWidth;
      this.wrapperHeight = display.wrapper.clientHeight;
      this.wrapperWidth = display.wrapper.clientWidth;
      this.oldDisplayWidth = displayWidth(cm);
      this.force = force;
      this.dims = getDimensions(cm);
      this.events = [];
    };

    DisplayUpdate.prototype.signal = function (emitter, type) {
      if (hasHandler(emitter, type))
        { this.events.push(arguments); }
    };
    DisplayUpdate.prototype.finish = function () {
        var this$1 = this;

      for (var i = 0; i < this.events.length; i++)
        { signal.apply(null, this$1.events[i]); }
    };

    function maybeClipScrollbars(cm) {
      var display = cm.display;
      if (!display.scrollbarsClipped && display.scroller.offsetWidth) {
        display.nativeBarWidth = display.scroller.offsetWidth - display.scroller.clientWidth;
        display.heightForcer.style.height = scrollGap(cm) + "px";
        display.sizer.style.marginBottom = -display.nativeBarWidth + "px";
        display.sizer.style.borderRightWidth = scrollGap(cm) + "px";
        display.scrollbarsClipped = true;
      }
    }

    function selectionSnapshot(cm) {
      if (cm.hasFocus()) { return null }
      var active = activeElt();
      if (!active || !contains(cm.display.lineDiv, active)) { return null }
      var result = {activeElt: active};
      if (window.getSelection) {
        var sel = window.getSelection();
        if (sel.anchorNode && sel.extend && contains(cm.display.lineDiv, sel.anchorNode)) {
          result.anchorNode = sel.anchorNode;
          result.anchorOffset = sel.anchorOffset;
          result.focusNode = sel.focusNode;
          result.focusOffset = sel.focusOffset;
        }
      }
      return result
    }

    function restoreSelection(snapshot) {
      if (!snapshot || !snapshot.activeElt || snapshot.activeElt == activeElt()) { return }
      snapshot.activeElt.focus();
      if (snapshot.anchorNode && contains(document.body, snapshot.anchorNode) && contains(document.body, snapshot.focusNode)) {
        var sel = window.getSelection(), range$$1 = document.createRange();
        range$$1.setEnd(snapshot.anchorNode, snapshot.anchorOffset);
        range$$1.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range$$1);
        sel.extend(snapshot.focusNode, snapshot.focusOffset);
      }
    }

    // Does the actual updating of the line display. Bails out
    // (returning false) when there is nothing to be done and forced is
    // false.
    function updateDisplayIfNeeded(cm, update) {
      var display = cm.display, doc = cm.doc;

      if (update.editorIsHidden) {
        resetView(cm);
        return false
      }

      // Bail out if the visible area is already rendered and nothing changed.
      if (!update.force &&
          update.visible.from >= display.viewFrom && update.visible.to <= display.viewTo &&
          (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo) &&
          display.renderedView == display.view && countDirtyView(cm) == 0)
        { return false }

      if (maybeUpdateLineNumberWidth(cm)) {
        resetView(cm);
        update.dims = getDimensions(cm);
      }

      // Compute a suitable new viewport (from & to)
      var end = doc.first + doc.size;
      var from = Math.max(update.visible.from - cm.options.viewportMargin, doc.first);
      var to = Math.min(end, update.visible.to + cm.options.viewportMargin);
      if (display.viewFrom < from && from - display.viewFrom < 20) { from = Math.max(doc.first, display.viewFrom); }
      if (display.viewTo > to && display.viewTo - to < 20) { to = Math.min(end, display.viewTo); }
      if (sawCollapsedSpans) {
        from = visualLineNo(cm.doc, from);
        to = visualLineEndNo(cm.doc, to);
      }

      var different = from != display.viewFrom || to != display.viewTo ||
        display.lastWrapHeight != update.wrapperHeight || display.lastWrapWidth != update.wrapperWidth;
      adjustView(cm, from, to);

      display.viewOffset = heightAtLine(getLine(cm.doc, display.viewFrom));
      // Position the mover div to align with the current scroll position
      cm.display.mover.style.top = display.viewOffset + "px";

      var toUpdate = countDirtyView(cm);
      if (!different && toUpdate == 0 && !update.force && display.renderedView == display.view &&
          (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo))
        { return false }

      // For big changes, we hide the enclosing element during the
      // update, since that speeds up the operations on most browsers.
      var selSnapshot = selectionSnapshot(cm);
      if (toUpdate > 4) { display.lineDiv.style.display = "none"; }
      patchDisplay(cm, display.updateLineNumbers, update.dims);
      if (toUpdate > 4) { display.lineDiv.style.display = ""; }
      display.renderedView = display.view;
      // There might have been a widget with a focused element that got
      // hidden or updated, if so re-focus it.
      restoreSelection(selSnapshot);

      // Prevent selection and cursors from interfering with the scroll
      // width and height.
      removeChildren(display.cursorDiv);
      removeChildren(display.selectionDiv);
      display.gutters.style.height = display.sizer.style.minHeight = 0;

      if (different) {
        display.lastWrapHeight = update.wrapperHeight;
        display.lastWrapWidth = update.wrapperWidth;
        startWorker(cm, 400);
      }

      display.updateLineNumbers = null;

      return true
    }

    function postUpdateDisplay(cm, update) {
      var viewport = update.viewport;

      for (var first = true;; first = false) {
        if (!first || !cm.options.lineWrapping || update.oldDisplayWidth == displayWidth(cm)) {
          // Clip forced viewport to actual scrollable area.
          if (viewport && viewport.top != null)
            { viewport = {top: Math.min(cm.doc.height + paddingVert(cm.display) - displayHeight(cm), viewport.top)}; }
          // Updated line heights might result in the drawn area not
          // actually covering the viewport. Keep looping until it does.
          update.visible = visibleLines(cm.display, cm.doc, viewport);
          if (update.visible.from >= cm.display.viewFrom && update.visible.to <= cm.display.viewTo)
            { break }
        }
        if (!updateDisplayIfNeeded(cm, update)) { break }
        updateHeightsInViewport(cm);
        var barMeasure = measureForScrollbars(cm);
        updateSelection(cm);
        updateScrollbars(cm, barMeasure);
        setDocumentHeight(cm, barMeasure);
        update.force = false;
      }

      update.signal(cm, "update", cm);
      if (cm.display.viewFrom != cm.display.reportedViewFrom || cm.display.viewTo != cm.display.reportedViewTo) {
        update.signal(cm, "viewportChange", cm, cm.display.viewFrom, cm.display.viewTo);
        cm.display.reportedViewFrom = cm.display.viewFrom; cm.display.reportedViewTo = cm.display.viewTo;
      }
    }

    function updateDisplaySimple(cm, viewport) {
      var update = new DisplayUpdate(cm, viewport);
      if (updateDisplayIfNeeded(cm, update)) {
        updateHeightsInViewport(cm);
        postUpdateDisplay(cm, update);
        var barMeasure = measureForScrollbars(cm);
        updateSelection(cm);
        updateScrollbars(cm, barMeasure);
        setDocumentHeight(cm, barMeasure);
        update.finish();
      }
    }

    // Sync the actual display DOM structure with display.view, removing
    // nodes for lines that are no longer in view, and creating the ones
    // that are not there yet, and updating the ones that are out of
    // date.
    function patchDisplay(cm, updateNumbersFrom, dims) {
      var display = cm.display, lineNumbers = cm.options.lineNumbers;
      var container = display.lineDiv, cur = container.firstChild;

      function rm(node) {
        var next = node.nextSibling;
        // Works around a throw-scroll bug in OS X Webkit
        if (webkit && mac && cm.display.currentWheelTarget == node)
          { node.style.display = "none"; }
        else
          { node.parentNode.removeChild(node); }
        return next
      }

      var view = display.view, lineN = display.viewFrom;
      // Loop over the elements in the view, syncing cur (the DOM nodes
      // in display.lineDiv) with the view as we go.
      for (var i = 0; i < view.length; i++) {
        var lineView = view[i];
        if (lineView.hidden) ; else if (!lineView.node || lineView.node.parentNode != container) { // Not drawn yet
          var node = buildLineElement(cm, lineView, lineN, dims);
          container.insertBefore(node, cur);
        } else { // Already drawn
          while (cur != lineView.node) { cur = rm(cur); }
          var updateNumber = lineNumbers && updateNumbersFrom != null &&
            updateNumbersFrom <= lineN && lineView.lineNumber;
          if (lineView.changes) {
            if (indexOf(lineView.changes, "gutter") > -1) { updateNumber = false; }
            updateLineForChanges(cm, lineView, lineN, dims);
          }
          if (updateNumber) {
            removeChildren(lineView.lineNumber);
            lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options, lineN)));
          }
          cur = lineView.node.nextSibling;
        }
        lineN += lineView.size;
      }
      while (cur) { cur = rm(cur); }
    }

    function updateGutterSpace(cm) {
      var width = cm.display.gutters.offsetWidth;
      cm.display.sizer.style.marginLeft = width + "px";
    }

    function setDocumentHeight(cm, measure) {
      cm.display.sizer.style.minHeight = measure.docHeight + "px";
      cm.display.heightForcer.style.top = measure.docHeight + "px";
      cm.display.gutters.style.height = (measure.docHeight + cm.display.barHeight + scrollGap(cm)) + "px";
    }

    // Rebuild the gutter elements, ensure the margin to the left of the
    // code matches their width.
    function updateGutters(cm) {
      var gutters = cm.display.gutters, specs = cm.options.gutters;
      removeChildren(gutters);
      var i = 0;
      for (; i < specs.length; ++i) {
        var gutterClass = specs[i];
        var gElt = gutters.appendChild(elt("div", null, "CodeMirror-gutter " + gutterClass));
        if (gutterClass == "CodeMirror-linenumbers") {
          cm.display.lineGutter = gElt;
          gElt.style.width = (cm.display.lineNumWidth || 1) + "px";
        }
      }
      gutters.style.display = i ? "" : "none";
      updateGutterSpace(cm);
    }

    // Make sure the gutters options contains the element
    // "CodeMirror-linenumbers" when the lineNumbers option is true.
    function setGuttersForLineNumbers(options) {
      var found = indexOf(options.gutters, "CodeMirror-linenumbers");
      if (found == -1 && options.lineNumbers) {
        options.gutters = options.gutters.concat(["CodeMirror-linenumbers"]);
      } else if (found > -1 && !options.lineNumbers) {
        options.gutters = options.gutters.slice(0);
        options.gutters.splice(found, 1);
      }
    }

    // Since the delta values reported on mouse wheel events are
    // unstandardized between browsers and even browser versions, and
    // generally horribly unpredictable, this code starts by measuring
    // the scroll effect that the first few mouse wheel events have,
    // and, from that, detects the way it can convert deltas to pixel
    // offsets afterwards.
    //
    // The reason we want to know the amount a wheel event will scroll
    // is that it gives us a chance to update the display before the
    // actual scrolling happens, reducing flickering.

    var wheelSamples = 0, wheelPixelsPerUnit = null;
    // Fill in a browser-detected starting value on browsers where we
    // know one. These don't have to be accurate -- the result of them
    // being wrong would just be a slight flicker on the first wheel
    // scroll (if it is large enough).
    if (ie) { wheelPixelsPerUnit = -.53; }
    else if (gecko) { wheelPixelsPerUnit = 15; }
    else if (chrome) { wheelPixelsPerUnit = -.7; }
    else if (safari) { wheelPixelsPerUnit = -1/3; }

    function wheelEventDelta(e) {
      var dx = e.wheelDeltaX, dy = e.wheelDeltaY;
      if (dx == null && e.detail && e.axis == e.HORIZONTAL_AXIS) { dx = e.detail; }
      if (dy == null && e.detail && e.axis == e.VERTICAL_AXIS) { dy = e.detail; }
      else if (dy == null) { dy = e.wheelDelta; }
      return {x: dx, y: dy}
    }
    function wheelEventPixels(e) {
      var delta = wheelEventDelta(e);
      delta.x *= wheelPixelsPerUnit;
      delta.y *= wheelPixelsPerUnit;
      return delta
    }

    function onScrollWheel(cm, e) {
      var delta = wheelEventDelta(e), dx = delta.x, dy = delta.y;

      var display = cm.display, scroll = display.scroller;
      // Quit if there's nothing to scroll here
      var canScrollX = scroll.scrollWidth > scroll.clientWidth;
      var canScrollY = scroll.scrollHeight > scroll.clientHeight;
      if (!(dx && canScrollX || dy && canScrollY)) { return }

      // Webkit browsers on OS X abort momentum scrolls when the target
      // of the scroll event is removed from the scrollable element.
      // This hack (see related code in patchDisplay) makes sure the
      // element is kept around.
      if (dy && mac && webkit) {
        outer: for (var cur = e.target, view = display.view; cur != scroll; cur = cur.parentNode) {
          for (var i = 0; i < view.length; i++) {
            if (view[i].node == cur) {
              cm.display.currentWheelTarget = cur;
              break outer
            }
          }
        }
      }

      // On some browsers, horizontal scrolling will cause redraws to
      // happen before the gutter has been realigned, causing it to
      // wriggle around in a most unseemly way. When we have an
      // estimated pixels/delta value, we just handle horizontal
      // scrolling entirely here. It'll be slightly off from native, but
      // better than glitching out.
      if (dx && !gecko && !presto && wheelPixelsPerUnit != null) {
        if (dy && canScrollY)
          { updateScrollTop(cm, Math.max(0, scroll.scrollTop + dy * wheelPixelsPerUnit)); }
        setScrollLeft(cm, Math.max(0, scroll.scrollLeft + dx * wheelPixelsPerUnit));
        // Only prevent default scrolling if vertical scrolling is
        // actually possible. Otherwise, it causes vertical scroll
        // jitter on OSX trackpads when deltaX is small and deltaY
        // is large (issue #3579)
        if (!dy || (dy && canScrollY))
          { e_preventDefault(e); }
        display.wheelStartX = null; // Abort measurement, if in progress
        return
      }

      // 'Project' the visible viewport to cover the area that is being
      // scrolled into view (if we know enough to estimate it).
      if (dy && wheelPixelsPerUnit != null) {
        var pixels = dy * wheelPixelsPerUnit;
        var top = cm.doc.scrollTop, bot = top + display.wrapper.clientHeight;
        if (pixels < 0) { top = Math.max(0, top + pixels - 50); }
        else { bot = Math.min(cm.doc.height, bot + pixels + 50); }
        updateDisplaySimple(cm, {top: top, bottom: bot});
      }

      if (wheelSamples < 20) {
        if (display.wheelStartX == null) {
          display.wheelStartX = scroll.scrollLeft; display.wheelStartY = scroll.scrollTop;
          display.wheelDX = dx; display.wheelDY = dy;
          setTimeout(function () {
            if (display.wheelStartX == null) { return }
            var movedX = scroll.scrollLeft - display.wheelStartX;
            var movedY = scroll.scrollTop - display.wheelStartY;
            var sample = (movedY && display.wheelDY && movedY / display.wheelDY) ||
              (movedX && display.wheelDX && movedX / display.wheelDX);
            display.wheelStartX = display.wheelStartY = null;
            if (!sample) { return }
            wheelPixelsPerUnit = (wheelPixelsPerUnit * wheelSamples + sample) / (wheelSamples + 1);
            ++wheelSamples;
          }, 200);
        } else {
          display.wheelDX += dx; display.wheelDY += dy;
        }
      }
    }

    // Selection objects are immutable. A new one is created every time
    // the selection changes. A selection is one or more non-overlapping
    // (and non-touching) ranges, sorted, and an integer that indicates
    // which one is the primary selection (the one that's scrolled into
    // view, that getCursor returns, etc).
    var Selection = function(ranges, primIndex) {
      this.ranges = ranges;
      this.primIndex = primIndex;
    };

    Selection.prototype.primary = function () { return this.ranges[this.primIndex] };

    Selection.prototype.equals = function (other) {
        var this$1 = this;

      if (other == this) { return true }
      if (other.primIndex != this.primIndex || other.ranges.length != this.ranges.length) { return false }
      for (var i = 0; i < this.ranges.length; i++) {
        var here = this$1.ranges[i], there = other.ranges[i];
        if (!equalCursorPos(here.anchor, there.anchor) || !equalCursorPos(here.head, there.head)) { return false }
      }
      return true
    };

    Selection.prototype.deepCopy = function () {
        var this$1 = this;

      var out = [];
      for (var i = 0; i < this.ranges.length; i++)
        { out[i] = new Range(copyPos(this$1.ranges[i].anchor), copyPos(this$1.ranges[i].head)); }
      return new Selection(out, this.primIndex)
    };

    Selection.prototype.somethingSelected = function () {
        var this$1 = this;

      for (var i = 0; i < this.ranges.length; i++)
        { if (!this$1.ranges[i].empty()) { return true } }
      return false
    };

    Selection.prototype.contains = function (pos, end) {
        var this$1 = this;

      if (!end) { end = pos; }
      for (var i = 0; i < this.ranges.length; i++) {
        var range = this$1.ranges[i];
        if (cmp(end, range.from()) >= 0 && cmp(pos, range.to()) <= 0)
          { return i }
      }
      return -1
    };

    var Range = function(anchor, head) {
      this.anchor = anchor; this.head = head;
    };

    Range.prototype.from = function () { return minPos(this.anchor, this.head) };
    Range.prototype.to = function () { return maxPos(this.anchor, this.head) };
    Range.prototype.empty = function () { return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch };

    // Take an unsorted, potentially overlapping set of ranges, and
    // build a selection out of it. 'Consumes' ranges array (modifying
    // it).
    function normalizeSelection(cm, ranges, primIndex) {
      var mayTouch = cm && cm.options.selectionsMayTouch;
      var prim = ranges[primIndex];
      ranges.sort(function (a, b) { return cmp(a.from(), b.from()); });
      primIndex = indexOf(ranges, prim);
      for (var i = 1; i < ranges.length; i++) {
        var cur = ranges[i], prev = ranges[i - 1];
        var diff = cmp(prev.to(), cur.from());
        if (mayTouch && !cur.empty() ? diff > 0 : diff >= 0) {
          var from = minPos(prev.from(), cur.from()), to = maxPos(prev.to(), cur.to());
          var inv = prev.empty() ? cur.from() == cur.head : prev.from() == prev.head;
          if (i <= primIndex) { --primIndex; }
          ranges.splice(--i, 2, new Range(inv ? to : from, inv ? from : to));
        }
      }
      return new Selection(ranges, primIndex)
    }

    function simpleSelection(anchor, head) {
      return new Selection([new Range(anchor, head || anchor)], 0)
    }

    // Compute the position of the end of a change (its 'to' property
    // refers to the pre-change end).
    function changeEnd(change) {
      if (!change.text) { return change.to }
      return Pos(change.from.line + change.text.length - 1,
                 lst(change.text).length + (change.text.length == 1 ? change.from.ch : 0))
    }

    // Adjust a position to refer to the post-change position of the
    // same text, or the end of the change if the change covers it.
    function adjustForChange(pos, change) {
      if (cmp(pos, change.from) < 0) { return pos }
      if (cmp(pos, change.to) <= 0) { return changeEnd(change) }

      var line = pos.line + change.text.length - (change.to.line - change.from.line) - 1, ch = pos.ch;
      if (pos.line == change.to.line) { ch += changeEnd(change).ch - change.to.ch; }
      return Pos(line, ch)
    }

    function computeSelAfterChange(doc, change) {
      var out = [];
      for (var i = 0; i < doc.sel.ranges.length; i++) {
        var range = doc.sel.ranges[i];
        out.push(new Range(adjustForChange(range.anchor, change),
                           adjustForChange(range.head, change)));
      }
      return normalizeSelection(doc.cm, out, doc.sel.primIndex)
    }

    function offsetPos(pos, old, nw) {
      if (pos.line == old.line)
        { return Pos(nw.line, pos.ch - old.ch + nw.ch) }
      else
        { return Pos(nw.line + (pos.line - old.line), pos.ch) }
    }

    // Used by replaceSelections to allow moving the selection to the
    // start or around the replaced test. Hint may be "start" or "around".
    function computeReplacedSel(doc, changes, hint) {
      var out = [];
      var oldPrev = Pos(doc.first, 0), newPrev = oldPrev;
      for (var i = 0; i < changes.length; i++) {
        var change = changes[i];
        var from = offsetPos(change.from, oldPrev, newPrev);
        var to = offsetPos(changeEnd(change), oldPrev, newPrev);
        oldPrev = change.to;
        newPrev = to;
        if (hint == "around") {
          var range = doc.sel.ranges[i], inv = cmp(range.head, range.anchor) < 0;
          out[i] = new Range(inv ? to : from, inv ? from : to);
        } else {
          out[i] = new Range(from, from);
        }
      }
      return new Selection(out, doc.sel.primIndex)
    }

    // Used to get the editor into a consistent state again when options change.

    function loadMode(cm) {
      cm.doc.mode = getMode(cm.options, cm.doc.modeOption);
      resetModeState(cm);
    }

    function resetModeState(cm) {
      cm.doc.iter(function (line) {
        if (line.stateAfter) { line.stateAfter = null; }
        if (line.styles) { line.styles = null; }
      });
      cm.doc.modeFrontier = cm.doc.highlightFrontier = cm.doc.first;
      startWorker(cm, 100);
      cm.state.modeGen++;
      if (cm.curOp) { regChange(cm); }
    }

    // DOCUMENT DATA STRUCTURE

    // By default, updates that start and end at the beginning of a line
    // are treated specially, in order to make the association of line
    // widgets and marker elements with the text behave more intuitive.
    function isWholeLineUpdate(doc, change) {
      return change.from.ch == 0 && change.to.ch == 0 && lst(change.text) == "" &&
        (!doc.cm || doc.cm.options.wholeLineUpdateBefore)
    }

    // Perform a change on the document data structure.
    function updateDoc(doc, change, markedSpans, estimateHeight$$1) {
      function spansFor(n) {return markedSpans ? markedSpans[n] : null}
      function update(line, text, spans) {
        updateLine(line, text, spans, estimateHeight$$1);
        signalLater(line, "change", line, change);
      }
      function linesFor(start, end) {
        var result = [];
        for (var i = start; i < end; ++i)
          { result.push(new Line(text[i], spansFor(i), estimateHeight$$1)); }
        return result
      }

      var from = change.from, to = change.to, text = change.text;
      var firstLine = getLine(doc, from.line), lastLine = getLine(doc, to.line);
      var lastText = lst(text), lastSpans = spansFor(text.length - 1), nlines = to.line - from.line;

      // Adjust the line structure
      if (change.full) {
        doc.insert(0, linesFor(0, text.length));
        doc.remove(text.length, doc.size - text.length);
      } else if (isWholeLineUpdate(doc, change)) {
        // This is a whole-line replace. Treated specially to make
        // sure line objects move the way they are supposed to.
        var added = linesFor(0, text.length - 1);
        update(lastLine, lastLine.text, lastSpans);
        if (nlines) { doc.remove(from.line, nlines); }
        if (added.length) { doc.insert(from.line, added); }
      } else if (firstLine == lastLine) {
        if (text.length == 1) {
          update(firstLine, firstLine.text.slice(0, from.ch) + lastText + firstLine.text.slice(to.ch), lastSpans);
        } else {
          var added$1 = linesFor(1, text.length - 1);
          added$1.push(new Line(lastText + firstLine.text.slice(to.ch), lastSpans, estimateHeight$$1));
          update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
          doc.insert(from.line + 1, added$1);
        }
      } else if (text.length == 1) {
        update(firstLine, firstLine.text.slice(0, from.ch) + text[0] + lastLine.text.slice(to.ch), spansFor(0));
        doc.remove(from.line + 1, nlines);
      } else {
        update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
        update(lastLine, lastText + lastLine.text.slice(to.ch), lastSpans);
        var added$2 = linesFor(1, text.length - 1);
        if (nlines > 1) { doc.remove(from.line + 1, nlines - 1); }
        doc.insert(from.line + 1, added$2);
      }

      signalLater(doc, "change", doc, change);
    }

    // Call f for all linked documents.
    function linkedDocs(doc, f, sharedHistOnly) {
      function propagate(doc, skip, sharedHist) {
        if (doc.linked) { for (var i = 0; i < doc.linked.length; ++i) {
          var rel = doc.linked[i];
          if (rel.doc == skip) { continue }
          var shared = sharedHist && rel.sharedHist;
          if (sharedHistOnly && !shared) { continue }
          f(rel.doc, shared);
          propagate(rel.doc, doc, shared);
        } }
      }
      propagate(doc, null, true);
    }

    // Attach a document to an editor.
    function attachDoc(cm, doc) {
      if (doc.cm) { throw new Error("This document is already in use.") }
      cm.doc = doc;
      doc.cm = cm;
      estimateLineHeights(cm);
      loadMode(cm);
      setDirectionClass(cm);
      if (!cm.options.lineWrapping) { findMaxLine(cm); }
      cm.options.mode = doc.modeOption;
      regChange(cm);
    }

    function setDirectionClass(cm) {
    (cm.doc.direction == "rtl" ? addClass : rmClass)(cm.display.lineDiv, "CodeMirror-rtl");
    }

    function directionChanged(cm) {
      runInOp(cm, function () {
        setDirectionClass(cm);
        regChange(cm);
      });
    }

    function History(startGen) {
      // Arrays of change events and selections. Doing something adds an
      // event to done and clears undo. Undoing moves events from done
      // to undone, redoing moves them in the other direction.
      this.done = []; this.undone = [];
      this.undoDepth = Infinity;
      // Used to track when changes can be merged into a single undo
      // event
      this.lastModTime = this.lastSelTime = 0;
      this.lastOp = this.lastSelOp = null;
      this.lastOrigin = this.lastSelOrigin = null;
      // Used by the isClean() method
      this.generation = this.maxGeneration = startGen || 1;
    }

    // Create a history change event from an updateDoc-style change
    // object.
    function historyChangeFromChange(doc, change) {
      var histChange = {from: copyPos(change.from), to: changeEnd(change), text: getBetween(doc, change.from, change.to)};
      attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
      linkedDocs(doc, function (doc) { return attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1); }, true);
      return histChange
    }

    // Pop all selection events off the end of a history array. Stop at
    // a change event.
    function clearSelectionEvents(array) {
      while (array.length) {
        var last = lst(array);
        if (last.ranges) { array.pop(); }
        else { break }
      }
    }

    // Find the top change event in the history. Pop off selection
    // events that are in the way.
    function lastChangeEvent(hist, force) {
      if (force) {
        clearSelectionEvents(hist.done);
        return lst(hist.done)
      } else if (hist.done.length && !lst(hist.done).ranges) {
        return lst(hist.done)
      } else if (hist.done.length > 1 && !hist.done[hist.done.length - 2].ranges) {
        hist.done.pop();
        return lst(hist.done)
      }
    }

    // Register a change in the history. Merges changes that are within
    // a single operation, or are close together with an origin that
    // allows merging (starting with "+") into a single event.
    function addChangeToHistory(doc, change, selAfter, opId) {
      var hist = doc.history;
      hist.undone.length = 0;
      var time = +new Date, cur;
      var last;

      if ((hist.lastOp == opId ||
           hist.lastOrigin == change.origin && change.origin &&
           ((change.origin.charAt(0) == "+" && hist.lastModTime > time - (doc.cm ? doc.cm.options.historyEventDelay : 500)) ||
            change.origin.charAt(0) == "*")) &&
          (cur = lastChangeEvent(hist, hist.lastOp == opId))) {
        // Merge this change into the last event
        last = lst(cur.changes);
        if (cmp(change.from, change.to) == 0 && cmp(change.from, last.to) == 0) {
          // Optimized case for simple insertion -- don't want to add
          // new changesets for every character typed
          last.to = changeEnd(change);
        } else {
          // Add new sub-event
          cur.changes.push(historyChangeFromChange(doc, change));
        }
      } else {
        // Can not be merged, start a new event.
        var before = lst(hist.done);
        if (!before || !before.ranges)
          { pushSelectionToHistory(doc.sel, hist.done); }
        cur = {changes: [historyChangeFromChange(doc, change)],
               generation: hist.generation};
        hist.done.push(cur);
        while (hist.done.length > hist.undoDepth) {
          hist.done.shift();
          if (!hist.done[0].ranges) { hist.done.shift(); }
        }
      }
      hist.done.push(selAfter);
      hist.generation = ++hist.maxGeneration;
      hist.lastModTime = hist.lastSelTime = time;
      hist.lastOp = hist.lastSelOp = opId;
      hist.lastOrigin = hist.lastSelOrigin = change.origin;

      if (!last) { signal(doc, "historyAdded"); }
    }

    function selectionEventCanBeMerged(doc, origin, prev, sel) {
      var ch = origin.charAt(0);
      return ch == "*" ||
        ch == "+" &&
        prev.ranges.length == sel.ranges.length &&
        prev.somethingSelected() == sel.somethingSelected() &&
        new Date - doc.history.lastSelTime <= (doc.cm ? doc.cm.options.historyEventDelay : 500)
    }

    // Called whenever the selection changes, sets the new selection as
    // the pending selection in the history, and pushes the old pending
    // selection into the 'done' array when it was significantly
    // different (in number of selected ranges, emptiness, or time).
    function addSelectionToHistory(doc, sel, opId, options) {
      var hist = doc.history, origin = options && options.origin;

      // A new event is started when the previous origin does not match
      // the current, or the origins don't allow matching. Origins
      // starting with * are always merged, those starting with + are
      // merged when similar and close together in time.
      if (opId == hist.lastSelOp ||
          (origin && hist.lastSelOrigin == origin &&
           (hist.lastModTime == hist.lastSelTime && hist.lastOrigin == origin ||
            selectionEventCanBeMerged(doc, origin, lst(hist.done), sel))))
        { hist.done[hist.done.length - 1] = sel; }
      else
        { pushSelectionToHistory(sel, hist.done); }

      hist.lastSelTime = +new Date;
      hist.lastSelOrigin = origin;
      hist.lastSelOp = opId;
      if (options && options.clearRedo !== false)
        { clearSelectionEvents(hist.undone); }
    }

    function pushSelectionToHistory(sel, dest) {
      var top = lst(dest);
      if (!(top && top.ranges && top.equals(sel)))
        { dest.push(sel); }
    }

    // Used to store marked span information in the history.
    function attachLocalSpans(doc, change, from, to) {
      var existing = change["spans_" + doc.id], n = 0;
      doc.iter(Math.max(doc.first, from), Math.min(doc.first + doc.size, to), function (line) {
        if (line.markedSpans)
          { (existing || (existing = change["spans_" + doc.id] = {}))[n] = line.markedSpans; }
        ++n;
      });
    }

    // When un/re-doing restores text containing marked spans, those
    // that have been explicitly cleared should not be restored.
    function removeClearedSpans(spans) {
      if (!spans) { return null }
      var out;
      for (var i = 0; i < spans.length; ++i) {
        if (spans[i].marker.explicitlyCleared) { if (!out) { out = spans.slice(0, i); } }
        else if (out) { out.push(spans[i]); }
      }
      return !out ? spans : out.length ? out : null
    }

    // Retrieve and filter the old marked spans stored in a change event.
    function getOldSpans(doc, change) {
      var found = change["spans_" + doc.id];
      if (!found) { return null }
      var nw = [];
      for (var i = 0; i < change.text.length; ++i)
        { nw.push(removeClearedSpans(found[i])); }
      return nw
    }

    // Used for un/re-doing changes from the history. Combines the
    // result of computing the existing spans with the set of spans that
    // existed in the history (so that deleting around a span and then
    // undoing brings back the span).
    function mergeOldSpans(doc, change) {
      var old = getOldSpans(doc, change);
      var stretched = stretchSpansOverChange(doc, change);
      if (!old) { return stretched }
      if (!stretched) { return old }

      for (var i = 0; i < old.length; ++i) {
        var oldCur = old[i], stretchCur = stretched[i];
        if (oldCur && stretchCur) {
          spans: for (var j = 0; j < stretchCur.length; ++j) {
            var span = stretchCur[j];
            for (var k = 0; k < oldCur.length; ++k)
              { if (oldCur[k].marker == span.marker) { continue spans } }
            oldCur.push(span);
          }
        } else if (stretchCur) {
          old[i] = stretchCur;
        }
      }
      return old
    }

    // Used both to provide a JSON-safe object in .getHistory, and, when
    // detaching a document, to split the history in two
    function copyHistoryArray(events, newGroup, instantiateSel) {
      var copy = [];
      for (var i = 0; i < events.length; ++i) {
        var event = events[i];
        if (event.ranges) {
          copy.push(instantiateSel ? Selection.prototype.deepCopy.call(event) : event);
          continue
        }
        var changes = event.changes, newChanges = [];
        copy.push({changes: newChanges});
        for (var j = 0; j < changes.length; ++j) {
          var change = changes[j], m = (void 0);
          newChanges.push({from: change.from, to: change.to, text: change.text});
          if (newGroup) { for (var prop in change) { if (m = prop.match(/^spans_(\d+)$/)) {
            if (indexOf(newGroup, Number(m[1])) > -1) {
              lst(newChanges)[prop] = change[prop];
              delete change[prop];
            }
          } } }
        }
      }
      return copy
    }

    // The 'scroll' parameter given to many of these indicated whether
    // the new cursor position should be scrolled into view after
    // modifying the selection.

    // If shift is held or the extend flag is set, extends a range to
    // include a given position (and optionally a second position).
    // Otherwise, simply returns the range between the given positions.
    // Used for cursor motion and such.
    function extendRange(range, head, other, extend) {
      if (extend) {
        var anchor = range.anchor;
        if (other) {
          var posBefore = cmp(head, anchor) < 0;
          if (posBefore != (cmp(other, anchor) < 0)) {
            anchor = head;
            head = other;
          } else if (posBefore != (cmp(head, other) < 0)) {
            head = other;
          }
        }
        return new Range(anchor, head)
      } else {
        return new Range(other || head, head)
      }
    }

    // Extend the primary selection range, discard the rest.
    function extendSelection(doc, head, other, options, extend) {
      if (extend == null) { extend = doc.cm && (doc.cm.display.shift || doc.extend); }
      setSelection(doc, new Selection([extendRange(doc.sel.primary(), head, other, extend)], 0), options);
    }

    // Extend all selections (pos is an array of selections with length
    // equal the number of selections)
    function extendSelections(doc, heads, options) {
      var out = [];
      var extend = doc.cm && (doc.cm.display.shift || doc.extend);
      for (var i = 0; i < doc.sel.ranges.length; i++)
        { out[i] = extendRange(doc.sel.ranges[i], heads[i], null, extend); }
      var newSel = normalizeSelection(doc.cm, out, doc.sel.primIndex);
      setSelection(doc, newSel, options);
    }

    // Updates a single range in the selection.
    function replaceOneSelection(doc, i, range, options) {
      var ranges = doc.sel.ranges.slice(0);
      ranges[i] = range;
      setSelection(doc, normalizeSelection(doc.cm, ranges, doc.sel.primIndex), options);
    }

    // Reset the selection to a single range.
    function setSimpleSelection(doc, anchor, head, options) {
      setSelection(doc, simpleSelection(anchor, head), options);
    }

    // Give beforeSelectionChange handlers a change to influence a
    // selection update.
    function filterSelectionChange(doc, sel, options) {
      var obj = {
        ranges: sel.ranges,
        update: function(ranges) {
          var this$1 = this;

          this.ranges = [];
          for (var i = 0; i < ranges.length; i++)
            { this$1.ranges[i] = new Range(clipPos(doc, ranges[i].anchor),
                                       clipPos(doc, ranges[i].head)); }
        },
        origin: options && options.origin
      };
      signal(doc, "beforeSelectionChange", doc, obj);
      if (doc.cm) { signal(doc.cm, "beforeSelectionChange", doc.cm, obj); }
      if (obj.ranges != sel.ranges) { return normalizeSelection(doc.cm, obj.ranges, obj.ranges.length - 1) }
      else { return sel }
    }

    function setSelectionReplaceHistory(doc, sel, options) {
      var done = doc.history.done, last = lst(done);
      if (last && last.ranges) {
        done[done.length - 1] = sel;
        setSelectionNoUndo(doc, sel, options);
      } else {
        setSelection(doc, sel, options);
      }
    }

    // Set a new selection.
    function setSelection(doc, sel, options) {
      setSelectionNoUndo(doc, sel, options);
      addSelectionToHistory(doc, doc.sel, doc.cm ? doc.cm.curOp.id : NaN, options);
    }

    function setSelectionNoUndo(doc, sel, options) {
      if (hasHandler(doc, "beforeSelectionChange") || doc.cm && hasHandler(doc.cm, "beforeSelectionChange"))
        { sel = filterSelectionChange(doc, sel, options); }

      var bias = options && options.bias ||
        (cmp(sel.primary().head, doc.sel.primary().head) < 0 ? -1 : 1);
      setSelectionInner(doc, skipAtomicInSelection(doc, sel, bias, true));

      if (!(options && options.scroll === false) && doc.cm)
        { ensureCursorVisible(doc.cm); }
    }

    function setSelectionInner(doc, sel) {
      if (sel.equals(doc.sel)) { return }

      doc.sel = sel;

      if (doc.cm) {
        doc.cm.curOp.updateInput = 1;
        doc.cm.curOp.selectionChanged = true;
        signalCursorActivity(doc.cm);
      }
      signalLater(doc, "cursorActivity", doc);
    }

    // Verify that the selection does not partially select any atomic
    // marked ranges.
    function reCheckSelection(doc) {
      setSelectionInner(doc, skipAtomicInSelection(doc, doc.sel, null, false));
    }

    // Return a selection that does not partially select any atomic
    // ranges.
    function skipAtomicInSelection(doc, sel, bias, mayClear) {
      var out;
      for (var i = 0; i < sel.ranges.length; i++) {
        var range = sel.ranges[i];
        var old = sel.ranges.length == doc.sel.ranges.length && doc.sel.ranges[i];
        var newAnchor = skipAtomic(doc, range.anchor, old && old.anchor, bias, mayClear);
        var newHead = skipAtomic(doc, range.head, old && old.head, bias, mayClear);
        if (out || newAnchor != range.anchor || newHead != range.head) {
          if (!out) { out = sel.ranges.slice(0, i); }
          out[i] = new Range(newAnchor, newHead);
        }
      }
      return out ? normalizeSelection(doc.cm, out, sel.primIndex) : sel
    }

    function skipAtomicInner(doc, pos, oldPos, dir, mayClear) {
      var line = getLine(doc, pos.line);
      if (line.markedSpans) { for (var i = 0; i < line.markedSpans.length; ++i) {
        var sp = line.markedSpans[i], m = sp.marker;
        if ((sp.from == null || (m.inclusiveLeft ? sp.from <= pos.ch : sp.from < pos.ch)) &&
            (sp.to == null || (m.inclusiveRight ? sp.to >= pos.ch : sp.to > pos.ch))) {
          if (mayClear) {
            signal(m, "beforeCursorEnter");
            if (m.explicitlyCleared) {
              if (!line.markedSpans) { break }
              else {--i; continue}
            }
          }
          if (!m.atomic) { continue }

          if (oldPos) {
            var near = m.find(dir < 0 ? 1 : -1), diff = (void 0);
            if (dir < 0 ? m.inclusiveRight : m.inclusiveLeft)
              { near = movePos(doc, near, -dir, near && near.line == pos.line ? line : null); }
            if (near && near.line == pos.line && (diff = cmp(near, oldPos)) && (dir < 0 ? diff < 0 : diff > 0))
              { return skipAtomicInner(doc, near, pos, dir, mayClear) }
          }

          var far = m.find(dir < 0 ? -1 : 1);
          if (dir < 0 ? m.inclusiveLeft : m.inclusiveRight)
            { far = movePos(doc, far, dir, far.line == pos.line ? line : null); }
          return far ? skipAtomicInner(doc, far, pos, dir, mayClear) : null
        }
      } }
      return pos
    }

    // Ensure a given position is not inside an atomic range.
    function skipAtomic(doc, pos, oldPos, bias, mayClear) {
      var dir = bias || 1;
      var found = skipAtomicInner(doc, pos, oldPos, dir, mayClear) ||
          (!mayClear && skipAtomicInner(doc, pos, oldPos, dir, true)) ||
          skipAtomicInner(doc, pos, oldPos, -dir, mayClear) ||
          (!mayClear && skipAtomicInner(doc, pos, oldPos, -dir, true));
      if (!found) {
        doc.cantEdit = true;
        return Pos(doc.first, 0)
      }
      return found
    }

    function movePos(doc, pos, dir, line) {
      if (dir < 0 && pos.ch == 0) {
        if (pos.line > doc.first) { return clipPos(doc, Pos(pos.line - 1)) }
        else { return null }
      } else if (dir > 0 && pos.ch == (line || getLine(doc, pos.line)).text.length) {
        if (pos.line < doc.first + doc.size - 1) { return Pos(pos.line + 1, 0) }
        else { return null }
      } else {
        return new Pos(pos.line, pos.ch + dir)
      }
    }

    function selectAll(cm) {
      cm.setSelection(Pos(cm.firstLine(), 0), Pos(cm.lastLine()), sel_dontScroll);
    }

    // UPDATING

    // Allow "beforeChange" event handlers to influence a change
    function filterChange(doc, change, update) {
      var obj = {
        canceled: false,
        from: change.from,
        to: change.to,
        text: change.text,
        origin: change.origin,
        cancel: function () { return obj.canceled = true; }
      };
      if (update) { obj.update = function (from, to, text, origin) {
        if (from) { obj.from = clipPos(doc, from); }
        if (to) { obj.to = clipPos(doc, to); }
        if (text) { obj.text = text; }
        if (origin !== undefined) { obj.origin = origin; }
      }; }
      signal(doc, "beforeChange", doc, obj);
      if (doc.cm) { signal(doc.cm, "beforeChange", doc.cm, obj); }

      if (obj.canceled) {
        if (doc.cm) { doc.cm.curOp.updateInput = 2; }
        return null
      }
      return {from: obj.from, to: obj.to, text: obj.text, origin: obj.origin}
    }

    // Apply a change to a document, and add it to the document's
    // history, and propagating it to all linked documents.
    function makeChange(doc, change, ignoreReadOnly) {
      if (doc.cm) {
        if (!doc.cm.curOp) { return operation(doc.cm, makeChange)(doc, change, ignoreReadOnly) }
        if (doc.cm.state.suppressEdits) { return }
      }

      if (hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")) {
        change = filterChange(doc, change, true);
        if (!change) { return }
      }

      // Possibly split or suppress the update based on the presence
      // of read-only spans in its range.
      var split = sawReadOnlySpans && !ignoreReadOnly && removeReadOnlyRanges(doc, change.from, change.to);
      if (split) {
        for (var i = split.length - 1; i >= 0; --i)
          { makeChangeInner(doc, {from: split[i].from, to: split[i].to, text: i ? [""] : change.text, origin: change.origin}); }
      } else {
        makeChangeInner(doc, change);
      }
    }

    function makeChangeInner(doc, change) {
      if (change.text.length == 1 && change.text[0] == "" && cmp(change.from, change.to) == 0) { return }
      var selAfter = computeSelAfterChange(doc, change);
      addChangeToHistory(doc, change, selAfter, doc.cm ? doc.cm.curOp.id : NaN);

      makeChangeSingleDoc(doc, change, selAfter, stretchSpansOverChange(doc, change));
      var rebased = [];

      linkedDocs(doc, function (doc, sharedHist) {
        if (!sharedHist && indexOf(rebased, doc.history) == -1) {
          rebaseHist(doc.history, change);
          rebased.push(doc.history);
        }
        makeChangeSingleDoc(doc, change, null, stretchSpansOverChange(doc, change));
      });
    }

    // Revert a change stored in a document's history.
    function makeChangeFromHistory(doc, type, allowSelectionOnly) {
      var suppress = doc.cm && doc.cm.state.suppressEdits;
      if (suppress && !allowSelectionOnly) { return }

      var hist = doc.history, event, selAfter = doc.sel;
      var source = type == "undo" ? hist.done : hist.undone, dest = type == "undo" ? hist.undone : hist.done;

      // Verify that there is a useable event (so that ctrl-z won't
      // needlessly clear selection events)
      var i = 0;
      for (; i < source.length; i++) {
        event = source[i];
        if (allowSelectionOnly ? event.ranges && !event.equals(doc.sel) : !event.ranges)
          { break }
      }
      if (i == source.length) { return }
      hist.lastOrigin = hist.lastSelOrigin = null;

      for (;;) {
        event = source.pop();
        if (event.ranges) {
          pushSelectionToHistory(event, dest);
          if (allowSelectionOnly && !event.equals(doc.sel)) {
            setSelection(doc, event, {clearRedo: false});
            return
          }
          selAfter = event;
        } else if (suppress) {
          source.push(event);
          return
        } else { break }
      }

      // Build up a reverse change object to add to the opposite history
      // stack (redo when undoing, and vice versa).
      var antiChanges = [];
      pushSelectionToHistory(selAfter, dest);
      dest.push({changes: antiChanges, generation: hist.generation});
      hist.generation = event.generation || ++hist.maxGeneration;

      var filter = hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange");

      var loop = function ( i ) {
        var change = event.changes[i];
        change.origin = type;
        if (filter && !filterChange(doc, change, false)) {
          source.length = 0;
          return {}
        }

        antiChanges.push(historyChangeFromChange(doc, change));

        var after = i ? computeSelAfterChange(doc, change) : lst(source);
        makeChangeSingleDoc(doc, change, after, mergeOldSpans(doc, change));
        if (!i && doc.cm) { doc.cm.scrollIntoView({from: change.from, to: changeEnd(change)}); }
        var rebased = [];

        // Propagate to the linked documents
        linkedDocs(doc, function (doc, sharedHist) {
          if (!sharedHist && indexOf(rebased, doc.history) == -1) {
            rebaseHist(doc.history, change);
            rebased.push(doc.history);
          }
          makeChangeSingleDoc(doc, change, null, mergeOldSpans(doc, change));
        });
      };

      for (var i$1 = event.changes.length - 1; i$1 >= 0; --i$1) {
        var returned = loop( i$1 );

        if ( returned ) return returned.v;
      }
    }

    // Sub-views need their line numbers shifted when text is added
    // above or below them in the parent document.
    function shiftDoc(doc, distance) {
      if (distance == 0) { return }
      doc.first += distance;
      doc.sel = new Selection(map(doc.sel.ranges, function (range) { return new Range(
        Pos(range.anchor.line + distance, range.anchor.ch),
        Pos(range.head.line + distance, range.head.ch)
      ); }), doc.sel.primIndex);
      if (doc.cm) {
        regChange(doc.cm, doc.first, doc.first - distance, distance);
        for (var d = doc.cm.display, l = d.viewFrom; l < d.viewTo; l++)
          { regLineChange(doc.cm, l, "gutter"); }
      }
    }

    // More lower-level change function, handling only a single document
    // (not linked ones).
    function makeChangeSingleDoc(doc, change, selAfter, spans) {
      if (doc.cm && !doc.cm.curOp)
        { return operation(doc.cm, makeChangeSingleDoc)(doc, change, selAfter, spans) }

      if (change.to.line < doc.first) {
        shiftDoc(doc, change.text.length - 1 - (change.to.line - change.from.line));
        return
      }
      if (change.from.line > doc.lastLine()) { return }

      // Clip the change to the size of this doc
      if (change.from.line < doc.first) {
        var shift = change.text.length - 1 - (doc.first - change.from.line);
        shiftDoc(doc, shift);
        change = {from: Pos(doc.first, 0), to: Pos(change.to.line + shift, change.to.ch),
                  text: [lst(change.text)], origin: change.origin};
      }
      var last = doc.lastLine();
      if (change.to.line > last) {
        change = {from: change.from, to: Pos(last, getLine(doc, last).text.length),
                  text: [change.text[0]], origin: change.origin};
      }

      change.removed = getBetween(doc, change.from, change.to);

      if (!selAfter) { selAfter = computeSelAfterChange(doc, change); }
      if (doc.cm) { makeChangeSingleDocInEditor(doc.cm, change, spans); }
      else { updateDoc(doc, change, spans); }
      setSelectionNoUndo(doc, selAfter, sel_dontScroll);
    }

    // Handle the interaction of a change to a document with the editor
    // that this document is part of.
    function makeChangeSingleDocInEditor(cm, change, spans) {
      var doc = cm.doc, display = cm.display, from = change.from, to = change.to;

      var recomputeMaxLength = false, checkWidthStart = from.line;
      if (!cm.options.lineWrapping) {
        checkWidthStart = lineNo(visualLine(getLine(doc, from.line)));
        doc.iter(checkWidthStart, to.line + 1, function (line) {
          if (line == display.maxLine) {
            recomputeMaxLength = true;
            return true
          }
        });
      }

      if (doc.sel.contains(change.from, change.to) > -1)
        { signalCursorActivity(cm); }

      updateDoc(doc, change, spans, estimateHeight(cm));

      if (!cm.options.lineWrapping) {
        doc.iter(checkWidthStart, from.line + change.text.length, function (line) {
          var len = lineLength(line);
          if (len > display.maxLineLength) {
            display.maxLine = line;
            display.maxLineLength = len;
            display.maxLineChanged = true;
            recomputeMaxLength = false;
          }
        });
        if (recomputeMaxLength) { cm.curOp.updateMaxLine = true; }
      }

      retreatFrontier(doc, from.line);
      startWorker(cm, 400);

      var lendiff = change.text.length - (to.line - from.line) - 1;
      // Remember that these lines changed, for updating the display
      if (change.full)
        { regChange(cm); }
      else if (from.line == to.line && change.text.length == 1 && !isWholeLineUpdate(cm.doc, change))
        { regLineChange(cm, from.line, "text"); }
      else
        { regChange(cm, from.line, to.line + 1, lendiff); }

      var changesHandler = hasHandler(cm, "changes"), changeHandler = hasHandler(cm, "change");
      if (changeHandler || changesHandler) {
        var obj = {
          from: from, to: to,
          text: change.text,
          removed: change.removed,
          origin: change.origin
        };
        if (changeHandler) { signalLater(cm, "change", cm, obj); }
        if (changesHandler) { (cm.curOp.changeObjs || (cm.curOp.changeObjs = [])).push(obj); }
      }
      cm.display.selForContextMenu = null;
    }

    function replaceRange(doc, code, from, to, origin) {
      var assign;

      if (!to) { to = from; }
      if (cmp(to, from) < 0) { (assign = [to, from], from = assign[0], to = assign[1]); }
      if (typeof code == "string") { code = doc.splitLines(code); }
      makeChange(doc, {from: from, to: to, text: code, origin: origin});
    }

    // Rebasing/resetting history to deal with externally-sourced changes

    function rebaseHistSelSingle(pos, from, to, diff) {
      if (to < pos.line) {
        pos.line += diff;
      } else if (from < pos.line) {
        pos.line = from;
        pos.ch = 0;
      }
    }

    // Tries to rebase an array of history events given a change in the
    // document. If the change touches the same lines as the event, the
    // event, and everything 'behind' it, is discarded. If the change is
    // before the event, the event's positions are updated. Uses a
    // copy-on-write scheme for the positions, to avoid having to
    // reallocate them all on every rebase, but also avoid problems with
    // shared position objects being unsafely updated.
    function rebaseHistArray(array, from, to, diff) {
      for (var i = 0; i < array.length; ++i) {
        var sub = array[i], ok = true;
        if (sub.ranges) {
          if (!sub.copied) { sub = array[i] = sub.deepCopy(); sub.copied = true; }
          for (var j = 0; j < sub.ranges.length; j++) {
            rebaseHistSelSingle(sub.ranges[j].anchor, from, to, diff);
            rebaseHistSelSingle(sub.ranges[j].head, from, to, diff);
          }
          continue
        }
        for (var j$1 = 0; j$1 < sub.changes.length; ++j$1) {
          var cur = sub.changes[j$1];
          if (to < cur.from.line) {
            cur.from = Pos(cur.from.line + diff, cur.from.ch);
            cur.to = Pos(cur.to.line + diff, cur.to.ch);
          } else if (from <= cur.to.line) {
            ok = false;
            break
          }
        }
        if (!ok) {
          array.splice(0, i + 1);
          i = 0;
        }
      }
    }

    function rebaseHist(hist, change) {
      var from = change.from.line, to = change.to.line, diff = change.text.length - (to - from) - 1;
      rebaseHistArray(hist.done, from, to, diff);
      rebaseHistArray(hist.undone, from, to, diff);
    }

    // Utility for applying a change to a line by handle or number,
    // returning the number and optionally registering the line as
    // changed.
    function changeLine(doc, handle, changeType, op) {
      var no = handle, line = handle;
      if (typeof handle == "number") { line = getLine(doc, clipLine(doc, handle)); }
      else { no = lineNo(handle); }
      if (no == null) { return null }
      if (op(line, no) && doc.cm) { regLineChange(doc.cm, no, changeType); }
      return line
    }

    // The document is represented as a BTree consisting of leaves, with
    // chunk of lines in them, and branches, with up to ten leaves or
    // other branch nodes below them. The top node is always a branch
    // node, and is the document object itself (meaning it has
    // additional methods and properties).
    //
    // All nodes have parent links. The tree is used both to go from
    // line numbers to line objects, and to go from objects to numbers.
    // It also indexes by height, and is used to convert between height
    // and line object, and to find the total height of the document.
    //
    // See also http://marijnhaverbeke.nl/blog/codemirror-line-tree.html

    function LeafChunk(lines) {
      var this$1 = this;

      this.lines = lines;
      this.parent = null;
      var height = 0;
      for (var i = 0; i < lines.length; ++i) {
        lines[i].parent = this$1;
        height += lines[i].height;
      }
      this.height = height;
    }

    LeafChunk.prototype = {
      chunkSize: function() { return this.lines.length },

      // Remove the n lines at offset 'at'.
      removeInner: function(at, n) {
        var this$1 = this;

        for (var i = at, e = at + n; i < e; ++i) {
          var line = this$1.lines[i];
          this$1.height -= line.height;
          cleanUpLine(line);
          signalLater(line, "delete");
        }
        this.lines.splice(at, n);
      },

      // Helper used to collapse a small branch into a single leaf.
      collapse: function(lines) {
        lines.push.apply(lines, this.lines);
      },

      // Insert the given array of lines at offset 'at', count them as
      // having the given height.
      insertInner: function(at, lines, height) {
        var this$1 = this;

        this.height += height;
        this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at));
        for (var i = 0; i < lines.length; ++i) { lines[i].parent = this$1; }
      },

      // Used to iterate over a part of the tree.
      iterN: function(at, n, op) {
        var this$1 = this;

        for (var e = at + n; at < e; ++at)
          { if (op(this$1.lines[at])) { return true } }
      }
    };

    function BranchChunk(children) {
      var this$1 = this;

      this.children = children;
      var size = 0, height = 0;
      for (var i = 0; i < children.length; ++i) {
        var ch = children[i];
        size += ch.chunkSize(); height += ch.height;
        ch.parent = this$1;
      }
      this.size = size;
      this.height = height;
      this.parent = null;
    }

    BranchChunk.prototype = {
      chunkSize: function() { return this.size },

      removeInner: function(at, n) {
        var this$1 = this;

        this.size -= n;
        for (var i = 0; i < this.children.length; ++i) {
          var child = this$1.children[i], sz = child.chunkSize();
          if (at < sz) {
            var rm = Math.min(n, sz - at), oldHeight = child.height;
            child.removeInner(at, rm);
            this$1.height -= oldHeight - child.height;
            if (sz == rm) { this$1.children.splice(i--, 1); child.parent = null; }
            if ((n -= rm) == 0) { break }
            at = 0;
          } else { at -= sz; }
        }
        // If the result is smaller than 25 lines, ensure that it is a
        // single leaf node.
        if (this.size - n < 25 &&
            (this.children.length > 1 || !(this.children[0] instanceof LeafChunk))) {
          var lines = [];
          this.collapse(lines);
          this.children = [new LeafChunk(lines)];
          this.children[0].parent = this;
        }
      },

      collapse: function(lines) {
        var this$1 = this;

        for (var i = 0; i < this.children.length; ++i) { this$1.children[i].collapse(lines); }
      },

      insertInner: function(at, lines, height) {
        var this$1 = this;

        this.size += lines.length;
        this.height += height;
        for (var i = 0; i < this.children.length; ++i) {
          var child = this$1.children[i], sz = child.chunkSize();
          if (at <= sz) {
            child.insertInner(at, lines, height);
            if (child.lines && child.lines.length > 50) {
              // To avoid memory thrashing when child.lines is huge (e.g. first view of a large file), it's never spliced.
              // Instead, small slices are taken. They're taken in order because sequential memory accesses are fastest.
              var remaining = child.lines.length % 25 + 25;
              for (var pos = remaining; pos < child.lines.length;) {
                var leaf = new LeafChunk(child.lines.slice(pos, pos += 25));
                child.height -= leaf.height;
                this$1.children.splice(++i, 0, leaf);
                leaf.parent = this$1;
              }
              child.lines = child.lines.slice(0, remaining);
              this$1.maybeSpill();
            }
            break
          }
          at -= sz;
        }
      },

      // When a node has grown, check whether it should be split.
      maybeSpill: function() {
        if (this.children.length <= 10) { return }
        var me = this;
        do {
          var spilled = me.children.splice(me.children.length - 5, 5);
          var sibling = new BranchChunk(spilled);
          if (!me.parent) { // Become the parent node
            var copy = new BranchChunk(me.children);
            copy.parent = me;
            me.children = [copy, sibling];
            me = copy;
         } else {
            me.size -= sibling.size;
            me.height -= sibling.height;
            var myIndex = indexOf(me.parent.children, me);
            me.parent.children.splice(myIndex + 1, 0, sibling);
          }
          sibling.parent = me.parent;
        } while (me.children.length > 10)
        me.parent.maybeSpill();
      },

      iterN: function(at, n, op) {
        var this$1 = this;

        for (var i = 0; i < this.children.length; ++i) {
          var child = this$1.children[i], sz = child.chunkSize();
          if (at < sz) {
            var used = Math.min(n, sz - at);
            if (child.iterN(at, used, op)) { return true }
            if ((n -= used) == 0) { break }
            at = 0;
          } else { at -= sz; }
        }
      }
    };

    // Line widgets are block elements displayed above or below a line.

    var LineWidget = function(doc, node, options) {
      var this$1 = this;

      if (options) { for (var opt in options) { if (options.hasOwnProperty(opt))
        { this$1[opt] = options[opt]; } } }
      this.doc = doc;
      this.node = node;
    };

    LineWidget.prototype.clear = function () {
        var this$1 = this;

      var cm = this.doc.cm, ws = this.line.widgets, line = this.line, no = lineNo(line);
      if (no == null || !ws) { return }
      for (var i = 0; i < ws.length; ++i) { if (ws[i] == this$1) { ws.splice(i--, 1); } }
      if (!ws.length) { line.widgets = null; }
      var height = widgetHeight(this);
      updateLineHeight(line, Math.max(0, line.height - height));
      if (cm) {
        runInOp(cm, function () {
          adjustScrollWhenAboveVisible(cm, line, -height);
          regLineChange(cm, no, "widget");
        });
        signalLater(cm, "lineWidgetCleared", cm, this, no);
      }
    };

    LineWidget.prototype.changed = function () {
        var this$1 = this;

      var oldH = this.height, cm = this.doc.cm, line = this.line;
      this.height = null;
      var diff = widgetHeight(this) - oldH;
      if (!diff) { return }
      if (!lineIsHidden(this.doc, line)) { updateLineHeight(line, line.height + diff); }
      if (cm) {
        runInOp(cm, function () {
          cm.curOp.forceUpdate = true;
          adjustScrollWhenAboveVisible(cm, line, diff);
          signalLater(cm, "lineWidgetChanged", cm, this$1, lineNo(line));
        });
      }
    };
    eventMixin(LineWidget);

    function adjustScrollWhenAboveVisible(cm, line, diff) {
      if (heightAtLine(line) < ((cm.curOp && cm.curOp.scrollTop) || cm.doc.scrollTop))
        { addToScrollTop(cm, diff); }
    }

    function addLineWidget(doc, handle, node, options) {
      var widget = new LineWidget(doc, node, options);
      var cm = doc.cm;
      if (cm && widget.noHScroll) { cm.display.alignWidgets = true; }
      changeLine(doc, handle, "widget", function (line) {
        var widgets = line.widgets || (line.widgets = []);
        if (widget.insertAt == null) { widgets.push(widget); }
        else { widgets.splice(Math.min(widgets.length - 1, Math.max(0, widget.insertAt)), 0, widget); }
        widget.line = line;
        if (cm && !lineIsHidden(doc, line)) {
          var aboveVisible = heightAtLine(line) < doc.scrollTop;
          updateLineHeight(line, line.height + widgetHeight(widget));
          if (aboveVisible) { addToScrollTop(cm, widget.height); }
          cm.curOp.forceUpdate = true;
        }
        return true
      });
      if (cm) { signalLater(cm, "lineWidgetAdded", cm, widget, typeof handle == "number" ? handle : lineNo(handle)); }
      return widget
    }

    // TEXTMARKERS

    // Created with markText and setBookmark methods. A TextMarker is a
    // handle that can be used to clear or find a marked position in the
    // document. Line objects hold arrays (markedSpans) containing
    // {from, to, marker} object pointing to such marker objects, and
    // indicating that such a marker is present on that line. Multiple
    // lines may point to the same marker when it spans across lines.
    // The spans will have null for their from/to properties when the
    // marker continues beyond the start/end of the line. Markers have
    // links back to the lines they currently touch.

    // Collapsed markers have unique ids, in order to be able to order
    // them, which is needed for uniquely determining an outer marker
    // when they overlap (they may nest, but not partially overlap).
    var nextMarkerId = 0;

    var TextMarker = function(doc, type) {
      this.lines = [];
      this.type = type;
      this.doc = doc;
      this.id = ++nextMarkerId;
    };

    // Clear the marker.
    TextMarker.prototype.clear = function () {
        var this$1 = this;

      if (this.explicitlyCleared) { return }
      var cm = this.doc.cm, withOp = cm && !cm.curOp;
      if (withOp) { startOperation(cm); }
      if (hasHandler(this, "clear")) {
        var found = this.find();
        if (found) { signalLater(this, "clear", found.from, found.to); }
      }
      var min = null, max = null;
      for (var i = 0; i < this.lines.length; ++i) {
        var line = this$1.lines[i];
        var span = getMarkedSpanFor(line.markedSpans, this$1);
        if (cm && !this$1.collapsed) { regLineChange(cm, lineNo(line), "text"); }
        else if (cm) {
          if (span.to != null) { max = lineNo(line); }
          if (span.from != null) { min = lineNo(line); }
        }
        line.markedSpans = removeMarkedSpan(line.markedSpans, span);
        if (span.from == null && this$1.collapsed && !lineIsHidden(this$1.doc, line) && cm)
          { updateLineHeight(line, textHeight(cm.display)); }
      }
      if (cm && this.collapsed && !cm.options.lineWrapping) { for (var i$1 = 0; i$1 < this.lines.length; ++i$1) {
        var visual = visualLine(this$1.lines[i$1]), len = lineLength(visual);
        if (len > cm.display.maxLineLength) {
          cm.display.maxLine = visual;
          cm.display.maxLineLength = len;
          cm.display.maxLineChanged = true;
        }
      } }

      if (min != null && cm && this.collapsed) { regChange(cm, min, max + 1); }
      this.lines.length = 0;
      this.explicitlyCleared = true;
      if (this.atomic && this.doc.cantEdit) {
        this.doc.cantEdit = false;
        if (cm) { reCheckSelection(cm.doc); }
      }
      if (cm) { signalLater(cm, "markerCleared", cm, this, min, max); }
      if (withOp) { endOperation(cm); }
      if (this.parent) { this.parent.clear(); }
    };

    // Find the position of the marker in the document. Returns a {from,
    // to} object by default. Side can be passed to get a specific side
    // -- 0 (both), -1 (left), or 1 (right). When lineObj is true, the
    // Pos objects returned contain a line object, rather than a line
    // number (used to prevent looking up the same line twice).
    TextMarker.prototype.find = function (side, lineObj) {
        var this$1 = this;

      if (side == null && this.type == "bookmark") { side = 1; }
      var from, to;
      for (var i = 0; i < this.lines.length; ++i) {
        var line = this$1.lines[i];
        var span = getMarkedSpanFor(line.markedSpans, this$1);
        if (span.from != null) {
          from = Pos(lineObj ? line : lineNo(line), span.from);
          if (side == -1) { return from }
        }
        if (span.to != null) {
          to = Pos(lineObj ? line : lineNo(line), span.to);
          if (side == 1) { return to }
        }
      }
      return from && {from: from, to: to}
    };

    // Signals that the marker's widget changed, and surrounding layout
    // should be recomputed.
    TextMarker.prototype.changed = function () {
        var this$1 = this;

      var pos = this.find(-1, true), widget = this, cm = this.doc.cm;
      if (!pos || !cm) { return }
      runInOp(cm, function () {
        var line = pos.line, lineN = lineNo(pos.line);
        var view = findViewForLine(cm, lineN);
        if (view) {
          clearLineMeasurementCacheFor(view);
          cm.curOp.selectionChanged = cm.curOp.forceUpdate = true;
        }
        cm.curOp.updateMaxLine = true;
        if (!lineIsHidden(widget.doc, line) && widget.height != null) {
          var oldHeight = widget.height;
          widget.height = null;
          var dHeight = widgetHeight(widget) - oldHeight;
          if (dHeight)
            { updateLineHeight(line, line.height + dHeight); }
        }
        signalLater(cm, "markerChanged", cm, this$1);
      });
    };

    TextMarker.prototype.attachLine = function (line) {
      if (!this.lines.length && this.doc.cm) {
        var op = this.doc.cm.curOp;
        if (!op.maybeHiddenMarkers || indexOf(op.maybeHiddenMarkers, this) == -1)
          { (op.maybeUnhiddenMarkers || (op.maybeUnhiddenMarkers = [])).push(this); }
      }
      this.lines.push(line);
    };

    TextMarker.prototype.detachLine = function (line) {
      this.lines.splice(indexOf(this.lines, line), 1);
      if (!this.lines.length && this.doc.cm) {
        var op = this.doc.cm.curOp
        ;(op.maybeHiddenMarkers || (op.maybeHiddenMarkers = [])).push(this);
      }
    };
    eventMixin(TextMarker);

    // Create a marker, wire it up to the right lines, and
    function markText(doc, from, to, options, type) {
      // Shared markers (across linked documents) are handled separately
      // (markTextShared will call out to this again, once per
      // document).
      if (options && options.shared) { return markTextShared(doc, from, to, options, type) }
      // Ensure we are in an operation.
      if (doc.cm && !doc.cm.curOp) { return operation(doc.cm, markText)(doc, from, to, options, type) }

      var marker = new TextMarker(doc, type), diff = cmp(from, to);
      if (options) { copyObj(options, marker, false); }
      // Don't connect empty markers unless clearWhenEmpty is false
      if (diff > 0 || diff == 0 && marker.clearWhenEmpty !== false)
        { return marker }
      if (marker.replacedWith) {
        // Showing up as a widget implies collapsed (widget replaces text)
        marker.collapsed = true;
        marker.widgetNode = eltP("span", [marker.replacedWith], "CodeMirror-widget");
        if (!options.handleMouseEvents) { marker.widgetNode.setAttribute("cm-ignore-events", "true"); }
        if (options.insertLeft) { marker.widgetNode.insertLeft = true; }
      }
      if (marker.collapsed) {
        if (conflictingCollapsedRange(doc, from.line, from, to, marker) ||
            from.line != to.line && conflictingCollapsedRange(doc, to.line, from, to, marker))
          { throw new Error("Inserting collapsed marker partially overlapping an existing one") }
        seeCollapsedSpans();
      }

      if (marker.addToHistory)
        { addChangeToHistory(doc, {from: from, to: to, origin: "markText"}, doc.sel, NaN); }

      var curLine = from.line, cm = doc.cm, updateMaxLine;
      doc.iter(curLine, to.line + 1, function (line) {
        if (cm && marker.collapsed && !cm.options.lineWrapping && visualLine(line) == cm.display.maxLine)
          { updateMaxLine = true; }
        if (marker.collapsed && curLine != from.line) { updateLineHeight(line, 0); }
        addMarkedSpan(line, new MarkedSpan(marker,
                                           curLine == from.line ? from.ch : null,
                                           curLine == to.line ? to.ch : null));
        ++curLine;
      });
      // lineIsHidden depends on the presence of the spans, so needs a second pass
      if (marker.collapsed) { doc.iter(from.line, to.line + 1, function (line) {
        if (lineIsHidden(doc, line)) { updateLineHeight(line, 0); }
      }); }

      if (marker.clearOnEnter) { on(marker, "beforeCursorEnter", function () { return marker.clear(); }); }

      if (marker.readOnly) {
        seeReadOnlySpans();
        if (doc.history.done.length || doc.history.undone.length)
          { doc.clearHistory(); }
      }
      if (marker.collapsed) {
        marker.id = ++nextMarkerId;
        marker.atomic = true;
      }
      if (cm) {
        // Sync editor state
        if (updateMaxLine) { cm.curOp.updateMaxLine = true; }
        if (marker.collapsed)
          { regChange(cm, from.line, to.line + 1); }
        else if (marker.className || marker.startStyle || marker.endStyle || marker.css ||
                 marker.attributes || marker.title)
          { for (var i = from.line; i <= to.line; i++) { regLineChange(cm, i, "text"); } }
        if (marker.atomic) { reCheckSelection(cm.doc); }
        signalLater(cm, "markerAdded", cm, marker);
      }
      return marker
    }

    // SHARED TEXTMARKERS

    // A shared marker spans multiple linked documents. It is
    // implemented as a meta-marker-object controlling multiple normal
    // markers.
    var SharedTextMarker = function(markers, primary) {
      var this$1 = this;

      this.markers = markers;
      this.primary = primary;
      for (var i = 0; i < markers.length; ++i)
        { markers[i].parent = this$1; }
    };

    SharedTextMarker.prototype.clear = function () {
        var this$1 = this;

      if (this.explicitlyCleared) { return }
      this.explicitlyCleared = true;
      for (var i = 0; i < this.markers.length; ++i)
        { this$1.markers[i].clear(); }
      signalLater(this, "clear");
    };

    SharedTextMarker.prototype.find = function (side, lineObj) {
      return this.primary.find(side, lineObj)
    };
    eventMixin(SharedTextMarker);

    function markTextShared(doc, from, to, options, type) {
      options = copyObj(options);
      options.shared = false;
      var markers = [markText(doc, from, to, options, type)], primary = markers[0];
      var widget = options.widgetNode;
      linkedDocs(doc, function (doc) {
        if (widget) { options.widgetNode = widget.cloneNode(true); }
        markers.push(markText(doc, clipPos(doc, from), clipPos(doc, to), options, type));
        for (var i = 0; i < doc.linked.length; ++i)
          { if (doc.linked[i].isParent) { return } }
        primary = lst(markers);
      });
      return new SharedTextMarker(markers, primary)
    }

    function findSharedMarkers(doc) {
      return doc.findMarks(Pos(doc.first, 0), doc.clipPos(Pos(doc.lastLine())), function (m) { return m.parent; })
    }

    function copySharedMarkers(doc, markers) {
      for (var i = 0; i < markers.length; i++) {
        var marker = markers[i], pos = marker.find();
        var mFrom = doc.clipPos(pos.from), mTo = doc.clipPos(pos.to);
        if (cmp(mFrom, mTo)) {
          var subMark = markText(doc, mFrom, mTo, marker.primary, marker.primary.type);
          marker.markers.push(subMark);
          subMark.parent = marker;
        }
      }
    }

    function detachSharedMarkers(markers) {
      var loop = function ( i ) {
        var marker = markers[i], linked = [marker.primary.doc];
        linkedDocs(marker.primary.doc, function (d) { return linked.push(d); });
        for (var j = 0; j < marker.markers.length; j++) {
          var subMarker = marker.markers[j];
          if (indexOf(linked, subMarker.doc) == -1) {
            subMarker.parent = null;
            marker.markers.splice(j--, 1);
          }
        }
      };

      for (var i = 0; i < markers.length; i++) loop( i );
    }

    var nextDocId = 0;
    var Doc = function(text, mode, firstLine, lineSep, direction) {
      if (!(this instanceof Doc)) { return new Doc(text, mode, firstLine, lineSep, direction) }
      if (firstLine == null) { firstLine = 0; }

      BranchChunk.call(this, [new LeafChunk([new Line("", null)])]);
      this.first = firstLine;
      this.scrollTop = this.scrollLeft = 0;
      this.cantEdit = false;
      this.cleanGeneration = 1;
      this.modeFrontier = this.highlightFrontier = firstLine;
      var start = Pos(firstLine, 0);
      this.sel = simpleSelection(start);
      this.history = new History(null);
      this.id = ++nextDocId;
      this.modeOption = mode;
      this.lineSep = lineSep;
      this.direction = (direction == "rtl") ? "rtl" : "ltr";
      this.extend = false;

      if (typeof text == "string") { text = this.splitLines(text); }
      updateDoc(this, {from: start, to: start, text: text});
      setSelection(this, simpleSelection(start), sel_dontScroll);
    };

    Doc.prototype = createObj(BranchChunk.prototype, {
      constructor: Doc,
      // Iterate over the document. Supports two forms -- with only one
      // argument, it calls that for each line in the document. With
      // three, it iterates over the range given by the first two (with
      // the second being non-inclusive).
      iter: function(from, to, op) {
        if (op) { this.iterN(from - this.first, to - from, op); }
        else { this.iterN(this.first, this.first + this.size, from); }
      },

      // Non-public interface for adding and removing lines.
      insert: function(at, lines) {
        var height = 0;
        for (var i = 0; i < lines.length; ++i) { height += lines[i].height; }
        this.insertInner(at - this.first, lines, height);
      },
      remove: function(at, n) { this.removeInner(at - this.first, n); },

      // From here, the methods are part of the public interface. Most
      // are also available from CodeMirror (editor) instances.

      getValue: function(lineSep) {
        var lines = getLines(this, this.first, this.first + this.size);
        if (lineSep === false) { return lines }
        return lines.join(lineSep || this.lineSeparator())
      },
      setValue: docMethodOp(function(code) {
        var top = Pos(this.first, 0), last = this.first + this.size - 1;
        makeChange(this, {from: top, to: Pos(last, getLine(this, last).text.length),
                          text: this.splitLines(code), origin: "setValue", full: true}, true);
        if (this.cm) { scrollToCoords(this.cm, 0, 0); }
        setSelection(this, simpleSelection(top), sel_dontScroll);
      }),
      replaceRange: function(code, from, to, origin) {
        from = clipPos(this, from);
        to = to ? clipPos(this, to) : from;
        replaceRange(this, code, from, to, origin);
      },
      getRange: function(from, to, lineSep) {
        var lines = getBetween(this, clipPos(this, from), clipPos(this, to));
        if (lineSep === false) { return lines }
        return lines.join(lineSep || this.lineSeparator())
      },

      getLine: function(line) {var l = this.getLineHandle(line); return l && l.text},

      getLineHandle: function(line) {if (isLine(this, line)) { return getLine(this, line) }},
      getLineNumber: function(line) {return lineNo(line)},

      getLineHandleVisualStart: function(line) {
        if (typeof line == "number") { line = getLine(this, line); }
        return visualLine(line)
      },

      lineCount: function() {return this.size},
      firstLine: function() {return this.first},
      lastLine: function() {return this.first + this.size - 1},

      clipPos: function(pos) {return clipPos(this, pos)},

      getCursor: function(start) {
        var range$$1 = this.sel.primary(), pos;
        if (start == null || start == "head") { pos = range$$1.head; }
        else if (start == "anchor") { pos = range$$1.anchor; }
        else if (start == "end" || start == "to" || start === false) { pos = range$$1.to(); }
        else { pos = range$$1.from(); }
        return pos
      },
      listSelections: function() { return this.sel.ranges },
      somethingSelected: function() {return this.sel.somethingSelected()},

      setCursor: docMethodOp(function(line, ch, options) {
        setSimpleSelection(this, clipPos(this, typeof line == "number" ? Pos(line, ch || 0) : line), null, options);
      }),
      setSelection: docMethodOp(function(anchor, head, options) {
        setSimpleSelection(this, clipPos(this, anchor), clipPos(this, head || anchor), options);
      }),
      extendSelection: docMethodOp(function(head, other, options) {
        extendSelection(this, clipPos(this, head), other && clipPos(this, other), options);
      }),
      extendSelections: docMethodOp(function(heads, options) {
        extendSelections(this, clipPosArray(this, heads), options);
      }),
      extendSelectionsBy: docMethodOp(function(f, options) {
        var heads = map(this.sel.ranges, f);
        extendSelections(this, clipPosArray(this, heads), options);
      }),
      setSelections: docMethodOp(function(ranges, primary, options) {
        var this$1 = this;

        if (!ranges.length) { return }
        var out = [];
        for (var i = 0; i < ranges.length; i++)
          { out[i] = new Range(clipPos(this$1, ranges[i].anchor),
                             clipPos(this$1, ranges[i].head)); }
        if (primary == null) { primary = Math.min(ranges.length - 1, this.sel.primIndex); }
        setSelection(this, normalizeSelection(this.cm, out, primary), options);
      }),
      addSelection: docMethodOp(function(anchor, head, options) {
        var ranges = this.sel.ranges.slice(0);
        ranges.push(new Range(clipPos(this, anchor), clipPos(this, head || anchor)));
        setSelection(this, normalizeSelection(this.cm, ranges, ranges.length - 1), options);
      }),

      getSelection: function(lineSep) {
        var this$1 = this;

        var ranges = this.sel.ranges, lines;
        for (var i = 0; i < ranges.length; i++) {
          var sel = getBetween(this$1, ranges[i].from(), ranges[i].to());
          lines = lines ? lines.concat(sel) : sel;
        }
        if (lineSep === false) { return lines }
        else { return lines.join(lineSep || this.lineSeparator()) }
      },
      getSelections: function(lineSep) {
        var this$1 = this;

        var parts = [], ranges = this.sel.ranges;
        for (var i = 0; i < ranges.length; i++) {
          var sel = getBetween(this$1, ranges[i].from(), ranges[i].to());
          if (lineSep !== false) { sel = sel.join(lineSep || this$1.lineSeparator()); }
          parts[i] = sel;
        }
        return parts
      },
      replaceSelection: function(code, collapse, origin) {
        var dup = [];
        for (var i = 0; i < this.sel.ranges.length; i++)
          { dup[i] = code; }
        this.replaceSelections(dup, collapse, origin || "+input");
      },
      replaceSelections: docMethodOp(function(code, collapse, origin) {
        var this$1 = this;

        var changes = [], sel = this.sel;
        for (var i = 0; i < sel.ranges.length; i++) {
          var range$$1 = sel.ranges[i];
          changes[i] = {from: range$$1.from(), to: range$$1.to(), text: this$1.splitLines(code[i]), origin: origin};
        }
        var newSel = collapse && collapse != "end" && computeReplacedSel(this, changes, collapse);
        for (var i$1 = changes.length - 1; i$1 >= 0; i$1--)
          { makeChange(this$1, changes[i$1]); }
        if (newSel) { setSelectionReplaceHistory(this, newSel); }
        else if (this.cm) { ensureCursorVisible(this.cm); }
      }),
      undo: docMethodOp(function() {makeChangeFromHistory(this, "undo");}),
      redo: docMethodOp(function() {makeChangeFromHistory(this, "redo");}),
      undoSelection: docMethodOp(function() {makeChangeFromHistory(this, "undo", true);}),
      redoSelection: docMethodOp(function() {makeChangeFromHistory(this, "redo", true);}),

      setExtending: function(val) {this.extend = val;},
      getExtending: function() {return this.extend},

      historySize: function() {
        var hist = this.history, done = 0, undone = 0;
        for (var i = 0; i < hist.done.length; i++) { if (!hist.done[i].ranges) { ++done; } }
        for (var i$1 = 0; i$1 < hist.undone.length; i$1++) { if (!hist.undone[i$1].ranges) { ++undone; } }
        return {undo: done, redo: undone}
      },
      clearHistory: function() {this.history = new History(this.history.maxGeneration);},

      markClean: function() {
        this.cleanGeneration = this.changeGeneration(true);
      },
      changeGeneration: function(forceSplit) {
        if (forceSplit)
          { this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null; }
        return this.history.generation
      },
      isClean: function (gen) {
        return this.history.generation == (gen || this.cleanGeneration)
      },

      getHistory: function() {
        return {done: copyHistoryArray(this.history.done),
                undone: copyHistoryArray(this.history.undone)}
      },
      setHistory: function(histData) {
        var hist = this.history = new History(this.history.maxGeneration);
        hist.done = copyHistoryArray(histData.done.slice(0), null, true);
        hist.undone = copyHistoryArray(histData.undone.slice(0), null, true);
      },

      setGutterMarker: docMethodOp(function(line, gutterID, value) {
        return changeLine(this, line, "gutter", function (line) {
          var markers = line.gutterMarkers || (line.gutterMarkers = {});
          markers[gutterID] = value;
          if (!value && isEmpty(markers)) { line.gutterMarkers = null; }
          return true
        })
      }),

      clearGutter: docMethodOp(function(gutterID) {
        var this$1 = this;

        this.iter(function (line) {
          if (line.gutterMarkers && line.gutterMarkers[gutterID]) {
            changeLine(this$1, line, "gutter", function () {
              line.gutterMarkers[gutterID] = null;
              if (isEmpty(line.gutterMarkers)) { line.gutterMarkers = null; }
              return true
            });
          }
        });
      }),

      lineInfo: function(line) {
        var n;
        if (typeof line == "number") {
          if (!isLine(this, line)) { return null }
          n = line;
          line = getLine(this, line);
          if (!line) { return null }
        } else {
          n = lineNo(line);
          if (n == null) { return null }
        }
        return {line: n, handle: line, text: line.text, gutterMarkers: line.gutterMarkers,
                textClass: line.textClass, bgClass: line.bgClass, wrapClass: line.wrapClass,
                widgets: line.widgets}
      },

      addLineClass: docMethodOp(function(handle, where, cls) {
        return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function (line) {
          var prop = where == "text" ? "textClass"
                   : where == "background" ? "bgClass"
                   : where == "gutter" ? "gutterClass" : "wrapClass";
          if (!line[prop]) { line[prop] = cls; }
          else if (classTest(cls).test(line[prop])) { return false }
          else { line[prop] += " " + cls; }
          return true
        })
      }),
      removeLineClass: docMethodOp(function(handle, where, cls) {
        return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function (line) {
          var prop = where == "text" ? "textClass"
                   : where == "background" ? "bgClass"
                   : where == "gutter" ? "gutterClass" : "wrapClass";
          var cur = line[prop];
          if (!cur) { return false }
          else if (cls == null) { line[prop] = null; }
          else {
            var found = cur.match(classTest(cls));
            if (!found) { return false }
            var end = found.index + found[0].length;
            line[prop] = cur.slice(0, found.index) + (!found.index || end == cur.length ? "" : " ") + cur.slice(end) || null;
          }
          return true
        })
      }),

      addLineWidget: docMethodOp(function(handle, node, options) {
        return addLineWidget(this, handle, node, options)
      }),
      removeLineWidget: function(widget) { widget.clear(); },

      markText: function(from, to, options) {
        return markText(this, clipPos(this, from), clipPos(this, to), options, options && options.type || "range")
      },
      setBookmark: function(pos, options) {
        var realOpts = {replacedWith: options && (options.nodeType == null ? options.widget : options),
                        insertLeft: options && options.insertLeft,
                        clearWhenEmpty: false, shared: options && options.shared,
                        handleMouseEvents: options && options.handleMouseEvents};
        pos = clipPos(this, pos);
        return markText(this, pos, pos, realOpts, "bookmark")
      },
      findMarksAt: function(pos) {
        pos = clipPos(this, pos);
        var markers = [], spans = getLine(this, pos.line).markedSpans;
        if (spans) { for (var i = 0; i < spans.length; ++i) {
          var span = spans[i];
          if ((span.from == null || span.from <= pos.ch) &&
              (span.to == null || span.to >= pos.ch))
            { markers.push(span.marker.parent || span.marker); }
        } }
        return markers
      },
      findMarks: function(from, to, filter) {
        from = clipPos(this, from); to = clipPos(this, to);
        var found = [], lineNo$$1 = from.line;
        this.iter(from.line, to.line + 1, function (line) {
          var spans = line.markedSpans;
          if (spans) { for (var i = 0; i < spans.length; i++) {
            var span = spans[i];
            if (!(span.to != null && lineNo$$1 == from.line && from.ch >= span.to ||
                  span.from == null && lineNo$$1 != from.line ||
                  span.from != null && lineNo$$1 == to.line && span.from >= to.ch) &&
                (!filter || filter(span.marker)))
              { found.push(span.marker.parent || span.marker); }
          } }
          ++lineNo$$1;
        });
        return found
      },
      getAllMarks: function() {
        var markers = [];
        this.iter(function (line) {
          var sps = line.markedSpans;
          if (sps) { for (var i = 0; i < sps.length; ++i)
            { if (sps[i].from != null) { markers.push(sps[i].marker); } } }
        });
        return markers
      },

      posFromIndex: function(off) {
        var ch, lineNo$$1 = this.first, sepSize = this.lineSeparator().length;
        this.iter(function (line) {
          var sz = line.text.length + sepSize;
          if (sz > off) { ch = off; return true }
          off -= sz;
          ++lineNo$$1;
        });
        return clipPos(this, Pos(lineNo$$1, ch))
      },
      indexFromPos: function (coords) {
        coords = clipPos(this, coords);
        var index = coords.ch;
        if (coords.line < this.first || coords.ch < 0) { return 0 }
        var sepSize = this.lineSeparator().length;
        this.iter(this.first, coords.line, function (line) { // iter aborts when callback returns a truthy value
          index += line.text.length + sepSize;
        });
        return index
      },

      copy: function(copyHistory) {
        var doc = new Doc(getLines(this, this.first, this.first + this.size),
                          this.modeOption, this.first, this.lineSep, this.direction);
        doc.scrollTop = this.scrollTop; doc.scrollLeft = this.scrollLeft;
        doc.sel = this.sel;
        doc.extend = false;
        if (copyHistory) {
          doc.history.undoDepth = this.history.undoDepth;
          doc.setHistory(this.getHistory());
        }
        return doc
      },

      linkedDoc: function(options) {
        if (!options) { options = {}; }
        var from = this.first, to = this.first + this.size;
        if (options.from != null && options.from > from) { from = options.from; }
        if (options.to != null && options.to < to) { to = options.to; }
        var copy = new Doc(getLines(this, from, to), options.mode || this.modeOption, from, this.lineSep, this.direction);
        if (options.sharedHist) { copy.history = this.history
        ; }(this.linked || (this.linked = [])).push({doc: copy, sharedHist: options.sharedHist});
        copy.linked = [{doc: this, isParent: true, sharedHist: options.sharedHist}];
        copySharedMarkers(copy, findSharedMarkers(this));
        return copy
      },
      unlinkDoc: function(other) {
        var this$1 = this;

        if (other instanceof CodeMirror) { other = other.doc; }
        if (this.linked) { for (var i = 0; i < this.linked.length; ++i) {
          var link = this$1.linked[i];
          if (link.doc != other) { continue }
          this$1.linked.splice(i, 1);
          other.unlinkDoc(this$1);
          detachSharedMarkers(findSharedMarkers(this$1));
          break
        } }
        // If the histories were shared, split them again
        if (other.history == this.history) {
          var splitIds = [other.id];
          linkedDocs(other, function (doc) { return splitIds.push(doc.id); }, true);
          other.history = new History(null);
          other.history.done = copyHistoryArray(this.history.done, splitIds);
          other.history.undone = copyHistoryArray(this.history.undone, splitIds);
        }
      },
      iterLinkedDocs: function(f) {linkedDocs(this, f);},

      getMode: function() {return this.mode},
      getEditor: function() {return this.cm},

      splitLines: function(str) {
        if (this.lineSep) { return str.split(this.lineSep) }
        return splitLinesAuto(str)
      },
      lineSeparator: function() { return this.lineSep || "\n" },

      setDirection: docMethodOp(function (dir) {
        if (dir != "rtl") { dir = "ltr"; }
        if (dir == this.direction) { return }
        this.direction = dir;
        this.iter(function (line) { return line.order = null; });
        if (this.cm) { directionChanged(this.cm); }
      })
    });

    // Public alias.
    Doc.prototype.eachLine = Doc.prototype.iter;

    // Kludge to work around strange IE behavior where it'll sometimes
    // re-fire a series of drag-related events right after the drop (#1551)
    var lastDrop = 0;

    function onDrop(e) {
      var cm = this;
      clearDragCursor(cm);
      if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e))
        { return }
      e_preventDefault(e);
      if (ie) { lastDrop = +new Date; }
      var pos = posFromMouse(cm, e, true), files = e.dataTransfer.files;
      if (!pos || cm.isReadOnly()) { return }
      // Might be a file drop, in which case we simply extract the text
      // and insert it.
      if (files && files.length && window.FileReader && window.File) {
        var n = files.length, text = Array(n), read = 0;
        var loadFile = function (file, i) {
          if (cm.options.allowDropFileTypes &&
              indexOf(cm.options.allowDropFileTypes, file.type) == -1)
            { return }

          var reader = new FileReader;
          reader.onload = operation(cm, function () {
            var content = reader.result;
            if (/[\x00-\x08\x0e-\x1f]{2}/.test(content)) { content = ""; }
            text[i] = content;
            if (++read == n) {
              pos = clipPos(cm.doc, pos);
              var change = {from: pos, to: pos,
                            text: cm.doc.splitLines(text.join(cm.doc.lineSeparator())),
                            origin: "paste"};
              makeChange(cm.doc, change);
              setSelectionReplaceHistory(cm.doc, simpleSelection(pos, changeEnd(change)));
            }
          });
          reader.readAsText(file);
        };
        for (var i = 0; i < n; ++i) { loadFile(files[i], i); }
      } else { // Normal drop
        // Don't do a replace if the drop happened inside of the selected text.
        if (cm.state.draggingText && cm.doc.sel.contains(pos) > -1) {
          cm.state.draggingText(e);
          // Ensure the editor is re-focused
          setTimeout(function () { return cm.display.input.focus(); }, 20);
          return
        }
        try {
          var text$1 = e.dataTransfer.getData("Text");
          if (text$1) {
            var selected;
            if (cm.state.draggingText && !cm.state.draggingText.copy)
              { selected = cm.listSelections(); }
            setSelectionNoUndo(cm.doc, simpleSelection(pos, pos));
            if (selected) { for (var i$1 = 0; i$1 < selected.length; ++i$1)
              { replaceRange(cm.doc, "", selected[i$1].anchor, selected[i$1].head, "drag"); } }
            cm.replaceSelection(text$1, "around", "paste");
            cm.display.input.focus();
          }
        }
        catch(e){}
      }
    }

    function onDragStart(cm, e) {
      if (ie && (!cm.state.draggingText || +new Date - lastDrop < 100)) { e_stop(e); return }
      if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) { return }

      e.dataTransfer.setData("Text", cm.getSelection());
      e.dataTransfer.effectAllowed = "copyMove";

      // Use dummy image instead of default browsers image.
      // Recent Safari (~6.0.2) have a tendency to segfault when this happens, so we don't do it there.
      if (e.dataTransfer.setDragImage && !safari) {
        var img = elt("img", null, null, "position: fixed; left: 0; top: 0;");
        img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
        if (presto) {
          img.width = img.height = 1;
          cm.display.wrapper.appendChild(img);
          // Force a relayout, or Opera won't use our image for some obscure reason
          img._top = img.offsetTop;
        }
        e.dataTransfer.setDragImage(img, 0, 0);
        if (presto) { img.parentNode.removeChild(img); }
      }
    }

    function onDragOver(cm, e) {
      var pos = posFromMouse(cm, e);
      if (!pos) { return }
      var frag = document.createDocumentFragment();
      drawSelectionCursor(cm, pos, frag);
      if (!cm.display.dragCursor) {
        cm.display.dragCursor = elt("div", null, "CodeMirror-cursors CodeMirror-dragcursors");
        cm.display.lineSpace.insertBefore(cm.display.dragCursor, cm.display.cursorDiv);
      }
      removeChildrenAndAdd(cm.display.dragCursor, frag);
    }

    function clearDragCursor(cm) {
      if (cm.display.dragCursor) {
        cm.display.lineSpace.removeChild(cm.display.dragCursor);
        cm.display.dragCursor = null;
      }
    }

    // These must be handled carefully, because naively registering a
    // handler for each editor will cause the editors to never be
    // garbage collected.

    function forEachCodeMirror(f) {
      if (!document.getElementsByClassName) { return }
      var byClass = document.getElementsByClassName("CodeMirror"), editors = [];
      for (var i = 0; i < byClass.length; i++) {
        var cm = byClass[i].CodeMirror;
        if (cm) { editors.push(cm); }
      }
      if (editors.length) { editors[0].operation(function () {
        for (var i = 0; i < editors.length; i++) { f(editors[i]); }
      }); }
    }

    var globalsRegistered = false;
    function ensureGlobalHandlers() {
      if (globalsRegistered) { return }
      registerGlobalHandlers();
      globalsRegistered = true;
    }
    function registerGlobalHandlers() {
      // When the window resizes, we need to refresh active editors.
      var resizeTimer;
      on(window, "resize", function () {
        if (resizeTimer == null) { resizeTimer = setTimeout(function () {
          resizeTimer = null;
          forEachCodeMirror(onResize);
        }, 100); }
      });
      // When the window loses focus, we want to show the editor as blurred
      on(window, "blur", function () { return forEachCodeMirror(onBlur); });
    }
    // Called when the window resizes
    function onResize(cm) {
      var d = cm.display;
      // Might be a text scaling operation, clear size caches.
      d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;
      d.scrollbarsClipped = false;
      cm.setSize();
    }

    var keyNames = {
      3: "Pause", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl", 18: "Alt",
      19: "Pause", 20: "CapsLock", 27: "Esc", 32: "Space", 33: "PageUp", 34: "PageDown", 35: "End",
      36: "Home", 37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "PrintScrn", 45: "Insert",
      46: "Delete", 59: ";", 61: "=", 91: "Mod", 92: "Mod", 93: "Mod",
      106: "*", 107: "=", 109: "-", 110: ".", 111: "/", 127: "Delete", 145: "ScrollLock",
      173: "-", 186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
      221: "]", 222: "'", 63232: "Up", 63233: "Down", 63234: "Left", 63235: "Right", 63272: "Delete",
      63273: "Home", 63275: "End", 63276: "PageUp", 63277: "PageDown", 63302: "Insert"
    };

    // Number keys
    for (var i = 0; i < 10; i++) { keyNames[i + 48] = keyNames[i + 96] = String(i); }
    // Alphabetic keys
    for (var i$1 = 65; i$1 <= 90; i$1++) { keyNames[i$1] = String.fromCharCode(i$1); }
    // Function keys
    for (var i$2 = 1; i$2 <= 12; i$2++) { keyNames[i$2 + 111] = keyNames[i$2 + 63235] = "F" + i$2; }

    var keyMap = {};

    keyMap.basic = {
      "Left": "goCharLeft", "Right": "goCharRight", "Up": "goLineUp", "Down": "goLineDown",
      "End": "goLineEnd", "Home": "goLineStartSmart", "PageUp": "goPageUp", "PageDown": "goPageDown",
      "Delete": "delCharAfter", "Backspace": "delCharBefore", "Shift-Backspace": "delCharBefore",
      "Tab": "defaultTab", "Shift-Tab": "indentAuto",
      "Enter": "newlineAndIndent", "Insert": "toggleOverwrite",
      "Esc": "singleSelection"
    };
    // Note that the save and find-related commands aren't defined by
    // default. User code or addons can define them. Unknown commands
    // are simply ignored.
    keyMap.pcDefault = {
      "Ctrl-A": "selectAll", "Ctrl-D": "deleteLine", "Ctrl-Z": "undo", "Shift-Ctrl-Z": "redo", "Ctrl-Y": "redo",
      "Ctrl-Home": "goDocStart", "Ctrl-End": "goDocEnd", "Ctrl-Up": "goLineUp", "Ctrl-Down": "goLineDown",
      "Ctrl-Left": "goGroupLeft", "Ctrl-Right": "goGroupRight", "Alt-Left": "goLineStart", "Alt-Right": "goLineEnd",
      "Ctrl-Backspace": "delGroupBefore", "Ctrl-Delete": "delGroupAfter", "Ctrl-S": "save", "Ctrl-F": "find",
      "Ctrl-G": "findNext", "Shift-Ctrl-G": "findPrev", "Shift-Ctrl-F": "replace", "Shift-Ctrl-R": "replaceAll",
      "Ctrl-[": "indentLess", "Ctrl-]": "indentMore",
      "Ctrl-U": "undoSelection", "Shift-Ctrl-U": "redoSelection", "Alt-U": "redoSelection",
      "fallthrough": "basic"
    };
    // Very basic readline/emacs-style bindings, which are standard on Mac.
    keyMap.emacsy = {
      "Ctrl-F": "goCharRight", "Ctrl-B": "goCharLeft", "Ctrl-P": "goLineUp", "Ctrl-N": "goLineDown",
      "Alt-F": "goWordRight", "Alt-B": "goWordLeft", "Ctrl-A": "goLineStart", "Ctrl-E": "goLineEnd",
      "Ctrl-V": "goPageDown", "Shift-Ctrl-V": "goPageUp", "Ctrl-D": "delCharAfter", "Ctrl-H": "delCharBefore",
      "Alt-D": "delWordAfter", "Alt-Backspace": "delWordBefore", "Ctrl-K": "killLine", "Ctrl-T": "transposeChars",
      "Ctrl-O": "openLine"
    };
    keyMap.macDefault = {
      "Cmd-A": "selectAll", "Cmd-D": "deleteLine", "Cmd-Z": "undo", "Shift-Cmd-Z": "redo", "Cmd-Y": "redo",
      "Cmd-Home": "goDocStart", "Cmd-Up": "goDocStart", "Cmd-End": "goDocEnd", "Cmd-Down": "goDocEnd", "Alt-Left": "goGroupLeft",
      "Alt-Right": "goGroupRight", "Cmd-Left": "goLineLeft", "Cmd-Right": "goLineRight", "Alt-Backspace": "delGroupBefore",
      "Ctrl-Alt-Backspace": "delGroupAfter", "Alt-Delete": "delGroupAfter", "Cmd-S": "save", "Cmd-F": "find",
      "Cmd-G": "findNext", "Shift-Cmd-G": "findPrev", "Cmd-Alt-F": "replace", "Shift-Cmd-Alt-F": "replaceAll",
      "Cmd-[": "indentLess", "Cmd-]": "indentMore", "Cmd-Backspace": "delWrappedLineLeft", "Cmd-Delete": "delWrappedLineRight",
      "Cmd-U": "undoSelection", "Shift-Cmd-U": "redoSelection", "Ctrl-Up": "goDocStart", "Ctrl-Down": "goDocEnd",
      "fallthrough": ["basic", "emacsy"]
    };
    keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault;

    // KEYMAP DISPATCH

    function normalizeKeyName(name) {
      var parts = name.split(/-(?!$)/);
      name = parts[parts.length - 1];
      var alt, ctrl, shift, cmd;
      for (var i = 0; i < parts.length - 1; i++) {
        var mod = parts[i];
        if (/^(cmd|meta|m)$/i.test(mod)) { cmd = true; }
        else if (/^a(lt)?$/i.test(mod)) { alt = true; }
        else if (/^(c|ctrl|control)$/i.test(mod)) { ctrl = true; }
        else if (/^s(hift)?$/i.test(mod)) { shift = true; }
        else { throw new Error("Unrecognized modifier name: " + mod) }
      }
      if (alt) { name = "Alt-" + name; }
      if (ctrl) { name = "Ctrl-" + name; }
      if (cmd) { name = "Cmd-" + name; }
      if (shift) { name = "Shift-" + name; }
      return name
    }

    // This is a kludge to keep keymaps mostly working as raw objects
    // (backwards compatibility) while at the same time support features
    // like normalization and multi-stroke key bindings. It compiles a
    // new normalized keymap, and then updates the old object to reflect
    // this.
    function normalizeKeyMap(keymap) {
      var copy = {};
      for (var keyname in keymap) { if (keymap.hasOwnProperty(keyname)) {
        var value = keymap[keyname];
        if (/^(name|fallthrough|(de|at)tach)$/.test(keyname)) { continue }
        if (value == "...") { delete keymap[keyname]; continue }

        var keys = map(keyname.split(" "), normalizeKeyName);
        for (var i = 0; i < keys.length; i++) {
          var val = (void 0), name = (void 0);
          if (i == keys.length - 1) {
            name = keys.join(" ");
            val = value;
          } else {
            name = keys.slice(0, i + 1).join(" ");
            val = "...";
          }
          var prev = copy[name];
          if (!prev) { copy[name] = val; }
          else if (prev != val) { throw new Error("Inconsistent bindings for " + name) }
        }
        delete keymap[keyname];
      } }
      for (var prop in copy) { keymap[prop] = copy[prop]; }
      return keymap
    }

    function lookupKey(key, map$$1, handle, context) {
      map$$1 = getKeyMap(map$$1);
      var found = map$$1.call ? map$$1.call(key, context) : map$$1[key];
      if (found === false) { return "nothing" }
      if (found === "...") { return "multi" }
      if (found != null && handle(found)) { return "handled" }

      if (map$$1.fallthrough) {
        if (Object.prototype.toString.call(map$$1.fallthrough) != "[object Array]")
          { return lookupKey(key, map$$1.fallthrough, handle, context) }
        for (var i = 0; i < map$$1.fallthrough.length; i++) {
          var result = lookupKey(key, map$$1.fallthrough[i], handle, context);
          if (result) { return result }
        }
      }
    }

    // Modifier key presses don't count as 'real' key presses for the
    // purpose of keymap fallthrough.
    function isModifierKey(value) {
      var name = typeof value == "string" ? value : keyNames[value.keyCode];
      return name == "Ctrl" || name == "Alt" || name == "Shift" || name == "Mod"
    }

    function addModifierNames(name, event, noShift) {
      var base = name;
      if (event.altKey && base != "Alt") { name = "Alt-" + name; }
      if ((flipCtrlCmd ? event.metaKey : event.ctrlKey) && base != "Ctrl") { name = "Ctrl-" + name; }
      if ((flipCtrlCmd ? event.ctrlKey : event.metaKey) && base != "Cmd") { name = "Cmd-" + name; }
      if (!noShift && event.shiftKey && base != "Shift") { name = "Shift-" + name; }
      return name
    }

    // Look up the name of a key as indicated by an event object.
    function keyName(event, noShift) {
      if (presto && event.keyCode == 34 && event["char"]) { return false }
      var name = keyNames[event.keyCode];
      if (name == null || event.altGraphKey) { return false }
      // Ctrl-ScrollLock has keyCode 3, same as Ctrl-Pause,
      // so we'll use event.code when available (Chrome 48+, FF 38+, Safari 10.1+)
      if (event.keyCode == 3 && event.code) { name = event.code; }
      return addModifierNames(name, event, noShift)
    }

    function getKeyMap(val) {
      return typeof val == "string" ? keyMap[val] : val
    }

    // Helper for deleting text near the selection(s), used to implement
    // backspace, delete, and similar functionality.
    function deleteNearSelection(cm, compute) {
      var ranges = cm.doc.sel.ranges, kill = [];
      // Build up a set of ranges to kill first, merging overlapping
      // ranges.
      for (var i = 0; i < ranges.length; i++) {
        var toKill = compute(ranges[i]);
        while (kill.length && cmp(toKill.from, lst(kill).to) <= 0) {
          var replaced = kill.pop();
          if (cmp(replaced.from, toKill.from) < 0) {
            toKill.from = replaced.from;
            break
          }
        }
        kill.push(toKill);
      }
      // Next, remove those actual ranges.
      runInOp(cm, function () {
        for (var i = kill.length - 1; i >= 0; i--)
          { replaceRange(cm.doc, "", kill[i].from, kill[i].to, "+delete"); }
        ensureCursorVisible(cm);
      });
    }

    function moveCharLogically(line, ch, dir) {
      var target = skipExtendingChars(line.text, ch + dir, dir);
      return target < 0 || target > line.text.length ? null : target
    }

    function moveLogically(line, start, dir) {
      var ch = moveCharLogically(line, start.ch, dir);
      return ch == null ? null : new Pos(start.line, ch, dir < 0 ? "after" : "before")
    }

    function endOfLine(visually, cm, lineObj, lineNo, dir) {
      if (visually) {
        var order = getOrder(lineObj, cm.doc.direction);
        if (order) {
          var part = dir < 0 ? lst(order) : order[0];
          var moveInStorageOrder = (dir < 0) == (part.level == 1);
          var sticky = moveInStorageOrder ? "after" : "before";
          var ch;
          // With a wrapped rtl chunk (possibly spanning multiple bidi parts),
          // it could be that the last bidi part is not on the last visual line,
          // since visual lines contain content order-consecutive chunks.
          // Thus, in rtl, we are looking for the first (content-order) character
          // in the rtl chunk that is on the last line (that is, the same line
          // as the last (content-order) character).
          if (part.level > 0 || cm.doc.direction == "rtl") {
            var prep = prepareMeasureForLine(cm, lineObj);
            ch = dir < 0 ? lineObj.text.length - 1 : 0;
            var targetTop = measureCharPrepared(cm, prep, ch).top;
            ch = findFirst(function (ch) { return measureCharPrepared(cm, prep, ch).top == targetTop; }, (dir < 0) == (part.level == 1) ? part.from : part.to - 1, ch);
            if (sticky == "before") { ch = moveCharLogically(lineObj, ch, 1); }
          } else { ch = dir < 0 ? part.to : part.from; }
          return new Pos(lineNo, ch, sticky)
        }
      }
      return new Pos(lineNo, dir < 0 ? lineObj.text.length : 0, dir < 0 ? "before" : "after")
    }

    function moveVisually(cm, line, start, dir) {
      var bidi = getOrder(line, cm.doc.direction);
      if (!bidi) { return moveLogically(line, start, dir) }
      if (start.ch >= line.text.length) {
        start.ch = line.text.length;
        start.sticky = "before";
      } else if (start.ch <= 0) {
        start.ch = 0;
        start.sticky = "after";
      }
      var partPos = getBidiPartAt(bidi, start.ch, start.sticky), part = bidi[partPos];
      if (cm.doc.direction == "ltr" && part.level % 2 == 0 && (dir > 0 ? part.to > start.ch : part.from < start.ch)) {
        // Case 1: We move within an ltr part in an ltr editor. Even with wrapped lines,
        // nothing interesting happens.
        return moveLogically(line, start, dir)
      }

      var mv = function (pos, dir) { return moveCharLogically(line, pos instanceof Pos ? pos.ch : pos, dir); };
      var prep;
      var getWrappedLineExtent = function (ch) {
        if (!cm.options.lineWrapping) { return {begin: 0, end: line.text.length} }
        prep = prep || prepareMeasureForLine(cm, line);
        return wrappedLineExtentChar(cm, line, prep, ch)
      };
      var wrappedLineExtent = getWrappedLineExtent(start.sticky == "before" ? mv(start, -1) : start.ch);

      if (cm.doc.direction == "rtl" || part.level == 1) {
        var moveInStorageOrder = (part.level == 1) == (dir < 0);
        var ch = mv(start, moveInStorageOrder ? 1 : -1);
        if (ch != null && (!moveInStorageOrder ? ch >= part.from && ch >= wrappedLineExtent.begin : ch <= part.to && ch <= wrappedLineExtent.end)) {
          // Case 2: We move within an rtl part or in an rtl editor on the same visual line
          var sticky = moveInStorageOrder ? "before" : "after";
          return new Pos(start.line, ch, sticky)
        }
      }

      // Case 3: Could not move within this bidi part in this visual line, so leave
      // the current bidi part

      var searchInVisualLine = function (partPos, dir, wrappedLineExtent) {
        var getRes = function (ch, moveInStorageOrder) { return moveInStorageOrder
          ? new Pos(start.line, mv(ch, 1), "before")
          : new Pos(start.line, ch, "after"); };

        for (; partPos >= 0 && partPos < bidi.length; partPos += dir) {
          var part = bidi[partPos];
          var moveInStorageOrder = (dir > 0) == (part.level != 1);
          var ch = moveInStorageOrder ? wrappedLineExtent.begin : mv(wrappedLineExtent.end, -1);
          if (part.from <= ch && ch < part.to) { return getRes(ch, moveInStorageOrder) }
          ch = moveInStorageOrder ? part.from : mv(part.to, -1);
          if (wrappedLineExtent.begin <= ch && ch < wrappedLineExtent.end) { return getRes(ch, moveInStorageOrder) }
        }
      };

      // Case 3a: Look for other bidi parts on the same visual line
      var res = searchInVisualLine(partPos + dir, dir, wrappedLineExtent);
      if (res) { return res }

      // Case 3b: Look for other bidi parts on the next visual line
      var nextCh = dir > 0 ? wrappedLineExtent.end : mv(wrappedLineExtent.begin, -1);
      if (nextCh != null && !(dir > 0 && nextCh == line.text.length)) {
        res = searchInVisualLine(dir > 0 ? 0 : bidi.length - 1, dir, getWrappedLineExtent(nextCh));
        if (res) { return res }
      }

      // Case 4: Nowhere to move
      return null
    }

    // Commands are parameter-less actions that can be performed on an
    // editor, mostly used for keybindings.
    var commands = {
      selectAll: selectAll,
      singleSelection: function (cm) { return cm.setSelection(cm.getCursor("anchor"), cm.getCursor("head"), sel_dontScroll); },
      killLine: function (cm) { return deleteNearSelection(cm, function (range) {
        if (range.empty()) {
          var len = getLine(cm.doc, range.head.line).text.length;
          if (range.head.ch == len && range.head.line < cm.lastLine())
            { return {from: range.head, to: Pos(range.head.line + 1, 0)} }
          else
            { return {from: range.head, to: Pos(range.head.line, len)} }
        } else {
          return {from: range.from(), to: range.to()}
        }
      }); },
      deleteLine: function (cm) { return deleteNearSelection(cm, function (range) { return ({
        from: Pos(range.from().line, 0),
        to: clipPos(cm.doc, Pos(range.to().line + 1, 0))
      }); }); },
      delLineLeft: function (cm) { return deleteNearSelection(cm, function (range) { return ({
        from: Pos(range.from().line, 0), to: range.from()
      }); }); },
      delWrappedLineLeft: function (cm) { return deleteNearSelection(cm, function (range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var leftPos = cm.coordsChar({left: 0, top: top}, "div");
        return {from: leftPos, to: range.from()}
      }); },
      delWrappedLineRight: function (cm) { return deleteNearSelection(cm, function (range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var rightPos = cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div");
        return {from: range.from(), to: rightPos }
      }); },
      undo: function (cm) { return cm.undo(); },
      redo: function (cm) { return cm.redo(); },
      undoSelection: function (cm) { return cm.undoSelection(); },
      redoSelection: function (cm) { return cm.redoSelection(); },
      goDocStart: function (cm) { return cm.extendSelection(Pos(cm.firstLine(), 0)); },
      goDocEnd: function (cm) { return cm.extendSelection(Pos(cm.lastLine())); },
      goLineStart: function (cm) { return cm.extendSelectionsBy(function (range) { return lineStart(cm, range.head.line); },
        {origin: "+move", bias: 1}
      ); },
      goLineStartSmart: function (cm) { return cm.extendSelectionsBy(function (range) { return lineStartSmart(cm, range.head); },
        {origin: "+move", bias: 1}
      ); },
      goLineEnd: function (cm) { return cm.extendSelectionsBy(function (range) { return lineEnd(cm, range.head.line); },
        {origin: "+move", bias: -1}
      ); },
      goLineRight: function (cm) { return cm.extendSelectionsBy(function (range) {
        var top = cm.cursorCoords(range.head, "div").top + 5;
        return cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div")
      }, sel_move); },
      goLineLeft: function (cm) { return cm.extendSelectionsBy(function (range) {
        var top = cm.cursorCoords(range.head, "div").top + 5;
        return cm.coordsChar({left: 0, top: top}, "div")
      }, sel_move); },
      goLineLeftSmart: function (cm) { return cm.extendSelectionsBy(function (range) {
        var top = cm.cursorCoords(range.head, "div").top + 5;
        var pos = cm.coordsChar({left: 0, top: top}, "div");
        if (pos.ch < cm.getLine(pos.line).search(/\S/)) { return lineStartSmart(cm, range.head) }
        return pos
      }, sel_move); },
      goLineUp: function (cm) { return cm.moveV(-1, "line"); },
      goLineDown: function (cm) { return cm.moveV(1, "line"); },
      goPageUp: function (cm) { return cm.moveV(-1, "page"); },
      goPageDown: function (cm) { return cm.moveV(1, "page"); },
      goCharLeft: function (cm) { return cm.moveH(-1, "char"); },
      goCharRight: function (cm) { return cm.moveH(1, "char"); },
      goColumnLeft: function (cm) { return cm.moveH(-1, "column"); },
      goColumnRight: function (cm) { return cm.moveH(1, "column"); },
      goWordLeft: function (cm) { return cm.moveH(-1, "word"); },
      goGroupRight: function (cm) { return cm.moveH(1, "group"); },
      goGroupLeft: function (cm) { return cm.moveH(-1, "group"); },
      goWordRight: function (cm) { return cm.moveH(1, "word"); },
      delCharBefore: function (cm) { return cm.deleteH(-1, "char"); },
      delCharAfter: function (cm) { return cm.deleteH(1, "char"); },
      delWordBefore: function (cm) { return cm.deleteH(-1, "word"); },
      delWordAfter: function (cm) { return cm.deleteH(1, "word"); },
      delGroupBefore: function (cm) { return cm.deleteH(-1, "group"); },
      delGroupAfter: function (cm) { return cm.deleteH(1, "group"); },
      indentAuto: function (cm) { return cm.indentSelection("smart"); },
      indentMore: function (cm) { return cm.indentSelection("add"); },
      indentLess: function (cm) { return cm.indentSelection("subtract"); },
      insertTab: function (cm) { return cm.replaceSelection("\t"); },
      insertSoftTab: function (cm) {
        var spaces = [], ranges = cm.listSelections(), tabSize = cm.options.tabSize;
        for (var i = 0; i < ranges.length; i++) {
          var pos = ranges[i].from();
          var col = countColumn(cm.getLine(pos.line), pos.ch, tabSize);
          spaces.push(spaceStr(tabSize - col % tabSize));
        }
        cm.replaceSelections(spaces);
      },
      defaultTab: function (cm) {
        if (cm.somethingSelected()) { cm.indentSelection("add"); }
        else { cm.execCommand("insertTab"); }
      },
      // Swap the two chars left and right of each selection's head.
      // Move cursor behind the two swapped characters afterwards.
      //
      // Doesn't consider line feeds a character.
      // Doesn't scan more than one line above to find a character.
      // Doesn't do anything on an empty line.
      // Doesn't do anything with non-empty selections.
      transposeChars: function (cm) { return runInOp(cm, function () {
        var ranges = cm.listSelections(), newSel = [];
        for (var i = 0; i < ranges.length; i++) {
          if (!ranges[i].empty()) { continue }
          var cur = ranges[i].head, line = getLine(cm.doc, cur.line).text;
          if (line) {
            if (cur.ch == line.length) { cur = new Pos(cur.line, cur.ch - 1); }
            if (cur.ch > 0) {
              cur = new Pos(cur.line, cur.ch + 1);
              cm.replaceRange(line.charAt(cur.ch - 1) + line.charAt(cur.ch - 2),
                              Pos(cur.line, cur.ch - 2), cur, "+transpose");
            } else if (cur.line > cm.doc.first) {
              var prev = getLine(cm.doc, cur.line - 1).text;
              if (prev) {
                cur = new Pos(cur.line, 1);
                cm.replaceRange(line.charAt(0) + cm.doc.lineSeparator() +
                                prev.charAt(prev.length - 1),
                                Pos(cur.line - 1, prev.length - 1), cur, "+transpose");
              }
            }
          }
          newSel.push(new Range(cur, cur));
        }
        cm.setSelections(newSel);
      }); },
      newlineAndIndent: function (cm) { return runInOp(cm, function () {
        var sels = cm.listSelections();
        for (var i = sels.length - 1; i >= 0; i--)
          { cm.replaceRange(cm.doc.lineSeparator(), sels[i].anchor, sels[i].head, "+input"); }
        sels = cm.listSelections();
        for (var i$1 = 0; i$1 < sels.length; i$1++)
          { cm.indentLine(sels[i$1].from().line, null, true); }
        ensureCursorVisible(cm);
      }); },
      openLine: function (cm) { return cm.replaceSelection("\n", "start"); },
      toggleOverwrite: function (cm) { return cm.toggleOverwrite(); }
    };


    function lineStart(cm, lineN) {
      var line = getLine(cm.doc, lineN);
      var visual = visualLine(line);
      if (visual != line) { lineN = lineNo(visual); }
      return endOfLine(true, cm, visual, lineN, 1)
    }
    function lineEnd(cm, lineN) {
      var line = getLine(cm.doc, lineN);
      var visual = visualLineEnd(line);
      if (visual != line) { lineN = lineNo(visual); }
      return endOfLine(true, cm, line, lineN, -1)
    }
    function lineStartSmart(cm, pos) {
      var start = lineStart(cm, pos.line);
      var line = getLine(cm.doc, start.line);
      var order = getOrder(line, cm.doc.direction);
      if (!order || order[0].level == 0) {
        var firstNonWS = Math.max(0, line.text.search(/\S/));
        var inWS = pos.line == start.line && pos.ch <= firstNonWS && pos.ch;
        return Pos(start.line, inWS ? 0 : firstNonWS, start.sticky)
      }
      return start
    }

    // Run a handler that was bound to a key.
    function doHandleBinding(cm, bound, dropShift) {
      if (typeof bound == "string") {
        bound = commands[bound];
        if (!bound) { return false }
      }
      // Ensure previous input has been read, so that the handler sees a
      // consistent view of the document
      cm.display.input.ensurePolled();
      var prevShift = cm.display.shift, done = false;
      try {
        if (cm.isReadOnly()) { cm.state.suppressEdits = true; }
        if (dropShift) { cm.display.shift = false; }
        done = bound(cm) != Pass;
      } finally {
        cm.display.shift = prevShift;
        cm.state.suppressEdits = false;
      }
      return done
    }

    function lookupKeyForEditor(cm, name, handle) {
      for (var i = 0; i < cm.state.keyMaps.length; i++) {
        var result = lookupKey(name, cm.state.keyMaps[i], handle, cm);
        if (result) { return result }
      }
      return (cm.options.extraKeys && lookupKey(name, cm.options.extraKeys, handle, cm))
        || lookupKey(name, cm.options.keyMap, handle, cm)
    }

    // Note that, despite the name, this function is also used to check
    // for bound mouse clicks.

    var stopSeq = new Delayed;

    function dispatchKey(cm, name, e, handle) {
      var seq = cm.state.keySeq;
      if (seq) {
        if (isModifierKey(name)) { return "handled" }
        if (/\'$/.test(name))
          { cm.state.keySeq = null; }
        else
          { stopSeq.set(50, function () {
            if (cm.state.keySeq == seq) {
              cm.state.keySeq = null;
              cm.display.input.reset();
            }
          }); }
        if (dispatchKeyInner(cm, seq + " " + name, e, handle)) { return true }
      }
      return dispatchKeyInner(cm, name, e, handle)
    }

    function dispatchKeyInner(cm, name, e, handle) {
      var result = lookupKeyForEditor(cm, name, handle);

      if (result == "multi")
        { cm.state.keySeq = name; }
      if (result == "handled")
        { signalLater(cm, "keyHandled", cm, name, e); }

      if (result == "handled" || result == "multi") {
        e_preventDefault(e);
        restartBlink(cm);
      }

      return !!result
    }

    // Handle a key from the keydown event.
    function handleKeyBinding(cm, e) {
      var name = keyName(e, true);
      if (!name) { return false }

      if (e.shiftKey && !cm.state.keySeq) {
        // First try to resolve full name (including 'Shift-'). Failing
        // that, see if there is a cursor-motion command (starting with
        // 'go') bound to the keyname without 'Shift-'.
        return dispatchKey(cm, "Shift-" + name, e, function (b) { return doHandleBinding(cm, b, true); })
            || dispatchKey(cm, name, e, function (b) {
                 if (typeof b == "string" ? /^go[A-Z]/.test(b) : b.motion)
                   { return doHandleBinding(cm, b) }
               })
      } else {
        return dispatchKey(cm, name, e, function (b) { return doHandleBinding(cm, b); })
      }
    }

    // Handle a key from the keypress event
    function handleCharBinding(cm, e, ch) {
      return dispatchKey(cm, "'" + ch + "'", e, function (b) { return doHandleBinding(cm, b, true); })
    }

    var lastStoppedKey = null;
    function onKeyDown(e) {
      var cm = this;
      cm.curOp.focus = activeElt();
      if (signalDOMEvent(cm, e)) { return }
      // IE does strange things with escape.
      if (ie && ie_version < 11 && e.keyCode == 27) { e.returnValue = false; }
      var code = e.keyCode;
      cm.display.shift = code == 16 || e.shiftKey;
      var handled = handleKeyBinding(cm, e);
      if (presto) {
        lastStoppedKey = handled ? code : null;
        // Opera has no cut event... we try to at least catch the key combo
        if (!handled && code == 88 && !hasCopyEvent && (mac ? e.metaKey : e.ctrlKey))
          { cm.replaceSelection("", null, "cut"); }
      }

      // Turn mouse into crosshair when Alt is held on Mac.
      if (code == 18 && !/\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className))
        { showCrossHair(cm); }
    }

    function showCrossHair(cm) {
      var lineDiv = cm.display.lineDiv;
      addClass(lineDiv, "CodeMirror-crosshair");

      function up(e) {
        if (e.keyCode == 18 || !e.altKey) {
          rmClass(lineDiv, "CodeMirror-crosshair");
          off(document, "keyup", up);
          off(document, "mouseover", up);
        }
      }
      on(document, "keyup", up);
      on(document, "mouseover", up);
    }

    function onKeyUp(e) {
      if (e.keyCode == 16) { this.doc.sel.shift = false; }
      signalDOMEvent(this, e);
    }

    function onKeyPress(e) {
      var cm = this;
      if (eventInWidget(cm.display, e) || signalDOMEvent(cm, e) || e.ctrlKey && !e.altKey || mac && e.metaKey) { return }
      var keyCode = e.keyCode, charCode = e.charCode;
      if (presto && keyCode == lastStoppedKey) {lastStoppedKey = null; e_preventDefault(e); return}
      if ((presto && (!e.which || e.which < 10)) && handleKeyBinding(cm, e)) { return }
      var ch = String.fromCharCode(charCode == null ? keyCode : charCode);
      // Some browsers fire keypress events for backspace
      if (ch == "\x08") { return }
      if (handleCharBinding(cm, e, ch)) { return }
      cm.display.input.onKeyPress(e);
    }

    var DOUBLECLICK_DELAY = 400;

    var PastClick = function(time, pos, button) {
      this.time = time;
      this.pos = pos;
      this.button = button;
    };

    PastClick.prototype.compare = function (time, pos, button) {
      return this.time + DOUBLECLICK_DELAY > time &&
        cmp(pos, this.pos) == 0 && button == this.button
    };

    var lastClick, lastDoubleClick;
    function clickRepeat(pos, button) {
      var now = +new Date;
      if (lastDoubleClick && lastDoubleClick.compare(now, pos, button)) {
        lastClick = lastDoubleClick = null;
        return "triple"
      } else if (lastClick && lastClick.compare(now, pos, button)) {
        lastDoubleClick = new PastClick(now, pos, button);
        lastClick = null;
        return "double"
      } else {
        lastClick = new PastClick(now, pos, button);
        lastDoubleClick = null;
        return "single"
      }
    }

    // A mouse down can be a single click, double click, triple click,
    // start of selection drag, start of text drag, new cursor
    // (ctrl-click), rectangle drag (alt-drag), or xwin
    // middle-click-paste. Or it might be a click on something we should
    // not interfere with, such as a scrollbar or widget.
    function onMouseDown(e) {
      var cm = this, display = cm.display;
      if (signalDOMEvent(cm, e) || display.activeTouch && display.input.supportsTouch()) { return }
      display.input.ensurePolled();
      display.shift = e.shiftKey;

      if (eventInWidget(display, e)) {
        if (!webkit) {
          // Briefly turn off draggability, to allow widgets to do
          // normal dragging things.
          display.scroller.draggable = false;
          setTimeout(function () { return display.scroller.draggable = true; }, 100);
        }
        return
      }
      if (clickInGutter(cm, e)) { return }
      var pos = posFromMouse(cm, e), button = e_button(e), repeat = pos ? clickRepeat(pos, button) : "single";
      window.focus();

      // #3261: make sure, that we're not starting a second selection
      if (button == 1 && cm.state.selectingText)
        { cm.state.selectingText(e); }

      if (pos && handleMappedButton(cm, button, pos, repeat, e)) { return }

      if (button == 1) {
        if (pos) { leftButtonDown(cm, pos, repeat, e); }
        else if (e_target(e) == display.scroller) { e_preventDefault(e); }
      } else if (button == 2) {
        if (pos) { extendSelection(cm.doc, pos); }
        setTimeout(function () { return display.input.focus(); }, 20);
      } else if (button == 3) {
        if (captureRightClick) { cm.display.input.onContextMenu(e); }
        else { delayBlurEvent(cm); }
      }
    }

    function handleMappedButton(cm, button, pos, repeat, event) {
      var name = "Click";
      if (repeat == "double") { name = "Double" + name; }
      else if (repeat == "triple") { name = "Triple" + name; }
      name = (button == 1 ? "Left" : button == 2 ? "Middle" : "Right") + name;

      return dispatchKey(cm,  addModifierNames(name, event), event, function (bound) {
        if (typeof bound == "string") { bound = commands[bound]; }
        if (!bound) { return false }
        var done = false;
        try {
          if (cm.isReadOnly()) { cm.state.suppressEdits = true; }
          done = bound(cm, pos) != Pass;
        } finally {
          cm.state.suppressEdits = false;
        }
        return done
      })
    }

    function configureMouse(cm, repeat, event) {
      var option = cm.getOption("configureMouse");
      var value = option ? option(cm, repeat, event) : {};
      if (value.unit == null) {
        var rect = chromeOS ? event.shiftKey && event.metaKey : event.altKey;
        value.unit = rect ? "rectangle" : repeat == "single" ? "char" : repeat == "double" ? "word" : "line";
      }
      if (value.extend == null || cm.doc.extend) { value.extend = cm.doc.extend || event.shiftKey; }
      if (value.addNew == null) { value.addNew = mac ? event.metaKey : event.ctrlKey; }
      if (value.moveOnDrag == null) { value.moveOnDrag = !(mac ? event.altKey : event.ctrlKey); }
      return value
    }

    function leftButtonDown(cm, pos, repeat, event) {
      if (ie) { setTimeout(bind(ensureFocus, cm), 0); }
      else { cm.curOp.focus = activeElt(); }

      var behavior = configureMouse(cm, repeat, event);

      var sel = cm.doc.sel, contained;
      if (cm.options.dragDrop && dragAndDrop && !cm.isReadOnly() &&
          repeat == "single" && (contained = sel.contains(pos)) > -1 &&
          (cmp((contained = sel.ranges[contained]).from(), pos) < 0 || pos.xRel > 0) &&
          (cmp(contained.to(), pos) > 0 || pos.xRel < 0))
        { leftButtonStartDrag(cm, event, pos, behavior); }
      else
        { leftButtonSelect(cm, event, pos, behavior); }
    }

    // Start a text drag. When it ends, see if any dragging actually
    // happen, and treat as a click if it didn't.
    function leftButtonStartDrag(cm, event, pos, behavior) {
      var display = cm.display, moved = false;
      var dragEnd = operation(cm, function (e) {
        if (webkit) { display.scroller.draggable = false; }
        cm.state.draggingText = false;
        off(display.wrapper.ownerDocument, "mouseup", dragEnd);
        off(display.wrapper.ownerDocument, "mousemove", mouseMove);
        off(display.scroller, "dragstart", dragStart);
        off(display.scroller, "drop", dragEnd);
        if (!moved) {
          e_preventDefault(e);
          if (!behavior.addNew)
            { extendSelection(cm.doc, pos, null, null, behavior.extend); }
          // Work around unexplainable focus problem in IE9 (#2127) and Chrome (#3081)
          if (webkit || ie && ie_version == 9)
            { setTimeout(function () {display.wrapper.ownerDocument.body.focus(); display.input.focus();}, 20); }
          else
            { display.input.focus(); }
        }
      });
      var mouseMove = function(e2) {
        moved = moved || Math.abs(event.clientX - e2.clientX) + Math.abs(event.clientY - e2.clientY) >= 10;
      };
      var dragStart = function () { return moved = true; };
      // Let the drag handler handle this.
      if (webkit) { display.scroller.draggable = true; }
      cm.state.draggingText = dragEnd;
      dragEnd.copy = !behavior.moveOnDrag;
      // IE's approach to draggable
      if (display.scroller.dragDrop) { display.scroller.dragDrop(); }
      on(display.wrapper.ownerDocument, "mouseup", dragEnd);
      on(display.wrapper.ownerDocument, "mousemove", mouseMove);
      on(display.scroller, "dragstart", dragStart);
      on(display.scroller, "drop", dragEnd);

      delayBlurEvent(cm);
      setTimeout(function () { return display.input.focus(); }, 20);
    }

    function rangeForUnit(cm, pos, unit) {
      if (unit == "char") { return new Range(pos, pos) }
      if (unit == "word") { return cm.findWordAt(pos) }
      if (unit == "line") { return new Range(Pos(pos.line, 0), clipPos(cm.doc, Pos(pos.line + 1, 0))) }
      var result = unit(cm, pos);
      return new Range(result.from, result.to)
    }

    // Normal selection, as opposed to text dragging.
    function leftButtonSelect(cm, event, start, behavior) {
      var display = cm.display, doc = cm.doc;
      e_preventDefault(event);

      var ourRange, ourIndex, startSel = doc.sel, ranges = startSel.ranges;
      if (behavior.addNew && !behavior.extend) {
        ourIndex = doc.sel.contains(start);
        if (ourIndex > -1)
          { ourRange = ranges[ourIndex]; }
        else
          { ourRange = new Range(start, start); }
      } else {
        ourRange = doc.sel.primary();
        ourIndex = doc.sel.primIndex;
      }

      if (behavior.unit == "rectangle") {
        if (!behavior.addNew) { ourRange = new Range(start, start); }
        start = posFromMouse(cm, event, true, true);
        ourIndex = -1;
      } else {
        var range$$1 = rangeForUnit(cm, start, behavior.unit);
        if (behavior.extend)
          { ourRange = extendRange(ourRange, range$$1.anchor, range$$1.head, behavior.extend); }
        else
          { ourRange = range$$1; }
      }

      if (!behavior.addNew) {
        ourIndex = 0;
        setSelection(doc, new Selection([ourRange], 0), sel_mouse);
        startSel = doc.sel;
      } else if (ourIndex == -1) {
        ourIndex = ranges.length;
        setSelection(doc, normalizeSelection(cm, ranges.concat([ourRange]), ourIndex),
                     {scroll: false, origin: "*mouse"});
      } else if (ranges.length > 1 && ranges[ourIndex].empty() && behavior.unit == "char" && !behavior.extend) {
        setSelection(doc, normalizeSelection(cm, ranges.slice(0, ourIndex).concat(ranges.slice(ourIndex + 1)), 0),
                     {scroll: false, origin: "*mouse"});
        startSel = doc.sel;
      } else {
        replaceOneSelection(doc, ourIndex, ourRange, sel_mouse);
      }

      var lastPos = start;
      function extendTo(pos) {
        if (cmp(lastPos, pos) == 0) { return }
        lastPos = pos;

        if (behavior.unit == "rectangle") {
          var ranges = [], tabSize = cm.options.tabSize;
          var startCol = countColumn(getLine(doc, start.line).text, start.ch, tabSize);
          var posCol = countColumn(getLine(doc, pos.line).text, pos.ch, tabSize);
          var left = Math.min(startCol, posCol), right = Math.max(startCol, posCol);
          for (var line = Math.min(start.line, pos.line), end = Math.min(cm.lastLine(), Math.max(start.line, pos.line));
               line <= end; line++) {
            var text = getLine(doc, line).text, leftPos = findColumn(text, left, tabSize);
            if (left == right)
              { ranges.push(new Range(Pos(line, leftPos), Pos(line, leftPos))); }
            else if (text.length > leftPos)
              { ranges.push(new Range(Pos(line, leftPos), Pos(line, findColumn(text, right, tabSize)))); }
          }
          if (!ranges.length) { ranges.push(new Range(start, start)); }
          setSelection(doc, normalizeSelection(cm, startSel.ranges.slice(0, ourIndex).concat(ranges), ourIndex),
                       {origin: "*mouse", scroll: false});
          cm.scrollIntoView(pos);
        } else {
          var oldRange = ourRange;
          var range$$1 = rangeForUnit(cm, pos, behavior.unit);
          var anchor = oldRange.anchor, head;
          if (cmp(range$$1.anchor, anchor) > 0) {
            head = range$$1.head;
            anchor = minPos(oldRange.from(), range$$1.anchor);
          } else {
            head = range$$1.anchor;
            anchor = maxPos(oldRange.to(), range$$1.head);
          }
          var ranges$1 = startSel.ranges.slice(0);
          ranges$1[ourIndex] = bidiSimplify(cm, new Range(clipPos(doc, anchor), head));
          setSelection(doc, normalizeSelection(cm, ranges$1, ourIndex), sel_mouse);
        }
      }

      var editorSize = display.wrapper.getBoundingClientRect();
      // Used to ensure timeout re-tries don't fire when another extend
      // happened in the meantime (clearTimeout isn't reliable -- at
      // least on Chrome, the timeouts still happen even when cleared,
      // if the clear happens after their scheduled firing time).
      var counter = 0;

      function extend(e) {
        var curCount = ++counter;
        var cur = posFromMouse(cm, e, true, behavior.unit == "rectangle");
        if (!cur) { return }
        if (cmp(cur, lastPos) != 0) {
          cm.curOp.focus = activeElt();
          extendTo(cur);
          var visible = visibleLines(display, doc);
          if (cur.line >= visible.to || cur.line < visible.from)
            { setTimeout(operation(cm, function () {if (counter == curCount) { extend(e); }}), 150); }
        } else {
          var outside = e.clientY < editorSize.top ? -20 : e.clientY > editorSize.bottom ? 20 : 0;
          if (outside) { setTimeout(operation(cm, function () {
            if (counter != curCount) { return }
            display.scroller.scrollTop += outside;
            extend(e);
          }), 50); }
        }
      }

      function done(e) {
        cm.state.selectingText = false;
        counter = Infinity;
        e_preventDefault(e);
        display.input.focus();
        off(display.wrapper.ownerDocument, "mousemove", move);
        off(display.wrapper.ownerDocument, "mouseup", up);
        doc.history.lastSelOrigin = null;
      }

      var move = operation(cm, function (e) {
        if (e.buttons === 0 || !e_button(e)) { done(e); }
        else { extend(e); }
      });
      var up = operation(cm, done);
      cm.state.selectingText = up;
      on(display.wrapper.ownerDocument, "mousemove", move);
      on(display.wrapper.ownerDocument, "mouseup", up);
    }

    // Used when mouse-selecting to adjust the anchor to the proper side
    // of a bidi jump depending on the visual position of the head.
    function bidiSimplify(cm, range$$1) {
      var anchor = range$$1.anchor;
      var head = range$$1.head;
      var anchorLine = getLine(cm.doc, anchor.line);
      if (cmp(anchor, head) == 0 && anchor.sticky == head.sticky) { return range$$1 }
      var order = getOrder(anchorLine);
      if (!order) { return range$$1 }
      var index = getBidiPartAt(order, anchor.ch, anchor.sticky), part = order[index];
      if (part.from != anchor.ch && part.to != anchor.ch) { return range$$1 }
      var boundary = index + ((part.from == anchor.ch) == (part.level != 1) ? 0 : 1);
      if (boundary == 0 || boundary == order.length) { return range$$1 }

      // Compute the relative visual position of the head compared to the
      // anchor (<0 is to the left, >0 to the right)
      var leftSide;
      if (head.line != anchor.line) {
        leftSide = (head.line - anchor.line) * (cm.doc.direction == "ltr" ? 1 : -1) > 0;
      } else {
        var headIndex = getBidiPartAt(order, head.ch, head.sticky);
        var dir = headIndex - index || (head.ch - anchor.ch) * (part.level == 1 ? -1 : 1);
        if (headIndex == boundary - 1 || headIndex == boundary)
          { leftSide = dir < 0; }
        else
          { leftSide = dir > 0; }
      }

      var usePart = order[boundary + (leftSide ? -1 : 0)];
      var from = leftSide == (usePart.level == 1);
      var ch = from ? usePart.from : usePart.to, sticky = from ? "after" : "before";
      return anchor.ch == ch && anchor.sticky == sticky ? range$$1 : new Range(new Pos(anchor.line, ch, sticky), head)
    }


    // Determines whether an event happened in the gutter, and fires the
    // handlers for the corresponding event.
    function gutterEvent(cm, e, type, prevent) {
      var mX, mY;
      if (e.touches) {
        mX = e.touches[0].clientX;
        mY = e.touches[0].clientY;
      } else {
        try { mX = e.clientX; mY = e.clientY; }
        catch(e) { return false }
      }
      if (mX >= Math.floor(cm.display.gutters.getBoundingClientRect().right)) { return false }
      if (prevent) { e_preventDefault(e); }

      var display = cm.display;
      var lineBox = display.lineDiv.getBoundingClientRect();

      if (mY > lineBox.bottom || !hasHandler(cm, type)) { return e_defaultPrevented(e) }
      mY -= lineBox.top - display.viewOffset;

      for (var i = 0; i < cm.options.gutters.length; ++i) {
        var g = display.gutters.childNodes[i];
        if (g && g.getBoundingClientRect().right >= mX) {
          var line = lineAtHeight(cm.doc, mY);
          var gutter = cm.options.gutters[i];
          signal(cm, type, cm, line, gutter, e);
          return e_defaultPrevented(e)
        }
      }
    }

    function clickInGutter(cm, e) {
      return gutterEvent(cm, e, "gutterClick", true)
    }

    // CONTEXT MENU HANDLING

    // To make the context menu work, we need to briefly unhide the
    // textarea (making it as unobtrusive as possible) to let the
    // right-click take effect on it.
    function onContextMenu(cm, e) {
      if (eventInWidget(cm.display, e) || contextMenuInGutter(cm, e)) { return }
      if (signalDOMEvent(cm, e, "contextmenu")) { return }
      if (!captureRightClick) { cm.display.input.onContextMenu(e); }
    }

    function contextMenuInGutter(cm, e) {
      if (!hasHandler(cm, "gutterContextMenu")) { return false }
      return gutterEvent(cm, e, "gutterContextMenu", false)
    }

    function themeChanged(cm) {
      cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") +
        cm.options.theme.replace(/(^|\s)\s*/g, " cm-s-");
      clearCaches(cm);
    }

    var Init = {toString: function(){return "CodeMirror.Init"}};

    var defaults = {};
    var optionHandlers = {};

    function defineOptions(CodeMirror) {
      var optionHandlers = CodeMirror.optionHandlers;

      function option(name, deflt, handle, notOnInit) {
        CodeMirror.defaults[name] = deflt;
        if (handle) { optionHandlers[name] =
          notOnInit ? function (cm, val, old) {if (old != Init) { handle(cm, val, old); }} : handle; }
      }

      CodeMirror.defineOption = option;

      // Passed to option handlers when there is no old value.
      CodeMirror.Init = Init;

      // These two are, on init, called from the constructor because they
      // have to be initialized before the editor can start at all.
      option("value", "", function (cm, val) { return cm.setValue(val); }, true);
      option("mode", null, function (cm, val) {
        cm.doc.modeOption = val;
        loadMode(cm);
      }, true);

      option("indentUnit", 2, loadMode, true);
      option("indentWithTabs", false);
      option("smartIndent", true);
      option("tabSize", 4, function (cm) {
        resetModeState(cm);
        clearCaches(cm);
        regChange(cm);
      }, true);

      option("lineSeparator", null, function (cm, val) {
        cm.doc.lineSep = val;
        if (!val) { return }
        var newBreaks = [], lineNo = cm.doc.first;
        cm.doc.iter(function (line) {
          for (var pos = 0;;) {
            var found = line.text.indexOf(val, pos);
            if (found == -1) { break }
            pos = found + val.length;
            newBreaks.push(Pos(lineNo, found));
          }
          lineNo++;
        });
        for (var i = newBreaks.length - 1; i >= 0; i--)
          { replaceRange(cm.doc, val, newBreaks[i], Pos(newBreaks[i].line, newBreaks[i].ch + val.length)); }
      });
      option("specialChars", /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff]/g, function (cm, val, old) {
        cm.state.specialChars = new RegExp(val.source + (val.test("\t") ? "" : "|\t"), "g");
        if (old != Init) { cm.refresh(); }
      });
      option("specialCharPlaceholder", defaultSpecialCharPlaceholder, function (cm) { return cm.refresh(); }, true);
      option("electricChars", true);
      option("inputStyle", mobile ? "contenteditable" : "textarea", function () {
        throw new Error("inputStyle can not (yet) be changed in a running editor") // FIXME
      }, true);
      option("spellcheck", false, function (cm, val) { return cm.getInputField().spellcheck = val; }, true);
      option("rtlMoveVisually", !windows);
      option("wholeLineUpdateBefore", true);

      option("theme", "default", function (cm) {
        themeChanged(cm);
        guttersChanged(cm);
      }, true);
      option("keyMap", "default", function (cm, val, old) {
        var next = getKeyMap(val);
        var prev = old != Init && getKeyMap(old);
        if (prev && prev.detach) { prev.detach(cm, next); }
        if (next.attach) { next.attach(cm, prev || null); }
      });
      option("extraKeys", null);
      option("configureMouse", null);

      option("lineWrapping", false, wrappingChanged, true);
      option("gutters", [], function (cm) {
        setGuttersForLineNumbers(cm.options);
        guttersChanged(cm);
      }, true);
      option("fixedGutter", true, function (cm, val) {
        cm.display.gutters.style.left = val ? compensateForHScroll(cm.display) + "px" : "0";
        cm.refresh();
      }, true);
      option("coverGutterNextToScrollbar", false, function (cm) { return updateScrollbars(cm); }, true);
      option("scrollbarStyle", "native", function (cm) {
        initScrollbars(cm);
        updateScrollbars(cm);
        cm.display.scrollbars.setScrollTop(cm.doc.scrollTop);
        cm.display.scrollbars.setScrollLeft(cm.doc.scrollLeft);
      }, true);
      option("lineNumbers", false, function (cm) {
        setGuttersForLineNumbers(cm.options);
        guttersChanged(cm);
      }, true);
      option("firstLineNumber", 1, guttersChanged, true);
      option("lineNumberFormatter", function (integer) { return integer; }, guttersChanged, true);
      option("showCursorWhenSelecting", false, updateSelection, true);

      option("resetSelectionOnContextMenu", true);
      option("lineWiseCopyCut", true);
      option("pasteLinesPerSelection", true);
      option("selectionsMayTouch", false);

      option("readOnly", false, function (cm, val) {
        if (val == "nocursor") {
          onBlur(cm);
          cm.display.input.blur();
        }
        cm.display.input.readOnlyChanged(val);
      });
      option("disableInput", false, function (cm, val) {if (!val) { cm.display.input.reset(); }}, true);
      option("dragDrop", true, dragDropChanged);
      option("allowDropFileTypes", null);

      option("cursorBlinkRate", 530);
      option("cursorScrollMargin", 0);
      option("cursorHeight", 1, updateSelection, true);
      option("singleCursorHeightPerLine", true, updateSelection, true);
      option("workTime", 100);
      option("workDelay", 100);
      option("flattenSpans", true, resetModeState, true);
      option("addModeClass", false, resetModeState, true);
      option("pollInterval", 100);
      option("undoDepth", 200, function (cm, val) { return cm.doc.history.undoDepth = val; });
      option("historyEventDelay", 1250);
      option("viewportMargin", 10, function (cm) { return cm.refresh(); }, true);
      option("maxHighlightLength", 10000, resetModeState, true);
      option("moveInputWithCursor", true, function (cm, val) {
        if (!val) { cm.display.input.resetPosition(); }
      });

      option("tabindex", null, function (cm, val) { return cm.display.input.getField().tabIndex = val || ""; });
      option("autofocus", null);
      option("direction", "ltr", function (cm, val) { return cm.doc.setDirection(val); }, true);
      option("phrases", null);
    }

    function guttersChanged(cm) {
      updateGutters(cm);
      regChange(cm);
      alignHorizontally(cm);
    }

    function dragDropChanged(cm, value, old) {
      var wasOn = old && old != Init;
      if (!value != !wasOn) {
        var funcs = cm.display.dragFunctions;
        var toggle = value ? on : off;
        toggle(cm.display.scroller, "dragstart", funcs.start);
        toggle(cm.display.scroller, "dragenter", funcs.enter);
        toggle(cm.display.scroller, "dragover", funcs.over);
        toggle(cm.display.scroller, "dragleave", funcs.leave);
        toggle(cm.display.scroller, "drop", funcs.drop);
      }
    }

    function wrappingChanged(cm) {
      if (cm.options.lineWrapping) {
        addClass(cm.display.wrapper, "CodeMirror-wrap");
        cm.display.sizer.style.minWidth = "";
        cm.display.sizerWidth = null;
      } else {
        rmClass(cm.display.wrapper, "CodeMirror-wrap");
        findMaxLine(cm);
      }
      estimateLineHeights(cm);
      regChange(cm);
      clearCaches(cm);
      setTimeout(function () { return updateScrollbars(cm); }, 100);
    }

    // A CodeMirror instance represents an editor. This is the object
    // that user code is usually dealing with.

    function CodeMirror(place, options) {
      var this$1 = this;

      if (!(this instanceof CodeMirror)) { return new CodeMirror(place, options) }

      this.options = options = options ? copyObj(options) : {};
      // Determine effective options based on given values and defaults.
      copyObj(defaults, options, false);
      setGuttersForLineNumbers(options);

      var doc = options.value;
      if (typeof doc == "string") { doc = new Doc(doc, options.mode, null, options.lineSeparator, options.direction); }
      else if (options.mode) { doc.modeOption = options.mode; }
      this.doc = doc;

      var input = new CodeMirror.inputStyles[options.inputStyle](this);
      var display = this.display = new Display(place, doc, input);
      display.wrapper.CodeMirror = this;
      updateGutters(this);
      themeChanged(this);
      if (options.lineWrapping)
        { this.display.wrapper.className += " CodeMirror-wrap"; }
      initScrollbars(this);

      this.state = {
        keyMaps: [],  // stores maps added by addKeyMap
        overlays: [], // highlighting overlays, as added by addOverlay
        modeGen: 0,   // bumped when mode/overlay changes, used to invalidate highlighting info
        overwrite: false,
        delayingBlurEvent: false,
        focused: false,
        suppressEdits: false, // used to disable editing during key handlers when in readOnly mode
        pasteIncoming: false, cutIncoming: false, // help recognize paste/cut edits in input.poll
        selectingText: false,
        draggingText: false,
        highlight: new Delayed(), // stores highlight worker timeout
        keySeq: null,  // Unfinished key sequence
        specialChars: null
      };

      if (options.autofocus && !mobile) { display.input.focus(); }

      // Override magic textarea content restore that IE sometimes does
      // on our hidden textarea on reload
      if (ie && ie_version < 11) { setTimeout(function () { return this$1.display.input.reset(true); }, 20); }

      registerEventHandlers(this);
      ensureGlobalHandlers();

      startOperation(this);
      this.curOp.forceUpdate = true;
      attachDoc(this, doc);

      if ((options.autofocus && !mobile) || this.hasFocus())
        { setTimeout(bind(onFocus, this), 20); }
      else
        { onBlur(this); }

      for (var opt in optionHandlers) { if (optionHandlers.hasOwnProperty(opt))
        { optionHandlers[opt](this$1, options[opt], Init); } }
      maybeUpdateLineNumberWidth(this);
      if (options.finishInit) { options.finishInit(this); }
      for (var i = 0; i < initHooks.length; ++i) { initHooks[i](this$1); }
      endOperation(this);
      // Suppress optimizelegibility in Webkit, since it breaks text
      // measuring on line wrapping boundaries.
      if (webkit && options.lineWrapping &&
          getComputedStyle(display.lineDiv).textRendering == "optimizelegibility")
        { display.lineDiv.style.textRendering = "auto"; }
    }

    // The default configuration options.
    CodeMirror.defaults = defaults;
    // Functions to run when options are changed.
    CodeMirror.optionHandlers = optionHandlers;

    // Attach the necessary event handlers when initializing the editor
    function registerEventHandlers(cm) {
      var d = cm.display;
      on(d.scroller, "mousedown", operation(cm, onMouseDown));
      // Older IE's will not fire a second mousedown for a double click
      if (ie && ie_version < 11)
        { on(d.scroller, "dblclick", operation(cm, function (e) {
          if (signalDOMEvent(cm, e)) { return }
          var pos = posFromMouse(cm, e);
          if (!pos || clickInGutter(cm, e) || eventInWidget(cm.display, e)) { return }
          e_preventDefault(e);
          var word = cm.findWordAt(pos);
          extendSelection(cm.doc, word.anchor, word.head);
        })); }
      else
        { on(d.scroller, "dblclick", function (e) { return signalDOMEvent(cm, e) || e_preventDefault(e); }); }
      // Some browsers fire contextmenu *after* opening the menu, at
      // which point we can't mess with it anymore. Context menu is
      // handled in onMouseDown for these browsers.
      on(d.scroller, "contextmenu", function (e) { return onContextMenu(cm, e); });

      // Used to suppress mouse event handling when a touch happens
      var touchFinished, prevTouch = {end: 0};
      function finishTouch() {
        if (d.activeTouch) {
          touchFinished = setTimeout(function () { return d.activeTouch = null; }, 1000);
          prevTouch = d.activeTouch;
          prevTouch.end = +new Date;
        }
      }
      function isMouseLikeTouchEvent(e) {
        if (e.touches.length != 1) { return false }
        var touch = e.touches[0];
        return touch.radiusX <= 1 && touch.radiusY <= 1
      }
      function farAway(touch, other) {
        if (other.left == null) { return true }
        var dx = other.left - touch.left, dy = other.top - touch.top;
        return dx * dx + dy * dy > 20 * 20
      }
      on(d.scroller, "touchstart", function (e) {
        if (!signalDOMEvent(cm, e) && !isMouseLikeTouchEvent(e) && !clickInGutter(cm, e)) {
          d.input.ensurePolled();
          clearTimeout(touchFinished);
          var now = +new Date;
          d.activeTouch = {start: now, moved: false,
                           prev: now - prevTouch.end <= 300 ? prevTouch : null};
          if (e.touches.length == 1) {
            d.activeTouch.left = e.touches[0].pageX;
            d.activeTouch.top = e.touches[0].pageY;
          }
        }
      });
      on(d.scroller, "touchmove", function () {
        if (d.activeTouch) { d.activeTouch.moved = true; }
      });
      on(d.scroller, "touchend", function (e) {
        var touch = d.activeTouch;
        if (touch && !eventInWidget(d, e) && touch.left != null &&
            !touch.moved && new Date - touch.start < 300) {
          var pos = cm.coordsChar(d.activeTouch, "page"), range;
          if (!touch.prev || farAway(touch, touch.prev)) // Single tap
            { range = new Range(pos, pos); }
          else if (!touch.prev.prev || farAway(touch, touch.prev.prev)) // Double tap
            { range = cm.findWordAt(pos); }
          else // Triple tap
            { range = new Range(Pos(pos.line, 0), clipPos(cm.doc, Pos(pos.line + 1, 0))); }
          cm.setSelection(range.anchor, range.head);
          cm.focus();
          e_preventDefault(e);
        }
        finishTouch();
      });
      on(d.scroller, "touchcancel", finishTouch);

      // Sync scrolling between fake scrollbars and real scrollable
      // area, ensure viewport is updated when scrolling.
      on(d.scroller, "scroll", function () {
        if (d.scroller.clientHeight) {
          updateScrollTop(cm, d.scroller.scrollTop);
          setScrollLeft(cm, d.scroller.scrollLeft, true);
          signal(cm, "scroll", cm);
        }
      });

      // Listen to wheel events in order to try and update the viewport on time.
      on(d.scroller, "mousewheel", function (e) { return onScrollWheel(cm, e); });
      on(d.scroller, "DOMMouseScroll", function (e) { return onScrollWheel(cm, e); });

      // Prevent wrapper from ever scrolling
      on(d.wrapper, "scroll", function () { return d.wrapper.scrollTop = d.wrapper.scrollLeft = 0; });

      d.dragFunctions = {
        enter: function (e) {if (!signalDOMEvent(cm, e)) { e_stop(e); }},
        over: function (e) {if (!signalDOMEvent(cm, e)) { onDragOver(cm, e); e_stop(e); }},
        start: function (e) { return onDragStart(cm, e); },
        drop: operation(cm, onDrop),
        leave: function (e) {if (!signalDOMEvent(cm, e)) { clearDragCursor(cm); }}
      };

      var inp = d.input.getField();
      on(inp, "keyup", function (e) { return onKeyUp.call(cm, e); });
      on(inp, "keydown", operation(cm, onKeyDown));
      on(inp, "keypress", operation(cm, onKeyPress));
      on(inp, "focus", function (e) { return onFocus(cm, e); });
      on(inp, "blur", function (e) { return onBlur(cm, e); });
    }

    var initHooks = [];
    CodeMirror.defineInitHook = function (f) { return initHooks.push(f); };

    // Indent the given line. The how parameter can be "smart",
    // "add"/null, "subtract", or "prev". When aggressive is false
    // (typically set to true for forced single-line indents), empty
    // lines are not indented, and places where the mode returns Pass
    // are left alone.
    function indentLine(cm, n, how, aggressive) {
      var doc = cm.doc, state;
      if (how == null) { how = "add"; }
      if (how == "smart") {
        // Fall back to "prev" when the mode doesn't have an indentation
        // method.
        if (!doc.mode.indent) { how = "prev"; }
        else { state = getContextBefore(cm, n).state; }
      }

      var tabSize = cm.options.tabSize;
      var line = getLine(doc, n), curSpace = countColumn(line.text, null, tabSize);
      if (line.stateAfter) { line.stateAfter = null; }
      var curSpaceString = line.text.match(/^\s*/)[0], indentation;
      if (!aggressive && !/\S/.test(line.text)) {
        indentation = 0;
        how = "not";
      } else if (how == "smart") {
        indentation = doc.mode.indent(state, line.text.slice(curSpaceString.length), line.text);
        if (indentation == Pass || indentation > 150) {
          if (!aggressive) { return }
          how = "prev";
        }
      }
      if (how == "prev") {
        if (n > doc.first) { indentation = countColumn(getLine(doc, n-1).text, null, tabSize); }
        else { indentation = 0; }
      } else if (how == "add") {
        indentation = curSpace + cm.options.indentUnit;
      } else if (how == "subtract") {
        indentation = curSpace - cm.options.indentUnit;
      } else if (typeof how == "number") {
        indentation = curSpace + how;
      }
      indentation = Math.max(0, indentation);

      var indentString = "", pos = 0;
      if (cm.options.indentWithTabs)
        { for (var i = Math.floor(indentation / tabSize); i; --i) {pos += tabSize; indentString += "\t";} }
      if (pos < indentation) { indentString += spaceStr(indentation - pos); }

      if (indentString != curSpaceString) {
        replaceRange(doc, indentString, Pos(n, 0), Pos(n, curSpaceString.length), "+input");
        line.stateAfter = null;
        return true
      } else {
        // Ensure that, if the cursor was in the whitespace at the start
        // of the line, it is moved to the end of that space.
        for (var i$1 = 0; i$1 < doc.sel.ranges.length; i$1++) {
          var range = doc.sel.ranges[i$1];
          if (range.head.line == n && range.head.ch < curSpaceString.length) {
            var pos$1 = Pos(n, curSpaceString.length);
            replaceOneSelection(doc, i$1, new Range(pos$1, pos$1));
            break
          }
        }
      }
    }

    // This will be set to a {lineWise: bool, text: [string]} object, so
    // that, when pasting, we know what kind of selections the copied
    // text was made out of.
    var lastCopied = null;

    function setLastCopied(newLastCopied) {
      lastCopied = newLastCopied;
    }

    function applyTextInput(cm, inserted, deleted, sel, origin) {
      var doc = cm.doc;
      cm.display.shift = false;
      if (!sel) { sel = doc.sel; }

      var paste = cm.state.pasteIncoming || origin == "paste";
      var textLines = splitLinesAuto(inserted), multiPaste = null;
      // When pasting N lines into N selections, insert one line per selection
      if (paste && sel.ranges.length > 1) {
        if (lastCopied && lastCopied.text.join("\n") == inserted) {
          if (sel.ranges.length % lastCopied.text.length == 0) {
            multiPaste = [];
            for (var i = 0; i < lastCopied.text.length; i++)
              { multiPaste.push(doc.splitLines(lastCopied.text[i])); }
          }
        } else if (textLines.length == sel.ranges.length && cm.options.pasteLinesPerSelection) {
          multiPaste = map(textLines, function (l) { return [l]; });
        }
      }

      var updateInput = cm.curOp.updateInput;
      // Normal behavior is to insert the new text into every selection
      for (var i$1 = sel.ranges.length - 1; i$1 >= 0; i$1--) {
        var range$$1 = sel.ranges[i$1];
        var from = range$$1.from(), to = range$$1.to();
        if (range$$1.empty()) {
          if (deleted && deleted > 0) // Handle deletion
            { from = Pos(from.line, from.ch - deleted); }
          else if (cm.state.overwrite && !paste) // Handle overwrite
            { to = Pos(to.line, Math.min(getLine(doc, to.line).text.length, to.ch + lst(textLines).length)); }
          else if (paste && lastCopied && lastCopied.lineWise && lastCopied.text.join("\n") == inserted)
            { from = to = Pos(from.line, 0); }
        }
        var changeEvent = {from: from, to: to, text: multiPaste ? multiPaste[i$1 % multiPaste.length] : textLines,
                           origin: origin || (paste ? "paste" : cm.state.cutIncoming ? "cut" : "+input")};
        makeChange(cm.doc, changeEvent);
        signalLater(cm, "inputRead", cm, changeEvent);
      }
      if (inserted && !paste)
        { triggerElectric(cm, inserted); }

      ensureCursorVisible(cm);
      if (cm.curOp.updateInput < 2) { cm.curOp.updateInput = updateInput; }
      cm.curOp.typing = true;
      cm.state.pasteIncoming = cm.state.cutIncoming = false;
    }

    function handlePaste(e, cm) {
      var pasted = e.clipboardData && e.clipboardData.getData("Text");
      if (pasted) {
        e.preventDefault();
        if (!cm.isReadOnly() && !cm.options.disableInput)
          { runInOp(cm, function () { return applyTextInput(cm, pasted, 0, null, "paste"); }); }
        return true
      }
    }

    function triggerElectric(cm, inserted) {
      // When an 'electric' character is inserted, immediately trigger a reindent
      if (!cm.options.electricChars || !cm.options.smartIndent) { return }
      var sel = cm.doc.sel;

      for (var i = sel.ranges.length - 1; i >= 0; i--) {
        var range$$1 = sel.ranges[i];
        if (range$$1.head.ch > 100 || (i && sel.ranges[i - 1].head.line == range$$1.head.line)) { continue }
        var mode = cm.getModeAt(range$$1.head);
        var indented = false;
        if (mode.electricChars) {
          for (var j = 0; j < mode.electricChars.length; j++)
            { if (inserted.indexOf(mode.electricChars.charAt(j)) > -1) {
              indented = indentLine(cm, range$$1.head.line, "smart");
              break
            } }
        } else if (mode.electricInput) {
          if (mode.electricInput.test(getLine(cm.doc, range$$1.head.line).text.slice(0, range$$1.head.ch)))
            { indented = indentLine(cm, range$$1.head.line, "smart"); }
        }
        if (indented) { signalLater(cm, "electricInput", cm, range$$1.head.line); }
      }
    }

    function copyableRanges(cm) {
      var text = [], ranges = [];
      for (var i = 0; i < cm.doc.sel.ranges.length; i++) {
        var line = cm.doc.sel.ranges[i].head.line;
        var lineRange = {anchor: Pos(line, 0), head: Pos(line + 1, 0)};
        ranges.push(lineRange);
        text.push(cm.getRange(lineRange.anchor, lineRange.head));
      }
      return {text: text, ranges: ranges}
    }

    function disableBrowserMagic(field, spellcheck) {
      field.setAttribute("autocorrect", "off");
      field.setAttribute("autocapitalize", "off");
      field.setAttribute("spellcheck", !!spellcheck);
    }

    function hiddenTextarea() {
      var te = elt("textarea", null, null, "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none");
      var div = elt("div", [te], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
      // The textarea is kept positioned near the cursor to prevent the
      // fact that it'll be scrolled into view on input from scrolling
      // our fake cursor out of view. On webkit, when wrap=off, paste is
      // very slow. So make the area wide instead.
      if (webkit) { te.style.width = "1000px"; }
      else { te.setAttribute("wrap", "off"); }
      // If border: 0; -- iOS fails to open keyboard (issue #1287)
      if (ios) { te.style.border = "1px solid black"; }
      disableBrowserMagic(te);
      return div
    }

    // The publicly visible API. Note that methodOp(f) means
    // 'wrap f in an operation, performed on its `this` parameter'.

    // This is not the complete set of editor methods. Most of the
    // methods defined on the Doc type are also injected into
    // CodeMirror.prototype, for backwards compatibility and
    // convenience.

    function addEditorMethods(CodeMirror) {
      var optionHandlers = CodeMirror.optionHandlers;

      var helpers = CodeMirror.helpers = {};

      CodeMirror.prototype = {
        constructor: CodeMirror,
        focus: function(){window.focus(); this.display.input.focus();},

        setOption: function(option, value) {
          var options = this.options, old = options[option];
          if (options[option] == value && option != "mode") { return }
          options[option] = value;
          if (optionHandlers.hasOwnProperty(option))
            { operation(this, optionHandlers[option])(this, value, old); }
          signal(this, "optionChange", this, option);
        },

        getOption: function(option) {return this.options[option]},
        getDoc: function() {return this.doc},

        addKeyMap: function(map$$1, bottom) {
          this.state.keyMaps[bottom ? "push" : "unshift"](getKeyMap(map$$1));
        },
        removeKeyMap: function(map$$1) {
          var maps = this.state.keyMaps;
          for (var i = 0; i < maps.length; ++i)
            { if (maps[i] == map$$1 || maps[i].name == map$$1) {
              maps.splice(i, 1);
              return true
            } }
        },

        addOverlay: methodOp(function(spec, options) {
          var mode = spec.token ? spec : CodeMirror.getMode(this.options, spec);
          if (mode.startState) { throw new Error("Overlays may not be stateful.") }
          insertSorted(this.state.overlays,
                       {mode: mode, modeSpec: spec, opaque: options && options.opaque,
                        priority: (options && options.priority) || 0},
                       function (overlay) { return overlay.priority; });
          this.state.modeGen++;
          regChange(this);
        }),
        removeOverlay: methodOp(function(spec) {
          var this$1 = this;

          var overlays = this.state.overlays;
          for (var i = 0; i < overlays.length; ++i) {
            var cur = overlays[i].modeSpec;
            if (cur == spec || typeof spec == "string" && cur.name == spec) {
              overlays.splice(i, 1);
              this$1.state.modeGen++;
              regChange(this$1);
              return
            }
          }
        }),

        indentLine: methodOp(function(n, dir, aggressive) {
          if (typeof dir != "string" && typeof dir != "number") {
            if (dir == null) { dir = this.options.smartIndent ? "smart" : "prev"; }
            else { dir = dir ? "add" : "subtract"; }
          }
          if (isLine(this.doc, n)) { indentLine(this, n, dir, aggressive); }
        }),
        indentSelection: methodOp(function(how) {
          var this$1 = this;

          var ranges = this.doc.sel.ranges, end = -1;
          for (var i = 0; i < ranges.length; i++) {
            var range$$1 = ranges[i];
            if (!range$$1.empty()) {
              var from = range$$1.from(), to = range$$1.to();
              var start = Math.max(end, from.line);
              end = Math.min(this$1.lastLine(), to.line - (to.ch ? 0 : 1)) + 1;
              for (var j = start; j < end; ++j)
                { indentLine(this$1, j, how); }
              var newRanges = this$1.doc.sel.ranges;
              if (from.ch == 0 && ranges.length == newRanges.length && newRanges[i].from().ch > 0)
                { replaceOneSelection(this$1.doc, i, new Range(from, newRanges[i].to()), sel_dontScroll); }
            } else if (range$$1.head.line > end) {
              indentLine(this$1, range$$1.head.line, how, true);
              end = range$$1.head.line;
              if (i == this$1.doc.sel.primIndex) { ensureCursorVisible(this$1); }
            }
          }
        }),

        // Fetch the parser token for a given character. Useful for hacks
        // that want to inspect the mode state (say, for completion).
        getTokenAt: function(pos, precise) {
          return takeToken(this, pos, precise)
        },

        getLineTokens: function(line, precise) {
          return takeToken(this, Pos(line), precise, true)
        },

        getTokenTypeAt: function(pos) {
          pos = clipPos(this.doc, pos);
          var styles = getLineStyles(this, getLine(this.doc, pos.line));
          var before = 0, after = (styles.length - 1) / 2, ch = pos.ch;
          var type;
          if (ch == 0) { type = styles[2]; }
          else { for (;;) {
            var mid = (before + after) >> 1;
            if ((mid ? styles[mid * 2 - 1] : 0) >= ch) { after = mid; }
            else if (styles[mid * 2 + 1] < ch) { before = mid + 1; }
            else { type = styles[mid * 2 + 2]; break }
          } }
          var cut = type ? type.indexOf("overlay ") : -1;
          return cut < 0 ? type : cut == 0 ? null : type.slice(0, cut - 1)
        },

        getModeAt: function(pos) {
          var mode = this.doc.mode;
          if (!mode.innerMode) { return mode }
          return CodeMirror.innerMode(mode, this.getTokenAt(pos).state).mode
        },

        getHelper: function(pos, type) {
          return this.getHelpers(pos, type)[0]
        },

        getHelpers: function(pos, type) {
          var this$1 = this;

          var found = [];
          if (!helpers.hasOwnProperty(type)) { return found }
          var help = helpers[type], mode = this.getModeAt(pos);
          if (typeof mode[type] == "string") {
            if (help[mode[type]]) { found.push(help[mode[type]]); }
          } else if (mode[type]) {
            for (var i = 0; i < mode[type].length; i++) {
              var val = help[mode[type][i]];
              if (val) { found.push(val); }
            }
          } else if (mode.helperType && help[mode.helperType]) {
            found.push(help[mode.helperType]);
          } else if (help[mode.name]) {
            found.push(help[mode.name]);
          }
          for (var i$1 = 0; i$1 < help._global.length; i$1++) {
            var cur = help._global[i$1];
            if (cur.pred(mode, this$1) && indexOf(found, cur.val) == -1)
              { found.push(cur.val); }
          }
          return found
        },

        getStateAfter: function(line, precise) {
          var doc = this.doc;
          line = clipLine(doc, line == null ? doc.first + doc.size - 1: line);
          return getContextBefore(this, line + 1, precise).state
        },

        cursorCoords: function(start, mode) {
          var pos, range$$1 = this.doc.sel.primary();
          if (start == null) { pos = range$$1.head; }
          else if (typeof start == "object") { pos = clipPos(this.doc, start); }
          else { pos = start ? range$$1.from() : range$$1.to(); }
          return cursorCoords(this, pos, mode || "page")
        },

        charCoords: function(pos, mode) {
          return charCoords(this, clipPos(this.doc, pos), mode || "page")
        },

        coordsChar: function(coords, mode) {
          coords = fromCoordSystem(this, coords, mode || "page");
          return coordsChar(this, coords.left, coords.top)
        },

        lineAtHeight: function(height, mode) {
          height = fromCoordSystem(this, {top: height, left: 0}, mode || "page").top;
          return lineAtHeight(this.doc, height + this.display.viewOffset)
        },
        heightAtLine: function(line, mode, includeWidgets) {
          var end = false, lineObj;
          if (typeof line == "number") {
            var last = this.doc.first + this.doc.size - 1;
            if (line < this.doc.first) { line = this.doc.first; }
            else if (line > last) { line = last; end = true; }
            lineObj = getLine(this.doc, line);
          } else {
            lineObj = line;
          }
          return intoCoordSystem(this, lineObj, {top: 0, left: 0}, mode || "page", includeWidgets || end).top +
            (end ? this.doc.height - heightAtLine(lineObj) : 0)
        },

        defaultTextHeight: function() { return textHeight(this.display) },
        defaultCharWidth: function() { return charWidth(this.display) },

        getViewport: function() { return {from: this.display.viewFrom, to: this.display.viewTo}},

        addWidget: function(pos, node, scroll, vert, horiz) {
          var display = this.display;
          pos = cursorCoords(this, clipPos(this.doc, pos));
          var top = pos.bottom, left = pos.left;
          node.style.position = "absolute";
          node.setAttribute("cm-ignore-events", "true");
          this.display.input.setUneditable(node);
          display.sizer.appendChild(node);
          if (vert == "over") {
            top = pos.top;
          } else if (vert == "above" || vert == "near") {
            var vspace = Math.max(display.wrapper.clientHeight, this.doc.height),
            hspace = Math.max(display.sizer.clientWidth, display.lineSpace.clientWidth);
            // Default to positioning above (if specified and possible); otherwise default to positioning below
            if ((vert == 'above' || pos.bottom + node.offsetHeight > vspace) && pos.top > node.offsetHeight)
              { top = pos.top - node.offsetHeight; }
            else if (pos.bottom + node.offsetHeight <= vspace)
              { top = pos.bottom; }
            if (left + node.offsetWidth > hspace)
              { left = hspace - node.offsetWidth; }
          }
          node.style.top = top + "px";
          node.style.left = node.style.right = "";
          if (horiz == "right") {
            left = display.sizer.clientWidth - node.offsetWidth;
            node.style.right = "0px";
          } else {
            if (horiz == "left") { left = 0; }
            else if (horiz == "middle") { left = (display.sizer.clientWidth - node.offsetWidth) / 2; }
            node.style.left = left + "px";
          }
          if (scroll)
            { scrollIntoView(this, {left: left, top: top, right: left + node.offsetWidth, bottom: top + node.offsetHeight}); }
        },

        triggerOnKeyDown: methodOp(onKeyDown),
        triggerOnKeyPress: methodOp(onKeyPress),
        triggerOnKeyUp: onKeyUp,
        triggerOnMouseDown: methodOp(onMouseDown),

        execCommand: function(cmd) {
          if (commands.hasOwnProperty(cmd))
            { return commands[cmd].call(null, this) }
        },

        triggerElectric: methodOp(function(text) { triggerElectric(this, text); }),

        findPosH: function(from, amount, unit, visually) {
          var this$1 = this;

          var dir = 1;
          if (amount < 0) { dir = -1; amount = -amount; }
          var cur = clipPos(this.doc, from);
          for (var i = 0; i < amount; ++i) {
            cur = findPosH(this$1.doc, cur, dir, unit, visually);
            if (cur.hitSide) { break }
          }
          return cur
        },

        moveH: methodOp(function(dir, unit) {
          var this$1 = this;

          this.extendSelectionsBy(function (range$$1) {
            if (this$1.display.shift || this$1.doc.extend || range$$1.empty())
              { return findPosH(this$1.doc, range$$1.head, dir, unit, this$1.options.rtlMoveVisually) }
            else
              { return dir < 0 ? range$$1.from() : range$$1.to() }
          }, sel_move);
        }),

        deleteH: methodOp(function(dir, unit) {
          var sel = this.doc.sel, doc = this.doc;
          if (sel.somethingSelected())
            { doc.replaceSelection("", null, "+delete"); }
          else
            { deleteNearSelection(this, function (range$$1) {
              var other = findPosH(doc, range$$1.head, dir, unit, false);
              return dir < 0 ? {from: other, to: range$$1.head} : {from: range$$1.head, to: other}
            }); }
        }),

        findPosV: function(from, amount, unit, goalColumn) {
          var this$1 = this;

          var dir = 1, x = goalColumn;
          if (amount < 0) { dir = -1; amount = -amount; }
          var cur = clipPos(this.doc, from);
          for (var i = 0; i < amount; ++i) {
            var coords = cursorCoords(this$1, cur, "div");
            if (x == null) { x = coords.left; }
            else { coords.left = x; }
            cur = findPosV(this$1, coords, dir, unit);
            if (cur.hitSide) { break }
          }
          return cur
        },

        moveV: methodOp(function(dir, unit) {
          var this$1 = this;

          var doc = this.doc, goals = [];
          var collapse = !this.display.shift && !doc.extend && doc.sel.somethingSelected();
          doc.extendSelectionsBy(function (range$$1) {
            if (collapse)
              { return dir < 0 ? range$$1.from() : range$$1.to() }
            var headPos = cursorCoords(this$1, range$$1.head, "div");
            if (range$$1.goalColumn != null) { headPos.left = range$$1.goalColumn; }
            goals.push(headPos.left);
            var pos = findPosV(this$1, headPos, dir, unit);
            if (unit == "page" && range$$1 == doc.sel.primary())
              { addToScrollTop(this$1, charCoords(this$1, pos, "div").top - headPos.top); }
            return pos
          }, sel_move);
          if (goals.length) { for (var i = 0; i < doc.sel.ranges.length; i++)
            { doc.sel.ranges[i].goalColumn = goals[i]; } }
        }),

        // Find the word at the given position (as returned by coordsChar).
        findWordAt: function(pos) {
          var doc = this.doc, line = getLine(doc, pos.line).text;
          var start = pos.ch, end = pos.ch;
          if (line) {
            var helper = this.getHelper(pos, "wordChars");
            if ((pos.sticky == "before" || end == line.length) && start) { --start; } else { ++end; }
            var startChar = line.charAt(start);
            var check = isWordChar(startChar, helper)
              ? function (ch) { return isWordChar(ch, helper); }
              : /\s/.test(startChar) ? function (ch) { return /\s/.test(ch); }
              : function (ch) { return (!/\s/.test(ch) && !isWordChar(ch)); };
            while (start > 0 && check(line.charAt(start - 1))) { --start; }
            while (end < line.length && check(line.charAt(end))) { ++end; }
          }
          return new Range(Pos(pos.line, start), Pos(pos.line, end))
        },

        toggleOverwrite: function(value) {
          if (value != null && value == this.state.overwrite) { return }
          if (this.state.overwrite = !this.state.overwrite)
            { addClass(this.display.cursorDiv, "CodeMirror-overwrite"); }
          else
            { rmClass(this.display.cursorDiv, "CodeMirror-overwrite"); }

          signal(this, "overwriteToggle", this, this.state.overwrite);
        },
        hasFocus: function() { return this.display.input.getField() == activeElt() },
        isReadOnly: function() { return !!(this.options.readOnly || this.doc.cantEdit) },

        scrollTo: methodOp(function (x, y) { scrollToCoords(this, x, y); }),
        getScrollInfo: function() {
          var scroller = this.display.scroller;
          return {left: scroller.scrollLeft, top: scroller.scrollTop,
                  height: scroller.scrollHeight - scrollGap(this) - this.display.barHeight,
                  width: scroller.scrollWidth - scrollGap(this) - this.display.barWidth,
                  clientHeight: displayHeight(this), clientWidth: displayWidth(this)}
        },

        scrollIntoView: methodOp(function(range$$1, margin) {
          if (range$$1 == null) {
            range$$1 = {from: this.doc.sel.primary().head, to: null};
            if (margin == null) { margin = this.options.cursorScrollMargin; }
          } else if (typeof range$$1 == "number") {
            range$$1 = {from: Pos(range$$1, 0), to: null};
          } else if (range$$1.from == null) {
            range$$1 = {from: range$$1, to: null};
          }
          if (!range$$1.to) { range$$1.to = range$$1.from; }
          range$$1.margin = margin || 0;

          if (range$$1.from.line != null) {
            scrollToRange(this, range$$1);
          } else {
            scrollToCoordsRange(this, range$$1.from, range$$1.to, range$$1.margin);
          }
        }),

        setSize: methodOp(function(width, height) {
          var this$1 = this;

          var interpret = function (val) { return typeof val == "number" || /^\d+$/.test(String(val)) ? val + "px" : val; };
          if (width != null) { this.display.wrapper.style.width = interpret(width); }
          if (height != null) { this.display.wrapper.style.height = interpret(height); }
          if (this.options.lineWrapping) { clearLineMeasurementCache(this); }
          var lineNo$$1 = this.display.viewFrom;
          this.doc.iter(lineNo$$1, this.display.viewTo, function (line) {
            if (line.widgets) { for (var i = 0; i < line.widgets.length; i++)
              { if (line.widgets[i].noHScroll) { regLineChange(this$1, lineNo$$1, "widget"); break } } }
            ++lineNo$$1;
          });
          this.curOp.forceUpdate = true;
          signal(this, "refresh", this);
        }),

        operation: function(f){return runInOp(this, f)},
        startOperation: function(){return startOperation(this)},
        endOperation: function(){return endOperation(this)},

        refresh: methodOp(function() {
          var oldHeight = this.display.cachedTextHeight;
          regChange(this);
          this.curOp.forceUpdate = true;
          clearCaches(this);
          scrollToCoords(this, this.doc.scrollLeft, this.doc.scrollTop);
          updateGutterSpace(this);
          if (oldHeight == null || Math.abs(oldHeight - textHeight(this.display)) > .5)
            { estimateLineHeights(this); }
          signal(this, "refresh", this);
        }),

        swapDoc: methodOp(function(doc) {
          var old = this.doc;
          old.cm = null;
          attachDoc(this, doc);
          clearCaches(this);
          this.display.input.reset();
          scrollToCoords(this, doc.scrollLeft, doc.scrollTop);
          this.curOp.forceScroll = true;
          signalLater(this, "swapDoc", this, old);
          return old
        }),

        phrase: function(phraseText) {
          var phrases = this.options.phrases;
          return phrases && Object.prototype.hasOwnProperty.call(phrases, phraseText) ? phrases[phraseText] : phraseText
        },

        getInputField: function(){return this.display.input.getField()},
        getWrapperElement: function(){return this.display.wrapper},
        getScrollerElement: function(){return this.display.scroller},
        getGutterElement: function(){return this.display.gutters}
      };
      eventMixin(CodeMirror);

      CodeMirror.registerHelper = function(type, name, value) {
        if (!helpers.hasOwnProperty(type)) { helpers[type] = CodeMirror[type] = {_global: []}; }
        helpers[type][name] = value;
      };
      CodeMirror.registerGlobalHelper = function(type, name, predicate, value) {
        CodeMirror.registerHelper(type, name, value);
        helpers[type]._global.push({pred: predicate, val: value});
      };
    }

    // Used for horizontal relative motion. Dir is -1 or 1 (left or
    // right), unit can be "char", "column" (like char, but doesn't
    // cross line boundaries), "word" (across next word), or "group" (to
    // the start of next group of word or non-word-non-whitespace
    // chars). The visually param controls whether, in right-to-left
    // text, direction 1 means to move towards the next index in the
    // string, or towards the character to the right of the current
    // position. The resulting position will have a hitSide=true
    // property if it reached the end of the document.
    function findPosH(doc, pos, dir, unit, visually) {
      var oldPos = pos;
      var origDir = dir;
      var lineObj = getLine(doc, pos.line);
      function findNextLine() {
        var l = pos.line + dir;
        if (l < doc.first || l >= doc.first + doc.size) { return false }
        pos = new Pos(l, pos.ch, pos.sticky);
        return lineObj = getLine(doc, l)
      }
      function moveOnce(boundToLine) {
        var next;
        if (visually) {
          next = moveVisually(doc.cm, lineObj, pos, dir);
        } else {
          next = moveLogically(lineObj, pos, dir);
        }
        if (next == null) {
          if (!boundToLine && findNextLine())
            { pos = endOfLine(visually, doc.cm, lineObj, pos.line, dir); }
          else
            { return false }
        } else {
          pos = next;
        }
        return true
      }

      if (unit == "char") {
        moveOnce();
      } else if (unit == "column") {
        moveOnce(true);
      } else if (unit == "word" || unit == "group") {
        var sawType = null, group = unit == "group";
        var helper = doc.cm && doc.cm.getHelper(pos, "wordChars");
        for (var first = true;; first = false) {
          if (dir < 0 && !moveOnce(!first)) { break }
          var cur = lineObj.text.charAt(pos.ch) || "\n";
          var type = isWordChar(cur, helper) ? "w"
            : group && cur == "\n" ? "n"
            : !group || /\s/.test(cur) ? null
            : "p";
          if (group && !first && !type) { type = "s"; }
          if (sawType && sawType != type) {
            if (dir < 0) {dir = 1; moveOnce(); pos.sticky = "after";}
            break
          }

          if (type) { sawType = type; }
          if (dir > 0 && !moveOnce(!first)) { break }
        }
      }
      var result = skipAtomic(doc, pos, oldPos, origDir, true);
      if (equalCursorPos(oldPos, result)) { result.hitSide = true; }
      return result
    }

    // For relative vertical movement. Dir may be -1 or 1. Unit can be
    // "page" or "line". The resulting position will have a hitSide=true
    // property if it reached the end of the document.
    function findPosV(cm, pos, dir, unit) {
      var doc = cm.doc, x = pos.left, y;
      if (unit == "page") {
        var pageSize = Math.min(cm.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
        var moveAmount = Math.max(pageSize - .5 * textHeight(cm.display), 3);
        y = (dir > 0 ? pos.bottom : pos.top) + dir * moveAmount;

      } else if (unit == "line") {
        y = dir > 0 ? pos.bottom + 3 : pos.top - 3;
      }
      var target;
      for (;;) {
        target = coordsChar(cm, x, y);
        if (!target.outside) { break }
        if (dir < 0 ? y <= 0 : y >= doc.height) { target.hitSide = true; break }
        y += dir * 5;
      }
      return target
    }

    // CONTENTEDITABLE INPUT STYLE

    var ContentEditableInput = function(cm) {
      this.cm = cm;
      this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null;
      this.polling = new Delayed();
      this.composing = null;
      this.gracePeriod = false;
      this.readDOMTimeout = null;
    };

    ContentEditableInput.prototype.init = function (display) {
        var this$1 = this;

      var input = this, cm = input.cm;
      var div = input.div = display.lineDiv;
      disableBrowserMagic(div, cm.options.spellcheck);

      on(div, "paste", function (e) {
        if (signalDOMEvent(cm, e) || handlePaste(e, cm)) { return }
        // IE doesn't fire input events, so we schedule a read for the pasted content in this way
        if (ie_version <= 11) { setTimeout(operation(cm, function () { return this$1.updateFromDOM(); }), 20); }
      });

      on(div, "compositionstart", function (e) {
        this$1.composing = {data: e.data, done: false};
      });
      on(div, "compositionupdate", function (e) {
        if (!this$1.composing) { this$1.composing = {data: e.data, done: false}; }
      });
      on(div, "compositionend", function (e) {
        if (this$1.composing) {
          if (e.data != this$1.composing.data) { this$1.readFromDOMSoon(); }
          this$1.composing.done = true;
        }
      });

      on(div, "touchstart", function () { return input.forceCompositionEnd(); });

      on(div, "input", function () {
        if (!this$1.composing) { this$1.readFromDOMSoon(); }
      });

      function onCopyCut(e) {
        if (signalDOMEvent(cm, e)) { return }
        if (cm.somethingSelected()) {
          setLastCopied({lineWise: false, text: cm.getSelections()});
          if (e.type == "cut") { cm.replaceSelection("", null, "cut"); }
        } else if (!cm.options.lineWiseCopyCut) {
          return
        } else {
          var ranges = copyableRanges(cm);
          setLastCopied({lineWise: true, text: ranges.text});
          if (e.type == "cut") {
            cm.operation(function () {
              cm.setSelections(ranges.ranges, 0, sel_dontScroll);
              cm.replaceSelection("", null, "cut");
            });
          }
        }
        if (e.clipboardData) {
          e.clipboardData.clearData();
          var content = lastCopied.text.join("\n");
          // iOS exposes the clipboard API, but seems to discard content inserted into it
          e.clipboardData.setData("Text", content);
          if (e.clipboardData.getData("Text") == content) {
            e.preventDefault();
            return
          }
        }
        // Old-fashioned briefly-focus-a-textarea hack
        var kludge = hiddenTextarea(), te = kludge.firstChild;
        cm.display.lineSpace.insertBefore(kludge, cm.display.lineSpace.firstChild);
        te.value = lastCopied.text.join("\n");
        var hadFocus = document.activeElement;
        selectInput(te);
        setTimeout(function () {
          cm.display.lineSpace.removeChild(kludge);
          hadFocus.focus();
          if (hadFocus == div) { input.showPrimarySelection(); }
        }, 50);
      }
      on(div, "copy", onCopyCut);
      on(div, "cut", onCopyCut);
    };

    ContentEditableInput.prototype.prepareSelection = function () {
      var result = prepareSelection(this.cm, false);
      result.focus = this.cm.state.focused;
      return result
    };

    ContentEditableInput.prototype.showSelection = function (info, takeFocus) {
      if (!info || !this.cm.display.view.length) { return }
      if (info.focus || takeFocus) { this.showPrimarySelection(); }
      this.showMultipleSelections(info);
    };

    ContentEditableInput.prototype.getSelection = function () {
      return this.cm.display.wrapper.ownerDocument.getSelection()
    };

    ContentEditableInput.prototype.showPrimarySelection = function () {
      var sel = this.getSelection(), cm = this.cm, prim = cm.doc.sel.primary();
      var from = prim.from(), to = prim.to();

      if (cm.display.viewTo == cm.display.viewFrom || from.line >= cm.display.viewTo || to.line < cm.display.viewFrom) {
        sel.removeAllRanges();
        return
      }

      var curAnchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
      var curFocus = domToPos(cm, sel.focusNode, sel.focusOffset);
      if (curAnchor && !curAnchor.bad && curFocus && !curFocus.bad &&
          cmp(minPos(curAnchor, curFocus), from) == 0 &&
          cmp(maxPos(curAnchor, curFocus), to) == 0)
        { return }

      var view = cm.display.view;
      var start = (from.line >= cm.display.viewFrom && posToDOM(cm, from)) ||
          {node: view[0].measure.map[2], offset: 0};
      var end = to.line < cm.display.viewTo && posToDOM(cm, to);
      if (!end) {
        var measure = view[view.length - 1].measure;
        var map$$1 = measure.maps ? measure.maps[measure.maps.length - 1] : measure.map;
        end = {node: map$$1[map$$1.length - 1], offset: map$$1[map$$1.length - 2] - map$$1[map$$1.length - 3]};
      }

      if (!start || !end) {
        sel.removeAllRanges();
        return
      }

      var old = sel.rangeCount && sel.getRangeAt(0), rng;
      try { rng = range(start.node, start.offset, end.offset, end.node); }
      catch(e) {} // Our model of the DOM might be outdated, in which case the range we try to set can be impossible
      if (rng) {
        if (!gecko && cm.state.focused) {
          sel.collapse(start.node, start.offset);
          if (!rng.collapsed) {
            sel.removeAllRanges();
            sel.addRange(rng);
          }
        } else {
          sel.removeAllRanges();
          sel.addRange(rng);
        }
        if (old && sel.anchorNode == null) { sel.addRange(old); }
        else if (gecko) { this.startGracePeriod(); }
      }
      this.rememberSelection();
    };

    ContentEditableInput.prototype.startGracePeriod = function () {
        var this$1 = this;

      clearTimeout(this.gracePeriod);
      this.gracePeriod = setTimeout(function () {
        this$1.gracePeriod = false;
        if (this$1.selectionChanged())
          { this$1.cm.operation(function () { return this$1.cm.curOp.selectionChanged = true; }); }
      }, 20);
    };

    ContentEditableInput.prototype.showMultipleSelections = function (info) {
      removeChildrenAndAdd(this.cm.display.cursorDiv, info.cursors);
      removeChildrenAndAdd(this.cm.display.selectionDiv, info.selection);
    };

    ContentEditableInput.prototype.rememberSelection = function () {
      var sel = this.getSelection();
      this.lastAnchorNode = sel.anchorNode; this.lastAnchorOffset = sel.anchorOffset;
      this.lastFocusNode = sel.focusNode; this.lastFocusOffset = sel.focusOffset;
    };

    ContentEditableInput.prototype.selectionInEditor = function () {
      var sel = this.getSelection();
      if (!sel.rangeCount) { return false }
      var node = sel.getRangeAt(0).commonAncestorContainer;
      return contains(this.div, node)
    };

    ContentEditableInput.prototype.focus = function () {
      if (this.cm.options.readOnly != "nocursor") {
        if (!this.selectionInEditor())
          { this.showSelection(this.prepareSelection(), true); }
        this.div.focus();
      }
    };
    ContentEditableInput.prototype.blur = function () { this.div.blur(); };
    ContentEditableInput.prototype.getField = function () { return this.div };

    ContentEditableInput.prototype.supportsTouch = function () { return true };

    ContentEditableInput.prototype.receivedFocus = function () {
      var input = this;
      if (this.selectionInEditor())
        { this.pollSelection(); }
      else
        { runInOp(this.cm, function () { return input.cm.curOp.selectionChanged = true; }); }

      function poll() {
        if (input.cm.state.focused) {
          input.pollSelection();
          input.polling.set(input.cm.options.pollInterval, poll);
        }
      }
      this.polling.set(this.cm.options.pollInterval, poll);
    };

    ContentEditableInput.prototype.selectionChanged = function () {
      var sel = this.getSelection();
      return sel.anchorNode != this.lastAnchorNode || sel.anchorOffset != this.lastAnchorOffset ||
        sel.focusNode != this.lastFocusNode || sel.focusOffset != this.lastFocusOffset
    };

    ContentEditableInput.prototype.pollSelection = function () {
      if (this.readDOMTimeout != null || this.gracePeriod || !this.selectionChanged()) { return }
      var sel = this.getSelection(), cm = this.cm;
      // On Android Chrome (version 56, at least), backspacing into an
      // uneditable block element will put the cursor in that element,
      // and then, because it's not editable, hide the virtual keyboard.
      // Because Android doesn't allow us to actually detect backspace
      // presses in a sane way, this code checks for when that happens
      // and simulates a backspace press in this case.
      if (android && chrome && this.cm.options.gutters.length && isInGutter(sel.anchorNode)) {
        this.cm.triggerOnKeyDown({type: "keydown", keyCode: 8, preventDefault: Math.abs});
        this.blur();
        this.focus();
        return
      }
      if (this.composing) { return }
      this.rememberSelection();
      var anchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
      var head = domToPos(cm, sel.focusNode, sel.focusOffset);
      if (anchor && head) { runInOp(cm, function () {
        setSelection(cm.doc, simpleSelection(anchor, head), sel_dontScroll);
        if (anchor.bad || head.bad) { cm.curOp.selectionChanged = true; }
      }); }
    };

    ContentEditableInput.prototype.pollContent = function () {
      if (this.readDOMTimeout != null) {
        clearTimeout(this.readDOMTimeout);
        this.readDOMTimeout = null;
      }

      var cm = this.cm, display = cm.display, sel = cm.doc.sel.primary();
      var from = sel.from(), to = sel.to();
      if (from.ch == 0 && from.line > cm.firstLine())
        { from = Pos(from.line - 1, getLine(cm.doc, from.line - 1).length); }
      if (to.ch == getLine(cm.doc, to.line).text.length && to.line < cm.lastLine())
        { to = Pos(to.line + 1, 0); }
      if (from.line < display.viewFrom || to.line > display.viewTo - 1) { return false }

      var fromIndex, fromLine, fromNode;
      if (from.line == display.viewFrom || (fromIndex = findViewIndex(cm, from.line)) == 0) {
        fromLine = lineNo(display.view[0].line);
        fromNode = display.view[0].node;
      } else {
        fromLine = lineNo(display.view[fromIndex].line);
        fromNode = display.view[fromIndex - 1].node.nextSibling;
      }
      var toIndex = findViewIndex(cm, to.line);
      var toLine, toNode;
      if (toIndex == display.view.length - 1) {
        toLine = display.viewTo - 1;
        toNode = display.lineDiv.lastChild;
      } else {
        toLine = lineNo(display.view[toIndex + 1].line) - 1;
        toNode = display.view[toIndex + 1].node.previousSibling;
      }

      if (!fromNode) { return false }
      var newText = cm.doc.splitLines(domTextBetween(cm, fromNode, toNode, fromLine, toLine));
      var oldText = getBetween(cm.doc, Pos(fromLine, 0), Pos(toLine, getLine(cm.doc, toLine).text.length));
      while (newText.length > 1 && oldText.length > 1) {
        if (lst(newText) == lst(oldText)) { newText.pop(); oldText.pop(); toLine--; }
        else if (newText[0] == oldText[0]) { newText.shift(); oldText.shift(); fromLine++; }
        else { break }
      }

      var cutFront = 0, cutEnd = 0;
      var newTop = newText[0], oldTop = oldText[0], maxCutFront = Math.min(newTop.length, oldTop.length);
      while (cutFront < maxCutFront && newTop.charCodeAt(cutFront) == oldTop.charCodeAt(cutFront))
        { ++cutFront; }
      var newBot = lst(newText), oldBot = lst(oldText);
      var maxCutEnd = Math.min(newBot.length - (newText.length == 1 ? cutFront : 0),
                               oldBot.length - (oldText.length == 1 ? cutFront : 0));
      while (cutEnd < maxCutEnd &&
             newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1))
        { ++cutEnd; }
      // Try to move start of change to start of selection if ambiguous
      if (newText.length == 1 && oldText.length == 1 && fromLine == from.line) {
        while (cutFront && cutFront > from.ch &&
               newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1)) {
          cutFront--;
          cutEnd++;
        }
      }

      newText[newText.length - 1] = newBot.slice(0, newBot.length - cutEnd).replace(/^\u200b+/, "");
      newText[0] = newText[0].slice(cutFront).replace(/\u200b+$/, "");

      var chFrom = Pos(fromLine, cutFront);
      var chTo = Pos(toLine, oldText.length ? lst(oldText).length - cutEnd : 0);
      if (newText.length > 1 || newText[0] || cmp(chFrom, chTo)) {
        replaceRange(cm.doc, newText, chFrom, chTo, "+input");
        return true
      }
    };

    ContentEditableInput.prototype.ensurePolled = function () {
      this.forceCompositionEnd();
    };
    ContentEditableInput.prototype.reset = function () {
      this.forceCompositionEnd();
    };
    ContentEditableInput.prototype.forceCompositionEnd = function () {
      if (!this.composing) { return }
      clearTimeout(this.readDOMTimeout);
      this.composing = null;
      this.updateFromDOM();
      this.div.blur();
      this.div.focus();
    };
    ContentEditableInput.prototype.readFromDOMSoon = function () {
        var this$1 = this;

      if (this.readDOMTimeout != null) { return }
      this.readDOMTimeout = setTimeout(function () {
        this$1.readDOMTimeout = null;
        if (this$1.composing) {
          if (this$1.composing.done) { this$1.composing = null; }
          else { return }
        }
        this$1.updateFromDOM();
      }, 80);
    };

    ContentEditableInput.prototype.updateFromDOM = function () {
        var this$1 = this;

      if (this.cm.isReadOnly() || !this.pollContent())
        { runInOp(this.cm, function () { return regChange(this$1.cm); }); }
    };

    ContentEditableInput.prototype.setUneditable = function (node) {
      node.contentEditable = "false";
    };

    ContentEditableInput.prototype.onKeyPress = function (e) {
      if (e.charCode == 0 || this.composing) { return }
      e.preventDefault();
      if (!this.cm.isReadOnly())
        { operation(this.cm, applyTextInput)(this.cm, String.fromCharCode(e.charCode == null ? e.keyCode : e.charCode), 0); }
    };

    ContentEditableInput.prototype.readOnlyChanged = function (val) {
      this.div.contentEditable = String(val != "nocursor");
    };

    ContentEditableInput.prototype.onContextMenu = function () {};
    ContentEditableInput.prototype.resetPosition = function () {};

    ContentEditableInput.prototype.needsContentAttribute = true;

    function posToDOM(cm, pos) {
      var view = findViewForLine(cm, pos.line);
      if (!view || view.hidden) { return null }
      var line = getLine(cm.doc, pos.line);
      var info = mapFromLineView(view, line, pos.line);

      var order = getOrder(line, cm.doc.direction), side = "left";
      if (order) {
        var partPos = getBidiPartAt(order, pos.ch);
        side = partPos % 2 ? "right" : "left";
      }
      var result = nodeAndOffsetInLineMap(info.map, pos.ch, side);
      result.offset = result.collapse == "right" ? result.end : result.start;
      return result
    }

    function isInGutter(node) {
      for (var scan = node; scan; scan = scan.parentNode)
        { if (/CodeMirror-gutter-wrapper/.test(scan.className)) { return true } }
      return false
    }

    function badPos(pos, bad) { if (bad) { pos.bad = true; } return pos }

    function domTextBetween(cm, from, to, fromLine, toLine) {
      var text = "", closing = false, lineSep = cm.doc.lineSeparator(), extraLinebreak = false;
      function recognizeMarker(id) { return function (marker) { return marker.id == id; } }
      function close() {
        if (closing) {
          text += lineSep;
          if (extraLinebreak) { text += lineSep; }
          closing = extraLinebreak = false;
        }
      }
      function addText(str) {
        if (str) {
          close();
          text += str;
        }
      }
      function walk(node) {
        if (node.nodeType == 1) {
          var cmText = node.getAttribute("cm-text");
          if (cmText) {
            addText(cmText);
            return
          }
          var markerID = node.getAttribute("cm-marker"), range$$1;
          if (markerID) {
            var found = cm.findMarks(Pos(fromLine, 0), Pos(toLine + 1, 0), recognizeMarker(+markerID));
            if (found.length && (range$$1 = found[0].find(0)))
              { addText(getBetween(cm.doc, range$$1.from, range$$1.to).join(lineSep)); }
            return
          }
          if (node.getAttribute("contenteditable") == "false") { return }
          var isBlock = /^(pre|div|p|li|table|br)$/i.test(node.nodeName);
          if (!/^br$/i.test(node.nodeName) && node.textContent.length == 0) { return }

          if (isBlock) { close(); }
          for (var i = 0; i < node.childNodes.length; i++)
            { walk(node.childNodes[i]); }

          if (/^(pre|p)$/i.test(node.nodeName)) { extraLinebreak = true; }
          if (isBlock) { closing = true; }
        } else if (node.nodeType == 3) {
          addText(node.nodeValue.replace(/\u200b/g, "").replace(/\u00a0/g, " "));
        }
      }
      for (;;) {
        walk(from);
        if (from == to) { break }
        from = from.nextSibling;
        extraLinebreak = false;
      }
      return text
    }

    function domToPos(cm, node, offset) {
      var lineNode;
      if (node == cm.display.lineDiv) {
        lineNode = cm.display.lineDiv.childNodes[offset];
        if (!lineNode) { return badPos(cm.clipPos(Pos(cm.display.viewTo - 1)), true) }
        node = null; offset = 0;
      } else {
        for (lineNode = node;; lineNode = lineNode.parentNode) {
          if (!lineNode || lineNode == cm.display.lineDiv) { return null }
          if (lineNode.parentNode && lineNode.parentNode == cm.display.lineDiv) { break }
        }
      }
      for (var i = 0; i < cm.display.view.length; i++) {
        var lineView = cm.display.view[i];
        if (lineView.node == lineNode)
          { return locateNodeInLineView(lineView, node, offset) }
      }
    }

    function locateNodeInLineView(lineView, node, offset) {
      var wrapper = lineView.text.firstChild, bad = false;
      if (!node || !contains(wrapper, node)) { return badPos(Pos(lineNo(lineView.line), 0), true) }
      if (node == wrapper) {
        bad = true;
        node = wrapper.childNodes[offset];
        offset = 0;
        if (!node) {
          var line = lineView.rest ? lst(lineView.rest) : lineView.line;
          return badPos(Pos(lineNo(line), line.text.length), bad)
        }
      }

      var textNode = node.nodeType == 3 ? node : null, topNode = node;
      if (!textNode && node.childNodes.length == 1 && node.firstChild.nodeType == 3) {
        textNode = node.firstChild;
        if (offset) { offset = textNode.nodeValue.length; }
      }
      while (topNode.parentNode != wrapper) { topNode = topNode.parentNode; }
      var measure = lineView.measure, maps = measure.maps;

      function find(textNode, topNode, offset) {
        for (var i = -1; i < (maps ? maps.length : 0); i++) {
          var map$$1 = i < 0 ? measure.map : maps[i];
          for (var j = 0; j < map$$1.length; j += 3) {
            var curNode = map$$1[j + 2];
            if (curNode == textNode || curNode == topNode) {
              var line = lineNo(i < 0 ? lineView.line : lineView.rest[i]);
              var ch = map$$1[j] + offset;
              if (offset < 0 || curNode != textNode) { ch = map$$1[j + (offset ? 1 : 0)]; }
              return Pos(line, ch)
            }
          }
        }
      }
      var found = find(textNode, topNode, offset);
      if (found) { return badPos(found, bad) }

      // FIXME this is all really shaky. might handle the few cases it needs to handle, but likely to cause problems
      for (var after = topNode.nextSibling, dist = textNode ? textNode.nodeValue.length - offset : 0; after; after = after.nextSibling) {
        found = find(after, after.firstChild, 0);
        if (found)
          { return badPos(Pos(found.line, found.ch - dist), bad) }
        else
          { dist += after.textContent.length; }
      }
      for (var before = topNode.previousSibling, dist$1 = offset; before; before = before.previousSibling) {
        found = find(before, before.firstChild, -1);
        if (found)
          { return badPos(Pos(found.line, found.ch + dist$1), bad) }
        else
          { dist$1 += before.textContent.length; }
      }
    }

    // TEXTAREA INPUT STYLE

    var TextareaInput = function(cm) {
      this.cm = cm;
      // See input.poll and input.reset
      this.prevInput = "";

      // Flag that indicates whether we expect input to appear real soon
      // now (after some event like 'keypress' or 'input') and are
      // polling intensively.
      this.pollingFast = false;
      // Self-resetting timeout for the poller
      this.polling = new Delayed();
      // Used to work around IE issue with selection being forgotten when focus moves away from textarea
      this.hasSelection = false;
      this.composing = null;
    };

    TextareaInput.prototype.init = function (display) {
        var this$1 = this;

      var input = this, cm = this.cm;
      this.createField(display);
      var te = this.textarea;

      display.wrapper.insertBefore(this.wrapper, display.wrapper.firstChild);

      // Needed to hide big blue blinking cursor on Mobile Safari (doesn't seem to work in iOS 8 anymore)
      if (ios) { te.style.width = "0px"; }

      on(te, "input", function () {
        if (ie && ie_version >= 9 && this$1.hasSelection) { this$1.hasSelection = null; }
        input.poll();
      });

      on(te, "paste", function (e) {
        if (signalDOMEvent(cm, e) || handlePaste(e, cm)) { return }

        cm.state.pasteIncoming = true;
        input.fastPoll();
      });

      function prepareCopyCut(e) {
        if (signalDOMEvent(cm, e)) { return }
        if (cm.somethingSelected()) {
          setLastCopied({lineWise: false, text: cm.getSelections()});
        } else if (!cm.options.lineWiseCopyCut) {
          return
        } else {
          var ranges = copyableRanges(cm);
          setLastCopied({lineWise: true, text: ranges.text});
          if (e.type == "cut") {
            cm.setSelections(ranges.ranges, null, sel_dontScroll);
          } else {
            input.prevInput = "";
            te.value = ranges.text.join("\n");
            selectInput(te);
          }
        }
        if (e.type == "cut") { cm.state.cutIncoming = true; }
      }
      on(te, "cut", prepareCopyCut);
      on(te, "copy", prepareCopyCut);

      on(display.scroller, "paste", function (e) {
        if (eventInWidget(display, e) || signalDOMEvent(cm, e)) { return }
        cm.state.pasteIncoming = true;
        input.focus();
      });

      // Prevent normal selection in the editor (we handle our own)
      on(display.lineSpace, "selectstart", function (e) {
        if (!eventInWidget(display, e)) { e_preventDefault(e); }
      });

      on(te, "compositionstart", function () {
        var start = cm.getCursor("from");
        if (input.composing) { input.composing.range.clear(); }
        input.composing = {
          start: start,
          range: cm.markText(start, cm.getCursor("to"), {className: "CodeMirror-composing"})
        };
      });
      on(te, "compositionend", function () {
        if (input.composing) {
          input.poll();
          input.composing.range.clear();
          input.composing = null;
        }
      });
    };

    TextareaInput.prototype.createField = function (_display) {
      // Wraps and hides input textarea
      this.wrapper = hiddenTextarea();
      // The semihidden textarea that is focused when the editor is
      // focused, and receives input.
      this.textarea = this.wrapper.firstChild;
    };

    TextareaInput.prototype.prepareSelection = function () {
      // Redraw the selection and/or cursor
      var cm = this.cm, display = cm.display, doc = cm.doc;
      var result = prepareSelection(cm);

      // Move the hidden textarea near the cursor to prevent scrolling artifacts
      if (cm.options.moveInputWithCursor) {
        var headPos = cursorCoords(cm, doc.sel.primary().head, "div");
        var wrapOff = display.wrapper.getBoundingClientRect(), lineOff = display.lineDiv.getBoundingClientRect();
        result.teTop = Math.max(0, Math.min(display.wrapper.clientHeight - 10,
                                            headPos.top + lineOff.top - wrapOff.top));
        result.teLeft = Math.max(0, Math.min(display.wrapper.clientWidth - 10,
                                             headPos.left + lineOff.left - wrapOff.left));
      }

      return result
    };

    TextareaInput.prototype.showSelection = function (drawn) {
      var cm = this.cm, display = cm.display;
      removeChildrenAndAdd(display.cursorDiv, drawn.cursors);
      removeChildrenAndAdd(display.selectionDiv, drawn.selection);
      if (drawn.teTop != null) {
        this.wrapper.style.top = drawn.teTop + "px";
        this.wrapper.style.left = drawn.teLeft + "px";
      }
    };

    // Reset the input to correspond to the selection (or to be empty,
    // when not typing and nothing is selected)
    TextareaInput.prototype.reset = function (typing) {
      if (this.contextMenuPending || this.composing) { return }
      var cm = this.cm;
      if (cm.somethingSelected()) {
        this.prevInput = "";
        var content = cm.getSelection();
        this.textarea.value = content;
        if (cm.state.focused) { selectInput(this.textarea); }
        if (ie && ie_version >= 9) { this.hasSelection = content; }
      } else if (!typing) {
        this.prevInput = this.textarea.value = "";
        if (ie && ie_version >= 9) { this.hasSelection = null; }
      }
    };

    TextareaInput.prototype.getField = function () { return this.textarea };

    TextareaInput.prototype.supportsTouch = function () { return false };

    TextareaInput.prototype.focus = function () {
      if (this.cm.options.readOnly != "nocursor" && (!mobile || activeElt() != this.textarea)) {
        try { this.textarea.focus(); }
        catch (e) {} // IE8 will throw if the textarea is display: none or not in DOM
      }
    };

    TextareaInput.prototype.blur = function () { this.textarea.blur(); };

    TextareaInput.prototype.resetPosition = function () {
      this.wrapper.style.top = this.wrapper.style.left = 0;
    };

    TextareaInput.prototype.receivedFocus = function () { this.slowPoll(); };

    // Poll for input changes, using the normal rate of polling. This
    // runs as long as the editor is focused.
    TextareaInput.prototype.slowPoll = function () {
        var this$1 = this;

      if (this.pollingFast) { return }
      this.polling.set(this.cm.options.pollInterval, function () {
        this$1.poll();
        if (this$1.cm.state.focused) { this$1.slowPoll(); }
      });
    };

    // When an event has just come in that is likely to add or change
    // something in the input textarea, we poll faster, to ensure that
    // the change appears on the screen quickly.
    TextareaInput.prototype.fastPoll = function () {
      var missed = false, input = this;
      input.pollingFast = true;
      function p() {
        var changed = input.poll();
        if (!changed && !missed) {missed = true; input.polling.set(60, p);}
        else {input.pollingFast = false; input.slowPoll();}
      }
      input.polling.set(20, p);
    };

    // Read input from the textarea, and update the document to match.
    // When something is selected, it is present in the textarea, and
    // selected (unless it is huge, in which case a placeholder is
    // used). When nothing is selected, the cursor sits after previously
    // seen text (can be empty), which is stored in prevInput (we must
    // not reset the textarea when typing, because that breaks IME).
    TextareaInput.prototype.poll = function () {
        var this$1 = this;

      var cm = this.cm, input = this.textarea, prevInput = this.prevInput;
      // Since this is called a *lot*, try to bail out as cheaply as
      // possible when it is clear that nothing happened. hasSelection
      // will be the case when there is a lot of text in the textarea,
      // in which case reading its value would be expensive.
      if (this.contextMenuPending || !cm.state.focused ||
          (hasSelection(input) && !prevInput && !this.composing) ||
          cm.isReadOnly() || cm.options.disableInput || cm.state.keySeq)
        { return false }

      var text = input.value;
      // If nothing changed, bail.
      if (text == prevInput && !cm.somethingSelected()) { return false }
      // Work around nonsensical selection resetting in IE9/10, and
      // inexplicable appearance of private area unicode characters on
      // some key combos in Mac (#2689).
      if (ie && ie_version >= 9 && this.hasSelection === text ||
          mac && /[\uf700-\uf7ff]/.test(text)) {
        cm.display.input.reset();
        return false
      }

      if (cm.doc.sel == cm.display.selForContextMenu) {
        var first = text.charCodeAt(0);
        if (first == 0x200b && !prevInput) { prevInput = "\u200b"; }
        if (first == 0x21da) { this.reset(); return this.cm.execCommand("undo") }
      }
      // Find the part of the input that is actually new
      var same = 0, l = Math.min(prevInput.length, text.length);
      while (same < l && prevInput.charCodeAt(same) == text.charCodeAt(same)) { ++same; }

      runInOp(cm, function () {
        applyTextInput(cm, text.slice(same), prevInput.length - same,
                       null, this$1.composing ? "*compose" : null);

        // Don't leave long text in the textarea, since it makes further polling slow
        if (text.length > 1000 || text.indexOf("\n") > -1) { input.value = this$1.prevInput = ""; }
        else { this$1.prevInput = text; }

        if (this$1.composing) {
          this$1.composing.range.clear();
          this$1.composing.range = cm.markText(this$1.composing.start, cm.getCursor("to"),
                                             {className: "CodeMirror-composing"});
        }
      });
      return true
    };

    TextareaInput.prototype.ensurePolled = function () {
      if (this.pollingFast && this.poll()) { this.pollingFast = false; }
    };

    TextareaInput.prototype.onKeyPress = function () {
      if (ie && ie_version >= 9) { this.hasSelection = null; }
      this.fastPoll();
    };

    TextareaInput.prototype.onContextMenu = function (e) {
      var input = this, cm = input.cm, display = cm.display, te = input.textarea;
      if (input.contextMenuPending) { input.contextMenuPending(); }
      var pos = posFromMouse(cm, e), scrollPos = display.scroller.scrollTop;
      if (!pos || presto) { return } // Opera is difficult.

      // Reset the current text selection only if the click is done outside of the selection
      // and 'resetSelectionOnContextMenu' option is true.
      var reset = cm.options.resetSelectionOnContextMenu;
      if (reset && cm.doc.sel.contains(pos) == -1)
        { operation(cm, setSelection)(cm.doc, simpleSelection(pos), sel_dontScroll); }

      var oldCSS = te.style.cssText, oldWrapperCSS = input.wrapper.style.cssText;
      var wrapperBox = input.wrapper.offsetParent.getBoundingClientRect();
      input.wrapper.style.cssText = "position: static";
      te.style.cssText = "position: absolute; width: 30px; height: 30px;\n      top: " + (e.clientY - wrapperBox.top - 5) + "px; left: " + (e.clientX - wrapperBox.left - 5) + "px;\n      z-index: 1000; background: " + (ie ? "rgba(255, 255, 255, .05)" : "transparent") + ";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
      var oldScrollY;
      if (webkit) { oldScrollY = window.scrollY; } // Work around Chrome issue (#2712)
      display.input.focus();
      if (webkit) { window.scrollTo(null, oldScrollY); }
      display.input.reset();
      // Adds "Select all" to context menu in FF
      if (!cm.somethingSelected()) { te.value = input.prevInput = " "; }
      input.contextMenuPending = rehide;
      display.selForContextMenu = cm.doc.sel;
      clearTimeout(display.detectingSelectAll);

      // Select-all will be greyed out if there's nothing to select, so
      // this adds a zero-width space so that we can later check whether
      // it got selected.
      function prepareSelectAllHack() {
        if (te.selectionStart != null) {
          var selected = cm.somethingSelected();
          var extval = "\u200b" + (selected ? te.value : "");
          te.value = "\u21da"; // Used to catch context-menu undo
          te.value = extval;
          input.prevInput = selected ? "" : "\u200b";
          te.selectionStart = 1; te.selectionEnd = extval.length;
          // Re-set this, in case some other handler touched the
          // selection in the meantime.
          display.selForContextMenu = cm.doc.sel;
        }
      }
      function rehide() {
        if (input.contextMenuPending != rehide) { return }
        input.contextMenuPending = false;
        input.wrapper.style.cssText = oldWrapperCSS;
        te.style.cssText = oldCSS;
        if (ie && ie_version < 9) { display.scrollbars.setScrollTop(display.scroller.scrollTop = scrollPos); }

        // Try to detect the user choosing select-all
        if (te.selectionStart != null) {
          if (!ie || (ie && ie_version < 9)) { prepareSelectAllHack(); }
          var i = 0, poll = function () {
            if (display.selForContextMenu == cm.doc.sel && te.selectionStart == 0 &&
                te.selectionEnd > 0 && input.prevInput == "\u200b") {
              operation(cm, selectAll)(cm);
            } else if (i++ < 10) {
              display.detectingSelectAll = setTimeout(poll, 500);
            } else {
              display.selForContextMenu = null;
              display.input.reset();
            }
          };
          display.detectingSelectAll = setTimeout(poll, 200);
        }
      }

      if (ie && ie_version >= 9) { prepareSelectAllHack(); }
      if (captureRightClick) {
        e_stop(e);
        var mouseup = function () {
          off(window, "mouseup", mouseup);
          setTimeout(rehide, 20);
        };
        on(window, "mouseup", mouseup);
      } else {
        setTimeout(rehide, 50);
      }
    };

    TextareaInput.prototype.readOnlyChanged = function (val) {
      if (!val) { this.reset(); }
      this.textarea.disabled = val == "nocursor";
    };

    TextareaInput.prototype.setUneditable = function () {};

    TextareaInput.prototype.needsContentAttribute = false;

    function fromTextArea(textarea, options) {
      options = options ? copyObj(options) : {};
      options.value = textarea.value;
      if (!options.tabindex && textarea.tabIndex)
        { options.tabindex = textarea.tabIndex; }
      if (!options.placeholder && textarea.placeholder)
        { options.placeholder = textarea.placeholder; }
      // Set autofocus to true if this textarea is focused, or if it has
      // autofocus and no other element is focused.
      if (options.autofocus == null) {
        var hasFocus = activeElt();
        options.autofocus = hasFocus == textarea ||
          textarea.getAttribute("autofocus") != null && hasFocus == document.body;
      }

      function save() {textarea.value = cm.getValue();}

      var realSubmit;
      if (textarea.form) {
        on(textarea.form, "submit", save);
        // Deplorable hack to make the submit method do the right thing.
        if (!options.leaveSubmitMethodAlone) {
          var form = textarea.form;
          realSubmit = form.submit;
          try {
            var wrappedSubmit = form.submit = function () {
              save();
              form.submit = realSubmit;
              form.submit();
              form.submit = wrappedSubmit;
            };
          } catch(e) {}
        }
      }

      options.finishInit = function (cm) {
        cm.save = save;
        cm.getTextArea = function () { return textarea; };
        cm.toTextArea = function () {
          cm.toTextArea = isNaN; // Prevent this from being ran twice
          save();
          textarea.parentNode.removeChild(cm.getWrapperElement());
          textarea.style.display = "";
          if (textarea.form) {
            off(textarea.form, "submit", save);
            if (typeof textarea.form.submit == "function")
              { textarea.form.submit = realSubmit; }
          }
        };
      };

      textarea.style.display = "none";
      var cm = CodeMirror(function (node) { return textarea.parentNode.insertBefore(node, textarea.nextSibling); },
        options);
      return cm
    }

    function addLegacyProps(CodeMirror) {
      CodeMirror.off = off;
      CodeMirror.on = on;
      CodeMirror.wheelEventPixels = wheelEventPixels;
      CodeMirror.Doc = Doc;
      CodeMirror.splitLines = splitLinesAuto;
      CodeMirror.countColumn = countColumn;
      CodeMirror.findColumn = findColumn;
      CodeMirror.isWordChar = isWordCharBasic;
      CodeMirror.Pass = Pass;
      CodeMirror.signal = signal;
      CodeMirror.Line = Line;
      CodeMirror.changeEnd = changeEnd;
      CodeMirror.scrollbarModel = scrollbarModel;
      CodeMirror.Pos = Pos;
      CodeMirror.cmpPos = cmp;
      CodeMirror.modes = modes;
      CodeMirror.mimeModes = mimeModes;
      CodeMirror.resolveMode = resolveMode;
      CodeMirror.getMode = getMode;
      CodeMirror.modeExtensions = modeExtensions;
      CodeMirror.extendMode = extendMode;
      CodeMirror.copyState = copyState;
      CodeMirror.startState = startState;
      CodeMirror.innerMode = innerMode;
      CodeMirror.commands = commands;
      CodeMirror.keyMap = keyMap;
      CodeMirror.keyName = keyName;
      CodeMirror.isModifierKey = isModifierKey;
      CodeMirror.lookupKey = lookupKey;
      CodeMirror.normalizeKeyMap = normalizeKeyMap;
      CodeMirror.StringStream = StringStream;
      CodeMirror.SharedTextMarker = SharedTextMarker;
      CodeMirror.TextMarker = TextMarker;
      CodeMirror.LineWidget = LineWidget;
      CodeMirror.e_preventDefault = e_preventDefault;
      CodeMirror.e_stopPropagation = e_stopPropagation;
      CodeMirror.e_stop = e_stop;
      CodeMirror.addClass = addClass;
      CodeMirror.contains = contains;
      CodeMirror.rmClass = rmClass;
      CodeMirror.keyNames = keyNames;
    }

    // EDITOR CONSTRUCTOR

    defineOptions(CodeMirror);

    addEditorMethods(CodeMirror);

    // Set up methods on CodeMirror's prototype to redirect to the editor's document.
    var dontDelegate = "iter insert remove copy getEditor constructor".split(" ");
    for (var prop in Doc.prototype) { if (Doc.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0)
      { CodeMirror.prototype[prop] = (function(method) {
        return function() {return method.apply(this.doc, arguments)}
      })(Doc.prototype[prop]); } }

    eventMixin(Doc);
    CodeMirror.inputStyles = {"textarea": TextareaInput, "contenteditable": ContentEditableInput};

    // Extra arguments are stored as the mode's dependencies, which is
    // used by (legacy) mechanisms like loadmode.js to automatically
    // load a mode. (Preferred mechanism is the require/define calls.)
    CodeMirror.defineMode = function(name/*, mode, …*/) {
      if (!CodeMirror.defaults.mode && name != "null") { CodeMirror.defaults.mode = name; }
      defineMode.apply(this, arguments);
    };

    CodeMirror.defineMIME = defineMIME;

    // Minimal default mode.
    CodeMirror.defineMode("null", function () { return ({token: function (stream) { return stream.skipToEnd(); }}); });
    CodeMirror.defineMIME("text/plain", "null");

    // EXTENSIONS

    CodeMirror.defineExtension = function (name, func) {
      CodeMirror.prototype[name] = func;
    };
    CodeMirror.defineDocExtension = function (name, func) {
      Doc.prototype[name] = func;
    };

    CodeMirror.fromTextArea = fromTextArea;

    addLegacyProps(CodeMirror);

    CodeMirror.version = "5.42.2";

    return CodeMirror;

  })));
  });

  codemirror.commands.tabAndIndentMarkdownList = function (cm) {
    var ranges = cm.listSelections();
    var pos = ranges[0].head;
    var eolState = cm.getStateAfter(pos.line);
    var inList = eolState.list !== false;

    if (inList) {
      cm.execCommand("indentMore");
      return;
    }

    if (cm.options.indentWithTabs) {
      cm.execCommand("insertTab");
    } else {
      var spaces = Array(cm.options.tabSize + 1).join(" ");
      cm.replaceSelection(spaces);
    }
  };

  codemirror.commands.shiftTabAndUnindentMarkdownList = function (cm) {
    var ranges = cm.listSelections();
    var pos = ranges[0].head;
    var eolState = cm.getStateAfter(pos.line);
    var inList = eolState.list !== false;

    if (inList) {
      cm.execCommand("indentLess");
      return;
    }

    if (cm.options.indentWithTabs) {
      cm.execCommand("insertTab");
    } else {
      var spaces = Array(cm.options.tabSize + 1).join(" ");
      cm.replaceSelection(spaces);
    }
  };

  var overlay = createCommonjsModule(function (module, exports) {
  // CodeMirror, copyright (c) by Marijn Haverbeke and others
  // Distributed under an MIT license: https://codemirror.net/LICENSE

  // Utility function that allows modes to be combined. The mode given
  // as the base argument takes care of most of the normal mode
  // functionality, but a second (typically simple) mode is used, which
  // can override the style of text. Both modes get to parse all of the
  // text, but when both assign a non-null style to a piece of code, the
  // overlay wins, unless the combine argument was true and not overridden,
  // or state.overlay.combineTokens was true, in which case the styles are
  // combined.

  (function(mod) {
    mod(codemirror);
  })(function(CodeMirror) {

  CodeMirror.overlayMode = function(base, overlay, combine) {
    return {
      startState: function() {
        return {
          base: CodeMirror.startState(base),
          overlay: CodeMirror.startState(overlay),
          basePos: 0, baseCur: null,
          overlayPos: 0, overlayCur: null,
          streamSeen: null
        };
      },
      copyState: function(state) {
        return {
          base: CodeMirror.copyState(base, state.base),
          overlay: CodeMirror.copyState(overlay, state.overlay),
          basePos: state.basePos, baseCur: null,
          overlayPos: state.overlayPos, overlayCur: null
        };
      },

      token: function(stream, state) {
        if (stream != state.streamSeen ||
            Math.min(state.basePos, state.overlayPos) < stream.start) {
          state.streamSeen = stream;
          state.basePos = state.overlayPos = stream.start;
        }

        if (stream.start == state.basePos) {
          state.baseCur = base.token(stream, state.base);
          state.basePos = stream.pos;
        }
        if (stream.start == state.overlayPos) {
          stream.pos = stream.start;
          state.overlayCur = overlay.token(stream, state.overlay);
          state.overlayPos = stream.pos;
        }
        stream.pos = Math.min(state.basePos, state.overlayPos);

        // state.overlay.combineTokens always takes precedence over combine,
        // unless set to null
        if (state.overlayCur == null) return state.baseCur;
        else if (state.baseCur != null &&
                 state.overlay.combineTokens ||
                 combine && state.overlay.combineTokens == null)
          return state.baseCur + " " + state.overlayCur;
        else return state.overlayCur;
      },

      indent: base.indent && function(state, textAfter) {
        return base.indent(state.base, textAfter);
      },
      electricChars: base.electricChars,

      innerMode: function(state) { return {state: state.base, mode: base}; },

      blankLine: function(state) {
        var baseToken, overlayToken;
        if (base.blankLine) baseToken = base.blankLine(state.base);
        if (overlay.blankLine) overlayToken = overlay.blankLine(state.overlay);

        return overlayToken == null ?
          baseToken :
          (combine && baseToken != null ? baseToken + " " + overlayToken : overlayToken);
      }
    };
  };

  });
  });

  /**
   * extand codemirror markdown mode for future.
   */

  function getType(state) {
    if (state.math) return "math";
    if (state.emoji) return "emoji";
    return null;
  }

  function startState() {
    return {
      math: 0
    };
  }

  function copyState(s) {
    return {
      math: s.math
    };
  }

  function token(stream, state) {
    var ch = stream.next();

    if (ch === "$") {
      stream.eatWhile('$');
      var count = stream.current().length;

      if (state.math === 0) {
        state.math = count;
        return getType(state);
      } else if (count === state.math) {
        // close math
        var t = getType(state);
        state.math = 0;
        return t;
      }
    }

    if (ch === ":" && stream.match(/^[^: \\/?'"]+:/)) {
      return "emoji";
    }

    return getType(state);
  }

  codemirror.defineMode("smartmd", function (config) {
    return codemirror.overlayMode(codemirror.getMode(config, "markdown"), {
      startState: startState,
      token: token,
      copyState: copyState
    });
  });

  var shortcuts = {
    toggleBold: "Ctrl-B",
    toggleItalic: "Ctrl-I",
    drawLink: "Ctrl-K",
    toggleHeadingSmaller: "Ctrl-H",
    toggleHeadingBigger: "Shift-Ctrl-H",
    cleanBlock: "Ctrl-E",
    drawMath: "Ctrl-M",
    drawImage: "Ctrl-P",
    toggleBlockquote: "Ctrl-'",
    toggleOrderedList: "Ctrl-Alt-L",
    toggleUnorderedList: "Ctrl-L",
    toggleCodeBlock: "Ctrl-Alt-C",
    togglePreview: "F9",
    toggleRender: "Ctrl-P",
    toggleFullScreen: "F11",
    drawChart: "Ctrl-Alt-M",
    autoSaveUpdate: "Ctrl-S"
  };

  function getState (cm, pos) {
    pos = pos || cm.getCursor("start");
    var stat = cm.getTokenAt(pos);
    if (!stat.type) return {};
    var types = stat.type.split(" ");
    var ret = {},
        data,
        text;

    for (var i = 0; i < types.length; i++) {
      data = types[i];

      switch (data) {
        case "strong":
          ret.bold = true;
          break;

        case "variable-2":
          text = cm.getLine(pos.line);

          if (/^\s*\d+\.\s/.test(text)) {
            ret["ordered-list"] = true;
          } else {
            ret["unordered-list"] = true;
          }

          break;

        case "atom":
          ret.quote = true;
          break;

        case "em":
          ret.italic = true;
          break;

        case "quote":
          ret.quote = true;
          break;

        case "strikethrough":
          ret.strikethrough = true;
          break;

        case "comment":
          ret.code = true;
          break;

        case "link":
          ret.link = true;
          break;

        case "tag":
          ret.image = true;
          break;

        default:
          if (data.match(/^header(-[1-6])?$/)) {
            ret[data.replace("header", "heading")] = true;
          }

      }
    }

    return ret;
  }

  function replaceSelection (cm, active, startEnd, content) {
    var text;
    var start = startEnd[0];
    var end = startEnd[1];
    var startPoint = cm.getCursor("start");
    var endPoint = cm.getCursor("end");
    if (content) end = end.replace("#text#", content);

    if (active) {
      text = cm.getLine(startPoint.line);
      start = text.slice(0, startPoint.ch);
      end = text.slice(startPoint.ch);
      cm.replaceRange(start + end, {
        line: startPoint.line,
        ch: 0
      });
    } else {
      text = cm.getSelection();
      cm.replaceSelection(start + text + end);
      startPoint.ch += start.length;

      if (startPoint !== endPoint) {
        endPoint.ch += start.length;
      }
    }

    cm.setSelection(startPoint, endPoint);
    cm.focus();
  }

  function fencing_line(line) {
    return line.styles && line.styles[2] && line.styles[2].indexOf("formatting-code-block") !== -1;
  }

  function token_state(token) {
    return token.state;
  }

  function code_type(cm, line_num, line, firstTok, lastTok) {
    line = line || cm.getLineHandle(line_num);
    firstTok = firstTok || cm.getTokenAt({
      line: line_num,
      ch: 1
    });
    lastTok = lastTok || line.text && cm.getTokenAt({
      line: line_num,
      ch: line.text.length - 1
    });
    var types = firstTok.type ? firstTok.type.split(" ") : [];

    if (lastTok && token_state(lastTok).indentedCode) {
      // have to check last char, since first chars of first line aren"t marked as indented
      return "indented";
    } else if (types.indexOf("comment") === -1) {
      // has to be after "indented" check, since first chars of first indented line aren"t marked as such
      return false;
    } else if (token_state(firstTok).fencedChars || token_state(lastTok).fencedChars || fencing_line(line)) {
      return "fenced";
    }

    return "single";
  }

  function insertFencingAtSelection(cm, cur_start, cur_end, fenceCharsToInsert) {
    var start_line_sel = cur_start.line + 1,
        end_line_sel = cur_end.line + 1,
        sel_multi = cur_start.line !== cur_end.line,
        repl_start = fenceCharsToInsert + "\n",
        repl_end = "\n" + fenceCharsToInsert;

    if (sel_multi) {
      end_line_sel++;
    } // handle last char including \n or not


    if (sel_multi && cur_end.ch === 0) {
      repl_end = fenceCharsToInsert + "\n";
      end_line_sel--;
    }

    replaceSelection(cm, false, [repl_start, repl_end]);
    cm.setSelection({
      line: start_line_sel,
      ch: 0
    }, {
      line: end_line_sel,
      ch: 0
    });
  }

  function toggleCodeBlock () {
    var fenceCharsToInsert = this.options.blockStyles.code;
    var cm = this.codemirror,
        cur_start = cm.getCursor("start"),
        cur_end = cm.getCursor("end"),
        tok = cm.getTokenAt({
      line: cur_start.line,
      ch: cur_start.ch || 1
    }),
        // avoid ch 0 which is a cursor pos but not token
    line = cm.getLineHandle(cur_start.line),
        is_code = code_type(cm, cur_start.line, line, tok);
    var block_start, block_end, lineCount;

    if (is_code === "single") {
      var start = line.text.slice(0, cur_start.ch).replace("`", "");
      var end = line.text.slice(cur_start.ch).replace("`", "");
      cm.replaceRange(start + end, {
        line: cur_start.line,
        ch: 0
      }, {
        line: cur_start.line,
        ch: 99999999999999
      });
      cur_start.ch--;

      if (cur_start !== cur_end) {
        cur_end.ch--;
      }

      cm.setSelection(cur_start, cur_end);
      cm.focus();
    } else if (is_code === "fenced") {
      if (cur_start.line !== cur_end.line || cur_start.ch !== cur_end.ch) {
        // use selection
        // find the fenced line so we know what type it is (tilde, backticks, number of them)
        for (block_start = cur_start.line; block_start >= 0; block_start--) {
          line = cm.getLineHandle(block_start);

          if (fencing_line(line)) {
            break;
          }
        }

        var fencedTok = cm.getTokenAt({
          line: block_start,
          ch: 1
        });
        var fence_chars = token_state(fencedTok).fencedChars;
        var start_text, start_line;
        var end_text, end_line; // check for selection going up against fenced lines, in which case we don't want to add more fencing

        if (fencing_line(cm.getLineHandle(cur_start.line))) {
          start_text = "";
          start_line = cur_start.line;
        } else if (fencing_line(cm.getLineHandle(cur_start.line - 1))) {
          start_text = "";
          start_line = cur_start.line - 1;
        } else {
          start_text = fence_chars + "\n";
          start_line = cur_start.line;
        }

        if (fencing_line(cm.getLineHandle(cur_end.line))) {
          end_text = "";
          end_line = cur_end.line;

          if (cur_end.ch === 0) {
            end_line += 1;
          }
        } else if (cur_end.ch !== 0 && fencing_line(cm.getLineHandle(cur_end.line + 1))) {
          end_text = "";
          end_line = cur_end.line + 1;
        } else {
          end_text = fence_chars + "\n";
          end_line = cur_end.line + 1;
        }

        if (cur_end.ch === 0) {
          // full last line selected, putting cursor at beginning of next
          end_line -= 1;
        }

        cm.operation(function () {
          // end line first, so that line numbers don't change
          cm.replaceRange(end_text, {
            line: end_line,
            ch: 0
          }, {
            line: end_line + (end_text ? 0 : 1),
            ch: 0
          });
          cm.replaceRange(start_text, {
            line: start_line,
            ch: 0
          }, {
            line: start_line + (start_text ? 0 : 1),
            ch: 0
          });
        });
        cm.setSelection({
          line: start_line + (start_text ? 1 : 0),
          ch: 0
        }, {
          line: end_line + (start_text ? 1 : -1),
          ch: 0
        });
        cm.focus();
      } else {
        // no selection, search for ends of this fenced block
        var search_from = cur_start.line;

        if (fencing_line(cm.getLineHandle(cur_start.line))) {
          // gets a little tricky if cursor is right on a fenced line
          if (code_type(cm, cur_start.line + 1) === "fenced") {
            block_start = cur_start.line;
            search_from = cur_start.line + 1; // for searching for "end"
          } else {
            block_end = cur_start.line;
            search_from = cur_start.line - 1; // for searching for "start"
          }
        }

        if (!block_start) {
          for (block_start = search_from; block_start >= 0; block_start--) {
            line = cm.getLineHandle(block_start);

            if (fencing_line(line)) {
              break;
            }
          }
        }

        if (!block_end) {
          lineCount = cm.lineCount();

          for (block_end = search_from; block_end < lineCount; block_end++) {
            line = cm.getLineHandle(block_end);

            if (fencing_line(line)) {
              break;
            }
          }
        }

        cm.operation(function () {
          cm.replaceRange("", {
            line: block_start,
            ch: 0
          }, {
            line: block_start + 1,
            ch: 0
          });
          cm.replaceRange("", {
            line: block_end - 1,
            ch: 0
          }, {
            line: block_end,
            ch: 0
          });
        });
        cm.focus();
      }
    } else if (is_code === "indented") {
      if (cur_start.line !== cur_end.line || cur_start.ch !== cur_end.ch) {
        // use selection
        block_start = cur_start.line;
        block_end = cur_end.line;

        if (cur_end.ch === 0) {
          block_end--;
        }
      } else {
        // no selection, search for ends of this indented block
        for (block_start = cur_start.line; block_start >= 0; block_start--) {
          line = cm.getLineHandle(block_start);

          if (!line.text.match(/^\s*$/) && code_type(cm, block_start, line) !== "indented") {
            block_start += 1;
            break;
          }
        }

        lineCount = cm.lineCount();

        for (block_end = cur_start.line; block_end < lineCount; block_end++) {
          line = cm.getLineHandle(block_end);

          if (!line.text.match(/^\s*$/) && code_type(cm, block_end, line) !== "indented") {
            block_end -= 1;
            break;
          }
        }
      } // if we are going to un-indent based on a selected set of lines, and the next line is indented too, we need to
      // insert a blank line so that the next line(s) continue to be indented code


      var next_line = cm.getLineHandle(block_end + 1),
          next_line_last_tok = next_line && cm.getTokenAt({
        line: block_end + 1,
        ch: next_line.text.length - 1
      }),
          next_line_indented = next_line_last_tok && token_state(next_line_last_tok).indentedCode;

      if (next_line_indented) {
        cm.replaceRange("\n", {
          line: block_end + 1,
          ch: 0
        });
      }

      for (var i = block_start; i <= block_end; i++) {
        cm.indentLine(i, "subtract");
      }

      cm.focus();
    } else {
      // insert code formatting
      var no_sel_and_starting_of_line = cur_start.line === cur_end.line && cur_start.ch === cur_end.ch && cur_start.ch === 0;
      var sel_multi = cur_start.line !== cur_end.line;

      if (no_sel_and_starting_of_line || sel_multi) {
        insertFencingAtSelection(cm, cur_start, cur_end, fenceCharsToInsert);
      } else {
        replaceSelection(cm, false, ["`", "`"]);
      }
    }
  }

  function toggleBlock (editor, type, start_chars, end_chars) {
    var cm = editor.codemirror;
    var stat = getState(cm);
    var text;
    var start = start_chars;
    var end = typeof end_chars === "undefined" ? start_chars : end_chars;
    var startPoint = cm.getCursor("start");
    var endPoint = cm.getCursor("end");

    if (stat[type]) {
      text = cm.getLine(startPoint.line);
      start = text.slice(0, startPoint.ch);
      end = text.slice(startPoint.ch);

      switch (type) {
        case "bold":
          start = start.replace(/(\*\*|__)(?![\s\S]*(\*\*|__))/, "");
          end = end.replace(/(\*\*|__)/, "");
          break;

        case "italic":
          start = start.replace(/(\*|_)(?![\s\S]*(\*|_))/, "");
          end = end.replace(/(\*|_)/, "");
          break;

        case "strikethrough":
          start = start.replace(/(\*\*|~~)(?![\s\S]*(\*\*|~~))/, "");
          end = end.replace(/(\*\*|~~)/, "");
          break;

        default:
          break;
      }

      cm.replaceRange(start + end, {
        line: startPoint.line,
        ch: 0
      }, {
        line: startPoint.line,
        ch: 99999999999999
      }); // two code

      if (type === "bold" || type === "strikethrough") {
        startPoint.ch -= 2;

        if (startPoint !== endPoint) {
          endPoint.ch -= 2;
        }
      } else if (type === "italic") {
        startPoint.ch -= 1;

        if (startPoint !== endPoint) {
          endPoint.ch -= 1;
        }
      }
    } else {
      text = cm.getSelection();

      switch (type) {
        case "bold":
          text = text.split("**").join("");
          text = text.split("__").join("");
          break;

        case "italic":
          text = text.split("*").join("");
          text = text.split("_").join("");
          break;

        case "strikethrough":
          text = text.split("~~").join("");
          break;

        default:
          break;
      }

      cm.replaceSelection(start + text + end);
      startPoint.ch += start_chars.length;
      endPoint.ch = startPoint.ch + text.length;
    }

    cm.setSelection(startPoint, endPoint);
    cm.focus();
  }

  function toggleHeading (cm, direction, size) {
    var startPoint = cm.getCursor("start");
    var endPoint = cm.getCursor("end");

    for (var i = startPoint.line; i <= endPoint.line; i++) {
      var text = cm.getLine(i); // count how much # isset

      var currHeadingLevel = text.search(/[^#]/);

      if (direction === "bigger") {
        // less than 0 start over from 5
        switch (currHeadingLevel) {
          case 0:
            text = "###### " + text;
            break;

          case 1:
            text = text.substr(2);
            break;

          default:
            text = text.substr(1);
        }
      } else if (direction === "smaller") {
        // over 5 start over from 0
        switch (currHeadingLevel) {
          case 0:
            text = "# " + text;
            break;

          case 6:
            text = text.substr(7);
            break;

          default:
            text = "#" + text;
        }
      } else {
        // has direction
        switch (currHeadingLevel) {
          case 0:
            text = "".concat("#".repeat(size), " ").concat(text);
            break;

          case size:
            text = text.substr(currHeadingLevel + 1);
            break;

          default:
            text = "".concat("#".repeat(size), " ").concat(text.substr(currHeadingLevel + 1));
        }
      }

      cm.replaceRange(text, {
        line: i,
        ch: 0
      }, {
        line: i,
        ch: 99999999999999
      });
    }

    cm.focus();
  }

  function cleanBlock () {
    var cm = this.codemirror;
    var startPoint = cm.getCursor("start");
    var endPoint = cm.getCursor("end");
    var text;

    for (var line = startPoint.line; line <= endPoint.line; line++) {
      text = cm.getLine(line);
      text = text.replace(/^[ ]*([# ]+|\*|-|[> ]+|[0-9]+(.|\)))[ ]*/, "");
      cm.replaceRange(text, {
        line: line,
        ch: 0
      }, {
        line: line,
        ch: 99999999999999
      });
    }
  }

  function assign(target, source) {
    Object.keys(source).forEach(function (name) {
      var item = source[name];

      if (_typeof(item) === "object") {
        if (target.hasOwnProperty(name)) {
          target[name] = assign(target[name], item);
        } else {
          target[name] = item;
        }
      } else {
        target[name] = item;
      }
    });
    return target;
  }
  function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
      target = assign(target, arguments[i]);
    }

    return target;
  }
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var platform = navigator.platform;
  var classList = "classList" in document.documentElement;
  var isIos = /AppleWebKit/.test(userAgent) && /Mobile\/\w+/.test(userAgent);
  var isMac = isIos || /Mac/.test(platform); // This is woefully incomplete, will replace by web api in the future

  var isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(userAgent.substr(0, 4));
  function inArray(search, arr) {
    if (arr && arr.length) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === search) {
          return true;
        }
      }
    }

    return false;
  }
  function fixShortCuts(key) {
    key = isMac ? key.replace("Ctrl", "Cmd") : key.replace("Cmd", "Ctrl");
    return key;
  }
  function addClass(el, name) {
    el.className += " ".concat(name);
  }
  function removeClass(el, name) {
    if (classList) {
      el.classList.remove(name);
    } else {
      // all class render again
      var reg = new RegExp("\\s*".concat(name, "\\s*"), "g");
      el.className = el.className.replace(reg, "");
    }
  }
  function getClass(el, name) {
    var reg = new RegExp(name);
    return reg.test(el.className);
  }
  function toggleClass(el, name) {
    if (getClass(el, name)) {
      removeClass(el, name);
    } else {
      addClass(el, name);
    }
  }
  function fixShortcut(shortCuts) {
    if (isMac) {
      shortCuts = shortCuts.replace("Ctrl", "⌘").replace("Alt", "⌥");
    }

    return shortCuts;
  }
  function isUrl(url) {
    return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url);
  }
  function getToken() {
    var meta = document.getElementsByTagName("meta");

    for (var i = 0; i < meta.length; i++) {
      if (meta[i].name === "csrf-token") {
        return meta[i].content;
      }
    }

    return false;
  }
  function isLocalStorage() {
    if ((typeof localStorage === "undefined" ? "undefined" : _typeof(localStorage)) === "object") {
      try {
        localStorage.setItem("smartmd_test", 1);
        localStorage.removeItem("smartmd_test");
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }

    return true;
  }
  function def(obj, key, val, enumerable) {
    Reflect.defineProperty(obj, key, {
      value: val,
      enumerable: Boolean(enumerable),
      writable: true,
      configurable: true
    });
  }
  function isObject(obj) {
    return obj !== null && _typeof(obj) === 'object';
  }
  function remove(arr, item) {
    if (arr.length) {
      var index = arr.indexOf(item);

      if (index > -1) {
        return arr.splice(index, 1);
      }
    }

    return false;
  }

  var utils = /*#__PURE__*/Object.freeze({
    assign: assign,
    extend: extend,
    isIos: isIos,
    isMac: isMac,
    isMobile: isMobile,
    inArray: inArray,
    fixShortCuts: fixShortCuts,
    addClass: addClass,
    removeClass: removeClass,
    getClass: getClass,
    toggleClass: toggleClass,
    fixShortcut: fixShortcut,
    isUrl: isUrl,
    getToken: getToken,
    isLocalStorage: isLocalStorage,
    def: def,
    isObject: isObject,
    remove: remove
  });

  var isFullScreen = false;
  function toggleFullScreen () {
    var cm = this.codemirror;
    var toolbar = this.gui.toolbar;
    var preview = this.gui.preview;
    cm.setOption("fullScreen", !cm.getOption("fullScreen"));
    toggleClass(document.body, "body-hidden");

    if (toolbar) {
      var button = this.gui.toolbarElements.fullscreen;
      toggleClass(toolbar, "smartmd__toolbar--full");
      if (button) toggleClass(button, "active");
    }

    if (isFullScreen) {
      removeClass(preview, "smartmd__preview--full");
      isFullScreen = false;
    } else {
      addClass(preview, "smartmd__preview--full");
      isFullScreen = true;
    }
  }

  var isPreviewActive = false;

  function startPreview() {
    var cm = this.codemirror;
    var cmElement = cm.getWrapperElement();
    var preview = this.gui.preview;
    var previewContent = this.gui.previewContent;
    addClass(preview, "smartmd__preview--active");
    addClass(cmElement, "CodeMirror-sided");
    previewContent.innerHTML = this.markdown.render(this.value());
    cm.on('update', cm.renderPreviewFn);
  }

  function removePreview() {
    var cm = this.codemirror;
    var cmElement = cm.getWrapperElement();
    var preview = this.gui.preview;
    removeClass(preview, "smartmd__preview--active");
    removeClass(cmElement, "CodeMirror-sided");
    cm.off('update', cm.renderPreviewFn);
  }

  function togglePreview() {
    var _this = this;

    var toolbar = this.gui.toolbar;
    var cm = this.codemirror;
    var preview = this.gui.preview;
    var previewScrollbar = this.gui.previewScrollbar;
    var previewContent = this.gui.previewContent;
    var icon = false;
    var cmScroll = false;
    var pScroll = false;
    var originScroll = false;
    cm.on("scroll", function (v) {
      if (cmScroll) {
        cmScroll = false;
        return;
      }

      pScroll = true;
      originScroll = true;
      var height = v.getScrollInfo().height - v.getScrollInfo().clientHeight;
      var ratio = parseFloat(v.getScrollInfo().top) / height;
      var top = (previewScrollbar.scrollHeight - previewScrollbar.clientHeight) * ratio;
      previewScrollbar.scrollTop = top;
      previewContent.scrollTop = top;
    });

    previewScrollbar.onscroll = function () {
      if (pScroll) {
        pScroll = false;
        return;
      }

      cmScroll = true;
      originScroll = true;
      var height = this.scrollHeight - this.clientHeight;
      var ratio = parseFloat(this.scrollTop) / height;
      var move = (cm.getScrollInfo().height - cm.getScrollInfo().clientHeight) * ratio;
      previewContent.scrollTop = this.scrollTop;
      cm.scrollTo(0, move);
    };

    previewContent.onscroll = function () {
      if (originScroll) {
        originScroll = false;
        return;
      }

      pScroll = true;
      cmScroll = true;
      var height = this.scrollHeight - this.clientHeight;
      var ratio = parseFloat(this.scrollTop) / height;
      var move = (cm.getScrollInfo().height - cm.getScrollInfo().clientHeight) * ratio;
      previewScrollbar.scrollTop = this.scrollTop;
      cm.scrollTo(0, move);
    };

    if (!cm.renderPreviewFn) {
      cm.renderPreviewFn = function () {
        var scrollHeight = 0;

        if (previewContent.scrollHeight > previewContent.clientHeight) {
          scrollHeight = previewContent.scrollHeight;
        }

        previewScrollbar.firstElementChild.style.height = "".concat(previewContent.clientHeight + scrollHeight, "px");
        previewContent.innerHTML = _this.markdown.render(_this.value());
      };
    }

    if (toolbar) icon = this.gui.toolbarElements.preview;

    if (isPreviewActive) {
      removePreview.apply(this);
      if (icon) removeClass(icon, "active");
      isPreviewActive = false;
    } else {
      startPreview.apply(this);
      if (icon) addClass(icon, "active");
      isPreviewActive = true;
    }

    if (isFullScreen) {
      addClass(preview, "smartmd__preview--full");
    } else {
      removeClass(preview, "smartmd__preview--full");
    }

    cm.refresh();
  }

  var isRenderActive = false;
  function toggleRender () {
    var _this = this;

    var toolbar = this.gui.toolbar;
    var render = this.gui.render;

    if (isRenderActive) {
      removeClass(render, "smartmd__render--active");
      setTimeout(function () {
        render.style.display = "none";
        isRenderActive = false;
        if (!toolbar) return;
        var button = _this.gui.toolbarElements.render; // toggleRender button maybe hidden

        if (button) removeClass(button, "active");
        removeClass(toolbar, "smartmd__toolbar--disabled");
      }, 150);
    } else {
      var renderBody = this.gui.renderBody;

      if (toolbar) {
        var button = this.gui.toolbarElements.render;
        if (button) addClass(button, "active");
        addClass(toolbar, "smartmd__toolbar--disabled");
      }

      renderBody.innerHTML = this.markdown.render(this.value());
      render.style.display = "block";
      isRenderActive = true; // set renderBody enter animation

      setTimeout(function () {
        addClass(render, "smartmd__render--active");
      }, 0);
    }
  }

  function toggleLine (cm, name) {
    var stat = getState(cm);
    var startPoint = cm.getCursor("start");
    var endPoint = cm.getCursor("end");
    var repl = {
      "quote": /^(\s*)>\s+/,
      "unordered-list": /^(\s*)(\*|-|\+)\s+/,
      "ordered-list": /^(\s*)\d+\.\s+/
    };
    var map = {
      "quote": "> ",
      "unordered-list": "* ",
      "ordered-list": "1. "
    };

    for (var i = startPoint.line; i <= endPoint.line; i++) {
      var text = cm.getLine(i);

      if (stat[name]) {
        text = text.replace(repl[name], "$1");
      } else {
        text = map[name] + text;
      }

      cm.replaceRange(text, {
        line: i,
        ch: 0
      }, {
        line: i,
        ch: 99999999999999
      });
    }

    cm.focus();
  }

  function toggleBold() {
    toggleBlock(this, "bold", this.options.blockStyles.bold);
  }

  function toggleItalic() {
    toggleBlock(this, "italic", this.options.blockStyles.italic);
  }

  function toggleStrikethrough() {
    toggleBlock(this, "strikethrough", this.options.blockStyles.strikethrough);
  }

  function toggleBlockquote() {
    toggleLine(this.codemirror, "quote");
  }

  function toggleHeadingSmaller() {
    toggleHeading(this.codemirror, "smaller");
  }

  function toggleHeadingBigger() {
    toggleHeading(this.codemirror, "bigger");
  }

  function toggleHeading1() {
    toggleHeading(this.codemirror, false, 1);
  }

  function toggleHeading2() {
    toggleHeading(this.codemirror, false, 2);
  }

  function toggleHeading3() {
    toggleHeading(this.codemirror, false, 3);
  }

  function toggleUnorderedList() {
    toggleLine(this.codemirror, "unordered-list");
  }

  function toggleOrderedList() {
    toggleLine(this.codemirror, "ordered-list");
  }

  function drawLink(text) {
    var stat = getState(this.codemirror);
    replaceSelection(this.codemirror, stat.link, this.options.insertTexts.link, text ? text : "");
  }

  function drawMath() {
    replaceSelection(this.codemirror, false, this.options.insertTexts.latex);
  }

  function drawChart() {
    replaceSelection(this.codemirror, false, this.options.insertTexts.chart);
  }

  function drawImage(text) {
    var stat = getState(this.codemirror);
    replaceSelection(this.codemirror, stat.image, this.options.insertTexts.image, text ? text : "");
  }

  function drawTable() {
    var stat = getState(this.codemirror);
    replaceSelection(this.codemirror, stat.table, this.options.insertTexts.table);
  }

  function drawHorizontalRule() {
    var stat = getState(this.codemirror);
    replaceSelection(this.codemirror, stat.image, this.options.insertTexts.horizontalRule);
  }

  function undo() {
    this.codemirror.undo();
    this.codemirror.focus();
  }

  function redo() {
    this.codemirror.redo();
    this.codemirror.focus();
  }

  var menuList = {
    toggleBold: toggleBold,
    toggleItalic: toggleItalic,
    drawLink: drawLink,
    drawMath: drawMath,
    toggleHeadingSmaller: toggleHeadingSmaller,
    toggleHeadingBigger: toggleHeadingBigger,
    drawImage: drawImage,
    toggleBlockquote: toggleBlockquote,
    toggleOrderedList: toggleOrderedList,
    toggleUnorderedList: toggleUnorderedList,
    toggleCodeBlock: toggleCodeBlock,
    togglePreview: togglePreview,
    toggleStrikethrough: toggleStrikethrough,
    toggleHeading1: toggleHeading1,
    toggleHeading2: toggleHeading2,
    toggleHeading3: toggleHeading3,
    cleanBlock: cleanBlock,
    drawTable: drawTable,
    drawChart: drawChart,
    drawHorizontalRule: drawHorizontalRule,
    undo: undo,
    redo: redo,
    toggleRender: toggleRender,
    toggleFullScreen: toggleFullScreen
  };
  function initMenu (editor) {
    for (var name in menuList) {
      if (menuList.hasOwnProperty(name)) {
        def(editor, name, menuList[name]);
      }
    }
  }

  var fullscreen = createCommonjsModule(function (module, exports) {
  // CodeMirror, copyright (c) by Marijn Haverbeke and others
  // Distributed under an MIT license: https://codemirror.net/LICENSE

  (function(mod) {
    mod(codemirror);
  })(function(CodeMirror) {

    CodeMirror.defineOption("fullScreen", false, function(cm, val, old) {
      if (old == CodeMirror.Init) old = false;
      if (!old == !val) return;
      if (val) setFullscreen(cm);
      else setNormal(cm);
    });

    function setFullscreen(cm) {
      var wrap = cm.getWrapperElement();
      cm.state.fullScreenRestore = {scrollTop: window.pageYOffset, scrollLeft: window.pageXOffset,
                                    width: wrap.style.width, height: wrap.style.height};
      wrap.style.width = "";
      wrap.style.height = "auto";
      wrap.className += " CodeMirror-fullscreen";
      document.documentElement.style.overflow = "hidden";
      cm.refresh();
    }

    function setNormal(cm) {
      var wrap = cm.getWrapperElement();
      wrap.className = wrap.className.replace(/\s*CodeMirror-fullscreen\b/, "");
      document.documentElement.style.overflow = "";
      var info = cm.state.fullScreenRestore;
      wrap.style.width = info.width; wrap.style.height = info.height;
      window.scrollTo(info.scrollLeft, info.scrollTop);
      cm.refresh();
    }
  });
  });

  var xmlFold = createCommonjsModule(function (module, exports) {
  // CodeMirror, copyright (c) by Marijn Haverbeke and others
  // Distributed under an MIT license: https://codemirror.net/LICENSE

  (function(mod) {
    mod(codemirror);
  })(function(CodeMirror) {

    var Pos = CodeMirror.Pos;
    function cmp(a, b) { return a.line - b.line || a.ch - b.ch; }

    var nameStartChar = "A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
    var nameChar = nameStartChar + "\-\:\.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
    var xmlTagStart = new RegExp("<(/?)([" + nameStartChar + "][" + nameChar + "]*)", "g");

    function Iter(cm, line, ch, range) {
      this.line = line; this.ch = ch;
      this.cm = cm; this.text = cm.getLine(line);
      this.min = range ? Math.max(range.from, cm.firstLine()) : cm.firstLine();
      this.max = range ? Math.min(range.to - 1, cm.lastLine()) : cm.lastLine();
    }

    function tagAt(iter, ch) {
      var type = iter.cm.getTokenTypeAt(Pos(iter.line, ch));
      return type && /\btag\b/.test(type);
    }

    function nextLine(iter) {
      if (iter.line >= iter.max) return;
      iter.ch = 0;
      iter.text = iter.cm.getLine(++iter.line);
      return true;
    }
    function prevLine(iter) {
      if (iter.line <= iter.min) return;
      iter.text = iter.cm.getLine(--iter.line);
      iter.ch = iter.text.length;
      return true;
    }

    function toTagEnd(iter) {
      for (;;) {
        var gt = iter.text.indexOf(">", iter.ch);
        if (gt == -1) { if (nextLine(iter)) continue; else return; }
        if (!tagAt(iter, gt + 1)) { iter.ch = gt + 1; continue; }
        var lastSlash = iter.text.lastIndexOf("/", gt);
        var selfClose = lastSlash > -1 && !/\S/.test(iter.text.slice(lastSlash + 1, gt));
        iter.ch = gt + 1;
        return selfClose ? "selfClose" : "regular";
      }
    }
    function toTagStart(iter) {
      for (;;) {
        var lt = iter.ch ? iter.text.lastIndexOf("<", iter.ch - 1) : -1;
        if (lt == -1) { if (prevLine(iter)) continue; else return; }
        if (!tagAt(iter, lt + 1)) { iter.ch = lt; continue; }
        xmlTagStart.lastIndex = lt;
        iter.ch = lt;
        var match = xmlTagStart.exec(iter.text);
        if (match && match.index == lt) return match;
      }
    }

    function toNextTag(iter) {
      for (;;) {
        xmlTagStart.lastIndex = iter.ch;
        var found = xmlTagStart.exec(iter.text);
        if (!found) { if (nextLine(iter)) continue; else return; }
        if (!tagAt(iter, found.index + 1)) { iter.ch = found.index + 1; continue; }
        iter.ch = found.index + found[0].length;
        return found;
      }
    }
    function toPrevTag(iter) {
      for (;;) {
        var gt = iter.ch ? iter.text.lastIndexOf(">", iter.ch - 1) : -1;
        if (gt == -1) { if (prevLine(iter)) continue; else return; }
        if (!tagAt(iter, gt + 1)) { iter.ch = gt; continue; }
        var lastSlash = iter.text.lastIndexOf("/", gt);
        var selfClose = lastSlash > -1 && !/\S/.test(iter.text.slice(lastSlash + 1, gt));
        iter.ch = gt + 1;
        return selfClose ? "selfClose" : "regular";
      }
    }

    function findMatchingClose(iter, tag) {
      var stack = [];
      for (;;) {
        var next = toNextTag(iter), end, startLine = iter.line, startCh = iter.ch - (next ? next[0].length : 0);
        if (!next || !(end = toTagEnd(iter))) return;
        if (end == "selfClose") continue;
        if (next[1]) { // closing tag
          for (var i = stack.length - 1; i >= 0; --i) if (stack[i] == next[2]) {
            stack.length = i;
            break;
          }
          if (i < 0 && (!tag || tag == next[2])) return {
            tag: next[2],
            from: Pos(startLine, startCh),
            to: Pos(iter.line, iter.ch)
          };
        } else { // opening tag
          stack.push(next[2]);
        }
      }
    }
    function findMatchingOpen(iter, tag) {
      var stack = [];
      for (;;) {
        var prev = toPrevTag(iter);
        if (!prev) return;
        if (prev == "selfClose") { toTagStart(iter); continue; }
        var endLine = iter.line, endCh = iter.ch;
        var start = toTagStart(iter);
        if (!start) return;
        if (start[1]) { // closing tag
          stack.push(start[2]);
        } else { // opening tag
          for (var i = stack.length - 1; i >= 0; --i) if (stack[i] == start[2]) {
            stack.length = i;
            break;
          }
          if (i < 0 && (!tag || tag == start[2])) return {
            tag: start[2],
            from: Pos(iter.line, iter.ch),
            to: Pos(endLine, endCh)
          };
        }
      }
    }

    CodeMirror.registerHelper("fold", "xml", function(cm, start) {
      var iter = new Iter(cm, start.line, 0);
      for (;;) {
        var openTag = toNextTag(iter);
        if (!openTag || iter.line != start.line) return
        var end = toTagEnd(iter);
        if (!end) return
        if (!openTag[1] && end != "selfClose") {
          var startPos = Pos(iter.line, iter.ch);
          var endPos = findMatchingClose(iter, openTag[2]);
          return endPos && cmp(endPos.from, startPos) > 0 ? {from: startPos, to: endPos.from} : null
        }
      }
    });
    CodeMirror.findMatchingTag = function(cm, pos, range) {
      var iter = new Iter(cm, pos.line, pos.ch, range);
      if (iter.text.indexOf(">") == -1 && iter.text.indexOf("<") == -1) return;
      var end = toTagEnd(iter), to = end && Pos(iter.line, iter.ch);
      var start = end && toTagStart(iter);
      if (!end || !start || cmp(iter, pos) > 0) return;
      var here = {from: Pos(iter.line, iter.ch), to: to, tag: start[2]};
      if (end == "selfClose") return {open: here, close: null, at: "open"};

      if (start[1]) { // closing tag
        return {open: findMatchingOpen(iter, start[2]), close: here, at: "close"};
      } else { // opening tag
        iter = new Iter(cm, to.line, to.ch, range);
        return {open: here, close: findMatchingClose(iter, start[2]), at: "open"};
      }
    };

    CodeMirror.findEnclosingTag = function(cm, pos, range, tag) {
      var iter = new Iter(cm, pos.line, pos.ch, range);
      for (;;) {
        var open = findMatchingOpen(iter, tag);
        if (!open) break;
        var forward = new Iter(cm, pos.line, pos.ch, range);
        var close = findMatchingClose(forward, open.tag);
        if (close) return {open: open, close: close};
      }
    };

    // Used by addon/edit/closetag.js
    CodeMirror.scanForClosingTag = function(cm, pos, name, end) {
      var iter = new Iter(cm, pos.line, pos.ch, end ? {from: 0, to: end} : null);
      return findMatchingClose(iter, name);
    };
  });
  });

  var closetag = createCommonjsModule(function (module, exports) {
  // CodeMirror, copyright (c) by Marijn Haverbeke and others
  // Distributed under an MIT license: https://codemirror.net/LICENSE

  /**
   * Tag-closer extension for CodeMirror.
   *
   * This extension adds an "autoCloseTags" option that can be set to
   * either true to get the default behavior, or an object to further
   * configure its behavior.
   *
   * These are supported options:
   *
   * `whenClosing` (default true)
   *   Whether to autoclose when the '/' of a closing tag is typed.
   * `whenOpening` (default true)
   *   Whether to autoclose the tag when the final '>' of an opening
   *   tag is typed.
   * `dontCloseTags` (default is empty tags for HTML, none for XML)
   *   An array of tag names that should not be autoclosed.
   * `indentTags` (default is block tags for HTML, none for XML)
   *   An array of tag names that should, when opened, cause a
   *   blank line to be added inside the tag, and the blank line and
   *   closing line to be indented.
   *
   * See demos/closetag.html for a usage example.
   */

  (function(mod) {
    mod(codemirror, xmlFold);
  })(function(CodeMirror) {
    CodeMirror.defineOption("autoCloseTags", false, function(cm, val, old) {
      if (old != CodeMirror.Init && old)
        cm.removeKeyMap("autoCloseTags");
      if (!val) return;
      var map = {name: "autoCloseTags"};
      if (typeof val != "object" || val.whenClosing)
        map["'/'"] = function(cm) { return autoCloseSlash(cm); };
      if (typeof val != "object" || val.whenOpening)
        map["'>'"] = function(cm) { return autoCloseGT(cm); };
      cm.addKeyMap(map);
    });

    var htmlDontClose = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param",
                         "source", "track", "wbr"];
    var htmlIndent = ["applet", "blockquote", "body", "button", "div", "dl", "fieldset", "form", "frameset", "h1", "h2", "h3", "h4",
                      "h5", "h6", "head", "html", "iframe", "layer", "legend", "object", "ol", "p", "select", "table", "ul"];

    function autoCloseGT(cm) {
      if (cm.getOption("disableInput")) return CodeMirror.Pass;
      var ranges = cm.listSelections(), replacements = [];
      var opt = cm.getOption("autoCloseTags");
      for (var i = 0; i < ranges.length; i++) {
        if (!ranges[i].empty()) return CodeMirror.Pass;
        var pos = ranges[i].head, tok = cm.getTokenAt(pos);
        var inner = CodeMirror.innerMode(cm.getMode(), tok.state), state = inner.state;
        if (inner.mode.name != "xml" || !state.tagName) return CodeMirror.Pass;

        var html = inner.mode.configuration == "html";
        var dontCloseTags = (typeof opt == "object" && opt.dontCloseTags) || (html && htmlDontClose);
        var indentTags = (typeof opt == "object" && opt.indentTags) || (html && htmlIndent);

        var tagName = state.tagName;
        if (tok.end > pos.ch) tagName = tagName.slice(0, tagName.length - tok.end + pos.ch);
        var lowerTagName = tagName.toLowerCase();
        // Don't process the '>' at the end of an end-tag or self-closing tag
        if (!tagName ||
            tok.type == "string" && (tok.end != pos.ch || !/[\"\']/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1) ||
            tok.type == "tag" && state.type == "closeTag" ||
            tok.string.indexOf("/") == (tok.string.length - 1) || // match something like <someTagName />
            dontCloseTags && indexOf(dontCloseTags, lowerTagName) > -1 ||
            closingTagExists(cm, tagName, pos, state, true))
          return CodeMirror.Pass;

        var indent = indentTags && indexOf(indentTags, lowerTagName) > -1;
        replacements[i] = {indent: indent,
                           text: ">" + (indent ? "\n\n" : "") + "</" + tagName + ">",
                           newPos: indent ? CodeMirror.Pos(pos.line + 1, 0) : CodeMirror.Pos(pos.line, pos.ch + 1)};
      }

      var dontIndentOnAutoClose = (typeof opt == "object" && opt.dontIndentOnAutoClose);
      for (var i = ranges.length - 1; i >= 0; i--) {
        var info = replacements[i];
        cm.replaceRange(info.text, ranges[i].head, ranges[i].anchor, "+insert");
        var sel = cm.listSelections().slice(0);
        sel[i] = {head: info.newPos, anchor: info.newPos};
        cm.setSelections(sel);
        if (!dontIndentOnAutoClose && info.indent) {
          cm.indentLine(info.newPos.line, null, true);
          cm.indentLine(info.newPos.line + 1, null, true);
        }
      }
    }

    function autoCloseCurrent(cm, typingSlash) {
      var ranges = cm.listSelections(), replacements = [];
      var head = typingSlash ? "/" : "</";
      var opt = cm.getOption("autoCloseTags");
      var dontIndentOnAutoClose = (typeof opt == "object" && opt.dontIndentOnSlash);
      for (var i = 0; i < ranges.length; i++) {
        if (!ranges[i].empty()) return CodeMirror.Pass;
        var pos = ranges[i].head, tok = cm.getTokenAt(pos);
        var inner = CodeMirror.innerMode(cm.getMode(), tok.state), state = inner.state;
        if (typingSlash && (tok.type == "string" || tok.string.charAt(0) != "<" ||
                            tok.start != pos.ch - 1))
          return CodeMirror.Pass;
        // Kludge to get around the fact that we are not in XML mode
        // when completing in JS/CSS snippet in htmlmixed mode. Does not
        // work for other XML embedded languages (there is no general
        // way to go from a mixed mode to its current XML state).
        var replacement;
        if (inner.mode.name != "xml") {
          if (cm.getMode().name == "htmlmixed" && inner.mode.name == "javascript")
            replacement = head + "script";
          else if (cm.getMode().name == "htmlmixed" && inner.mode.name == "css")
            replacement = head + "style";
          else
            return CodeMirror.Pass;
        } else {
          if (!state.context || !state.context.tagName ||
              closingTagExists(cm, state.context.tagName, pos, state))
            return CodeMirror.Pass;
          replacement = head + state.context.tagName;
        }
        if (cm.getLine(pos.line).charAt(tok.end) != ">") replacement += ">";
        replacements[i] = replacement;
      }
      cm.replaceSelections(replacements);
      ranges = cm.listSelections();
      if (!dontIndentOnAutoClose) {
          for (var i = 0; i < ranges.length; i++)
              if (i == ranges.length - 1 || ranges[i].head.line < ranges[i + 1].head.line)
                  cm.indentLine(ranges[i].head.line);
      }
    }

    function autoCloseSlash(cm) {
      if (cm.getOption("disableInput")) return CodeMirror.Pass;
      return autoCloseCurrent(cm, true);
    }

    CodeMirror.commands.closeTag = function(cm) { return autoCloseCurrent(cm); };

    function indexOf(collection, elt) {
      if (collection.indexOf) return collection.indexOf(elt);
      for (var i = 0, e = collection.length; i < e; ++i)
        if (collection[i] == elt) return i;
      return -1;
    }

    // If xml-fold is loaded, we use its functionality to try and verify
    // whether a given tag is actually unclosed.
    function closingTagExists(cm, tagName, pos, state, newTag) {
      if (!CodeMirror.scanForClosingTag) return false;
      var end = Math.min(cm.lastLine() + 1, pos.line + 500);
      var nextClose = CodeMirror.scanForClosingTag(cm, pos, null, end);
      if (!nextClose || nextClose.tag != tagName) return false;
      var cx = state.context;
      // If the immediate wrapping context contains onCx instances of
      // the same tag, a closing tag only exists if there are at least
      // that many closing tags of that type following.
      for (var onCx = newTag ? 1 : 0; cx && cx.tagName == tagName; cx = cx.prev) ++onCx;
      pos = nextClose.to;
      for (var i = 1; i < onCx; i++) {
        var next = CodeMirror.scanForClosingTag(cm, pos, null, end);
        if (!next || next.tag != tagName) return false;
        pos = next.to;
      }
      return true;
    }
  });
  });

  var matchtags = createCommonjsModule(function (module, exports) {
  // CodeMirror, copyright (c) by Marijn Haverbeke and others
  // Distributed under an MIT license: https://codemirror.net/LICENSE

  (function(mod) {
    mod(codemirror, xmlFold);
  })(function(CodeMirror) {

    CodeMirror.defineOption("matchTags", false, function(cm, val, old) {
      if (old && old != CodeMirror.Init) {
        cm.off("cursorActivity", doMatchTags);
        cm.off("viewportChange", maybeUpdateMatch);
        clear(cm);
      }
      if (val) {
        cm.state.matchBothTags = typeof val == "object" && val.bothTags;
        cm.on("cursorActivity", doMatchTags);
        cm.on("viewportChange", maybeUpdateMatch);
        doMatchTags(cm);
      }
    });

    function clear(cm) {
      if (cm.state.tagHit) cm.state.tagHit.clear();
      if (cm.state.tagOther) cm.state.tagOther.clear();
      cm.state.tagHit = cm.state.tagOther = null;
    }

    function doMatchTags(cm) {
      cm.state.failedTagMatch = false;
      cm.operation(function() {
        clear(cm);
        if (cm.somethingSelected()) return;
        var cur = cm.getCursor(), range = cm.getViewport();
        range.from = Math.min(range.from, cur.line); range.to = Math.max(cur.line + 1, range.to);
        var match = CodeMirror.findMatchingTag(cm, cur, range);
        if (!match) return;
        if (cm.state.matchBothTags) {
          var hit = match.at == "open" ? match.open : match.close;
          if (hit) cm.state.tagHit = cm.markText(hit.from, hit.to, {className: "CodeMirror-matchingtag"});
        }
        var other = match.at == "close" ? match.open : match.close;
        if (other)
          cm.state.tagOther = cm.markText(other.from, other.to, {className: "CodeMirror-matchingtag"});
        else
          cm.state.failedTagMatch = true;
      });
    }

    function maybeUpdateMatch(cm) {
      if (cm.state.failedTagMatch) doMatchTags(cm);
    }

    CodeMirror.commands.toMatchingTag = function(cm) {
      var found = CodeMirror.findMatchingTag(cm, cm.getCursor());
      if (found) {
        var other = found.at == "close" ? found.open : found.close;
        if (other) cm.extendSelection(other.to, other.from);
      }
    };
  });
  });

  var continuelist = createCommonjsModule(function (module, exports) {
  // CodeMirror, copyright (c) by Marijn Haverbeke and others
  // Distributed under an MIT license: https://codemirror.net/LICENSE

  (function(mod) {
    mod(codemirror);
  })(function(CodeMirror) {

    var listRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]\s|[*+-]\s|(\d+)([.)]))(\s*)/,
        emptyListRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]|[*+-]|(\d+)[.)])(\s*)$/,
        unorderedListRE = /[*+-]\s/;

    CodeMirror.commands.newlineAndIndentContinueMarkdownList = function(cm) {
      if (cm.getOption("disableInput")) return CodeMirror.Pass;
      var ranges = cm.listSelections(), replacements = [];
      for (var i = 0; i < ranges.length; i++) {
        var pos = ranges[i].head;
        var eolState = cm.getStateAfter(pos.line);
        var inList = eolState.list !== false;
        var inQuote = eolState.quote !== 0;

        var line = cm.getLine(pos.line), match = listRE.exec(line);
        var cursorBeforeBullet = /^\s*$/.test(line.slice(0, pos.ch));
        if (!ranges[i].empty() || (!inList && !inQuote) || !match || cursorBeforeBullet) {
          cm.execCommand("newlineAndIndent");
          return;
        }
        if (emptyListRE.test(line)) {
          if (!/>\s*$/.test(line)) cm.replaceRange("", {
            line: pos.line, ch: 0
          }, {
            line: pos.line, ch: pos.ch + 1
          });
          replacements[i] = "\n";
        } else {
          var indent = match[1], after = match[5];
          var numbered = !(unorderedListRE.test(match[2]) || match[2].indexOf(">") >= 0);
          var bullet = numbered ? (parseInt(match[3], 10) + 1) + match[4] : match[2].replace("x", " ");
          replacements[i] = "\n" + indent + bullet + after;

          if (numbered) incrementRemainingMarkdownListNumbers(cm, pos);
        }
      }

      cm.replaceSelections(replacements);
    };

    // Auto-updating Markdown list numbers when a new item is added to the
    // middle of a list
    function incrementRemainingMarkdownListNumbers(cm, pos) {
      var startLine = pos.line, lookAhead = 0, skipCount = 0;
      var startItem = listRE.exec(cm.getLine(startLine)), startIndent = startItem[1];

      do {
        lookAhead += 1;
        var nextLineNumber = startLine + lookAhead;
        var nextLine = cm.getLine(nextLineNumber), nextItem = listRE.exec(nextLine);

        if (nextItem) {
          var nextIndent = nextItem[1];
          var newNumber = (parseInt(startItem[3], 10) + lookAhead - skipCount);
          var nextNumber = (parseInt(nextItem[3], 10)), itemNumber = nextNumber;

          if (startIndent === nextIndent && !isNaN(nextNumber)) {
            if (newNumber === nextNumber) itemNumber = nextNumber + 1;
            if (newNumber > nextNumber) itemNumber = newNumber + 1;
            cm.replaceRange(
              nextLine.replace(listRE, nextIndent + itemNumber + nextItem[4] + nextItem[5]),
            {
              line: nextLineNumber, ch: 0
            }, {
              line: nextLineNumber, ch: nextLine.length
            });
          } else {
            if (startIndent.length > nextIndent.length) return;
            // This doesn't run if the next line immediatley indents, as it is
            // not clear of the users intention (new indented item or same level)
            if ((startIndent.length < nextIndent.length) && (lookAhead === 1)) return;
            skipCount += 1;
          }
        }
      } while (nextItem);
    }
  });
  });

  var placeholder = createCommonjsModule(function (module, exports) {
  // CodeMirror, copyright (c) by Marijn Haverbeke and others
  // Distributed under an MIT license: https://codemirror.net/LICENSE

  (function(mod) {
    mod(codemirror);
  })(function(CodeMirror) {
    CodeMirror.defineOption("placeholder", "", function(cm, val, old) {
      var prev = old && old != CodeMirror.Init;
      if (val && !prev) {
        cm.on("blur", onBlur);
        cm.on("change", onChange);
        cm.on("swapDoc", onChange);
        onChange(cm);
      } else if (!val && prev) {
        cm.off("blur", onBlur);
        cm.off("change", onChange);
        cm.off("swapDoc", onChange);
        clearPlaceholder(cm);
        var wrapper = cm.getWrapperElement();
        wrapper.className = wrapper.className.replace(" CodeMirror-empty", "");
      }

      if (val && !cm.hasFocus()) onBlur(cm);
    });

    function clearPlaceholder(cm) {
      if (cm.state.placeholder) {
        cm.state.placeholder.parentNode.removeChild(cm.state.placeholder);
        cm.state.placeholder = null;
      }
    }
    function setPlaceholder(cm) {
      clearPlaceholder(cm);
      var elt = cm.state.placeholder = document.createElement("pre");
      elt.style.cssText = "height: 0; overflow: visible";
      elt.style.direction = cm.getOption("direction");
      elt.className = "CodeMirror-placeholder";
      var placeHolder = cm.getOption("placeholder");
      if (typeof placeHolder == "string") placeHolder = document.createTextNode(placeHolder);
      elt.appendChild(placeHolder);
      cm.display.lineSpace.insertBefore(elt, cm.display.lineSpace.firstChild);
    }

    function onBlur(cm) {
      if (isEmpty(cm)) setPlaceholder(cm);
    }
    function onChange(cm) {
      var wrapper = cm.getWrapperElement(), empty = isEmpty(cm);
      wrapper.className = wrapper.className.replace(" CodeMirror-empty", "") + (empty ? " CodeMirror-empty" : "");

      if (empty) setPlaceholder(cm);
      else clearPlaceholder(cm);
    }

    function isEmpty(cm) {
      return (cm.lineCount() === 1) && (cm.getLine(0) === "");
    }
  });
  });

  var markSelection = createCommonjsModule(function (module, exports) {
  // CodeMirror, copyright (c) by Marijn Haverbeke and others
  // Distributed under an MIT license: https://codemirror.net/LICENSE

  // Because sometimes you need to mark the selected *text*.
  //
  // Adds an option 'styleSelectedText' which, when enabled, gives
  // selected text the CSS class given as option value, or
  // "CodeMirror-selectedtext" when the value is not a string.

  (function(mod) {
    mod(codemirror);
  })(function(CodeMirror) {

    CodeMirror.defineOption("styleSelectedText", false, function(cm, val, old) {
      var prev = old && old != CodeMirror.Init;
      if (val && !prev) {
        cm.state.markedSelection = [];
        cm.state.markedSelectionStyle = typeof val == "string" ? val : "CodeMirror-selectedtext";
        reset(cm);
        cm.on("cursorActivity", onCursorActivity);
        cm.on("change", onChange);
      } else if (!val && prev) {
        cm.off("cursorActivity", onCursorActivity);
        cm.off("change", onChange);
        clear(cm);
        cm.state.markedSelection = cm.state.markedSelectionStyle = null;
      }
    });

    function onCursorActivity(cm) {
      if (cm.state.markedSelection)
        cm.operation(function() { update(cm); });
    }

    function onChange(cm) {
      if (cm.state.markedSelection && cm.state.markedSelection.length)
        cm.operation(function() { clear(cm); });
    }

    var CHUNK_SIZE = 8;
    var Pos = CodeMirror.Pos;
    var cmp = CodeMirror.cmpPos;

    function coverRange(cm, from, to, addAt) {
      if (cmp(from, to) == 0) return;
      var array = cm.state.markedSelection;
      var cls = cm.state.markedSelectionStyle;
      for (var line = from.line;;) {
        var start = line == from.line ? from : Pos(line, 0);
        var endLine = line + CHUNK_SIZE, atEnd = endLine >= to.line;
        var end = atEnd ? to : Pos(endLine, 0);
        var mark = cm.markText(start, end, {className: cls});
        if (addAt == null) array.push(mark);
        else array.splice(addAt++, 0, mark);
        if (atEnd) break;
        line = endLine;
      }
    }

    function clear(cm) {
      var array = cm.state.markedSelection;
      for (var i = 0; i < array.length; ++i) array[i].clear();
      array.length = 0;
    }

    function reset(cm) {
      clear(cm);
      var ranges = cm.listSelections();
      for (var i = 0; i < ranges.length; i++)
        coverRange(cm, ranges[i].from(), ranges[i].to());
    }

    function update(cm) {
      if (!cm.somethingSelected()) return clear(cm);
      if (cm.listSelections().length > 1) return reset(cm);

      var from = cm.getCursor("start"), to = cm.getCursor("end");

      var array = cm.state.markedSelection;
      if (!array.length) return coverRange(cm, from, to);

      var coverStart = array[0].find(), coverEnd = array[array.length - 1].find();
      if (!coverStart || !coverEnd || to.line - from.line <= CHUNK_SIZE ||
          cmp(from, coverEnd.to) >= 0 || cmp(to, coverStart.from) <= 0)
        return reset(cm);

      while (cmp(from, coverStart.from) > 0) {
        array.shift().clear();
        coverStart = array[0].find();
      }
      if (cmp(from, coverStart.from) < 0) {
        if (coverStart.to.line - from.line < CHUNK_SIZE) {
          array.shift().clear();
          coverRange(cm, from, coverStart.to, 0);
        } else {
          coverRange(cm, from, coverStart.from, 0);
        }
      }

      while (cmp(to, coverEnd.to) < 0) {
        array.pop().clear();
        coverEnd = array[array.length - 1].find();
      }
      if (cmp(to, coverEnd.to) > 0) {
        if (to.line - coverEnd.from.line < CHUNK_SIZE) {
          array.pop().clear();
          coverRange(cm, coverEnd.from, to);
        } else {
          coverRange(cm, coverEnd.to, to);
        }
      }
    }
  });
  });

  var xml = createCommonjsModule(function (module, exports) {
  // CodeMirror, copyright (c) by Marijn Haverbeke and others
  // Distributed under an MIT license: https://codemirror.net/LICENSE

  (function(mod) {
    mod(codemirror);
  })(function(CodeMirror) {

  var htmlConfig = {
    autoSelfClosers: {'area': true, 'base': true, 'br': true, 'col': true, 'command': true,
                      'embed': true, 'frame': true, 'hr': true, 'img': true, 'input': true,
                      'keygen': true, 'link': true, 'meta': true, 'param': true, 'source': true,
                      'track': true, 'wbr': true, 'menuitem': true},
    implicitlyClosed: {'dd': true, 'li': true, 'optgroup': true, 'option': true, 'p': true,
                       'rp': true, 'rt': true, 'tbody': true, 'td': true, 'tfoot': true,
                       'th': true, 'tr': true},
    contextGrabbers: {
      'dd': {'dd': true, 'dt': true},
      'dt': {'dd': true, 'dt': true},
      'li': {'li': true},
      'option': {'option': true, 'optgroup': true},
      'optgroup': {'optgroup': true},
      'p': {'address': true, 'article': true, 'aside': true, 'blockquote': true, 'dir': true,
            'div': true, 'dl': true, 'fieldset': true, 'footer': true, 'form': true,
            'h1': true, 'h2': true, 'h3': true, 'h4': true, 'h5': true, 'h6': true,
            'header': true, 'hgroup': true, 'hr': true, 'menu': true, 'nav': true, 'ol': true,
            'p': true, 'pre': true, 'section': true, 'table': true, 'ul': true},
      'rp': {'rp': true, 'rt': true},
      'rt': {'rp': true, 'rt': true},
      'tbody': {'tbody': true, 'tfoot': true},
      'td': {'td': true, 'th': true},
      'tfoot': {'tbody': true},
      'th': {'td': true, 'th': true},
      'thead': {'tbody': true, 'tfoot': true},
      'tr': {'tr': true}
    },
    doNotIndent: {"pre": true},
    allowUnquoted: true,
    allowMissing: true,
    caseFold: true
  };

  var xmlConfig = {
    autoSelfClosers: {},
    implicitlyClosed: {},
    contextGrabbers: {},
    doNotIndent: {},
    allowUnquoted: false,
    allowMissing: false,
    allowMissingTagName: false,
    caseFold: false
  };

  CodeMirror.defineMode("xml", function(editorConf, config_) {
    var indentUnit = editorConf.indentUnit;
    var config = {};
    var defaults = config_.htmlMode ? htmlConfig : xmlConfig;
    for (var prop in defaults) config[prop] = defaults[prop];
    for (var prop in config_) config[prop] = config_[prop];

    // Return variables for tokenizers
    var type, setStyle;

    function inText(stream, state) {
      function chain(parser) {
        state.tokenize = parser;
        return parser(stream, state);
      }

      var ch = stream.next();
      if (ch == "<") {
        if (stream.eat("!")) {
          if (stream.eat("[")) {
            if (stream.match("CDATA[")) return chain(inBlock("atom", "]]>"));
            else return null;
          } else if (stream.match("--")) {
            return chain(inBlock("comment", "-->"));
          } else if (stream.match("DOCTYPE", true, true)) {
            stream.eatWhile(/[\w\._\-]/);
            return chain(doctype(1));
          } else {
            return null;
          }
        } else if (stream.eat("?")) {
          stream.eatWhile(/[\w\._\-]/);
          state.tokenize = inBlock("meta", "?>");
          return "meta";
        } else {
          type = stream.eat("/") ? "closeTag" : "openTag";
          state.tokenize = inTag;
          return "tag bracket";
        }
      } else if (ch == "&") {
        var ok;
        if (stream.eat("#")) {
          if (stream.eat("x")) {
            ok = stream.eatWhile(/[a-fA-F\d]/) && stream.eat(";");
          } else {
            ok = stream.eatWhile(/[\d]/) && stream.eat(";");
          }
        } else {
          ok = stream.eatWhile(/[\w\.\-:]/) && stream.eat(";");
        }
        return ok ? "atom" : "error";
      } else {
        stream.eatWhile(/[^&<]/);
        return null;
      }
    }
    inText.isInText = true;

    function inTag(stream, state) {
      var ch = stream.next();
      if (ch == ">" || (ch == "/" && stream.eat(">"))) {
        state.tokenize = inText;
        type = ch == ">" ? "endTag" : "selfcloseTag";
        return "tag bracket";
      } else if (ch == "=") {
        type = "equals";
        return null;
      } else if (ch == "<") {
        state.tokenize = inText;
        state.state = baseState;
        state.tagName = state.tagStart = null;
        var next = state.tokenize(stream, state);
        return next ? next + " tag error" : "tag error";
      } else if (/[\'\"]/.test(ch)) {
        state.tokenize = inAttribute(ch);
        state.stringStartCol = stream.column();
        return state.tokenize(stream, state);
      } else {
        stream.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/);
        return "word";
      }
    }

    function inAttribute(quote) {
      var closure = function(stream, state) {
        while (!stream.eol()) {
          if (stream.next() == quote) {
            state.tokenize = inTag;
            break;
          }
        }
        return "string";
      };
      closure.isInAttribute = true;
      return closure;
    }

    function inBlock(style, terminator) {
      return function(stream, state) {
        while (!stream.eol()) {
          if (stream.match(terminator)) {
            state.tokenize = inText;
            break;
          }
          stream.next();
        }
        return style;
      }
    }

    function doctype(depth) {
      return function(stream, state) {
        var ch;
        while ((ch = stream.next()) != null) {
          if (ch == "<") {
            state.tokenize = doctype(depth + 1);
            return state.tokenize(stream, state);
          } else if (ch == ">") {
            if (depth == 1) {
              state.tokenize = inText;
              break;
            } else {
              state.tokenize = doctype(depth - 1);
              return state.tokenize(stream, state);
            }
          }
        }
        return "meta";
      };
    }

    function Context(state, tagName, startOfLine) {
      this.prev = state.context;
      this.tagName = tagName;
      this.indent = state.indented;
      this.startOfLine = startOfLine;
      if (config.doNotIndent.hasOwnProperty(tagName) || (state.context && state.context.noIndent))
        this.noIndent = true;
    }
    function popContext(state) {
      if (state.context) state.context = state.context.prev;
    }
    function maybePopContext(state, nextTagName) {
      var parentTagName;
      while (true) {
        if (!state.context) {
          return;
        }
        parentTagName = state.context.tagName;
        if (!config.contextGrabbers.hasOwnProperty(parentTagName) ||
            !config.contextGrabbers[parentTagName].hasOwnProperty(nextTagName)) {
          return;
        }
        popContext(state);
      }
    }

    function baseState(type, stream, state) {
      if (type == "openTag") {
        state.tagStart = stream.column();
        return tagNameState;
      } else if (type == "closeTag") {
        return closeTagNameState;
      } else {
        return baseState;
      }
    }
    function tagNameState(type, stream, state) {
      if (type == "word") {
        state.tagName = stream.current();
        setStyle = "tag";
        return attrState;
      } else if (config.allowMissingTagName && type == "endTag") {
        setStyle = "tag bracket";
        return attrState(type, stream, state);
      } else {
        setStyle = "error";
        return tagNameState;
      }
    }
    function closeTagNameState(type, stream, state) {
      if (type == "word") {
        var tagName = stream.current();
        if (state.context && state.context.tagName != tagName &&
            config.implicitlyClosed.hasOwnProperty(state.context.tagName))
          popContext(state);
        if ((state.context && state.context.tagName == tagName) || config.matchClosing === false) {
          setStyle = "tag";
          return closeState;
        } else {
          setStyle = "tag error";
          return closeStateErr;
        }
      } else if (config.allowMissingTagName && type == "endTag") {
        setStyle = "tag bracket";
        return closeState(type, stream, state);
      } else {
        setStyle = "error";
        return closeStateErr;
      }
    }

    function closeState(type, _stream, state) {
      if (type != "endTag") {
        setStyle = "error";
        return closeState;
      }
      popContext(state);
      return baseState;
    }
    function closeStateErr(type, stream, state) {
      setStyle = "error";
      return closeState(type, stream, state);
    }

    function attrState(type, _stream, state) {
      if (type == "word") {
        setStyle = "attribute";
        return attrEqState;
      } else if (type == "endTag" || type == "selfcloseTag") {
        var tagName = state.tagName, tagStart = state.tagStart;
        state.tagName = state.tagStart = null;
        if (type == "selfcloseTag" ||
            config.autoSelfClosers.hasOwnProperty(tagName)) {
          maybePopContext(state, tagName);
        } else {
          maybePopContext(state, tagName);
          state.context = new Context(state, tagName, tagStart == state.indented);
        }
        return baseState;
      }
      setStyle = "error";
      return attrState;
    }
    function attrEqState(type, stream, state) {
      if (type == "equals") return attrValueState;
      if (!config.allowMissing) setStyle = "error";
      return attrState(type, stream, state);
    }
    function attrValueState(type, stream, state) {
      if (type == "string") return attrContinuedState;
      if (type == "word" && config.allowUnquoted) {setStyle = "string"; return attrState;}
      setStyle = "error";
      return attrState(type, stream, state);
    }
    function attrContinuedState(type, stream, state) {
      if (type == "string") return attrContinuedState;
      return attrState(type, stream, state);
    }

    return {
      startState: function(baseIndent) {
        var state = {tokenize: inText,
                     state: baseState,
                     indented: baseIndent || 0,
                     tagName: null, tagStart: null,
                     context: null};
        if (baseIndent != null) state.baseIndent = baseIndent;
        return state
      },

      token: function(stream, state) {
        if (!state.tagName && stream.sol())
          state.indented = stream.indentation();

        if (stream.eatSpace()) return null;
        type = null;
        var style = state.tokenize(stream, state);
        if ((style || type) && style != "comment") {
          setStyle = null;
          state.state = state.state(type || style, stream, state);
          if (setStyle)
            style = setStyle == "error" ? style + " error" : setStyle;
        }
        return style;
      },

      indent: function(state, textAfter, fullLine) {
        var context = state.context;
        // Indent multi-line strings (e.g. css).
        if (state.tokenize.isInAttribute) {
          if (state.tagStart == state.indented)
            return state.stringStartCol + 1;
          else
            return state.indented + indentUnit;
        }
        if (context && context.noIndent) return CodeMirror.Pass;
        if (state.tokenize != inTag && state.tokenize != inText)
          return fullLine ? fullLine.match(/^(\s*)/)[0].length : 0;
        // Indent the starts of attribute names.
        if (state.tagName) {
          if (config.multilineTagIndentPastTag !== false)
            return state.tagStart + state.tagName.length + 2;
          else
            return state.tagStart + indentUnit * (config.multilineTagIndentFactor || 1);
        }
        if (config.alignCDATA && /<!\[CDATA\[/.test(textAfter)) return 0;
        var tagAfter = textAfter && /^<(\/)?([\w_:\.-]*)/.exec(textAfter);
        if (tagAfter && tagAfter[1]) { // Closing tag spotted
          while (context) {
            if (context.tagName == tagAfter[2]) {
              context = context.prev;
              break;
            } else if (config.implicitlyClosed.hasOwnProperty(context.tagName)) {
              context = context.prev;
            } else {
              break;
            }
          }
        } else if (tagAfter) { // Opening tag spotted
          while (context) {
            var grabbers = config.contextGrabbers[context.tagName];
            if (grabbers && grabbers.hasOwnProperty(tagAfter[2]))
              context = context.prev;
            else
              break;
          }
        }
        while (context && context.prev && !context.startOfLine)
          context = context.prev;
        if (context) return context.indent + indentUnit;
        else return state.baseIndent || 0;
      },

      electricInput: /<\/[\s\w:]+>$/,
      blockCommentStart: "<!--",
      blockCommentEnd: "-->",

      configuration: config.htmlMode ? "html" : "xml",
      helperType: config.htmlMode ? "html" : "xml",

      skipAttribute: function(state) {
        if (state.state == attrValueState)
          state.state = attrState;
      }
    };
  });

  CodeMirror.defineMIME("text/xml", "xml");
  CodeMirror.defineMIME("application/xml", "xml");
  if (!CodeMirror.mimeModes.hasOwnProperty("text/html"))
    CodeMirror.defineMIME("text/html", {name: "xml", htmlMode: true});

  });
  });

  var meta = createCommonjsModule(function (module, exports) {
  // CodeMirror, copyright (c) by Marijn Haverbeke and others
  // Distributed under an MIT license: https://codemirror.net/LICENSE

  (function(mod) {
    mod(codemirror);
  })(function(CodeMirror) {

    CodeMirror.modeInfo = [
      {name: "APL", mime: "text/apl", mode: "apl", ext: ["dyalog", "apl"]},
      {name: "PGP", mimes: ["application/pgp", "application/pgp-encrypted", "application/pgp-keys", "application/pgp-signature"], mode: "asciiarmor", ext: ["asc", "pgp", "sig"]},
      {name: "ASN.1", mime: "text/x-ttcn-asn", mode: "asn.1", ext: ["asn", "asn1"]},
      {name: "Asterisk", mime: "text/x-asterisk", mode: "asterisk", file: /^extensions\.conf$/i},
      {name: "Brainfuck", mime: "text/x-brainfuck", mode: "brainfuck", ext: ["b", "bf"]},
      {name: "C", mime: "text/x-csrc", mode: "clike", ext: ["c", "h", "ino"]},
      {name: "C++", mime: "text/x-c++src", mode: "clike", ext: ["cpp", "c++", "cc", "cxx", "hpp", "h++", "hh", "hxx"], alias: ["cpp"]},
      {name: "Cobol", mime: "text/x-cobol", mode: "cobol", ext: ["cob", "cpy"]},
      {name: "C#", mime: "text/x-csharp", mode: "clike", ext: ["cs"], alias: ["csharp"]},
      {name: "Clojure", mime: "text/x-clojure", mode: "clojure", ext: ["clj", "cljc", "cljx"]},
      {name: "ClojureScript", mime: "text/x-clojurescript", mode: "clojure", ext: ["cljs"]},
      {name: "Closure Stylesheets (GSS)", mime: "text/x-gss", mode: "css", ext: ["gss"]},
      {name: "CMake", mime: "text/x-cmake", mode: "cmake", ext: ["cmake", "cmake.in"], file: /^CMakeLists.txt$/},
      {name: "CoffeeScript", mimes: ["application/vnd.coffeescript", "text/coffeescript", "text/x-coffeescript"], mode: "coffeescript", ext: ["coffee"], alias: ["coffee", "coffee-script"]},
      {name: "Common Lisp", mime: "text/x-common-lisp", mode: "commonlisp", ext: ["cl", "lisp", "el"], alias: ["lisp"]},
      {name: "Cypher", mime: "application/x-cypher-query", mode: "cypher", ext: ["cyp", "cypher"]},
      {name: "Cython", mime: "text/x-cython", mode: "python", ext: ["pyx", "pxd", "pxi"]},
      {name: "Crystal", mime: "text/x-crystal", mode: "crystal", ext: ["cr"]},
      {name: "CSS", mime: "text/css", mode: "css", ext: ["css"]},
      {name: "CQL", mime: "text/x-cassandra", mode: "sql", ext: ["cql"]},
      {name: "D", mime: "text/x-d", mode: "d", ext: ["d"]},
      {name: "Dart", mimes: ["application/dart", "text/x-dart"], mode: "dart", ext: ["dart"]},
      {name: "diff", mime: "text/x-diff", mode: "diff", ext: ["diff", "patch"]},
      {name: "Django", mime: "text/x-django", mode: "django"},
      {name: "Dockerfile", mime: "text/x-dockerfile", mode: "dockerfile", file: /^Dockerfile$/},
      {name: "DTD", mime: "application/xml-dtd", mode: "dtd", ext: ["dtd"]},
      {name: "Dylan", mime: "text/x-dylan", mode: "dylan", ext: ["dylan", "dyl", "intr"]},
      {name: "EBNF", mime: "text/x-ebnf", mode: "ebnf"},
      {name: "ECL", mime: "text/x-ecl", mode: "ecl", ext: ["ecl"]},
      {name: "edn", mime: "application/edn", mode: "clojure", ext: ["edn"]},
      {name: "Eiffel", mime: "text/x-eiffel", mode: "eiffel", ext: ["e"]},
      {name: "Elm", mime: "text/x-elm", mode: "elm", ext: ["elm"]},
      {name: "Embedded Javascript", mime: "application/x-ejs", mode: "htmlembedded", ext: ["ejs"]},
      {name: "Embedded Ruby", mime: "application/x-erb", mode: "htmlembedded", ext: ["erb"]},
      {name: "Erlang", mime: "text/x-erlang", mode: "erlang", ext: ["erl"]},
      {name: "Esper", mime: "text/x-esper", mode: "sql"},
      {name: "Factor", mime: "text/x-factor", mode: "factor", ext: ["factor"]},
      {name: "FCL", mime: "text/x-fcl", mode: "fcl"},
      {name: "Forth", mime: "text/x-forth", mode: "forth", ext: ["forth", "fth", "4th"]},
      {name: "Fortran", mime: "text/x-fortran", mode: "fortran", ext: ["f", "for", "f77", "f90", "f95"]},
      {name: "F#", mime: "text/x-fsharp", mode: "mllike", ext: ["fs"], alias: ["fsharp"]},
      {name: "Gas", mime: "text/x-gas", mode: "gas", ext: ["s"]},
      {name: "Gherkin", mime: "text/x-feature", mode: "gherkin", ext: ["feature"]},
      {name: "GitHub Flavored Markdown", mime: "text/x-gfm", mode: "gfm", file: /^(readme|contributing|history).md$/i},
      {name: "Go", mime: "text/x-go", mode: "go", ext: ["go"]},
      {name: "Groovy", mime: "text/x-groovy", mode: "groovy", ext: ["groovy", "gradle"], file: /^Jenkinsfile$/},
      {name: "HAML", mime: "text/x-haml", mode: "haml", ext: ["haml"]},
      {name: "Haskell", mime: "text/x-haskell", mode: "haskell", ext: ["hs"]},
      {name: "Haskell (Literate)", mime: "text/x-literate-haskell", mode: "haskell-literate", ext: ["lhs"]},
      {name: "Haxe", mime: "text/x-haxe", mode: "haxe", ext: ["hx"]},
      {name: "HXML", mime: "text/x-hxml", mode: "haxe", ext: ["hxml"]},
      {name: "ASP.NET", mime: "application/x-aspx", mode: "htmlembedded", ext: ["aspx"], alias: ["asp", "aspx"]},
      {name: "HTML", mime: "text/html", mode: "htmlmixed", ext: ["html", "htm", "handlebars", "hbs"], alias: ["xhtml"]},
      {name: "HTTP", mime: "message/http", mode: "http"},
      {name: "IDL", mime: "text/x-idl", mode: "idl", ext: ["pro"]},
      {name: "Pug", mime: "text/x-pug", mode: "pug", ext: ["jade", "pug"], alias: ["jade"]},
      {name: "Java", mime: "text/x-java", mode: "clike", ext: ["java"]},
      {name: "Java Server Pages", mime: "application/x-jsp", mode: "htmlembedded", ext: ["jsp"], alias: ["jsp"]},
      {name: "JavaScript", mimes: ["text/javascript", "text/ecmascript", "application/javascript", "application/x-javascript", "application/ecmascript"],
       mode: "javascript", ext: ["js"], alias: ["ecmascript", "js", "node"]},
      {name: "JSON", mimes: ["application/json", "application/x-json"], mode: "javascript", ext: ["json", "map"], alias: ["json5"]},
      {name: "JSON-LD", mime: "application/ld+json", mode: "javascript", ext: ["jsonld"], alias: ["jsonld"]},
      {name: "JSX", mime: "text/jsx", mode: "jsx", ext: ["jsx"]},
      {name: "Jinja2", mime: "null", mode: "jinja2", ext: ["j2", "jinja", "jinja2"]},
      {name: "Julia", mime: "text/x-julia", mode: "julia", ext: ["jl"]},
      {name: "Kotlin", mime: "text/x-kotlin", mode: "clike", ext: ["kt"]},
      {name: "LESS", mime: "text/x-less", mode: "css", ext: ["less"]},
      {name: "LiveScript", mime: "text/x-livescript", mode: "livescript", ext: ["ls"], alias: ["ls"]},
      {name: "Lua", mime: "text/x-lua", mode: "lua", ext: ["lua"]},
      {name: "Markdown", mime: "text/x-markdown", mode: "markdown", ext: ["markdown", "md", "mkd"]},
      {name: "mIRC", mime: "text/mirc", mode: "mirc"},
      {name: "MariaDB SQL", mime: "text/x-mariadb", mode: "sql"},
      {name: "Mathematica", mime: "text/x-mathematica", mode: "mathematica", ext: ["m", "nb"]},
      {name: "Modelica", mime: "text/x-modelica", mode: "modelica", ext: ["mo"]},
      {name: "MUMPS", mime: "text/x-mumps", mode: "mumps", ext: ["mps"]},
      {name: "MS SQL", mime: "text/x-mssql", mode: "sql"},
      {name: "mbox", mime: "application/mbox", mode: "mbox", ext: ["mbox"]},
      {name: "MySQL", mime: "text/x-mysql", mode: "sql"},
      {name: "Nginx", mime: "text/x-nginx-conf", mode: "nginx", file: /nginx.*\.conf$/i},
      {name: "NSIS", mime: "text/x-nsis", mode: "nsis", ext: ["nsh", "nsi"]},
      {name: "NTriples", mimes: ["application/n-triples", "application/n-quads", "text/n-triples"],
       mode: "ntriples", ext: ["nt", "nq"]},
      {name: "Objective-C", mime: "text/x-objectivec", mode: "clike", ext: ["m", "mm"], alias: ["objective-c", "objc"]},
      {name: "OCaml", mime: "text/x-ocaml", mode: "mllike", ext: ["ml", "mli", "mll", "mly"]},
      {name: "Octave", mime: "text/x-octave", mode: "octave", ext: ["m"]},
      {name: "Oz", mime: "text/x-oz", mode: "oz", ext: ["oz"]},
      {name: "Pascal", mime: "text/x-pascal", mode: "pascal", ext: ["p", "pas"]},
      {name: "PEG.js", mime: "null", mode: "pegjs", ext: ["jsonld"]},
      {name: "Perl", mime: "text/x-perl", mode: "perl", ext: ["pl", "pm"]},
      {name: "PHP", mimes: ["text/x-php", "application/x-httpd-php", "application/x-httpd-php-open"], mode: "php", ext: ["php", "php3", "php4", "php5", "php7", "phtml"]},
      {name: "Pig", mime: "text/x-pig", mode: "pig", ext: ["pig"]},
      {name: "Plain Text", mime: "text/plain", mode: "null", ext: ["txt", "text", "conf", "def", "list", "log"]},
      {name: "PLSQL", mime: "text/x-plsql", mode: "sql", ext: ["pls"]},
      {name: "PowerShell", mime: "application/x-powershell", mode: "powershell", ext: ["ps1", "psd1", "psm1"]},
      {name: "Properties files", mime: "text/x-properties", mode: "properties", ext: ["properties", "ini", "in"], alias: ["ini", "properties"]},
      {name: "ProtoBuf", mime: "text/x-protobuf", mode: "protobuf", ext: ["proto"]},
      {name: "Python", mime: "text/x-python", mode: "python", ext: ["BUILD", "bzl", "py", "pyw"], file: /^(BUCK|BUILD)$/},
      {name: "Puppet", mime: "text/x-puppet", mode: "puppet", ext: ["pp"]},
      {name: "Q", mime: "text/x-q", mode: "q", ext: ["q"]},
      {name: "R", mime: "text/x-rsrc", mode: "r", ext: ["r", "R"], alias: ["rscript"]},
      {name: "reStructuredText", mime: "text/x-rst", mode: "rst", ext: ["rst"], alias: ["rst"]},
      {name: "RPM Changes", mime: "text/x-rpm-changes", mode: "rpm"},
      {name: "RPM Spec", mime: "text/x-rpm-spec", mode: "rpm", ext: ["spec"]},
      {name: "Ruby", mime: "text/x-ruby", mode: "ruby", ext: ["rb"], alias: ["jruby", "macruby", "rake", "rb", "rbx"]},
      {name: "Rust", mime: "text/x-rustsrc", mode: "rust", ext: ["rs"]},
      {name: "SAS", mime: "text/x-sas", mode: "sas", ext: ["sas"]},
      {name: "Sass", mime: "text/x-sass", mode: "sass", ext: ["sass"]},
      {name: "Scala", mime: "text/x-scala", mode: "clike", ext: ["scala"]},
      {name: "Scheme", mime: "text/x-scheme", mode: "scheme", ext: ["scm", "ss"]},
      {name: "SCSS", mime: "text/x-scss", mode: "css", ext: ["scss"]},
      {name: "Shell", mimes: ["text/x-sh", "application/x-sh"], mode: "shell", ext: ["sh", "ksh", "bash"], alias: ["bash", "sh", "zsh"], file: /^PKGBUILD$/},
      {name: "Sieve", mime: "application/sieve", mode: "sieve", ext: ["siv", "sieve"]},
      {name: "Slim", mimes: ["text/x-slim", "application/x-slim"], mode: "slim", ext: ["slim"]},
      {name: "Smalltalk", mime: "text/x-stsrc", mode: "smalltalk", ext: ["st"]},
      {name: "Smarty", mime: "text/x-smarty", mode: "smarty", ext: ["tpl"]},
      {name: "Solr", mime: "text/x-solr", mode: "solr"},
      {name: "SML", mime: "text/x-sml", mode: "mllike", ext: ["sml", "sig", "fun", "smackspec"]},
      {name: "Soy", mime: "text/x-soy", mode: "soy", ext: ["soy"], alias: ["closure template"]},
      {name: "SPARQL", mime: "application/sparql-query", mode: "sparql", ext: ["rq", "sparql"], alias: ["sparul"]},
      {name: "Spreadsheet", mime: "text/x-spreadsheet", mode: "spreadsheet", alias: ["excel", "formula"]},
      {name: "SQL", mime: "text/x-sql", mode: "sql", ext: ["sql"]},
      {name: "SQLite", mime: "text/x-sqlite", mode: "sql"},
      {name: "Squirrel", mime: "text/x-squirrel", mode: "clike", ext: ["nut"]},
      {name: "Stylus", mime: "text/x-styl", mode: "stylus", ext: ["styl"]},
      {name: "Swift", mime: "text/x-swift", mode: "swift", ext: ["swift"]},
      {name: "sTeX", mime: "text/x-stex", mode: "stex"},
      {name: "LaTeX", mime: "text/x-latex", mode: "stex", ext: ["text", "ltx", "tex"], alias: ["tex"]},
      {name: "SystemVerilog", mime: "text/x-systemverilog", mode: "verilog", ext: ["v", "sv", "svh"]},
      {name: "Tcl", mime: "text/x-tcl", mode: "tcl", ext: ["tcl"]},
      {name: "Textile", mime: "text/x-textile", mode: "textile", ext: ["textile"]},
      {name: "TiddlyWiki ", mime: "text/x-tiddlywiki", mode: "tiddlywiki"},
      {name: "Tiki wiki", mime: "text/tiki", mode: "tiki"},
      {name: "TOML", mime: "text/x-toml", mode: "toml", ext: ["toml"]},
      {name: "Tornado", mime: "text/x-tornado", mode: "tornado"},
      {name: "troff", mime: "text/troff", mode: "troff", ext: ["1", "2", "3", "4", "5", "6", "7", "8", "9"]},
      {name: "TTCN", mime: "text/x-ttcn", mode: "ttcn", ext: ["ttcn", "ttcn3", "ttcnpp"]},
      {name: "TTCN_CFG", mime: "text/x-ttcn-cfg", mode: "ttcn-cfg", ext: ["cfg"]},
      {name: "Turtle", mime: "text/turtle", mode: "turtle", ext: ["ttl"]},
      {name: "TypeScript", mime: "application/typescript", mode: "javascript", ext: ["ts"], alias: ["ts"]},
      {name: "TypeScript-JSX", mime: "text/typescript-jsx", mode: "jsx", ext: ["tsx"], alias: ["tsx"]},
      {name: "Twig", mime: "text/x-twig", mode: "twig"},
      {name: "Web IDL", mime: "text/x-webidl", mode: "webidl", ext: ["webidl"]},
      {name: "VB.NET", mime: "text/x-vb", mode: "vb", ext: ["vb"]},
      {name: "VBScript", mime: "text/vbscript", mode: "vbscript", ext: ["vbs"]},
      {name: "Velocity", mime: "text/velocity", mode: "velocity", ext: ["vtl"]},
      {name: "Verilog", mime: "text/x-verilog", mode: "verilog", ext: ["v"]},
      {name: "VHDL", mime: "text/x-vhdl", mode: "vhdl", ext: ["vhd", "vhdl"]},
      {name: "Vue.js Component", mimes: ["script/x-vue", "text/x-vue"], mode: "vue", ext: ["vue"]},
      {name: "XML", mimes: ["application/xml", "text/xml"], mode: "xml", ext: ["xml", "xsl", "xsd", "svg"], alias: ["rss", "wsdl", "xsd"]},
      {name: "XQuery", mime: "application/xquery", mode: "xquery", ext: ["xy", "xquery"]},
      {name: "Yacas", mime: "text/x-yacas", mode: "yacas", ext: ["ys"]},
      {name: "YAML", mimes: ["text/x-yaml", "text/yaml"], mode: "yaml", ext: ["yaml", "yml"], alias: ["yml"]},
      {name: "Z80", mime: "text/x-z80", mode: "z80", ext: ["z80"]},
      {name: "mscgen", mime: "text/x-mscgen", mode: "mscgen", ext: ["mscgen", "mscin", "msc"]},
      {name: "xu", mime: "text/x-xu", mode: "mscgen", ext: ["xu"]},
      {name: "msgenny", mime: "text/x-msgenny", mode: "mscgen", ext: ["msgenny"]}
    ];
    // Ensure all modes have a mime property for backwards compatibility
    for (var i = 0; i < CodeMirror.modeInfo.length; i++) {
      var info = CodeMirror.modeInfo[i];
      if (info.mimes) info.mime = info.mimes[0];
    }

    CodeMirror.findModeByMIME = function(mime) {
      mime = mime.toLowerCase();
      for (var i = 0; i < CodeMirror.modeInfo.length; i++) {
        var info = CodeMirror.modeInfo[i];
        if (info.mime == mime) return info;
        if (info.mimes) for (var j = 0; j < info.mimes.length; j++)
          if (info.mimes[j] == mime) return info;
      }
      if (/\+xml$/.test(mime)) return CodeMirror.findModeByMIME("application/xml")
      if (/\+json$/.test(mime)) return CodeMirror.findModeByMIME("application/json")
    };

    CodeMirror.findModeByExtension = function(ext) {
      for (var i = 0; i < CodeMirror.modeInfo.length; i++) {
        var info = CodeMirror.modeInfo[i];
        if (info.ext) for (var j = 0; j < info.ext.length; j++)
          if (info.ext[j] == ext) return info;
      }
    };

    CodeMirror.findModeByFileName = function(filename) {
      for (var i = 0; i < CodeMirror.modeInfo.length; i++) {
        var info = CodeMirror.modeInfo[i];
        if (info.file && info.file.test(filename)) return info;
      }
      var dot = filename.lastIndexOf(".");
      var ext = dot > -1 && filename.substring(dot + 1, filename.length);
      if (ext) return CodeMirror.findModeByExtension(ext);
    };

    CodeMirror.findModeByName = function(name) {
      name = name.toLowerCase();
      for (var i = 0; i < CodeMirror.modeInfo.length; i++) {
        var info = CodeMirror.modeInfo[i];
        if (info.name.toLowerCase() == name) return info;
        if (info.alias) for (var j = 0; j < info.alias.length; j++)
          if (info.alias[j].toLowerCase() == name) return info;
      }
    };
  });
  });

  var markdown = createCommonjsModule(function (module, exports) {
  // CodeMirror, copyright (c) by Marijn Haverbeke and others
  // Distributed under an MIT license: https://codemirror.net/LICENSE

  (function(mod) {
    mod(codemirror, xml, meta);
  })(function(CodeMirror) {

  CodeMirror.defineMode("markdown", function(cmCfg, modeCfg) {

    var htmlMode = CodeMirror.getMode(cmCfg, "text/html");
    var htmlModeMissing = htmlMode.name == "null";

    function getMode(name) {
      if (CodeMirror.findModeByName) {
        var found = CodeMirror.findModeByName(name);
        if (found) name = found.mime || found.mimes[0];
      }
      var mode = CodeMirror.getMode(cmCfg, name);
      return mode.name == "null" ? null : mode;
    }

    // Should characters that affect highlighting be highlighted separate?
    // Does not include characters that will be output (such as `1.` and `-` for lists)
    if (modeCfg.highlightFormatting === undefined)
      modeCfg.highlightFormatting = false;

    // Maximum number of nested blockquotes. Set to 0 for infinite nesting.
    // Excess `>` will emit `error` token.
    if (modeCfg.maxBlockquoteDepth === undefined)
      modeCfg.maxBlockquoteDepth = 0;

    // Turn on task lists? ("- [ ] " and "- [x] ")
    if (modeCfg.taskLists === undefined) modeCfg.taskLists = false;

    // Turn on strikethrough syntax
    if (modeCfg.strikethrough === undefined)
      modeCfg.strikethrough = false;

    if (modeCfg.emoji === undefined)
      modeCfg.emoji = false;

    if (modeCfg.fencedCodeBlockHighlighting === undefined)
      modeCfg.fencedCodeBlockHighlighting = true;

    if (modeCfg.xml === undefined)
      modeCfg.xml = true;

    // Allow token types to be overridden by user-provided token types.
    if (modeCfg.tokenTypeOverrides === undefined)
      modeCfg.tokenTypeOverrides = {};

    var tokenTypes = {
      header: "header",
      code: "comment",
      quote: "quote",
      list1: "variable-2",
      list2: "variable-3",
      list3: "keyword",
      hr: "hr",
      image: "image",
      imageAltText: "image-alt-text",
      imageMarker: "image-marker",
      formatting: "formatting",
      linkInline: "link",
      linkEmail: "link",
      linkText: "link",
      linkHref: "string",
      em: "em",
      strong: "strong",
      strikethrough: "strikethrough",
      emoji: "builtin"
    };

    for (var tokenType in tokenTypes) {
      if (tokenTypes.hasOwnProperty(tokenType) && modeCfg.tokenTypeOverrides[tokenType]) {
        tokenTypes[tokenType] = modeCfg.tokenTypeOverrides[tokenType];
      }
    }

    var hrRE = /^([*\-_])(?:\s*\1){2,}\s*$/
    ,   listRE = /^(?:[*\-+]|^[0-9]+([.)]))\s+/
    ,   taskListRE = /^\[(x| )\](?=\s)/i // Must follow listRE
    ,   atxHeaderRE = modeCfg.allowAtxHeaderWithoutSpace ? /^(#+)/ : /^(#+)(?: |$)/
    ,   setextHeaderRE = /^ *(?:\={1,}|-{1,})\s*$/
    ,   textRE = /^[^#!\[\]*_\\<>` "'(~:]+/
    ,   fencedCodeRE = /^(~~~+|```+)[ \t]*([\w+#-]*)[^\n`]*$/
    ,   linkDefRE = /^\s*\[[^\]]+?\]:.*$/ // naive link-definition
    ,   punctuation = /[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDF3C-\uDF3E]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]/
    ,   expandedTab = "    "; // CommonMark specifies tab as 4 spaces

    function switchInline(stream, state, f) {
      state.f = state.inline = f;
      return f(stream, state);
    }

    function switchBlock(stream, state, f) {
      state.f = state.block = f;
      return f(stream, state);
    }

    function lineIsEmpty(line) {
      return !line || !/\S/.test(line.string)
    }

    // Blocks

    function blankLine(state) {
      // Reset linkTitle state
      state.linkTitle = false;
      state.linkHref = false;
      state.linkText = false;
      // Reset EM state
      state.em = false;
      // Reset STRONG state
      state.strong = false;
      // Reset strikethrough state
      state.strikethrough = false;
      // Reset state.quote
      state.quote = 0;
      // Reset state.indentedCode
      state.indentedCode = false;
      if (state.f == htmlBlock) {
        var exit = htmlModeMissing;
        if (!exit) {
          var inner = CodeMirror.innerMode(htmlMode, state.htmlState);
          exit = inner.mode.name == "xml" && inner.state.tagStart === null &&
            (!inner.state.context && inner.state.tokenize.isInText);
        }
        if (exit) {
          state.f = inlineNormal;
          state.block = blockNormal;
          state.htmlState = null;
        }
      }
      // Reset state.trailingSpace
      state.trailingSpace = 0;
      state.trailingSpaceNewLine = false;
      // Mark this line as blank
      state.prevLine = state.thisLine;
      state.thisLine = {stream: null};
      return null;
    }

    function blockNormal(stream, state) {
      var firstTokenOnLine = stream.column() === state.indentation;
      var prevLineLineIsEmpty = lineIsEmpty(state.prevLine.stream);
      var prevLineIsIndentedCode = state.indentedCode;
      var prevLineIsHr = state.prevLine.hr;
      var prevLineIsList = state.list !== false;
      var maxNonCodeIndentation = (state.listStack[state.listStack.length - 1] || 0) + 3;

      state.indentedCode = false;

      var lineIndentation = state.indentation;
      // compute once per line (on first token)
      if (state.indentationDiff === null) {
        state.indentationDiff = state.indentation;
        if (prevLineIsList) {
          // Reset inline styles which shouldn't propagate aross list items
          state.em = false;
          state.strong = false;
          state.code = false;
          state.strikethrough = false;

          state.list = null;
          // While this list item's marker's indentation is less than the deepest
          //  list item's content's indentation,pop the deepest list item
          //  indentation off the stack, and update block indentation state
          while (lineIndentation < state.listStack[state.listStack.length - 1]) {
            state.listStack.pop();
            if (state.listStack.length) {
              state.indentation = state.listStack[state.listStack.length - 1];
            // less than the first list's indent -> the line is no longer a list
            } else {
              state.list = false;
            }
          }
          if (state.list !== false) {
            state.indentationDiff = lineIndentation - state.listStack[state.listStack.length - 1];
          }
        }
      }

      // not comprehensive (currently only for setext detection purposes)
      var allowsInlineContinuation = (
          !prevLineLineIsEmpty && !prevLineIsHr && !state.prevLine.header &&
          (!prevLineIsList || !prevLineIsIndentedCode) &&
          !state.prevLine.fencedCodeEnd
      );

      var isHr = (state.list === false || prevLineIsHr || prevLineLineIsEmpty) &&
        state.indentation <= maxNonCodeIndentation && stream.match(hrRE);

      var match = null;
      if (state.indentationDiff >= 4 && (prevLineIsIndentedCode || state.prevLine.fencedCodeEnd ||
           state.prevLine.header || prevLineLineIsEmpty)) {
        stream.skipToEnd();
        state.indentedCode = true;
        return tokenTypes.code;
      } else if (stream.eatSpace()) {
        return null;
      } else if (firstTokenOnLine && state.indentation <= maxNonCodeIndentation && (match = stream.match(atxHeaderRE)) && match[1].length <= 6) {
        state.quote = 0;
        state.header = match[1].length;
        state.thisLine.header = true;
        if (modeCfg.highlightFormatting) state.formatting = "header";
        state.f = state.inline;
        return getType(state);
      } else if (state.indentation <= maxNonCodeIndentation && stream.eat('>')) {
        state.quote = firstTokenOnLine ? 1 : state.quote + 1;
        if (modeCfg.highlightFormatting) state.formatting = "quote";
        stream.eatSpace();
        return getType(state);
      } else if (!isHr && !state.setext && firstTokenOnLine && state.indentation <= maxNonCodeIndentation && (match = stream.match(listRE))) {
        var listType = match[1] ? "ol" : "ul";

        state.indentation = lineIndentation + stream.current().length;
        state.list = true;
        state.quote = 0;

        // Add this list item's content's indentation to the stack
        state.listStack.push(state.indentation);

        if (modeCfg.taskLists && stream.match(taskListRE, false)) {
          state.taskList = true;
        }
        state.f = state.inline;
        if (modeCfg.highlightFormatting) state.formatting = ["list", "list-" + listType];
        return getType(state);
      } else if (firstTokenOnLine && state.indentation <= maxNonCodeIndentation && (match = stream.match(fencedCodeRE, true))) {
        state.quote = 0;
        state.fencedEndRE = new RegExp(match[1] + "+ *$");
        // try switching mode
        state.localMode = modeCfg.fencedCodeBlockHighlighting && getMode(match[2]);
        if (state.localMode) state.localState = CodeMirror.startState(state.localMode);
        state.f = state.block = local;
        if (modeCfg.highlightFormatting) state.formatting = "code-block";
        state.code = -1;
        return getType(state);
      // SETEXT has lowest block-scope precedence after HR, so check it after
      //  the others (code, blockquote, list...)
      } else if (
        // if setext set, indicates line after ---/===
        state.setext || (
          // line before ---/===
          (!allowsInlineContinuation || !prevLineIsList) && !state.quote && state.list === false &&
          !state.code && !isHr && !linkDefRE.test(stream.string) &&
          (match = stream.lookAhead(1)) && (match = match.match(setextHeaderRE))
        )
      ) {
        if ( !state.setext ) {
          state.header = match[0].charAt(0) == '=' ? 1 : 2;
          state.setext = state.header;
        } else {
          state.header = state.setext;
          // has no effect on type so we can reset it now
          state.setext = 0;
          stream.skipToEnd();
          if (modeCfg.highlightFormatting) state.formatting = "header";
        }
        state.thisLine.header = true;
        state.f = state.inline;
        return getType(state);
      } else if (isHr) {
        stream.skipToEnd();
        state.hr = true;
        state.thisLine.hr = true;
        return tokenTypes.hr;
      } else if (stream.peek() === '[') {
        return switchInline(stream, state, footnoteLink);
      }

      return switchInline(stream, state, state.inline);
    }

    function htmlBlock(stream, state) {
      var style = htmlMode.token(stream, state.htmlState);
      if (!htmlModeMissing) {
        var inner = CodeMirror.innerMode(htmlMode, state.htmlState);
        if ((inner.mode.name == "xml" && inner.state.tagStart === null &&
             (!inner.state.context && inner.state.tokenize.isInText)) ||
            (state.md_inside && stream.current().indexOf(">") > -1)) {
          state.f = inlineNormal;
          state.block = blockNormal;
          state.htmlState = null;
        }
      }
      return style;
    }

    function local(stream, state) {
      var currListInd = state.listStack[state.listStack.length - 1] || 0;
      var hasExitedList = state.indentation < currListInd;
      var maxFencedEndInd = currListInd + 3;
      if (state.fencedEndRE && state.indentation <= maxFencedEndInd && (hasExitedList || stream.match(state.fencedEndRE))) {
        if (modeCfg.highlightFormatting) state.formatting = "code-block";
        var returnType;
        if (!hasExitedList) returnType = getType(state);
        state.localMode = state.localState = null;
        state.block = blockNormal;
        state.f = inlineNormal;
        state.fencedEndRE = null;
        state.code = 0;
        state.thisLine.fencedCodeEnd = true;
        if (hasExitedList) return switchBlock(stream, state, state.block);
        return returnType;
      } else if (state.localMode) {
        return state.localMode.token(stream, state.localState);
      } else {
        stream.skipToEnd();
        return tokenTypes.code;
      }
    }

    // Inline
    function getType(state) {
      var styles = [];

      if (state.formatting) {
        styles.push(tokenTypes.formatting);

        if (typeof state.formatting === "string") state.formatting = [state.formatting];

        for (var i = 0; i < state.formatting.length; i++) {
          styles.push(tokenTypes.formatting + "-" + state.formatting[i]);

          if (state.formatting[i] === "header") {
            styles.push(tokenTypes.formatting + "-" + state.formatting[i] + "-" + state.header);
          }

          // Add `formatting-quote` and `formatting-quote-#` for blockquotes
          // Add `error` instead if the maximum blockquote nesting depth is passed
          if (state.formatting[i] === "quote") {
            if (!modeCfg.maxBlockquoteDepth || modeCfg.maxBlockquoteDepth >= state.quote) {
              styles.push(tokenTypes.formatting + "-" + state.formatting[i] + "-" + state.quote);
            } else {
              styles.push("error");
            }
          }
        }
      }

      if (state.taskOpen) {
        styles.push("meta");
        return styles.length ? styles.join(' ') : null;
      }
      if (state.taskClosed) {
        styles.push("property");
        return styles.length ? styles.join(' ') : null;
      }

      if (state.linkHref) {
        styles.push(tokenTypes.linkHref, "url");
      } else { // Only apply inline styles to non-url text
        if (state.strong) { styles.push(tokenTypes.strong); }
        if (state.em) { styles.push(tokenTypes.em); }
        if (state.strikethrough) { styles.push(tokenTypes.strikethrough); }
        if (state.emoji) { styles.push(tokenTypes.emoji); }
        if (state.linkText) { styles.push(tokenTypes.linkText); }
        if (state.code) { styles.push(tokenTypes.code); }
        if (state.image) { styles.push(tokenTypes.image); }
        if (state.imageAltText) { styles.push(tokenTypes.imageAltText, "link"); }
        if (state.imageMarker) { styles.push(tokenTypes.imageMarker); }
      }

      if (state.header) { styles.push(tokenTypes.header, tokenTypes.header + "-" + state.header); }

      if (state.quote) {
        styles.push(tokenTypes.quote);

        // Add `quote-#` where the maximum for `#` is modeCfg.maxBlockquoteDepth
        if (!modeCfg.maxBlockquoteDepth || modeCfg.maxBlockquoteDepth >= state.quote) {
          styles.push(tokenTypes.quote + "-" + state.quote);
        } else {
          styles.push(tokenTypes.quote + "-" + modeCfg.maxBlockquoteDepth);
        }
      }

      if (state.list !== false) {
        var listMod = (state.listStack.length - 1) % 3;
        if (!listMod) {
          styles.push(tokenTypes.list1);
        } else if (listMod === 1) {
          styles.push(tokenTypes.list2);
        } else {
          styles.push(tokenTypes.list3);
        }
      }

      if (state.trailingSpaceNewLine) {
        styles.push("trailing-space-new-line");
      } else if (state.trailingSpace) {
        styles.push("trailing-space-" + (state.trailingSpace % 2 ? "a" : "b"));
      }

      return styles.length ? styles.join(' ') : null;
    }

    function handleText(stream, state) {
      if (stream.match(textRE, true)) {
        return getType(state);
      }
      return undefined;
    }

    function inlineNormal(stream, state) {
      var style = state.text(stream, state);
      if (typeof style !== 'undefined')
        return style;

      if (state.list) { // List marker (*, +, -, 1., etc)
        state.list = null;
        return getType(state);
      }

      if (state.taskList) {
        var taskOpen = stream.match(taskListRE, true)[1] === " ";
        if (taskOpen) state.taskOpen = true;
        else state.taskClosed = true;
        if (modeCfg.highlightFormatting) state.formatting = "task";
        state.taskList = false;
        return getType(state);
      }

      state.taskOpen = false;
      state.taskClosed = false;

      if (state.header && stream.match(/^#+$/, true)) {
        if (modeCfg.highlightFormatting) state.formatting = "header";
        return getType(state);
      }

      var ch = stream.next();

      // Matches link titles present on next line
      if (state.linkTitle) {
        state.linkTitle = false;
        var matchCh = ch;
        if (ch === '(') {
          matchCh = ')';
        }
        matchCh = (matchCh+'').replace(/([.?*+^\[\]\\(){}|-])/g, "\\$1");
        var regex = '^\\s*(?:[^' + matchCh + '\\\\]+|\\\\\\\\|\\\\.)' + matchCh;
        if (stream.match(new RegExp(regex), true)) {
          return tokenTypes.linkHref;
        }
      }

      // If this block is changed, it may need to be updated in GFM mode
      if (ch === '`') {
        var previousFormatting = state.formatting;
        if (modeCfg.highlightFormatting) state.formatting = "code";
        stream.eatWhile('`');
        var count = stream.current().length;
        if (state.code == 0 && (!state.quote || count == 1)) {
          state.code = count;
          return getType(state)
        } else if (count == state.code) { // Must be exact
          var t = getType(state);
          state.code = 0;
          return t
        } else {
          state.formatting = previousFormatting;
          return getType(state)
        }
      } else if (state.code) {
        return getType(state);
      }

      if (ch === '\\') {
        stream.next();
        if (modeCfg.highlightFormatting) {
          var type = getType(state);
          var formattingEscape = tokenTypes.formatting + "-escape";
          return type ? type + " " + formattingEscape : formattingEscape;
        }
      }

      if (ch === '!' && stream.match(/\[[^\]]*\] ?(?:\(|\[)/, false)) {
        state.imageMarker = true;
        state.image = true;
        if (modeCfg.highlightFormatting) state.formatting = "image";
        return getType(state);
      }

      if (ch === '[' && state.imageMarker && stream.match(/[^\]]*\](\(.*?\)| ?\[.*?\])/, false)) {
        state.imageMarker = false;
        state.imageAltText = true;
        if (modeCfg.highlightFormatting) state.formatting = "image";
        return getType(state);
      }

      if (ch === ']' && state.imageAltText) {
        if (modeCfg.highlightFormatting) state.formatting = "image";
        var type = getType(state);
        state.imageAltText = false;
        state.image = false;
        state.inline = state.f = linkHref;
        return type;
      }

      if (ch === '[' && !state.image) {
        if (state.linkText && stream.match(/^.*?\]/)) return getType(state)
        state.linkText = true;
        if (modeCfg.highlightFormatting) state.formatting = "link";
        return getType(state);
      }

      if (ch === ']' && state.linkText) {
        if (modeCfg.highlightFormatting) state.formatting = "link";
        var type = getType(state);
        state.linkText = false;
        state.inline = state.f = stream.match(/\(.*?\)| ?\[.*?\]/, false) ? linkHref : inlineNormal;
        return type;
      }

      if (ch === '<' && stream.match(/^(https?|ftps?):\/\/(?:[^\\>]|\\.)+>/, false)) {
        state.f = state.inline = linkInline;
        if (modeCfg.highlightFormatting) state.formatting = "link";
        var type = getType(state);
        if (type){
          type += " ";
        } else {
          type = "";
        }
        return type + tokenTypes.linkInline;
      }

      if (ch === '<' && stream.match(/^[^> \\]+@(?:[^\\>]|\\.)+>/, false)) {
        state.f = state.inline = linkInline;
        if (modeCfg.highlightFormatting) state.formatting = "link";
        var type = getType(state);
        if (type){
          type += " ";
        } else {
          type = "";
        }
        return type + tokenTypes.linkEmail;
      }

      if (modeCfg.xml && ch === '<' && stream.match(/^(!--|\?|!\[CDATA\[|[a-z][a-z0-9-]*(?:\s+[a-z_:.\-]+(?:\s*=\s*[^>]+)?)*\s*(?:>|$))/i, false)) {
        var end = stream.string.indexOf(">", stream.pos);
        if (end != -1) {
          var atts = stream.string.substring(stream.start, end);
          if (/markdown\s*=\s*('|"){0,1}1('|"){0,1}/.test(atts)) state.md_inside = true;
        }
        stream.backUp(1);
        state.htmlState = CodeMirror.startState(htmlMode);
        return switchBlock(stream, state, htmlBlock);
      }

      if (modeCfg.xml && ch === '<' && stream.match(/^\/\w*?>/)) {
        state.md_inside = false;
        return "tag";
      } else if (ch === "*" || ch === "_") {
        var len = 1, before = stream.pos == 1 ? " " : stream.string.charAt(stream.pos - 2);
        while (len < 3 && stream.eat(ch)) len++;
        var after = stream.peek() || " ";
        // See http://spec.commonmark.org/0.27/#emphasis-and-strong-emphasis
        var leftFlanking = !/\s/.test(after) && (!punctuation.test(after) || /\s/.test(before) || punctuation.test(before));
        var rightFlanking = !/\s/.test(before) && (!punctuation.test(before) || /\s/.test(after) || punctuation.test(after));
        var setEm = null, setStrong = null;
        if (len % 2) { // Em
          if (!state.em && leftFlanking && (ch === "*" || !rightFlanking || punctuation.test(before)))
            setEm = true;
          else if (state.em == ch && rightFlanking && (ch === "*" || !leftFlanking || punctuation.test(after)))
            setEm = false;
        }
        if (len > 1) { // Strong
          if (!state.strong && leftFlanking && (ch === "*" || !rightFlanking || punctuation.test(before)))
            setStrong = true;
          else if (state.strong == ch && rightFlanking && (ch === "*" || !leftFlanking || punctuation.test(after)))
            setStrong = false;
        }
        if (setStrong != null || setEm != null) {
          if (modeCfg.highlightFormatting) state.formatting = setEm == null ? "strong" : setStrong == null ? "em" : "strong em";
          if (setEm === true) state.em = ch;
          if (setStrong === true) state.strong = ch;
          var t = getType(state);
          if (setEm === false) state.em = false;
          if (setStrong === false) state.strong = false;
          return t
        }
      } else if (ch === ' ') {
        if (stream.eat('*') || stream.eat('_')) { // Probably surrounded by spaces
          if (stream.peek() === ' ') { // Surrounded by spaces, ignore
            return getType(state);
          } else { // Not surrounded by spaces, back up pointer
            stream.backUp(1);
          }
        }
      }

      if (modeCfg.strikethrough) {
        if (ch === '~' && stream.eatWhile(ch)) {
          if (state.strikethrough) {// Remove strikethrough
            if (modeCfg.highlightFormatting) state.formatting = "strikethrough";
            var t = getType(state);
            state.strikethrough = false;
            return t;
          } else if (stream.match(/^[^\s]/, false)) {// Add strikethrough
            state.strikethrough = true;
            if (modeCfg.highlightFormatting) state.formatting = "strikethrough";
            return getType(state);
          }
        } else if (ch === ' ') {
          if (stream.match(/^~~/, true)) { // Probably surrounded by space
            if (stream.peek() === ' ') { // Surrounded by spaces, ignore
              return getType(state);
            } else { // Not surrounded by spaces, back up pointer
              stream.backUp(2);
            }
          }
        }
      }

      if (modeCfg.emoji && ch === ":" && stream.match(/^(?:[a-z_\d+][a-z_\d+-]*|\-[a-z_\d+][a-z_\d+-]*):/)) {
        state.emoji = true;
        if (modeCfg.highlightFormatting) state.formatting = "emoji";
        var retType = getType(state);
        state.emoji = false;
        return retType;
      }

      if (ch === ' ') {
        if (stream.match(/^ +$/, false)) {
          state.trailingSpace++;
        } else if (state.trailingSpace) {
          state.trailingSpaceNewLine = true;
        }
      }

      return getType(state);
    }

    function linkInline(stream, state) {
      var ch = stream.next();

      if (ch === ">") {
        state.f = state.inline = inlineNormal;
        if (modeCfg.highlightFormatting) state.formatting = "link";
        var type = getType(state);
        if (type){
          type += " ";
        } else {
          type = "";
        }
        return type + tokenTypes.linkInline;
      }

      stream.match(/^[^>]+/, true);

      return tokenTypes.linkInline;
    }

    function linkHref(stream, state) {
      // Check if space, and return NULL if so (to avoid marking the space)
      if(stream.eatSpace()){
        return null;
      }
      var ch = stream.next();
      if (ch === '(' || ch === '[') {
        state.f = state.inline = getLinkHrefInside(ch === "(" ? ")" : "]");
        if (modeCfg.highlightFormatting) state.formatting = "link-string";
        state.linkHref = true;
        return getType(state);
      }
      return 'error';
    }

    var linkRE = {
      ")": /^(?:[^\\\(\)]|\\.|\((?:[^\\\(\)]|\\.)*\))*?(?=\))/,
      "]": /^(?:[^\\\[\]]|\\.|\[(?:[^\\\[\]]|\\.)*\])*?(?=\])/
    };

    function getLinkHrefInside(endChar) {
      return function(stream, state) {
        var ch = stream.next();

        if (ch === endChar) {
          state.f = state.inline = inlineNormal;
          if (modeCfg.highlightFormatting) state.formatting = "link-string";
          var returnState = getType(state);
          state.linkHref = false;
          return returnState;
        }

        stream.match(linkRE[endChar]);
        state.linkHref = true;
        return getType(state);
      };
    }

    function footnoteLink(stream, state) {
      if (stream.match(/^([^\]\\]|\\.)*\]:/, false)) {
        state.f = footnoteLinkInside;
        stream.next(); // Consume [
        if (modeCfg.highlightFormatting) state.formatting = "link";
        state.linkText = true;
        return getType(state);
      }
      return switchInline(stream, state, inlineNormal);
    }

    function footnoteLinkInside(stream, state) {
      if (stream.match(/^\]:/, true)) {
        state.f = state.inline = footnoteUrl;
        if (modeCfg.highlightFormatting) state.formatting = "link";
        var returnType = getType(state);
        state.linkText = false;
        return returnType;
      }

      stream.match(/^([^\]\\]|\\.)+/, true);

      return tokenTypes.linkText;
    }

    function footnoteUrl(stream, state) {
      // Check if space, and return NULL if so (to avoid marking the space)
      if(stream.eatSpace()){
        return null;
      }
      // Match URL
      stream.match(/^[^\s]+/, true);
      // Check for link title
      if (stream.peek() === undefined) { // End of line, set flag to check next line
        state.linkTitle = true;
      } else { // More content on line, check if link title
        stream.match(/^(?:\s+(?:"(?:[^"\\]|\\\\|\\.)+"|'(?:[^'\\]|\\\\|\\.)+'|\((?:[^)\\]|\\\\|\\.)+\)))?/, true);
      }
      state.f = state.inline = inlineNormal;
      return tokenTypes.linkHref + " url";
    }

    var mode = {
      startState: function() {
        return {
          f: blockNormal,

          prevLine: {stream: null},
          thisLine: {stream: null},

          block: blockNormal,
          htmlState: null,
          indentation: 0,

          inline: inlineNormal,
          text: handleText,

          formatting: false,
          linkText: false,
          linkHref: false,
          linkTitle: false,
          code: 0,
          em: false,
          strong: false,
          header: 0,
          setext: 0,
          hr: false,
          taskList: false,
          list: false,
          listStack: [],
          quote: 0,
          trailingSpace: 0,
          trailingSpaceNewLine: false,
          strikethrough: false,
          emoji: false,
          fencedEndRE: null
        };
      },

      copyState: function(s) {
        return {
          f: s.f,

          prevLine: s.prevLine,
          thisLine: s.thisLine,

          block: s.block,
          htmlState: s.htmlState && CodeMirror.copyState(htmlMode, s.htmlState),
          indentation: s.indentation,

          localMode: s.localMode,
          localState: s.localMode ? CodeMirror.copyState(s.localMode, s.localState) : null,

          inline: s.inline,
          text: s.text,
          formatting: false,
          linkText: s.linkText,
          linkTitle: s.linkTitle,
          linkHref: s.linkHref,
          code: s.code,
          em: s.em,
          strong: s.strong,
          strikethrough: s.strikethrough,
          emoji: s.emoji,
          header: s.header,
          setext: s.setext,
          hr: s.hr,
          taskList: s.taskList,
          list: s.list,
          listStack: s.listStack.slice(0),
          quote: s.quote,
          indentedCode: s.indentedCode,
          trailingSpace: s.trailingSpace,
          trailingSpaceNewLine: s.trailingSpaceNewLine,
          md_inside: s.md_inside,
          fencedEndRE: s.fencedEndRE
        };
      },

      token: function(stream, state) {

        // Reset state.formatting
        state.formatting = false;

        if (stream != state.thisLine.stream) {
          state.header = 0;
          state.hr = false;

          if (stream.match(/^\s*$/, true)) {
            blankLine(state);
            return null;
          }

          state.prevLine = state.thisLine;
          state.thisLine = {stream: stream};

          // Reset state.taskList
          state.taskList = false;

          // Reset state.trailingSpace
          state.trailingSpace = 0;
          state.trailingSpaceNewLine = false;

          if (!state.localState) {
            state.f = state.block;
            if (state.f != htmlBlock) {
              var indentation = stream.match(/^\s*/, true)[0].replace(/\t/g, expandedTab).length;
              state.indentation = indentation;
              state.indentationDiff = null;
              if (indentation > 0) return null;
            }
          }
        }
        return state.f(stream, state);
      },

      innerMode: function(state) {
        if (state.block == htmlBlock) return {state: state.htmlState, mode: htmlMode};
        if (state.localState) return {state: state.localState, mode: state.localMode};
        return {state: state, mode: mode};
      },

      indent: function(state, textAfter, line) {
        if (state.block == htmlBlock && htmlMode.indent) return htmlMode.indent(state.htmlState, textAfter, line)
        if (state.localState && state.localMode.indent) return state.localMode.indent(state.localState, textAfter, line)
        return CodeMirror.Pass
      },

      blankLine: blankLine,

      getType: getType,

      blockCommentStart: "<!--",
      blockCommentEnd: "-->",
      closeBrackets: "()[]{}''\"\"``",
      fold: "markdown"
    };
    return mode;
  }, "xml");

  CodeMirror.defineMIME("text/markdown", "markdown");

  CodeMirror.defineMIME("text/x-markdown", "markdown");

  });
  });

  function draggable (editor, cm) {
    codemirror.on(cm.display.lineDiv, "dragenter", function (ev) {
      ev.preventDefault();
      if (getClass(ev.target, "CodeMirror-line")) addClass(ev.target, "line-dragenter");
      return false;
    });
    codemirror.on(cm.display.lineDiv, "drop", function (ev) {
      ev.preventDefault();
      if (!getClass(ev.target, "CodeMirror-line")) return;
      removeClass(ev.target, "line-dragenter");
      var files = ev.dataTransfer.files;
      if (!files) return;
      var lineNumber = cm.lineAtHeight(ev.pageY);
      cm.setCursor(lineNumber, 0);

      for (var i = 0; i < files.length; i++) {
        editor.uploadImages(files[i]);
      }
    });
    codemirror.on(cm.display.lineDiv, "dragleave", function (ev) {
      ev.preventDefault();
      if (getClass(ev.target, "CodeMirror-line")) removeClass(ev.target, "line-dragenter");
    });
  }

  function CodeMirror$1 (editor) {
    var options = editor.options;
    Object.keys(shortcuts).forEach(function (name) {
      var key = shortcuts[name];

      if (menuList[name]) {
        options.CodeMirrorConfig.extraKeys[key] = function () {
          return Reflect.apply(menuList[name], editor, []);
        };
      }
    });
    var placeholder = options.el.getAttribute("placeholder");
    if (placeholder) options.CodeMirrorConfig.placeholder = placeholder;
    var cm = codemirror.fromTextArea(options.el, options.CodeMirrorConfig);
    draggable(editor, cm);
    return cm;
  }

  var alertTheme = {
    success: {
      icon: "fa fa-check-circle",
      className: "smartmd__alert__item--success",
      defaultText: "Completed"
    },
    error: {
      icon: "fa fa-close-circle",
      className: "smartmd__alert__item--danger",
      defaultText: "Some things wrong"
    }
  };

  var MarkdownItConfig = {
    options: {
      langPrefix: 'language-',
      breaks: true
    },
    plugins: ['mermaid', 'katex', 'emoji']
  };

  var keyMaps = {
    Enter: "newlineAndIndentContinueMarkdownList",
    Tab: "tabAndIndentMarkdownList",
    "Shift-Tab": "shiftTabAndUnindentMarkdownList"
  };
  var mode = {
    name: "markdown",
    gitHubSpice: false,
    highlightFormatting: true
  };
  var CodeMirrorConfig = {
    mode: "smartmd",
    backdrop: mode,
    theme: "paper",
    tabSize: 2,
    indentUnit: 2,
    indentWithTabs: true,
    lineNumbers: false,
    autofocus: false,
    extraKeys: keyMaps,
    lineWrapping: true,
    allowDropFileTypes: ["text/plain"],
    autoCloseTags: false,
    matchTags: {
      bothTags: true
    },
    placeholder: "Please enter the text ...",
    styleSelectedText: true
  };

  var toolbarConfig = {
    "bold": {
      action: "toggleBold",
      className: "fa fa-bold",
      title: "Bold"
    },
    "italic": {
      action: "toggleItalic",
      className: "fa fa-italic",
      title: "Italic"
    },
    "strikethrough": {
      action: "toggleStrikethrough",
      className: "fa fa-strikethrough",
      title: "Strikethrough"
    },
    "heading": {
      action: "toggleHeadingSmaller",
      className: "fa fa-header",
      title: "Heading"
    },
    "heading-smaller": {
      action: "toggleHeadingSmaller",
      className: "fa fa-header fa-header-x fa-header-smaller",
      title: "Smaller Heading"
    },
    "heading-bigger": {
      action: "toggleHeadingBigger",
      className: "fa fa-header fa-header-x fa-header-bigger",
      title: "Bigger Heading"
    },
    "heading-1": {
      action: "toggleHeading1",
      className: "fa fa-header fa-header-x fa-header-1",
      title: "Big Heading"
    },
    "heading-2": {
      action: "toggleHeading2",
      className: "fa fa-header fa-header-x fa-header-2",
      title: "Medium Heading"
    },
    "heading-3": {
      action: "toggleHeading3",
      className: "fa fa-header fa-header-x fa-header-3",
      title: "Small Heading"
    },
    "split-line-1": {
      className: "split-line"
    },
    "code": {
      action: "toggleCodeBlock",
      className: "fa fa-code",
      title: "Code"
    },
    "quote": {
      action: "toggleBlockquote",
      className: "fa fa-quote-left",
      title: "Quote"
    },
    "unordered-list": {
      action: "toggleUnorderedList",
      className: "fa fa-list-ul",
      title: "Generic List"
    },
    "ordered-list": {
      action: "toggleOrderedList",
      className: "fa fa-list-ol",
      title: "Numbered List"
    },
    "clean-block": {
      action: "cleanBlock",
      className: "fa fa-eraser fa-clean-block",
      title: "Clean block"
    },
    "split-line-2": {
      className: "split-line"
    },
    "link": {
      action: "drawLink",
      className: "fa fa-link",
      title: "Create Link"
    },
    "image": {
      action: "drawImage",
      className: "fa fa-picture-o",
      title: "Insert Image"
    },
    "math": {
      action: "drawMath",
      className: "fa fa-superscript",
      title: "Math Formula"
    },
    "chart": {
      action: "drawChart",
      className: "fa fa-sitemap",
      title: "Flow Chart"
    },
    "table": {
      action: "drawTable",
      className: "fa fa-table",
      title: "Insert Table"
    },
    "horizontal-rule": {
      action: "drawHorizontalRule",
      className: "fa fa-minus",
      title: "Insert Horizontal Line"
    },
    "split-line-3": {
      className: "split-line"
    },
    "render": {
      action: "toggleRender",
      className: "fa fa-eye no-disable",
      title: "Toggle Render"
    },
    "preview": {
      action: "togglePreview",
      className: "fa fa-columns no-disable",
      title: "Toggle Preview"
    },
    "fullscreen": {
      action: "toggleFullScreen",
      className: "fa fa-arrows-alt no-disable",
      title: "Toggle Fullscreen"
    },
    "guide": {
      action: "https://xiaoqingxin.site/editor/exhibition",
      className: "fa fa-question-circle",
      title: "Markdown Guide"
    },
    "undo": {
      action: "undo",
      className: "fa fa-undo no-disable",
      title: "Undo"
    },
    "redo": {
      action: "redo",
      className: "fa fa-repeat no-disable",
      title: "Redo"
    }
  };

  var blockStyles = {
    bold: "**",
    code: "```",
    italic: "*",
    strikethrough: "~~"
  };
  var insertTexts = {
    link: ["[link name](https://", "#text#)"],
    image: ["![](https://", "#text#)"],
    table: ["", "| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n\n"],
    horizontalRule: ["", "\n\n-----\n\n"],
    latex: ["$$\n\\begin{cases}3x + 5y +  z \\\\ 7x - 2y + 4z \\\\ -6x + 3y + 2z \\end{cases}", "\n$$"],
    chart: ["```\ngraph LR\nA[Square Rect] -- Link text --> B((Circle))\nA --> C(Round Rect)\nB --> D{Rhombus}\nC --> D", "\n```"]
  };
  var defaults = {
    isFullScreen: false,
    isPreviewActive: false,
    statusbar: ['autoSave', 'lines', 'words', 'cursor', 'block'],
    uploadsPath: "./upload",
    uploads: {
      type: ['jpeg', 'png', 'bmp', 'gif', 'jpg'],
      maxSize: 4096
    },
    alertDelay: 5000,
    blockStyles: blockStyles,
    insertTexts: insertTexts,
    alertTheme: alertTheme,
    shortcuts: shortcuts,
    MarkdownItConfig: MarkdownItConfig,
    CodeMirrorConfig: CodeMirrorConfig,
    toolbarConfig: toolbarConfig
  };

  var Aacute = "Á";
  var aacute = "á";
  var Abreve = "Ă";
  var abreve = "ă";
  var ac = "∾";
  var acd = "∿";
  var acE = "∾̳";
  var Acirc = "Â";
  var acirc = "â";
  var acute = "´";
  var Acy = "А";
  var acy = "а";
  var AElig = "Æ";
  var aelig = "æ";
  var af = "⁡";
  var Afr = "𝔄";
  var afr = "𝔞";
  var Agrave = "À";
  var agrave = "à";
  var alefsym = "ℵ";
  var aleph = "ℵ";
  var Alpha = "Α";
  var alpha = "α";
  var Amacr = "Ā";
  var amacr = "ā";
  var amalg = "⨿";
  var amp = "&";
  var AMP = "&";
  var andand = "⩕";
  var And = "⩓";
  var and = "∧";
  var andd = "⩜";
  var andslope = "⩘";
  var andv = "⩚";
  var ang = "∠";
  var ange = "⦤";
  var angle = "∠";
  var angmsdaa = "⦨";
  var angmsdab = "⦩";
  var angmsdac = "⦪";
  var angmsdad = "⦫";
  var angmsdae = "⦬";
  var angmsdaf = "⦭";
  var angmsdag = "⦮";
  var angmsdah = "⦯";
  var angmsd = "∡";
  var angrt = "∟";
  var angrtvb = "⊾";
  var angrtvbd = "⦝";
  var angsph = "∢";
  var angst = "Å";
  var angzarr = "⍼";
  var Aogon = "Ą";
  var aogon = "ą";
  var Aopf = "𝔸";
  var aopf = "𝕒";
  var apacir = "⩯";
  var ap = "≈";
  var apE = "⩰";
  var ape = "≊";
  var apid = "≋";
  var apos = "'";
  var ApplyFunction = "⁡";
  var approx = "≈";
  var approxeq = "≊";
  var Aring = "Å";
  var aring = "å";
  var Ascr = "𝒜";
  var ascr = "𝒶";
  var Assign = "≔";
  var ast = "*";
  var asymp = "≈";
  var asympeq = "≍";
  var Atilde = "Ã";
  var atilde = "ã";
  var Auml = "Ä";
  var auml = "ä";
  var awconint = "∳";
  var awint = "⨑";
  var backcong = "≌";
  var backepsilon = "϶";
  var backprime = "‵";
  var backsim = "∽";
  var backsimeq = "⋍";
  var Backslash = "∖";
  var Barv = "⫧";
  var barvee = "⊽";
  var barwed = "⌅";
  var Barwed = "⌆";
  var barwedge = "⌅";
  var bbrk = "⎵";
  var bbrktbrk = "⎶";
  var bcong = "≌";
  var Bcy = "Б";
  var bcy = "б";
  var bdquo = "„";
  var becaus = "∵";
  var because = "∵";
  var Because = "∵";
  var bemptyv = "⦰";
  var bepsi = "϶";
  var bernou = "ℬ";
  var Bernoullis = "ℬ";
  var Beta = "Β";
  var beta = "β";
  var beth = "ℶ";
  var between = "≬";
  var Bfr = "𝔅";
  var bfr = "𝔟";
  var bigcap = "⋂";
  var bigcirc = "◯";
  var bigcup = "⋃";
  var bigodot = "⨀";
  var bigoplus = "⨁";
  var bigotimes = "⨂";
  var bigsqcup = "⨆";
  var bigstar = "★";
  var bigtriangledown = "▽";
  var bigtriangleup = "△";
  var biguplus = "⨄";
  var bigvee = "⋁";
  var bigwedge = "⋀";
  var bkarow = "⤍";
  var blacklozenge = "⧫";
  var blacksquare = "▪";
  var blacktriangle = "▴";
  var blacktriangledown = "▾";
  var blacktriangleleft = "◂";
  var blacktriangleright = "▸";
  var blank = "␣";
  var blk12 = "▒";
  var blk14 = "░";
  var blk34 = "▓";
  var block = "█";
  var bne = "=⃥";
  var bnequiv = "≡⃥";
  var bNot = "⫭";
  var bnot = "⌐";
  var Bopf = "𝔹";
  var bopf = "𝕓";
  var bot = "⊥";
  var bottom = "⊥";
  var bowtie = "⋈";
  var boxbox = "⧉";
  var boxdl = "┐";
  var boxdL = "╕";
  var boxDl = "╖";
  var boxDL = "╗";
  var boxdr = "┌";
  var boxdR = "╒";
  var boxDr = "╓";
  var boxDR = "╔";
  var boxh = "─";
  var boxH = "═";
  var boxhd = "┬";
  var boxHd = "╤";
  var boxhD = "╥";
  var boxHD = "╦";
  var boxhu = "┴";
  var boxHu = "╧";
  var boxhU = "╨";
  var boxHU = "╩";
  var boxminus = "⊟";
  var boxplus = "⊞";
  var boxtimes = "⊠";
  var boxul = "┘";
  var boxuL = "╛";
  var boxUl = "╜";
  var boxUL = "╝";
  var boxur = "└";
  var boxuR = "╘";
  var boxUr = "╙";
  var boxUR = "╚";
  var boxv = "│";
  var boxV = "║";
  var boxvh = "┼";
  var boxvH = "╪";
  var boxVh = "╫";
  var boxVH = "╬";
  var boxvl = "┤";
  var boxvL = "╡";
  var boxVl = "╢";
  var boxVL = "╣";
  var boxvr = "├";
  var boxvR = "╞";
  var boxVr = "╟";
  var boxVR = "╠";
  var bprime = "‵";
  var breve = "˘";
  var Breve = "˘";
  var brvbar = "¦";
  var bscr = "𝒷";
  var Bscr = "ℬ";
  var bsemi = "⁏";
  var bsim = "∽";
  var bsime = "⋍";
  var bsolb = "⧅";
  var bsol = "\\";
  var bsolhsub = "⟈";
  var bull = "•";
  var bullet = "•";
  var bump = "≎";
  var bumpE = "⪮";
  var bumpe = "≏";
  var Bumpeq = "≎";
  var bumpeq = "≏";
  var Cacute = "Ć";
  var cacute = "ć";
  var capand = "⩄";
  var capbrcup = "⩉";
  var capcap = "⩋";
  var cap = "∩";
  var Cap = "⋒";
  var capcup = "⩇";
  var capdot = "⩀";
  var CapitalDifferentialD = "ⅅ";
  var caps = "∩︀";
  var caret = "⁁";
  var caron = "ˇ";
  var Cayleys = "ℭ";
  var ccaps = "⩍";
  var Ccaron = "Č";
  var ccaron = "č";
  var Ccedil = "Ç";
  var ccedil = "ç";
  var Ccirc = "Ĉ";
  var ccirc = "ĉ";
  var Cconint = "∰";
  var ccups = "⩌";
  var ccupssm = "⩐";
  var Cdot = "Ċ";
  var cdot = "ċ";
  var cedil = "¸";
  var Cedilla = "¸";
  var cemptyv = "⦲";
  var cent = "¢";
  var centerdot = "·";
  var CenterDot = "·";
  var cfr = "𝔠";
  var Cfr = "ℭ";
  var CHcy = "Ч";
  var chcy = "ч";
  var check = "✓";
  var checkmark = "✓";
  var Chi = "Χ";
  var chi = "χ";
  var circ = "ˆ";
  var circeq = "≗";
  var circlearrowleft = "↺";
  var circlearrowright = "↻";
  var circledast = "⊛";
  var circledcirc = "⊚";
  var circleddash = "⊝";
  var CircleDot = "⊙";
  var circledR = "®";
  var circledS = "Ⓢ";
  var CircleMinus = "⊖";
  var CirclePlus = "⊕";
  var CircleTimes = "⊗";
  var cir = "○";
  var cirE = "⧃";
  var cire = "≗";
  var cirfnint = "⨐";
  var cirmid = "⫯";
  var cirscir = "⧂";
  var ClockwiseContourIntegral = "∲";
  var CloseCurlyDoubleQuote = "”";
  var CloseCurlyQuote = "’";
  var clubs = "♣";
  var clubsuit = "♣";
  var colon = ":";
  var Colon = "∷";
  var Colone = "⩴";
  var colone = "≔";
  var coloneq = "≔";
  var comma = ",";
  var commat = "@";
  var comp = "∁";
  var compfn = "∘";
  var complement = "∁";
  var complexes = "ℂ";
  var cong = "≅";
  var congdot = "⩭";
  var Congruent = "≡";
  var conint = "∮";
  var Conint = "∯";
  var ContourIntegral = "∮";
  var copf = "𝕔";
  var Copf = "ℂ";
  var coprod = "∐";
  var Coproduct = "∐";
  var copy = "©";
  var COPY = "©";
  var copysr = "℗";
  var CounterClockwiseContourIntegral = "∳";
  var crarr = "↵";
  var cross = "✗";
  var Cross = "⨯";
  var Cscr = "𝒞";
  var cscr = "𝒸";
  var csub = "⫏";
  var csube = "⫑";
  var csup = "⫐";
  var csupe = "⫒";
  var ctdot = "⋯";
  var cudarrl = "⤸";
  var cudarrr = "⤵";
  var cuepr = "⋞";
  var cuesc = "⋟";
  var cularr = "↶";
  var cularrp = "⤽";
  var cupbrcap = "⩈";
  var cupcap = "⩆";
  var CupCap = "≍";
  var cup = "∪";
  var Cup = "⋓";
  var cupcup = "⩊";
  var cupdot = "⊍";
  var cupor = "⩅";
  var cups = "∪︀";
  var curarr = "↷";
  var curarrm = "⤼";
  var curlyeqprec = "⋞";
  var curlyeqsucc = "⋟";
  var curlyvee = "⋎";
  var curlywedge = "⋏";
  var curren = "¤";
  var curvearrowleft = "↶";
  var curvearrowright = "↷";
  var cuvee = "⋎";
  var cuwed = "⋏";
  var cwconint = "∲";
  var cwint = "∱";
  var cylcty = "⌭";
  var dagger = "†";
  var Dagger = "‡";
  var daleth = "ℸ";
  var darr = "↓";
  var Darr = "↡";
  var dArr = "⇓";
  var dash = "‐";
  var Dashv = "⫤";
  var dashv = "⊣";
  var dbkarow = "⤏";
  var dblac = "˝";
  var Dcaron = "Ď";
  var dcaron = "ď";
  var Dcy = "Д";
  var dcy = "д";
  var ddagger = "‡";
  var ddarr = "⇊";
  var DD = "ⅅ";
  var dd = "ⅆ";
  var DDotrahd = "⤑";
  var ddotseq = "⩷";
  var deg = "°";
  var Del = "∇";
  var Delta = "Δ";
  var delta = "δ";
  var demptyv = "⦱";
  var dfisht = "⥿";
  var Dfr = "𝔇";
  var dfr = "𝔡";
  var dHar = "⥥";
  var dharl = "⇃";
  var dharr = "⇂";
  var DiacriticalAcute = "´";
  var DiacriticalDot = "˙";
  var DiacriticalDoubleAcute = "˝";
  var DiacriticalGrave = "`";
  var DiacriticalTilde = "˜";
  var diam = "⋄";
  var diamond = "⋄";
  var Diamond = "⋄";
  var diamondsuit = "♦";
  var diams = "♦";
  var die = "¨";
  var DifferentialD = "ⅆ";
  var digamma = "ϝ";
  var disin = "⋲";
  var div = "÷";
  var divide = "÷";
  var divideontimes = "⋇";
  var divonx = "⋇";
  var DJcy = "Ђ";
  var djcy = "ђ";
  var dlcorn = "⌞";
  var dlcrop = "⌍";
  var dollar = "$";
  var Dopf = "𝔻";
  var dopf = "𝕕";
  var Dot = "¨";
  var dot = "˙";
  var DotDot = "⃜";
  var doteq = "≐";
  var doteqdot = "≑";
  var DotEqual = "≐";
  var dotminus = "∸";
  var dotplus = "∔";
  var dotsquare = "⊡";
  var doublebarwedge = "⌆";
  var DoubleContourIntegral = "∯";
  var DoubleDot = "¨";
  var DoubleDownArrow = "⇓";
  var DoubleLeftArrow = "⇐";
  var DoubleLeftRightArrow = "⇔";
  var DoubleLeftTee = "⫤";
  var DoubleLongLeftArrow = "⟸";
  var DoubleLongLeftRightArrow = "⟺";
  var DoubleLongRightArrow = "⟹";
  var DoubleRightArrow = "⇒";
  var DoubleRightTee = "⊨";
  var DoubleUpArrow = "⇑";
  var DoubleUpDownArrow = "⇕";
  var DoubleVerticalBar = "∥";
  var DownArrowBar = "⤓";
  var downarrow = "↓";
  var DownArrow = "↓";
  var Downarrow = "⇓";
  var DownArrowUpArrow = "⇵";
  var DownBreve = "̑";
  var downdownarrows = "⇊";
  var downharpoonleft = "⇃";
  var downharpoonright = "⇂";
  var DownLeftRightVector = "⥐";
  var DownLeftTeeVector = "⥞";
  var DownLeftVectorBar = "⥖";
  var DownLeftVector = "↽";
  var DownRightTeeVector = "⥟";
  var DownRightVectorBar = "⥗";
  var DownRightVector = "⇁";
  var DownTeeArrow = "↧";
  var DownTee = "⊤";
  var drbkarow = "⤐";
  var drcorn = "⌟";
  var drcrop = "⌌";
  var Dscr = "𝒟";
  var dscr = "𝒹";
  var DScy = "Ѕ";
  var dscy = "ѕ";
  var dsol = "⧶";
  var Dstrok = "Đ";
  var dstrok = "đ";
  var dtdot = "⋱";
  var dtri = "▿";
  var dtrif = "▾";
  var duarr = "⇵";
  var duhar = "⥯";
  var dwangle = "⦦";
  var DZcy = "Џ";
  var dzcy = "џ";
  var dzigrarr = "⟿";
  var Eacute = "É";
  var eacute = "é";
  var easter = "⩮";
  var Ecaron = "Ě";
  var ecaron = "ě";
  var Ecirc = "Ê";
  var ecirc = "ê";
  var ecir = "≖";
  var ecolon = "≕";
  var Ecy = "Э";
  var ecy = "э";
  var eDDot = "⩷";
  var Edot = "Ė";
  var edot = "ė";
  var eDot = "≑";
  var ee = "ⅇ";
  var efDot = "≒";
  var Efr = "𝔈";
  var efr = "𝔢";
  var eg = "⪚";
  var Egrave = "È";
  var egrave = "è";
  var egs = "⪖";
  var egsdot = "⪘";
  var el = "⪙";
  var Element = "∈";
  var elinters = "⏧";
  var ell = "ℓ";
  var els = "⪕";
  var elsdot = "⪗";
  var Emacr = "Ē";
  var emacr = "ē";
  var empty = "∅";
  var emptyset = "∅";
  var EmptySmallSquare = "◻";
  var emptyv = "∅";
  var EmptyVerySmallSquare = "▫";
  var emsp13 = " ";
  var emsp14 = " ";
  var emsp = " ";
  var ENG = "Ŋ";
  var eng = "ŋ";
  var ensp = " ";
  var Eogon = "Ę";
  var eogon = "ę";
  var Eopf = "𝔼";
  var eopf = "𝕖";
  var epar = "⋕";
  var eparsl = "⧣";
  var eplus = "⩱";
  var epsi = "ε";
  var Epsilon = "Ε";
  var epsilon = "ε";
  var epsiv = "ϵ";
  var eqcirc = "≖";
  var eqcolon = "≕";
  var eqsim = "≂";
  var eqslantgtr = "⪖";
  var eqslantless = "⪕";
  var Equal = "⩵";
  var equals = "=";
  var EqualTilde = "≂";
  var equest = "≟";
  var Equilibrium = "⇌";
  var equiv = "≡";
  var equivDD = "⩸";
  var eqvparsl = "⧥";
  var erarr = "⥱";
  var erDot = "≓";
  var escr = "ℯ";
  var Escr = "ℰ";
  var esdot = "≐";
  var Esim = "⩳";
  var esim = "≂";
  var Eta = "Η";
  var eta = "η";
  var ETH = "Ð";
  var eth = "ð";
  var Euml = "Ë";
  var euml = "ë";
  var euro = "€";
  var excl = "!";
  var exist = "∃";
  var Exists = "∃";
  var expectation = "ℰ";
  var exponentiale = "ⅇ";
  var ExponentialE = "ⅇ";
  var fallingdotseq = "≒";
  var Fcy = "Ф";
  var fcy = "ф";
  var female = "♀";
  var ffilig = "ﬃ";
  var fflig = "ﬀ";
  var ffllig = "ﬄ";
  var Ffr = "𝔉";
  var ffr = "𝔣";
  var filig = "ﬁ";
  var FilledSmallSquare = "◼";
  var FilledVerySmallSquare = "▪";
  var fjlig = "fj";
  var flat = "♭";
  var fllig = "ﬂ";
  var fltns = "▱";
  var fnof = "ƒ";
  var Fopf = "𝔽";
  var fopf = "𝕗";
  var forall = "∀";
  var ForAll = "∀";
  var fork = "⋔";
  var forkv = "⫙";
  var Fouriertrf = "ℱ";
  var fpartint = "⨍";
  var frac12 = "½";
  var frac13 = "⅓";
  var frac14 = "¼";
  var frac15 = "⅕";
  var frac16 = "⅙";
  var frac18 = "⅛";
  var frac23 = "⅔";
  var frac25 = "⅖";
  var frac34 = "¾";
  var frac35 = "⅗";
  var frac38 = "⅜";
  var frac45 = "⅘";
  var frac56 = "⅚";
  var frac58 = "⅝";
  var frac78 = "⅞";
  var frasl = "⁄";
  var frown = "⌢";
  var fscr = "𝒻";
  var Fscr = "ℱ";
  var gacute = "ǵ";
  var Gamma = "Γ";
  var gamma = "γ";
  var Gammad = "Ϝ";
  var gammad = "ϝ";
  var gap = "⪆";
  var Gbreve = "Ğ";
  var gbreve = "ğ";
  var Gcedil = "Ģ";
  var Gcirc = "Ĝ";
  var gcirc = "ĝ";
  var Gcy = "Г";
  var gcy = "г";
  var Gdot = "Ġ";
  var gdot = "ġ";
  var ge = "≥";
  var gE = "≧";
  var gEl = "⪌";
  var gel = "⋛";
  var geq = "≥";
  var geqq = "≧";
  var geqslant = "⩾";
  var gescc = "⪩";
  var ges = "⩾";
  var gesdot = "⪀";
  var gesdoto = "⪂";
  var gesdotol = "⪄";
  var gesl = "⋛︀";
  var gesles = "⪔";
  var Gfr = "𝔊";
  var gfr = "𝔤";
  var gg = "≫";
  var Gg = "⋙";
  var ggg = "⋙";
  var gimel = "ℷ";
  var GJcy = "Ѓ";
  var gjcy = "ѓ";
  var gla = "⪥";
  var gl = "≷";
  var glE = "⪒";
  var glj = "⪤";
  var gnap = "⪊";
  var gnapprox = "⪊";
  var gne = "⪈";
  var gnE = "≩";
  var gneq = "⪈";
  var gneqq = "≩";
  var gnsim = "⋧";
  var Gopf = "𝔾";
  var gopf = "𝕘";
  var grave = "`";
  var GreaterEqual = "≥";
  var GreaterEqualLess = "⋛";
  var GreaterFullEqual = "≧";
  var GreaterGreater = "⪢";
  var GreaterLess = "≷";
  var GreaterSlantEqual = "⩾";
  var GreaterTilde = "≳";
  var Gscr = "𝒢";
  var gscr = "ℊ";
  var gsim = "≳";
  var gsime = "⪎";
  var gsiml = "⪐";
  var gtcc = "⪧";
  var gtcir = "⩺";
  var gt = ">";
  var GT = ">";
  var Gt = "≫";
  var gtdot = "⋗";
  var gtlPar = "⦕";
  var gtquest = "⩼";
  var gtrapprox = "⪆";
  var gtrarr = "⥸";
  var gtrdot = "⋗";
  var gtreqless = "⋛";
  var gtreqqless = "⪌";
  var gtrless = "≷";
  var gtrsim = "≳";
  var gvertneqq = "≩︀";
  var gvnE = "≩︀";
  var Hacek = "ˇ";
  var hairsp = " ";
  var half = "½";
  var hamilt = "ℋ";
  var HARDcy = "Ъ";
  var hardcy = "ъ";
  var harrcir = "⥈";
  var harr = "↔";
  var hArr = "⇔";
  var harrw = "↭";
  var Hat = "^";
  var hbar = "ℏ";
  var Hcirc = "Ĥ";
  var hcirc = "ĥ";
  var hearts = "♥";
  var heartsuit = "♥";
  var hellip = "…";
  var hercon = "⊹";
  var hfr = "𝔥";
  var Hfr = "ℌ";
  var HilbertSpace = "ℋ";
  var hksearow = "⤥";
  var hkswarow = "⤦";
  var hoarr = "⇿";
  var homtht = "∻";
  var hookleftarrow = "↩";
  var hookrightarrow = "↪";
  var hopf = "𝕙";
  var Hopf = "ℍ";
  var horbar = "―";
  var HorizontalLine = "─";
  var hscr = "𝒽";
  var Hscr = "ℋ";
  var hslash = "ℏ";
  var Hstrok = "Ħ";
  var hstrok = "ħ";
  var HumpDownHump = "≎";
  var HumpEqual = "≏";
  var hybull = "⁃";
  var hyphen = "‐";
  var Iacute = "Í";
  var iacute = "í";
  var ic = "⁣";
  var Icirc = "Î";
  var icirc = "î";
  var Icy = "И";
  var icy = "и";
  var Idot = "İ";
  var IEcy = "Е";
  var iecy = "е";
  var iexcl = "¡";
  var iff = "⇔";
  var ifr = "𝔦";
  var Ifr = "ℑ";
  var Igrave = "Ì";
  var igrave = "ì";
  var ii = "ⅈ";
  var iiiint = "⨌";
  var iiint = "∭";
  var iinfin = "⧜";
  var iiota = "℩";
  var IJlig = "Ĳ";
  var ijlig = "ĳ";
  var Imacr = "Ī";
  var imacr = "ī";
  var image = "ℑ";
  var ImaginaryI = "ⅈ";
  var imagline = "ℐ";
  var imagpart = "ℑ";
  var imath = "ı";
  var Im = "ℑ";
  var imof = "⊷";
  var imped = "Ƶ";
  var Implies = "⇒";
  var incare = "℅";
  var infin = "∞";
  var infintie = "⧝";
  var inodot = "ı";
  var intcal = "⊺";
  var int = "∫";
  var Int = "∬";
  var integers = "ℤ";
  var Integral = "∫";
  var intercal = "⊺";
  var Intersection = "⋂";
  var intlarhk = "⨗";
  var intprod = "⨼";
  var InvisibleComma = "⁣";
  var InvisibleTimes = "⁢";
  var IOcy = "Ё";
  var iocy = "ё";
  var Iogon = "Į";
  var iogon = "į";
  var Iopf = "𝕀";
  var iopf = "𝕚";
  var Iota = "Ι";
  var iota = "ι";
  var iprod = "⨼";
  var iquest = "¿";
  var iscr = "𝒾";
  var Iscr = "ℐ";
  var isin = "∈";
  var isindot = "⋵";
  var isinE = "⋹";
  var isins = "⋴";
  var isinsv = "⋳";
  var isinv = "∈";
  var it = "⁢";
  var Itilde = "Ĩ";
  var itilde = "ĩ";
  var Iukcy = "І";
  var iukcy = "і";
  var Iuml = "Ï";
  var iuml = "ï";
  var Jcirc = "Ĵ";
  var jcirc = "ĵ";
  var Jcy = "Й";
  var jcy = "й";
  var Jfr = "𝔍";
  var jfr = "𝔧";
  var jmath = "ȷ";
  var Jopf = "𝕁";
  var jopf = "𝕛";
  var Jscr = "𝒥";
  var jscr = "𝒿";
  var Jsercy = "Ј";
  var jsercy = "ј";
  var Jukcy = "Є";
  var jukcy = "є";
  var Kappa = "Κ";
  var kappa = "κ";
  var kappav = "ϰ";
  var Kcedil = "Ķ";
  var kcedil = "ķ";
  var Kcy = "К";
  var kcy = "к";
  var Kfr = "𝔎";
  var kfr = "𝔨";
  var kgreen = "ĸ";
  var KHcy = "Х";
  var khcy = "х";
  var KJcy = "Ќ";
  var kjcy = "ќ";
  var Kopf = "𝕂";
  var kopf = "𝕜";
  var Kscr = "𝒦";
  var kscr = "𝓀";
  var lAarr = "⇚";
  var Lacute = "Ĺ";
  var lacute = "ĺ";
  var laemptyv = "⦴";
  var lagran = "ℒ";
  var Lambda = "Λ";
  var lambda = "λ";
  var lang = "⟨";
  var Lang = "⟪";
  var langd = "⦑";
  var langle = "⟨";
  var lap = "⪅";
  var Laplacetrf = "ℒ";
  var laquo = "«";
  var larrb = "⇤";
  var larrbfs = "⤟";
  var larr = "←";
  var Larr = "↞";
  var lArr = "⇐";
  var larrfs = "⤝";
  var larrhk = "↩";
  var larrlp = "↫";
  var larrpl = "⤹";
  var larrsim = "⥳";
  var larrtl = "↢";
  var latail = "⤙";
  var lAtail = "⤛";
  var lat = "⪫";
  var late = "⪭";
  var lates = "⪭︀";
  var lbarr = "⤌";
  var lBarr = "⤎";
  var lbbrk = "❲";
  var lbrace = "{";
  var lbrack = "[";
  var lbrke = "⦋";
  var lbrksld = "⦏";
  var lbrkslu = "⦍";
  var Lcaron = "Ľ";
  var lcaron = "ľ";
  var Lcedil = "Ļ";
  var lcedil = "ļ";
  var lceil = "⌈";
  var lcub = "{";
  var Lcy = "Л";
  var lcy = "л";
  var ldca = "⤶";
  var ldquo = "“";
  var ldquor = "„";
  var ldrdhar = "⥧";
  var ldrushar = "⥋";
  var ldsh = "↲";
  var le = "≤";
  var lE = "≦";
  var LeftAngleBracket = "⟨";
  var LeftArrowBar = "⇤";
  var leftarrow = "←";
  var LeftArrow = "←";
  var Leftarrow = "⇐";
  var LeftArrowRightArrow = "⇆";
  var leftarrowtail = "↢";
  var LeftCeiling = "⌈";
  var LeftDoubleBracket = "⟦";
  var LeftDownTeeVector = "⥡";
  var LeftDownVectorBar = "⥙";
  var LeftDownVector = "⇃";
  var LeftFloor = "⌊";
  var leftharpoondown = "↽";
  var leftharpoonup = "↼";
  var leftleftarrows = "⇇";
  var leftrightarrow = "↔";
  var LeftRightArrow = "↔";
  var Leftrightarrow = "⇔";
  var leftrightarrows = "⇆";
  var leftrightharpoons = "⇋";
  var leftrightsquigarrow = "↭";
  var LeftRightVector = "⥎";
  var LeftTeeArrow = "↤";
  var LeftTee = "⊣";
  var LeftTeeVector = "⥚";
  var leftthreetimes = "⋋";
  var LeftTriangleBar = "⧏";
  var LeftTriangle = "⊲";
  var LeftTriangleEqual = "⊴";
  var LeftUpDownVector = "⥑";
  var LeftUpTeeVector = "⥠";
  var LeftUpVectorBar = "⥘";
  var LeftUpVector = "↿";
  var LeftVectorBar = "⥒";
  var LeftVector = "↼";
  var lEg = "⪋";
  var leg = "⋚";
  var leq = "≤";
  var leqq = "≦";
  var leqslant = "⩽";
  var lescc = "⪨";
  var les = "⩽";
  var lesdot = "⩿";
  var lesdoto = "⪁";
  var lesdotor = "⪃";
  var lesg = "⋚︀";
  var lesges = "⪓";
  var lessapprox = "⪅";
  var lessdot = "⋖";
  var lesseqgtr = "⋚";
  var lesseqqgtr = "⪋";
  var LessEqualGreater = "⋚";
  var LessFullEqual = "≦";
  var LessGreater = "≶";
  var lessgtr = "≶";
  var LessLess = "⪡";
  var lesssim = "≲";
  var LessSlantEqual = "⩽";
  var LessTilde = "≲";
  var lfisht = "⥼";
  var lfloor = "⌊";
  var Lfr = "𝔏";
  var lfr = "𝔩";
  var lg = "≶";
  var lgE = "⪑";
  var lHar = "⥢";
  var lhard = "↽";
  var lharu = "↼";
  var lharul = "⥪";
  var lhblk = "▄";
  var LJcy = "Љ";
  var ljcy = "љ";
  var llarr = "⇇";
  var ll = "≪";
  var Ll = "⋘";
  var llcorner = "⌞";
  var Lleftarrow = "⇚";
  var llhard = "⥫";
  var lltri = "◺";
  var Lmidot = "Ŀ";
  var lmidot = "ŀ";
  var lmoustache = "⎰";
  var lmoust = "⎰";
  var lnap = "⪉";
  var lnapprox = "⪉";
  var lne = "⪇";
  var lnE = "≨";
  var lneq = "⪇";
  var lneqq = "≨";
  var lnsim = "⋦";
  var loang = "⟬";
  var loarr = "⇽";
  var lobrk = "⟦";
  var longleftarrow = "⟵";
  var LongLeftArrow = "⟵";
  var Longleftarrow = "⟸";
  var longleftrightarrow = "⟷";
  var LongLeftRightArrow = "⟷";
  var Longleftrightarrow = "⟺";
  var longmapsto = "⟼";
  var longrightarrow = "⟶";
  var LongRightArrow = "⟶";
  var Longrightarrow = "⟹";
  var looparrowleft = "↫";
  var looparrowright = "↬";
  var lopar = "⦅";
  var Lopf = "𝕃";
  var lopf = "𝕝";
  var loplus = "⨭";
  var lotimes = "⨴";
  var lowast = "∗";
  var lowbar = "_";
  var LowerLeftArrow = "↙";
  var LowerRightArrow = "↘";
  var loz = "◊";
  var lozenge = "◊";
  var lozf = "⧫";
  var lpar = "(";
  var lparlt = "⦓";
  var lrarr = "⇆";
  var lrcorner = "⌟";
  var lrhar = "⇋";
  var lrhard = "⥭";
  var lrm = "‎";
  var lrtri = "⊿";
  var lsaquo = "‹";
  var lscr = "𝓁";
  var Lscr = "ℒ";
  var lsh = "↰";
  var Lsh = "↰";
  var lsim = "≲";
  var lsime = "⪍";
  var lsimg = "⪏";
  var lsqb = "[";
  var lsquo = "‘";
  var lsquor = "‚";
  var Lstrok = "Ł";
  var lstrok = "ł";
  var ltcc = "⪦";
  var ltcir = "⩹";
  var lt = "<";
  var LT = "<";
  var Lt = "≪";
  var ltdot = "⋖";
  var lthree = "⋋";
  var ltimes = "⋉";
  var ltlarr = "⥶";
  var ltquest = "⩻";
  var ltri = "◃";
  var ltrie = "⊴";
  var ltrif = "◂";
  var ltrPar = "⦖";
  var lurdshar = "⥊";
  var luruhar = "⥦";
  var lvertneqq = "≨︀";
  var lvnE = "≨︀";
  var macr = "¯";
  var male = "♂";
  var malt = "✠";
  var maltese = "✠";
  var map = "↦";
  var mapsto = "↦";
  var mapstodown = "↧";
  var mapstoleft = "↤";
  var mapstoup = "↥";
  var marker = "▮";
  var mcomma = "⨩";
  var Mcy = "М";
  var mcy = "м";
  var mdash = "—";
  var mDDot = "∺";
  var measuredangle = "∡";
  var MediumSpace = " ";
  var Mellintrf = "ℳ";
  var Mfr = "𝔐";
  var mfr = "𝔪";
  var mho = "℧";
  var micro = "µ";
  var midast = "*";
  var midcir = "⫰";
  var mid = "∣";
  var middot = "·";
  var minusb = "⊟";
  var minus = "−";
  var minusd = "∸";
  var minusdu = "⨪";
  var MinusPlus = "∓";
  var mlcp = "⫛";
  var mldr = "…";
  var mnplus = "∓";
  var models = "⊧";
  var Mopf = "𝕄";
  var mopf = "𝕞";
  var mp = "∓";
  var mscr = "𝓂";
  var Mscr = "ℳ";
  var mstpos = "∾";
  var Mu = "Μ";
  var mu = "μ";
  var multimap = "⊸";
  var mumap = "⊸";
  var nabla = "∇";
  var Nacute = "Ń";
  var nacute = "ń";
  var nang = "∠⃒";
  var nap = "≉";
  var napE = "⩰̸";
  var napid = "≋̸";
  var napos = "ŉ";
  var napprox = "≉";
  var natural = "♮";
  var naturals = "ℕ";
  var natur = "♮";
  var nbsp = " ";
  var nbump = "≎̸";
  var nbumpe = "≏̸";
  var ncap = "⩃";
  var Ncaron = "Ň";
  var ncaron = "ň";
  var Ncedil = "Ņ";
  var ncedil = "ņ";
  var ncong = "≇";
  var ncongdot = "⩭̸";
  var ncup = "⩂";
  var Ncy = "Н";
  var ncy = "н";
  var ndash = "–";
  var nearhk = "⤤";
  var nearr = "↗";
  var neArr = "⇗";
  var nearrow = "↗";
  var ne = "≠";
  var nedot = "≐̸";
  var NegativeMediumSpace = "​";
  var NegativeThickSpace = "​";
  var NegativeThinSpace = "​";
  var NegativeVeryThinSpace = "​";
  var nequiv = "≢";
  var nesear = "⤨";
  var nesim = "≂̸";
  var NestedGreaterGreater = "≫";
  var NestedLessLess = "≪";
  var NewLine = "\n";
  var nexist = "∄";
  var nexists = "∄";
  var Nfr = "𝔑";
  var nfr = "𝔫";
  var ngE = "≧̸";
  var nge = "≱";
  var ngeq = "≱";
  var ngeqq = "≧̸";
  var ngeqslant = "⩾̸";
  var nges = "⩾̸";
  var nGg = "⋙̸";
  var ngsim = "≵";
  var nGt = "≫⃒";
  var ngt = "≯";
  var ngtr = "≯";
  var nGtv = "≫̸";
  var nharr = "↮";
  var nhArr = "⇎";
  var nhpar = "⫲";
  var ni = "∋";
  var nis = "⋼";
  var nisd = "⋺";
  var niv = "∋";
  var NJcy = "Њ";
  var njcy = "њ";
  var nlarr = "↚";
  var nlArr = "⇍";
  var nldr = "‥";
  var nlE = "≦̸";
  var nle = "≰";
  var nleftarrow = "↚";
  var nLeftarrow = "⇍";
  var nleftrightarrow = "↮";
  var nLeftrightarrow = "⇎";
  var nleq = "≰";
  var nleqq = "≦̸";
  var nleqslant = "⩽̸";
  var nles = "⩽̸";
  var nless = "≮";
  var nLl = "⋘̸";
  var nlsim = "≴";
  var nLt = "≪⃒";
  var nlt = "≮";
  var nltri = "⋪";
  var nltrie = "⋬";
  var nLtv = "≪̸";
  var nmid = "∤";
  var NoBreak = "⁠";
  var NonBreakingSpace = " ";
  var nopf = "𝕟";
  var Nopf = "ℕ";
  var Not = "⫬";
  var not = "¬";
  var NotCongruent = "≢";
  var NotCupCap = "≭";
  var NotDoubleVerticalBar = "∦";
  var NotElement = "∉";
  var NotEqual = "≠";
  var NotEqualTilde = "≂̸";
  var NotExists = "∄";
  var NotGreater = "≯";
  var NotGreaterEqual = "≱";
  var NotGreaterFullEqual = "≧̸";
  var NotGreaterGreater = "≫̸";
  var NotGreaterLess = "≹";
  var NotGreaterSlantEqual = "⩾̸";
  var NotGreaterTilde = "≵";
  var NotHumpDownHump = "≎̸";
  var NotHumpEqual = "≏̸";
  var notin = "∉";
  var notindot = "⋵̸";
  var notinE = "⋹̸";
  var notinva = "∉";
  var notinvb = "⋷";
  var notinvc = "⋶";
  var NotLeftTriangleBar = "⧏̸";
  var NotLeftTriangle = "⋪";
  var NotLeftTriangleEqual = "⋬";
  var NotLess = "≮";
  var NotLessEqual = "≰";
  var NotLessGreater = "≸";
  var NotLessLess = "≪̸";
  var NotLessSlantEqual = "⩽̸";
  var NotLessTilde = "≴";
  var NotNestedGreaterGreater = "⪢̸";
  var NotNestedLessLess = "⪡̸";
  var notni = "∌";
  var notniva = "∌";
  var notnivb = "⋾";
  var notnivc = "⋽";
  var NotPrecedes = "⊀";
  var NotPrecedesEqual = "⪯̸";
  var NotPrecedesSlantEqual = "⋠";
  var NotReverseElement = "∌";
  var NotRightTriangleBar = "⧐̸";
  var NotRightTriangle = "⋫";
  var NotRightTriangleEqual = "⋭";
  var NotSquareSubset = "⊏̸";
  var NotSquareSubsetEqual = "⋢";
  var NotSquareSuperset = "⊐̸";
  var NotSquareSupersetEqual = "⋣";
  var NotSubset = "⊂⃒";
  var NotSubsetEqual = "⊈";
  var NotSucceeds = "⊁";
  var NotSucceedsEqual = "⪰̸";
  var NotSucceedsSlantEqual = "⋡";
  var NotSucceedsTilde = "≿̸";
  var NotSuperset = "⊃⃒";
  var NotSupersetEqual = "⊉";
  var NotTilde = "≁";
  var NotTildeEqual = "≄";
  var NotTildeFullEqual = "≇";
  var NotTildeTilde = "≉";
  var NotVerticalBar = "∤";
  var nparallel = "∦";
  var npar = "∦";
  var nparsl = "⫽⃥";
  var npart = "∂̸";
  var npolint = "⨔";
  var npr = "⊀";
  var nprcue = "⋠";
  var nprec = "⊀";
  var npreceq = "⪯̸";
  var npre = "⪯̸";
  var nrarrc = "⤳̸";
  var nrarr = "↛";
  var nrArr = "⇏";
  var nrarrw = "↝̸";
  var nrightarrow = "↛";
  var nRightarrow = "⇏";
  var nrtri = "⋫";
  var nrtrie = "⋭";
  var nsc = "⊁";
  var nsccue = "⋡";
  var nsce = "⪰̸";
  var Nscr = "𝒩";
  var nscr = "𝓃";
  var nshortmid = "∤";
  var nshortparallel = "∦";
  var nsim = "≁";
  var nsime = "≄";
  var nsimeq = "≄";
  var nsmid = "∤";
  var nspar = "∦";
  var nsqsube = "⋢";
  var nsqsupe = "⋣";
  var nsub = "⊄";
  var nsubE = "⫅̸";
  var nsube = "⊈";
  var nsubset = "⊂⃒";
  var nsubseteq = "⊈";
  var nsubseteqq = "⫅̸";
  var nsucc = "⊁";
  var nsucceq = "⪰̸";
  var nsup = "⊅";
  var nsupE = "⫆̸";
  var nsupe = "⊉";
  var nsupset = "⊃⃒";
  var nsupseteq = "⊉";
  var nsupseteqq = "⫆̸";
  var ntgl = "≹";
  var Ntilde = "Ñ";
  var ntilde = "ñ";
  var ntlg = "≸";
  var ntriangleleft = "⋪";
  var ntrianglelefteq = "⋬";
  var ntriangleright = "⋫";
  var ntrianglerighteq = "⋭";
  var Nu = "Ν";
  var nu = "ν";
  var num = "#";
  var numero = "№";
  var numsp = " ";
  var nvap = "≍⃒";
  var nvdash = "⊬";
  var nvDash = "⊭";
  var nVdash = "⊮";
  var nVDash = "⊯";
  var nvge = "≥⃒";
  var nvgt = ">⃒";
  var nvHarr = "⤄";
  var nvinfin = "⧞";
  var nvlArr = "⤂";
  var nvle = "≤⃒";
  var nvlt = "<⃒";
  var nvltrie = "⊴⃒";
  var nvrArr = "⤃";
  var nvrtrie = "⊵⃒";
  var nvsim = "∼⃒";
  var nwarhk = "⤣";
  var nwarr = "↖";
  var nwArr = "⇖";
  var nwarrow = "↖";
  var nwnear = "⤧";
  var Oacute = "Ó";
  var oacute = "ó";
  var oast = "⊛";
  var Ocirc = "Ô";
  var ocirc = "ô";
  var ocir = "⊚";
  var Ocy = "О";
  var ocy = "о";
  var odash = "⊝";
  var Odblac = "Ő";
  var odblac = "ő";
  var odiv = "⨸";
  var odot = "⊙";
  var odsold = "⦼";
  var OElig = "Œ";
  var oelig = "œ";
  var ofcir = "⦿";
  var Ofr = "𝔒";
  var ofr = "𝔬";
  var ogon = "˛";
  var Ograve = "Ò";
  var ograve = "ò";
  var ogt = "⧁";
  var ohbar = "⦵";
  var ohm = "Ω";
  var oint = "∮";
  var olarr = "↺";
  var olcir = "⦾";
  var olcross = "⦻";
  var oline = "‾";
  var olt = "⧀";
  var Omacr = "Ō";
  var omacr = "ō";
  var Omega = "Ω";
  var omega = "ω";
  var Omicron = "Ο";
  var omicron = "ο";
  var omid = "⦶";
  var ominus = "⊖";
  var Oopf = "𝕆";
  var oopf = "𝕠";
  var opar = "⦷";
  var OpenCurlyDoubleQuote = "“";
  var OpenCurlyQuote = "‘";
  var operp = "⦹";
  var oplus = "⊕";
  var orarr = "↻";
  var Or = "⩔";
  var or = "∨";
  var ord = "⩝";
  var order = "ℴ";
  var orderof = "ℴ";
  var ordf = "ª";
  var ordm = "º";
  var origof = "⊶";
  var oror = "⩖";
  var orslope = "⩗";
  var orv = "⩛";
  var oS = "Ⓢ";
  var Oscr = "𝒪";
  var oscr = "ℴ";
  var Oslash = "Ø";
  var oslash = "ø";
  var osol = "⊘";
  var Otilde = "Õ";
  var otilde = "õ";
  var otimesas = "⨶";
  var Otimes = "⨷";
  var otimes = "⊗";
  var Ouml = "Ö";
  var ouml = "ö";
  var ovbar = "⌽";
  var OverBar = "‾";
  var OverBrace = "⏞";
  var OverBracket = "⎴";
  var OverParenthesis = "⏜";
  var para = "¶";
  var parallel = "∥";
  var par = "∥";
  var parsim = "⫳";
  var parsl = "⫽";
  var part = "∂";
  var PartialD = "∂";
  var Pcy = "П";
  var pcy = "п";
  var percnt = "%";
  var period = ".";
  var permil = "‰";
  var perp = "⊥";
  var pertenk = "‱";
  var Pfr = "𝔓";
  var pfr = "𝔭";
  var Phi = "Φ";
  var phi = "φ";
  var phiv = "ϕ";
  var phmmat = "ℳ";
  var phone = "☎";
  var Pi = "Π";
  var pi = "π";
  var pitchfork = "⋔";
  var piv = "ϖ";
  var planck = "ℏ";
  var planckh = "ℎ";
  var plankv = "ℏ";
  var plusacir = "⨣";
  var plusb = "⊞";
  var pluscir = "⨢";
  var plus = "+";
  var plusdo = "∔";
  var plusdu = "⨥";
  var pluse = "⩲";
  var PlusMinus = "±";
  var plusmn = "±";
  var plussim = "⨦";
  var plustwo = "⨧";
  var pm = "±";
  var Poincareplane = "ℌ";
  var pointint = "⨕";
  var popf = "𝕡";
  var Popf = "ℙ";
  var pound = "£";
  var prap = "⪷";
  var Pr = "⪻";
  var pr = "≺";
  var prcue = "≼";
  var precapprox = "⪷";
  var prec = "≺";
  var preccurlyeq = "≼";
  var Precedes = "≺";
  var PrecedesEqual = "⪯";
  var PrecedesSlantEqual = "≼";
  var PrecedesTilde = "≾";
  var preceq = "⪯";
  var precnapprox = "⪹";
  var precneqq = "⪵";
  var precnsim = "⋨";
  var pre = "⪯";
  var prE = "⪳";
  var precsim = "≾";
  var prime = "′";
  var Prime = "″";
  var primes = "ℙ";
  var prnap = "⪹";
  var prnE = "⪵";
  var prnsim = "⋨";
  var prod = "∏";
  var Product = "∏";
  var profalar = "⌮";
  var profline = "⌒";
  var profsurf = "⌓";
  var prop = "∝";
  var Proportional = "∝";
  var Proportion = "∷";
  var propto = "∝";
  var prsim = "≾";
  var prurel = "⊰";
  var Pscr = "𝒫";
  var pscr = "𝓅";
  var Psi = "Ψ";
  var psi = "ψ";
  var puncsp = " ";
  var Qfr = "𝔔";
  var qfr = "𝔮";
  var qint = "⨌";
  var qopf = "𝕢";
  var Qopf = "ℚ";
  var qprime = "⁗";
  var Qscr = "𝒬";
  var qscr = "𝓆";
  var quaternions = "ℍ";
  var quatint = "⨖";
  var quest = "?";
  var questeq = "≟";
  var quot = "\"";
  var QUOT = "\"";
  var rAarr = "⇛";
  var race = "∽̱";
  var Racute = "Ŕ";
  var racute = "ŕ";
  var radic = "√";
  var raemptyv = "⦳";
  var rang = "⟩";
  var Rang = "⟫";
  var rangd = "⦒";
  var range = "⦥";
  var rangle = "⟩";
  var raquo = "»";
  var rarrap = "⥵";
  var rarrb = "⇥";
  var rarrbfs = "⤠";
  var rarrc = "⤳";
  var rarr = "→";
  var Rarr = "↠";
  var rArr = "⇒";
  var rarrfs = "⤞";
  var rarrhk = "↪";
  var rarrlp = "↬";
  var rarrpl = "⥅";
  var rarrsim = "⥴";
  var Rarrtl = "⤖";
  var rarrtl = "↣";
  var rarrw = "↝";
  var ratail = "⤚";
  var rAtail = "⤜";
  var ratio = "∶";
  var rationals = "ℚ";
  var rbarr = "⤍";
  var rBarr = "⤏";
  var RBarr = "⤐";
  var rbbrk = "❳";
  var rbrace = "}";
  var rbrack = "]";
  var rbrke = "⦌";
  var rbrksld = "⦎";
  var rbrkslu = "⦐";
  var Rcaron = "Ř";
  var rcaron = "ř";
  var Rcedil = "Ŗ";
  var rcedil = "ŗ";
  var rceil = "⌉";
  var rcub = "}";
  var Rcy = "Р";
  var rcy = "р";
  var rdca = "⤷";
  var rdldhar = "⥩";
  var rdquo = "”";
  var rdquor = "”";
  var rdsh = "↳";
  var real = "ℜ";
  var realine = "ℛ";
  var realpart = "ℜ";
  var reals = "ℝ";
  var Re = "ℜ";
  var rect = "▭";
  var reg = "®";
  var REG = "®";
  var ReverseElement = "∋";
  var ReverseEquilibrium = "⇋";
  var ReverseUpEquilibrium = "⥯";
  var rfisht = "⥽";
  var rfloor = "⌋";
  var rfr = "𝔯";
  var Rfr = "ℜ";
  var rHar = "⥤";
  var rhard = "⇁";
  var rharu = "⇀";
  var rharul = "⥬";
  var Rho = "Ρ";
  var rho = "ρ";
  var rhov = "ϱ";
  var RightAngleBracket = "⟩";
  var RightArrowBar = "⇥";
  var rightarrow = "→";
  var RightArrow = "→";
  var Rightarrow = "⇒";
  var RightArrowLeftArrow = "⇄";
  var rightarrowtail = "↣";
  var RightCeiling = "⌉";
  var RightDoubleBracket = "⟧";
  var RightDownTeeVector = "⥝";
  var RightDownVectorBar = "⥕";
  var RightDownVector = "⇂";
  var RightFloor = "⌋";
  var rightharpoondown = "⇁";
  var rightharpoonup = "⇀";
  var rightleftarrows = "⇄";
  var rightleftharpoons = "⇌";
  var rightrightarrows = "⇉";
  var rightsquigarrow = "↝";
  var RightTeeArrow = "↦";
  var RightTee = "⊢";
  var RightTeeVector = "⥛";
  var rightthreetimes = "⋌";
  var RightTriangleBar = "⧐";
  var RightTriangle = "⊳";
  var RightTriangleEqual = "⊵";
  var RightUpDownVector = "⥏";
  var RightUpTeeVector = "⥜";
  var RightUpVectorBar = "⥔";
  var RightUpVector = "↾";
  var RightVectorBar = "⥓";
  var RightVector = "⇀";
  var ring = "˚";
  var risingdotseq = "≓";
  var rlarr = "⇄";
  var rlhar = "⇌";
  var rlm = "‏";
  var rmoustache = "⎱";
  var rmoust = "⎱";
  var rnmid = "⫮";
  var roang = "⟭";
  var roarr = "⇾";
  var robrk = "⟧";
  var ropar = "⦆";
  var ropf = "𝕣";
  var Ropf = "ℝ";
  var roplus = "⨮";
  var rotimes = "⨵";
  var RoundImplies = "⥰";
  var rpar = ")";
  var rpargt = "⦔";
  var rppolint = "⨒";
  var rrarr = "⇉";
  var Rrightarrow = "⇛";
  var rsaquo = "›";
  var rscr = "𝓇";
  var Rscr = "ℛ";
  var rsh = "↱";
  var Rsh = "↱";
  var rsqb = "]";
  var rsquo = "’";
  var rsquor = "’";
  var rthree = "⋌";
  var rtimes = "⋊";
  var rtri = "▹";
  var rtrie = "⊵";
  var rtrif = "▸";
  var rtriltri = "⧎";
  var RuleDelayed = "⧴";
  var ruluhar = "⥨";
  var rx = "℞";
  var Sacute = "Ś";
  var sacute = "ś";
  var sbquo = "‚";
  var scap = "⪸";
  var Scaron = "Š";
  var scaron = "š";
  var Sc = "⪼";
  var sc = "≻";
  var sccue = "≽";
  var sce = "⪰";
  var scE = "⪴";
  var Scedil = "Ş";
  var scedil = "ş";
  var Scirc = "Ŝ";
  var scirc = "ŝ";
  var scnap = "⪺";
  var scnE = "⪶";
  var scnsim = "⋩";
  var scpolint = "⨓";
  var scsim = "≿";
  var Scy = "С";
  var scy = "с";
  var sdotb = "⊡";
  var sdot = "⋅";
  var sdote = "⩦";
  var searhk = "⤥";
  var searr = "↘";
  var seArr = "⇘";
  var searrow = "↘";
  var sect = "§";
  var semi = ";";
  var seswar = "⤩";
  var setminus = "∖";
  var setmn = "∖";
  var sext = "✶";
  var Sfr = "𝔖";
  var sfr = "𝔰";
  var sfrown = "⌢";
  var sharp = "♯";
  var SHCHcy = "Щ";
  var shchcy = "щ";
  var SHcy = "Ш";
  var shcy = "ш";
  var ShortDownArrow = "↓";
  var ShortLeftArrow = "←";
  var shortmid = "∣";
  var shortparallel = "∥";
  var ShortRightArrow = "→";
  var ShortUpArrow = "↑";
  var shy = "­";
  var Sigma = "Σ";
  var sigma = "σ";
  var sigmaf = "ς";
  var sigmav = "ς";
  var sim = "∼";
  var simdot = "⩪";
  var sime = "≃";
  var simeq = "≃";
  var simg = "⪞";
  var simgE = "⪠";
  var siml = "⪝";
  var simlE = "⪟";
  var simne = "≆";
  var simplus = "⨤";
  var simrarr = "⥲";
  var slarr = "←";
  var SmallCircle = "∘";
  var smallsetminus = "∖";
  var smashp = "⨳";
  var smeparsl = "⧤";
  var smid = "∣";
  var smile = "⌣";
  var smt = "⪪";
  var smte = "⪬";
  var smtes = "⪬︀";
  var SOFTcy = "Ь";
  var softcy = "ь";
  var solbar = "⌿";
  var solb = "⧄";
  var sol = "/";
  var Sopf = "𝕊";
  var sopf = "𝕤";
  var spades = "♠";
  var spadesuit = "♠";
  var spar = "∥";
  var sqcap = "⊓";
  var sqcaps = "⊓︀";
  var sqcup = "⊔";
  var sqcups = "⊔︀";
  var Sqrt = "√";
  var sqsub = "⊏";
  var sqsube = "⊑";
  var sqsubset = "⊏";
  var sqsubseteq = "⊑";
  var sqsup = "⊐";
  var sqsupe = "⊒";
  var sqsupset = "⊐";
  var sqsupseteq = "⊒";
  var square = "□";
  var Square = "□";
  var SquareIntersection = "⊓";
  var SquareSubset = "⊏";
  var SquareSubsetEqual = "⊑";
  var SquareSuperset = "⊐";
  var SquareSupersetEqual = "⊒";
  var SquareUnion = "⊔";
  var squarf = "▪";
  var squ = "□";
  var squf = "▪";
  var srarr = "→";
  var Sscr = "𝒮";
  var sscr = "𝓈";
  var ssetmn = "∖";
  var ssmile = "⌣";
  var sstarf = "⋆";
  var Star = "⋆";
  var star = "☆";
  var starf = "★";
  var straightepsilon = "ϵ";
  var straightphi = "ϕ";
  var strns = "¯";
  var sub = "⊂";
  var Sub = "⋐";
  var subdot = "⪽";
  var subE = "⫅";
  var sube = "⊆";
  var subedot = "⫃";
  var submult = "⫁";
  var subnE = "⫋";
  var subne = "⊊";
  var subplus = "⪿";
  var subrarr = "⥹";
  var subset = "⊂";
  var Subset = "⋐";
  var subseteq = "⊆";
  var subseteqq = "⫅";
  var SubsetEqual = "⊆";
  var subsetneq = "⊊";
  var subsetneqq = "⫋";
  var subsim = "⫇";
  var subsub = "⫕";
  var subsup = "⫓";
  var succapprox = "⪸";
  var succ = "≻";
  var succcurlyeq = "≽";
  var Succeeds = "≻";
  var SucceedsEqual = "⪰";
  var SucceedsSlantEqual = "≽";
  var SucceedsTilde = "≿";
  var succeq = "⪰";
  var succnapprox = "⪺";
  var succneqq = "⪶";
  var succnsim = "⋩";
  var succsim = "≿";
  var SuchThat = "∋";
  var sum = "∑";
  var Sum = "∑";
  var sung = "♪";
  var sup1 = "¹";
  var sup2 = "²";
  var sup3 = "³";
  var sup = "⊃";
  var Sup = "⋑";
  var supdot = "⪾";
  var supdsub = "⫘";
  var supE = "⫆";
  var supe = "⊇";
  var supedot = "⫄";
  var Superset = "⊃";
  var SupersetEqual = "⊇";
  var suphsol = "⟉";
  var suphsub = "⫗";
  var suplarr = "⥻";
  var supmult = "⫂";
  var supnE = "⫌";
  var supne = "⊋";
  var supplus = "⫀";
  var supset = "⊃";
  var Supset = "⋑";
  var supseteq = "⊇";
  var supseteqq = "⫆";
  var supsetneq = "⊋";
  var supsetneqq = "⫌";
  var supsim = "⫈";
  var supsub = "⫔";
  var supsup = "⫖";
  var swarhk = "⤦";
  var swarr = "↙";
  var swArr = "⇙";
  var swarrow = "↙";
  var swnwar = "⤪";
  var szlig = "ß";
  var Tab = "\t";
  var target = "⌖";
  var Tau = "Τ";
  var tau = "τ";
  var tbrk = "⎴";
  var Tcaron = "Ť";
  var tcaron = "ť";
  var Tcedil = "Ţ";
  var tcedil = "ţ";
  var Tcy = "Т";
  var tcy = "т";
  var tdot = "⃛";
  var telrec = "⌕";
  var Tfr = "𝔗";
  var tfr = "𝔱";
  var there4 = "∴";
  var therefore = "∴";
  var Therefore = "∴";
  var Theta = "Θ";
  var theta = "θ";
  var thetasym = "ϑ";
  var thetav = "ϑ";
  var thickapprox = "≈";
  var thicksim = "∼";
  var ThickSpace = "  ";
  var ThinSpace = " ";
  var thinsp = " ";
  var thkap = "≈";
  var thksim = "∼";
  var THORN = "Þ";
  var thorn = "þ";
  var tilde = "˜";
  var Tilde = "∼";
  var TildeEqual = "≃";
  var TildeFullEqual = "≅";
  var TildeTilde = "≈";
  var timesbar = "⨱";
  var timesb = "⊠";
  var times = "×";
  var timesd = "⨰";
  var tint = "∭";
  var toea = "⤨";
  var topbot = "⌶";
  var topcir = "⫱";
  var top = "⊤";
  var Topf = "𝕋";
  var topf = "𝕥";
  var topfork = "⫚";
  var tosa = "⤩";
  var tprime = "‴";
  var trade = "™";
  var TRADE = "™";
  var triangle = "▵";
  var triangledown = "▿";
  var triangleleft = "◃";
  var trianglelefteq = "⊴";
  var triangleq = "≜";
  var triangleright = "▹";
  var trianglerighteq = "⊵";
  var tridot = "◬";
  var trie = "≜";
  var triminus = "⨺";
  var TripleDot = "⃛";
  var triplus = "⨹";
  var trisb = "⧍";
  var tritime = "⨻";
  var trpezium = "⏢";
  var Tscr = "𝒯";
  var tscr = "𝓉";
  var TScy = "Ц";
  var tscy = "ц";
  var TSHcy = "Ћ";
  var tshcy = "ћ";
  var Tstrok = "Ŧ";
  var tstrok = "ŧ";
  var twixt = "≬";
  var twoheadleftarrow = "↞";
  var twoheadrightarrow = "↠";
  var Uacute = "Ú";
  var uacute = "ú";
  var uarr = "↑";
  var Uarr = "↟";
  var uArr = "⇑";
  var Uarrocir = "⥉";
  var Ubrcy = "Ў";
  var ubrcy = "ў";
  var Ubreve = "Ŭ";
  var ubreve = "ŭ";
  var Ucirc = "Û";
  var ucirc = "û";
  var Ucy = "У";
  var ucy = "у";
  var udarr = "⇅";
  var Udblac = "Ű";
  var udblac = "ű";
  var udhar = "⥮";
  var ufisht = "⥾";
  var Ufr = "𝔘";
  var ufr = "𝔲";
  var Ugrave = "Ù";
  var ugrave = "ù";
  var uHar = "⥣";
  var uharl = "↿";
  var uharr = "↾";
  var uhblk = "▀";
  var ulcorn = "⌜";
  var ulcorner = "⌜";
  var ulcrop = "⌏";
  var ultri = "◸";
  var Umacr = "Ū";
  var umacr = "ū";
  var uml = "¨";
  var UnderBar = "_";
  var UnderBrace = "⏟";
  var UnderBracket = "⎵";
  var UnderParenthesis = "⏝";
  var Union = "⋃";
  var UnionPlus = "⊎";
  var Uogon = "Ų";
  var uogon = "ų";
  var Uopf = "𝕌";
  var uopf = "𝕦";
  var UpArrowBar = "⤒";
  var uparrow = "↑";
  var UpArrow = "↑";
  var Uparrow = "⇑";
  var UpArrowDownArrow = "⇅";
  var updownarrow = "↕";
  var UpDownArrow = "↕";
  var Updownarrow = "⇕";
  var UpEquilibrium = "⥮";
  var upharpoonleft = "↿";
  var upharpoonright = "↾";
  var uplus = "⊎";
  var UpperLeftArrow = "↖";
  var UpperRightArrow = "↗";
  var upsi = "υ";
  var Upsi = "ϒ";
  var upsih = "ϒ";
  var Upsilon = "Υ";
  var upsilon = "υ";
  var UpTeeArrow = "↥";
  var UpTee = "⊥";
  var upuparrows = "⇈";
  var urcorn = "⌝";
  var urcorner = "⌝";
  var urcrop = "⌎";
  var Uring = "Ů";
  var uring = "ů";
  var urtri = "◹";
  var Uscr = "𝒰";
  var uscr = "𝓊";
  var utdot = "⋰";
  var Utilde = "Ũ";
  var utilde = "ũ";
  var utri = "▵";
  var utrif = "▴";
  var uuarr = "⇈";
  var Uuml = "Ü";
  var uuml = "ü";
  var uwangle = "⦧";
  var vangrt = "⦜";
  var varepsilon = "ϵ";
  var varkappa = "ϰ";
  var varnothing = "∅";
  var varphi = "ϕ";
  var varpi = "ϖ";
  var varpropto = "∝";
  var varr = "↕";
  var vArr = "⇕";
  var varrho = "ϱ";
  var varsigma = "ς";
  var varsubsetneq = "⊊︀";
  var varsubsetneqq = "⫋︀";
  var varsupsetneq = "⊋︀";
  var varsupsetneqq = "⫌︀";
  var vartheta = "ϑ";
  var vartriangleleft = "⊲";
  var vartriangleright = "⊳";
  var vBar = "⫨";
  var Vbar = "⫫";
  var vBarv = "⫩";
  var Vcy = "В";
  var vcy = "в";
  var vdash = "⊢";
  var vDash = "⊨";
  var Vdash = "⊩";
  var VDash = "⊫";
  var Vdashl = "⫦";
  var veebar = "⊻";
  var vee = "∨";
  var Vee = "⋁";
  var veeeq = "≚";
  var vellip = "⋮";
  var verbar = "|";
  var Verbar = "‖";
  var vert = "|";
  var Vert = "‖";
  var VerticalBar = "∣";
  var VerticalLine = "|";
  var VerticalSeparator = "❘";
  var VerticalTilde = "≀";
  var VeryThinSpace = " ";
  var Vfr = "𝔙";
  var vfr = "𝔳";
  var vltri = "⊲";
  var vnsub = "⊂⃒";
  var vnsup = "⊃⃒";
  var Vopf = "𝕍";
  var vopf = "𝕧";
  var vprop = "∝";
  var vrtri = "⊳";
  var Vscr = "𝒱";
  var vscr = "𝓋";
  var vsubnE = "⫋︀";
  var vsubne = "⊊︀";
  var vsupnE = "⫌︀";
  var vsupne = "⊋︀";
  var Vvdash = "⊪";
  var vzigzag = "⦚";
  var Wcirc = "Ŵ";
  var wcirc = "ŵ";
  var wedbar = "⩟";
  var wedge = "∧";
  var Wedge = "⋀";
  var wedgeq = "≙";
  var weierp = "℘";
  var Wfr = "𝔚";
  var wfr = "𝔴";
  var Wopf = "𝕎";
  var wopf = "𝕨";
  var wp = "℘";
  var wr = "≀";
  var wreath = "≀";
  var Wscr = "𝒲";
  var wscr = "𝓌";
  var xcap = "⋂";
  var xcirc = "◯";
  var xcup = "⋃";
  var xdtri = "▽";
  var Xfr = "𝔛";
  var xfr = "𝔵";
  var xharr = "⟷";
  var xhArr = "⟺";
  var Xi = "Ξ";
  var xi = "ξ";
  var xlarr = "⟵";
  var xlArr = "⟸";
  var xmap = "⟼";
  var xnis = "⋻";
  var xodot = "⨀";
  var Xopf = "𝕏";
  var xopf = "𝕩";
  var xoplus = "⨁";
  var xotime = "⨂";
  var xrarr = "⟶";
  var xrArr = "⟹";
  var Xscr = "𝒳";
  var xscr = "𝓍";
  var xsqcup = "⨆";
  var xuplus = "⨄";
  var xutri = "△";
  var xvee = "⋁";
  var xwedge = "⋀";
  var Yacute = "Ý";
  var yacute = "ý";
  var YAcy = "Я";
  var yacy = "я";
  var Ycirc = "Ŷ";
  var ycirc = "ŷ";
  var Ycy = "Ы";
  var ycy = "ы";
  var yen = "¥";
  var Yfr = "𝔜";
  var yfr = "𝔶";
  var YIcy = "Ї";
  var yicy = "ї";
  var Yopf = "𝕐";
  var yopf = "𝕪";
  var Yscr = "𝒴";
  var yscr = "𝓎";
  var YUcy = "Ю";
  var yucy = "ю";
  var yuml = "ÿ";
  var Yuml = "Ÿ";
  var Zacute = "Ź";
  var zacute = "ź";
  var Zcaron = "Ž";
  var zcaron = "ž";
  var Zcy = "З";
  var zcy = "з";
  var Zdot = "Ż";
  var zdot = "ż";
  var zeetrf = "ℨ";
  var ZeroWidthSpace = "​";
  var Zeta = "Ζ";
  var zeta = "ζ";
  var zfr = "𝔷";
  var Zfr = "ℨ";
  var ZHcy = "Ж";
  var zhcy = "ж";
  var zigrarr = "⇝";
  var zopf = "𝕫";
  var Zopf = "ℤ";
  var Zscr = "𝒵";
  var zscr = "𝓏";
  var zwj = "‍";
  var zwnj = "‌";
  var entities = {
  	Aacute: Aacute,
  	aacute: aacute,
  	Abreve: Abreve,
  	abreve: abreve,
  	ac: ac,
  	acd: acd,
  	acE: acE,
  	Acirc: Acirc,
  	acirc: acirc,
  	acute: acute,
  	Acy: Acy,
  	acy: acy,
  	AElig: AElig,
  	aelig: aelig,
  	af: af,
  	Afr: Afr,
  	afr: afr,
  	Agrave: Agrave,
  	agrave: agrave,
  	alefsym: alefsym,
  	aleph: aleph,
  	Alpha: Alpha,
  	alpha: alpha,
  	Amacr: Amacr,
  	amacr: amacr,
  	amalg: amalg,
  	amp: amp,
  	AMP: AMP,
  	andand: andand,
  	And: And,
  	and: and,
  	andd: andd,
  	andslope: andslope,
  	andv: andv,
  	ang: ang,
  	ange: ange,
  	angle: angle,
  	angmsdaa: angmsdaa,
  	angmsdab: angmsdab,
  	angmsdac: angmsdac,
  	angmsdad: angmsdad,
  	angmsdae: angmsdae,
  	angmsdaf: angmsdaf,
  	angmsdag: angmsdag,
  	angmsdah: angmsdah,
  	angmsd: angmsd,
  	angrt: angrt,
  	angrtvb: angrtvb,
  	angrtvbd: angrtvbd,
  	angsph: angsph,
  	angst: angst,
  	angzarr: angzarr,
  	Aogon: Aogon,
  	aogon: aogon,
  	Aopf: Aopf,
  	aopf: aopf,
  	apacir: apacir,
  	ap: ap,
  	apE: apE,
  	ape: ape,
  	apid: apid,
  	apos: apos,
  	ApplyFunction: ApplyFunction,
  	approx: approx,
  	approxeq: approxeq,
  	Aring: Aring,
  	aring: aring,
  	Ascr: Ascr,
  	ascr: ascr,
  	Assign: Assign,
  	ast: ast,
  	asymp: asymp,
  	asympeq: asympeq,
  	Atilde: Atilde,
  	atilde: atilde,
  	Auml: Auml,
  	auml: auml,
  	awconint: awconint,
  	awint: awint,
  	backcong: backcong,
  	backepsilon: backepsilon,
  	backprime: backprime,
  	backsim: backsim,
  	backsimeq: backsimeq,
  	Backslash: Backslash,
  	Barv: Barv,
  	barvee: barvee,
  	barwed: barwed,
  	Barwed: Barwed,
  	barwedge: barwedge,
  	bbrk: bbrk,
  	bbrktbrk: bbrktbrk,
  	bcong: bcong,
  	Bcy: Bcy,
  	bcy: bcy,
  	bdquo: bdquo,
  	becaus: becaus,
  	because: because,
  	Because: Because,
  	bemptyv: bemptyv,
  	bepsi: bepsi,
  	bernou: bernou,
  	Bernoullis: Bernoullis,
  	Beta: Beta,
  	beta: beta,
  	beth: beth,
  	between: between,
  	Bfr: Bfr,
  	bfr: bfr,
  	bigcap: bigcap,
  	bigcirc: bigcirc,
  	bigcup: bigcup,
  	bigodot: bigodot,
  	bigoplus: bigoplus,
  	bigotimes: bigotimes,
  	bigsqcup: bigsqcup,
  	bigstar: bigstar,
  	bigtriangledown: bigtriangledown,
  	bigtriangleup: bigtriangleup,
  	biguplus: biguplus,
  	bigvee: bigvee,
  	bigwedge: bigwedge,
  	bkarow: bkarow,
  	blacklozenge: blacklozenge,
  	blacksquare: blacksquare,
  	blacktriangle: blacktriangle,
  	blacktriangledown: blacktriangledown,
  	blacktriangleleft: blacktriangleleft,
  	blacktriangleright: blacktriangleright,
  	blank: blank,
  	blk12: blk12,
  	blk14: blk14,
  	blk34: blk34,
  	block: block,
  	bne: bne,
  	bnequiv: bnequiv,
  	bNot: bNot,
  	bnot: bnot,
  	Bopf: Bopf,
  	bopf: bopf,
  	bot: bot,
  	bottom: bottom,
  	bowtie: bowtie,
  	boxbox: boxbox,
  	boxdl: boxdl,
  	boxdL: boxdL,
  	boxDl: boxDl,
  	boxDL: boxDL,
  	boxdr: boxdr,
  	boxdR: boxdR,
  	boxDr: boxDr,
  	boxDR: boxDR,
  	boxh: boxh,
  	boxH: boxH,
  	boxhd: boxhd,
  	boxHd: boxHd,
  	boxhD: boxhD,
  	boxHD: boxHD,
  	boxhu: boxhu,
  	boxHu: boxHu,
  	boxhU: boxhU,
  	boxHU: boxHU,
  	boxminus: boxminus,
  	boxplus: boxplus,
  	boxtimes: boxtimes,
  	boxul: boxul,
  	boxuL: boxuL,
  	boxUl: boxUl,
  	boxUL: boxUL,
  	boxur: boxur,
  	boxuR: boxuR,
  	boxUr: boxUr,
  	boxUR: boxUR,
  	boxv: boxv,
  	boxV: boxV,
  	boxvh: boxvh,
  	boxvH: boxvH,
  	boxVh: boxVh,
  	boxVH: boxVH,
  	boxvl: boxvl,
  	boxvL: boxvL,
  	boxVl: boxVl,
  	boxVL: boxVL,
  	boxvr: boxvr,
  	boxvR: boxvR,
  	boxVr: boxVr,
  	boxVR: boxVR,
  	bprime: bprime,
  	breve: breve,
  	Breve: Breve,
  	brvbar: brvbar,
  	bscr: bscr,
  	Bscr: Bscr,
  	bsemi: bsemi,
  	bsim: bsim,
  	bsime: bsime,
  	bsolb: bsolb,
  	bsol: bsol,
  	bsolhsub: bsolhsub,
  	bull: bull,
  	bullet: bullet,
  	bump: bump,
  	bumpE: bumpE,
  	bumpe: bumpe,
  	Bumpeq: Bumpeq,
  	bumpeq: bumpeq,
  	Cacute: Cacute,
  	cacute: cacute,
  	capand: capand,
  	capbrcup: capbrcup,
  	capcap: capcap,
  	cap: cap,
  	Cap: Cap,
  	capcup: capcup,
  	capdot: capdot,
  	CapitalDifferentialD: CapitalDifferentialD,
  	caps: caps,
  	caret: caret,
  	caron: caron,
  	Cayleys: Cayleys,
  	ccaps: ccaps,
  	Ccaron: Ccaron,
  	ccaron: ccaron,
  	Ccedil: Ccedil,
  	ccedil: ccedil,
  	Ccirc: Ccirc,
  	ccirc: ccirc,
  	Cconint: Cconint,
  	ccups: ccups,
  	ccupssm: ccupssm,
  	Cdot: Cdot,
  	cdot: cdot,
  	cedil: cedil,
  	Cedilla: Cedilla,
  	cemptyv: cemptyv,
  	cent: cent,
  	centerdot: centerdot,
  	CenterDot: CenterDot,
  	cfr: cfr,
  	Cfr: Cfr,
  	CHcy: CHcy,
  	chcy: chcy,
  	check: check,
  	checkmark: checkmark,
  	Chi: Chi,
  	chi: chi,
  	circ: circ,
  	circeq: circeq,
  	circlearrowleft: circlearrowleft,
  	circlearrowright: circlearrowright,
  	circledast: circledast,
  	circledcirc: circledcirc,
  	circleddash: circleddash,
  	CircleDot: CircleDot,
  	circledR: circledR,
  	circledS: circledS,
  	CircleMinus: CircleMinus,
  	CirclePlus: CirclePlus,
  	CircleTimes: CircleTimes,
  	cir: cir,
  	cirE: cirE,
  	cire: cire,
  	cirfnint: cirfnint,
  	cirmid: cirmid,
  	cirscir: cirscir,
  	ClockwiseContourIntegral: ClockwiseContourIntegral,
  	CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
  	CloseCurlyQuote: CloseCurlyQuote,
  	clubs: clubs,
  	clubsuit: clubsuit,
  	colon: colon,
  	Colon: Colon,
  	Colone: Colone,
  	colone: colone,
  	coloneq: coloneq,
  	comma: comma,
  	commat: commat,
  	comp: comp,
  	compfn: compfn,
  	complement: complement,
  	complexes: complexes,
  	cong: cong,
  	congdot: congdot,
  	Congruent: Congruent,
  	conint: conint,
  	Conint: Conint,
  	ContourIntegral: ContourIntegral,
  	copf: copf,
  	Copf: Copf,
  	coprod: coprod,
  	Coproduct: Coproduct,
  	copy: copy,
  	COPY: COPY,
  	copysr: copysr,
  	CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
  	crarr: crarr,
  	cross: cross,
  	Cross: Cross,
  	Cscr: Cscr,
  	cscr: cscr,
  	csub: csub,
  	csube: csube,
  	csup: csup,
  	csupe: csupe,
  	ctdot: ctdot,
  	cudarrl: cudarrl,
  	cudarrr: cudarrr,
  	cuepr: cuepr,
  	cuesc: cuesc,
  	cularr: cularr,
  	cularrp: cularrp,
  	cupbrcap: cupbrcap,
  	cupcap: cupcap,
  	CupCap: CupCap,
  	cup: cup,
  	Cup: Cup,
  	cupcup: cupcup,
  	cupdot: cupdot,
  	cupor: cupor,
  	cups: cups,
  	curarr: curarr,
  	curarrm: curarrm,
  	curlyeqprec: curlyeqprec,
  	curlyeqsucc: curlyeqsucc,
  	curlyvee: curlyvee,
  	curlywedge: curlywedge,
  	curren: curren,
  	curvearrowleft: curvearrowleft,
  	curvearrowright: curvearrowright,
  	cuvee: cuvee,
  	cuwed: cuwed,
  	cwconint: cwconint,
  	cwint: cwint,
  	cylcty: cylcty,
  	dagger: dagger,
  	Dagger: Dagger,
  	daleth: daleth,
  	darr: darr,
  	Darr: Darr,
  	dArr: dArr,
  	dash: dash,
  	Dashv: Dashv,
  	dashv: dashv,
  	dbkarow: dbkarow,
  	dblac: dblac,
  	Dcaron: Dcaron,
  	dcaron: dcaron,
  	Dcy: Dcy,
  	dcy: dcy,
  	ddagger: ddagger,
  	ddarr: ddarr,
  	DD: DD,
  	dd: dd,
  	DDotrahd: DDotrahd,
  	ddotseq: ddotseq,
  	deg: deg,
  	Del: Del,
  	Delta: Delta,
  	delta: delta,
  	demptyv: demptyv,
  	dfisht: dfisht,
  	Dfr: Dfr,
  	dfr: dfr,
  	dHar: dHar,
  	dharl: dharl,
  	dharr: dharr,
  	DiacriticalAcute: DiacriticalAcute,
  	DiacriticalDot: DiacriticalDot,
  	DiacriticalDoubleAcute: DiacriticalDoubleAcute,
  	DiacriticalGrave: DiacriticalGrave,
  	DiacriticalTilde: DiacriticalTilde,
  	diam: diam,
  	diamond: diamond,
  	Diamond: Diamond,
  	diamondsuit: diamondsuit,
  	diams: diams,
  	die: die,
  	DifferentialD: DifferentialD,
  	digamma: digamma,
  	disin: disin,
  	div: div,
  	divide: divide,
  	divideontimes: divideontimes,
  	divonx: divonx,
  	DJcy: DJcy,
  	djcy: djcy,
  	dlcorn: dlcorn,
  	dlcrop: dlcrop,
  	dollar: dollar,
  	Dopf: Dopf,
  	dopf: dopf,
  	Dot: Dot,
  	dot: dot,
  	DotDot: DotDot,
  	doteq: doteq,
  	doteqdot: doteqdot,
  	DotEqual: DotEqual,
  	dotminus: dotminus,
  	dotplus: dotplus,
  	dotsquare: dotsquare,
  	doublebarwedge: doublebarwedge,
  	DoubleContourIntegral: DoubleContourIntegral,
  	DoubleDot: DoubleDot,
  	DoubleDownArrow: DoubleDownArrow,
  	DoubleLeftArrow: DoubleLeftArrow,
  	DoubleLeftRightArrow: DoubleLeftRightArrow,
  	DoubleLeftTee: DoubleLeftTee,
  	DoubleLongLeftArrow: DoubleLongLeftArrow,
  	DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
  	DoubleLongRightArrow: DoubleLongRightArrow,
  	DoubleRightArrow: DoubleRightArrow,
  	DoubleRightTee: DoubleRightTee,
  	DoubleUpArrow: DoubleUpArrow,
  	DoubleUpDownArrow: DoubleUpDownArrow,
  	DoubleVerticalBar: DoubleVerticalBar,
  	DownArrowBar: DownArrowBar,
  	downarrow: downarrow,
  	DownArrow: DownArrow,
  	Downarrow: Downarrow,
  	DownArrowUpArrow: DownArrowUpArrow,
  	DownBreve: DownBreve,
  	downdownarrows: downdownarrows,
  	downharpoonleft: downharpoonleft,
  	downharpoonright: downharpoonright,
  	DownLeftRightVector: DownLeftRightVector,
  	DownLeftTeeVector: DownLeftTeeVector,
  	DownLeftVectorBar: DownLeftVectorBar,
  	DownLeftVector: DownLeftVector,
  	DownRightTeeVector: DownRightTeeVector,
  	DownRightVectorBar: DownRightVectorBar,
  	DownRightVector: DownRightVector,
  	DownTeeArrow: DownTeeArrow,
  	DownTee: DownTee,
  	drbkarow: drbkarow,
  	drcorn: drcorn,
  	drcrop: drcrop,
  	Dscr: Dscr,
  	dscr: dscr,
  	DScy: DScy,
  	dscy: dscy,
  	dsol: dsol,
  	Dstrok: Dstrok,
  	dstrok: dstrok,
  	dtdot: dtdot,
  	dtri: dtri,
  	dtrif: dtrif,
  	duarr: duarr,
  	duhar: duhar,
  	dwangle: dwangle,
  	DZcy: DZcy,
  	dzcy: dzcy,
  	dzigrarr: dzigrarr,
  	Eacute: Eacute,
  	eacute: eacute,
  	easter: easter,
  	Ecaron: Ecaron,
  	ecaron: ecaron,
  	Ecirc: Ecirc,
  	ecirc: ecirc,
  	ecir: ecir,
  	ecolon: ecolon,
  	Ecy: Ecy,
  	ecy: ecy,
  	eDDot: eDDot,
  	Edot: Edot,
  	edot: edot,
  	eDot: eDot,
  	ee: ee,
  	efDot: efDot,
  	Efr: Efr,
  	efr: efr,
  	eg: eg,
  	Egrave: Egrave,
  	egrave: egrave,
  	egs: egs,
  	egsdot: egsdot,
  	el: el,
  	Element: Element,
  	elinters: elinters,
  	ell: ell,
  	els: els,
  	elsdot: elsdot,
  	Emacr: Emacr,
  	emacr: emacr,
  	empty: empty,
  	emptyset: emptyset,
  	EmptySmallSquare: EmptySmallSquare,
  	emptyv: emptyv,
  	EmptyVerySmallSquare: EmptyVerySmallSquare,
  	emsp13: emsp13,
  	emsp14: emsp14,
  	emsp: emsp,
  	ENG: ENG,
  	eng: eng,
  	ensp: ensp,
  	Eogon: Eogon,
  	eogon: eogon,
  	Eopf: Eopf,
  	eopf: eopf,
  	epar: epar,
  	eparsl: eparsl,
  	eplus: eplus,
  	epsi: epsi,
  	Epsilon: Epsilon,
  	epsilon: epsilon,
  	epsiv: epsiv,
  	eqcirc: eqcirc,
  	eqcolon: eqcolon,
  	eqsim: eqsim,
  	eqslantgtr: eqslantgtr,
  	eqslantless: eqslantless,
  	Equal: Equal,
  	equals: equals,
  	EqualTilde: EqualTilde,
  	equest: equest,
  	Equilibrium: Equilibrium,
  	equiv: equiv,
  	equivDD: equivDD,
  	eqvparsl: eqvparsl,
  	erarr: erarr,
  	erDot: erDot,
  	escr: escr,
  	Escr: Escr,
  	esdot: esdot,
  	Esim: Esim,
  	esim: esim,
  	Eta: Eta,
  	eta: eta,
  	ETH: ETH,
  	eth: eth,
  	Euml: Euml,
  	euml: euml,
  	euro: euro,
  	excl: excl,
  	exist: exist,
  	Exists: Exists,
  	expectation: expectation,
  	exponentiale: exponentiale,
  	ExponentialE: ExponentialE,
  	fallingdotseq: fallingdotseq,
  	Fcy: Fcy,
  	fcy: fcy,
  	female: female,
  	ffilig: ffilig,
  	fflig: fflig,
  	ffllig: ffllig,
  	Ffr: Ffr,
  	ffr: ffr,
  	filig: filig,
  	FilledSmallSquare: FilledSmallSquare,
  	FilledVerySmallSquare: FilledVerySmallSquare,
  	fjlig: fjlig,
  	flat: flat,
  	fllig: fllig,
  	fltns: fltns,
  	fnof: fnof,
  	Fopf: Fopf,
  	fopf: fopf,
  	forall: forall,
  	ForAll: ForAll,
  	fork: fork,
  	forkv: forkv,
  	Fouriertrf: Fouriertrf,
  	fpartint: fpartint,
  	frac12: frac12,
  	frac13: frac13,
  	frac14: frac14,
  	frac15: frac15,
  	frac16: frac16,
  	frac18: frac18,
  	frac23: frac23,
  	frac25: frac25,
  	frac34: frac34,
  	frac35: frac35,
  	frac38: frac38,
  	frac45: frac45,
  	frac56: frac56,
  	frac58: frac58,
  	frac78: frac78,
  	frasl: frasl,
  	frown: frown,
  	fscr: fscr,
  	Fscr: Fscr,
  	gacute: gacute,
  	Gamma: Gamma,
  	gamma: gamma,
  	Gammad: Gammad,
  	gammad: gammad,
  	gap: gap,
  	Gbreve: Gbreve,
  	gbreve: gbreve,
  	Gcedil: Gcedil,
  	Gcirc: Gcirc,
  	gcirc: gcirc,
  	Gcy: Gcy,
  	gcy: gcy,
  	Gdot: Gdot,
  	gdot: gdot,
  	ge: ge,
  	gE: gE,
  	gEl: gEl,
  	gel: gel,
  	geq: geq,
  	geqq: geqq,
  	geqslant: geqslant,
  	gescc: gescc,
  	ges: ges,
  	gesdot: gesdot,
  	gesdoto: gesdoto,
  	gesdotol: gesdotol,
  	gesl: gesl,
  	gesles: gesles,
  	Gfr: Gfr,
  	gfr: gfr,
  	gg: gg,
  	Gg: Gg,
  	ggg: ggg,
  	gimel: gimel,
  	GJcy: GJcy,
  	gjcy: gjcy,
  	gla: gla,
  	gl: gl,
  	glE: glE,
  	glj: glj,
  	gnap: gnap,
  	gnapprox: gnapprox,
  	gne: gne,
  	gnE: gnE,
  	gneq: gneq,
  	gneqq: gneqq,
  	gnsim: gnsim,
  	Gopf: Gopf,
  	gopf: gopf,
  	grave: grave,
  	GreaterEqual: GreaterEqual,
  	GreaterEqualLess: GreaterEqualLess,
  	GreaterFullEqual: GreaterFullEqual,
  	GreaterGreater: GreaterGreater,
  	GreaterLess: GreaterLess,
  	GreaterSlantEqual: GreaterSlantEqual,
  	GreaterTilde: GreaterTilde,
  	Gscr: Gscr,
  	gscr: gscr,
  	gsim: gsim,
  	gsime: gsime,
  	gsiml: gsiml,
  	gtcc: gtcc,
  	gtcir: gtcir,
  	gt: gt,
  	GT: GT,
  	Gt: Gt,
  	gtdot: gtdot,
  	gtlPar: gtlPar,
  	gtquest: gtquest,
  	gtrapprox: gtrapprox,
  	gtrarr: gtrarr,
  	gtrdot: gtrdot,
  	gtreqless: gtreqless,
  	gtreqqless: gtreqqless,
  	gtrless: gtrless,
  	gtrsim: gtrsim,
  	gvertneqq: gvertneqq,
  	gvnE: gvnE,
  	Hacek: Hacek,
  	hairsp: hairsp,
  	half: half,
  	hamilt: hamilt,
  	HARDcy: HARDcy,
  	hardcy: hardcy,
  	harrcir: harrcir,
  	harr: harr,
  	hArr: hArr,
  	harrw: harrw,
  	Hat: Hat,
  	hbar: hbar,
  	Hcirc: Hcirc,
  	hcirc: hcirc,
  	hearts: hearts,
  	heartsuit: heartsuit,
  	hellip: hellip,
  	hercon: hercon,
  	hfr: hfr,
  	Hfr: Hfr,
  	HilbertSpace: HilbertSpace,
  	hksearow: hksearow,
  	hkswarow: hkswarow,
  	hoarr: hoarr,
  	homtht: homtht,
  	hookleftarrow: hookleftarrow,
  	hookrightarrow: hookrightarrow,
  	hopf: hopf,
  	Hopf: Hopf,
  	horbar: horbar,
  	HorizontalLine: HorizontalLine,
  	hscr: hscr,
  	Hscr: Hscr,
  	hslash: hslash,
  	Hstrok: Hstrok,
  	hstrok: hstrok,
  	HumpDownHump: HumpDownHump,
  	HumpEqual: HumpEqual,
  	hybull: hybull,
  	hyphen: hyphen,
  	Iacute: Iacute,
  	iacute: iacute,
  	ic: ic,
  	Icirc: Icirc,
  	icirc: icirc,
  	Icy: Icy,
  	icy: icy,
  	Idot: Idot,
  	IEcy: IEcy,
  	iecy: iecy,
  	iexcl: iexcl,
  	iff: iff,
  	ifr: ifr,
  	Ifr: Ifr,
  	Igrave: Igrave,
  	igrave: igrave,
  	ii: ii,
  	iiiint: iiiint,
  	iiint: iiint,
  	iinfin: iinfin,
  	iiota: iiota,
  	IJlig: IJlig,
  	ijlig: ijlig,
  	Imacr: Imacr,
  	imacr: imacr,
  	image: image,
  	ImaginaryI: ImaginaryI,
  	imagline: imagline,
  	imagpart: imagpart,
  	imath: imath,
  	Im: Im,
  	imof: imof,
  	imped: imped,
  	Implies: Implies,
  	incare: incare,
  	"in": "∈",
  	infin: infin,
  	infintie: infintie,
  	inodot: inodot,
  	intcal: intcal,
  	int: int,
  	Int: Int,
  	integers: integers,
  	Integral: Integral,
  	intercal: intercal,
  	Intersection: Intersection,
  	intlarhk: intlarhk,
  	intprod: intprod,
  	InvisibleComma: InvisibleComma,
  	InvisibleTimes: InvisibleTimes,
  	IOcy: IOcy,
  	iocy: iocy,
  	Iogon: Iogon,
  	iogon: iogon,
  	Iopf: Iopf,
  	iopf: iopf,
  	Iota: Iota,
  	iota: iota,
  	iprod: iprod,
  	iquest: iquest,
  	iscr: iscr,
  	Iscr: Iscr,
  	isin: isin,
  	isindot: isindot,
  	isinE: isinE,
  	isins: isins,
  	isinsv: isinsv,
  	isinv: isinv,
  	it: it,
  	Itilde: Itilde,
  	itilde: itilde,
  	Iukcy: Iukcy,
  	iukcy: iukcy,
  	Iuml: Iuml,
  	iuml: iuml,
  	Jcirc: Jcirc,
  	jcirc: jcirc,
  	Jcy: Jcy,
  	jcy: jcy,
  	Jfr: Jfr,
  	jfr: jfr,
  	jmath: jmath,
  	Jopf: Jopf,
  	jopf: jopf,
  	Jscr: Jscr,
  	jscr: jscr,
  	Jsercy: Jsercy,
  	jsercy: jsercy,
  	Jukcy: Jukcy,
  	jukcy: jukcy,
  	Kappa: Kappa,
  	kappa: kappa,
  	kappav: kappav,
  	Kcedil: Kcedil,
  	kcedil: kcedil,
  	Kcy: Kcy,
  	kcy: kcy,
  	Kfr: Kfr,
  	kfr: kfr,
  	kgreen: kgreen,
  	KHcy: KHcy,
  	khcy: khcy,
  	KJcy: KJcy,
  	kjcy: kjcy,
  	Kopf: Kopf,
  	kopf: kopf,
  	Kscr: Kscr,
  	kscr: kscr,
  	lAarr: lAarr,
  	Lacute: Lacute,
  	lacute: lacute,
  	laemptyv: laemptyv,
  	lagran: lagran,
  	Lambda: Lambda,
  	lambda: lambda,
  	lang: lang,
  	Lang: Lang,
  	langd: langd,
  	langle: langle,
  	lap: lap,
  	Laplacetrf: Laplacetrf,
  	laquo: laquo,
  	larrb: larrb,
  	larrbfs: larrbfs,
  	larr: larr,
  	Larr: Larr,
  	lArr: lArr,
  	larrfs: larrfs,
  	larrhk: larrhk,
  	larrlp: larrlp,
  	larrpl: larrpl,
  	larrsim: larrsim,
  	larrtl: larrtl,
  	latail: latail,
  	lAtail: lAtail,
  	lat: lat,
  	late: late,
  	lates: lates,
  	lbarr: lbarr,
  	lBarr: lBarr,
  	lbbrk: lbbrk,
  	lbrace: lbrace,
  	lbrack: lbrack,
  	lbrke: lbrke,
  	lbrksld: lbrksld,
  	lbrkslu: lbrkslu,
  	Lcaron: Lcaron,
  	lcaron: lcaron,
  	Lcedil: Lcedil,
  	lcedil: lcedil,
  	lceil: lceil,
  	lcub: lcub,
  	Lcy: Lcy,
  	lcy: lcy,
  	ldca: ldca,
  	ldquo: ldquo,
  	ldquor: ldquor,
  	ldrdhar: ldrdhar,
  	ldrushar: ldrushar,
  	ldsh: ldsh,
  	le: le,
  	lE: lE,
  	LeftAngleBracket: LeftAngleBracket,
  	LeftArrowBar: LeftArrowBar,
  	leftarrow: leftarrow,
  	LeftArrow: LeftArrow,
  	Leftarrow: Leftarrow,
  	LeftArrowRightArrow: LeftArrowRightArrow,
  	leftarrowtail: leftarrowtail,
  	LeftCeiling: LeftCeiling,
  	LeftDoubleBracket: LeftDoubleBracket,
  	LeftDownTeeVector: LeftDownTeeVector,
  	LeftDownVectorBar: LeftDownVectorBar,
  	LeftDownVector: LeftDownVector,
  	LeftFloor: LeftFloor,
  	leftharpoondown: leftharpoondown,
  	leftharpoonup: leftharpoonup,
  	leftleftarrows: leftleftarrows,
  	leftrightarrow: leftrightarrow,
  	LeftRightArrow: LeftRightArrow,
  	Leftrightarrow: Leftrightarrow,
  	leftrightarrows: leftrightarrows,
  	leftrightharpoons: leftrightharpoons,
  	leftrightsquigarrow: leftrightsquigarrow,
  	LeftRightVector: LeftRightVector,
  	LeftTeeArrow: LeftTeeArrow,
  	LeftTee: LeftTee,
  	LeftTeeVector: LeftTeeVector,
  	leftthreetimes: leftthreetimes,
  	LeftTriangleBar: LeftTriangleBar,
  	LeftTriangle: LeftTriangle,
  	LeftTriangleEqual: LeftTriangleEqual,
  	LeftUpDownVector: LeftUpDownVector,
  	LeftUpTeeVector: LeftUpTeeVector,
  	LeftUpVectorBar: LeftUpVectorBar,
  	LeftUpVector: LeftUpVector,
  	LeftVectorBar: LeftVectorBar,
  	LeftVector: LeftVector,
  	lEg: lEg,
  	leg: leg,
  	leq: leq,
  	leqq: leqq,
  	leqslant: leqslant,
  	lescc: lescc,
  	les: les,
  	lesdot: lesdot,
  	lesdoto: lesdoto,
  	lesdotor: lesdotor,
  	lesg: lesg,
  	lesges: lesges,
  	lessapprox: lessapprox,
  	lessdot: lessdot,
  	lesseqgtr: lesseqgtr,
  	lesseqqgtr: lesseqqgtr,
  	LessEqualGreater: LessEqualGreater,
  	LessFullEqual: LessFullEqual,
  	LessGreater: LessGreater,
  	lessgtr: lessgtr,
  	LessLess: LessLess,
  	lesssim: lesssim,
  	LessSlantEqual: LessSlantEqual,
  	LessTilde: LessTilde,
  	lfisht: lfisht,
  	lfloor: lfloor,
  	Lfr: Lfr,
  	lfr: lfr,
  	lg: lg,
  	lgE: lgE,
  	lHar: lHar,
  	lhard: lhard,
  	lharu: lharu,
  	lharul: lharul,
  	lhblk: lhblk,
  	LJcy: LJcy,
  	ljcy: ljcy,
  	llarr: llarr,
  	ll: ll,
  	Ll: Ll,
  	llcorner: llcorner,
  	Lleftarrow: Lleftarrow,
  	llhard: llhard,
  	lltri: lltri,
  	Lmidot: Lmidot,
  	lmidot: lmidot,
  	lmoustache: lmoustache,
  	lmoust: lmoust,
  	lnap: lnap,
  	lnapprox: lnapprox,
  	lne: lne,
  	lnE: lnE,
  	lneq: lneq,
  	lneqq: lneqq,
  	lnsim: lnsim,
  	loang: loang,
  	loarr: loarr,
  	lobrk: lobrk,
  	longleftarrow: longleftarrow,
  	LongLeftArrow: LongLeftArrow,
  	Longleftarrow: Longleftarrow,
  	longleftrightarrow: longleftrightarrow,
  	LongLeftRightArrow: LongLeftRightArrow,
  	Longleftrightarrow: Longleftrightarrow,
  	longmapsto: longmapsto,
  	longrightarrow: longrightarrow,
  	LongRightArrow: LongRightArrow,
  	Longrightarrow: Longrightarrow,
  	looparrowleft: looparrowleft,
  	looparrowright: looparrowright,
  	lopar: lopar,
  	Lopf: Lopf,
  	lopf: lopf,
  	loplus: loplus,
  	lotimes: lotimes,
  	lowast: lowast,
  	lowbar: lowbar,
  	LowerLeftArrow: LowerLeftArrow,
  	LowerRightArrow: LowerRightArrow,
  	loz: loz,
  	lozenge: lozenge,
  	lozf: lozf,
  	lpar: lpar,
  	lparlt: lparlt,
  	lrarr: lrarr,
  	lrcorner: lrcorner,
  	lrhar: lrhar,
  	lrhard: lrhard,
  	lrm: lrm,
  	lrtri: lrtri,
  	lsaquo: lsaquo,
  	lscr: lscr,
  	Lscr: Lscr,
  	lsh: lsh,
  	Lsh: Lsh,
  	lsim: lsim,
  	lsime: lsime,
  	lsimg: lsimg,
  	lsqb: lsqb,
  	lsquo: lsquo,
  	lsquor: lsquor,
  	Lstrok: Lstrok,
  	lstrok: lstrok,
  	ltcc: ltcc,
  	ltcir: ltcir,
  	lt: lt,
  	LT: LT,
  	Lt: Lt,
  	ltdot: ltdot,
  	lthree: lthree,
  	ltimes: ltimes,
  	ltlarr: ltlarr,
  	ltquest: ltquest,
  	ltri: ltri,
  	ltrie: ltrie,
  	ltrif: ltrif,
  	ltrPar: ltrPar,
  	lurdshar: lurdshar,
  	luruhar: luruhar,
  	lvertneqq: lvertneqq,
  	lvnE: lvnE,
  	macr: macr,
  	male: male,
  	malt: malt,
  	maltese: maltese,
  	"Map": "⤅",
  	map: map,
  	mapsto: mapsto,
  	mapstodown: mapstodown,
  	mapstoleft: mapstoleft,
  	mapstoup: mapstoup,
  	marker: marker,
  	mcomma: mcomma,
  	Mcy: Mcy,
  	mcy: mcy,
  	mdash: mdash,
  	mDDot: mDDot,
  	measuredangle: measuredangle,
  	MediumSpace: MediumSpace,
  	Mellintrf: Mellintrf,
  	Mfr: Mfr,
  	mfr: mfr,
  	mho: mho,
  	micro: micro,
  	midast: midast,
  	midcir: midcir,
  	mid: mid,
  	middot: middot,
  	minusb: minusb,
  	minus: minus,
  	minusd: minusd,
  	minusdu: minusdu,
  	MinusPlus: MinusPlus,
  	mlcp: mlcp,
  	mldr: mldr,
  	mnplus: mnplus,
  	models: models,
  	Mopf: Mopf,
  	mopf: mopf,
  	mp: mp,
  	mscr: mscr,
  	Mscr: Mscr,
  	mstpos: mstpos,
  	Mu: Mu,
  	mu: mu,
  	multimap: multimap,
  	mumap: mumap,
  	nabla: nabla,
  	Nacute: Nacute,
  	nacute: nacute,
  	nang: nang,
  	nap: nap,
  	napE: napE,
  	napid: napid,
  	napos: napos,
  	napprox: napprox,
  	natural: natural,
  	naturals: naturals,
  	natur: natur,
  	nbsp: nbsp,
  	nbump: nbump,
  	nbumpe: nbumpe,
  	ncap: ncap,
  	Ncaron: Ncaron,
  	ncaron: ncaron,
  	Ncedil: Ncedil,
  	ncedil: ncedil,
  	ncong: ncong,
  	ncongdot: ncongdot,
  	ncup: ncup,
  	Ncy: Ncy,
  	ncy: ncy,
  	ndash: ndash,
  	nearhk: nearhk,
  	nearr: nearr,
  	neArr: neArr,
  	nearrow: nearrow,
  	ne: ne,
  	nedot: nedot,
  	NegativeMediumSpace: NegativeMediumSpace,
  	NegativeThickSpace: NegativeThickSpace,
  	NegativeThinSpace: NegativeThinSpace,
  	NegativeVeryThinSpace: NegativeVeryThinSpace,
  	nequiv: nequiv,
  	nesear: nesear,
  	nesim: nesim,
  	NestedGreaterGreater: NestedGreaterGreater,
  	NestedLessLess: NestedLessLess,
  	NewLine: NewLine,
  	nexist: nexist,
  	nexists: nexists,
  	Nfr: Nfr,
  	nfr: nfr,
  	ngE: ngE,
  	nge: nge,
  	ngeq: ngeq,
  	ngeqq: ngeqq,
  	ngeqslant: ngeqslant,
  	nges: nges,
  	nGg: nGg,
  	ngsim: ngsim,
  	nGt: nGt,
  	ngt: ngt,
  	ngtr: ngtr,
  	nGtv: nGtv,
  	nharr: nharr,
  	nhArr: nhArr,
  	nhpar: nhpar,
  	ni: ni,
  	nis: nis,
  	nisd: nisd,
  	niv: niv,
  	NJcy: NJcy,
  	njcy: njcy,
  	nlarr: nlarr,
  	nlArr: nlArr,
  	nldr: nldr,
  	nlE: nlE,
  	nle: nle,
  	nleftarrow: nleftarrow,
  	nLeftarrow: nLeftarrow,
  	nleftrightarrow: nleftrightarrow,
  	nLeftrightarrow: nLeftrightarrow,
  	nleq: nleq,
  	nleqq: nleqq,
  	nleqslant: nleqslant,
  	nles: nles,
  	nless: nless,
  	nLl: nLl,
  	nlsim: nlsim,
  	nLt: nLt,
  	nlt: nlt,
  	nltri: nltri,
  	nltrie: nltrie,
  	nLtv: nLtv,
  	nmid: nmid,
  	NoBreak: NoBreak,
  	NonBreakingSpace: NonBreakingSpace,
  	nopf: nopf,
  	Nopf: Nopf,
  	Not: Not,
  	not: not,
  	NotCongruent: NotCongruent,
  	NotCupCap: NotCupCap,
  	NotDoubleVerticalBar: NotDoubleVerticalBar,
  	NotElement: NotElement,
  	NotEqual: NotEqual,
  	NotEqualTilde: NotEqualTilde,
  	NotExists: NotExists,
  	NotGreater: NotGreater,
  	NotGreaterEqual: NotGreaterEqual,
  	NotGreaterFullEqual: NotGreaterFullEqual,
  	NotGreaterGreater: NotGreaterGreater,
  	NotGreaterLess: NotGreaterLess,
  	NotGreaterSlantEqual: NotGreaterSlantEqual,
  	NotGreaterTilde: NotGreaterTilde,
  	NotHumpDownHump: NotHumpDownHump,
  	NotHumpEqual: NotHumpEqual,
  	notin: notin,
  	notindot: notindot,
  	notinE: notinE,
  	notinva: notinva,
  	notinvb: notinvb,
  	notinvc: notinvc,
  	NotLeftTriangleBar: NotLeftTriangleBar,
  	NotLeftTriangle: NotLeftTriangle,
  	NotLeftTriangleEqual: NotLeftTriangleEqual,
  	NotLess: NotLess,
  	NotLessEqual: NotLessEqual,
  	NotLessGreater: NotLessGreater,
  	NotLessLess: NotLessLess,
  	NotLessSlantEqual: NotLessSlantEqual,
  	NotLessTilde: NotLessTilde,
  	NotNestedGreaterGreater: NotNestedGreaterGreater,
  	NotNestedLessLess: NotNestedLessLess,
  	notni: notni,
  	notniva: notniva,
  	notnivb: notnivb,
  	notnivc: notnivc,
  	NotPrecedes: NotPrecedes,
  	NotPrecedesEqual: NotPrecedesEqual,
  	NotPrecedesSlantEqual: NotPrecedesSlantEqual,
  	NotReverseElement: NotReverseElement,
  	NotRightTriangleBar: NotRightTriangleBar,
  	NotRightTriangle: NotRightTriangle,
  	NotRightTriangleEqual: NotRightTriangleEqual,
  	NotSquareSubset: NotSquareSubset,
  	NotSquareSubsetEqual: NotSquareSubsetEqual,
  	NotSquareSuperset: NotSquareSuperset,
  	NotSquareSupersetEqual: NotSquareSupersetEqual,
  	NotSubset: NotSubset,
  	NotSubsetEqual: NotSubsetEqual,
  	NotSucceeds: NotSucceeds,
  	NotSucceedsEqual: NotSucceedsEqual,
  	NotSucceedsSlantEqual: NotSucceedsSlantEqual,
  	NotSucceedsTilde: NotSucceedsTilde,
  	NotSuperset: NotSuperset,
  	NotSupersetEqual: NotSupersetEqual,
  	NotTilde: NotTilde,
  	NotTildeEqual: NotTildeEqual,
  	NotTildeFullEqual: NotTildeFullEqual,
  	NotTildeTilde: NotTildeTilde,
  	NotVerticalBar: NotVerticalBar,
  	nparallel: nparallel,
  	npar: npar,
  	nparsl: nparsl,
  	npart: npart,
  	npolint: npolint,
  	npr: npr,
  	nprcue: nprcue,
  	nprec: nprec,
  	npreceq: npreceq,
  	npre: npre,
  	nrarrc: nrarrc,
  	nrarr: nrarr,
  	nrArr: nrArr,
  	nrarrw: nrarrw,
  	nrightarrow: nrightarrow,
  	nRightarrow: nRightarrow,
  	nrtri: nrtri,
  	nrtrie: nrtrie,
  	nsc: nsc,
  	nsccue: nsccue,
  	nsce: nsce,
  	Nscr: Nscr,
  	nscr: nscr,
  	nshortmid: nshortmid,
  	nshortparallel: nshortparallel,
  	nsim: nsim,
  	nsime: nsime,
  	nsimeq: nsimeq,
  	nsmid: nsmid,
  	nspar: nspar,
  	nsqsube: nsqsube,
  	nsqsupe: nsqsupe,
  	nsub: nsub,
  	nsubE: nsubE,
  	nsube: nsube,
  	nsubset: nsubset,
  	nsubseteq: nsubseteq,
  	nsubseteqq: nsubseteqq,
  	nsucc: nsucc,
  	nsucceq: nsucceq,
  	nsup: nsup,
  	nsupE: nsupE,
  	nsupe: nsupe,
  	nsupset: nsupset,
  	nsupseteq: nsupseteq,
  	nsupseteqq: nsupseteqq,
  	ntgl: ntgl,
  	Ntilde: Ntilde,
  	ntilde: ntilde,
  	ntlg: ntlg,
  	ntriangleleft: ntriangleleft,
  	ntrianglelefteq: ntrianglelefteq,
  	ntriangleright: ntriangleright,
  	ntrianglerighteq: ntrianglerighteq,
  	Nu: Nu,
  	nu: nu,
  	num: num,
  	numero: numero,
  	numsp: numsp,
  	nvap: nvap,
  	nvdash: nvdash,
  	nvDash: nvDash,
  	nVdash: nVdash,
  	nVDash: nVDash,
  	nvge: nvge,
  	nvgt: nvgt,
  	nvHarr: nvHarr,
  	nvinfin: nvinfin,
  	nvlArr: nvlArr,
  	nvle: nvle,
  	nvlt: nvlt,
  	nvltrie: nvltrie,
  	nvrArr: nvrArr,
  	nvrtrie: nvrtrie,
  	nvsim: nvsim,
  	nwarhk: nwarhk,
  	nwarr: nwarr,
  	nwArr: nwArr,
  	nwarrow: nwarrow,
  	nwnear: nwnear,
  	Oacute: Oacute,
  	oacute: oacute,
  	oast: oast,
  	Ocirc: Ocirc,
  	ocirc: ocirc,
  	ocir: ocir,
  	Ocy: Ocy,
  	ocy: ocy,
  	odash: odash,
  	Odblac: Odblac,
  	odblac: odblac,
  	odiv: odiv,
  	odot: odot,
  	odsold: odsold,
  	OElig: OElig,
  	oelig: oelig,
  	ofcir: ofcir,
  	Ofr: Ofr,
  	ofr: ofr,
  	ogon: ogon,
  	Ograve: Ograve,
  	ograve: ograve,
  	ogt: ogt,
  	ohbar: ohbar,
  	ohm: ohm,
  	oint: oint,
  	olarr: olarr,
  	olcir: olcir,
  	olcross: olcross,
  	oline: oline,
  	olt: olt,
  	Omacr: Omacr,
  	omacr: omacr,
  	Omega: Omega,
  	omega: omega,
  	Omicron: Omicron,
  	omicron: omicron,
  	omid: omid,
  	ominus: ominus,
  	Oopf: Oopf,
  	oopf: oopf,
  	opar: opar,
  	OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
  	OpenCurlyQuote: OpenCurlyQuote,
  	operp: operp,
  	oplus: oplus,
  	orarr: orarr,
  	Or: Or,
  	or: or,
  	ord: ord,
  	order: order,
  	orderof: orderof,
  	ordf: ordf,
  	ordm: ordm,
  	origof: origof,
  	oror: oror,
  	orslope: orslope,
  	orv: orv,
  	oS: oS,
  	Oscr: Oscr,
  	oscr: oscr,
  	Oslash: Oslash,
  	oslash: oslash,
  	osol: osol,
  	Otilde: Otilde,
  	otilde: otilde,
  	otimesas: otimesas,
  	Otimes: Otimes,
  	otimes: otimes,
  	Ouml: Ouml,
  	ouml: ouml,
  	ovbar: ovbar,
  	OverBar: OverBar,
  	OverBrace: OverBrace,
  	OverBracket: OverBracket,
  	OverParenthesis: OverParenthesis,
  	para: para,
  	parallel: parallel,
  	par: par,
  	parsim: parsim,
  	parsl: parsl,
  	part: part,
  	PartialD: PartialD,
  	Pcy: Pcy,
  	pcy: pcy,
  	percnt: percnt,
  	period: period,
  	permil: permil,
  	perp: perp,
  	pertenk: pertenk,
  	Pfr: Pfr,
  	pfr: pfr,
  	Phi: Phi,
  	phi: phi,
  	phiv: phiv,
  	phmmat: phmmat,
  	phone: phone,
  	Pi: Pi,
  	pi: pi,
  	pitchfork: pitchfork,
  	piv: piv,
  	planck: planck,
  	planckh: planckh,
  	plankv: plankv,
  	plusacir: plusacir,
  	plusb: plusb,
  	pluscir: pluscir,
  	plus: plus,
  	plusdo: plusdo,
  	plusdu: plusdu,
  	pluse: pluse,
  	PlusMinus: PlusMinus,
  	plusmn: plusmn,
  	plussim: plussim,
  	plustwo: plustwo,
  	pm: pm,
  	Poincareplane: Poincareplane,
  	pointint: pointint,
  	popf: popf,
  	Popf: Popf,
  	pound: pound,
  	prap: prap,
  	Pr: Pr,
  	pr: pr,
  	prcue: prcue,
  	precapprox: precapprox,
  	prec: prec,
  	preccurlyeq: preccurlyeq,
  	Precedes: Precedes,
  	PrecedesEqual: PrecedesEqual,
  	PrecedesSlantEqual: PrecedesSlantEqual,
  	PrecedesTilde: PrecedesTilde,
  	preceq: preceq,
  	precnapprox: precnapprox,
  	precneqq: precneqq,
  	precnsim: precnsim,
  	pre: pre,
  	prE: prE,
  	precsim: precsim,
  	prime: prime,
  	Prime: Prime,
  	primes: primes,
  	prnap: prnap,
  	prnE: prnE,
  	prnsim: prnsim,
  	prod: prod,
  	Product: Product,
  	profalar: profalar,
  	profline: profline,
  	profsurf: profsurf,
  	prop: prop,
  	Proportional: Proportional,
  	Proportion: Proportion,
  	propto: propto,
  	prsim: prsim,
  	prurel: prurel,
  	Pscr: Pscr,
  	pscr: pscr,
  	Psi: Psi,
  	psi: psi,
  	puncsp: puncsp,
  	Qfr: Qfr,
  	qfr: qfr,
  	qint: qint,
  	qopf: qopf,
  	Qopf: Qopf,
  	qprime: qprime,
  	Qscr: Qscr,
  	qscr: qscr,
  	quaternions: quaternions,
  	quatint: quatint,
  	quest: quest,
  	questeq: questeq,
  	quot: quot,
  	QUOT: QUOT,
  	rAarr: rAarr,
  	race: race,
  	Racute: Racute,
  	racute: racute,
  	radic: radic,
  	raemptyv: raemptyv,
  	rang: rang,
  	Rang: Rang,
  	rangd: rangd,
  	range: range,
  	rangle: rangle,
  	raquo: raquo,
  	rarrap: rarrap,
  	rarrb: rarrb,
  	rarrbfs: rarrbfs,
  	rarrc: rarrc,
  	rarr: rarr,
  	Rarr: Rarr,
  	rArr: rArr,
  	rarrfs: rarrfs,
  	rarrhk: rarrhk,
  	rarrlp: rarrlp,
  	rarrpl: rarrpl,
  	rarrsim: rarrsim,
  	Rarrtl: Rarrtl,
  	rarrtl: rarrtl,
  	rarrw: rarrw,
  	ratail: ratail,
  	rAtail: rAtail,
  	ratio: ratio,
  	rationals: rationals,
  	rbarr: rbarr,
  	rBarr: rBarr,
  	RBarr: RBarr,
  	rbbrk: rbbrk,
  	rbrace: rbrace,
  	rbrack: rbrack,
  	rbrke: rbrke,
  	rbrksld: rbrksld,
  	rbrkslu: rbrkslu,
  	Rcaron: Rcaron,
  	rcaron: rcaron,
  	Rcedil: Rcedil,
  	rcedil: rcedil,
  	rceil: rceil,
  	rcub: rcub,
  	Rcy: Rcy,
  	rcy: rcy,
  	rdca: rdca,
  	rdldhar: rdldhar,
  	rdquo: rdquo,
  	rdquor: rdquor,
  	rdsh: rdsh,
  	real: real,
  	realine: realine,
  	realpart: realpart,
  	reals: reals,
  	Re: Re,
  	rect: rect,
  	reg: reg,
  	REG: REG,
  	ReverseElement: ReverseElement,
  	ReverseEquilibrium: ReverseEquilibrium,
  	ReverseUpEquilibrium: ReverseUpEquilibrium,
  	rfisht: rfisht,
  	rfloor: rfloor,
  	rfr: rfr,
  	Rfr: Rfr,
  	rHar: rHar,
  	rhard: rhard,
  	rharu: rharu,
  	rharul: rharul,
  	Rho: Rho,
  	rho: rho,
  	rhov: rhov,
  	RightAngleBracket: RightAngleBracket,
  	RightArrowBar: RightArrowBar,
  	rightarrow: rightarrow,
  	RightArrow: RightArrow,
  	Rightarrow: Rightarrow,
  	RightArrowLeftArrow: RightArrowLeftArrow,
  	rightarrowtail: rightarrowtail,
  	RightCeiling: RightCeiling,
  	RightDoubleBracket: RightDoubleBracket,
  	RightDownTeeVector: RightDownTeeVector,
  	RightDownVectorBar: RightDownVectorBar,
  	RightDownVector: RightDownVector,
  	RightFloor: RightFloor,
  	rightharpoondown: rightharpoondown,
  	rightharpoonup: rightharpoonup,
  	rightleftarrows: rightleftarrows,
  	rightleftharpoons: rightleftharpoons,
  	rightrightarrows: rightrightarrows,
  	rightsquigarrow: rightsquigarrow,
  	RightTeeArrow: RightTeeArrow,
  	RightTee: RightTee,
  	RightTeeVector: RightTeeVector,
  	rightthreetimes: rightthreetimes,
  	RightTriangleBar: RightTriangleBar,
  	RightTriangle: RightTriangle,
  	RightTriangleEqual: RightTriangleEqual,
  	RightUpDownVector: RightUpDownVector,
  	RightUpTeeVector: RightUpTeeVector,
  	RightUpVectorBar: RightUpVectorBar,
  	RightUpVector: RightUpVector,
  	RightVectorBar: RightVectorBar,
  	RightVector: RightVector,
  	ring: ring,
  	risingdotseq: risingdotseq,
  	rlarr: rlarr,
  	rlhar: rlhar,
  	rlm: rlm,
  	rmoustache: rmoustache,
  	rmoust: rmoust,
  	rnmid: rnmid,
  	roang: roang,
  	roarr: roarr,
  	robrk: robrk,
  	ropar: ropar,
  	ropf: ropf,
  	Ropf: Ropf,
  	roplus: roplus,
  	rotimes: rotimes,
  	RoundImplies: RoundImplies,
  	rpar: rpar,
  	rpargt: rpargt,
  	rppolint: rppolint,
  	rrarr: rrarr,
  	Rrightarrow: Rrightarrow,
  	rsaquo: rsaquo,
  	rscr: rscr,
  	Rscr: Rscr,
  	rsh: rsh,
  	Rsh: Rsh,
  	rsqb: rsqb,
  	rsquo: rsquo,
  	rsquor: rsquor,
  	rthree: rthree,
  	rtimes: rtimes,
  	rtri: rtri,
  	rtrie: rtrie,
  	rtrif: rtrif,
  	rtriltri: rtriltri,
  	RuleDelayed: RuleDelayed,
  	ruluhar: ruluhar,
  	rx: rx,
  	Sacute: Sacute,
  	sacute: sacute,
  	sbquo: sbquo,
  	scap: scap,
  	Scaron: Scaron,
  	scaron: scaron,
  	Sc: Sc,
  	sc: sc,
  	sccue: sccue,
  	sce: sce,
  	scE: scE,
  	Scedil: Scedil,
  	scedil: scedil,
  	Scirc: Scirc,
  	scirc: scirc,
  	scnap: scnap,
  	scnE: scnE,
  	scnsim: scnsim,
  	scpolint: scpolint,
  	scsim: scsim,
  	Scy: Scy,
  	scy: scy,
  	sdotb: sdotb,
  	sdot: sdot,
  	sdote: sdote,
  	searhk: searhk,
  	searr: searr,
  	seArr: seArr,
  	searrow: searrow,
  	sect: sect,
  	semi: semi,
  	seswar: seswar,
  	setminus: setminus,
  	setmn: setmn,
  	sext: sext,
  	Sfr: Sfr,
  	sfr: sfr,
  	sfrown: sfrown,
  	sharp: sharp,
  	SHCHcy: SHCHcy,
  	shchcy: shchcy,
  	SHcy: SHcy,
  	shcy: shcy,
  	ShortDownArrow: ShortDownArrow,
  	ShortLeftArrow: ShortLeftArrow,
  	shortmid: shortmid,
  	shortparallel: shortparallel,
  	ShortRightArrow: ShortRightArrow,
  	ShortUpArrow: ShortUpArrow,
  	shy: shy,
  	Sigma: Sigma,
  	sigma: sigma,
  	sigmaf: sigmaf,
  	sigmav: sigmav,
  	sim: sim,
  	simdot: simdot,
  	sime: sime,
  	simeq: simeq,
  	simg: simg,
  	simgE: simgE,
  	siml: siml,
  	simlE: simlE,
  	simne: simne,
  	simplus: simplus,
  	simrarr: simrarr,
  	slarr: slarr,
  	SmallCircle: SmallCircle,
  	smallsetminus: smallsetminus,
  	smashp: smashp,
  	smeparsl: smeparsl,
  	smid: smid,
  	smile: smile,
  	smt: smt,
  	smte: smte,
  	smtes: smtes,
  	SOFTcy: SOFTcy,
  	softcy: softcy,
  	solbar: solbar,
  	solb: solb,
  	sol: sol,
  	Sopf: Sopf,
  	sopf: sopf,
  	spades: spades,
  	spadesuit: spadesuit,
  	spar: spar,
  	sqcap: sqcap,
  	sqcaps: sqcaps,
  	sqcup: sqcup,
  	sqcups: sqcups,
  	Sqrt: Sqrt,
  	sqsub: sqsub,
  	sqsube: sqsube,
  	sqsubset: sqsubset,
  	sqsubseteq: sqsubseteq,
  	sqsup: sqsup,
  	sqsupe: sqsupe,
  	sqsupset: sqsupset,
  	sqsupseteq: sqsupseteq,
  	square: square,
  	Square: Square,
  	SquareIntersection: SquareIntersection,
  	SquareSubset: SquareSubset,
  	SquareSubsetEqual: SquareSubsetEqual,
  	SquareSuperset: SquareSuperset,
  	SquareSupersetEqual: SquareSupersetEqual,
  	SquareUnion: SquareUnion,
  	squarf: squarf,
  	squ: squ,
  	squf: squf,
  	srarr: srarr,
  	Sscr: Sscr,
  	sscr: sscr,
  	ssetmn: ssetmn,
  	ssmile: ssmile,
  	sstarf: sstarf,
  	Star: Star,
  	star: star,
  	starf: starf,
  	straightepsilon: straightepsilon,
  	straightphi: straightphi,
  	strns: strns,
  	sub: sub,
  	Sub: Sub,
  	subdot: subdot,
  	subE: subE,
  	sube: sube,
  	subedot: subedot,
  	submult: submult,
  	subnE: subnE,
  	subne: subne,
  	subplus: subplus,
  	subrarr: subrarr,
  	subset: subset,
  	Subset: Subset,
  	subseteq: subseteq,
  	subseteqq: subseteqq,
  	SubsetEqual: SubsetEqual,
  	subsetneq: subsetneq,
  	subsetneqq: subsetneqq,
  	subsim: subsim,
  	subsub: subsub,
  	subsup: subsup,
  	succapprox: succapprox,
  	succ: succ,
  	succcurlyeq: succcurlyeq,
  	Succeeds: Succeeds,
  	SucceedsEqual: SucceedsEqual,
  	SucceedsSlantEqual: SucceedsSlantEqual,
  	SucceedsTilde: SucceedsTilde,
  	succeq: succeq,
  	succnapprox: succnapprox,
  	succneqq: succneqq,
  	succnsim: succnsim,
  	succsim: succsim,
  	SuchThat: SuchThat,
  	sum: sum,
  	Sum: Sum,
  	sung: sung,
  	sup1: sup1,
  	sup2: sup2,
  	sup3: sup3,
  	sup: sup,
  	Sup: Sup,
  	supdot: supdot,
  	supdsub: supdsub,
  	supE: supE,
  	supe: supe,
  	supedot: supedot,
  	Superset: Superset,
  	SupersetEqual: SupersetEqual,
  	suphsol: suphsol,
  	suphsub: suphsub,
  	suplarr: suplarr,
  	supmult: supmult,
  	supnE: supnE,
  	supne: supne,
  	supplus: supplus,
  	supset: supset,
  	Supset: Supset,
  	supseteq: supseteq,
  	supseteqq: supseteqq,
  	supsetneq: supsetneq,
  	supsetneqq: supsetneqq,
  	supsim: supsim,
  	supsub: supsub,
  	supsup: supsup,
  	swarhk: swarhk,
  	swarr: swarr,
  	swArr: swArr,
  	swarrow: swarrow,
  	swnwar: swnwar,
  	szlig: szlig,
  	Tab: Tab,
  	target: target,
  	Tau: Tau,
  	tau: tau,
  	tbrk: tbrk,
  	Tcaron: Tcaron,
  	tcaron: tcaron,
  	Tcedil: Tcedil,
  	tcedil: tcedil,
  	Tcy: Tcy,
  	tcy: tcy,
  	tdot: tdot,
  	telrec: telrec,
  	Tfr: Tfr,
  	tfr: tfr,
  	there4: there4,
  	therefore: therefore,
  	Therefore: Therefore,
  	Theta: Theta,
  	theta: theta,
  	thetasym: thetasym,
  	thetav: thetav,
  	thickapprox: thickapprox,
  	thicksim: thicksim,
  	ThickSpace: ThickSpace,
  	ThinSpace: ThinSpace,
  	thinsp: thinsp,
  	thkap: thkap,
  	thksim: thksim,
  	THORN: THORN,
  	thorn: thorn,
  	tilde: tilde,
  	Tilde: Tilde,
  	TildeEqual: TildeEqual,
  	TildeFullEqual: TildeFullEqual,
  	TildeTilde: TildeTilde,
  	timesbar: timesbar,
  	timesb: timesb,
  	times: times,
  	timesd: timesd,
  	tint: tint,
  	toea: toea,
  	topbot: topbot,
  	topcir: topcir,
  	top: top,
  	Topf: Topf,
  	topf: topf,
  	topfork: topfork,
  	tosa: tosa,
  	tprime: tprime,
  	trade: trade,
  	TRADE: TRADE,
  	triangle: triangle,
  	triangledown: triangledown,
  	triangleleft: triangleleft,
  	trianglelefteq: trianglelefteq,
  	triangleq: triangleq,
  	triangleright: triangleright,
  	trianglerighteq: trianglerighteq,
  	tridot: tridot,
  	trie: trie,
  	triminus: triminus,
  	TripleDot: TripleDot,
  	triplus: triplus,
  	trisb: trisb,
  	tritime: tritime,
  	trpezium: trpezium,
  	Tscr: Tscr,
  	tscr: tscr,
  	TScy: TScy,
  	tscy: tscy,
  	TSHcy: TSHcy,
  	tshcy: tshcy,
  	Tstrok: Tstrok,
  	tstrok: tstrok,
  	twixt: twixt,
  	twoheadleftarrow: twoheadleftarrow,
  	twoheadrightarrow: twoheadrightarrow,
  	Uacute: Uacute,
  	uacute: uacute,
  	uarr: uarr,
  	Uarr: Uarr,
  	uArr: uArr,
  	Uarrocir: Uarrocir,
  	Ubrcy: Ubrcy,
  	ubrcy: ubrcy,
  	Ubreve: Ubreve,
  	ubreve: ubreve,
  	Ucirc: Ucirc,
  	ucirc: ucirc,
  	Ucy: Ucy,
  	ucy: ucy,
  	udarr: udarr,
  	Udblac: Udblac,
  	udblac: udblac,
  	udhar: udhar,
  	ufisht: ufisht,
  	Ufr: Ufr,
  	ufr: ufr,
  	Ugrave: Ugrave,
  	ugrave: ugrave,
  	uHar: uHar,
  	uharl: uharl,
  	uharr: uharr,
  	uhblk: uhblk,
  	ulcorn: ulcorn,
  	ulcorner: ulcorner,
  	ulcrop: ulcrop,
  	ultri: ultri,
  	Umacr: Umacr,
  	umacr: umacr,
  	uml: uml,
  	UnderBar: UnderBar,
  	UnderBrace: UnderBrace,
  	UnderBracket: UnderBracket,
  	UnderParenthesis: UnderParenthesis,
  	Union: Union,
  	UnionPlus: UnionPlus,
  	Uogon: Uogon,
  	uogon: uogon,
  	Uopf: Uopf,
  	uopf: uopf,
  	UpArrowBar: UpArrowBar,
  	uparrow: uparrow,
  	UpArrow: UpArrow,
  	Uparrow: Uparrow,
  	UpArrowDownArrow: UpArrowDownArrow,
  	updownarrow: updownarrow,
  	UpDownArrow: UpDownArrow,
  	Updownarrow: Updownarrow,
  	UpEquilibrium: UpEquilibrium,
  	upharpoonleft: upharpoonleft,
  	upharpoonright: upharpoonright,
  	uplus: uplus,
  	UpperLeftArrow: UpperLeftArrow,
  	UpperRightArrow: UpperRightArrow,
  	upsi: upsi,
  	Upsi: Upsi,
  	upsih: upsih,
  	Upsilon: Upsilon,
  	upsilon: upsilon,
  	UpTeeArrow: UpTeeArrow,
  	UpTee: UpTee,
  	upuparrows: upuparrows,
  	urcorn: urcorn,
  	urcorner: urcorner,
  	urcrop: urcrop,
  	Uring: Uring,
  	uring: uring,
  	urtri: urtri,
  	Uscr: Uscr,
  	uscr: uscr,
  	utdot: utdot,
  	Utilde: Utilde,
  	utilde: utilde,
  	utri: utri,
  	utrif: utrif,
  	uuarr: uuarr,
  	Uuml: Uuml,
  	uuml: uuml,
  	uwangle: uwangle,
  	vangrt: vangrt,
  	varepsilon: varepsilon,
  	varkappa: varkappa,
  	varnothing: varnothing,
  	varphi: varphi,
  	varpi: varpi,
  	varpropto: varpropto,
  	varr: varr,
  	vArr: vArr,
  	varrho: varrho,
  	varsigma: varsigma,
  	varsubsetneq: varsubsetneq,
  	varsubsetneqq: varsubsetneqq,
  	varsupsetneq: varsupsetneq,
  	varsupsetneqq: varsupsetneqq,
  	vartheta: vartheta,
  	vartriangleleft: vartriangleleft,
  	vartriangleright: vartriangleright,
  	vBar: vBar,
  	Vbar: Vbar,
  	vBarv: vBarv,
  	Vcy: Vcy,
  	vcy: vcy,
  	vdash: vdash,
  	vDash: vDash,
  	Vdash: Vdash,
  	VDash: VDash,
  	Vdashl: Vdashl,
  	veebar: veebar,
  	vee: vee,
  	Vee: Vee,
  	veeeq: veeeq,
  	vellip: vellip,
  	verbar: verbar,
  	Verbar: Verbar,
  	vert: vert,
  	Vert: Vert,
  	VerticalBar: VerticalBar,
  	VerticalLine: VerticalLine,
  	VerticalSeparator: VerticalSeparator,
  	VerticalTilde: VerticalTilde,
  	VeryThinSpace: VeryThinSpace,
  	Vfr: Vfr,
  	vfr: vfr,
  	vltri: vltri,
  	vnsub: vnsub,
  	vnsup: vnsup,
  	Vopf: Vopf,
  	vopf: vopf,
  	vprop: vprop,
  	vrtri: vrtri,
  	Vscr: Vscr,
  	vscr: vscr,
  	vsubnE: vsubnE,
  	vsubne: vsubne,
  	vsupnE: vsupnE,
  	vsupne: vsupne,
  	Vvdash: Vvdash,
  	vzigzag: vzigzag,
  	Wcirc: Wcirc,
  	wcirc: wcirc,
  	wedbar: wedbar,
  	wedge: wedge,
  	Wedge: Wedge,
  	wedgeq: wedgeq,
  	weierp: weierp,
  	Wfr: Wfr,
  	wfr: wfr,
  	Wopf: Wopf,
  	wopf: wopf,
  	wp: wp,
  	wr: wr,
  	wreath: wreath,
  	Wscr: Wscr,
  	wscr: wscr,
  	xcap: xcap,
  	xcirc: xcirc,
  	xcup: xcup,
  	xdtri: xdtri,
  	Xfr: Xfr,
  	xfr: xfr,
  	xharr: xharr,
  	xhArr: xhArr,
  	Xi: Xi,
  	xi: xi,
  	xlarr: xlarr,
  	xlArr: xlArr,
  	xmap: xmap,
  	xnis: xnis,
  	xodot: xodot,
  	Xopf: Xopf,
  	xopf: xopf,
  	xoplus: xoplus,
  	xotime: xotime,
  	xrarr: xrarr,
  	xrArr: xrArr,
  	Xscr: Xscr,
  	xscr: xscr,
  	xsqcup: xsqcup,
  	xuplus: xuplus,
  	xutri: xutri,
  	xvee: xvee,
  	xwedge: xwedge,
  	Yacute: Yacute,
  	yacute: yacute,
  	YAcy: YAcy,
  	yacy: yacy,
  	Ycirc: Ycirc,
  	ycirc: ycirc,
  	Ycy: Ycy,
  	ycy: ycy,
  	yen: yen,
  	Yfr: Yfr,
  	yfr: yfr,
  	YIcy: YIcy,
  	yicy: yicy,
  	Yopf: Yopf,
  	yopf: yopf,
  	Yscr: Yscr,
  	yscr: yscr,
  	YUcy: YUcy,
  	yucy: yucy,
  	yuml: yuml,
  	Yuml: Yuml,
  	Zacute: Zacute,
  	zacute: zacute,
  	Zcaron: Zcaron,
  	zcaron: zcaron,
  	Zcy: Zcy,
  	zcy: zcy,
  	Zdot: Zdot,
  	zdot: zdot,
  	zeetrf: zeetrf,
  	ZeroWidthSpace: ZeroWidthSpace,
  	Zeta: Zeta,
  	zeta: zeta,
  	zfr: zfr,
  	Zfr: Zfr,
  	ZHcy: ZHcy,
  	zhcy: zhcy,
  	zigrarr: zigrarr,
  	zopf: zopf,
  	Zopf: Zopf,
  	Zscr: Zscr,
  	zscr: zscr,
  	zwj: zwj,
  	zwnj: zwnj
  };

  var entities$1 = /*#__PURE__*/Object.freeze({
    Aacute: Aacute,
    aacute: aacute,
    Abreve: Abreve,
    abreve: abreve,
    ac: ac,
    acd: acd,
    acE: acE,
    Acirc: Acirc,
    acirc: acirc,
    acute: acute,
    Acy: Acy,
    acy: acy,
    AElig: AElig,
    aelig: aelig,
    af: af,
    Afr: Afr,
    afr: afr,
    Agrave: Agrave,
    agrave: agrave,
    alefsym: alefsym,
    aleph: aleph,
    Alpha: Alpha,
    alpha: alpha,
    Amacr: Amacr,
    amacr: amacr,
    amalg: amalg,
    amp: amp,
    AMP: AMP,
    andand: andand,
    And: And,
    and: and,
    andd: andd,
    andslope: andslope,
    andv: andv,
    ang: ang,
    ange: ange,
    angle: angle,
    angmsdaa: angmsdaa,
    angmsdab: angmsdab,
    angmsdac: angmsdac,
    angmsdad: angmsdad,
    angmsdae: angmsdae,
    angmsdaf: angmsdaf,
    angmsdag: angmsdag,
    angmsdah: angmsdah,
    angmsd: angmsd,
    angrt: angrt,
    angrtvb: angrtvb,
    angrtvbd: angrtvbd,
    angsph: angsph,
    angst: angst,
    angzarr: angzarr,
    Aogon: Aogon,
    aogon: aogon,
    Aopf: Aopf,
    aopf: aopf,
    apacir: apacir,
    ap: ap,
    apE: apE,
    ape: ape,
    apid: apid,
    apos: apos,
    ApplyFunction: ApplyFunction,
    approx: approx,
    approxeq: approxeq,
    Aring: Aring,
    aring: aring,
    Ascr: Ascr,
    ascr: ascr,
    Assign: Assign,
    ast: ast,
    asymp: asymp,
    asympeq: asympeq,
    Atilde: Atilde,
    atilde: atilde,
    Auml: Auml,
    auml: auml,
    awconint: awconint,
    awint: awint,
    backcong: backcong,
    backepsilon: backepsilon,
    backprime: backprime,
    backsim: backsim,
    backsimeq: backsimeq,
    Backslash: Backslash,
    Barv: Barv,
    barvee: barvee,
    barwed: barwed,
    Barwed: Barwed,
    barwedge: barwedge,
    bbrk: bbrk,
    bbrktbrk: bbrktbrk,
    bcong: bcong,
    Bcy: Bcy,
    bcy: bcy,
    bdquo: bdquo,
    becaus: becaus,
    because: because,
    Because: Because,
    bemptyv: bemptyv,
    bepsi: bepsi,
    bernou: bernou,
    Bernoullis: Bernoullis,
    Beta: Beta,
    beta: beta,
    beth: beth,
    between: between,
    Bfr: Bfr,
    bfr: bfr,
    bigcap: bigcap,
    bigcirc: bigcirc,
    bigcup: bigcup,
    bigodot: bigodot,
    bigoplus: bigoplus,
    bigotimes: bigotimes,
    bigsqcup: bigsqcup,
    bigstar: bigstar,
    bigtriangledown: bigtriangledown,
    bigtriangleup: bigtriangleup,
    biguplus: biguplus,
    bigvee: bigvee,
    bigwedge: bigwedge,
    bkarow: bkarow,
    blacklozenge: blacklozenge,
    blacksquare: blacksquare,
    blacktriangle: blacktriangle,
    blacktriangledown: blacktriangledown,
    blacktriangleleft: blacktriangleleft,
    blacktriangleright: blacktriangleright,
    blank: blank,
    blk12: blk12,
    blk14: blk14,
    blk34: blk34,
    block: block,
    bne: bne,
    bnequiv: bnequiv,
    bNot: bNot,
    bnot: bnot,
    Bopf: Bopf,
    bopf: bopf,
    bot: bot,
    bottom: bottom,
    bowtie: bowtie,
    boxbox: boxbox,
    boxdl: boxdl,
    boxdL: boxdL,
    boxDl: boxDl,
    boxDL: boxDL,
    boxdr: boxdr,
    boxdR: boxdR,
    boxDr: boxDr,
    boxDR: boxDR,
    boxh: boxh,
    boxH: boxH,
    boxhd: boxhd,
    boxHd: boxHd,
    boxhD: boxhD,
    boxHD: boxHD,
    boxhu: boxhu,
    boxHu: boxHu,
    boxhU: boxhU,
    boxHU: boxHU,
    boxminus: boxminus,
    boxplus: boxplus,
    boxtimes: boxtimes,
    boxul: boxul,
    boxuL: boxuL,
    boxUl: boxUl,
    boxUL: boxUL,
    boxur: boxur,
    boxuR: boxuR,
    boxUr: boxUr,
    boxUR: boxUR,
    boxv: boxv,
    boxV: boxV,
    boxvh: boxvh,
    boxvH: boxvH,
    boxVh: boxVh,
    boxVH: boxVH,
    boxvl: boxvl,
    boxvL: boxvL,
    boxVl: boxVl,
    boxVL: boxVL,
    boxvr: boxvr,
    boxvR: boxvR,
    boxVr: boxVr,
    boxVR: boxVR,
    bprime: bprime,
    breve: breve,
    Breve: Breve,
    brvbar: brvbar,
    bscr: bscr,
    Bscr: Bscr,
    bsemi: bsemi,
    bsim: bsim,
    bsime: bsime,
    bsolb: bsolb,
    bsol: bsol,
    bsolhsub: bsolhsub,
    bull: bull,
    bullet: bullet,
    bump: bump,
    bumpE: bumpE,
    bumpe: bumpe,
    Bumpeq: Bumpeq,
    bumpeq: bumpeq,
    Cacute: Cacute,
    cacute: cacute,
    capand: capand,
    capbrcup: capbrcup,
    capcap: capcap,
    cap: cap,
    Cap: Cap,
    capcup: capcup,
    capdot: capdot,
    CapitalDifferentialD: CapitalDifferentialD,
    caps: caps,
    caret: caret,
    caron: caron,
    Cayleys: Cayleys,
    ccaps: ccaps,
    Ccaron: Ccaron,
    ccaron: ccaron,
    Ccedil: Ccedil,
    ccedil: ccedil,
    Ccirc: Ccirc,
    ccirc: ccirc,
    Cconint: Cconint,
    ccups: ccups,
    ccupssm: ccupssm,
    Cdot: Cdot,
    cdot: cdot,
    cedil: cedil,
    Cedilla: Cedilla,
    cemptyv: cemptyv,
    cent: cent,
    centerdot: centerdot,
    CenterDot: CenterDot,
    cfr: cfr,
    Cfr: Cfr,
    CHcy: CHcy,
    chcy: chcy,
    check: check,
    checkmark: checkmark,
    Chi: Chi,
    chi: chi,
    circ: circ,
    circeq: circeq,
    circlearrowleft: circlearrowleft,
    circlearrowright: circlearrowright,
    circledast: circledast,
    circledcirc: circledcirc,
    circleddash: circleddash,
    CircleDot: CircleDot,
    circledR: circledR,
    circledS: circledS,
    CircleMinus: CircleMinus,
    CirclePlus: CirclePlus,
    CircleTimes: CircleTimes,
    cir: cir,
    cirE: cirE,
    cire: cire,
    cirfnint: cirfnint,
    cirmid: cirmid,
    cirscir: cirscir,
    ClockwiseContourIntegral: ClockwiseContourIntegral,
    CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
    CloseCurlyQuote: CloseCurlyQuote,
    clubs: clubs,
    clubsuit: clubsuit,
    colon: colon,
    Colon: Colon,
    Colone: Colone,
    colone: colone,
    coloneq: coloneq,
    comma: comma,
    commat: commat,
    comp: comp,
    compfn: compfn,
    complement: complement,
    complexes: complexes,
    cong: cong,
    congdot: congdot,
    Congruent: Congruent,
    conint: conint,
    Conint: Conint,
    ContourIntegral: ContourIntegral,
    copf: copf,
    Copf: Copf,
    coprod: coprod,
    Coproduct: Coproduct,
    copy: copy,
    COPY: COPY,
    copysr: copysr,
    CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
    crarr: crarr,
    cross: cross,
    Cross: Cross,
    Cscr: Cscr,
    cscr: cscr,
    csub: csub,
    csube: csube,
    csup: csup,
    csupe: csupe,
    ctdot: ctdot,
    cudarrl: cudarrl,
    cudarrr: cudarrr,
    cuepr: cuepr,
    cuesc: cuesc,
    cularr: cularr,
    cularrp: cularrp,
    cupbrcap: cupbrcap,
    cupcap: cupcap,
    CupCap: CupCap,
    cup: cup,
    Cup: Cup,
    cupcup: cupcup,
    cupdot: cupdot,
    cupor: cupor,
    cups: cups,
    curarr: curarr,
    curarrm: curarrm,
    curlyeqprec: curlyeqprec,
    curlyeqsucc: curlyeqsucc,
    curlyvee: curlyvee,
    curlywedge: curlywedge,
    curren: curren,
    curvearrowleft: curvearrowleft,
    curvearrowright: curvearrowright,
    cuvee: cuvee,
    cuwed: cuwed,
    cwconint: cwconint,
    cwint: cwint,
    cylcty: cylcty,
    dagger: dagger,
    Dagger: Dagger,
    daleth: daleth,
    darr: darr,
    Darr: Darr,
    dArr: dArr,
    dash: dash,
    Dashv: Dashv,
    dashv: dashv,
    dbkarow: dbkarow,
    dblac: dblac,
    Dcaron: Dcaron,
    dcaron: dcaron,
    Dcy: Dcy,
    dcy: dcy,
    ddagger: ddagger,
    ddarr: ddarr,
    DD: DD,
    dd: dd,
    DDotrahd: DDotrahd,
    ddotseq: ddotseq,
    deg: deg,
    Del: Del,
    Delta: Delta,
    delta: delta,
    demptyv: demptyv,
    dfisht: dfisht,
    Dfr: Dfr,
    dfr: dfr,
    dHar: dHar,
    dharl: dharl,
    dharr: dharr,
    DiacriticalAcute: DiacriticalAcute,
    DiacriticalDot: DiacriticalDot,
    DiacriticalDoubleAcute: DiacriticalDoubleAcute,
    DiacriticalGrave: DiacriticalGrave,
    DiacriticalTilde: DiacriticalTilde,
    diam: diam,
    diamond: diamond,
    Diamond: Diamond,
    diamondsuit: diamondsuit,
    diams: diams,
    die: die,
    DifferentialD: DifferentialD,
    digamma: digamma,
    disin: disin,
    div: div,
    divide: divide,
    divideontimes: divideontimes,
    divonx: divonx,
    DJcy: DJcy,
    djcy: djcy,
    dlcorn: dlcorn,
    dlcrop: dlcrop,
    dollar: dollar,
    Dopf: Dopf,
    dopf: dopf,
    Dot: Dot,
    dot: dot,
    DotDot: DotDot,
    doteq: doteq,
    doteqdot: doteqdot,
    DotEqual: DotEqual,
    dotminus: dotminus,
    dotplus: dotplus,
    dotsquare: dotsquare,
    doublebarwedge: doublebarwedge,
    DoubleContourIntegral: DoubleContourIntegral,
    DoubleDot: DoubleDot,
    DoubleDownArrow: DoubleDownArrow,
    DoubleLeftArrow: DoubleLeftArrow,
    DoubleLeftRightArrow: DoubleLeftRightArrow,
    DoubleLeftTee: DoubleLeftTee,
    DoubleLongLeftArrow: DoubleLongLeftArrow,
    DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
    DoubleLongRightArrow: DoubleLongRightArrow,
    DoubleRightArrow: DoubleRightArrow,
    DoubleRightTee: DoubleRightTee,
    DoubleUpArrow: DoubleUpArrow,
    DoubleUpDownArrow: DoubleUpDownArrow,
    DoubleVerticalBar: DoubleVerticalBar,
    DownArrowBar: DownArrowBar,
    downarrow: downarrow,
    DownArrow: DownArrow,
    Downarrow: Downarrow,
    DownArrowUpArrow: DownArrowUpArrow,
    DownBreve: DownBreve,
    downdownarrows: downdownarrows,
    downharpoonleft: downharpoonleft,
    downharpoonright: downharpoonright,
    DownLeftRightVector: DownLeftRightVector,
    DownLeftTeeVector: DownLeftTeeVector,
    DownLeftVectorBar: DownLeftVectorBar,
    DownLeftVector: DownLeftVector,
    DownRightTeeVector: DownRightTeeVector,
    DownRightVectorBar: DownRightVectorBar,
    DownRightVector: DownRightVector,
    DownTeeArrow: DownTeeArrow,
    DownTee: DownTee,
    drbkarow: drbkarow,
    drcorn: drcorn,
    drcrop: drcrop,
    Dscr: Dscr,
    dscr: dscr,
    DScy: DScy,
    dscy: dscy,
    dsol: dsol,
    Dstrok: Dstrok,
    dstrok: dstrok,
    dtdot: dtdot,
    dtri: dtri,
    dtrif: dtrif,
    duarr: duarr,
    duhar: duhar,
    dwangle: dwangle,
    DZcy: DZcy,
    dzcy: dzcy,
    dzigrarr: dzigrarr,
    Eacute: Eacute,
    eacute: eacute,
    easter: easter,
    Ecaron: Ecaron,
    ecaron: ecaron,
    Ecirc: Ecirc,
    ecirc: ecirc,
    ecir: ecir,
    ecolon: ecolon,
    Ecy: Ecy,
    ecy: ecy,
    eDDot: eDDot,
    Edot: Edot,
    edot: edot,
    eDot: eDot,
    ee: ee,
    efDot: efDot,
    Efr: Efr,
    efr: efr,
    eg: eg,
    Egrave: Egrave,
    egrave: egrave,
    egs: egs,
    egsdot: egsdot,
    el: el,
    Element: Element,
    elinters: elinters,
    ell: ell,
    els: els,
    elsdot: elsdot,
    Emacr: Emacr,
    emacr: emacr,
    empty: empty,
    emptyset: emptyset,
    EmptySmallSquare: EmptySmallSquare,
    emptyv: emptyv,
    EmptyVerySmallSquare: EmptyVerySmallSquare,
    emsp13: emsp13,
    emsp14: emsp14,
    emsp: emsp,
    ENG: ENG,
    eng: eng,
    ensp: ensp,
    Eogon: Eogon,
    eogon: eogon,
    Eopf: Eopf,
    eopf: eopf,
    epar: epar,
    eparsl: eparsl,
    eplus: eplus,
    epsi: epsi,
    Epsilon: Epsilon,
    epsilon: epsilon,
    epsiv: epsiv,
    eqcirc: eqcirc,
    eqcolon: eqcolon,
    eqsim: eqsim,
    eqslantgtr: eqslantgtr,
    eqslantless: eqslantless,
    Equal: Equal,
    equals: equals,
    EqualTilde: EqualTilde,
    equest: equest,
    Equilibrium: Equilibrium,
    equiv: equiv,
    equivDD: equivDD,
    eqvparsl: eqvparsl,
    erarr: erarr,
    erDot: erDot,
    escr: escr,
    Escr: Escr,
    esdot: esdot,
    Esim: Esim,
    esim: esim,
    Eta: Eta,
    eta: eta,
    ETH: ETH,
    eth: eth,
    Euml: Euml,
    euml: euml,
    euro: euro,
    excl: excl,
    exist: exist,
    Exists: Exists,
    expectation: expectation,
    exponentiale: exponentiale,
    ExponentialE: ExponentialE,
    fallingdotseq: fallingdotseq,
    Fcy: Fcy,
    fcy: fcy,
    female: female,
    ffilig: ffilig,
    fflig: fflig,
    ffllig: ffllig,
    Ffr: Ffr,
    ffr: ffr,
    filig: filig,
    FilledSmallSquare: FilledSmallSquare,
    FilledVerySmallSquare: FilledVerySmallSquare,
    fjlig: fjlig,
    flat: flat,
    fllig: fllig,
    fltns: fltns,
    fnof: fnof,
    Fopf: Fopf,
    fopf: fopf,
    forall: forall,
    ForAll: ForAll,
    fork: fork,
    forkv: forkv,
    Fouriertrf: Fouriertrf,
    fpartint: fpartint,
    frac12: frac12,
    frac13: frac13,
    frac14: frac14,
    frac15: frac15,
    frac16: frac16,
    frac18: frac18,
    frac23: frac23,
    frac25: frac25,
    frac34: frac34,
    frac35: frac35,
    frac38: frac38,
    frac45: frac45,
    frac56: frac56,
    frac58: frac58,
    frac78: frac78,
    frasl: frasl,
    frown: frown,
    fscr: fscr,
    Fscr: Fscr,
    gacute: gacute,
    Gamma: Gamma,
    gamma: gamma,
    Gammad: Gammad,
    gammad: gammad,
    gap: gap,
    Gbreve: Gbreve,
    gbreve: gbreve,
    Gcedil: Gcedil,
    Gcirc: Gcirc,
    gcirc: gcirc,
    Gcy: Gcy,
    gcy: gcy,
    Gdot: Gdot,
    gdot: gdot,
    ge: ge,
    gE: gE,
    gEl: gEl,
    gel: gel,
    geq: geq,
    geqq: geqq,
    geqslant: geqslant,
    gescc: gescc,
    ges: ges,
    gesdot: gesdot,
    gesdoto: gesdoto,
    gesdotol: gesdotol,
    gesl: gesl,
    gesles: gesles,
    Gfr: Gfr,
    gfr: gfr,
    gg: gg,
    Gg: Gg,
    ggg: ggg,
    gimel: gimel,
    GJcy: GJcy,
    gjcy: gjcy,
    gla: gla,
    gl: gl,
    glE: glE,
    glj: glj,
    gnap: gnap,
    gnapprox: gnapprox,
    gne: gne,
    gnE: gnE,
    gneq: gneq,
    gneqq: gneqq,
    gnsim: gnsim,
    Gopf: Gopf,
    gopf: gopf,
    grave: grave,
    GreaterEqual: GreaterEqual,
    GreaterEqualLess: GreaterEqualLess,
    GreaterFullEqual: GreaterFullEqual,
    GreaterGreater: GreaterGreater,
    GreaterLess: GreaterLess,
    GreaterSlantEqual: GreaterSlantEqual,
    GreaterTilde: GreaterTilde,
    Gscr: Gscr,
    gscr: gscr,
    gsim: gsim,
    gsime: gsime,
    gsiml: gsiml,
    gtcc: gtcc,
    gtcir: gtcir,
    gt: gt,
    GT: GT,
    Gt: Gt,
    gtdot: gtdot,
    gtlPar: gtlPar,
    gtquest: gtquest,
    gtrapprox: gtrapprox,
    gtrarr: gtrarr,
    gtrdot: gtrdot,
    gtreqless: gtreqless,
    gtreqqless: gtreqqless,
    gtrless: gtrless,
    gtrsim: gtrsim,
    gvertneqq: gvertneqq,
    gvnE: gvnE,
    Hacek: Hacek,
    hairsp: hairsp,
    half: half,
    hamilt: hamilt,
    HARDcy: HARDcy,
    hardcy: hardcy,
    harrcir: harrcir,
    harr: harr,
    hArr: hArr,
    harrw: harrw,
    Hat: Hat,
    hbar: hbar,
    Hcirc: Hcirc,
    hcirc: hcirc,
    hearts: hearts,
    heartsuit: heartsuit,
    hellip: hellip,
    hercon: hercon,
    hfr: hfr,
    Hfr: Hfr,
    HilbertSpace: HilbertSpace,
    hksearow: hksearow,
    hkswarow: hkswarow,
    hoarr: hoarr,
    homtht: homtht,
    hookleftarrow: hookleftarrow,
    hookrightarrow: hookrightarrow,
    hopf: hopf,
    Hopf: Hopf,
    horbar: horbar,
    HorizontalLine: HorizontalLine,
    hscr: hscr,
    Hscr: Hscr,
    hslash: hslash,
    Hstrok: Hstrok,
    hstrok: hstrok,
    HumpDownHump: HumpDownHump,
    HumpEqual: HumpEqual,
    hybull: hybull,
    hyphen: hyphen,
    Iacute: Iacute,
    iacute: iacute,
    ic: ic,
    Icirc: Icirc,
    icirc: icirc,
    Icy: Icy,
    icy: icy,
    Idot: Idot,
    IEcy: IEcy,
    iecy: iecy,
    iexcl: iexcl,
    iff: iff,
    ifr: ifr,
    Ifr: Ifr,
    Igrave: Igrave,
    igrave: igrave,
    ii: ii,
    iiiint: iiiint,
    iiint: iiint,
    iinfin: iinfin,
    iiota: iiota,
    IJlig: IJlig,
    ijlig: ijlig,
    Imacr: Imacr,
    imacr: imacr,
    image: image,
    ImaginaryI: ImaginaryI,
    imagline: imagline,
    imagpart: imagpart,
    imath: imath,
    Im: Im,
    imof: imof,
    imped: imped,
    Implies: Implies,
    incare: incare,
    infin: infin,
    infintie: infintie,
    inodot: inodot,
    intcal: intcal,
    int: int,
    Int: Int,
    integers: integers,
    Integral: Integral,
    intercal: intercal,
    Intersection: Intersection,
    intlarhk: intlarhk,
    intprod: intprod,
    InvisibleComma: InvisibleComma,
    InvisibleTimes: InvisibleTimes,
    IOcy: IOcy,
    iocy: iocy,
    Iogon: Iogon,
    iogon: iogon,
    Iopf: Iopf,
    iopf: iopf,
    Iota: Iota,
    iota: iota,
    iprod: iprod,
    iquest: iquest,
    iscr: iscr,
    Iscr: Iscr,
    isin: isin,
    isindot: isindot,
    isinE: isinE,
    isins: isins,
    isinsv: isinsv,
    isinv: isinv,
    it: it,
    Itilde: Itilde,
    itilde: itilde,
    Iukcy: Iukcy,
    iukcy: iukcy,
    Iuml: Iuml,
    iuml: iuml,
    Jcirc: Jcirc,
    jcirc: jcirc,
    Jcy: Jcy,
    jcy: jcy,
    Jfr: Jfr,
    jfr: jfr,
    jmath: jmath,
    Jopf: Jopf,
    jopf: jopf,
    Jscr: Jscr,
    jscr: jscr,
    Jsercy: Jsercy,
    jsercy: jsercy,
    Jukcy: Jukcy,
    jukcy: jukcy,
    Kappa: Kappa,
    kappa: kappa,
    kappav: kappav,
    Kcedil: Kcedil,
    kcedil: kcedil,
    Kcy: Kcy,
    kcy: kcy,
    Kfr: Kfr,
    kfr: kfr,
    kgreen: kgreen,
    KHcy: KHcy,
    khcy: khcy,
    KJcy: KJcy,
    kjcy: kjcy,
    Kopf: Kopf,
    kopf: kopf,
    Kscr: Kscr,
    kscr: kscr,
    lAarr: lAarr,
    Lacute: Lacute,
    lacute: lacute,
    laemptyv: laemptyv,
    lagran: lagran,
    Lambda: Lambda,
    lambda: lambda,
    lang: lang,
    Lang: Lang,
    langd: langd,
    langle: langle,
    lap: lap,
    Laplacetrf: Laplacetrf,
    laquo: laquo,
    larrb: larrb,
    larrbfs: larrbfs,
    larr: larr,
    Larr: Larr,
    lArr: lArr,
    larrfs: larrfs,
    larrhk: larrhk,
    larrlp: larrlp,
    larrpl: larrpl,
    larrsim: larrsim,
    larrtl: larrtl,
    latail: latail,
    lAtail: lAtail,
    lat: lat,
    late: late,
    lates: lates,
    lbarr: lbarr,
    lBarr: lBarr,
    lbbrk: lbbrk,
    lbrace: lbrace,
    lbrack: lbrack,
    lbrke: lbrke,
    lbrksld: lbrksld,
    lbrkslu: lbrkslu,
    Lcaron: Lcaron,
    lcaron: lcaron,
    Lcedil: Lcedil,
    lcedil: lcedil,
    lceil: lceil,
    lcub: lcub,
    Lcy: Lcy,
    lcy: lcy,
    ldca: ldca,
    ldquo: ldquo,
    ldquor: ldquor,
    ldrdhar: ldrdhar,
    ldrushar: ldrushar,
    ldsh: ldsh,
    le: le,
    lE: lE,
    LeftAngleBracket: LeftAngleBracket,
    LeftArrowBar: LeftArrowBar,
    leftarrow: leftarrow,
    LeftArrow: LeftArrow,
    Leftarrow: Leftarrow,
    LeftArrowRightArrow: LeftArrowRightArrow,
    leftarrowtail: leftarrowtail,
    LeftCeiling: LeftCeiling,
    LeftDoubleBracket: LeftDoubleBracket,
    LeftDownTeeVector: LeftDownTeeVector,
    LeftDownVectorBar: LeftDownVectorBar,
    LeftDownVector: LeftDownVector,
    LeftFloor: LeftFloor,
    leftharpoondown: leftharpoondown,
    leftharpoonup: leftharpoonup,
    leftleftarrows: leftleftarrows,
    leftrightarrow: leftrightarrow,
    LeftRightArrow: LeftRightArrow,
    Leftrightarrow: Leftrightarrow,
    leftrightarrows: leftrightarrows,
    leftrightharpoons: leftrightharpoons,
    leftrightsquigarrow: leftrightsquigarrow,
    LeftRightVector: LeftRightVector,
    LeftTeeArrow: LeftTeeArrow,
    LeftTee: LeftTee,
    LeftTeeVector: LeftTeeVector,
    leftthreetimes: leftthreetimes,
    LeftTriangleBar: LeftTriangleBar,
    LeftTriangle: LeftTriangle,
    LeftTriangleEqual: LeftTriangleEqual,
    LeftUpDownVector: LeftUpDownVector,
    LeftUpTeeVector: LeftUpTeeVector,
    LeftUpVectorBar: LeftUpVectorBar,
    LeftUpVector: LeftUpVector,
    LeftVectorBar: LeftVectorBar,
    LeftVector: LeftVector,
    lEg: lEg,
    leg: leg,
    leq: leq,
    leqq: leqq,
    leqslant: leqslant,
    lescc: lescc,
    les: les,
    lesdot: lesdot,
    lesdoto: lesdoto,
    lesdotor: lesdotor,
    lesg: lesg,
    lesges: lesges,
    lessapprox: lessapprox,
    lessdot: lessdot,
    lesseqgtr: lesseqgtr,
    lesseqqgtr: lesseqqgtr,
    LessEqualGreater: LessEqualGreater,
    LessFullEqual: LessFullEqual,
    LessGreater: LessGreater,
    lessgtr: lessgtr,
    LessLess: LessLess,
    lesssim: lesssim,
    LessSlantEqual: LessSlantEqual,
    LessTilde: LessTilde,
    lfisht: lfisht,
    lfloor: lfloor,
    Lfr: Lfr,
    lfr: lfr,
    lg: lg,
    lgE: lgE,
    lHar: lHar,
    lhard: lhard,
    lharu: lharu,
    lharul: lharul,
    lhblk: lhblk,
    LJcy: LJcy,
    ljcy: ljcy,
    llarr: llarr,
    ll: ll,
    Ll: Ll,
    llcorner: llcorner,
    Lleftarrow: Lleftarrow,
    llhard: llhard,
    lltri: lltri,
    Lmidot: Lmidot,
    lmidot: lmidot,
    lmoustache: lmoustache,
    lmoust: lmoust,
    lnap: lnap,
    lnapprox: lnapprox,
    lne: lne,
    lnE: lnE,
    lneq: lneq,
    lneqq: lneqq,
    lnsim: lnsim,
    loang: loang,
    loarr: loarr,
    lobrk: lobrk,
    longleftarrow: longleftarrow,
    LongLeftArrow: LongLeftArrow,
    Longleftarrow: Longleftarrow,
    longleftrightarrow: longleftrightarrow,
    LongLeftRightArrow: LongLeftRightArrow,
    Longleftrightarrow: Longleftrightarrow,
    longmapsto: longmapsto,
    longrightarrow: longrightarrow,
    LongRightArrow: LongRightArrow,
    Longrightarrow: Longrightarrow,
    looparrowleft: looparrowleft,
    looparrowright: looparrowright,
    lopar: lopar,
    Lopf: Lopf,
    lopf: lopf,
    loplus: loplus,
    lotimes: lotimes,
    lowast: lowast,
    lowbar: lowbar,
    LowerLeftArrow: LowerLeftArrow,
    LowerRightArrow: LowerRightArrow,
    loz: loz,
    lozenge: lozenge,
    lozf: lozf,
    lpar: lpar,
    lparlt: lparlt,
    lrarr: lrarr,
    lrcorner: lrcorner,
    lrhar: lrhar,
    lrhard: lrhard,
    lrm: lrm,
    lrtri: lrtri,
    lsaquo: lsaquo,
    lscr: lscr,
    Lscr: Lscr,
    lsh: lsh,
    Lsh: Lsh,
    lsim: lsim,
    lsime: lsime,
    lsimg: lsimg,
    lsqb: lsqb,
    lsquo: lsquo,
    lsquor: lsquor,
    Lstrok: Lstrok,
    lstrok: lstrok,
    ltcc: ltcc,
    ltcir: ltcir,
    lt: lt,
    LT: LT,
    Lt: Lt,
    ltdot: ltdot,
    lthree: lthree,
    ltimes: ltimes,
    ltlarr: ltlarr,
    ltquest: ltquest,
    ltri: ltri,
    ltrie: ltrie,
    ltrif: ltrif,
    ltrPar: ltrPar,
    lurdshar: lurdshar,
    luruhar: luruhar,
    lvertneqq: lvertneqq,
    lvnE: lvnE,
    macr: macr,
    male: male,
    malt: malt,
    maltese: maltese,
    map: map,
    mapsto: mapsto,
    mapstodown: mapstodown,
    mapstoleft: mapstoleft,
    mapstoup: mapstoup,
    marker: marker,
    mcomma: mcomma,
    Mcy: Mcy,
    mcy: mcy,
    mdash: mdash,
    mDDot: mDDot,
    measuredangle: measuredangle,
    MediumSpace: MediumSpace,
    Mellintrf: Mellintrf,
    Mfr: Mfr,
    mfr: mfr,
    mho: mho,
    micro: micro,
    midast: midast,
    midcir: midcir,
    mid: mid,
    middot: middot,
    minusb: minusb,
    minus: minus,
    minusd: minusd,
    minusdu: minusdu,
    MinusPlus: MinusPlus,
    mlcp: mlcp,
    mldr: mldr,
    mnplus: mnplus,
    models: models,
    Mopf: Mopf,
    mopf: mopf,
    mp: mp,
    mscr: mscr,
    Mscr: Mscr,
    mstpos: mstpos,
    Mu: Mu,
    mu: mu,
    multimap: multimap,
    mumap: mumap,
    nabla: nabla,
    Nacute: Nacute,
    nacute: nacute,
    nang: nang,
    nap: nap,
    napE: napE,
    napid: napid,
    napos: napos,
    napprox: napprox,
    natural: natural,
    naturals: naturals,
    natur: natur,
    nbsp: nbsp,
    nbump: nbump,
    nbumpe: nbumpe,
    ncap: ncap,
    Ncaron: Ncaron,
    ncaron: ncaron,
    Ncedil: Ncedil,
    ncedil: ncedil,
    ncong: ncong,
    ncongdot: ncongdot,
    ncup: ncup,
    Ncy: Ncy,
    ncy: ncy,
    ndash: ndash,
    nearhk: nearhk,
    nearr: nearr,
    neArr: neArr,
    nearrow: nearrow,
    ne: ne,
    nedot: nedot,
    NegativeMediumSpace: NegativeMediumSpace,
    NegativeThickSpace: NegativeThickSpace,
    NegativeThinSpace: NegativeThinSpace,
    NegativeVeryThinSpace: NegativeVeryThinSpace,
    nequiv: nequiv,
    nesear: nesear,
    nesim: nesim,
    NestedGreaterGreater: NestedGreaterGreater,
    NestedLessLess: NestedLessLess,
    NewLine: NewLine,
    nexist: nexist,
    nexists: nexists,
    Nfr: Nfr,
    nfr: nfr,
    ngE: ngE,
    nge: nge,
    ngeq: ngeq,
    ngeqq: ngeqq,
    ngeqslant: ngeqslant,
    nges: nges,
    nGg: nGg,
    ngsim: ngsim,
    nGt: nGt,
    ngt: ngt,
    ngtr: ngtr,
    nGtv: nGtv,
    nharr: nharr,
    nhArr: nhArr,
    nhpar: nhpar,
    ni: ni,
    nis: nis,
    nisd: nisd,
    niv: niv,
    NJcy: NJcy,
    njcy: njcy,
    nlarr: nlarr,
    nlArr: nlArr,
    nldr: nldr,
    nlE: nlE,
    nle: nle,
    nleftarrow: nleftarrow,
    nLeftarrow: nLeftarrow,
    nleftrightarrow: nleftrightarrow,
    nLeftrightarrow: nLeftrightarrow,
    nleq: nleq,
    nleqq: nleqq,
    nleqslant: nleqslant,
    nles: nles,
    nless: nless,
    nLl: nLl,
    nlsim: nlsim,
    nLt: nLt,
    nlt: nlt,
    nltri: nltri,
    nltrie: nltrie,
    nLtv: nLtv,
    nmid: nmid,
    NoBreak: NoBreak,
    NonBreakingSpace: NonBreakingSpace,
    nopf: nopf,
    Nopf: Nopf,
    Not: Not,
    not: not,
    NotCongruent: NotCongruent,
    NotCupCap: NotCupCap,
    NotDoubleVerticalBar: NotDoubleVerticalBar,
    NotElement: NotElement,
    NotEqual: NotEqual,
    NotEqualTilde: NotEqualTilde,
    NotExists: NotExists,
    NotGreater: NotGreater,
    NotGreaterEqual: NotGreaterEqual,
    NotGreaterFullEqual: NotGreaterFullEqual,
    NotGreaterGreater: NotGreaterGreater,
    NotGreaterLess: NotGreaterLess,
    NotGreaterSlantEqual: NotGreaterSlantEqual,
    NotGreaterTilde: NotGreaterTilde,
    NotHumpDownHump: NotHumpDownHump,
    NotHumpEqual: NotHumpEqual,
    notin: notin,
    notindot: notindot,
    notinE: notinE,
    notinva: notinva,
    notinvb: notinvb,
    notinvc: notinvc,
    NotLeftTriangleBar: NotLeftTriangleBar,
    NotLeftTriangle: NotLeftTriangle,
    NotLeftTriangleEqual: NotLeftTriangleEqual,
    NotLess: NotLess,
    NotLessEqual: NotLessEqual,
    NotLessGreater: NotLessGreater,
    NotLessLess: NotLessLess,
    NotLessSlantEqual: NotLessSlantEqual,
    NotLessTilde: NotLessTilde,
    NotNestedGreaterGreater: NotNestedGreaterGreater,
    NotNestedLessLess: NotNestedLessLess,
    notni: notni,
    notniva: notniva,
    notnivb: notnivb,
    notnivc: notnivc,
    NotPrecedes: NotPrecedes,
    NotPrecedesEqual: NotPrecedesEqual,
    NotPrecedesSlantEqual: NotPrecedesSlantEqual,
    NotReverseElement: NotReverseElement,
    NotRightTriangleBar: NotRightTriangleBar,
    NotRightTriangle: NotRightTriangle,
    NotRightTriangleEqual: NotRightTriangleEqual,
    NotSquareSubset: NotSquareSubset,
    NotSquareSubsetEqual: NotSquareSubsetEqual,
    NotSquareSuperset: NotSquareSuperset,
    NotSquareSupersetEqual: NotSquareSupersetEqual,
    NotSubset: NotSubset,
    NotSubsetEqual: NotSubsetEqual,
    NotSucceeds: NotSucceeds,
    NotSucceedsEqual: NotSucceedsEqual,
    NotSucceedsSlantEqual: NotSucceedsSlantEqual,
    NotSucceedsTilde: NotSucceedsTilde,
    NotSuperset: NotSuperset,
    NotSupersetEqual: NotSupersetEqual,
    NotTilde: NotTilde,
    NotTildeEqual: NotTildeEqual,
    NotTildeFullEqual: NotTildeFullEqual,
    NotTildeTilde: NotTildeTilde,
    NotVerticalBar: NotVerticalBar,
    nparallel: nparallel,
    npar: npar,
    nparsl: nparsl,
    npart: npart,
    npolint: npolint,
    npr: npr,
    nprcue: nprcue,
    nprec: nprec,
    npreceq: npreceq,
    npre: npre,
    nrarrc: nrarrc,
    nrarr: nrarr,
    nrArr: nrArr,
    nrarrw: nrarrw,
    nrightarrow: nrightarrow,
    nRightarrow: nRightarrow,
    nrtri: nrtri,
    nrtrie: nrtrie,
    nsc: nsc,
    nsccue: nsccue,
    nsce: nsce,
    Nscr: Nscr,
    nscr: nscr,
    nshortmid: nshortmid,
    nshortparallel: nshortparallel,
    nsim: nsim,
    nsime: nsime,
    nsimeq: nsimeq,
    nsmid: nsmid,
    nspar: nspar,
    nsqsube: nsqsube,
    nsqsupe: nsqsupe,
    nsub: nsub,
    nsubE: nsubE,
    nsube: nsube,
    nsubset: nsubset,
    nsubseteq: nsubseteq,
    nsubseteqq: nsubseteqq,
    nsucc: nsucc,
    nsucceq: nsucceq,
    nsup: nsup,
    nsupE: nsupE,
    nsupe: nsupe,
    nsupset: nsupset,
    nsupseteq: nsupseteq,
    nsupseteqq: nsupseteqq,
    ntgl: ntgl,
    Ntilde: Ntilde,
    ntilde: ntilde,
    ntlg: ntlg,
    ntriangleleft: ntriangleleft,
    ntrianglelefteq: ntrianglelefteq,
    ntriangleright: ntriangleright,
    ntrianglerighteq: ntrianglerighteq,
    Nu: Nu,
    nu: nu,
    num: num,
    numero: numero,
    numsp: numsp,
    nvap: nvap,
    nvdash: nvdash,
    nvDash: nvDash,
    nVdash: nVdash,
    nVDash: nVDash,
    nvge: nvge,
    nvgt: nvgt,
    nvHarr: nvHarr,
    nvinfin: nvinfin,
    nvlArr: nvlArr,
    nvle: nvle,
    nvlt: nvlt,
    nvltrie: nvltrie,
    nvrArr: nvrArr,
    nvrtrie: nvrtrie,
    nvsim: nvsim,
    nwarhk: nwarhk,
    nwarr: nwarr,
    nwArr: nwArr,
    nwarrow: nwarrow,
    nwnear: nwnear,
    Oacute: Oacute,
    oacute: oacute,
    oast: oast,
    Ocirc: Ocirc,
    ocirc: ocirc,
    ocir: ocir,
    Ocy: Ocy,
    ocy: ocy,
    odash: odash,
    Odblac: Odblac,
    odblac: odblac,
    odiv: odiv,
    odot: odot,
    odsold: odsold,
    OElig: OElig,
    oelig: oelig,
    ofcir: ofcir,
    Ofr: Ofr,
    ofr: ofr,
    ogon: ogon,
    Ograve: Ograve,
    ograve: ograve,
    ogt: ogt,
    ohbar: ohbar,
    ohm: ohm,
    oint: oint,
    olarr: olarr,
    olcir: olcir,
    olcross: olcross,
    oline: oline,
    olt: olt,
    Omacr: Omacr,
    omacr: omacr,
    Omega: Omega,
    omega: omega,
    Omicron: Omicron,
    omicron: omicron,
    omid: omid,
    ominus: ominus,
    Oopf: Oopf,
    oopf: oopf,
    opar: opar,
    OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
    OpenCurlyQuote: OpenCurlyQuote,
    operp: operp,
    oplus: oplus,
    orarr: orarr,
    Or: Or,
    or: or,
    ord: ord,
    order: order,
    orderof: orderof,
    ordf: ordf,
    ordm: ordm,
    origof: origof,
    oror: oror,
    orslope: orslope,
    orv: orv,
    oS: oS,
    Oscr: Oscr,
    oscr: oscr,
    Oslash: Oslash,
    oslash: oslash,
    osol: osol,
    Otilde: Otilde,
    otilde: otilde,
    otimesas: otimesas,
    Otimes: Otimes,
    otimes: otimes,
    Ouml: Ouml,
    ouml: ouml,
    ovbar: ovbar,
    OverBar: OverBar,
    OverBrace: OverBrace,
    OverBracket: OverBracket,
    OverParenthesis: OverParenthesis,
    para: para,
    parallel: parallel,
    par: par,
    parsim: parsim,
    parsl: parsl,
    part: part,
    PartialD: PartialD,
    Pcy: Pcy,
    pcy: pcy,
    percnt: percnt,
    period: period,
    permil: permil,
    perp: perp,
    pertenk: pertenk,
    Pfr: Pfr,
    pfr: pfr,
    Phi: Phi,
    phi: phi,
    phiv: phiv,
    phmmat: phmmat,
    phone: phone,
    Pi: Pi,
    pi: pi,
    pitchfork: pitchfork,
    piv: piv,
    planck: planck,
    planckh: planckh,
    plankv: plankv,
    plusacir: plusacir,
    plusb: plusb,
    pluscir: pluscir,
    plus: plus,
    plusdo: plusdo,
    plusdu: plusdu,
    pluse: pluse,
    PlusMinus: PlusMinus,
    plusmn: plusmn,
    plussim: plussim,
    plustwo: plustwo,
    pm: pm,
    Poincareplane: Poincareplane,
    pointint: pointint,
    popf: popf,
    Popf: Popf,
    pound: pound,
    prap: prap,
    Pr: Pr,
    pr: pr,
    prcue: prcue,
    precapprox: precapprox,
    prec: prec,
    preccurlyeq: preccurlyeq,
    Precedes: Precedes,
    PrecedesEqual: PrecedesEqual,
    PrecedesSlantEqual: PrecedesSlantEqual,
    PrecedesTilde: PrecedesTilde,
    preceq: preceq,
    precnapprox: precnapprox,
    precneqq: precneqq,
    precnsim: precnsim,
    pre: pre,
    prE: prE,
    precsim: precsim,
    prime: prime,
    Prime: Prime,
    primes: primes,
    prnap: prnap,
    prnE: prnE,
    prnsim: prnsim,
    prod: prod,
    Product: Product,
    profalar: profalar,
    profline: profline,
    profsurf: profsurf,
    prop: prop,
    Proportional: Proportional,
    Proportion: Proportion,
    propto: propto,
    prsim: prsim,
    prurel: prurel,
    Pscr: Pscr,
    pscr: pscr,
    Psi: Psi,
    psi: psi,
    puncsp: puncsp,
    Qfr: Qfr,
    qfr: qfr,
    qint: qint,
    qopf: qopf,
    Qopf: Qopf,
    qprime: qprime,
    Qscr: Qscr,
    qscr: qscr,
    quaternions: quaternions,
    quatint: quatint,
    quest: quest,
    questeq: questeq,
    quot: quot,
    QUOT: QUOT,
    rAarr: rAarr,
    race: race,
    Racute: Racute,
    racute: racute,
    radic: radic,
    raemptyv: raemptyv,
    rang: rang,
    Rang: Rang,
    rangd: rangd,
    range: range,
    rangle: rangle,
    raquo: raquo,
    rarrap: rarrap,
    rarrb: rarrb,
    rarrbfs: rarrbfs,
    rarrc: rarrc,
    rarr: rarr,
    Rarr: Rarr,
    rArr: rArr,
    rarrfs: rarrfs,
    rarrhk: rarrhk,
    rarrlp: rarrlp,
    rarrpl: rarrpl,
    rarrsim: rarrsim,
    Rarrtl: Rarrtl,
    rarrtl: rarrtl,
    rarrw: rarrw,
    ratail: ratail,
    rAtail: rAtail,
    ratio: ratio,
    rationals: rationals,
    rbarr: rbarr,
    rBarr: rBarr,
    RBarr: RBarr,
    rbbrk: rbbrk,
    rbrace: rbrace,
    rbrack: rbrack,
    rbrke: rbrke,
    rbrksld: rbrksld,
    rbrkslu: rbrkslu,
    Rcaron: Rcaron,
    rcaron: rcaron,
    Rcedil: Rcedil,
    rcedil: rcedil,
    rceil: rceil,
    rcub: rcub,
    Rcy: Rcy,
    rcy: rcy,
    rdca: rdca,
    rdldhar: rdldhar,
    rdquo: rdquo,
    rdquor: rdquor,
    rdsh: rdsh,
    real: real,
    realine: realine,
    realpart: realpart,
    reals: reals,
    Re: Re,
    rect: rect,
    reg: reg,
    REG: REG,
    ReverseElement: ReverseElement,
    ReverseEquilibrium: ReverseEquilibrium,
    ReverseUpEquilibrium: ReverseUpEquilibrium,
    rfisht: rfisht,
    rfloor: rfloor,
    rfr: rfr,
    Rfr: Rfr,
    rHar: rHar,
    rhard: rhard,
    rharu: rharu,
    rharul: rharul,
    Rho: Rho,
    rho: rho,
    rhov: rhov,
    RightAngleBracket: RightAngleBracket,
    RightArrowBar: RightArrowBar,
    rightarrow: rightarrow,
    RightArrow: RightArrow,
    Rightarrow: Rightarrow,
    RightArrowLeftArrow: RightArrowLeftArrow,
    rightarrowtail: rightarrowtail,
    RightCeiling: RightCeiling,
    RightDoubleBracket: RightDoubleBracket,
    RightDownTeeVector: RightDownTeeVector,
    RightDownVectorBar: RightDownVectorBar,
    RightDownVector: RightDownVector,
    RightFloor: RightFloor,
    rightharpoondown: rightharpoondown,
    rightharpoonup: rightharpoonup,
    rightleftarrows: rightleftarrows,
    rightleftharpoons: rightleftharpoons,
    rightrightarrows: rightrightarrows,
    rightsquigarrow: rightsquigarrow,
    RightTeeArrow: RightTeeArrow,
    RightTee: RightTee,
    RightTeeVector: RightTeeVector,
    rightthreetimes: rightthreetimes,
    RightTriangleBar: RightTriangleBar,
    RightTriangle: RightTriangle,
    RightTriangleEqual: RightTriangleEqual,
    RightUpDownVector: RightUpDownVector,
    RightUpTeeVector: RightUpTeeVector,
    RightUpVectorBar: RightUpVectorBar,
    RightUpVector: RightUpVector,
    RightVectorBar: RightVectorBar,
    RightVector: RightVector,
    ring: ring,
    risingdotseq: risingdotseq,
    rlarr: rlarr,
    rlhar: rlhar,
    rlm: rlm,
    rmoustache: rmoustache,
    rmoust: rmoust,
    rnmid: rnmid,
    roang: roang,
    roarr: roarr,
    robrk: robrk,
    ropar: ropar,
    ropf: ropf,
    Ropf: Ropf,
    roplus: roplus,
    rotimes: rotimes,
    RoundImplies: RoundImplies,
    rpar: rpar,
    rpargt: rpargt,
    rppolint: rppolint,
    rrarr: rrarr,
    Rrightarrow: Rrightarrow,
    rsaquo: rsaquo,
    rscr: rscr,
    Rscr: Rscr,
    rsh: rsh,
    Rsh: Rsh,
    rsqb: rsqb,
    rsquo: rsquo,
    rsquor: rsquor,
    rthree: rthree,
    rtimes: rtimes,
    rtri: rtri,
    rtrie: rtrie,
    rtrif: rtrif,
    rtriltri: rtriltri,
    RuleDelayed: RuleDelayed,
    ruluhar: ruluhar,
    rx: rx,
    Sacute: Sacute,
    sacute: sacute,
    sbquo: sbquo,
    scap: scap,
    Scaron: Scaron,
    scaron: scaron,
    Sc: Sc,
    sc: sc,
    sccue: sccue,
    sce: sce,
    scE: scE,
    Scedil: Scedil,
    scedil: scedil,
    Scirc: Scirc,
    scirc: scirc,
    scnap: scnap,
    scnE: scnE,
    scnsim: scnsim,
    scpolint: scpolint,
    scsim: scsim,
    Scy: Scy,
    scy: scy,
    sdotb: sdotb,
    sdot: sdot,
    sdote: sdote,
    searhk: searhk,
    searr: searr,
    seArr: seArr,
    searrow: searrow,
    sect: sect,
    semi: semi,
    seswar: seswar,
    setminus: setminus,
    setmn: setmn,
    sext: sext,
    Sfr: Sfr,
    sfr: sfr,
    sfrown: sfrown,
    sharp: sharp,
    SHCHcy: SHCHcy,
    shchcy: shchcy,
    SHcy: SHcy,
    shcy: shcy,
    ShortDownArrow: ShortDownArrow,
    ShortLeftArrow: ShortLeftArrow,
    shortmid: shortmid,
    shortparallel: shortparallel,
    ShortRightArrow: ShortRightArrow,
    ShortUpArrow: ShortUpArrow,
    shy: shy,
    Sigma: Sigma,
    sigma: sigma,
    sigmaf: sigmaf,
    sigmav: sigmav,
    sim: sim,
    simdot: simdot,
    sime: sime,
    simeq: simeq,
    simg: simg,
    simgE: simgE,
    siml: siml,
    simlE: simlE,
    simne: simne,
    simplus: simplus,
    simrarr: simrarr,
    slarr: slarr,
    SmallCircle: SmallCircle,
    smallsetminus: smallsetminus,
    smashp: smashp,
    smeparsl: smeparsl,
    smid: smid,
    smile: smile,
    smt: smt,
    smte: smte,
    smtes: smtes,
    SOFTcy: SOFTcy,
    softcy: softcy,
    solbar: solbar,
    solb: solb,
    sol: sol,
    Sopf: Sopf,
    sopf: sopf,
    spades: spades,
    spadesuit: spadesuit,
    spar: spar,
    sqcap: sqcap,
    sqcaps: sqcaps,
    sqcup: sqcup,
    sqcups: sqcups,
    Sqrt: Sqrt,
    sqsub: sqsub,
    sqsube: sqsube,
    sqsubset: sqsubset,
    sqsubseteq: sqsubseteq,
    sqsup: sqsup,
    sqsupe: sqsupe,
    sqsupset: sqsupset,
    sqsupseteq: sqsupseteq,
    square: square,
    Square: Square,
    SquareIntersection: SquareIntersection,
    SquareSubset: SquareSubset,
    SquareSubsetEqual: SquareSubsetEqual,
    SquareSuperset: SquareSuperset,
    SquareSupersetEqual: SquareSupersetEqual,
    SquareUnion: SquareUnion,
    squarf: squarf,
    squ: squ,
    squf: squf,
    srarr: srarr,
    Sscr: Sscr,
    sscr: sscr,
    ssetmn: ssetmn,
    ssmile: ssmile,
    sstarf: sstarf,
    Star: Star,
    star: star,
    starf: starf,
    straightepsilon: straightepsilon,
    straightphi: straightphi,
    strns: strns,
    sub: sub,
    Sub: Sub,
    subdot: subdot,
    subE: subE,
    sube: sube,
    subedot: subedot,
    submult: submult,
    subnE: subnE,
    subne: subne,
    subplus: subplus,
    subrarr: subrarr,
    subset: subset,
    Subset: Subset,
    subseteq: subseteq,
    subseteqq: subseteqq,
    SubsetEqual: SubsetEqual,
    subsetneq: subsetneq,
    subsetneqq: subsetneqq,
    subsim: subsim,
    subsub: subsub,
    subsup: subsup,
    succapprox: succapprox,
    succ: succ,
    succcurlyeq: succcurlyeq,
    Succeeds: Succeeds,
    SucceedsEqual: SucceedsEqual,
    SucceedsSlantEqual: SucceedsSlantEqual,
    SucceedsTilde: SucceedsTilde,
    succeq: succeq,
    succnapprox: succnapprox,
    succneqq: succneqq,
    succnsim: succnsim,
    succsim: succsim,
    SuchThat: SuchThat,
    sum: sum,
    Sum: Sum,
    sung: sung,
    sup1: sup1,
    sup2: sup2,
    sup3: sup3,
    sup: sup,
    Sup: Sup,
    supdot: supdot,
    supdsub: supdsub,
    supE: supE,
    supe: supe,
    supedot: supedot,
    Superset: Superset,
    SupersetEqual: SupersetEqual,
    suphsol: suphsol,
    suphsub: suphsub,
    suplarr: suplarr,
    supmult: supmult,
    supnE: supnE,
    supne: supne,
    supplus: supplus,
    supset: supset,
    Supset: Supset,
    supseteq: supseteq,
    supseteqq: supseteqq,
    supsetneq: supsetneq,
    supsetneqq: supsetneqq,
    supsim: supsim,
    supsub: supsub,
    supsup: supsup,
    swarhk: swarhk,
    swarr: swarr,
    swArr: swArr,
    swarrow: swarrow,
    swnwar: swnwar,
    szlig: szlig,
    Tab: Tab,
    target: target,
    Tau: Tau,
    tau: tau,
    tbrk: tbrk,
    Tcaron: Tcaron,
    tcaron: tcaron,
    Tcedil: Tcedil,
    tcedil: tcedil,
    Tcy: Tcy,
    tcy: tcy,
    tdot: tdot,
    telrec: telrec,
    Tfr: Tfr,
    tfr: tfr,
    there4: there4,
    therefore: therefore,
    Therefore: Therefore,
    Theta: Theta,
    theta: theta,
    thetasym: thetasym,
    thetav: thetav,
    thickapprox: thickapprox,
    thicksim: thicksim,
    ThickSpace: ThickSpace,
    ThinSpace: ThinSpace,
    thinsp: thinsp,
    thkap: thkap,
    thksim: thksim,
    THORN: THORN,
    thorn: thorn,
    tilde: tilde,
    Tilde: Tilde,
    TildeEqual: TildeEqual,
    TildeFullEqual: TildeFullEqual,
    TildeTilde: TildeTilde,
    timesbar: timesbar,
    timesb: timesb,
    times: times,
    timesd: timesd,
    tint: tint,
    toea: toea,
    topbot: topbot,
    topcir: topcir,
    top: top,
    Topf: Topf,
    topf: topf,
    topfork: topfork,
    tosa: tosa,
    tprime: tprime,
    trade: trade,
    TRADE: TRADE,
    triangle: triangle,
    triangledown: triangledown,
    triangleleft: triangleleft,
    trianglelefteq: trianglelefteq,
    triangleq: triangleq,
    triangleright: triangleright,
    trianglerighteq: trianglerighteq,
    tridot: tridot,
    trie: trie,
    triminus: triminus,
    TripleDot: TripleDot,
    triplus: triplus,
    trisb: trisb,
    tritime: tritime,
    trpezium: trpezium,
    Tscr: Tscr,
    tscr: tscr,
    TScy: TScy,
    tscy: tscy,
    TSHcy: TSHcy,
    tshcy: tshcy,
    Tstrok: Tstrok,
    tstrok: tstrok,
    twixt: twixt,
    twoheadleftarrow: twoheadleftarrow,
    twoheadrightarrow: twoheadrightarrow,
    Uacute: Uacute,
    uacute: uacute,
    uarr: uarr,
    Uarr: Uarr,
    uArr: uArr,
    Uarrocir: Uarrocir,
    Ubrcy: Ubrcy,
    ubrcy: ubrcy,
    Ubreve: Ubreve,
    ubreve: ubreve,
    Ucirc: Ucirc,
    ucirc: ucirc,
    Ucy: Ucy,
    ucy: ucy,
    udarr: udarr,
    Udblac: Udblac,
    udblac: udblac,
    udhar: udhar,
    ufisht: ufisht,
    Ufr: Ufr,
    ufr: ufr,
    Ugrave: Ugrave,
    ugrave: ugrave,
    uHar: uHar,
    uharl: uharl,
    uharr: uharr,
    uhblk: uhblk,
    ulcorn: ulcorn,
    ulcorner: ulcorner,
    ulcrop: ulcrop,
    ultri: ultri,
    Umacr: Umacr,
    umacr: umacr,
    uml: uml,
    UnderBar: UnderBar,
    UnderBrace: UnderBrace,
    UnderBracket: UnderBracket,
    UnderParenthesis: UnderParenthesis,
    Union: Union,
    UnionPlus: UnionPlus,
    Uogon: Uogon,
    uogon: uogon,
    Uopf: Uopf,
    uopf: uopf,
    UpArrowBar: UpArrowBar,
    uparrow: uparrow,
    UpArrow: UpArrow,
    Uparrow: Uparrow,
    UpArrowDownArrow: UpArrowDownArrow,
    updownarrow: updownarrow,
    UpDownArrow: UpDownArrow,
    Updownarrow: Updownarrow,
    UpEquilibrium: UpEquilibrium,
    upharpoonleft: upharpoonleft,
    upharpoonright: upharpoonright,
    uplus: uplus,
    UpperLeftArrow: UpperLeftArrow,
    UpperRightArrow: UpperRightArrow,
    upsi: upsi,
    Upsi: Upsi,
    upsih: upsih,
    Upsilon: Upsilon,
    upsilon: upsilon,
    UpTeeArrow: UpTeeArrow,
    UpTee: UpTee,
    upuparrows: upuparrows,
    urcorn: urcorn,
    urcorner: urcorner,
    urcrop: urcrop,
    Uring: Uring,
    uring: uring,
    urtri: urtri,
    Uscr: Uscr,
    uscr: uscr,
    utdot: utdot,
    Utilde: Utilde,
    utilde: utilde,
    utri: utri,
    utrif: utrif,
    uuarr: uuarr,
    Uuml: Uuml,
    uuml: uuml,
    uwangle: uwangle,
    vangrt: vangrt,
    varepsilon: varepsilon,
    varkappa: varkappa,
    varnothing: varnothing,
    varphi: varphi,
    varpi: varpi,
    varpropto: varpropto,
    varr: varr,
    vArr: vArr,
    varrho: varrho,
    varsigma: varsigma,
    varsubsetneq: varsubsetneq,
    varsubsetneqq: varsubsetneqq,
    varsupsetneq: varsupsetneq,
    varsupsetneqq: varsupsetneqq,
    vartheta: vartheta,
    vartriangleleft: vartriangleleft,
    vartriangleright: vartriangleright,
    vBar: vBar,
    Vbar: Vbar,
    vBarv: vBarv,
    Vcy: Vcy,
    vcy: vcy,
    vdash: vdash,
    vDash: vDash,
    Vdash: Vdash,
    VDash: VDash,
    Vdashl: Vdashl,
    veebar: veebar,
    vee: vee,
    Vee: Vee,
    veeeq: veeeq,
    vellip: vellip,
    verbar: verbar,
    Verbar: Verbar,
    vert: vert,
    Vert: Vert,
    VerticalBar: VerticalBar,
    VerticalLine: VerticalLine,
    VerticalSeparator: VerticalSeparator,
    VerticalTilde: VerticalTilde,
    VeryThinSpace: VeryThinSpace,
    Vfr: Vfr,
    vfr: vfr,
    vltri: vltri,
    vnsub: vnsub,
    vnsup: vnsup,
    Vopf: Vopf,
    vopf: vopf,
    vprop: vprop,
    vrtri: vrtri,
    Vscr: Vscr,
    vscr: vscr,
    vsubnE: vsubnE,
    vsubne: vsubne,
    vsupnE: vsupnE,
    vsupne: vsupne,
    Vvdash: Vvdash,
    vzigzag: vzigzag,
    Wcirc: Wcirc,
    wcirc: wcirc,
    wedbar: wedbar,
    wedge: wedge,
    Wedge: Wedge,
    wedgeq: wedgeq,
    weierp: weierp,
    Wfr: Wfr,
    wfr: wfr,
    Wopf: Wopf,
    wopf: wopf,
    wp: wp,
    wr: wr,
    wreath: wreath,
    Wscr: Wscr,
    wscr: wscr,
    xcap: xcap,
    xcirc: xcirc,
    xcup: xcup,
    xdtri: xdtri,
    Xfr: Xfr,
    xfr: xfr,
    xharr: xharr,
    xhArr: xhArr,
    Xi: Xi,
    xi: xi,
    xlarr: xlarr,
    xlArr: xlArr,
    xmap: xmap,
    xnis: xnis,
    xodot: xodot,
    Xopf: Xopf,
    xopf: xopf,
    xoplus: xoplus,
    xotime: xotime,
    xrarr: xrarr,
    xrArr: xrArr,
    Xscr: Xscr,
    xscr: xscr,
    xsqcup: xsqcup,
    xuplus: xuplus,
    xutri: xutri,
    xvee: xvee,
    xwedge: xwedge,
    Yacute: Yacute,
    yacute: yacute,
    YAcy: YAcy,
    yacy: yacy,
    Ycirc: Ycirc,
    ycirc: ycirc,
    Ycy: Ycy,
    ycy: ycy,
    yen: yen,
    Yfr: Yfr,
    yfr: yfr,
    YIcy: YIcy,
    yicy: yicy,
    Yopf: Yopf,
    yopf: yopf,
    Yscr: Yscr,
    yscr: yscr,
    YUcy: YUcy,
    yucy: yucy,
    yuml: yuml,
    Yuml: Yuml,
    Zacute: Zacute,
    zacute: zacute,
    Zcaron: Zcaron,
    zcaron: zcaron,
    Zcy: Zcy,
    zcy: zcy,
    Zdot: Zdot,
    zdot: zdot,
    zeetrf: zeetrf,
    ZeroWidthSpace: ZeroWidthSpace,
    Zeta: Zeta,
    zeta: zeta,
    zfr: zfr,
    Zfr: Zfr,
    ZHcy: ZHcy,
    zhcy: zhcy,
    zigrarr: zigrarr,
    zopf: zopf,
    Zopf: Zopf,
    Zscr: Zscr,
    zscr: zscr,
    zwj: zwj,
    zwnj: zwnj,
    default: entities
  });

  var require$$0 = getCjsExportFromNamespace(entities$1);

  /*eslint quotes:0*/
  var entities$2 = require$$0;

  var regex=/[!-#%-\*,-/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E49\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDF3C-\uDF3E]|\uD806[\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2]|\uD807[\uDC41-\uDC45\uDC70\uDC71]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/;

  var encodeCache = {};


  // Create a lookup array where anything but characters in `chars` string
  // and alphanumeric chars is percent-encoded.
  //
  function getEncodeCache(exclude) {
    var i, ch, cache = encodeCache[exclude];
    if (cache) { return cache; }

    cache = encodeCache[exclude] = [];

    for (i = 0; i < 128; i++) {
      ch = String.fromCharCode(i);

      if (/^[0-9a-z]$/i.test(ch)) {
        // always allow unencoded alphanumeric characters
        cache.push(ch);
      } else {
        cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
      }
    }

    for (i = 0; i < exclude.length; i++) {
      cache[exclude.charCodeAt(i)] = exclude[i];
    }

    return cache;
  }


  // Encode unsafe characters with percent-encoding, skipping already
  // encoded sequences.
  //
  //  - string       - string to encode
  //  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
  //  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
  //
  function encode(string, exclude, keepEscaped) {
    var i, l, code, nextCode, cache,
        result = '';

    if (typeof exclude !== 'string') {
      // encode(string, keepEscaped)
      keepEscaped  = exclude;
      exclude = encode.defaultChars;
    }

    if (typeof keepEscaped === 'undefined') {
      keepEscaped = true;
    }

    cache = getEncodeCache(exclude);

    for (i = 0, l = string.length; i < l; i++) {
      code = string.charCodeAt(i);

      if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
        if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
          result += string.slice(i, i + 3);
          i += 2;
          continue;
        }
      }

      if (code < 128) {
        result += cache[code];
        continue;
      }

      if (code >= 0xD800 && code <= 0xDFFF) {
        if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
          nextCode = string.charCodeAt(i + 1);
          if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
            result += encodeURIComponent(string[i] + string[i + 1]);
            i++;
            continue;
          }
        }
        result += '%EF%BF%BD';
        continue;
      }

      result += encodeURIComponent(string[i]);
    }

    return result;
  }

  encode.defaultChars   = ";/?:@&=+$,-_.!~*'()#";
  encode.componentChars = "-_.!~*'()";


  var encode_1 = encode;

  /* eslint-disable no-bitwise */

  var decodeCache = {};

  function getDecodeCache(exclude) {
    var i, ch, cache = decodeCache[exclude];
    if (cache) { return cache; }

    cache = decodeCache[exclude] = [];

    for (i = 0; i < 128; i++) {
      ch = String.fromCharCode(i);
      cache.push(ch);
    }

    for (i = 0; i < exclude.length; i++) {
      ch = exclude.charCodeAt(i);
      cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
    }

    return cache;
  }


  // Decode percent-encoded string.
  //
  function decode(string, exclude) {
    var cache;

    if (typeof exclude !== 'string') {
      exclude = decode.defaultChars;
    }

    cache = getDecodeCache(exclude);

    return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
      var i, l, b1, b2, b3, b4, chr,
          result = '';

      for (i = 0, l = seq.length; i < l; i += 3) {
        b1 = parseInt(seq.slice(i + 1, i + 3), 16);

        if (b1 < 0x80) {
          result += cache[b1];
          continue;
        }

        if ((b1 & 0xE0) === 0xC0 && (i + 3 < l)) {
          // 110xxxxx 10xxxxxx
          b2 = parseInt(seq.slice(i + 4, i + 6), 16);

          if ((b2 & 0xC0) === 0x80) {
            chr = ((b1 << 6) & 0x7C0) | (b2 & 0x3F);

            if (chr < 0x80) {
              result += '\ufffd\ufffd';
            } else {
              result += String.fromCharCode(chr);
            }

            i += 3;
            continue;
          }
        }

        if ((b1 & 0xF0) === 0xE0 && (i + 6 < l)) {
          // 1110xxxx 10xxxxxx 10xxxxxx
          b2 = parseInt(seq.slice(i + 4, i + 6), 16);
          b3 = parseInt(seq.slice(i + 7, i + 9), 16);

          if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
            chr = ((b1 << 12) & 0xF000) | ((b2 << 6) & 0xFC0) | (b3 & 0x3F);

            if (chr < 0x800 || (chr >= 0xD800 && chr <= 0xDFFF)) {
              result += '\ufffd\ufffd\ufffd';
            } else {
              result += String.fromCharCode(chr);
            }

            i += 6;
            continue;
          }
        }

        if ((b1 & 0xF8) === 0xF0 && (i + 9 < l)) {
          // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
          b2 = parseInt(seq.slice(i + 4, i + 6), 16);
          b3 = parseInt(seq.slice(i + 7, i + 9), 16);
          b4 = parseInt(seq.slice(i + 10, i + 12), 16);

          if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
            chr = ((b1 << 18) & 0x1C0000) | ((b2 << 12) & 0x3F000) | ((b3 << 6) & 0xFC0) | (b4 & 0x3F);

            if (chr < 0x10000 || chr > 0x10FFFF) {
              result += '\ufffd\ufffd\ufffd\ufffd';
            } else {
              chr -= 0x10000;
              result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
            }

            i += 9;
            continue;
          }
        }

        result += '\ufffd';
      }

      return result;
    });
  }


  decode.defaultChars   = ';/?:@&=+$,#';
  decode.componentChars = '';


  var decode_1 = decode;

  var format = function format(url) {
    var result = '';

    result += url.protocol || '';
    result += url.slashes ? '//' : '';
    result += url.auth ? url.auth + '@' : '';

    if (url.hostname && url.hostname.indexOf(':') !== -1) {
      // ipv6 address
      result += '[' + url.hostname + ']';
    } else {
      result += url.hostname || '';
    }

    result += url.port ? ':' + url.port : '';
    result += url.pathname || '';
    result += url.search || '';
    result += url.hash || '';

    return result;
  };

  // Copyright Joyent, Inc. and other Node contributors.

  //
  // Changes from joyent/node:
  //
  // 1. No leading slash in paths,
  //    e.g. in `url.parse('http://foo?bar')` pathname is ``, not `/`
  //
  // 2. Backslashes are not replaced with slashes,
  //    so `http:\\example.org\` is treated like a relative path
  //
  // 3. Trailing colon is treated like a part of the path,
  //    i.e. in `http://example.org:foo` pathname is `:foo`
  //
  // 4. Nothing is URL-encoded in the resulting object,
  //    (in joyent/node some chars in auth and paths are encoded)
  //
  // 5. `url.parse()` does not have `parseQueryString` argument
  //
  // 6. Removed extraneous result properties: `host`, `path`, `query`, etc.,
  //    which can be constructed using other parts of the url.
  //


  function Url() {
    this.protocol = null;
    this.slashes = null;
    this.auth = null;
    this.port = null;
    this.hostname = null;
    this.hash = null;
    this.search = null;
    this.pathname = null;
  }

  // Reference: RFC 3986, RFC 1808, RFC 2396

  // define these here so at least they only have to be
  // compiled once on the first module load.
  var protocolPattern = /^([a-z0-9.+-]+:)/i,
      portPattern = /:[0-9]*$/,

      // Special case for a simple path URL
      simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

      // RFC 2396: characters reserved for delimiting URLs.
      // We actually just auto-escape these.
      delims = [ '<', '>', '"', '`', ' ', '\r', '\n', '\t' ],

      // RFC 2396: characters not allowed for various reasons.
      unwise = [ '{', '}', '|', '\\', '^', '`' ].concat(delims),

      // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
      autoEscape = [ '\'' ].concat(unwise),
      // Characters that are never ever allowed in a hostname.
      // Note that any invalid chars are also handled, but these
      // are the ones that are *expected* to be seen, so we fast-path
      // them.
      nonHostChars = [ '%', '/', '?', ';', '#' ].concat(autoEscape),
      hostEndingChars = [ '/', '?', '#' ],
      hostnameMaxLen = 255,
      hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
      hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
      // protocols that can allow "unsafe" and "unwise" chars.
      /* eslint-disable no-script-url */
      // protocols that never have a hostname.
      hostlessProtocol = {
        'javascript': true,
        'javascript:': true
      },
      // protocols that always contain a // bit.
      slashedProtocol = {
        'http': true,
        'https': true,
        'ftp': true,
        'gopher': true,
        'file': true,
        'http:': true,
        'https:': true,
        'ftp:': true,
        'gopher:': true,
        'file:': true
      };
      /* eslint-enable no-script-url */

  function urlParse(url, slashesDenoteHost) {
    if (url && url instanceof Url) { return url; }

    var u = new Url();
    u.parse(url, slashesDenoteHost);
    return u;
  }

  Url.prototype.parse = function(url, slashesDenoteHost) {
    var i, l, lowerProto, hec, slashes,
        rest = url;

    // trim before proceeding.
    // This is to support parse stuff like "  http://foo.com  \n"
    rest = rest.trim();

    if (!slashesDenoteHost && url.split('#').length === 1) {
      // Try fast path regexp
      var simplePath = simplePathPattern.exec(rest);
      if (simplePath) {
        this.pathname = simplePath[1];
        if (simplePath[2]) {
          this.search = simplePath[2];
        }
        return this;
      }
    }

    var proto = protocolPattern.exec(rest);
    if (proto) {
      proto = proto[0];
      lowerProto = proto.toLowerCase();
      this.protocol = proto;
      rest = rest.substr(proto.length);
    }

    // figure out if it's got a host
    // user@server is *always* interpreted as a hostname, and url
    // resolution will treat //foo/bar as host=foo,path=bar because that's
    // how the browser resolves relative URLs.
    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
      slashes = rest.substr(0, 2) === '//';
      if (slashes && !(proto && hostlessProtocol[proto])) {
        rest = rest.substr(2);
        this.slashes = true;
      }
    }

    if (!hostlessProtocol[proto] &&
        (slashes || (proto && !slashedProtocol[proto]))) {

      // there's a hostname.
      // the first instance of /, ?, ;, or # ends the host.
      //
      // If there is an @ in the hostname, then non-host chars *are* allowed
      // to the left of the last @ sign, unless some host-ending character
      // comes *before* the @-sign.
      // URLs are obnoxious.
      //
      // ex:
      // http://a@b@c/ => user:a@b host:c
      // http://a@b?@c => user:a host:c path:/?@c

      // v0.12 TODO(isaacs): This is not quite how Chrome does things.
      // Review our test case against browsers more comprehensively.

      // find the first instance of any hostEndingChars
      var hostEnd = -1;
      for (i = 0; i < hostEndingChars.length; i++) {
        hec = rest.indexOf(hostEndingChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
          hostEnd = hec;
        }
      }

      // at this point, either we have an explicit point where the
      // auth portion cannot go past, or the last @ char is the decider.
      var auth, atSign;
      if (hostEnd === -1) {
        // atSign can be anywhere.
        atSign = rest.lastIndexOf('@');
      } else {
        // atSign must be in auth portion.
        // http://a@b/c@d => host:b auth:a path:/c@d
        atSign = rest.lastIndexOf('@', hostEnd);
      }

      // Now we have a portion which is definitely the auth.
      // Pull that off.
      if (atSign !== -1) {
        auth = rest.slice(0, atSign);
        rest = rest.slice(atSign + 1);
        this.auth = auth;
      }

      // the host is the remaining to the left of the first non-host char
      hostEnd = -1;
      for (i = 0; i < nonHostChars.length; i++) {
        hec = rest.indexOf(nonHostChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
          hostEnd = hec;
        }
      }
      // if we still have not hit it, then the entire thing is a host.
      if (hostEnd === -1) {
        hostEnd = rest.length;
      }

      if (rest[hostEnd - 1] === ':') { hostEnd--; }
      var host = rest.slice(0, hostEnd);
      rest = rest.slice(hostEnd);

      // pull out port.
      this.parseHost(host);

      // we've indicated that there is a hostname,
      // so even if it's empty, it has to be present.
      this.hostname = this.hostname || '';

      // if hostname begins with [ and ends with ]
      // assume that it's an IPv6 address.
      var ipv6Hostname = this.hostname[0] === '[' &&
          this.hostname[this.hostname.length - 1] === ']';

      // validate a little.
      if (!ipv6Hostname) {
        var hostparts = this.hostname.split(/\./);
        for (i = 0, l = hostparts.length; i < l; i++) {
          var part = hostparts[i];
          if (!part) { continue; }
          if (!part.match(hostnamePartPattern)) {
            var newpart = '';
            for (var j = 0, k = part.length; j < k; j++) {
              if (part.charCodeAt(j) > 127) {
                // we replace non-ASCII char with a temporary placeholder
                // we need this to make sure size of hostname is not
                // broken by replacing non-ASCII by nothing
                newpart += 'x';
              } else {
                newpart += part[j];
              }
            }
            // we test again with ASCII char only
            if (!newpart.match(hostnamePartPattern)) {
              var validParts = hostparts.slice(0, i);
              var notHost = hostparts.slice(i + 1);
              var bit = part.match(hostnamePartStart);
              if (bit) {
                validParts.push(bit[1]);
                notHost.unshift(bit[2]);
              }
              if (notHost.length) {
                rest = notHost.join('.') + rest;
              }
              this.hostname = validParts.join('.');
              break;
            }
          }
        }
      }

      if (this.hostname.length > hostnameMaxLen) {
        this.hostname = '';
      }

      // strip [ and ] from the hostname
      // the host field still retains them, though
      if (ipv6Hostname) {
        this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      }
    }

    // chop off from the tail first.
    var hash = rest.indexOf('#');
    if (hash !== -1) {
      // got a fragment string.
      this.hash = rest.substr(hash);
      rest = rest.slice(0, hash);
    }
    var qm = rest.indexOf('?');
    if (qm !== -1) {
      this.search = rest.substr(qm);
      rest = rest.slice(0, qm);
    }
    if (rest) { this.pathname = rest; }
    if (slashedProtocol[lowerProto] &&
        this.hostname && !this.pathname) {
      this.pathname = '';
    }

    return this;
  };

  Url.prototype.parseHost = function(host) {
    var port = portPattern.exec(host);
    if (port) {
      port = port[0];
      if (port !== ':') {
        this.port = port.substr(1);
      }
      host = host.substr(0, host.length - port.length);
    }
    if (host) { this.hostname = host; }
  };

  var parse = urlParse;

  var encode$1 = encode_1;
  var decode$1 = decode_1;
  var format$1 = format;
  var parse$1  = parse;

  var _mdurl_1_0_1_mdurl = {
  	encode: encode$1,
  	decode: decode$1,
  	format: format$1,
  	parse: parse$1
  };

  var regex$1=/[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;

  var regex$2=/[\0-\x1F\x7F-\x9F]/;

  var regex$3=/[\xAD\u0600-\u0605\u061C\u06DD\u070F\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804\uDCBD|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/;

  var regex$4=/[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/;

  var Any = regex$1;
  var Cc  = regex$2;
  var Cf  = regex$3;
  var P   = regex;
  var Z   = regex$4;

  var _uc_micro_1_0_5_uc_micro = {
  	Any: Any,
  	Cc: Cc,
  	Cf: Cf,
  	P: P,
  	Z: Z
  };

  var utils$1 = createCommonjsModule(function (module, exports) {


  function _class(obj) { return Object.prototype.toString.call(obj); }

  function isString(obj) { return _class(obj) === '[object String]'; }

  var _hasOwnProperty = Object.prototype.hasOwnProperty;

  function has(object, key) {
    return _hasOwnProperty.call(object, key);
  }

  // Merge objects
  //
  function assign(obj /*from1, from2, from3, ...*/) {
    var sources = Array.prototype.slice.call(arguments, 1);

    sources.forEach(function (source) {
      if (!source) { return; }

      if (typeof source !== 'object') {
        throw new TypeError(source + 'must be object');
      }

      Object.keys(source).forEach(function (key) {
        obj[key] = source[key];
      });
    });

    return obj;
  }

  // Remove element from array and put another array at those position.
  // Useful for some operations with tokens
  function arrayReplaceAt(src, pos, newElements) {
    return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
  }

  ////////////////////////////////////////////////////////////////////////////////

  function isValidEntityCode(c) {
    /*eslint no-bitwise:0*/
    // broken sequence
    if (c >= 0xD800 && c <= 0xDFFF) { return false; }
    // never used
    if (c >= 0xFDD0 && c <= 0xFDEF) { return false; }
    if ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) { return false; }
    // control codes
    if (c >= 0x00 && c <= 0x08) { return false; }
    if (c === 0x0B) { return false; }
    if (c >= 0x0E && c <= 0x1F) { return false; }
    if (c >= 0x7F && c <= 0x9F) { return false; }
    // out of range
    if (c > 0x10FFFF) { return false; }
    return true;
  }

  function fromCodePoint(c) {
    /*eslint no-bitwise:0*/
    if (c > 0xffff) {
      c -= 0x10000;
      var surrogate1 = 0xd800 + (c >> 10),
          surrogate2 = 0xdc00 + (c & 0x3ff);

      return String.fromCharCode(surrogate1, surrogate2);
    }
    return String.fromCharCode(c);
  }


  var UNESCAPE_MD_RE  = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g;
  var ENTITY_RE       = /&([a-z#][a-z0-9]{1,31});/gi;
  var UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source, 'gi');

  var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i;



  function replaceEntityPattern(match, name) {
    var code = 0;

    if (has(entities$2, name)) {
      return entities$2[name];
    }

    if (name.charCodeAt(0) === 0x23/* # */ && DIGITAL_ENTITY_TEST_RE.test(name)) {
      code = name[1].toLowerCase() === 'x' ?
        parseInt(name.slice(2), 16)
      :
        parseInt(name.slice(1), 10);
      if (isValidEntityCode(code)) {
        return fromCodePoint(code);
      }
    }

    return match;
  }

  /*function replaceEntities(str) {
    if (str.indexOf('&') < 0) { return str; }

    return str.replace(ENTITY_RE, replaceEntityPattern);
  }*/

  function unescapeMd(str) {
    if (str.indexOf('\\') < 0) { return str; }
    return str.replace(UNESCAPE_MD_RE, '$1');
  }

  function unescapeAll(str) {
    if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) { return str; }

    return str.replace(UNESCAPE_ALL_RE, function (match, escaped, entity) {
      if (escaped) { return escaped; }
      return replaceEntityPattern(match, entity);
    });
  }

  ////////////////////////////////////////////////////////////////////////////////

  var HTML_ESCAPE_TEST_RE = /[&<>"]/;
  var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
  var HTML_REPLACEMENTS = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  };

  function replaceUnsafeChar(ch) {
    return HTML_REPLACEMENTS[ch];
  }

  function escapeHtml(str) {
    if (HTML_ESCAPE_TEST_RE.test(str)) {
      return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
    }
    return str;
  }

  ////////////////////////////////////////////////////////////////////////////////

  var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;

  function escapeRE(str) {
    return str.replace(REGEXP_ESCAPE_RE, '\\$&');
  }

  ////////////////////////////////////////////////////////////////////////////////

  function isSpace(code) {
    switch (code) {
      case 0x09:
      case 0x20:
        return true;
    }
    return false;
  }

  // Zs (unicode class) || [\t\f\v\r\n]
  function isWhiteSpace(code) {
    if (code >= 0x2000 && code <= 0x200A) { return true; }
    switch (code) {
      case 0x09: // \t
      case 0x0A: // \n
      case 0x0B: // \v
      case 0x0C: // \f
      case 0x0D: // \r
      case 0x20:
      case 0xA0:
      case 0x1680:
      case 0x202F:
      case 0x205F:
      case 0x3000:
        return true;
    }
    return false;
  }

  ////////////////////////////////////////////////////////////////////////////////

  /*eslint-disable max-len*/


  // Currently without astral characters support.
  function isPunctChar(ch) {
    return regex.test(ch);
  }


  // Markdown ASCII punctuation characters.
  //
  // !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~
  // http://spec.commonmark.org/0.15/#ascii-punctuation-character
  //
  // Don't confuse with unicode punctuation !!! It lacks some chars in ascii range.
  //
  function isMdAsciiPunct(ch) {
    switch (ch) {
      case 0x21/* ! */:
      case 0x22/* " */:
      case 0x23/* # */:
      case 0x24/* $ */:
      case 0x25/* % */:
      case 0x26/* & */:
      case 0x27/* ' */:
      case 0x28/* ( */:
      case 0x29/* ) */:
      case 0x2A/* * */:
      case 0x2B/* + */:
      case 0x2C/* , */:
      case 0x2D/* - */:
      case 0x2E/* . */:
      case 0x2F/* / */:
      case 0x3A/* : */:
      case 0x3B/* ; */:
      case 0x3C/* < */:
      case 0x3D/* = */:
      case 0x3E/* > */:
      case 0x3F/* ? */:
      case 0x40/* @ */:
      case 0x5B/* [ */:
      case 0x5C/* \ */:
      case 0x5D/* ] */:
      case 0x5E/* ^ */:
      case 0x5F/* _ */:
      case 0x60/* ` */:
      case 0x7B/* { */:
      case 0x7C/* | */:
      case 0x7D/* } */:
      case 0x7E/* ~ */:
        return true;
      default:
        return false;
    }
  }

  // Hepler to unify [reference labels].
  //
  function normalizeReference(str) {
    // use .toUpperCase() instead of .toLowerCase()
    // here to avoid a conflict with Object.prototype
    // members (most notably, `__proto__`)
    return str.trim().replace(/\s+/g, ' ').toUpperCase();
  }

  ////////////////////////////////////////////////////////////////////////////////

  // Re-export libraries commonly used in both markdown-it and its plugins,
  // so plugins won't have to depend on them explicitly, which reduces their
  // bundled size (e.g. a browser build).
  //
  exports.lib                 = {};
  exports.lib.mdurl           = _mdurl_1_0_1_mdurl;
  exports.lib.ucmicro         = _uc_micro_1_0_5_uc_micro;

  exports.assign              = assign;
  exports.isString            = isString;
  exports.has                 = has;
  exports.unescapeMd          = unescapeMd;
  exports.unescapeAll         = unescapeAll;
  exports.isValidEntityCode   = isValidEntityCode;
  exports.fromCodePoint       = fromCodePoint;
  // exports.replaceEntities     = replaceEntities;
  exports.escapeHtml          = escapeHtml;
  exports.arrayReplaceAt      = arrayReplaceAt;
  exports.isSpace             = isSpace;
  exports.isWhiteSpace        = isWhiteSpace;
  exports.isMdAsciiPunct      = isMdAsciiPunct;
  exports.isPunctChar         = isPunctChar;
  exports.escapeRE            = escapeRE;
  exports.normalizeReference  = normalizeReference;
  });
  var utils_1 = utils$1.lib;
  var utils_2 = utils$1.assign;
  var utils_3 = utils$1.isString;
  var utils_4 = utils$1.has;
  var utils_5 = utils$1.unescapeMd;
  var utils_6 = utils$1.unescapeAll;
  var utils_7 = utils$1.isValidEntityCode;
  var utils_8 = utils$1.fromCodePoint;
  var utils_9 = utils$1.escapeHtml;
  var utils_10 = utils$1.arrayReplaceAt;
  var utils_11 = utils$1.isSpace;
  var utils_12 = utils$1.isWhiteSpace;
  var utils_13 = utils$1.isMdAsciiPunct;
  var utils_14 = utils$1.isPunctChar;
  var utils_15 = utils$1.escapeRE;
  var utils_16 = utils$1.normalizeReference;

  // Parse link label

  var parse_link_label = function parseLinkLabel(state, start, disableNested) {
    var level, found, marker, prevPos,
        labelEnd = -1,
        max = state.posMax,
        oldPos = state.pos;

    state.pos = start + 1;
    level = 1;

    while (state.pos < max) {
      marker = state.src.charCodeAt(state.pos);
      if (marker === 0x5D /* ] */) {
        level--;
        if (level === 0) {
          found = true;
          break;
        }
      }

      prevPos = state.pos;
      state.md.inline.skipToken(state);
      if (marker === 0x5B /* [ */) {
        if (prevPos === state.pos - 1) {
          // increase level if we find text `[`, which is not a part of any token
          level++;
        } else if (disableNested) {
          state.pos = oldPos;
          return -1;
        }
      }
    }

    if (found) {
      labelEnd = state.pos;
    }

    // restore old state
    state.pos = oldPos;

    return labelEnd;
  };

  var isSpace     = utils$1.isSpace;
  var unescapeAll = utils$1.unescapeAll;


  var parse_link_destination = function parseLinkDestination(str, pos, max) {
    var code, level,
        lines = 0,
        start = pos,
        result = {
          ok: false,
          pos: 0,
          lines: 0,
          str: ''
        };

    if (str.charCodeAt(pos) === 0x3C /* < */) {
      pos++;
      while (pos < max) {
        code = str.charCodeAt(pos);
        if (code === 0x0A /* \n */ || isSpace(code)) { return result; }
        if (code === 0x3E /* > */) {
          result.pos = pos + 1;
          result.str = unescapeAll(str.slice(start + 1, pos));
          result.ok = true;
          return result;
        }
        if (code === 0x5C /* \ */ && pos + 1 < max) {
          pos += 2;
          continue;
        }

        pos++;
      }

      // no closing '>'
      return result;
    }

    // this should be ... } else { ... branch

    level = 0;
    while (pos < max) {
      code = str.charCodeAt(pos);

      if (code === 0x20) { break; }

      // ascii control characters
      if (code < 0x20 || code === 0x7F) { break; }

      if (code === 0x5C /* \ */ && pos + 1 < max) {
        pos += 2;
        continue;
      }

      if (code === 0x28 /* ( */) {
        level++;
      }

      if (code === 0x29 /* ) */) {
        if (level === 0) { break; }
        level--;
      }

      pos++;
    }

    if (start === pos) { return result; }
    if (level !== 0) { return result; }

    result.str = unescapeAll(str.slice(start, pos));
    result.lines = lines;
    result.pos = pos;
    result.ok = true;
    return result;
  };

  var unescapeAll$1 = utils$1.unescapeAll;


  var parse_link_title = function parseLinkTitle(str, pos, max) {
    var code,
        marker,
        lines = 0,
        start = pos,
        result = {
          ok: false,
          pos: 0,
          lines: 0,
          str: ''
        };

    if (pos >= max) { return result; }

    marker = str.charCodeAt(pos);

    if (marker !== 0x22 /* " */ && marker !== 0x27 /* ' */ && marker !== 0x28 /* ( */) { return result; }

    pos++;

    // if opening marker is "(", switch it to closing marker ")"
    if (marker === 0x28) { marker = 0x29; }

    while (pos < max) {
      code = str.charCodeAt(pos);
      if (code === marker) {
        result.pos = pos + 1;
        result.lines = lines;
        result.str = unescapeAll$1(str.slice(start + 1, pos));
        result.ok = true;
        return result;
      } else if (code === 0x0A) {
        lines++;
      } else if (code === 0x5C /* \ */ && pos + 1 < max) {
        pos++;
        if (str.charCodeAt(pos) === 0x0A) {
          lines++;
        }
      }

      pos++;
    }

    return result;
  };

  var parseLinkLabel       = parse_link_label;
  var parseLinkDestination = parse_link_destination;
  var parseLinkTitle       = parse_link_title;

  var helpers = {
  	parseLinkLabel: parseLinkLabel,
  	parseLinkDestination: parseLinkDestination,
  	parseLinkTitle: parseLinkTitle
  };

  var assign$1          = utils$1.assign;
  var unescapeAll$2     = utils$1.unescapeAll;
  var escapeHtml      = utils$1.escapeHtml;


  ////////////////////////////////////////////////////////////////////////////////

  var default_rules = {};


  default_rules.code_inline = function (tokens, idx, options, env, slf) {
    var token = tokens[idx];

    return  '<code' + slf.renderAttrs(token) + '>' +
            escapeHtml(tokens[idx].content) +
            '</code>';
  };


  default_rules.code_block = function (tokens, idx, options, env, slf) {
    var token = tokens[idx];

    return  '<pre' + slf.renderAttrs(token) + '><code>' +
            escapeHtml(tokens[idx].content) +
            '</code></pre>\n';
  };


  default_rules.fence = function (tokens, idx, options, env, slf) {
    var token = tokens[idx],
        info = token.info ? unescapeAll$2(token.info).trim() : '',
        langName = '',
        highlighted, i, tmpAttrs, tmpToken;

    if (info) {
      langName = info.split(/\s+/g)[0];
    }

    if (options.highlight) {
      highlighted = options.highlight(token.content, langName) || escapeHtml(token.content);
    } else {
      highlighted = escapeHtml(token.content);
    }

    if (highlighted.indexOf('<pre') === 0) {
      return highlighted + '\n';
    }

    // If language exists, inject class gently, without modifying original token.
    // May be, one day we will add .clone() for token and simplify this part, but
    // now we prefer to keep things local.
    if (info) {
      i        = token.attrIndex('class');
      tmpAttrs = token.attrs ? token.attrs.slice() : [];

      if (i < 0) {
        tmpAttrs.push([ 'class', options.langPrefix + langName ]);
      } else {
        tmpAttrs[i][1] += ' ' + options.langPrefix + langName;
      }

      // Fake token just to render attributes
      tmpToken = {
        attrs: tmpAttrs
      };

      return  '<pre><code' + slf.renderAttrs(tmpToken) + '>'
            + highlighted
            + '</code></pre>\n';
    }


    return  '<pre><code' + slf.renderAttrs(token) + '>'
          + highlighted
          + '</code></pre>\n';
  };


  default_rules.image = function (tokens, idx, options, env, slf) {
    var token = tokens[idx];

    // "alt" attr MUST be set, even if empty. Because it's mandatory and
    // should be placed on proper position for tests.
    //
    // Replace content with actual value

    token.attrs[token.attrIndex('alt')][1] =
      slf.renderInlineAsText(token.children, options, env);

    return slf.renderToken(tokens, idx, options);
  };


  default_rules.hardbreak = function (tokens, idx, options /*, env */) {
    return options.xhtmlOut ? '<br />\n' : '<br>\n';
  };
  default_rules.softbreak = function (tokens, idx, options /*, env */) {
    return options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n';
  };


  default_rules.text = function (tokens, idx /*, options, env */) {
    return escapeHtml(tokens[idx].content);
  };


  default_rules.html_block = function (tokens, idx /*, options, env */) {
    return tokens[idx].content;
  };
  default_rules.html_inline = function (tokens, idx /*, options, env */) {
    return tokens[idx].content;
  };


  /**
   * new Renderer()
   *
   * Creates new [[Renderer]] instance and fill [[Renderer#rules]] with defaults.
   **/
  function Renderer() {

    /**
     * Renderer#rules -> Object
     *
     * Contains render rules for tokens. Can be updated and extended.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * md.renderer.rules.strong_open  = function () { return '<b>'; };
     * md.renderer.rules.strong_close = function () { return '</b>'; };
     *
     * var result = md.renderInline(...);
     * ```
     *
     * Each rule is called as independent static function with fixed signature:
     *
     * ```javascript
     * function my_token_render(tokens, idx, options, env, renderer) {
     *   // ...
     *   return renderedHTML;
     * }
     * ```
     *
     * See [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js)
     * for more details and examples.
     **/
    this.rules = assign$1({}, default_rules);
  }


  /**
   * Renderer.renderAttrs(token) -> String
   *
   * Render token attributes to string.
   **/
  Renderer.prototype.renderAttrs = function renderAttrs(token) {
    var i, l, result;

    if (!token.attrs) { return ''; }

    result = '';

    for (i = 0, l = token.attrs.length; i < l; i++) {
      result += ' ' + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"';
    }

    return result;
  };


  /**
   * Renderer.renderToken(tokens, idx, options) -> String
   * - tokens (Array): list of tokens
   * - idx (Numbed): token index to render
   * - options (Object): params of parser instance
   *
   * Default token renderer. Can be overriden by custom function
   * in [[Renderer#rules]].
   **/
  Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
    var nextToken,
        result = '',
        needLf = false,
        token = tokens[idx];

    // Tight list paragraphs
    if (token.hidden) {
      return '';
    }

    // Insert a newline between hidden paragraph and subsequent opening
    // block-level tag.
    //
    // For example, here we should insert a newline before blockquote:
    //  - a
    //    >
    //
    if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
      result += '\n';
    }

    // Add token name, e.g. `<img`
    result += (token.nesting === -1 ? '</' : '<') + token.tag;

    // Encode attributes, e.g. `<img src="foo"`
    result += this.renderAttrs(token);

    // Add a slash for self-closing tags, e.g. `<img src="foo" /`
    if (token.nesting === 0 && options.xhtmlOut) {
      result += ' /';
    }

    // Check if we need to add a newline after this tag
    if (token.block) {
      needLf = true;

      if (token.nesting === 1) {
        if (idx + 1 < tokens.length) {
          nextToken = tokens[idx + 1];

          if (nextToken.type === 'inline' || nextToken.hidden) {
            // Block-level tag containing an inline tag.
            //
            needLf = false;

          } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
            // Opening tag + closing tag of the same type. E.g. `<li></li>`.
            //
            needLf = false;
          }
        }
      }
    }

    result += needLf ? '>\n' : '>';

    return result;
  };


  /**
   * Renderer.renderInline(tokens, options, env) -> String
   * - tokens (Array): list on block tokens to renter
   * - options (Object): params of parser instance
   * - env (Object): additional data from parsed input (references, for example)
   *
   * The same as [[Renderer.render]], but for single token of `inline` type.
   **/
  Renderer.prototype.renderInline = function (tokens, options, env) {
    var type,
        result = '',
        rules = this.rules;

    for (var i = 0, len = tokens.length; i < len; i++) {
      type = tokens[i].type;

      if (typeof rules[type] !== 'undefined') {
        result += rules[type](tokens, i, options, env, this);
      } else {
        result += this.renderToken(tokens, i, options);
      }
    }

    return result;
  };


  /** internal
   * Renderer.renderInlineAsText(tokens, options, env) -> String
   * - tokens (Array): list on block tokens to renter
   * - options (Object): params of parser instance
   * - env (Object): additional data from parsed input (references, for example)
   *
   * Special kludge for image `alt` attributes to conform CommonMark spec.
   * Don't try to use it! Spec requires to show `alt` content with stripped markup,
   * instead of simple escaping.
   **/
  Renderer.prototype.renderInlineAsText = function (tokens, options, env) {
    var result = '';

    for (var i = 0, len = tokens.length; i < len; i++) {
      if (tokens[i].type === 'text') {
        result += tokens[i].content;
      } else if (tokens[i].type === 'image') {
        result += this.renderInlineAsText(tokens[i].children, options, env);
      }
    }

    return result;
  };


  /**
   * Renderer.render(tokens, options, env) -> String
   * - tokens (Array): list on block tokens to renter
   * - options (Object): params of parser instance
   * - env (Object): additional data from parsed input (references, for example)
   *
   * Takes token stream and generates HTML. Probably, you will never need to call
   * this method directly.
   **/
  Renderer.prototype.render = function (tokens, options, env) {
    var i, len, type,
        result = '',
        rules = this.rules;

    for (i = 0, len = tokens.length; i < len; i++) {
      type = tokens[i].type;

      if (type === 'inline') {
        result += this.renderInline(tokens[i].children, options, env);
      } else if (typeof rules[type] !== 'undefined') {
        result += rules[tokens[i].type](tokens, i, options, env, this);
      } else {
        result += this.renderToken(tokens, i, options, env);
      }
    }

    return result;
  };

  var renderer = Renderer;

  /**
   * class Ruler
   *
   * Helper class, used by [[MarkdownIt#core]], [[MarkdownIt#block]] and
   * [[MarkdownIt#inline]] to manage sequences of functions (rules):
   *
   * - keep rules in defined order
   * - assign the name to each rule
   * - enable/disable rules
   * - add/replace rules
   * - allow assign rules to additional named chains (in the same)
   * - cacheing lists of active rules
   *
   * You will not need use this class directly until write plugins. For simple
   * rules control use [[MarkdownIt.disable]], [[MarkdownIt.enable]] and
   * [[MarkdownIt.use]].
   **/


  /**
   * new Ruler()
   **/
  function Ruler() {
    // List of added rules. Each element is:
    //
    // {
    //   name: XXX,
    //   enabled: Boolean,
    //   fn: Function(),
    //   alt: [ name2, name3 ]
    // }
    //
    this.__rules__ = [];

    // Cached rule chains.
    //
    // First level - chain name, '' for default.
    // Second level - diginal anchor for fast filtering by charcodes.
    //
    this.__cache__ = null;
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Helper methods, should not be used directly


  // Find rule index by name
  //
  Ruler.prototype.__find__ = function (name) {
    for (var i = 0; i < this.__rules__.length; i++) {
      if (this.__rules__[i].name === name) {
        return i;
      }
    }
    return -1;
  };


  // Build rules lookup cache
  //
  Ruler.prototype.__compile__ = function () {
    var self = this;
    var chains = [ '' ];

    // collect unique names
    self.__rules__.forEach(function (rule) {
      if (!rule.enabled) { return; }

      rule.alt.forEach(function (altName) {
        if (chains.indexOf(altName) < 0) {
          chains.push(altName);
        }
      });
    });

    self.__cache__ = {};

    chains.forEach(function (chain) {
      self.__cache__[chain] = [];
      self.__rules__.forEach(function (rule) {
        if (!rule.enabled) { return; }

        if (chain && rule.alt.indexOf(chain) < 0) { return; }

        self.__cache__[chain].push(rule.fn);
      });
    });
  };


  /**
   * Ruler.at(name, fn [, options])
   * - name (String): rule name to replace.
   * - fn (Function): new rule function.
   * - options (Object): new rule options (not mandatory).
   *
   * Replace rule by name with new function & options. Throws error if name not
   * found.
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * Replace existing typographer replacement rule with new one:
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.core.ruler.at('replacements', function replace(state) {
   *   //...
   * });
   * ```
   **/
  Ruler.prototype.at = function (name, fn, options) {
    var index = this.__find__(name);
    var opt = options || {};

    if (index === -1) { throw new Error('Parser rule not found: ' + name); }

    this.__rules__[index].fn = fn;
    this.__rules__[index].alt = opt.alt || [];
    this.__cache__ = null;
  };


  /**
   * Ruler.before(beforeName, ruleName, fn [, options])
   * - beforeName (String): new rule will be added before this one.
   * - ruleName (String): name of added rule.
   * - fn (Function): rule function.
   * - options (Object): rule options (not mandatory).
   *
   * Add new rule to chain before one with given name. See also
   * [[Ruler.after]], [[Ruler.push]].
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
   *   //...
   * });
   * ```
   **/
  Ruler.prototype.before = function (beforeName, ruleName, fn, options) {
    var index = this.__find__(beforeName);
    var opt = options || {};

    if (index === -1) { throw new Error('Parser rule not found: ' + beforeName); }

    this.__rules__.splice(index, 0, {
      name: ruleName,
      enabled: true,
      fn: fn,
      alt: opt.alt || []
    });

    this.__cache__ = null;
  };


  /**
   * Ruler.after(afterName, ruleName, fn [, options])
   * - afterName (String): new rule will be added after this one.
   * - ruleName (String): name of added rule.
   * - fn (Function): rule function.
   * - options (Object): rule options (not mandatory).
   *
   * Add new rule to chain after one with given name. See also
   * [[Ruler.before]], [[Ruler.push]].
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.inline.ruler.after('text', 'my_rule', function replace(state) {
   *   //...
   * });
   * ```
   **/
  Ruler.prototype.after = function (afterName, ruleName, fn, options) {
    var index = this.__find__(afterName);
    var opt = options || {};

    if (index === -1) { throw new Error('Parser rule not found: ' + afterName); }

    this.__rules__.splice(index + 1, 0, {
      name: ruleName,
      enabled: true,
      fn: fn,
      alt: opt.alt || []
    });

    this.__cache__ = null;
  };

  /**
   * Ruler.push(ruleName, fn [, options])
   * - ruleName (String): name of added rule.
   * - fn (Function): rule function.
   * - options (Object): rule options (not mandatory).
   *
   * Push new rule to the end of chain. See also
   * [[Ruler.before]], [[Ruler.after]].
   *
   * ##### Options:
   *
   * - __alt__ - array with names of "alternate" chains.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.core.ruler.push('my_rule', function replace(state) {
   *   //...
   * });
   * ```
   **/
  Ruler.prototype.push = function (ruleName, fn, options) {
    var opt = options || {};

    this.__rules__.push({
      name: ruleName,
      enabled: true,
      fn: fn,
      alt: opt.alt || []
    });

    this.__cache__ = null;
  };


  /**
   * Ruler.enable(list [, ignoreInvalid]) -> Array
   * - list (String|Array): list of rule names to enable.
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Enable rules with given names. If any rule name not found - throw Error.
   * Errors can be disabled by second param.
   *
   * Returns list of found rule names (if no exception happened).
   *
   * See also [[Ruler.disable]], [[Ruler.enableOnly]].
   **/
  Ruler.prototype.enable = function (list, ignoreInvalid) {
    if (!Array.isArray(list)) { list = [ list ]; }

    var result = [];

    // Search by name and enable
    list.forEach(function (name) {
      var idx = this.__find__(name);

      if (idx < 0) {
        if (ignoreInvalid) { return; }
        throw new Error('Rules manager: invalid rule name ' + name);
      }
      this.__rules__[idx].enabled = true;
      result.push(name);
    }, this);

    this.__cache__ = null;
    return result;
  };


  /**
   * Ruler.enableOnly(list [, ignoreInvalid])
   * - list (String|Array): list of rule names to enable (whitelist).
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Enable rules with given names, and disable everything else. If any rule name
   * not found - throw Error. Errors can be disabled by second param.
   *
   * See also [[Ruler.disable]], [[Ruler.enable]].
   **/
  Ruler.prototype.enableOnly = function (list, ignoreInvalid) {
    if (!Array.isArray(list)) { list = [ list ]; }

    this.__rules__.forEach(function (rule) { rule.enabled = false; });

    this.enable(list, ignoreInvalid);
  };


  /**
   * Ruler.disable(list [, ignoreInvalid]) -> Array
   * - list (String|Array): list of rule names to disable.
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Disable rules with given names. If any rule name not found - throw Error.
   * Errors can be disabled by second param.
   *
   * Returns list of found rule names (if no exception happened).
   *
   * See also [[Ruler.enable]], [[Ruler.enableOnly]].
   **/
  Ruler.prototype.disable = function (list, ignoreInvalid) {
    if (!Array.isArray(list)) { list = [ list ]; }

    var result = [];

    // Search by name and disable
    list.forEach(function (name) {
      var idx = this.__find__(name);

      if (idx < 0) {
        if (ignoreInvalid) { return; }
        throw new Error('Rules manager: invalid rule name ' + name);
      }
      this.__rules__[idx].enabled = false;
      result.push(name);
    }, this);

    this.__cache__ = null;
    return result;
  };


  /**
   * Ruler.getRules(chainName) -> Array
   *
   * Return array of active functions (rules) for given chain name. It analyzes
   * rules configuration, compiles caches if not exists and returns result.
   *
   * Default chain name is `''` (empty string). It can't be skipped. That's
   * done intentionally, to keep signature monomorphic for high speed.
   **/
  Ruler.prototype.getRules = function (chainName) {
    if (this.__cache__ === null) {
      this.__compile__();
    }

    // Chain can be empty, if rules disabled. But we still have to return Array.
    return this.__cache__[chainName] || [];
  };

  var ruler = Ruler;

  // Normalize input string


  var NEWLINES_RE  = /\r[\n\u0085]?|[\u2424\u2028\u0085]/g;
  var NULL_RE      = /\u0000/g;


  var normalize = function inline(state) {
    var str;

    // Normalize newlines
    str = state.src.replace(NEWLINES_RE, '\n');

    // Replace NULL characters
    str = str.replace(NULL_RE, '\uFFFD');

    state.src = str;
  };

  var block$1 = function block(state) {
    var token;

    if (state.inlineMode) {
      token          = new state.Token('inline', '', 0);
      token.content  = state.src;
      token.map      = [ 0, 1 ];
      token.children = [];
      state.tokens.push(token);
    } else {
      state.md.block.parse(state.src, state.md, state.env, state.tokens);
    }
  };

  var inline = function inline(state) {
    var tokens = state.tokens, tok, i, l;

    // Parse inlines
    for (i = 0, l = tokens.length; i < l; i++) {
      tok = tokens[i];
      if (tok.type === 'inline') {
        state.md.inline.parse(tok.content, state.md, state.env, tok.children);
      }
    }
  };

  var arrayReplaceAt = utils$1.arrayReplaceAt;


  function isLinkOpen(str) {
    return /^<a[>\s]/i.test(str);
  }
  function isLinkClose(str) {
    return /^<\/a\s*>/i.test(str);
  }


  var linkify = function linkify(state) {
    var i, j, l, tokens, token, currentToken, nodes, ln, text, pos, lastPos,
        level, htmlLinkLevel, url, fullUrl, urlText,
        blockTokens = state.tokens,
        links;

    if (!state.md.options.linkify) { return; }

    for (j = 0, l = blockTokens.length; j < l; j++) {
      if (blockTokens[j].type !== 'inline' ||
          !state.md.linkify.pretest(blockTokens[j].content)) {
        continue;
      }

      tokens = blockTokens[j].children;

      htmlLinkLevel = 0;

      // We scan from the end, to keep position when new tags added.
      // Use reversed logic in links start/end match
      for (i = tokens.length - 1; i >= 0; i--) {
        currentToken = tokens[i];

        // Skip content of markdown links
        if (currentToken.type === 'link_close') {
          i--;
          while (tokens[i].level !== currentToken.level && tokens[i].type !== 'link_open') {
            i--;
          }
          continue;
        }

        // Skip content of html tag links
        if (currentToken.type === 'html_inline') {
          if (isLinkOpen(currentToken.content) && htmlLinkLevel > 0) {
            htmlLinkLevel--;
          }
          if (isLinkClose(currentToken.content)) {
            htmlLinkLevel++;
          }
        }
        if (htmlLinkLevel > 0) { continue; }

        if (currentToken.type === 'text' && state.md.linkify.test(currentToken.content)) {

          text = currentToken.content;
          links = state.md.linkify.match(text);

          // Now split string to nodes
          nodes = [];
          level = currentToken.level;
          lastPos = 0;

          for (ln = 0; ln < links.length; ln++) {

            url = links[ln].url;
            fullUrl = state.md.normalizeLink(url);
            if (!state.md.validateLink(fullUrl)) { continue; }

            urlText = links[ln].text;

            // Linkifier might send raw hostnames like "example.com", where url
            // starts with domain name. So we prepend http:// in those cases,
            // and remove it afterwards.
            //
            if (!links[ln].schema) {
              urlText = state.md.normalizeLinkText('http://' + urlText).replace(/^http:\/\//, '');
            } else if (links[ln].schema === 'mailto:' && !/^mailto:/i.test(urlText)) {
              urlText = state.md.normalizeLinkText('mailto:' + urlText).replace(/^mailto:/, '');
            } else {
              urlText = state.md.normalizeLinkText(urlText);
            }

            pos = links[ln].index;

            if (pos > lastPos) {
              token         = new state.Token('text', '', 0);
              token.content = text.slice(lastPos, pos);
              token.level   = level;
              nodes.push(token);
            }

            token         = new state.Token('link_open', 'a', 1);
            token.attrs   = [ [ 'href', fullUrl ] ];
            token.level   = level++;
            token.markup  = 'linkify';
            token.info    = 'auto';
            nodes.push(token);

            token         = new state.Token('text', '', 0);
            token.content = urlText;
            token.level   = level;
            nodes.push(token);

            token         = new state.Token('link_close', 'a', -1);
            token.level   = --level;
            token.markup  = 'linkify';
            token.info    = 'auto';
            nodes.push(token);

            lastPos = links[ln].lastIndex;
          }
          if (lastPos < text.length) {
            token         = new state.Token('text', '', 0);
            token.content = text.slice(lastPos);
            token.level   = level;
            nodes.push(token);
          }

          // replace current node
          blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
        }
      }
    }
  };

  // Simple typographyc replacements

  // TODO:
  // - fractionals 1/2, 1/4, 3/4 -> ½, ¼, ¾
  // - miltiplication 2 x 4 -> 2 × 4

  var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;

  // Workaround for phantomjs - need regex without /g flag,
  // or root check will fail every second time
  var SCOPED_ABBR_TEST_RE = /\((c|tm|r|p)\)/i;

  var SCOPED_ABBR_RE = /\((c|tm|r|p)\)/ig;
  var SCOPED_ABBR = {
    c: '©',
    r: '®',
    p: '§',
    tm: '™'
  };

  function replaceFn(match, name) {
    return SCOPED_ABBR[name.toLowerCase()];
  }

  function replace_scoped(inlineTokens) {
    var i, token, inside_autolink = 0;

    for (i = inlineTokens.length - 1; i >= 0; i--) {
      token = inlineTokens[i];

      if (token.type === 'text' && !inside_autolink) {
        token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
      }

      if (token.type === 'link_open' && token.info === 'auto') {
        inside_autolink--;
      }

      if (token.type === 'link_close' && token.info === 'auto') {
        inside_autolink++;
      }
    }
  }

  function replace_rare(inlineTokens) {
    var i, token, inside_autolink = 0;

    for (i = inlineTokens.length - 1; i >= 0; i--) {
      token = inlineTokens[i];

      if (token.type === 'text' && !inside_autolink) {
        if (RARE_RE.test(token.content)) {
          token.content = token.content
                      .replace(/\+-/g, '±')
                      // .., ..., ....... -> …
                      // but ?..... & !..... -> ?.. & !..
                      .replace(/\.{2,}/g, '…').replace(/([?!])…/g, '$1..')
                      .replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',')
                      // em-dash
                      .replace(/(^|[^-])---([^-]|$)/mg, '$1\u2014$2')
                      // en-dash
                      .replace(/(^|\s)--(\s|$)/mg, '$1\u2013$2')
                      .replace(/(^|[^-\s])--([^-\s]|$)/mg, '$1\u2013$2');
        }
      }

      if (token.type === 'link_open' && token.info === 'auto') {
        inside_autolink--;
      }

      if (token.type === 'link_close' && token.info === 'auto') {
        inside_autolink++;
      }
    }
  }


  var replacements = function replace(state) {
    var blkIdx;

    if (!state.md.options.typographer) { return; }

    for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

      if (state.tokens[blkIdx].type !== 'inline') { continue; }

      if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
        replace_scoped(state.tokens[blkIdx].children);
      }

      if (RARE_RE.test(state.tokens[blkIdx].content)) {
        replace_rare(state.tokens[blkIdx].children);
      }

    }
  };

  var isWhiteSpace   = utils$1.isWhiteSpace;
  var isPunctChar    = utils$1.isPunctChar;
  var isMdAsciiPunct = utils$1.isMdAsciiPunct;

  var QUOTE_TEST_RE = /['"]/;
  var QUOTE_RE = /['"]/g;
  var APOSTROPHE = '\u2019'; /* ’ */


  function replaceAt(str, index, ch) {
    return str.substr(0, index) + ch + str.substr(index + 1);
  }

  function process_inlines(tokens, state) {
    var i, token, text, t, pos, max, thisLevel, item, lastChar, nextChar,
        isLastPunctChar, isNextPunctChar, isLastWhiteSpace, isNextWhiteSpace,
        canOpen, canClose, j, isSingle, stack, openQuote, closeQuote;

    stack = [];

    for (i = 0; i < tokens.length; i++) {
      token = tokens[i];

      thisLevel = tokens[i].level;

      for (j = stack.length - 1; j >= 0; j--) {
        if (stack[j].level <= thisLevel) { break; }
      }
      stack.length = j + 1;

      if (token.type !== 'text') { continue; }

      text = token.content;
      pos = 0;
      max = text.length;

      /*eslint no-labels:0,block-scoped-var:0*/
      OUTER:
      while (pos < max) {
        QUOTE_RE.lastIndex = pos;
        t = QUOTE_RE.exec(text);
        if (!t) { break; }

        canOpen = canClose = true;
        pos = t.index + 1;
        isSingle = (t[0] === "'");

        // Find previous character,
        // default to space if it's the beginning of the line
        //
        lastChar = 0x20;

        if (t.index - 1 >= 0) {
          lastChar = text.charCodeAt(t.index - 1);
        } else {
          for (j = i - 1; j >= 0; j--) {
            if (tokens[j].type === 'softbreak' || tokens[j].type === 'hardbreak') break; // lastChar defaults to 0x20
            if (tokens[j].type !== 'text') continue;

            lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
            break;
          }
        }

        // Find next character,
        // default to space if it's the end of the line
        //
        nextChar = 0x20;

        if (pos < max) {
          nextChar = text.charCodeAt(pos);
        } else {
          for (j = i + 1; j < tokens.length; j++) {
            if (tokens[j].type === 'softbreak' || tokens[j].type === 'hardbreak') break; // nextChar defaults to 0x20
            if (tokens[j].type !== 'text') continue;

            nextChar = tokens[j].content.charCodeAt(0);
            break;
          }
        }

        isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
        isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

        isLastWhiteSpace = isWhiteSpace(lastChar);
        isNextWhiteSpace = isWhiteSpace(nextChar);

        if (isNextWhiteSpace) {
          canOpen = false;
        } else if (isNextPunctChar) {
          if (!(isLastWhiteSpace || isLastPunctChar)) {
            canOpen = false;
          }
        }

        if (isLastWhiteSpace) {
          canClose = false;
        } else if (isLastPunctChar) {
          if (!(isNextWhiteSpace || isNextPunctChar)) {
            canClose = false;
          }
        }

        if (nextChar === 0x22 /* " */ && t[0] === '"') {
          if (lastChar >= 0x30 /* 0 */ && lastChar <= 0x39 /* 9 */) {
            // special case: 1"" - count first quote as an inch
            canClose = canOpen = false;
          }
        }

        if (canOpen && canClose) {
          // treat this as the middle of the word
          canOpen = false;
          canClose = isNextPunctChar;
        }

        if (!canOpen && !canClose) {
          // middle of word
          if (isSingle) {
            token.content = replaceAt(token.content, t.index, APOSTROPHE);
          }
          continue;
        }

        if (canClose) {
          // this could be a closing quote, rewind the stack to get a match
          for (j = stack.length - 1; j >= 0; j--) {
            item = stack[j];
            if (stack[j].level < thisLevel) { break; }
            if (item.single === isSingle && stack[j].level === thisLevel) {
              item = stack[j];

              if (isSingle) {
                openQuote = state.md.options.quotes[2];
                closeQuote = state.md.options.quotes[3];
              } else {
                openQuote = state.md.options.quotes[0];
                closeQuote = state.md.options.quotes[1];
              }

              // replace token.content *before* tokens[item.token].content,
              // because, if they are pointing at the same token, replaceAt
              // could mess up indices when quote length != 1
              token.content = replaceAt(token.content, t.index, closeQuote);
              tokens[item.token].content = replaceAt(
                tokens[item.token].content, item.pos, openQuote);

              pos += closeQuote.length - 1;
              if (item.token === i) { pos += openQuote.length - 1; }

              text = token.content;
              max = text.length;

              stack.length = j;
              continue OUTER;
            }
          }
        }

        if (canOpen) {
          stack.push({
            token: i,
            pos: t.index,
            single: isSingle,
            level: thisLevel
          });
        } else if (canClose && isSingle) {
          token.content = replaceAt(token.content, t.index, APOSTROPHE);
        }
      }
    }
  }


  var smartquotes = function smartquotes(state) {
    /*eslint max-depth:0*/
    var blkIdx;

    if (!state.md.options.typographer) { return; }

    for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

      if (state.tokens[blkIdx].type !== 'inline' ||
          !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) {
        continue;
      }

      process_inlines(state.tokens[blkIdx].children, state);
    }
  };

  // Token class


  /**
   * class Token
   **/

  /**
   * new Token(type, tag, nesting)
   *
   * Create new token and fill passed properties.
   **/
  function Token(type, tag, nesting) {
    /**
     * Token#type -> String
     *
     * Type of the token (string, e.g. "paragraph_open")
     **/
    this.type     = type;

    /**
     * Token#tag -> String
     *
     * html tag name, e.g. "p"
     **/
    this.tag      = tag;

    /**
     * Token#attrs -> Array
     *
     * Html attributes. Format: `[ [ name1, value1 ], [ name2, value2 ] ]`
     **/
    this.attrs    = null;

    /**
     * Token#map -> Array
     *
     * Source map info. Format: `[ line_begin, line_end ]`
     **/
    this.map      = null;

    /**
     * Token#nesting -> Number
     *
     * Level change (number in {-1, 0, 1} set), where:
     *
     * -  `1` means the tag is opening
     * -  `0` means the tag is self-closing
     * - `-1` means the tag is closing
     **/
    this.nesting  = nesting;

    /**
     * Token#level -> Number
     *
     * nesting level, the same as `state.level`
     **/
    this.level    = 0;

    /**
     * Token#children -> Array
     *
     * An array of child nodes (inline and img tokens)
     **/
    this.children = null;

    /**
     * Token#content -> String
     *
     * In a case of self-closing tag (code, html, fence, etc.),
     * it has contents of this tag.
     **/
    this.content  = '';

    /**
     * Token#markup -> String
     *
     * '*' or '_' for emphasis, fence string for fence, etc.
     **/
    this.markup   = '';

    /**
     * Token#info -> String
     *
     * fence infostring
     **/
    this.info     = '';

    /**
     * Token#meta -> Object
     *
     * A place for plugins to store an arbitrary data
     **/
    this.meta     = null;

    /**
     * Token#block -> Boolean
     *
     * True for block-level tokens, false for inline tokens.
     * Used in renderer to calculate line breaks
     **/
    this.block    = false;

    /**
     * Token#hidden -> Boolean
     *
     * If it's true, ignore this element when rendering. Used for tight lists
     * to hide paragraphs.
     **/
    this.hidden   = false;
  }


  /**
   * Token.attrIndex(name) -> Number
   *
   * Search attribute index by name.
   **/
  Token.prototype.attrIndex = function attrIndex(name) {
    var attrs, i, len;

    if (!this.attrs) { return -1; }

    attrs = this.attrs;

    for (i = 0, len = attrs.length; i < len; i++) {
      if (attrs[i][0] === name) { return i; }
    }
    return -1;
  };


  /**
   * Token.attrPush(attrData)
   *
   * Add `[ name, value ]` attribute to list. Init attrs if necessary
   **/
  Token.prototype.attrPush = function attrPush(attrData) {
    if (this.attrs) {
      this.attrs.push(attrData);
    } else {
      this.attrs = [ attrData ];
    }
  };


  /**
   * Token.attrSet(name, value)
   *
   * Set `name` attribute to `value`. Override old value if exists.
   **/
  Token.prototype.attrSet = function attrSet(name, value) {
    var idx = this.attrIndex(name),
        attrData = [ name, value ];

    if (idx < 0) {
      this.attrPush(attrData);
    } else {
      this.attrs[idx] = attrData;
    }
  };


  /**
   * Token.attrGet(name)
   *
   * Get the value of attribute `name`, or null if it does not exist.
   **/
  Token.prototype.attrGet = function attrGet(name) {
    var idx = this.attrIndex(name), value = null;
    if (idx >= 0) {
      value = this.attrs[idx][1];
    }
    return value;
  };


  /**
   * Token.attrJoin(name, value)
   *
   * Join value to existing attribute via space. Or create new attribute if not
   * exists. Useful to operate with token classes.
   **/
  Token.prototype.attrJoin = function attrJoin(name, value) {
    var idx = this.attrIndex(name);

    if (idx < 0) {
      this.attrPush([ name, value ]);
    } else {
      this.attrs[idx][1] = this.attrs[idx][1] + ' ' + value;
    }
  };


  var token$1 = Token;

  function StateCore(src, md, env) {
    this.src = src;
    this.env = env;
    this.tokens = [];
    this.inlineMode = false;
    this.md = md; // link to parser instance
  }

  // re-export Token class to use in core rules
  StateCore.prototype.Token = token$1;


  var state_core = StateCore;

  var _rules = [
    [ 'normalize',      normalize      ],
    [ 'block',          block$1          ],
    [ 'inline',         inline         ],
    [ 'linkify',        linkify        ],
    [ 'replacements',   replacements   ],
    [ 'smartquotes',    smartquotes    ]
  ];


  /**
   * new Core()
   **/
  function Core() {
    /**
     * Core#ruler -> Ruler
     *
     * [[Ruler]] instance. Keep configuration of core rules.
     **/
    this.ruler = new ruler();

    for (var i = 0; i < _rules.length; i++) {
      this.ruler.push(_rules[i][0], _rules[i][1]);
    }
  }


  /**
   * Core.process(state)
   *
   * Executes core chain rules.
   **/
  Core.prototype.process = function (state) {
    var i, l, rules;

    rules = this.ruler.getRules('');

    for (i = 0, l = rules.length; i < l; i++) {
      rules[i](state);
    }
  };

  Core.prototype.State = state_core;


  var parser_core = Core;

  var isSpace$1 = utils$1.isSpace;


  function getLine(state, line) {
    var pos = state.bMarks[line] + state.blkIndent,
        max = state.eMarks[line];

    return state.src.substr(pos, max - pos);
  }

  function escapedSplit(str) {
    var result = [],
        pos = 0,
        max = str.length,
        ch,
        escapes = 0,
        lastPos = 0,
        backTicked = false,
        lastBackTick = 0;

    ch  = str.charCodeAt(pos);

    while (pos < max) {
      if (ch === 0x60/* ` */) {
        if (backTicked) {
          // make \` close code sequence, but not open it;
          // the reason is: `\` is correct code block
          backTicked = false;
          lastBackTick = pos;
        } else if (escapes % 2 === 0) {
          backTicked = true;
          lastBackTick = pos;
        }
      } else if (ch === 0x7c/* | */ && (escapes % 2 === 0) && !backTicked) {
        result.push(str.substring(lastPos, pos));
        lastPos = pos + 1;
      }

      if (ch === 0x5c/* \ */) {
        escapes++;
      } else {
        escapes = 0;
      }

      pos++;

      // If there was an un-closed backtick, go back to just after
      // the last backtick, but as if it was a normal character
      if (pos === max && backTicked) {
        backTicked = false;
        pos = lastBackTick + 1;
      }

      ch = str.charCodeAt(pos);
    }

    result.push(str.substring(lastPos));

    return result;
  }


  var table = function table(state, startLine, endLine, silent) {
    var ch, lineText, pos, i, nextLine, columns, columnCount, token,
        aligns, t, tableLines, tbodyLines;

    // should have at least two lines
    if (startLine + 2 > endLine) { return false; }

    nextLine = startLine + 1;

    if (state.sCount[nextLine] < state.blkIndent) { return false; }

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[nextLine] - state.blkIndent >= 4) { return false; }

    // first character of the second line should be '|', '-', ':',
    // and no other characters are allowed but spaces;
    // basically, this is the equivalent of /^[-:|][-:|\s]*$/ regexp

    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    if (pos >= state.eMarks[nextLine]) { return false; }

    ch = state.src.charCodeAt(pos++);
    if (ch !== 0x7C/* | */ && ch !== 0x2D/* - */ && ch !== 0x3A/* : */) { return false; }

    while (pos < state.eMarks[nextLine]) {
      ch = state.src.charCodeAt(pos);

      if (ch !== 0x7C/* | */ && ch !== 0x2D/* - */ && ch !== 0x3A/* : */ && !isSpace$1(ch)) { return false; }

      pos++;
    }

    lineText = getLine(state, startLine + 1);

    columns = lineText.split('|');
    aligns = [];
    for (i = 0; i < columns.length; i++) {
      t = columns[i].trim();
      if (!t) {
        // allow empty columns before and after table, but not in between columns;
        // e.g. allow ` |---| `, disallow ` ---||--- `
        if (i === 0 || i === columns.length - 1) {
          continue;
        } else {
          return false;
        }
      }

      if (!/^:?-+:?$/.test(t)) { return false; }
      if (t.charCodeAt(t.length - 1) === 0x3A/* : */) {
        aligns.push(t.charCodeAt(0) === 0x3A/* : */ ? 'center' : 'right');
      } else if (t.charCodeAt(0) === 0x3A/* : */) {
        aligns.push('left');
      } else {
        aligns.push('');
      }
    }

    lineText = getLine(state, startLine).trim();
    if (lineText.indexOf('|') === -1) { return false; }
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }
    columns = escapedSplit(lineText.replace(/^\||\|$/g, ''));

    // header row will define an amount of columns in the entire table,
    // and align row shouldn't be smaller than that (the rest of the rows can)
    columnCount = columns.length;
    if (columnCount > aligns.length) { return false; }

    if (silent) { return true; }

    token     = state.push('table_open', 'table', 1);
    token.map = tableLines = [ startLine, 0 ];

    token     = state.push('thead_open', 'thead', 1);
    token.map = [ startLine, startLine + 1 ];

    token     = state.push('tr_open', 'tr', 1);
    token.map = [ startLine, startLine + 1 ];

    for (i = 0; i < columns.length; i++) {
      token          = state.push('th_open', 'th', 1);
      token.map      = [ startLine, startLine + 1 ];
      if (aligns[i]) {
        token.attrs  = [ [ 'style', 'text-align:' + aligns[i] ] ];
      }

      token          = state.push('inline', '', 0);
      token.content  = columns[i].trim();
      token.map      = [ startLine, startLine + 1 ];
      token.children = [];

      token          = state.push('th_close', 'th', -1);
    }

    token     = state.push('tr_close', 'tr', -1);
    token     = state.push('thead_close', 'thead', -1);

    token     = state.push('tbody_open', 'tbody', 1);
    token.map = tbodyLines = [ startLine + 2, 0 ];

    for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) { break; }

      lineText = getLine(state, nextLine).trim();
      if (lineText.indexOf('|') === -1) { break; }
      if (state.sCount[nextLine] - state.blkIndent >= 4) { break; }
      columns = escapedSplit(lineText.replace(/^\||\|$/g, ''));

      token = state.push('tr_open', 'tr', 1);
      for (i = 0; i < columnCount; i++) {
        token          = state.push('td_open', 'td', 1);
        if (aligns[i]) {
          token.attrs  = [ [ 'style', 'text-align:' + aligns[i] ] ];
        }

        token          = state.push('inline', '', 0);
        token.content  = columns[i] ? columns[i].trim() : '';
        token.children = [];

        token          = state.push('td_close', 'td', -1);
      }
      token = state.push('tr_close', 'tr', -1);
    }
    token = state.push('tbody_close', 'tbody', -1);
    token = state.push('table_close', 'table', -1);

    tableLines[1] = tbodyLines[1] = nextLine;
    state.line = nextLine;
    return true;
  };

  // Code block (4 spaces padded)


  var code = function code(state, startLine, endLine/*, silent*/) {
    var nextLine, last, token;

    if (state.sCount[startLine] - state.blkIndent < 4) { return false; }

    last = nextLine = startLine + 1;

    while (nextLine < endLine) {
      if (state.isEmpty(nextLine)) {
        nextLine++;
        continue;
      }

      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        nextLine++;
        last = nextLine;
        continue;
      }
      break;
    }

    state.line = last;

    token         = state.push('code_block', 'code', 0);
    token.content = state.getLines(startLine, last, 4 + state.blkIndent, true);
    token.map     = [ startLine, state.line ];

    return true;
  };

  // fences (``` lang, ~~~ lang)


  var fence = function fence(state, startLine, endLine, silent) {
    var marker, len, params, nextLine, mem, token, markup,
        haveEndMarker = false,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

    if (pos + 3 > max) { return false; }

    marker = state.src.charCodeAt(pos);

    if (marker !== 0x7E/* ~ */ && marker !== 0x60 /* ` */) {
      return false;
    }

    // scan marker length
    mem = pos;
    pos = state.skipChars(pos, marker);

    len = pos - mem;

    if (len < 3) { return false; }

    markup = state.src.slice(mem, pos);
    params = state.src.slice(pos, max);

    if (params.indexOf(String.fromCharCode(marker)) >= 0) { return false; }

    // Since start is found, we can report success here in validation mode
    if (silent) { return true; }

    // search end of block
    nextLine = startLine;

    for (;;) {
      nextLine++;
      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break;
      }

      pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (pos < max && state.sCount[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        // - ```
        //  test
        break;
      }

      if (state.src.charCodeAt(pos) !== marker) { continue; }

      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        // closing fence should be indented less than 4 spaces
        continue;
      }

      pos = state.skipChars(pos, marker);

      // closing code fence must be at least as long as the opening one
      if (pos - mem < len) { continue; }

      // make sure tail has spaces only
      pos = state.skipSpaces(pos);

      if (pos < max) { continue; }

      haveEndMarker = true;
      // found!
      break;
    }

    // If a fence has heading spaces, they should be removed from its inner block
    len = state.sCount[startLine];

    state.line = nextLine + (haveEndMarker ? 1 : 0);

    token         = state.push('fence', 'code', 0);
    token.info    = params;
    token.content = state.getLines(startLine + 1, nextLine, len, true);
    token.markup  = markup;
    token.map     = [ startLine, state.line ];

    return true;
  };

  var isSpace$2 = utils$1.isSpace;


  var blockquote = function blockquote(state, startLine, endLine, silent) {
    var adjustTab,
        ch,
        i,
        initial,
        l,
        lastLineEmpty,
        lines,
        nextLine,
        offset,
        oldBMarks,
        oldBSCount,
        oldIndent,
        oldParentType,
        oldSCount,
        oldTShift,
        spaceAfterMarker,
        terminate,
        terminatorRules,
        token,
        wasOutdented,
        oldLineMax = state.lineMax,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

    // check the block quote marker
    if (state.src.charCodeAt(pos++) !== 0x3E/* > */) { return false; }

    // we know that it's going to be a valid blockquote,
    // so no point trying to find the end of it in silent mode
    if (silent) { return true; }

    // skip spaces after ">" and re-calculate offset
    initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);

    // skip one optional space after '>'
    if (state.src.charCodeAt(pos) === 0x20 /* space */) {
      // ' >   test '
      //     ^ -- position start of line here:
      pos++;
      initial++;
      offset++;
      adjustTab = false;
      spaceAfterMarker = true;
    } else if (state.src.charCodeAt(pos) === 0x09 /* tab */) {
      spaceAfterMarker = true;

      if ((state.bsCount[startLine] + offset) % 4 === 3) {
        // '  >\t  test '
        //       ^ -- position start of line here (tab has width===1)
        pos++;
        initial++;
        offset++;
        adjustTab = false;
      } else {
        // ' >\t  test '
        //    ^ -- position start of line here + shift bsCount slightly
        //         to make extra space appear
        adjustTab = true;
      }
    } else {
      spaceAfterMarker = false;
    }

    oldBMarks = [ state.bMarks[startLine] ];
    state.bMarks[startLine] = pos;

    while (pos < max) {
      ch = state.src.charCodeAt(pos);

      if (isSpace$2(ch)) {
        if (ch === 0x09) {
          offset += 4 - (offset + state.bsCount[startLine] + (adjustTab ? 1 : 0)) % 4;
        } else {
          offset++;
        }
      } else {
        break;
      }

      pos++;
    }

    oldBSCount = [ state.bsCount[startLine] ];
    state.bsCount[startLine] = state.sCount[startLine] + 1 + (spaceAfterMarker ? 1 : 0);

    lastLineEmpty = pos >= max;

    oldSCount = [ state.sCount[startLine] ];
    state.sCount[startLine] = offset - initial;

    oldTShift = [ state.tShift[startLine] ];
    state.tShift[startLine] = pos - state.bMarks[startLine];

    terminatorRules = state.md.block.ruler.getRules('blockquote');

    oldParentType = state.parentType;
    state.parentType = 'blockquote';
    wasOutdented = false;

    // Search the end of the block
    //
    // Block ends with either:
    //  1. an empty line outside:
    //     ```
    //     > test
    //
    //     ```
    //  2. an empty line inside:
    //     ```
    //     >
    //     test
    //     ```
    //  3. another tag:
    //     ```
    //     > test
    //      - - -
    //     ```
    for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
      // check if it's outdented, i.e. it's inside list item and indented
      // less than said list item:
      //
      // ```
      // 1. anything
      //    > current blockquote
      // 2. checking this line
      // ```
      if (state.sCount[nextLine] < state.blkIndent) wasOutdented = true;

      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (pos >= max) {
        // Case 1: line is not inside the blockquote, and this line is empty.
        break;
      }

      if (state.src.charCodeAt(pos++) === 0x3E/* > */ && !wasOutdented) {
        // This line is inside the blockquote.

        // skip spaces after ">" and re-calculate offset
        initial = offset = state.sCount[nextLine] + pos - (state.bMarks[nextLine] + state.tShift[nextLine]);

        // skip one optional space after '>'
        if (state.src.charCodeAt(pos) === 0x20 /* space */) {
          // ' >   test '
          //     ^ -- position start of line here:
          pos++;
          initial++;
          offset++;
          adjustTab = false;
          spaceAfterMarker = true;
        } else if (state.src.charCodeAt(pos) === 0x09 /* tab */) {
          spaceAfterMarker = true;

          if ((state.bsCount[nextLine] + offset) % 4 === 3) {
            // '  >\t  test '
            //       ^ -- position start of line here (tab has width===1)
            pos++;
            initial++;
            offset++;
            adjustTab = false;
          } else {
            // ' >\t  test '
            //    ^ -- position start of line here + shift bsCount slightly
            //         to make extra space appear
            adjustTab = true;
          }
        } else {
          spaceAfterMarker = false;
        }

        oldBMarks.push(state.bMarks[nextLine]);
        state.bMarks[nextLine] = pos;

        while (pos < max) {
          ch = state.src.charCodeAt(pos);

          if (isSpace$2(ch)) {
            if (ch === 0x09) {
              offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4;
            } else {
              offset++;
            }
          } else {
            break;
          }

          pos++;
        }

        lastLineEmpty = pos >= max;

        oldBSCount.push(state.bsCount[nextLine]);
        state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);

        oldSCount.push(state.sCount[nextLine]);
        state.sCount[nextLine] = offset - initial;

        oldTShift.push(state.tShift[nextLine]);
        state.tShift[nextLine] = pos - state.bMarks[nextLine];
        continue;
      }

      // Case 2: line is not inside the blockquote, and the last line was empty.
      if (lastLineEmpty) { break; }

      // Case 3: another tag found.
      terminate = false;
      for (i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }

      if (terminate) {
        // Quirk to enforce "hard termination mode" for paragraphs;
        // normally if you call `tokenize(state, startLine, nextLine)`,
        // paragraphs will look below nextLine for paragraph continuation,
        // but if blockquote is terminated by another tag, they shouldn't
        state.lineMax = nextLine;

        if (state.blkIndent !== 0) {
          // state.blkIndent was non-zero, we now set it to zero,
          // so we need to re-calculate all offsets to appear as
          // if indent wasn't changed
          oldBMarks.push(state.bMarks[nextLine]);
          oldBSCount.push(state.bsCount[nextLine]);
          oldTShift.push(state.tShift[nextLine]);
          oldSCount.push(state.sCount[nextLine]);
          state.sCount[nextLine] -= state.blkIndent;
        }

        break;
      }

      oldBMarks.push(state.bMarks[nextLine]);
      oldBSCount.push(state.bsCount[nextLine]);
      oldTShift.push(state.tShift[nextLine]);
      oldSCount.push(state.sCount[nextLine]);

      // A negative indentation means that this is a paragraph continuation
      //
      state.sCount[nextLine] = -1;
    }

    oldIndent = state.blkIndent;
    state.blkIndent = 0;

    token        = state.push('blockquote_open', 'blockquote', 1);
    token.markup = '>';
    token.map    = lines = [ startLine, 0 ];

    state.md.block.tokenize(state, startLine, nextLine);

    token        = state.push('blockquote_close', 'blockquote', -1);
    token.markup = '>';

    state.lineMax = oldLineMax;
    state.parentType = oldParentType;
    lines[1] = state.line;

    // Restore original tShift; this might not be necessary since the parser
    // has already been here, but just to make sure we can do that.
    for (i = 0; i < oldTShift.length; i++) {
      state.bMarks[i + startLine] = oldBMarks[i];
      state.tShift[i + startLine] = oldTShift[i];
      state.sCount[i + startLine] = oldSCount[i];
      state.bsCount[i + startLine] = oldBSCount[i];
    }
    state.blkIndent = oldIndent;

    return true;
  };

  var isSpace$3 = utils$1.isSpace;


  var hr = function hr(state, startLine, endLine, silent) {
    var marker, cnt, ch, token,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

    marker = state.src.charCodeAt(pos++);

    // Check hr marker
    if (marker !== 0x2A/* * */ &&
        marker !== 0x2D/* - */ &&
        marker !== 0x5F/* _ */) {
      return false;
    }

    // markers can be mixed with spaces, but there should be at least 3 of them

    cnt = 1;
    while (pos < max) {
      ch = state.src.charCodeAt(pos++);
      if (ch !== marker && !isSpace$3(ch)) { return false; }
      if (ch === marker) { cnt++; }
    }

    if (cnt < 3) { return false; }

    if (silent) { return true; }

    state.line = startLine + 1;

    token        = state.push('hr', 'hr', 0);
    token.map    = [ startLine, state.line ];
    token.markup = Array(cnt + 1).join(String.fromCharCode(marker));

    return true;
  };

  var isSpace$4 = utils$1.isSpace;


  // Search `[-+*][\n ]`, returns next pos after marker on success
  // or -1 on fail.
  function skipBulletListMarker(state, startLine) {
    var marker, pos, max, ch;

    pos = state.bMarks[startLine] + state.tShift[startLine];
    max = state.eMarks[startLine];

    marker = state.src.charCodeAt(pos++);
    // Check bullet
    if (marker !== 0x2A/* * */ &&
        marker !== 0x2D/* - */ &&
        marker !== 0x2B/* + */) {
      return -1;
    }

    if (pos < max) {
      ch = state.src.charCodeAt(pos);

      if (!isSpace$4(ch)) {
        // " -test " - is not a list item
        return -1;
      }
    }

    return pos;
  }

  // Search `\d+[.)][\n ]`, returns next pos after marker on success
  // or -1 on fail.
  function skipOrderedListMarker(state, startLine) {
    var ch,
        start = state.bMarks[startLine] + state.tShift[startLine],
        pos = start,
        max = state.eMarks[startLine];

    // List marker should have at least 2 chars (digit + dot)
    if (pos + 1 >= max) { return -1; }

    ch = state.src.charCodeAt(pos++);

    if (ch < 0x30/* 0 */ || ch > 0x39/* 9 */) { return -1; }

    for (;;) {
      // EOL -> fail
      if (pos >= max) { return -1; }

      ch = state.src.charCodeAt(pos++);

      if (ch >= 0x30/* 0 */ && ch <= 0x39/* 9 */) {

        // List marker should have no more than 9 digits
        // (prevents integer overflow in browsers)
        if (pos - start >= 10) { return -1; }

        continue;
      }

      // found valid marker
      if (ch === 0x29/* ) */ || ch === 0x2e/* . */) {
        break;
      }

      return -1;
    }


    if (pos < max) {
      ch = state.src.charCodeAt(pos);

      if (!isSpace$4(ch)) {
        // " 1.test " - is not a list item
        return -1;
      }
    }
    return pos;
  }

  function markTightParagraphs(state, idx) {
    var i, l,
        level = state.level + 2;

    for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
      if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
        state.tokens[i + 2].hidden = true;
        state.tokens[i].hidden = true;
        i += 2;
      }
    }
  }


  var list = function list(state, startLine, endLine, silent) {
    var ch,
        contentStart,
        i,
        indent,
        indentAfterMarker,
        initial,
        isOrdered,
        itemLines,
        l,
        listLines,
        listTokIdx,
        markerCharCode,
        markerValue,
        max,
        nextLine,
        offset,
        oldIndent,
        oldLIndent,
        oldParentType,
        oldTShift,
        oldTight,
        pos,
        posAfterMarker,
        prevEmptyEnd,
        start,
        terminate,
        terminatorRules,
        token,
        isTerminatingParagraph = false,
        tight = true;

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

    // limit conditions when list can interrupt
    // a paragraph (validation mode only)
    if (silent && state.parentType === 'paragraph') {
      // Next list item should still terminate previous list item;
      //
      // This code can fail if plugins use blkIndent as well as lists,
      // but I hope the spec gets fixed long before that happens.
      //
      if (state.tShift[startLine] >= state.blkIndent) {
        isTerminatingParagraph = true;
      }
    }

    // Detect list type and position after marker
    if ((posAfterMarker = skipOrderedListMarker(state, startLine)) >= 0) {
      isOrdered = true;
      start = state.bMarks[startLine] + state.tShift[startLine];
      markerValue = Number(state.src.substr(start, posAfterMarker - start - 1));

      // If we're starting a new ordered list right after
      // a paragraph, it should start with 1.
      if (isTerminatingParagraph && markerValue !== 1) return false;

    } else if ((posAfterMarker = skipBulletListMarker(state, startLine)) >= 0) {
      isOrdered = false;

    } else {
      return false;
    }

    // If we're starting a new unordered list right after
    // a paragraph, first line should not be empty.
    if (isTerminatingParagraph) {
      if (state.skipSpaces(posAfterMarker) >= state.eMarks[startLine]) return false;
    }

    // We should terminate list on style change. Remember first one to compare.
    markerCharCode = state.src.charCodeAt(posAfterMarker - 1);

    // For validation mode we can terminate immediately
    if (silent) { return true; }

    // Start list
    listTokIdx = state.tokens.length;

    if (isOrdered) {
      token       = state.push('ordered_list_open', 'ol', 1);
      if (markerValue !== 1) {
        token.attrs = [ [ 'start', markerValue ] ];
      }

    } else {
      token       = state.push('bullet_list_open', 'ul', 1);
    }

    token.map    = listLines = [ startLine, 0 ];
    token.markup = String.fromCharCode(markerCharCode);

    //
    // Iterate list items
    //

    nextLine = startLine;
    prevEmptyEnd = false;
    terminatorRules = state.md.block.ruler.getRules('list');

    oldParentType = state.parentType;
    state.parentType = 'list';

    while (nextLine < endLine) {
      pos = posAfterMarker;
      max = state.eMarks[nextLine];

      initial = offset = state.sCount[nextLine] + posAfterMarker - (state.bMarks[startLine] + state.tShift[startLine]);

      while (pos < max) {
        ch = state.src.charCodeAt(pos);

        if (ch === 0x09) {
          offset += 4 - (offset + state.bsCount[nextLine]) % 4;
        } else if (ch === 0x20) {
          offset++;
        } else {
          break;
        }

        pos++;
      }

      contentStart = pos;

      if (contentStart >= max) {
        // trimming space in "-    \n  3" case, indent is 1 here
        indentAfterMarker = 1;
      } else {
        indentAfterMarker = offset - initial;
      }

      // If we have more than 4 spaces, the indent is 1
      // (the rest is just indented code block)
      if (indentAfterMarker > 4) { indentAfterMarker = 1; }

      // "  -  test"
      //  ^^^^^ - calculating total length of this thing
      indent = initial + indentAfterMarker;

      // Run subparser & write tokens
      token        = state.push('list_item_open', 'li', 1);
      token.markup = String.fromCharCode(markerCharCode);
      token.map    = itemLines = [ startLine, 0 ];

      oldIndent = state.blkIndent;
      oldTight = state.tight;
      oldTShift = state.tShift[startLine];
      oldLIndent = state.sCount[startLine];
      state.blkIndent = indent;
      state.tight = true;
      state.tShift[startLine] = contentStart - state.bMarks[startLine];
      state.sCount[startLine] = offset;

      if (contentStart >= max && state.isEmpty(startLine + 1)) {
        // workaround for this case
        // (list item is empty, list terminates before "foo"):
        // ~~~~~~~~
        //   -
        //
        //     foo
        // ~~~~~~~~
        state.line = Math.min(state.line + 2, endLine);
      } else {
        state.md.block.tokenize(state, startLine, endLine, true);
      }

      // If any of list item is tight, mark list as tight
      if (!state.tight || prevEmptyEnd) {
        tight = false;
      }
      // Item become loose if finish with empty line,
      // but we should filter last element, because it means list finish
      prevEmptyEnd = (state.line - startLine) > 1 && state.isEmpty(state.line - 1);

      state.blkIndent = oldIndent;
      state.tShift[startLine] = oldTShift;
      state.sCount[startLine] = oldLIndent;
      state.tight = oldTight;

      token        = state.push('list_item_close', 'li', -1);
      token.markup = String.fromCharCode(markerCharCode);

      nextLine = startLine = state.line;
      itemLines[1] = nextLine;
      contentStart = state.bMarks[startLine];

      if (nextLine >= endLine) { break; }

      //
      // Try to check if list is terminated or continued.
      //
      if (state.sCount[nextLine] < state.blkIndent) { break; }

      // fail if terminating block found
      terminate = false;
      for (i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }
      if (terminate) { break; }

      // fail if list has another type
      if (isOrdered) {
        posAfterMarker = skipOrderedListMarker(state, nextLine);
        if (posAfterMarker < 0) { break; }
      } else {
        posAfterMarker = skipBulletListMarker(state, nextLine);
        if (posAfterMarker < 0) { break; }
      }

      if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) { break; }
    }

    // Finalize list
    if (isOrdered) {
      token = state.push('ordered_list_close', 'ol', -1);
    } else {
      token = state.push('bullet_list_close', 'ul', -1);
    }
    token.markup = String.fromCharCode(markerCharCode);

    listLines[1] = nextLine;
    state.line = nextLine;

    state.parentType = oldParentType;

    // mark paragraphs tight if needed
    if (tight) {
      markTightParagraphs(state, listTokIdx);
    }

    return true;
  };

  var normalizeReference   = utils$1.normalizeReference;
  var isSpace$5              = utils$1.isSpace;


  var reference = function reference(state, startLine, _endLine, silent) {
    var ch,
        destEndPos,
        destEndLineNo,
        endLine,
        href,
        i,
        l,
        label,
        labelEnd,
        oldParentType,
        res,
        start,
        str,
        terminate,
        terminatorRules,
        title,
        lines = 0,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine],
        nextLine = startLine + 1;

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

    if (state.src.charCodeAt(pos) !== 0x5B/* [ */) { return false; }

    // Simple check to quickly interrupt scan on [link](url) at the start of line.
    // Can be useful on practice: https://github.com/markdown-it/markdown-it/issues/54
    while (++pos < max) {
      if (state.src.charCodeAt(pos) === 0x5D /* ] */ &&
          state.src.charCodeAt(pos - 1) !== 0x5C/* \ */) {
        if (pos + 1 === max) { return false; }
        if (state.src.charCodeAt(pos + 1) !== 0x3A/* : */) { return false; }
        break;
      }
    }

    endLine = state.lineMax;

    // jump line-by-line until empty one or EOF
    terminatorRules = state.md.block.ruler.getRules('reference');

    oldParentType = state.parentType;
    state.parentType = 'reference';

    for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      // this would be a code block normally, but after paragraph
      // it's considered a lazy continuation regardless of what's there
      if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

      // quirk for blockquotes, this line should already be checked by that rule
      if (state.sCount[nextLine] < 0) { continue; }

      // Some tags can terminate paragraph without empty line.
      terminate = false;
      for (i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }
      if (terminate) { break; }
    }

    str = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
    max = str.length;

    for (pos = 1; pos < max; pos++) {
      ch = str.charCodeAt(pos);
      if (ch === 0x5B /* [ */) {
        return false;
      } else if (ch === 0x5D /* ] */) {
        labelEnd = pos;
        break;
      } else if (ch === 0x0A /* \n */) {
        lines++;
      } else if (ch === 0x5C /* \ */) {
        pos++;
        if (pos < max && str.charCodeAt(pos) === 0x0A) {
          lines++;
        }
      }
    }

    if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A/* : */) { return false; }

    // [label]:   destination   'title'
    //         ^^^ skip optional whitespace here
    for (pos = labelEnd + 2; pos < max; pos++) {
      ch = str.charCodeAt(pos);
      if (ch === 0x0A) {
        lines++;
      } else if (isSpace$5(ch)) ; else {
        break;
      }
    }

    // [label]:   destination   'title'
    //            ^^^^^^^^^^^ parse this
    res = state.md.helpers.parseLinkDestination(str, pos, max);
    if (!res.ok) { return false; }

    href = state.md.normalizeLink(res.str);
    if (!state.md.validateLink(href)) { return false; }

    pos = res.pos;
    lines += res.lines;

    // save cursor state, we could require to rollback later
    destEndPos = pos;
    destEndLineNo = lines;

    // [label]:   destination   'title'
    //                       ^^^ skipping those spaces
    start = pos;
    for (; pos < max; pos++) {
      ch = str.charCodeAt(pos);
      if (ch === 0x0A) {
        lines++;
      } else if (isSpace$5(ch)) ; else {
        break;
      }
    }

    // [label]:   destination   'title'
    //                          ^^^^^^^ parse this
    res = state.md.helpers.parseLinkTitle(str, pos, max);
    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;
      lines += res.lines;
    } else {
      title = '';
      pos = destEndPos;
      lines = destEndLineNo;
    }

    // skip trailing spaces until the rest of the line
    while (pos < max) {
      ch = str.charCodeAt(pos);
      if (!isSpace$5(ch)) { break; }
      pos++;
    }

    if (pos < max && str.charCodeAt(pos) !== 0x0A) {
      if (title) {
        // garbage at the end of the line after title,
        // but it could still be a valid reference if we roll back
        title = '';
        pos = destEndPos;
        lines = destEndLineNo;
        while (pos < max) {
          ch = str.charCodeAt(pos);
          if (!isSpace$5(ch)) { break; }
          pos++;
        }
      }
    }

    if (pos < max && str.charCodeAt(pos) !== 0x0A) {
      // garbage at the end of the line
      return false;
    }

    label = normalizeReference(str.slice(1, labelEnd));
    if (!label) {
      // CommonMark 0.20 disallows empty labels
      return false;
    }

    // Reference can not terminate anything. This check is for safety only.
    /*istanbul ignore if*/
    if (silent) { return true; }

    if (typeof state.env.references === 'undefined') {
      state.env.references = {};
    }
    if (typeof state.env.references[label] === 'undefined') {
      state.env.references[label] = { title: title, href: href };
    }

    state.parentType = oldParentType;

    state.line = startLine + lines + 1;
    return true;
  };

  var isSpace$6 = utils$1.isSpace;


  var heading = function heading(state, startLine, endLine, silent) {
    var ch, level, tmp, token,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

    ch  = state.src.charCodeAt(pos);

    if (ch !== 0x23/* # */ || pos >= max) { return false; }

    // count heading level
    level = 1;
    ch = state.src.charCodeAt(++pos);
    while (ch === 0x23/* # */ && pos < max && level <= 6) {
      level++;
      ch = state.src.charCodeAt(++pos);
    }

    if (level > 6 || (pos < max && !isSpace$6(ch))) { return false; }

    if (silent) { return true; }

    // Let's cut tails like '    ###  ' from the end of string

    max = state.skipSpacesBack(max, pos);
    tmp = state.skipCharsBack(max, 0x23, pos); // #
    if (tmp > pos && isSpace$6(state.src.charCodeAt(tmp - 1))) {
      max = tmp;
    }

    state.line = startLine + 1;

    token        = state.push('heading_open', 'h' + String(level), 1);
    token.markup = '########'.slice(0, level);
    token.map    = [ startLine, state.line ];

    token          = state.push('inline', '', 0);
    token.content  = state.src.slice(pos, max).trim();
    token.map      = [ startLine, state.line ];
    token.children = [];

    token        = state.push('heading_close', 'h' + String(level), -1);
    token.markup = '########'.slice(0, level);

    return true;
  };

  // lheading (---, ===)


  var lheading = function lheading(state, startLine, endLine/*, silent*/) {
    var content, terminate, i, l, token, pos, max, level, marker,
        nextLine = startLine + 1, oldParentType,
        terminatorRules = state.md.block.ruler.getRules('paragraph');

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

    oldParentType = state.parentType;
    state.parentType = 'paragraph'; // use paragraph to match terminatorRules

    // jump line-by-line until empty one or EOF
    for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      // this would be a code block normally, but after paragraph
      // it's considered a lazy continuation regardless of what's there
      if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

      //
      // Check for underline in setext header
      //
      if (state.sCount[nextLine] >= state.blkIndent) {
        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];

        if (pos < max) {
          marker = state.src.charCodeAt(pos);

          if (marker === 0x2D/* - */ || marker === 0x3D/* = */) {
            pos = state.skipChars(pos, marker);
            pos = state.skipSpaces(pos);

            if (pos >= max) {
              level = (marker === 0x3D/* = */ ? 1 : 2);
              break;
            }
          }
        }
      }

      // quirk for blockquotes, this line should already be checked by that rule
      if (state.sCount[nextLine] < 0) { continue; }

      // Some tags can terminate paragraph without empty line.
      terminate = false;
      for (i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }
      if (terminate) { break; }
    }

    if (!level) {
      // Didn't find valid underline
      return false;
    }

    content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

    state.line = nextLine + 1;

    token          = state.push('heading_open', 'h' + String(level), 1);
    token.markup   = String.fromCharCode(marker);
    token.map      = [ startLine, state.line ];

    token          = state.push('inline', '', 0);
    token.content  = content;
    token.map      = [ startLine, state.line - 1 ];
    token.children = [];

    token          = state.push('heading_close', 'h' + String(level), -1);
    token.markup   = String.fromCharCode(marker);

    state.parentType = oldParentType;

    return true;
  };

  // List of valid html blocks names, accorting to commonmark spec


  var html_blocks = [
    'address',
    'article',
    'aside',
    'base',
    'basefont',
    'blockquote',
    'body',
    'caption',
    'center',
    'col',
    'colgroup',
    'dd',
    'details',
    'dialog',
    'dir',
    'div',
    'dl',
    'dt',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'frame',
    'frameset',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hr',
    'html',
    'iframe',
    'legend',
    'li',
    'link',
    'main',
    'menu',
    'menuitem',
    'meta',
    'nav',
    'noframes',
    'ol',
    'optgroup',
    'option',
    'p',
    'param',
    'section',
    'source',
    'summary',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'title',
    'tr',
    'track',
    'ul'
  ];

  // Regexps to match html elements

  var attr_name     = '[a-zA-Z_:][a-zA-Z0-9:._-]*';

  var unquoted      = '[^"\'=<>`\\x00-\\x20]+';
  var single_quoted = "'[^']*'";
  var double_quoted = '"[^"]*"';

  var attr_value  = '(?:' + unquoted + '|' + single_quoted + '|' + double_quoted + ')';

  var attribute   = '(?:\\s+' + attr_name + '(?:\\s*=\\s*' + attr_value + ')?)';

  var open_tag    = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>';

  var close_tag   = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
  var comment     = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->';
  var processing  = '<[?].*?[?]>';
  var declaration = '<![A-Z]+\\s+[^>]*>';
  var cdata       = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';

  var HTML_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + '|' + comment +
                          '|' + processing + '|' + declaration + '|' + cdata + ')');
  var HTML_OPEN_CLOSE_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + ')');

  var HTML_TAG_RE_1 = HTML_TAG_RE;
  var HTML_OPEN_CLOSE_TAG_RE_1 = HTML_OPEN_CLOSE_TAG_RE;

  var html_re = {
  	HTML_TAG_RE: HTML_TAG_RE_1,
  	HTML_OPEN_CLOSE_TAG_RE: HTML_OPEN_CLOSE_TAG_RE_1
  };

  var HTML_OPEN_CLOSE_TAG_RE$1 = html_re.HTML_OPEN_CLOSE_TAG_RE;

  // An array of opening and corresponding closing sequences for html tags,
  // last argument defines whether it can terminate a paragraph or not
  //
  var HTML_SEQUENCES = [
    [ /^<(script|pre|style)(?=(\s|>|$))/i, /<\/(script|pre|style)>/i, true ],
    [ /^<!--/,        /-->/,   true ],
    [ /^<\?/,         /\?>/,   true ],
    [ /^<![A-Z]/,     />/,     true ],
    [ /^<!\[CDATA\[/, /\]\]>/, true ],
    [ new RegExp('^</?(' + html_blocks.join('|') + ')(?=(\\s|/?>|$))', 'i'), /^$/, true ],
    [ new RegExp(HTML_OPEN_CLOSE_TAG_RE$1.source + '\\s*$'),  /^$/, false ]
  ];


  var html_block = function html_block(state, startLine, endLine, silent) {
    var i, nextLine, token, lineText,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

    if (!state.md.options.html) { return false; }

    if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

    lineText = state.src.slice(pos, max);

    for (i = 0; i < HTML_SEQUENCES.length; i++) {
      if (HTML_SEQUENCES[i][0].test(lineText)) { break; }
    }

    if (i === HTML_SEQUENCES.length) { return false; }

    if (silent) {
      // true if this sequence can be a terminator, false otherwise
      return HTML_SEQUENCES[i][2];
    }

    nextLine = startLine + 1;

    // If we are here - we detected HTML block.
    // Let's roll down till block end.
    if (!HTML_SEQUENCES[i][1].test(lineText)) {
      for (; nextLine < endLine; nextLine++) {
        if (state.sCount[nextLine] < state.blkIndent) { break; }

        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];
        lineText = state.src.slice(pos, max);

        if (HTML_SEQUENCES[i][1].test(lineText)) {
          if (lineText.length !== 0) { nextLine++; }
          break;
        }
      }
    }

    state.line = nextLine;

    token         = state.push('html_block', '', 0);
    token.map     = [ startLine, nextLine ];
    token.content = state.getLines(startLine, nextLine, state.blkIndent, true);

    return true;
  };

  // Paragraph


  var paragraph = function paragraph(state, startLine/*, endLine*/) {
    var content, terminate, i, l, token, oldParentType,
        nextLine = startLine + 1,
        terminatorRules = state.md.block.ruler.getRules('paragraph'),
        endLine = state.lineMax;

    oldParentType = state.parentType;
    state.parentType = 'paragraph';

    // jump line-by-line until empty one or EOF
    for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      // this would be a code block normally, but after paragraph
      // it's considered a lazy continuation regardless of what's there
      if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

      // quirk for blockquotes, this line should already be checked by that rule
      if (state.sCount[nextLine] < 0) { continue; }

      // Some tags can terminate paragraph without empty line.
      terminate = false;
      for (i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }
      if (terminate) { break; }
    }

    content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

    state.line = nextLine;

    token          = state.push('paragraph_open', 'p', 1);
    token.map      = [ startLine, state.line ];

    token          = state.push('inline', '', 0);
    token.content  = content;
    token.map      = [ startLine, state.line ];
    token.children = [];

    token          = state.push('paragraph_close', 'p', -1);

    state.parentType = oldParentType;

    return true;
  };

  var isSpace$7 = utils$1.isSpace;


  function StateBlock(src, md, env, tokens) {
    var ch, s, start, pos, len, indent, offset, indent_found;

    this.src = src;

    // link to parser instance
    this.md     = md;

    this.env = env;

    //
    // Internal state vartiables
    //

    this.tokens = tokens;

    this.bMarks = [];  // line begin offsets for fast jumps
    this.eMarks = [];  // line end offsets for fast jumps
    this.tShift = [];  // offsets of the first non-space characters (tabs not expanded)
    this.sCount = [];  // indents for each line (tabs expanded)

    // An amount of virtual spaces (tabs expanded) between beginning
    // of each line (bMarks) and real beginning of that line.
    //
    // It exists only as a hack because blockquotes override bMarks
    // losing information in the process.
    //
    // It's used only when expanding tabs, you can think about it as
    // an initial tab length, e.g. bsCount=21 applied to string `\t123`
    // means first tab should be expanded to 4-21%4 === 3 spaces.
    //
    this.bsCount = [];

    // block parser variables
    this.blkIndent  = 0; // required block content indent
                         // (for example, if we are in list)
    this.line       = 0; // line index in src
    this.lineMax    = 0; // lines count
    this.tight      = false;  // loose/tight mode for lists
    this.ddIndent   = -1; // indent of the current dd block (-1 if there isn't any)

    // can be 'blockquote', 'list', 'root', 'paragraph' or 'reference'
    // used in lists to determine if they interrupt a paragraph
    this.parentType = 'root';

    this.level = 0;

    // renderer
    this.result = '';

    // Create caches
    // Generate markers.
    s = this.src;
    indent_found = false;

    for (start = pos = indent = offset = 0, len = s.length; pos < len; pos++) {
      ch = s.charCodeAt(pos);

      if (!indent_found) {
        if (isSpace$7(ch)) {
          indent++;

          if (ch === 0x09) {
            offset += 4 - offset % 4;
          } else {
            offset++;
          }
          continue;
        } else {
          indent_found = true;
        }
      }

      if (ch === 0x0A || pos === len - 1) {
        if (ch !== 0x0A) { pos++; }
        this.bMarks.push(start);
        this.eMarks.push(pos);
        this.tShift.push(indent);
        this.sCount.push(offset);
        this.bsCount.push(0);

        indent_found = false;
        indent = 0;
        offset = 0;
        start = pos + 1;
      }
    }

    // Push fake entry to simplify cache bounds checks
    this.bMarks.push(s.length);
    this.eMarks.push(s.length);
    this.tShift.push(0);
    this.sCount.push(0);
    this.bsCount.push(0);

    this.lineMax = this.bMarks.length - 1; // don't count last fake line
  }

  // Push new token to "stream".
  //
  StateBlock.prototype.push = function (type, tag, nesting) {
    var token = new token$1(type, tag, nesting);
    token.block = true;

    if (nesting < 0) { this.level--; }
    token.level = this.level;
    if (nesting > 0) { this.level++; }

    this.tokens.push(token);
    return token;
  };

  StateBlock.prototype.isEmpty = function isEmpty(line) {
    return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
  };

  StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
    for (var max = this.lineMax; from < max; from++) {
      if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
        break;
      }
    }
    return from;
  };

  // Skip spaces from given position.
  StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
    var ch;

    for (var max = this.src.length; pos < max; pos++) {
      ch = this.src.charCodeAt(pos);
      if (!isSpace$7(ch)) { break; }
    }
    return pos;
  };

  // Skip spaces from given position in reverse.
  StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
    if (pos <= min) { return pos; }

    while (pos > min) {
      if (!isSpace$7(this.src.charCodeAt(--pos))) { return pos + 1; }
    }
    return pos;
  };

  // Skip char codes from given position
  StateBlock.prototype.skipChars = function skipChars(pos, code) {
    for (var max = this.src.length; pos < max; pos++) {
      if (this.src.charCodeAt(pos) !== code) { break; }
    }
    return pos;
  };

  // Skip char codes reverse from given position - 1
  StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
    if (pos <= min) { return pos; }

    while (pos > min) {
      if (code !== this.src.charCodeAt(--pos)) { return pos + 1; }
    }
    return pos;
  };

  // cut lines range from source.
  StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
    var i, lineIndent, ch, first, last, queue, lineStart,
        line = begin;

    if (begin >= end) {
      return '';
    }

    queue = new Array(end - begin);

    for (i = 0; line < end; line++, i++) {
      lineIndent = 0;
      lineStart = first = this.bMarks[line];

      if (line + 1 < end || keepLastLF) {
        // No need for bounds check because we have fake entry on tail.
        last = this.eMarks[line] + 1;
      } else {
        last = this.eMarks[line];
      }

      while (first < last && lineIndent < indent) {
        ch = this.src.charCodeAt(first);

        if (isSpace$7(ch)) {
          if (ch === 0x09) {
            lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
          } else {
            lineIndent++;
          }
        } else if (first - lineStart < this.tShift[line]) {
          // patched tShift masked characters to look like spaces (blockquotes, list markers)
          lineIndent++;
        } else {
          break;
        }

        first++;
      }

      if (lineIndent > indent) {
        // partially expanding tabs in code blocks, e.g '\t\tfoobar'
        // with indent=2 becomes '  \tfoobar'
        queue[i] = new Array(lineIndent - indent + 1).join(' ') + this.src.slice(first, last);
      } else {
        queue[i] = this.src.slice(first, last);
      }
    }

    return queue.join('');
  };

  // re-export Token class to use in block rules
  StateBlock.prototype.Token = token$1;


  var state_block = StateBlock;

  var _rules$1 = [
    // First 2 params - rule name & source. Secondary array - list of rules,
    // which can be terminated by this one.
    [ 'table',      table,      [ 'paragraph', 'reference' ] ],
    [ 'code',       code ],
    [ 'fence',      fence,      [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
    [ 'blockquote', blockquote, [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
    [ 'hr',         hr,         [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
    [ 'list',       list,       [ 'paragraph', 'reference', 'blockquote' ] ],
    [ 'reference',  reference ],
    [ 'heading',    heading,    [ 'paragraph', 'reference', 'blockquote' ] ],
    [ 'lheading',   lheading ],
    [ 'html_block', html_block, [ 'paragraph', 'reference', 'blockquote' ] ],
    [ 'paragraph',  paragraph ]
  ];


  /**
   * new ParserBlock()
   **/
  function ParserBlock() {
    /**
     * ParserBlock#ruler -> Ruler
     *
     * [[Ruler]] instance. Keep configuration of block rules.
     **/
    this.ruler = new ruler();

    for (var i = 0; i < _rules$1.length; i++) {
      this.ruler.push(_rules$1[i][0], _rules$1[i][1], { alt: (_rules$1[i][2] || []).slice() });
    }
  }


  // Generate tokens for input range
  //
  ParserBlock.prototype.tokenize = function (state, startLine, endLine) {
    var ok, i,
        rules = this.ruler.getRules(''),
        len = rules.length,
        line = startLine,
        hasEmptyLines = false,
        maxNesting = state.md.options.maxNesting;

    while (line < endLine) {
      state.line = line = state.skipEmptyLines(line);
      if (line >= endLine) { break; }

      // Termination condition for nested calls.
      // Nested calls currently used for blockquotes & lists
      if (state.sCount[line] < state.blkIndent) { break; }

      // If nesting level exceeded - skip tail to the end. That's not ordinary
      // situation and we should not care about content.
      if (state.level >= maxNesting) {
        state.line = endLine;
        break;
      }

      // Try all possible rules.
      // On success, rule should:
      //
      // - update `state.line`
      // - update `state.tokens`
      // - return true

      for (i = 0; i < len; i++) {
        ok = rules[i](state, line, endLine, false);
        if (ok) { break; }
      }

      // set state.tight if we had an empty line before current tag
      // i.e. latest empty line should not count
      state.tight = !hasEmptyLines;

      // paragraph might "eat" one newline after it in nested lists
      if (state.isEmpty(state.line - 1)) {
        hasEmptyLines = true;
      }

      line = state.line;

      if (line < endLine && state.isEmpty(line)) {
        hasEmptyLines = true;
        line++;
        state.line = line;
      }
    }
  };


  /**
   * ParserBlock.parse(str, md, env, outTokens)
   *
   * Process input string and push block tokens into `outTokens`
   **/
  ParserBlock.prototype.parse = function (src, md, env, outTokens) {
    var state;

    if (!src) { return; }

    state = new this.State(src, md, env, outTokens);

    this.tokenize(state, state.line, state.lineMax);
  };


  ParserBlock.prototype.State = state_block;


  var parser_block = ParserBlock;

  // Skip text characters for text token, place those to pending buffer


  // Rule to skip pure text
  // '{}$%@~+=:' reserved for extentions

  // !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~

  // !!!! Don't confuse with "Markdown ASCII Punctuation" chars
  // http://spec.commonmark.org/0.15/#ascii-punctuation-character
  function isTerminatorChar(ch) {
    switch (ch) {
      case 0x0A/* \n */:
      case 0x21/* ! */:
      case 0x23/* # */:
      case 0x24/* $ */:
      case 0x25/* % */:
      case 0x26/* & */:
      case 0x2A/* * */:
      case 0x2B/* + */:
      case 0x2D/* - */:
      case 0x3A/* : */:
      case 0x3C/* < */:
      case 0x3D/* = */:
      case 0x3E/* > */:
      case 0x40/* @ */:
      case 0x5B/* [ */:
      case 0x5C/* \ */:
      case 0x5D/* ] */:
      case 0x5E/* ^ */:
      case 0x5F/* _ */:
      case 0x60/* ` */:
      case 0x7B/* { */:
      case 0x7D/* } */:
      case 0x7E/* ~ */:
        return true;
      default:
        return false;
    }
  }

  var text = function text(state, silent) {
    var pos = state.pos;

    while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
      pos++;
    }

    if (pos === state.pos) { return false; }

    if (!silent) { state.pending += state.src.slice(state.pos, pos); }

    state.pos = pos;

    return true;
  };

  var isSpace$8 = utils$1.isSpace;


  var newline = function newline(state, silent) {
    var pmax, max, pos = state.pos;

    if (state.src.charCodeAt(pos) !== 0x0A/* \n */) { return false; }

    pmax = state.pending.length - 1;
    max = state.posMax;

    // '  \n' -> hardbreak
    // Lookup in pending chars is bad practice! Don't copy to other rules!
    // Pending string is stored in concat mode, indexed lookups will cause
    // convertion to flat mode.
    if (!silent) {
      if (pmax >= 0 && state.pending.charCodeAt(pmax) === 0x20) {
        if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 0x20) {
          state.pending = state.pending.replace(/ +$/, '');
          state.push('hardbreak', 'br', 0);
        } else {
          state.pending = state.pending.slice(0, -1);
          state.push('softbreak', 'br', 0);
        }

      } else {
        state.push('softbreak', 'br', 0);
      }
    }

    pos++;

    // skip heading spaces for next line
    while (pos < max && isSpace$8(state.src.charCodeAt(pos))) { pos++; }

    state.pos = pos;
    return true;
  };

  var isSpace$9 = utils$1.isSpace;

  var ESCAPED = [];

  for (var i = 0; i < 256; i++) { ESCAPED.push(0); }

  '\\!"#$%&\'()*+,./:;<=>?@[]^_`{|}~-'
    .split('').forEach(function (ch) { ESCAPED[ch.charCodeAt(0)] = 1; });


  var _escape = function escape(state, silent) {
    var ch, pos = state.pos, max = state.posMax;

    if (state.src.charCodeAt(pos) !== 0x5C/* \ */) { return false; }

    pos++;

    if (pos < max) {
      ch = state.src.charCodeAt(pos);

      if (ch < 256 && ESCAPED[ch] !== 0) {
        if (!silent) { state.pending += state.src[pos]; }
        state.pos += 2;
        return true;
      }

      if (ch === 0x0A) {
        if (!silent) {
          state.push('hardbreak', 'br', 0);
        }

        pos++;
        // skip leading whitespaces from next line
        while (pos < max) {
          ch = state.src.charCodeAt(pos);
          if (!isSpace$9(ch)) { break; }
          pos++;
        }

        state.pos = pos;
        return true;
      }
    }

    if (!silent) { state.pending += '\\'; }
    state.pos++;
    return true;
  };

  // Parse backticks

  var backticks = function backtick(state, silent) {
    var start, max, marker, matchStart, matchEnd, token,
        pos = state.pos,
        ch = state.src.charCodeAt(pos);

    if (ch !== 0x60/* ` */) { return false; }

    start = pos;
    pos++;
    max = state.posMax;

    while (pos < max && state.src.charCodeAt(pos) === 0x60/* ` */) { pos++; }

    marker = state.src.slice(start, pos);

    matchStart = matchEnd = pos;

    while ((matchStart = state.src.indexOf('`', matchEnd)) !== -1) {
      matchEnd = matchStart + 1;

      while (matchEnd < max && state.src.charCodeAt(matchEnd) === 0x60/* ` */) { matchEnd++; }

      if (matchEnd - matchStart === marker.length) {
        if (!silent) {
          token         = state.push('code_inline', 'code', 0);
          token.markup  = marker;
          token.content = state.src.slice(pos, matchStart)
                                   .replace(/[ \n]+/g, ' ')
                                   .trim();
        }
        state.pos = matchEnd;
        return true;
      }
    }

    if (!silent) { state.pending += marker; }
    state.pos += marker.length;
    return true;
  };

  // ~~strike through~~


  // Insert each marker as a separate text token, and add it to delimiter list
  //
  var tokenize = function strikethrough(state, silent) {
    var i, scanned, token, len, ch,
        start = state.pos,
        marker = state.src.charCodeAt(start);

    if (silent) { return false; }

    if (marker !== 0x7E/* ~ */) { return false; }

    scanned = state.scanDelims(state.pos, true);
    len = scanned.length;
    ch = String.fromCharCode(marker);

    if (len < 2) { return false; }

    if (len % 2) {
      token         = state.push('text', '', 0);
      token.content = ch;
      len--;
    }

    for (i = 0; i < len; i += 2) {
      token         = state.push('text', '', 0);
      token.content = ch + ch;

      state.delimiters.push({
        marker: marker,
        jump:   i,
        token:  state.tokens.length - 1,
        level:  state.level,
        end:    -1,
        open:   scanned.can_open,
        close:  scanned.can_close
      });
    }

    state.pos += scanned.length;

    return true;
  };


  // Walk through delimiter list and replace text tokens with tags
  //
  var postProcess = function strikethrough(state) {
    var i, j,
        startDelim,
        endDelim,
        token,
        loneMarkers = [],
        delimiters = state.delimiters,
        max = state.delimiters.length;

    for (i = 0; i < max; i++) {
      startDelim = delimiters[i];

      if (startDelim.marker !== 0x7E/* ~ */) {
        continue;
      }

      if (startDelim.end === -1) {
        continue;
      }

      endDelim = delimiters[startDelim.end];

      token         = state.tokens[startDelim.token];
      token.type    = 's_open';
      token.tag     = 's';
      token.nesting = 1;
      token.markup  = '~~';
      token.content = '';

      token         = state.tokens[endDelim.token];
      token.type    = 's_close';
      token.tag     = 's';
      token.nesting = -1;
      token.markup  = '~~';
      token.content = '';

      if (state.tokens[endDelim.token - 1].type === 'text' &&
          state.tokens[endDelim.token - 1].content === '~') {

        loneMarkers.push(endDelim.token - 1);
      }
    }

    // If a marker sequence has an odd number of characters, it's splitted
    // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
    // start of the sequence.
    //
    // So, we have to move all those markers after subsequent s_close tags.
    //
    while (loneMarkers.length) {
      i = loneMarkers.pop();
      j = i + 1;

      while (j < state.tokens.length && state.tokens[j].type === 's_close') {
        j++;
      }

      j--;

      if (i !== j) {
        token = state.tokens[j];
        state.tokens[j] = state.tokens[i];
        state.tokens[i] = token;
      }
    }
  };

  var strikethrough = {
  	tokenize: tokenize,
  	postProcess: postProcess
  };

  // Process *this* and _that_


  // Insert each marker as a separate text token, and add it to delimiter list
  //
  var tokenize$1 = function emphasis(state, silent) {
    var i, scanned, token,
        start = state.pos,
        marker = state.src.charCodeAt(start);

    if (silent) { return false; }

    if (marker !== 0x5F /* _ */ && marker !== 0x2A /* * */) { return false; }

    scanned = state.scanDelims(state.pos, marker === 0x2A);

    for (i = 0; i < scanned.length; i++) {
      token         = state.push('text', '', 0);
      token.content = String.fromCharCode(marker);

      state.delimiters.push({
        // Char code of the starting marker (number).
        //
        marker: marker,

        // Total length of these series of delimiters.
        //
        length: scanned.length,

        // An amount of characters before this one that's equivalent to
        // current one. In plain English: if this delimiter does not open
        // an emphasis, neither do previous `jump` characters.
        //
        // Used to skip sequences like "*****" in one step, for 1st asterisk
        // value will be 0, for 2nd it's 1 and so on.
        //
        jump:   i,

        // A position of the token this delimiter corresponds to.
        //
        token:  state.tokens.length - 1,

        // Token level.
        //
        level:  state.level,

        // If this delimiter is matched as a valid opener, `end` will be
        // equal to its position, otherwise it's `-1`.
        //
        end:    -1,

        // Boolean flags that determine if this delimiter could open or close
        // an emphasis.
        //
        open:   scanned.can_open,
        close:  scanned.can_close
      });
    }

    state.pos += scanned.length;

    return true;
  };


  // Walk through delimiter list and replace text tokens with tags
  //
  var postProcess$1 = function emphasis(state) {
    var i,
        startDelim,
        endDelim,
        token,
        ch,
        isStrong,
        delimiters = state.delimiters,
        max = state.delimiters.length;

    for (i = max - 1; i >= 0; i--) {
      startDelim = delimiters[i];

      if (startDelim.marker !== 0x5F/* _ */ && startDelim.marker !== 0x2A/* * */) {
        continue;
      }

      // Process only opening markers
      if (startDelim.end === -1) {
        continue;
      }

      endDelim = delimiters[startDelim.end];

      // If the previous delimiter has the same marker and is adjacent to this one,
      // merge those into one strong delimiter.
      //
      // `<em><em>whatever</em></em>` -> `<strong>whatever</strong>`
      //
      isStrong = i > 0 &&
                 delimiters[i - 1].end === startDelim.end + 1 &&
                 delimiters[i - 1].token === startDelim.token - 1 &&
                 delimiters[startDelim.end + 1].token === endDelim.token + 1 &&
                 delimiters[i - 1].marker === startDelim.marker;

      ch = String.fromCharCode(startDelim.marker);

      token         = state.tokens[startDelim.token];
      token.type    = isStrong ? 'strong_open' : 'em_open';
      token.tag     = isStrong ? 'strong' : 'em';
      token.nesting = 1;
      token.markup  = isStrong ? ch + ch : ch;
      token.content = '';

      token         = state.tokens[endDelim.token];
      token.type    = isStrong ? 'strong_close' : 'em_close';
      token.tag     = isStrong ? 'strong' : 'em';
      token.nesting = -1;
      token.markup  = isStrong ? ch + ch : ch;
      token.content = '';

      if (isStrong) {
        state.tokens[delimiters[i - 1].token].content = '';
        state.tokens[delimiters[startDelim.end + 1].token].content = '';
        i--;
      }
    }
  };

  var emphasis = {
  	tokenize: tokenize$1,
  	postProcess: postProcess$1
  };

  var normalizeReference$1   = utils$1.normalizeReference;
  var isSpace$a              = utils$1.isSpace;


  var link = function link(state, silent) {
    var attrs,
        code,
        label,
        labelEnd,
        labelStart,
        pos,
        res,
        ref,
        title,
        token,
        href = '',
        oldPos = state.pos,
        max = state.posMax,
        start = state.pos,
        parseReference = true;

    if (state.src.charCodeAt(state.pos) !== 0x5B/* [ */) { return false; }

    labelStart = state.pos + 1;
    labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true);

    // parser failed to find ']', so it's not a valid link
    if (labelEnd < 0) { return false; }

    pos = labelEnd + 1;
    if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
      //
      // Inline link
      //

      // might have found a valid shortcut link, disable reference parsing
      parseReference = false;

      // [link](  <href>  "title"  )
      //        ^^ skipping these spaces
      pos++;
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace$a(code) && code !== 0x0A) { break; }
      }
      if (pos >= max) { return false; }

      // [link](  <href>  "title"  )
      //          ^^^^^^ parsing link destination
      start = pos;
      res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
      if (res.ok) {
        href = state.md.normalizeLink(res.str);
        if (state.md.validateLink(href)) {
          pos = res.pos;
        } else {
          href = '';
        }
      }

      // [link](  <href>  "title"  )
      //                ^^ skipping these spaces
      start = pos;
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace$a(code) && code !== 0x0A) { break; }
      }

      // [link](  <href>  "title"  )
      //                  ^^^^^^^ parsing link title
      res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
      if (pos < max && start !== pos && res.ok) {
        title = res.str;
        pos = res.pos;

        // [link](  <href>  "title"  )
        //                         ^^ skipping these spaces
        for (; pos < max; pos++) {
          code = state.src.charCodeAt(pos);
          if (!isSpace$a(code) && code !== 0x0A) { break; }
        }
      } else {
        title = '';
      }

      if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
        // parsing a valid shortcut link failed, fallback to reference
        parseReference = true;
      }
      pos++;
    }

    if (parseReference) {
      //
      // Link reference
      //
      if (typeof state.env.references === 'undefined') { return false; }

      if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
        start = pos + 1;
        pos = state.md.helpers.parseLinkLabel(state, pos);
        if (pos >= 0) {
          label = state.src.slice(start, pos++);
        } else {
          pos = labelEnd + 1;
        }
      } else {
        pos = labelEnd + 1;
      }

      // covers label === '' and label === undefined
      // (collapsed reference link and shortcut reference link respectively)
      if (!label) { label = state.src.slice(labelStart, labelEnd); }

      ref = state.env.references[normalizeReference$1(label)];
      if (!ref) {
        state.pos = oldPos;
        return false;
      }
      href = ref.href;
      title = ref.title;
    }

    //
    // We found the end of the link, and know for a fact it's a valid link;
    // so all that's left to do is to call tokenizer.
    //
    if (!silent) {
      state.pos = labelStart;
      state.posMax = labelEnd;

      token        = state.push('link_open', 'a', 1);
      token.attrs  = attrs = [ [ 'href', href ] ];
      if (title) {
        attrs.push([ 'title', title ]);
      }

      state.md.inline.tokenize(state);

      token        = state.push('link_close', 'a', -1);
    }

    state.pos = pos;
    state.posMax = max;
    return true;
  };

  var normalizeReference$2   = utils$1.normalizeReference;
  var isSpace$b              = utils$1.isSpace;


  var image$1 = function image(state, silent) {
    var attrs,
        code,
        content,
        label,
        labelEnd,
        labelStart,
        pos,
        ref,
        res,
        title,
        token,
        tokens,
        start,
        href = '',
        oldPos = state.pos,
        max = state.posMax;

    if (state.src.charCodeAt(state.pos) !== 0x21/* ! */) { return false; }
    if (state.src.charCodeAt(state.pos + 1) !== 0x5B/* [ */) { return false; }

    labelStart = state.pos + 2;
    labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);

    // parser failed to find ']', so it's not a valid link
    if (labelEnd < 0) { return false; }

    pos = labelEnd + 1;
    if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
      //
      // Inline link
      //

      // [link](  <href>  "title"  )
      //        ^^ skipping these spaces
      pos++;
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace$b(code) && code !== 0x0A) { break; }
      }
      if (pos >= max) { return false; }

      // [link](  <href>  "title"  )
      //          ^^^^^^ parsing link destination
      start = pos;
      res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
      if (res.ok) {
        href = state.md.normalizeLink(res.str);
        if (state.md.validateLink(href)) {
          pos = res.pos;
        } else {
          href = '';
        }
      }

      // [link](  <href>  "title"  )
      //                ^^ skipping these spaces
      start = pos;
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace$b(code) && code !== 0x0A) { break; }
      }

      // [link](  <href>  "title"  )
      //                  ^^^^^^^ parsing link title
      res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
      if (pos < max && start !== pos && res.ok) {
        title = res.str;
        pos = res.pos;

        // [link](  <href>  "title"  )
        //                         ^^ skipping these spaces
        for (; pos < max; pos++) {
          code = state.src.charCodeAt(pos);
          if (!isSpace$b(code) && code !== 0x0A) { break; }
        }
      } else {
        title = '';
      }

      if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
        state.pos = oldPos;
        return false;
      }
      pos++;
    } else {
      //
      // Link reference
      //
      if (typeof state.env.references === 'undefined') { return false; }

      if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
        start = pos + 1;
        pos = state.md.helpers.parseLinkLabel(state, pos);
        if (pos >= 0) {
          label = state.src.slice(start, pos++);
        } else {
          pos = labelEnd + 1;
        }
      } else {
        pos = labelEnd + 1;
      }

      // covers label === '' and label === undefined
      // (collapsed reference link and shortcut reference link respectively)
      if (!label) { label = state.src.slice(labelStart, labelEnd); }

      ref = state.env.references[normalizeReference$2(label)];
      if (!ref) {
        state.pos = oldPos;
        return false;
      }
      href = ref.href;
      title = ref.title;
    }

    //
    // We found the end of the link, and know for a fact it's a valid link;
    // so all that's left to do is to call tokenizer.
    //
    if (!silent) {
      content = state.src.slice(labelStart, labelEnd);

      state.md.inline.parse(
        content,
        state.md,
        state.env,
        tokens = []
      );

      token          = state.push('image', 'img', 0);
      token.attrs    = attrs = [ [ 'src', href ], [ 'alt', '' ] ];
      token.children = tokens;
      token.content  = content;

      if (title) {
        attrs.push([ 'title', title ]);
      }
    }

    state.pos = pos;
    state.posMax = max;
    return true;
  };

  // Process autolinks '<protocol:...>'


  /*eslint max-len:0*/
  var EMAIL_RE    = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
  var AUTOLINK_RE = /^<([a-zA-Z][a-zA-Z0-9+.\-]{1,31}):([^<>\x00-\x20]*)>/;


  var autolink = function autolink(state, silent) {
    var tail, linkMatch, emailMatch, url, fullUrl, token,
        pos = state.pos;

    if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

    tail = state.src.slice(pos);

    if (tail.indexOf('>') < 0) { return false; }

    if (AUTOLINK_RE.test(tail)) {
      linkMatch = tail.match(AUTOLINK_RE);

      url = linkMatch[0].slice(1, -1);
      fullUrl = state.md.normalizeLink(url);
      if (!state.md.validateLink(fullUrl)) { return false; }

      if (!silent) {
        token         = state.push('link_open', 'a', 1);
        token.attrs   = [ [ 'href', fullUrl ] ];
        token.markup  = 'autolink';
        token.info    = 'auto';

        token         = state.push('text', '', 0);
        token.content = state.md.normalizeLinkText(url);

        token         = state.push('link_close', 'a', -1);
        token.markup  = 'autolink';
        token.info    = 'auto';
      }

      state.pos += linkMatch[0].length;
      return true;
    }

    if (EMAIL_RE.test(tail)) {
      emailMatch = tail.match(EMAIL_RE);

      url = emailMatch[0].slice(1, -1);
      fullUrl = state.md.normalizeLink('mailto:' + url);
      if (!state.md.validateLink(fullUrl)) { return false; }

      if (!silent) {
        token         = state.push('link_open', 'a', 1);
        token.attrs   = [ [ 'href', fullUrl ] ];
        token.markup  = 'autolink';
        token.info    = 'auto';

        token         = state.push('text', '', 0);
        token.content = state.md.normalizeLinkText(url);

        token         = state.push('link_close', 'a', -1);
        token.markup  = 'autolink';
        token.info    = 'auto';
      }

      state.pos += emailMatch[0].length;
      return true;
    }

    return false;
  };

  var HTML_TAG_RE$1 = html_re.HTML_TAG_RE;


  function isLetter(ch) {
    /*eslint no-bitwise:0*/
    var lc = ch | 0x20; // to lower case
    return (lc >= 0x61/* a */) && (lc <= 0x7a/* z */);
  }


  var html_inline = function html_inline(state, silent) {
    var ch, match, max, token,
        pos = state.pos;

    if (!state.md.options.html) { return false; }

    // Check start
    max = state.posMax;
    if (state.src.charCodeAt(pos) !== 0x3C/* < */ ||
        pos + 2 >= max) {
      return false;
    }

    // Quick fail on second char
    ch = state.src.charCodeAt(pos + 1);
    if (ch !== 0x21/* ! */ &&
        ch !== 0x3F/* ? */ &&
        ch !== 0x2F/* / */ &&
        !isLetter(ch)) {
      return false;
    }

    match = state.src.slice(pos).match(HTML_TAG_RE$1);
    if (!match) { return false; }

    if (!silent) {
      token         = state.push('html_inline', '', 0);
      token.content = state.src.slice(pos, pos + match[0].length);
    }
    state.pos += match[0].length;
    return true;
  };

  var has               = utils$1.has;
  var isValidEntityCode = utils$1.isValidEntityCode;
  var fromCodePoint     = utils$1.fromCodePoint;


  var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,8}|[0-9]{1,8}));/i;
  var NAMED_RE   = /^&([a-z][a-z0-9]{1,31});/i;


  var entity = function entity(state, silent) {
    var ch, code, match, pos = state.pos, max = state.posMax;

    if (state.src.charCodeAt(pos) !== 0x26/* & */) { return false; }

    if (pos + 1 < max) {
      ch = state.src.charCodeAt(pos + 1);

      if (ch === 0x23 /* # */) {
        match = state.src.slice(pos).match(DIGITAL_RE);
        if (match) {
          if (!silent) {
            code = match[1][0].toLowerCase() === 'x' ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
            state.pending += isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(0xFFFD);
          }
          state.pos += match[0].length;
          return true;
        }
      } else {
        match = state.src.slice(pos).match(NAMED_RE);
        if (match) {
          if (has(entities$2, match[1])) {
            if (!silent) { state.pending += entities$2[match[1]]; }
            state.pos += match[0].length;
            return true;
          }
        }
      }
    }

    if (!silent) { state.pending += '&'; }
    state.pos++;
    return true;
  };

  // For each opening emphasis-like marker find a matching closing one


  var balance_pairs = function link_pairs(state) {
    var i, j, lastDelim, currDelim,
        delimiters = state.delimiters,
        max = state.delimiters.length;

    for (i = 0; i < max; i++) {
      lastDelim = delimiters[i];

      if (!lastDelim.close) { continue; }

      j = i - lastDelim.jump - 1;

      while (j >= 0) {
        currDelim = delimiters[j];

        if (currDelim.open &&
            currDelim.marker === lastDelim.marker &&
            currDelim.end < 0 &&
            currDelim.level === lastDelim.level) {

          // typeofs are for backward compatibility with plugins
          var odd_match = (currDelim.close || lastDelim.open) &&
                          typeof currDelim.length !== 'undefined' &&
                          typeof lastDelim.length !== 'undefined' &&
                          (currDelim.length + lastDelim.length) % 3 === 0;

          if (!odd_match) {
            lastDelim.jump = i - j;
            lastDelim.open = false;
            currDelim.end  = i;
            currDelim.jump = 0;
            break;
          }
        }

        j -= currDelim.jump + 1;
      }
    }
  };

  // Merge adjacent text nodes into one, and re-calculate all token levels


  var text_collapse = function text_collapse(state) {
    var curr, last,
        level = 0,
        tokens = state.tokens,
        max = state.tokens.length;

    for (curr = last = 0; curr < max; curr++) {
      // re-calculate levels
      level += tokens[curr].nesting;
      tokens[curr].level = level;

      if (tokens[curr].type === 'text' &&
          curr + 1 < max &&
          tokens[curr + 1].type === 'text') {

        // collapse two adjacent text nodes
        tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
      } else {
        if (curr !== last) { tokens[last] = tokens[curr]; }

        last++;
      }
    }

    if (curr !== last) {
      tokens.length = last;
    }
  };

  var isWhiteSpace$1   = utils$1.isWhiteSpace;
  var isPunctChar$1    = utils$1.isPunctChar;
  var isMdAsciiPunct$1 = utils$1.isMdAsciiPunct;


  function StateInline(src, md, env, outTokens) {
    this.src = src;
    this.env = env;
    this.md = md;
    this.tokens = outTokens;

    this.pos = 0;
    this.posMax = this.src.length;
    this.level = 0;
    this.pending = '';
    this.pendingLevel = 0;

    this.cache = {};        // Stores { start: end } pairs. Useful for backtrack
                            // optimization of pairs parse (emphasis, strikes).

    this.delimiters = [];   // Emphasis-like delimiters
  }


  // Flush pending text
  //
  StateInline.prototype.pushPending = function () {
    var token = new token$1('text', '', 0);
    token.content = this.pending;
    token.level = this.pendingLevel;
    this.tokens.push(token);
    this.pending = '';
    return token;
  };


  // Push new token to "stream".
  // If pending text exists - flush it as text token
  //
  StateInline.prototype.push = function (type, tag, nesting) {
    if (this.pending) {
      this.pushPending();
    }

    var token = new token$1(type, tag, nesting);

    if (nesting < 0) { this.level--; }
    token.level = this.level;
    if (nesting > 0) { this.level++; }

    this.pendingLevel = this.level;
    this.tokens.push(token);
    return token;
  };


  // Scan a sequence of emphasis-like markers, and determine whether
  // it can start an emphasis sequence or end an emphasis sequence.
  //
  //  - start - position to scan from (it should point at a valid marker);
  //  - canSplitWord - determine if these markers can be found inside a word
  //
  StateInline.prototype.scanDelims = function (start, canSplitWord) {
    var pos = start, lastChar, nextChar, count, can_open, can_close,
        isLastWhiteSpace, isLastPunctChar,
        isNextWhiteSpace, isNextPunctChar,
        left_flanking = true,
        right_flanking = true,
        max = this.posMax,
        marker = this.src.charCodeAt(start);

    // treat beginning of the line as a whitespace
    lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 0x20;

    while (pos < max && this.src.charCodeAt(pos) === marker) { pos++; }

    count = pos - start;

    // treat end of the line as a whitespace
    nextChar = pos < max ? this.src.charCodeAt(pos) : 0x20;

    isLastPunctChar = isMdAsciiPunct$1(lastChar) || isPunctChar$1(String.fromCharCode(lastChar));
    isNextPunctChar = isMdAsciiPunct$1(nextChar) || isPunctChar$1(String.fromCharCode(nextChar));

    isLastWhiteSpace = isWhiteSpace$1(lastChar);
    isNextWhiteSpace = isWhiteSpace$1(nextChar);

    if (isNextWhiteSpace) {
      left_flanking = false;
    } else if (isNextPunctChar) {
      if (!(isLastWhiteSpace || isLastPunctChar)) {
        left_flanking = false;
      }
    }

    if (isLastWhiteSpace) {
      right_flanking = false;
    } else if (isLastPunctChar) {
      if (!(isNextWhiteSpace || isNextPunctChar)) {
        right_flanking = false;
      }
    }

    if (!canSplitWord) {
      can_open  = left_flanking  && (!right_flanking || isLastPunctChar);
      can_close = right_flanking && (!left_flanking  || isNextPunctChar);
    } else {
      can_open  = left_flanking;
      can_close = right_flanking;
    }

    return {
      can_open:  can_open,
      can_close: can_close,
      length:    count
    };
  };


  // re-export Token class to use in block rules
  StateInline.prototype.Token = token$1;


  var state_inline = StateInline;

  ////////////////////////////////////////////////////////////////////////////////
  // Parser rules

  var _rules$2 = [
    [ 'text',            text ],
    [ 'newline',         newline ],
    [ 'escape',          _escape ],
    [ 'backticks',       backticks ],
    [ 'strikethrough',   strikethrough.tokenize ],
    [ 'emphasis',        emphasis.tokenize ],
    [ 'link',            link ],
    [ 'image',           image$1 ],
    [ 'autolink',        autolink ],
    [ 'html_inline',     html_inline ],
    [ 'entity',          entity ]
  ];

  var _rules2 = [
    [ 'balance_pairs',   balance_pairs ],
    [ 'strikethrough',   strikethrough.postProcess ],
    [ 'emphasis',        emphasis.postProcess ],
    [ 'text_collapse',   text_collapse ]
  ];


  /**
   * new ParserInline()
   **/
  function ParserInline() {
    var i;

    /**
     * ParserInline#ruler -> Ruler
     *
     * [[Ruler]] instance. Keep configuration of inline rules.
     **/
    this.ruler = new ruler();

    for (i = 0; i < _rules$2.length; i++) {
      this.ruler.push(_rules$2[i][0], _rules$2[i][1]);
    }

    /**
     * ParserInline#ruler2 -> Ruler
     *
     * [[Ruler]] instance. Second ruler used for post-processing
     * (e.g. in emphasis-like rules).
     **/
    this.ruler2 = new ruler();

    for (i = 0; i < _rules2.length; i++) {
      this.ruler2.push(_rules2[i][0], _rules2[i][1]);
    }
  }


  // Skip single token by running all rules in validation mode;
  // returns `true` if any rule reported success
  //
  ParserInline.prototype.skipToken = function (state) {
    var ok, i, pos = state.pos,
        rules = this.ruler.getRules(''),
        len = rules.length,
        maxNesting = state.md.options.maxNesting,
        cache = state.cache;


    if (typeof cache[pos] !== 'undefined') {
      state.pos = cache[pos];
      return;
    }

    if (state.level < maxNesting) {
      for (i = 0; i < len; i++) {
        // Increment state.level and decrement it later to limit recursion.
        // It's harmless to do here, because no tokens are created. But ideally,
        // we'd need a separate private state variable for this purpose.
        //
        state.level++;
        ok = rules[i](state, true);
        state.level--;

        if (ok) { break; }
      }
    } else {
      // Too much nesting, just skip until the end of the paragraph.
      //
      // NOTE: this will cause links to behave incorrectly in the following case,
      //       when an amount of `[` is exactly equal to `maxNesting + 1`:
      //
      //       [[[[[[[[[[[[[[[[[[[[[foo]()
      //
      // TODO: remove this workaround when CM standard will allow nested links
      //       (we can replace it by preventing links from being parsed in
      //       validation mode)
      //
      state.pos = state.posMax;
    }

    if (!ok) { state.pos++; }
    cache[pos] = state.pos;
  };


  // Generate tokens for input range
  //
  ParserInline.prototype.tokenize = function (state) {
    var ok, i,
        rules = this.ruler.getRules(''),
        len = rules.length,
        end = state.posMax,
        maxNesting = state.md.options.maxNesting;

    while (state.pos < end) {
      // Try all possible rules.
      // On success, rule should:
      //
      // - update `state.pos`
      // - update `state.tokens`
      // - return true

      if (state.level < maxNesting) {
        for (i = 0; i < len; i++) {
          ok = rules[i](state, false);
          if (ok) { break; }
        }
      }

      if (ok) {
        if (state.pos >= end) { break; }
        continue;
      }

      state.pending += state.src[state.pos++];
    }

    if (state.pending) {
      state.pushPending();
    }
  };


  /**
   * ParserInline.parse(str, md, env, outTokens)
   *
   * Process input string and push inline tokens into `outTokens`
   **/
  ParserInline.prototype.parse = function (str, md, env, outTokens) {
    var i, rules, len;
    var state = new this.State(str, md, env, outTokens);

    this.tokenize(state);

    rules = this.ruler2.getRules('');
    len = rules.length;

    for (i = 0; i < len; i++) {
      rules[i](state);
    }
  };


  ParserInline.prototype.State = state_inline;


  var parser_inline = ParserInline;

  var re = function (opts) {
    var re = {};

    // Use direct extract instead of `regenerate` to reduse browserified size
    re.src_Any = regex$1.source;
    re.src_Cc  = regex$2.source;
    re.src_Z   = regex$4.source;
    re.src_P   = regex.source;

    // \p{\Z\P\Cc\CF} (white spaces + control + format + punctuation)
    re.src_ZPCc = [ re.src_Z, re.src_P, re.src_Cc ].join('|');

    // \p{\Z\Cc} (white spaces + control)
    re.src_ZCc = [ re.src_Z, re.src_Cc ].join('|');

    // Experimental. List of chars, completely prohibited in links
    // because can separate it from other part of text
    var text_separators = '[><\uff5c]';

    // All possible word characters (everything without punctuation, spaces & controls)
    // Defined via punctuation & spaces to save space
    // Should be something like \p{\L\N\S\M} (\w but without `_`)
    re.src_pseudo_letter       = '(?:(?!' + text_separators + '|' + re.src_ZPCc + ')' + re.src_Any + ')';
    // The same as abothe but without [0-9]
    // var src_pseudo_letter_non_d = '(?:(?![0-9]|' + src_ZPCc + ')' + src_Any + ')';

    ////////////////////////////////////////////////////////////////////////////////

    re.src_ip4 =

      '(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';

    // Prohibit any of "@/[]()" in user/pass to avoid wrong domain fetch.
    re.src_auth    = '(?:(?:(?!' + re.src_ZCc + '|[@/\\[\\]()]).)+@)?';

    re.src_port =

      '(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?';

    re.src_host_terminator =

      '(?=$|' + text_separators + '|' + re.src_ZPCc + ')(?!-|_|:\\d|\\.-|\\.(?!$|' + re.src_ZPCc + '))';

    re.src_path =

      '(?:' +
        '[/?#]' +
          '(?:' +
            '(?!' + re.src_ZCc + '|' + text_separators + '|[()[\\]{}.,"\'?!\\-]).|' +
            '\\[(?:(?!' + re.src_ZCc + '|\\]).)*\\]|' +
            '\\((?:(?!' + re.src_ZCc + '|[)]).)*\\)|' +
            '\\{(?:(?!' + re.src_ZCc + '|[}]).)*\\}|' +
            '\\"(?:(?!' + re.src_ZCc + '|["]).)+\\"|' +
            "\\'(?:(?!" + re.src_ZCc + "|[']).)+\\'|" +
            "\\'(?=" + re.src_pseudo_letter + '|[-]).|' +  // allow `I'm_king` if no pair found
            '\\.{2,3}[a-zA-Z0-9%/]|' + // github has ... in commit range links. Restrict to
                                       // - english
                                       // - percent-encoded
                                       // - parts of file path
                                       // until more examples found.
            '\\.(?!' + re.src_ZCc + '|[.]).|' +
            (opts && opts['---'] ?
              '\\-(?!--(?:[^-]|$))(?:-*)|' // `---` => long dash, terminate
              :
              '\\-+|'
            ) +
            '\\,(?!' + re.src_ZCc + ').|' +      // allow `,,,` in paths
            '\\!(?!' + re.src_ZCc + '|[!]).|' +
            '\\?(?!' + re.src_ZCc + '|[?]).' +
          ')+' +
        '|\\/' +
      ')?';

    re.src_email_name =

      '[\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]+';

    re.src_xn =

      'xn--[a-z0-9\\-]{1,59}';

    // More to read about domain names
    // http://serverfault.com/questions/638260/

    re.src_domain_root =

      // Allow letters & digits (http://test1)
      '(?:' +
        re.src_xn +
        '|' +
        re.src_pseudo_letter + '{1,63}' +
      ')';

    re.src_domain =

      '(?:' +
        re.src_xn +
        '|' +
        '(?:' + re.src_pseudo_letter + ')' +
        '|' +
        '(?:' + re.src_pseudo_letter + '(?:-|' + re.src_pseudo_letter + '){0,61}' + re.src_pseudo_letter + ')' +
      ')';

    re.src_host =

      '(?:' +
      // Don't need IP check, because digits are already allowed in normal domain names
      //   src_ip4 +
      // '|' +
        '(?:(?:(?:' + re.src_domain + ')\\.)*' + re.src_domain/*_root*/ + ')' +
      ')';

    re.tpl_host_fuzzy =

      '(?:' +
        re.src_ip4 +
      '|' +
        '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))' +
      ')';

    re.tpl_host_no_ip_fuzzy =

      '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))';

    re.src_host_strict =

      re.src_host + re.src_host_terminator;

    re.tpl_host_fuzzy_strict =

      re.tpl_host_fuzzy + re.src_host_terminator;

    re.src_host_port_strict =

      re.src_host + re.src_port + re.src_host_terminator;

    re.tpl_host_port_fuzzy_strict =

      re.tpl_host_fuzzy + re.src_port + re.src_host_terminator;

    re.tpl_host_port_no_ip_fuzzy_strict =

      re.tpl_host_no_ip_fuzzy + re.src_port + re.src_host_terminator;


    ////////////////////////////////////////////////////////////////////////////////
    // Main rules

    // Rude test fuzzy links by host, for quick deny
    re.tpl_host_fuzzy_test =

      'localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:' + re.src_ZPCc + '|>|$))';

    re.tpl_email_fuzzy =

        '(^|' + text_separators + '|\\(|' + re.src_ZCc + ')(' + re.src_email_name + '@' + re.tpl_host_fuzzy_strict + ')';

    re.tpl_link_fuzzy =
        // Fuzzy link can't be prepended with .:/\- and non punctuation.
        // but can start with > (markdown blockquote)
        '(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|' + re.src_ZPCc + '))' +
        '((?![$+<=>^`|\uff5c])' + re.tpl_host_port_fuzzy_strict + re.src_path + ')';

    re.tpl_link_no_ip_fuzzy =
        // Fuzzy link can't be prepended with .:/\- and non punctuation.
        // but can start with > (markdown blockquote)
        '(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|' + re.src_ZPCc + '))' +
        '((?![$+<=>^`|\uff5c])' + re.tpl_host_port_no_ip_fuzzy_strict + re.src_path + ')';

    return re;
  };

  ////////////////////////////////////////////////////////////////////////////////
  // Helpers

  // Merge objects
  //
  function assign$2(obj /*from1, from2, from3, ...*/) {
    var sources = Array.prototype.slice.call(arguments, 1);

    sources.forEach(function (source) {
      if (!source) { return; }

      Object.keys(source).forEach(function (key) {
        obj[key] = source[key];
      });
    });

    return obj;
  }

  function _class(obj) { return Object.prototype.toString.call(obj); }
  function isString(obj) { return _class(obj) === '[object String]'; }
  function isObject$1(obj) { return _class(obj) === '[object Object]'; }
  function isRegExp(obj) { return _class(obj) === '[object RegExp]'; }
  function isFunction(obj) { return _class(obj) === '[object Function]'; }


  function escapeRE(str) { return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&'); }

  ////////////////////////////////////////////////////////////////////////////////


  var defaultOptions = {
    fuzzyLink: true,
    fuzzyEmail: true,
    fuzzyIP: false
  };


  function isOptionsObj(obj) {
    return Object.keys(obj || {}).reduce(function (acc, k) {
      return acc || defaultOptions.hasOwnProperty(k);
    }, false);
  }


  var defaultSchemas = {
    'http:': {
      validate: function (text, pos, self) {
        var tail = text.slice(pos);

        if (!self.re.http) {
          // compile lazily, because "host"-containing variables can change on tlds update.
          self.re.http =  new RegExp(
            '^\\/\\/' + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, 'i'
          );
        }
        if (self.re.http.test(tail)) {
          return tail.match(self.re.http)[0].length;
        }
        return 0;
      }
    },
    'https:':  'http:',
    'ftp:':    'http:',
    '//':      {
      validate: function (text, pos, self) {
        var tail = text.slice(pos);

        if (!self.re.no_http) {
        // compile lazily, because "host"-containing variables can change on tlds update.
          self.re.no_http =  new RegExp(
            '^' +
            self.re.src_auth +
            // Don't allow single-level domains, because of false positives like '//test'
            // with code comments
            '(?:localhost|(?:(?:' + self.re.src_domain + ')\\.)+' + self.re.src_domain_root + ')' +
            self.re.src_port +
            self.re.src_host_terminator +
            self.re.src_path,

            'i'
          );
        }

        if (self.re.no_http.test(tail)) {
          // should not be `://` & `///`, that protects from errors in protocol name
          if (pos >= 3 && text[pos - 3] === ':') { return 0; }
          if (pos >= 3 && text[pos - 3] === '/') { return 0; }
          return tail.match(self.re.no_http)[0].length;
        }
        return 0;
      }
    },
    'mailto:': {
      validate: function (text, pos, self) {
        var tail = text.slice(pos);

        if (!self.re.mailto) {
          self.re.mailto =  new RegExp(
            '^' + self.re.src_email_name + '@' + self.re.src_host_strict, 'i'
          );
        }
        if (self.re.mailto.test(tail)) {
          return tail.match(self.re.mailto)[0].length;
        }
        return 0;
      }
    }
  };

  /*eslint-disable max-len*/

  // RE pattern for 2-character tlds (autogenerated by ./support/tlds_2char_gen.js)
  var tlds_2ch_src_re = 'a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]';

  // DON'T try to make PRs with changes. Extend TLDs with LinkifyIt.tlds() instead
  var tlds_default = 'biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф'.split('|');

  /*eslint-enable max-len*/

  ////////////////////////////////////////////////////////////////////////////////

  function resetScanCache(self) {
    self.__index__ = -1;
    self.__text_cache__   = '';
  }

  function createValidator(re$$1) {
    return function (text, pos) {
      var tail = text.slice(pos);

      if (re$$1.test(tail)) {
        return tail.match(re$$1)[0].length;
      }
      return 0;
    };
  }

  function createNormalizer() {
    return function (match, self) {
      self.normalize(match);
    };
  }

  // Schemas compiler. Build regexps.
  //
  function compile(self) {

    // Load & clone RE patterns.
    var re$$1 = self.re = re(self.__opts__);

    // Define dynamic patterns
    var tlds = self.__tlds__.slice();

    self.onCompile();

    if (!self.__tlds_replaced__) {
      tlds.push(tlds_2ch_src_re);
    }
    tlds.push(re$$1.src_xn);

    re$$1.src_tlds = tlds.join('|');

    function untpl(tpl) { return tpl.replace('%TLDS%', re$$1.src_tlds); }

    re$$1.email_fuzzy      = RegExp(untpl(re$$1.tpl_email_fuzzy), 'i');
    re$$1.link_fuzzy       = RegExp(untpl(re$$1.tpl_link_fuzzy), 'i');
    re$$1.link_no_ip_fuzzy = RegExp(untpl(re$$1.tpl_link_no_ip_fuzzy), 'i');
    re$$1.host_fuzzy_test  = RegExp(untpl(re$$1.tpl_host_fuzzy_test), 'i');

    //
    // Compile each schema
    //

    var aliases = [];

    self.__compiled__ = {}; // Reset compiled data

    function schemaError(name, val) {
      throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val);
    }

    Object.keys(self.__schemas__).forEach(function (name) {
      var val = self.__schemas__[name];

      // skip disabled methods
      if (val === null) { return; }

      var compiled = { validate: null, link: null };

      self.__compiled__[name] = compiled;

      if (isObject$1(val)) {
        if (isRegExp(val.validate)) {
          compiled.validate = createValidator(val.validate);
        } else if (isFunction(val.validate)) {
          compiled.validate = val.validate;
        } else {
          schemaError(name, val);
        }

        if (isFunction(val.normalize)) {
          compiled.normalize = val.normalize;
        } else if (!val.normalize) {
          compiled.normalize = createNormalizer();
        } else {
          schemaError(name, val);
        }

        return;
      }

      if (isString(val)) {
        aliases.push(name);
        return;
      }

      schemaError(name, val);
    });

    //
    // Compile postponed aliases
    //

    aliases.forEach(function (alias) {
      if (!self.__compiled__[self.__schemas__[alias]]) {
        // Silently fail on missed schemas to avoid errons on disable.
        // schemaError(alias, self.__schemas__[alias]);
        return;
      }

      self.__compiled__[alias].validate =
        self.__compiled__[self.__schemas__[alias]].validate;
      self.__compiled__[alias].normalize =
        self.__compiled__[self.__schemas__[alias]].normalize;
    });

    //
    // Fake record for guessed links
    //
    self.__compiled__[''] = { validate: null, normalize: createNormalizer() };

    //
    // Build schema condition
    //
    var slist = Object.keys(self.__compiled__)
                        .filter(function (name) {
                          // Filter disabled & fake schemas
                          return name.length > 0 && self.__compiled__[name];
                        })
                        .map(escapeRE)
                        .join('|');
    // (?!_) cause 1.5x slowdown
    self.re.schema_test   = RegExp('(^|(?!_)(?:[><\uff5c]|' + re$$1.src_ZPCc + '))(' + slist + ')', 'i');
    self.re.schema_search = RegExp('(^|(?!_)(?:[><\uff5c]|' + re$$1.src_ZPCc + '))(' + slist + ')', 'ig');

    self.re.pretest = RegExp(
      '(' + self.re.schema_test.source + ')|(' + self.re.host_fuzzy_test.source + ')|@',
      'i'
    );

    //
    // Cleanup
    //

    resetScanCache(self);
  }

  /**
   * class Match
   *
   * Match result. Single element of array, returned by [[LinkifyIt#match]]
   **/
  function Match(self, shift) {
    var start = self.__index__,
        end   = self.__last_index__,
        text  = self.__text_cache__.slice(start, end);

    /**
     * Match#schema -> String
     *
     * Prefix (protocol) for matched string.
     **/
    this.schema    = self.__schema__.toLowerCase();
    /**
     * Match#index -> Number
     *
     * First position of matched string.
     **/
    this.index     = start + shift;
    /**
     * Match#lastIndex -> Number
     *
     * Next position after matched string.
     **/
    this.lastIndex = end + shift;
    /**
     * Match#raw -> String
     *
     * Matched string.
     **/
    this.raw       = text;
    /**
     * Match#text -> String
     *
     * Notmalized text of matched string.
     **/
    this.text      = text;
    /**
     * Match#url -> String
     *
     * Normalized url of matched string.
     **/
    this.url       = text;
  }

  function createMatch(self, shift) {
    var match = new Match(self, shift);

    self.__compiled__[match.schema].normalize(match, self);

    return match;
  }


  /**
   * class LinkifyIt
   **/

  /**
   * new LinkifyIt(schemas, options)
   * - schemas (Object): Optional. Additional schemas to validate (prefix/validator)
   * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
   *
   * Creates new linkifier instance with optional additional schemas.
   * Can be called without `new` keyword for convenience.
   *
   * By default understands:
   *
   * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
   * - "fuzzy" links and emails (example.com, foo@bar.com).
   *
   * `schemas` is an object, where each key/value describes protocol/rule:
   *
   * - __key__ - link prefix (usually, protocol name with `:` at the end, `skype:`
   *   for example). `linkify-it` makes shure that prefix is not preceeded with
   *   alphanumeric char and symbols. Only whitespaces and punctuation allowed.
   * - __value__ - rule to check tail after link prefix
   *   - _String_ - just alias to existing rule
   *   - _Object_
   *     - _validate_ - validator function (should return matched length on success),
   *       or `RegExp`.
   *     - _normalize_ - optional function to normalize text & url of matched result
   *       (for example, for @twitter mentions).
   *
   * `options`:
   *
   * - __fuzzyLink__ - recognige URL-s without `http(s):` prefix. Default `true`.
   * - __fuzzyIP__ - allow IPs in fuzzy links above. Can conflict with some texts
   *   like version numbers. Default `false`.
   * - __fuzzyEmail__ - recognize emails without `mailto:` prefix.
   *
   **/
  function LinkifyIt(schemas, options) {
    if (!(this instanceof LinkifyIt)) {
      return new LinkifyIt(schemas, options);
    }

    if (!options) {
      if (isOptionsObj(schemas)) {
        options = schemas;
        schemas = {};
      }
    }

    this.__opts__           = assign$2({}, defaultOptions, options);

    // Cache last tested result. Used to skip repeating steps on next `match` call.
    this.__index__          = -1;
    this.__last_index__     = -1; // Next scan position
    this.__schema__         = '';
    this.__text_cache__     = '';

    this.__schemas__        = assign$2({}, defaultSchemas, schemas);
    this.__compiled__       = {};

    this.__tlds__           = tlds_default;
    this.__tlds_replaced__  = false;

    this.re = {};

    compile(this);
  }


  /** chainable
   * LinkifyIt#add(schema, definition)
   * - schema (String): rule name (fixed pattern prefix)
   * - definition (String|RegExp|Object): schema definition
   *
   * Add new rule definition. See constructor description for details.
   **/
  LinkifyIt.prototype.add = function add(schema, definition) {
    this.__schemas__[schema] = definition;
    compile(this);
    return this;
  };


  /** chainable
   * LinkifyIt#set(options)
   * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
   *
   * Set recognition options for links without schema.
   **/
  LinkifyIt.prototype.set = function set(options) {
    this.__opts__ = assign$2(this.__opts__, options);
    return this;
  };


  /**
   * LinkifyIt#test(text) -> Boolean
   *
   * Searches linkifiable pattern and returns `true` on success or `false` on fail.
   **/
  LinkifyIt.prototype.test = function test(text) {
    // Reset scan cache
    this.__text_cache__ = text;
    this.__index__      = -1;

    if (!text.length) { return false; }

    var m, ml, me, len, shift, next, re$$1, tld_pos, at_pos;

    // try to scan for link with schema - that's the most simple rule
    if (this.re.schema_test.test(text)) {
      re$$1 = this.re.schema_search;
      re$$1.lastIndex = 0;
      while ((m = re$$1.exec(text)) !== null) {
        len = this.testSchemaAt(text, m[2], re$$1.lastIndex);
        if (len) {
          this.__schema__     = m[2];
          this.__index__      = m.index + m[1].length;
          this.__last_index__ = m.index + m[0].length + len;
          break;
        }
      }
    }

    if (this.__opts__.fuzzyLink && this.__compiled__['http:']) {
      // guess schemaless links
      tld_pos = text.search(this.re.host_fuzzy_test);
      if (tld_pos >= 0) {
        // if tld is located after found link - no need to check fuzzy pattern
        if (this.__index__ < 0 || tld_pos < this.__index__) {
          if ((ml = text.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null) {

            shift = ml.index + ml[1].length;

            if (this.__index__ < 0 || shift < this.__index__) {
              this.__schema__     = '';
              this.__index__      = shift;
              this.__last_index__ = ml.index + ml[0].length;
            }
          }
        }
      }
    }

    if (this.__opts__.fuzzyEmail && this.__compiled__['mailto:']) {
      // guess schemaless emails
      at_pos = text.indexOf('@');
      if (at_pos >= 0) {
        // We can't skip this check, because this cases are possible:
        // 192.168.1.1@gmail.com, my.in@example.com
        if ((me = text.match(this.re.email_fuzzy)) !== null) {

          shift = me.index + me[1].length;
          next  = me.index + me[0].length;

          if (this.__index__ < 0 || shift < this.__index__ ||
              (shift === this.__index__ && next > this.__last_index__)) {
            this.__schema__     = 'mailto:';
            this.__index__      = shift;
            this.__last_index__ = next;
          }
        }
      }
    }

    return this.__index__ >= 0;
  };


  /**
   * LinkifyIt#pretest(text) -> Boolean
   *
   * Very quick check, that can give false positives. Returns true if link MAY BE
   * can exists. Can be used for speed optimization, when you need to check that
   * link NOT exists.
   **/
  LinkifyIt.prototype.pretest = function pretest(text) {
    return this.re.pretest.test(text);
  };


  /**
   * LinkifyIt#testSchemaAt(text, name, position) -> Number
   * - text (String): text to scan
   * - name (String): rule (schema) name
   * - position (Number): text offset to check from
   *
   * Similar to [[LinkifyIt#test]] but checks only specific protocol tail exactly
   * at given position. Returns length of found pattern (0 on fail).
   **/
  LinkifyIt.prototype.testSchemaAt = function testSchemaAt(text, schema, pos) {
    // If not supported schema check requested - terminate
    if (!this.__compiled__[schema.toLowerCase()]) {
      return 0;
    }
    return this.__compiled__[schema.toLowerCase()].validate(text, pos, this);
  };


  /**
   * LinkifyIt#match(text) -> Array|null
   *
   * Returns array of found link descriptions or `null` on fail. We strongly
   * recommend to use [[LinkifyIt#test]] first, for best speed.
   *
   * ##### Result match description
   *
   * - __schema__ - link schema, can be empty for fuzzy links, or `//` for
   *   protocol-neutral  links.
   * - __index__ - offset of matched text
   * - __lastIndex__ - index of next char after mathch end
   * - __raw__ - matched text
   * - __text__ - normalized text
   * - __url__ - link, generated from matched text
   **/
  LinkifyIt.prototype.match = function match(text) {
    var shift = 0, result = [];

    // Try to take previous element from cache, if .test() called before
    if (this.__index__ >= 0 && this.__text_cache__ === text) {
      result.push(createMatch(this, shift));
      shift = this.__last_index__;
    }

    // Cut head if cache was used
    var tail = shift ? text.slice(shift) : text;

    // Scan string until end reached
    while (this.test(tail)) {
      result.push(createMatch(this, shift));

      tail = tail.slice(this.__last_index__);
      shift += this.__last_index__;
    }

    if (result.length) {
      return result;
    }

    return null;
  };


  /** chainable
   * LinkifyIt#tlds(list [, keepOld]) -> this
   * - list (Array): list of tlds
   * - keepOld (Boolean): merge with current list if `true` (`false` by default)
   *
   * Load (or merge) new tlds list. Those are user for fuzzy links (without prefix)
   * to avoid false positives. By default this algorythm used:
   *
   * - hostname with any 2-letter root zones are ok.
   * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
   *   are ok.
   * - encoded (`xn--...`) root zones are ok.
   *
   * If list is replaced, then exact match for 2-chars root zones will be checked.
   **/
  LinkifyIt.prototype.tlds = function tlds(list, keepOld) {
    list = Array.isArray(list) ? list : [ list ];

    if (!keepOld) {
      this.__tlds__ = list.slice();
      this.__tlds_replaced__ = true;
      compile(this);
      return this;
    }

    this.__tlds__ = this.__tlds__.concat(list)
                                    .sort()
                                    .filter(function (el, idx, arr) {
                                      return el !== arr[idx - 1];
                                    })
                                    .reverse();

    compile(this);
    return this;
  };

  /**
   * LinkifyIt#normalize(match)
   *
   * Default normalizer (if schema does not define it's own).
   **/
  LinkifyIt.prototype.normalize = function normalize(match) {

    // Do minimal possible changes by default. Need to collect feedback prior
    // to move forward https://github.com/markdown-it/linkify-it/issues/1

    if (!match.schema) { match.url = 'http://' + match.url; }

    if (match.schema === 'mailto:' && !/^mailto:/i.test(match.url)) {
      match.url = 'mailto:' + match.url;
    }
  };


  /**
   * LinkifyIt#onCompile()
   *
   * Override to modify basic RegExp-s.
   **/
  LinkifyIt.prototype.onCompile = function onCompile() {
  };


  var _linkifyIt_2_1_0_linkifyIt = LinkifyIt;

  /*! https://mths.be/punycode v1.4.1 by @mathias */


  /** Highest positive signed 32-bit float value */
  var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

  /** Bootstring parameters */
  var base = 36;
  var tMin = 1;
  var tMax = 26;
  var skew = 38;
  var damp = 700;
  var initialBias = 72;
  var initialN = 128; // 0x80
  var delimiter = '-'; // '\x2D'

  /** Regular expressions */
  var regexPunycode = /^xn--/;
  var regexNonASCII = /[^\x20-\x7E]/; // unprintable ASCII chars + non-ASCII chars
  var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

  /** Error messages */
  var errors = {
    'overflow': 'Overflow: input needs wider integers to process',
    'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
    'invalid-input': 'Invalid input'
  };

  /** Convenience shortcuts */
  var baseMinusTMin = base - tMin;
  var floor = Math.floor;
  var stringFromCharCode = String.fromCharCode;

  /*--------------------------------------------------------------------------*/

  /**
   * A generic error utility function.
   * @private
   * @param {String} type The error type.
   * @returns {Error} Throws a `RangeError` with the applicable error message.
   */
  function error(type) {
    throw new RangeError(errors[type]);
  }

  /**
   * A generic `Array#map` utility function.
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function that gets called for every array
   * item.
   * @returns {Array} A new array of values returned by the callback function.
   */
  function map$1(array, fn) {
    var length = array.length;
    var result = [];
    while (length--) {
      result[length] = fn(array[length]);
    }
    return result;
  }

  /**
   * A simple `Array#map`-like wrapper to work with domain name strings or email
   * addresses.
   * @private
   * @param {String} domain The domain name or email address.
   * @param {Function} callback The function that gets called for every
   * character.
   * @returns {Array} A new string of characters returned by the callback
   * function.
   */
  function mapDomain(string, fn) {
    var parts = string.split('@');
    var result = '';
    if (parts.length > 1) {
      // In email addresses, only the domain name should be punycoded. Leave
      // the local part (i.e. everything up to `@`) intact.
      result = parts[0] + '@';
      string = parts[1];
    }
    // Avoid `split(regex)` for IE8 compatibility. See #17.
    string = string.replace(regexSeparators, '\x2E');
    var labels = string.split('.');
    var encoded = map$1(labels, fn).join('.');
    return result + encoded;
  }

  /**
   * Creates an array containing the numeric code points of each Unicode
   * character in the string. While JavaScript uses UCS-2 internally,
   * this function will convert a pair of surrogate halves (each of which
   * UCS-2 exposes as separate characters) into a single code point,
   * matching UTF-16.
   * @see `punycode.ucs2.encode`
   * @see <https://mathiasbynens.be/notes/javascript-encoding>
   * @memberOf punycode.ucs2
   * @name decode
   * @param {String} string The Unicode input string (UCS-2).
   * @returns {Array} The new array of code points.
   */
  function ucs2decode(string) {
    var output = [],
      counter = 0,
      length = string.length,
      value,
      extra;
    while (counter < length) {
      value = string.charCodeAt(counter++);
      if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
        // high surrogate, and there is a next character
        extra = string.charCodeAt(counter++);
        if ((extra & 0xFC00) == 0xDC00) { // low surrogate
          output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
        } else {
          // unmatched surrogate; only append this code unit, in case the next
          // code unit is the high surrogate of a surrogate pair
          output.push(value);
          counter--;
        }
      } else {
        output.push(value);
      }
    }
    return output;
  }

  /**
   * Creates a string based on an array of numeric code points.
   * @see `punycode.ucs2.decode`
   * @memberOf punycode.ucs2
   * @name encode
   * @param {Array} codePoints The array of numeric code points.
   * @returns {String} The new Unicode string (UCS-2).
   */
  function ucs2encode(array) {
    return map$1(array, function(value) {
      var output = '';
      if (value > 0xFFFF) {
        value -= 0x10000;
        output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
        value = 0xDC00 | value & 0x3FF;
      }
      output += stringFromCharCode(value);
      return output;
    }).join('');
  }

  /**
   * Converts a basic code point into a digit/integer.
   * @see `digitToBasic()`
   * @private
   * @param {Number} codePoint The basic numeric code point value.
   * @returns {Number} The numeric value of a basic code point (for use in
   * representing integers) in the range `0` to `base - 1`, or `base` if
   * the code point does not represent a value.
   */
  function basicToDigit(codePoint) {
    if (codePoint - 48 < 10) {
      return codePoint - 22;
    }
    if (codePoint - 65 < 26) {
      return codePoint - 65;
    }
    if (codePoint - 97 < 26) {
      return codePoint - 97;
    }
    return base;
  }

  /**
   * Converts a digit/integer into a basic code point.
   * @see `basicToDigit()`
   * @private
   * @param {Number} digit The numeric value of a basic code point.
   * @returns {Number} The basic code point whose value (when used for
   * representing integers) is `digit`, which needs to be in the range
   * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
   * used; else, the lowercase form is used. The behavior is undefined
   * if `flag` is non-zero and `digit` has no uppercase form.
   */
  function digitToBasic(digit, flag) {
    //  0..25 map to ASCII a..z or A..Z
    // 26..35 map to ASCII 0..9
    return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
  }

  /**
   * Bias adaptation function as per section 3.4 of RFC 3492.
   * https://tools.ietf.org/html/rfc3492#section-3.4
   * @private
   */
  function adapt(delta, numPoints, firstTime) {
    var k = 0;
    delta = firstTime ? floor(delta / damp) : delta >> 1;
    delta += floor(delta / numPoints);
    for ( /* no initialization */ ; delta > baseMinusTMin * tMax >> 1; k += base) {
      delta = floor(delta / baseMinusTMin);
    }
    return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
  }

  /**
   * Converts a Punycode string of ASCII-only symbols to a string of Unicode
   * symbols.
   * @memberOf punycode
   * @param {String} input The Punycode string of ASCII-only symbols.
   * @returns {String} The resulting string of Unicode symbols.
   */
  function decode$2(input) {
    // Don't use UCS-2
    var output = [],
      inputLength = input.length,
      out,
      i = 0,
      n = initialN,
      bias = initialBias,
      basic,
      j,
      index,
      oldi,
      w,
      k,
      digit,
      t,
      /** Cached calculation results */
      baseMinusT;

    // Handle the basic code points: let `basic` be the number of input code
    // points before the last delimiter, or `0` if there is none, then copy
    // the first basic code points to the output.

    basic = input.lastIndexOf(delimiter);
    if (basic < 0) {
      basic = 0;
    }

    for (j = 0; j < basic; ++j) {
      // if it's not a basic code point
      if (input.charCodeAt(j) >= 0x80) {
        error('not-basic');
      }
      output.push(input.charCodeAt(j));
    }

    // Main decoding loop: start just after the last delimiter if any basic code
    // points were copied; start at the beginning otherwise.

    for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */ ) {

      // `index` is the index of the next character to be consumed.
      // Decode a generalized variable-length integer into `delta`,
      // which gets added to `i`. The overflow checking is easier
      // if we increase `i` as we go, then subtract off its starting
      // value at the end to obtain `delta`.
      for (oldi = i, w = 1, k = base; /* no condition */ ; k += base) {

        if (index >= inputLength) {
          error('invalid-input');
        }

        digit = basicToDigit(input.charCodeAt(index++));

        if (digit >= base || digit > floor((maxInt - i) / w)) {
          error('overflow');
        }

        i += digit * w;
        t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

        if (digit < t) {
          break;
        }

        baseMinusT = base - t;
        if (w > floor(maxInt / baseMinusT)) {
          error('overflow');
        }

        w *= baseMinusT;

      }

      out = output.length + 1;
      bias = adapt(i - oldi, out, oldi == 0);

      // `i` was supposed to wrap around from `out` to `0`,
      // incrementing `n` each time, so we'll fix that now:
      if (floor(i / out) > maxInt - n) {
        error('overflow');
      }

      n += floor(i / out);
      i %= out;

      // Insert `n` at position `i` of the output
      output.splice(i++, 0, n);

    }

    return ucs2encode(output);
  }

  /**
   * Converts a string of Unicode symbols (e.g. a domain name label) to a
   * Punycode string of ASCII-only symbols.
   * @memberOf punycode
   * @param {String} input The string of Unicode symbols.
   * @returns {String} The resulting Punycode string of ASCII-only symbols.
   */
  function encode$2(input) {
    var n,
      delta,
      handledCPCount,
      basicLength,
      bias,
      j,
      m,
      q,
      k,
      t,
      currentValue,
      output = [],
      /** `inputLength` will hold the number of code points in `input`. */
      inputLength,
      /** Cached calculation results */
      handledCPCountPlusOne,
      baseMinusT,
      qMinusT;

    // Convert the input in UCS-2 to Unicode
    input = ucs2decode(input);

    // Cache the length
    inputLength = input.length;

    // Initialize the state
    n = initialN;
    delta = 0;
    bias = initialBias;

    // Handle the basic code points
    for (j = 0; j < inputLength; ++j) {
      currentValue = input[j];
      if (currentValue < 0x80) {
        output.push(stringFromCharCode(currentValue));
      }
    }

    handledCPCount = basicLength = output.length;

    // `handledCPCount` is the number of code points that have been handled;
    // `basicLength` is the number of basic code points.

    // Finish the basic string - if it is not empty - with a delimiter
    if (basicLength) {
      output.push(delimiter);
    }

    // Main encoding loop:
    while (handledCPCount < inputLength) {

      // All non-basic code points < n have been handled already. Find the next
      // larger one:
      for (m = maxInt, j = 0; j < inputLength; ++j) {
        currentValue = input[j];
        if (currentValue >= n && currentValue < m) {
          m = currentValue;
        }
      }

      // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
      // but guard against overflow
      handledCPCountPlusOne = handledCPCount + 1;
      if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
        error('overflow');
      }

      delta += (m - n) * handledCPCountPlusOne;
      n = m;

      for (j = 0; j < inputLength; ++j) {
        currentValue = input[j];

        if (currentValue < n && ++delta > maxInt) {
          error('overflow');
        }

        if (currentValue == n) {
          // Represent delta as a generalized variable-length integer
          for (q = delta, k = base; /* no condition */ ; k += base) {
            t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
            if (q < t) {
              break;
            }
            qMinusT = q - t;
            baseMinusT = base - t;
            output.push(
              stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
            );
            q = floor(qMinusT / baseMinusT);
          }

          output.push(stringFromCharCode(digitToBasic(q, 0)));
          bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
          delta = 0;
          ++handledCPCount;
        }
      }

      ++delta;
      ++n;

    }
    return output.join('');
  }

  /**
   * Converts a Punycode string representing a domain name or an email address
   * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
   * it doesn't matter if you call it on a string that has already been
   * converted to Unicode.
   * @memberOf punycode
   * @param {String} input The Punycoded domain name or email address to
   * convert to Unicode.
   * @returns {String} The Unicode representation of the given Punycode
   * string.
   */
  function toUnicode(input) {
    return mapDomain(input, function(string) {
      return regexPunycode.test(string) ?
        decode$2(string.slice(4).toLowerCase()) :
        string;
    });
  }

  /**
   * Converts a Unicode string representing a domain name or an email address to
   * Punycode. Only the non-ASCII parts of the domain name will be converted,
   * i.e. it doesn't matter if you call it with a domain that's already in
   * ASCII.
   * @memberOf punycode
   * @param {String} input The domain name or email address to convert, as a
   * Unicode string.
   * @returns {String} The Punycode representation of the given domain name or
   * email address.
   */
  function toASCII(input) {
    return mapDomain(input, function(string) {
      return regexNonASCII.test(string) ?
        'xn--' + encode$2(string) :
        string;
    });
  }
  var version = '1.4.1';
  /**
   * An object of methods to convert from JavaScript's internal character
   * representation (UCS-2) to Unicode code points, and back.
   * @see <https://mathiasbynens.be/notes/javascript-encoding>
   * @memberOf punycode
   * @type Object
   */

  var ucs2 = {
    decode: ucs2decode,
    encode: ucs2encode
  };
  var punycode = {
    version: version,
    ucs2: ucs2,
    toASCII: toASCII,
    toUnicode: toUnicode,
    encode: encode$2,
    decode: decode$2
  };

  // markdown-it default options


  var _default = {
    options: {
      html:         false,        // Enable HTML tags in source
      xhtmlOut:     false,        // Use '/' to close single tags (<br />)
      breaks:       false,        // Convert '\n' in paragraphs into <br>
      langPrefix:   'language-',  // CSS language prefix for fenced blocks
      linkify:      false,        // autoconvert URL-like texts to links

      // Enable some language-neutral replacements + quotes beautification
      typographer:  false,

      // Double + single quotes replacement pairs, when typographer enabled,
      // and smartquotes on. Could be either a String or an Array.
      //
      // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
      // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
      quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

      // Highlighter function. Should return escaped HTML,
      // or '' if the source string is not changed and should be escaped externaly.
      // If result starts with <pre... internal wrapper is skipped.
      //
      // function (/*str, lang*/) { return ''; }
      //
      highlight: null,

      maxNesting:   100            // Internal protection, recursion limit
    },

    components: {

      core: {},
      block: {},
      inline: {}
    }
  };

  // "Zero" preset, with nothing enabled. Useful for manual configuring of simple


  var zero = {
    options: {
      html:         false,        // Enable HTML tags in source
      xhtmlOut:     false,        // Use '/' to close single tags (<br />)
      breaks:       false,        // Convert '\n' in paragraphs into <br>
      langPrefix:   'language-',  // CSS language prefix for fenced blocks
      linkify:      false,        // autoconvert URL-like texts to links

      // Enable some language-neutral replacements + quotes beautification
      typographer:  false,

      // Double + single quotes replacement pairs, when typographer enabled,
      // and smartquotes on. Could be either a String or an Array.
      //
      // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
      // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
      quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

      // Highlighter function. Should return escaped HTML,
      // or '' if the source string is not changed and should be escaped externaly.
      // If result starts with <pre... internal wrapper is skipped.
      //
      // function (/*str, lang*/) { return ''; }
      //
      highlight: null,

      maxNesting:   20            // Internal protection, recursion limit
    },

    components: {

      core: {
        rules: [
          'normalize',
          'block',
          'inline'
        ]
      },

      block: {
        rules: [
          'paragraph'
        ]
      },

      inline: {
        rules: [
          'text'
        ],
        rules2: [
          'balance_pairs',
          'text_collapse'
        ]
      }
    }
  };

  // Commonmark default options


  var commonmark = {
    options: {
      html:         true,         // Enable HTML tags in source
      xhtmlOut:     true,         // Use '/' to close single tags (<br />)
      breaks:       false,        // Convert '\n' in paragraphs into <br>
      langPrefix:   'language-',  // CSS language prefix for fenced blocks
      linkify:      false,        // autoconvert URL-like texts to links

      // Enable some language-neutral replacements + quotes beautification
      typographer:  false,

      // Double + single quotes replacement pairs, when typographer enabled,
      // and smartquotes on. Could be either a String or an Array.
      //
      // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
      // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
      quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

      // Highlighter function. Should return escaped HTML,
      // or '' if the source string is not changed and should be escaped externaly.
      // If result starts with <pre... internal wrapper is skipped.
      //
      // function (/*str, lang*/) { return ''; }
      //
      highlight: null,

      maxNesting:   20            // Internal protection, recursion limit
    },

    components: {

      core: {
        rules: [
          'normalize',
          'block',
          'inline'
        ]
      },

      block: {
        rules: [
          'blockquote',
          'code',
          'fence',
          'heading',
          'hr',
          'html_block',
          'lheading',
          'list',
          'reference',
          'paragraph'
        ]
      },

      inline: {
        rules: [
          'autolink',
          'backticks',
          'emphasis',
          'entity',
          'escape',
          'html_inline',
          'image',
          'link',
          'newline',
          'text'
        ],
        rules2: [
          'balance_pairs',
          'emphasis',
          'text_collapse'
        ]
      }
    }
  };

  var config = {
    'default': _default,
    zero: zero,
    commonmark: commonmark
  };

  ////////////////////////////////////////////////////////////////////////////////
  //
  // This validator can prohibit more than really needed to prevent XSS. It's a
  // tradeoff to keep code simple and to be secure by default.
  //
  // If you need different setup - override validator method as you wish. Or
  // replace it with dummy function and use external sanitizer.
  //

  var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
  var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;

  function validateLink(url) {
    // url should be normalized at this point, and existing entities are decoded
    var str = url.trim().toLowerCase();

    return BAD_PROTO_RE.test(str) ? (GOOD_DATA_RE.test(str) ? true : false) : true;
  }

  ////////////////////////////////////////////////////////////////////////////////


  var RECODE_HOSTNAME_FOR = [ 'http:', 'https:', 'mailto:' ];

  function normalizeLink(url) {
    var parsed = _mdurl_1_0_1_mdurl.parse(url, true);

    if (parsed.hostname) {
      // Encode hostnames in urls like:
      // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
      //
      // We don't encode unknown schemas, because it's likely that we encode
      // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
      //
      if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
        try {
          parsed.hostname = punycode.toASCII(parsed.hostname);
        } catch (er) { /**/ }
      }
    }

    return _mdurl_1_0_1_mdurl.encode(_mdurl_1_0_1_mdurl.format(parsed));
  }

  function normalizeLinkText(url) {
    var parsed = _mdurl_1_0_1_mdurl.parse(url, true);

    if (parsed.hostname) {
      // Encode hostnames in urls like:
      // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
      //
      // We don't encode unknown schemas, because it's likely that we encode
      // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
      //
      if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
        try {
          parsed.hostname = punycode.toUnicode(parsed.hostname);
        } catch (er) { /**/ }
      }
    }

    return _mdurl_1_0_1_mdurl.decode(_mdurl_1_0_1_mdurl.format(parsed));
  }


  /**
   * class MarkdownIt
   *
   * Main parser/renderer class.
   *
   * ##### Usage
   *
   * ```javascript
   * // node.js, "classic" way:
   * var MarkdownIt = require('markdown-it'),
   *     md = new MarkdownIt();
   * var result = md.render('# markdown-it rulezz!');
   *
   * // node.js, the same, but with sugar:
   * var md = require('markdown-it')();
   * var result = md.render('# markdown-it rulezz!');
   *
   * // browser without AMD, added to "window" on script load
   * // Note, there are no dash.
   * var md = window.markdownit();
   * var result = md.render('# markdown-it rulezz!');
   * ```
   *
   * Single line rendering, without paragraph wrap:
   *
   * ```javascript
   * var md = require('markdown-it')();
   * var result = md.renderInline('__markdown-it__ rulezz!');
   * ```
   **/

  /**
   * new MarkdownIt([presetName, options])
   * - presetName (String): optional, `commonmark` / `zero`
   * - options (Object)
   *
   * Creates parser instanse with given config. Can be called without `new`.
   *
   * ##### presetName
   *
   * MarkdownIt provides named presets as a convenience to quickly
   * enable/disable active syntax rules and options for common use cases.
   *
   * - ["commonmark"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.js) -
   *   configures parser to strict [CommonMark](http://commonmark.org/) mode.
   * - [default](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.js) -
   *   similar to GFM, used when no preset name given. Enables all available rules,
   *   but still without html, typographer & autolinker.
   * - ["zero"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.js) -
   *   all rules disabled. Useful to quickly setup your config via `.enable()`.
   *   For example, when you need only `bold` and `italic` markup and nothing else.
   *
   * ##### options:
   *
   * - __html__ - `false`. Set `true` to enable HTML tags in source. Be careful!
   *   That's not safe! You may need external sanitizer to protect output from XSS.
   *   It's better to extend features via plugins, instead of enabling HTML.
   * - __xhtmlOut__ - `false`. Set `true` to add '/' when closing single tags
   *   (`<br />`). This is needed only for full CommonMark compatibility. In real
   *   world you will need HTML output.
   * - __breaks__ - `false`. Set `true` to convert `\n` in paragraphs into `<br>`.
   * - __langPrefix__ - `language-`. CSS language class prefix for fenced blocks.
   *   Can be useful for external highlighters.
   * - __linkify__ - `false`. Set `true` to autoconvert URL-like text to links.
   * - __typographer__  - `false`. Set `true` to enable [some language-neutral
   *   replacement](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js) +
   *   quotes beautification (smartquotes).
   * - __quotes__ - `“”‘’`, String or Array. Double + single quotes replacement
   *   pairs, when typographer enabled and smartquotes on. For example, you can
   *   use `'«»„“'` for Russian, `'„“‚‘'` for German, and
   *   `['«\xA0', '\xA0»', '‹\xA0', '\xA0›']` for French (including nbsp).
   * - __highlight__ - `null`. Highlighter function for fenced code blocks.
   *   Highlighter `function (str, lang)` should return escaped HTML. It can also
   *   return empty string if the source was not changed and should be escaped
   *   externaly. If result starts with <pre... internal wrapper is skipped.
   *
   * ##### Example
   *
   * ```javascript
   * // commonmark mode
   * var md = require('markdown-it')('commonmark');
   *
   * // default mode
   * var md = require('markdown-it')();
   *
   * // enable everything
   * var md = require('markdown-it')({
   *   html: true,
   *   linkify: true,
   *   typographer: true
   * });
   * ```
   *
   * ##### Syntax highlighting
   *
   * ```js
   * var hljs = require('highlight.js') // https://highlightjs.org/
   *
   * var md = require('markdown-it')({
   *   highlight: function (str, lang) {
   *     if (lang && hljs.getLanguage(lang)) {
   *       try {
   *         return hljs.highlight(lang, str, true).value;
   *       } catch (__) {}
   *     }
   *
   *     return ''; // use external default escaping
   *   }
   * });
   * ```
   *
   * Or with full wrapper override (if you need assign class to `<pre>`):
   *
   * ```javascript
   * var hljs = require('highlight.js') // https://highlightjs.org/
   *
   * // Actual default values
   * var md = require('markdown-it')({
   *   highlight: function (str, lang) {
   *     if (lang && hljs.getLanguage(lang)) {
   *       try {
   *         return '<pre class="hljs"><code>' +
   *                hljs.highlight(lang, str, true).value +
   *                '</code></pre>';
   *       } catch (__) {}
   *     }
   *
   *     return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
   *   }
   * });
   * ```
   *
   **/
  function MarkdownIt(presetName, options) {
    if (!(this instanceof MarkdownIt)) {
      return new MarkdownIt(presetName, options);
    }

    if (!options) {
      if (!utils$1.isString(presetName)) {
        options = presetName || {};
        presetName = 'default';
      }
    }

    /**
     * MarkdownIt#inline -> ParserInline
     *
     * Instance of [[ParserInline]]. You may need it to add new rules when
     * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
     * [[MarkdownIt.enable]].
     **/
    this.inline = new parser_inline();

    /**
     * MarkdownIt#block -> ParserBlock
     *
     * Instance of [[ParserBlock]]. You may need it to add new rules when
     * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
     * [[MarkdownIt.enable]].
     **/
    this.block = new parser_block();

    /**
     * MarkdownIt#core -> Core
     *
     * Instance of [[Core]] chain executor. You may need it to add new rules when
     * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
     * [[MarkdownIt.enable]].
     **/
    this.core = new parser_core();

    /**
     * MarkdownIt#renderer -> Renderer
     *
     * Instance of [[Renderer]]. Use it to modify output look. Or to add rendering
     * rules for new token types, generated by plugins.
     *
     * ##### Example
     *
     * ```javascript
     * var md = require('markdown-it')();
     *
     * function myToken(tokens, idx, options, env, self) {
     *   //...
     *   return result;
     * };
     *
     * md.renderer.rules['my_token'] = myToken
     * ```
     *
     * See [[Renderer]] docs and [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js).
     **/
    this.renderer = new renderer();

    /**
     * MarkdownIt#linkify -> LinkifyIt
     *
     * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
     * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/linkify.js)
     * rule.
     **/
    this.linkify = new _linkifyIt_2_1_0_linkifyIt();

    /**
     * MarkdownIt#validateLink(url) -> Boolean
     *
     * Link validation function. CommonMark allows too much in links. By default
     * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
     * except some embedded image types.
     *
     * You can change this behaviour:
     *
     * ```javascript
     * var md = require('markdown-it')();
     * // enable everything
     * md.validateLink = function () { return true; }
     * ```
     **/
    this.validateLink = validateLink;

    /**
     * MarkdownIt#normalizeLink(url) -> String
     *
     * Function used to encode link url to a machine-readable format,
     * which includes url-encoding, punycode, etc.
     **/
    this.normalizeLink = normalizeLink;

    /**
     * MarkdownIt#normalizeLinkText(url) -> String
     *
     * Function used to decode link url to a human-readable format`
     **/
    this.normalizeLinkText = normalizeLinkText;


    // Expose utils & helpers for easy acces from plugins

    /**
     * MarkdownIt#utils -> utils
     *
     * Assorted utility functions, useful to write plugins. See details
     * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.js).
     **/
    this.utils = utils$1;

    /**
     * MarkdownIt#helpers -> helpers
     *
     * Link components parser functions, useful to write plugins. See details
     * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/helpers).
     **/
    this.helpers = utils$1.assign({}, helpers);


    this.options = {};
    this.configure(presetName);

    if (options) { this.set(options); }
  }


  /** chainable
   * MarkdownIt.set(options)
   *
   * Set parser options (in the same format as in constructor). Probably, you
   * will never need it, but you can change options after constructor call.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')()
   *             .set({ html: true, breaks: true })
   *             .set({ typographer, true });
   * ```
   *
   * __Note:__ To achieve the best possible performance, don't modify a
   * `markdown-it` instance options on the fly. If you need multiple configurations
   * it's best to create multiple instances and initialize each with separate
   * config.
   **/
  MarkdownIt.prototype.set = function (options) {
    utils$1.assign(this.options, options);
    return this;
  };


  /** chainable, internal
   * MarkdownIt.configure(presets)
   *
   * Batch load of all options and compenent settings. This is internal method,
   * and you probably will not need it. But if you with - see available presets
   * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/lib/presets)
   *
   * We strongly recommend to use presets instead of direct config loads. That
   * will give better compatibility with next versions.
   **/
  MarkdownIt.prototype.configure = function (presets) {
    var self = this, presetName;

    if (utils$1.isString(presets)) {
      presetName = presets;
      presets = config[presetName];
      if (!presets) { throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name'); }
    }

    if (!presets) { throw new Error('Wrong `markdown-it` preset, can\'t be empty'); }

    if (presets.options) { self.set(presets.options); }

    if (presets.components) {
      Object.keys(presets.components).forEach(function (name) {
        if (presets.components[name].rules) {
          self[name].ruler.enableOnly(presets.components[name].rules);
        }
        if (presets.components[name].rules2) {
          self[name].ruler2.enableOnly(presets.components[name].rules2);
        }
      });
    }
    return this;
  };


  /** chainable
   * MarkdownIt.enable(list, ignoreInvalid)
   * - list (String|Array): rule name or list of rule names to enable
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * Enable list or rules. It will automatically find appropriate components,
   * containing rules with given names. If rule not found, and `ignoreInvalid`
   * not set - throws exception.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')()
   *             .enable(['sub', 'sup'])
   *             .disable('smartquotes');
   * ```
   **/
  MarkdownIt.prototype.enable = function (list, ignoreInvalid) {
    var result = [];

    if (!Array.isArray(list)) { list = [ list ]; }

    [ 'core', 'block', 'inline' ].forEach(function (chain) {
      result = result.concat(this[chain].ruler.enable(list, true));
    }, this);

    result = result.concat(this.inline.ruler2.enable(list, true));

    var missed = list.filter(function (name) { return result.indexOf(name) < 0; });

    if (missed.length && !ignoreInvalid) {
      throw new Error('MarkdownIt. Failed to enable unknown rule(s): ' + missed);
    }

    return this;
  };


  /** chainable
   * MarkdownIt.disable(list, ignoreInvalid)
   * - list (String|Array): rule name or list of rule names to disable.
   * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
   *
   * The same as [[MarkdownIt.enable]], but turn specified rules off.
   **/
  MarkdownIt.prototype.disable = function (list, ignoreInvalid) {
    var result = [];

    if (!Array.isArray(list)) { list = [ list ]; }

    [ 'core', 'block', 'inline' ].forEach(function (chain) {
      result = result.concat(this[chain].ruler.disable(list, true));
    }, this);

    result = result.concat(this.inline.ruler2.disable(list, true));

    var missed = list.filter(function (name) { return result.indexOf(name) < 0; });

    if (missed.length && !ignoreInvalid) {
      throw new Error('MarkdownIt. Failed to disable unknown rule(s): ' + missed);
    }
    return this;
  };


  /** chainable
   * MarkdownIt.use(plugin, params)
   *
   * Load specified plugin with given params into current parser instance.
   * It's just a sugar to call `plugin(md, params)` with curring.
   *
   * ##### Example
   *
   * ```javascript
   * var iterator = require('markdown-it-for-inline');
   * var md = require('markdown-it')()
   *             .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
   *               tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
   *             });
   * ```
   **/
  MarkdownIt.prototype.use = function (plugin /*, params, ... */) {
    var args = [ this ].concat(Array.prototype.slice.call(arguments, 1));
    plugin.apply(plugin, args);
    return this;
  };


  /** internal
   * MarkdownIt.parse(src, env) -> Array
   * - src (String): source string
   * - env (Object): environment sandbox
   *
   * Parse input string and returns list of block tokens (special token type
   * "inline" will contain list of inline tokens). You should not call this
   * method directly, until you write custom renderer (for example, to produce
   * AST).
   *
   * `env` is used to pass data between "distributed" rules and return additional
   * metadata like reference info, needed for the renderer. It also can be used to
   * inject data in specific cases. Usually, you will be ok to pass `{}`,
   * and then pass updated object to renderer.
   **/
  MarkdownIt.prototype.parse = function (src, env) {
    if (typeof src !== 'string') {
      throw new Error('Input data should be a String');
    }

    var state = new this.core.State(src, this, env);

    this.core.process(state);

    return state.tokens;
  };


  /**
   * MarkdownIt.render(src [, env]) -> String
   * - src (String): source string
   * - env (Object): environment sandbox
   *
   * Render markdown string into html. It does all magic for you :).
   *
   * `env` can be used to inject additional metadata (`{}` by default).
   * But you will not need it with high probability. See also comment
   * in [[MarkdownIt.parse]].
   **/
  MarkdownIt.prototype.render = function (src, env) {
    env = env || {};

    return this.renderer.render(this.parse(src, env), this.options, env);
  };


  /** internal
   * MarkdownIt.parseInline(src, env) -> Array
   * - src (String): source string
   * - env (Object): environment sandbox
   *
   * The same as [[MarkdownIt.parse]] but skip all block rules. It returns the
   * block tokens list with the single `inline` element, containing parsed inline
   * tokens in `children` property. Also updates `env` object.
   **/
  MarkdownIt.prototype.parseInline = function (src, env) {
    var state = new this.core.State(src, this, env);

    state.inlineMode = true;
    this.core.process(state);

    return state.tokens;
  };


  /**
   * MarkdownIt.renderInline(src [, env]) -> String
   * - src (String): source string
   * - env (Object): environment sandbox
   *
   * Similar to [[MarkdownIt.render]] but for single paragraph content. Result
   * will NOT be wrapped into `<p>` tags.
   **/
  MarkdownIt.prototype.renderInline = function (src, env) {
    env = env || {};

    return this.renderer.render(this.parseInline(src, env), this.options, env);
  };


  var lib = MarkdownIt;

  var _markdownIt_8_4_2_markdownIt = lib;

  var emojies_defs = {
    "100": "💯",
    "1234": "🔢",
    "grinning": "😀",
    "smiley": "😃",
    "smile": "😄",
    "grin": "😁",
    "laughing": "😆",
    "satisfied": "😆",
    "sweat_smile": "😅",
    "joy": "😂",
    "rofl": "🤣",
    "relaxed": "☺️",
    "blush": "😊",
    "innocent": "😇",
    "slightly_smiling_face": "🙂",
    "upside_down_face": "🙃",
    "wink": "😉",
    "relieved": "😌",
    "heart_eyes": "😍",
    "kissing_heart": "😘",
    "kissing": "😗",
    "kissing_smiling_eyes": "😙",
    "kissing_closed_eyes": "😚",
    "yum": "😋",
    "stuck_out_tongue_winking_eye": "😜",
    "stuck_out_tongue_closed_eyes": "😝",
    "stuck_out_tongue": "😛",
    "money_mouth_face": "🤑",
    "hugs": "🤗",
    "nerd_face": "🤓",
    "sunglasses": "😎",
    "clown_face": "🤡",
    "cowboy_hat_face": "🤠",
    "smirk": "😏",
    "unamused": "😒",
    "disappointed": "😞",
    "pensive": "😔",
    "worried": "😟",
    "confused": "😕",
    "slightly_frowning_face": "🙁",
    "frowning_face": "☹️",
    "persevere": "😣",
    "confounded": "😖",
    "tired_face": "😫",
    "weary": "😩",
    "triumph": "😤",
    "angry": "😠",
    "rage": "😡",
    "pout": "😡",
    "no_mouth": "😶",
    "neutral_face": "😐",
    "expressionless": "😑",
    "hushed": "😯",
    "frowning": "😦",
    "anguished": "😧",
    "open_mouth": "😮",
    "astonished": "😲",
    "dizzy_face": "😵",
    "flushed": "😳",
    "scream": "😱",
    "fearful": "😨",
    "cold_sweat": "😰",
    "cry": "😢",
    "disappointed_relieved": "😥",
    "drooling_face": "🤤",
    "sob": "😭",
    "sweat": "😓",
    "sleepy": "😪",
    "sleeping": "😴",
    "roll_eyes": "🙄",
    "thinking": "🤔",
    "lying_face": "🤥",
    "grimacing": "😬",
    "zipper_mouth_face": "🤐",
    "nauseated_face": "🤢",
    "sneezing_face": "🤧",
    "mask": "😷",
    "face_with_thermometer": "🤒",
    "face_with_head_bandage": "🤕",
    "smiling_imp": "😈",
    "imp": "👿",
    "japanese_ogre": "👹",
    "japanese_goblin": "👺",
    "hankey": "💩",
    "poop": "💩",
    "shit": "💩",
    "ghost": "👻",
    "skull": "💀",
    "skull_and_crossbones": "☠️",
    "alien": "👽",
    "space_invader": "👾",
    "robot": "🤖",
    "jack_o_lantern": "🎃",
    "smiley_cat": "😺",
    "smile_cat": "😸",
    "joy_cat": "😹",
    "heart_eyes_cat": "😻",
    "smirk_cat": "😼",
    "kissing_cat": "😽",
    "scream_cat": "🙀",
    "crying_cat_face": "😿",
    "pouting_cat": "😾",
    "open_hands": "👐",
    "raised_hands": "🙌",
    "clap": "👏",
    "pray": "🙏",
    "handshake": "🤝",
    "+1": "👍",
    "thumbsup": "👍",
    "-1": "👎",
    "thumbsdown": "👎",
    "fist_oncoming": "👊",
    "facepunch": "👊",
    "punch": "👊",
    "fist_raised": "✊",
    "fist": "✊",
    "fist_left": "🤛",
    "fist_right": "🤜",
    "crossed_fingers": "🤞",
    "v": "✌️",
    "metal": "🤘",
    "ok_hand": "👌",
    "point_left": "👈",
    "point_right": "👉",
    "point_up_2": "👆",
    "point_down": "👇",
    "point_up": "☝️",
    "hand": "✋",
    "raised_hand": "✋",
    "raised_back_of_hand": "🤚",
    "raised_hand_with_fingers_splayed": "🖐",
    "vulcan_salute": "🖖",
    "wave": "👋",
    "call_me_hand": "🤙",
    "muscle": "💪",
    "middle_finger": "🖕",
    "fu": "🖕",
    "writing_hand": "✍️",
    "selfie": "🤳",
    "nail_care": "💅",
    "ring": "💍",
    "lipstick": "💄",
    "kiss": "💋",
    "lips": "👄",
    "tongue": "👅",
    "ear": "👂",
    "nose": "👃",
    "footprints": "👣",
    "eye": "👁",
    "eyes": "👀",
    "speaking_head": "🗣",
    "bust_in_silhouette": "👤",
    "busts_in_silhouette": "👥",
    "baby": "👶",
    "boy": "👦",
    "girl": "👧",
    "man": "👨",
    "woman": "👩",
    "blonde_woman": "👱‍♀",
    "blonde_man": "👱",
    "person_with_blond_hair": "👱",
    "older_man": "👴",
    "older_woman": "👵",
    "man_with_gua_pi_mao": "👲",
    "woman_with_turban": "👳‍♀",
    "man_with_turban": "👳",
    "policewoman": "👮‍♀",
    "policeman": "👮",
    "cop": "👮",
    "construction_worker_woman": "👷‍♀",
    "construction_worker_man": "👷",
    "construction_worker": "👷",
    "guardswoman": "💂‍♀",
    "guardsman": "💂",
    "female_detective": "🕵️‍♀️",
    "male_detective": "🕵",
    "detective": "🕵",
    "woman_health_worker": "👩‍⚕",
    "man_health_worker": "👨‍⚕",
    "woman_farmer": "👩‍🌾",
    "man_farmer": "👨‍🌾",
    "woman_cook": "👩‍🍳",
    "man_cook": "👨‍🍳",
    "woman_student": "👩‍🎓",
    "man_student": "👨‍🎓",
    "woman_singer": "👩‍🎤",
    "man_singer": "👨‍🎤",
    "woman_teacher": "👩‍🏫",
    "man_teacher": "👨‍🏫",
    "woman_factory_worker": "👩‍🏭",
    "man_factory_worker": "👨‍🏭",
    "woman_technologist": "👩‍💻",
    "man_technologist": "👨‍💻",
    "woman_office_worker": "👩‍💼",
    "man_office_worker": "👨‍💼",
    "woman_mechanic": "👩‍🔧",
    "man_mechanic": "👨‍🔧",
    "woman_scientist": "👩‍🔬",
    "man_scientist": "👨‍🔬",
    "woman_artist": "👩‍🎨",
    "man_artist": "👨‍🎨",
    "woman_firefighter": "👩‍🚒",
    "man_firefighter": "👨‍🚒",
    "woman_pilot": "👩‍✈",
    "man_pilot": "👨‍✈",
    "woman_astronaut": "👩‍🚀",
    "man_astronaut": "👨‍🚀",
    "woman_judge": "👩‍⚖",
    "man_judge": "👨‍⚖",
    "mrs_claus": "🤶",
    "santa": "🎅",
    "princess": "👸",
    "prince": "🤴",
    "bride_with_veil": "👰",
    "man_in_tuxedo": "🤵",
    "angel": "👼",
    "pregnant_woman": "🤰",
    "bowing_woman": "🙇‍♀",
    "bowing_man": "🙇",
    "bow": "🙇",
    "tipping_hand_woman": "💁",
    "information_desk_person": "💁",
    "sassy_woman": "💁",
    "tipping_hand_man": "💁‍♂",
    "sassy_man": "💁‍♂",
    "no_good_woman": "🙅",
    "no_good": "🙅",
    "ng_woman": "🙅",
    "no_good_man": "🙅‍♂",
    "ng_man": "🙅‍♂",
    "ok_woman": "🙆",
    "ok_man": "🙆‍♂",
    "raising_hand_woman": "🙋",
    "raising_hand": "🙋",
    "raising_hand_man": "🙋‍♂",
    "woman_facepalming": "🤦‍♀",
    "man_facepalming": "🤦‍♂",
    "woman_shrugging": "🤷‍♀",
    "man_shrugging": "🤷‍♂",
    "pouting_woman": "🙎",
    "person_with_pouting_face": "🙎",
    "pouting_man": "🙎‍♂",
    "frowning_woman": "🙍",
    "person_frowning": "🙍",
    "frowning_man": "🙍‍♂",
    "haircut_woman": "💇",
    "haircut": "💇",
    "haircut_man": "💇‍♂",
    "massage_woman": "💆",
    "massage": "💆",
    "massage_man": "💆‍♂",
    "business_suit_levitating": "🕴",
    "dancer": "💃",
    "man_dancing": "🕺",
    "dancing_women": "👯",
    "dancers": "👯",
    "dancing_men": "👯‍♂",
    "walking_woman": "🚶‍♀",
    "walking_man": "🚶",
    "walking": "🚶",
    "running_woman": "🏃‍♀",
    "running_man": "🏃",
    "runner": "🏃",
    "running": "🏃",
    "couple": "👫",
    "two_women_holding_hands": "👭",
    "two_men_holding_hands": "👬",
    "couple_with_heart_woman_man": "💑",
    "couple_with_heart": "💑",
    "couple_with_heart_woman_woman": "👩‍❤️‍👩",
    "couple_with_heart_man_man": "👨‍❤️‍👨",
    "couplekiss_man_woman": "💏",
    "couplekiss_woman_woman": "👩‍❤️‍💋‍👩",
    "couplekiss_man_man": "👨‍❤️‍💋‍👨",
    "family_man_woman_boy": "👪",
    "family": "👪",
    "family_man_woman_girl": "👨‍👩‍👧",
    "family_man_woman_girl_boy": "👨‍👩‍👧‍👦",
    "family_man_woman_boy_boy": "👨‍👩‍👦‍👦",
    "family_man_woman_girl_girl": "👨‍👩‍👧‍👧",
    "family_woman_woman_boy": "👩‍👩‍👦",
    "family_woman_woman_girl": "👩‍👩‍👧",
    "family_woman_woman_girl_boy": "👩‍👩‍👧‍👦",
    "family_woman_woman_boy_boy": "👩‍👩‍👦‍👦",
    "family_woman_woman_girl_girl": "👩‍👩‍👧‍👧",
    "family_man_man_boy": "👨‍👨‍👦",
    "family_man_man_girl": "👨‍👨‍👧",
    "family_man_man_girl_boy": "👨‍👨‍👧‍👦",
    "family_man_man_boy_boy": "👨‍👨‍👦‍👦",
    "family_man_man_girl_girl": "👨‍👨‍👧‍👧",
    "family_woman_boy": "👩‍👦",
    "family_woman_girl": "👩‍👧",
    "family_woman_girl_boy": "👩‍👧‍👦",
    "family_woman_boy_boy": "👩‍👦‍👦",
    "family_woman_girl_girl": "👩‍👧‍👧",
    "family_man_boy": "👨‍👦",
    "family_man_girl": "👨‍👧",
    "family_man_girl_boy": "👨‍👧‍👦",
    "family_man_boy_boy": "👨‍👦‍👦",
    "family_man_girl_girl": "👨‍👧‍👧",
    "womans_clothes": "👚",
    "shirt": "👕",
    "tshirt": "👕",
    "jeans": "👖",
    "necktie": "👔",
    "dress": "👗",
    "bikini": "👙",
    "kimono": "👘",
    "high_heel": "👠",
    "sandal": "👡",
    "boot": "👢",
    "mans_shoe": "👞",
    "shoe": "👞",
    "athletic_shoe": "👟",
    "womans_hat": "👒",
    "tophat": "🎩",
    "mortar_board": "🎓",
    "crown": "👑",
    "rescue_worker_helmet": "⛑",
    "school_satchel": "🎒",
    "pouch": "👝",
    "purse": "👛",
    "handbag": "👜",
    "briefcase": "💼",
    "eyeglasses": "👓",
    "dark_sunglasses": "🕶",
    "closed_umbrella": "🌂",
    "open_umbrella": "☂️",
    "dog": "🐶",
    "cat": "🐱",
    "mouse": "🐭",
    "hamster": "🐹",
    "rabbit": "🐰",
    "fox_face": "🦊",
    "bear": "🐻",
    "panda_face": "🐼",
    "koala": "🐨",
    "tiger": "🐯",
    "lion": "🦁",
    "cow": "🐮",
    "pig": "🐷",
    "pig_nose": "🐽",
    "frog": "🐸",
    "monkey_face": "🐵",
    "see_no_evil": "🙈",
    "hear_no_evil": "🙉",
    "speak_no_evil": "🙊",
    "monkey": "🐒",
    "chicken": "🐔",
    "penguin": "🐧",
    "bird": "🐦",
    "baby_chick": "🐤",
    "hatching_chick": "🐣",
    "hatched_chick": "🐥",
    "duck": "🦆",
    "eagle": "🦅",
    "owl": "🦉",
    "bat": "🦇",
    "wolf": "🐺",
    "boar": "🐗",
    "horse": "🐴",
    "unicorn": "🦄",
    "bee": "🐝",
    "honeybee": "🐝",
    "bug": "🐛",
    "butterfly": "🦋",
    "snail": "🐌",
    "shell": "🐚",
    "beetle": "🐞",
    "ant": "🐜",
    "spider": "🕷",
    "spider_web": "🕸",
    "turtle": "🐢",
    "snake": "🐍",
    "lizard": "🦎",
    "scorpion": "🦂",
    "crab": "🦀",
    "squid": "🦑",
    "octopus": "🐙",
    "shrimp": "🦐",
    "tropical_fish": "🐠",
    "fish": "🐟",
    "blowfish": "🐡",
    "dolphin": "🐬",
    "flipper": "🐬",
    "shark": "🦈",
    "whale": "🐳",
    "whale2": "🐋",
    "crocodile": "🐊",
    "leopard": "🐆",
    "tiger2": "🐅",
    "water_buffalo": "🐃",
    "ox": "🐂",
    "cow2": "🐄",
    "deer": "🦌",
    "dromedary_camel": "🐪",
    "camel": "🐫",
    "elephant": "🐘",
    "rhinoceros": "🦏",
    "gorilla": "🦍",
    "racehorse": "🐎",
    "pig2": "🐖",
    "goat": "🐐",
    "ram": "🐏",
    "sheep": "🐑",
    "dog2": "🐕",
    "poodle": "🐩",
    "cat2": "🐈",
    "rooster": "🐓",
    "turkey": "🦃",
    "dove": "🕊",
    "rabbit2": "🐇",
    "mouse2": "🐁",
    "rat": "🐀",
    "chipmunk": "🐿",
    "feet": "🐾",
    "paw_prints": "🐾",
    "dragon": "🐉",
    "dragon_face": "🐲",
    "cactus": "🌵",
    "christmas_tree": "🎄",
    "evergreen_tree": "🌲",
    "deciduous_tree": "🌳",
    "palm_tree": "🌴",
    "seedling": "🌱",
    "herb": "🌿",
    "shamrock": "☘️",
    "four_leaf_clover": "🍀",
    "bamboo": "🎍",
    "tanabata_tree": "🎋",
    "leaves": "🍃",
    "fallen_leaf": "🍂",
    "maple_leaf": "🍁",
    "mushroom": "🍄",
    "ear_of_rice": "🌾",
    "bouquet": "💐",
    "tulip": "🌷",
    "rose": "🌹",
    "wilted_flower": "🥀",
    "sunflower": "🌻",
    "blossom": "🌼",
    "cherry_blossom": "🌸",
    "hibiscus": "🌺",
    "earth_americas": "🌎",
    "earth_africa": "🌍",
    "earth_asia": "🌏",
    "full_moon": "🌕",
    "waning_gibbous_moon": "🌖",
    "last_quarter_moon": "🌗",
    "waning_crescent_moon": "🌘",
    "new_moon": "🌑",
    "waxing_crescent_moon": "🌒",
    "first_quarter_moon": "🌓",
    "moon": "🌔",
    "waxing_gibbous_moon": "🌔",
    "new_moon_with_face": "🌚",
    "full_moon_with_face": "🌝",
    "sun_with_face": "🌞",
    "first_quarter_moon_with_face": "🌛",
    "last_quarter_moon_with_face": "🌜",
    "crescent_moon": "🌙",
    "dizzy": "💫",
    "star": "⭐️",
    "star2": "🌟",
    "sparkles": "✨",
    "zap": "⚡️",
    "fire": "🔥",
    "boom": "💥",
    "collision": "💥",
    "comet": "☄",
    "sunny": "☀️",
    "sun_behind_small_cloud": "🌤",
    "partly_sunny": "⛅️",
    "sun_behind_large_cloud": "🌥",
    "sun_behind_rain_cloud": "🌦",
    "rainbow": "🌈",
    "cloud": "☁️",
    "cloud_with_rain": "🌧",
    "cloud_with_lightning_and_rain": "⛈",
    "cloud_with_lightning": "🌩",
    "cloud_with_snow": "🌨",
    "snowman_with_snow": "☃️",
    "snowman": "⛄️",
    "snowflake": "❄️",
    "wind_face": "🌬",
    "dash": "💨",
    "tornado": "🌪",
    "fog": "🌫",
    "ocean": "🌊",
    "droplet": "💧",
    "sweat_drops": "💦",
    "umbrella": "☔️",
    "green_apple": "🍏",
    "apple": "🍎",
    "pear": "🍐",
    "tangerine": "🍊",
    "orange": "🍊",
    "mandarin": "🍊",
    "lemon": "🍋",
    "banana": "🍌",
    "watermelon": "🍉",
    "grapes": "🍇",
    "strawberry": "🍓",
    "melon": "🍈",
    "cherries": "🍒",
    "peach": "🍑",
    "pineapple": "🍍",
    "kiwi_fruit": "🥝",
    "avocado": "🥑",
    "tomato": "🍅",
    "eggplant": "🍆",
    "cucumber": "🥒",
    "carrot": "🥕",
    "corn": "🌽",
    "hot_pepper": "🌶",
    "potato": "🥔",
    "sweet_potato": "🍠",
    "chestnut": "🌰",
    "peanuts": "🥜",
    "honey_pot": "🍯",
    "croissant": "🥐",
    "bread": "🍞",
    "baguette_bread": "🥖",
    "cheese": "🧀",
    "egg": "🥚",
    "fried_egg": "🍳",
    "bacon": "🥓",
    "pancakes": "🥞",
    "fried_shrimp": "🍤",
    "poultry_leg": "🍗",
    "meat_on_bone": "🍖",
    "pizza": "🍕",
    "hotdog": "🌭",
    "hamburger": "🍔",
    "fries": "🍟",
    "stuffed_flatbread": "🥙",
    "taco": "🌮",
    "burrito": "🌯",
    "green_salad": "🥗",
    "shallow_pan_of_food": "🥘",
    "spaghetti": "🍝",
    "ramen": "🍜",
    "stew": "🍲",
    "fish_cake": "🍥",
    "sushi": "🍣",
    "bento": "🍱",
    "curry": "🍛",
    "rice": "🍚",
    "rice_ball": "🍙",
    "rice_cracker": "🍘",
    "oden": "🍢",
    "dango": "🍡",
    "shaved_ice": "🍧",
    "ice_cream": "🍨",
    "icecream": "🍦",
    "cake": "🍰",
    "birthday": "🎂",
    "custard": "🍮",
    "lollipop": "🍭",
    "candy": "🍬",
    "chocolate_bar": "🍫",
    "popcorn": "🍿",
    "doughnut": "🍩",
    "cookie": "🍪",
    "milk_glass": "🥛",
    "baby_bottle": "🍼",
    "coffee": "☕️",
    "tea": "🍵",
    "sake": "🍶",
    "beer": "🍺",
    "beers": "🍻",
    "clinking_glasses": "🥂",
    "wine_glass": "🍷",
    "tumbler_glass": "🥃",
    "cocktail": "🍸",
    "tropical_drink": "🍹",
    "champagne": "🍾",
    "spoon": "🥄",
    "fork_and_knife": "🍴",
    "plate_with_cutlery": "🍽",
    "soccer": "⚽️",
    "basketball": "🏀",
    "football": "🏈",
    "baseball": "⚾️",
    "tennis": "🎾",
    "volleyball": "🏐",
    "rugby_football": "🏉",
    "8ball": "🎱",
    "ping_pong": "🏓",
    "badminton": "🏸",
    "goal_net": "🥅",
    "ice_hockey": "🏒",
    "field_hockey": "🏑",
    "cricket": "🏏",
    "golf": "⛳️",
    "bow_and_arrow": "🏹",
    "fishing_pole_and_fish": "🎣",
    "boxing_glove": "🥊",
    "martial_arts_uniform": "🥋",
    "ice_skate": "⛸",
    "ski": "🎿",
    "skier": "⛷",
    "snowboarder": "🏂",
    "weight_lifting_woman": "🏋️‍♀️",
    "weight_lifting_man": "🏋",
    "person_fencing": "🤺",
    "women_wrestling": "🤼‍♀",
    "men_wrestling": "🤼‍♂",
    "woman_cartwheeling": "🤸‍♀",
    "man_cartwheeling": "🤸‍♂",
    "basketball_woman": "⛹️‍♀️",
    "basketball_man": "⛹",
    "woman_playing_handball": "🤾‍♀",
    "man_playing_handball": "🤾‍♂",
    "golfing_woman": "🏌️‍♀️",
    "golfing_man": "🏌",
    "surfing_woman": "🏄‍♀",
    "surfing_man": "🏄",
    "surfer": "🏄",
    "swimming_woman": "🏊‍♀",
    "swimming_man": "🏊",
    "swimmer": "🏊",
    "woman_playing_water_polo": "🤽‍♀",
    "man_playing_water_polo": "🤽‍♂",
    "rowing_woman": "🚣‍♀",
    "rowing_man": "🚣",
    "rowboat": "🚣",
    "horse_racing": "🏇",
    "biking_woman": "🚴‍♀",
    "biking_man": "🚴",
    "bicyclist": "🚴",
    "mountain_biking_woman": "🚵‍♀",
    "mountain_biking_man": "🚵",
    "mountain_bicyclist": "🚵",
    "running_shirt_with_sash": "🎽",
    "medal_sports": "🏅",
    "medal_military": "🎖",
    "1st_place_medal": "🥇",
    "2nd_place_medal": "🥈",
    "3rd_place_medal": "🥉",
    "trophy": "🏆",
    "rosette": "🏵",
    "reminder_ribbon": "🎗",
    "ticket": "🎫",
    "tickets": "🎟",
    "circus_tent": "🎪",
    "woman_juggling": "🤹‍♀",
    "man_juggling": "🤹‍♂",
    "performing_arts": "🎭",
    "art": "🎨",
    "clapper": "🎬",
    "microphone": "🎤",
    "headphones": "🎧",
    "musical_score": "🎼",
    "musical_keyboard": "🎹",
    "drum": "🥁",
    "saxophone": "🎷",
    "trumpet": "🎺",
    "guitar": "🎸",
    "violin": "🎻",
    "game_die": "🎲",
    "dart": "🎯",
    "bowling": "🎳",
    "video_game": "🎮",
    "slot_machine": "🎰",
    "car": "🚗",
    "red_car": "🚗",
    "taxi": "🚕",
    "blue_car": "🚙",
    "bus": "🚌",
    "trolleybus": "🚎",
    "racing_car": "🏎",
    "police_car": "🚓",
    "ambulance": "🚑",
    "fire_engine": "🚒",
    "minibus": "🚐",
    "truck": "🚚",
    "articulated_lorry": "🚛",
    "tractor": "🚜",
    "kick_scooter": "🛴",
    "bike": "🚲",
    "motor_scooter": "🛵",
    "motorcycle": "🏍",
    "rotating_light": "🚨",
    "oncoming_police_car": "🚔",
    "oncoming_bus": "🚍",
    "oncoming_automobile": "🚘",
    "oncoming_taxi": "🚖",
    "aerial_tramway": "🚡",
    "mountain_cableway": "🚠",
    "suspension_railway": "🚟",
    "railway_car": "🚃",
    "train": "🚋",
    "mountain_railway": "🚞",
    "monorail": "🚝",
    "bullettrain_side": "🚄",
    "bullettrain_front": "🚅",
    "light_rail": "🚈",
    "steam_locomotive": "🚂",
    "train2": "🚆",
    "metro": "🚇",
    "tram": "🚊",
    "station": "🚉",
    "helicopter": "🚁",
    "small_airplane": "🛩",
    "airplane": "✈️",
    "flight_departure": "🛫",
    "flight_arrival": "🛬",
    "rocket": "🚀",
    "artificial_satellite": "🛰",
    "seat": "💺",
    "canoe": "🛶",
    "boat": "⛵️",
    "sailboat": "⛵️",
    "motor_boat": "🛥",
    "speedboat": "🚤",
    "passenger_ship": "🛳",
    "ferry": "⛴",
    "ship": "🚢",
    "anchor": "⚓️",
    "construction": "🚧",
    "fuelpump": "⛽️",
    "busstop": "🚏",
    "vertical_traffic_light": "🚦",
    "traffic_light": "🚥",
    "world_map": "🗺",
    "moyai": "🗿",
    "statue_of_liberty": "🗽",
    "fountain": "⛲️",
    "tokyo_tower": "🗼",
    "european_castle": "🏰",
    "japanese_castle": "🏯",
    "stadium": "🏟",
    "ferris_wheel": "🎡",
    "roller_coaster": "🎢",
    "carousel_horse": "🎠",
    "parasol_on_ground": "⛱",
    "beach_umbrella": "🏖",
    "desert_island": "🏝",
    "mountain": "⛰",
    "mountain_snow": "🏔",
    "mount_fuji": "🗻",
    "volcano": "🌋",
    "desert": "🏜",
    "camping": "🏕",
    "tent": "⛺️",
    "railway_track": "🛤",
    "motorway": "🛣",
    "building_construction": "🏗",
    "factory": "🏭",
    "house": "🏠",
    "house_with_garden": "🏡",
    "houses": "🏘",
    "derelict_house": "🏚",
    "office": "🏢",
    "department_store": "🏬",
    "post_office": "🏣",
    "european_post_office": "🏤",
    "hospital": "🏥",
    "bank": "🏦",
    "hotel": "🏨",
    "convenience_store": "🏪",
    "school": "🏫",
    "love_hotel": "🏩",
    "wedding": "💒",
    "classical_building": "🏛",
    "church": "⛪️",
    "mosque": "🕌",
    "synagogue": "🕍",
    "kaaba": "🕋",
    "shinto_shrine": "⛩",
    "japan": "🗾",
    "rice_scene": "🎑",
    "national_park": "🏞",
    "sunrise": "🌅",
    "sunrise_over_mountains": "🌄",
    "stars": "🌠",
    "sparkler": "🎇",
    "fireworks": "🎆",
    "city_sunrise": "🌇",
    "city_sunset": "🌆",
    "cityscape": "🏙",
    "night_with_stars": "🌃",
    "milky_way": "🌌",
    "bridge_at_night": "🌉",
    "foggy": "🌁",
    "watch": "⌚️",
    "iphone": "📱",
    "calling": "📲",
    "computer": "💻",
    "keyboard": "⌨️",
    "desktop_computer": "🖥",
    "printer": "🖨",
    "computer_mouse": "🖱",
    "trackball": "🖲",
    "joystick": "🕹",
    "clamp": "🗜",
    "minidisc": "💽",
    "floppy_disk": "💾",
    "cd": "💿",
    "dvd": "📀",
    "vhs": "📼",
    "camera": "📷",
    "camera_flash": "📸",
    "video_camera": "📹",
    "movie_camera": "🎥",
    "film_projector": "📽",
    "film_strip": "🎞",
    "telephone_receiver": "📞",
    "phone": "☎️",
    "telephone": "☎️",
    "pager": "📟",
    "fax": "📠",
    "tv": "📺",
    "radio": "📻",
    "studio_microphone": "🎙",
    "level_slider": "🎚",
    "control_knobs": "🎛",
    "stopwatch": "⏱",
    "timer_clock": "⏲",
    "alarm_clock": "⏰",
    "mantelpiece_clock": "🕰",
    "hourglass": "⌛️",
    "hourglass_flowing_sand": "⏳",
    "satellite": "📡",
    "battery": "🔋",
    "electric_plug": "🔌",
    "bulb": "💡",
    "flashlight": "🔦",
    "candle": "🕯",
    "wastebasket": "🗑",
    "oil_drum": "🛢",
    "money_with_wings": "💸",
    "dollar": "💵",
    "yen": "💴",
    "euro": "💶",
    "pound": "💷",
    "moneybag": "💰",
    "credit_card": "💳",
    "gem": "💎",
    "balance_scale": "⚖️",
    "wrench": "🔧",
    "hammer": "🔨",
    "hammer_and_pick": "⚒",
    "hammer_and_wrench": "🛠",
    "pick": "⛏",
    "nut_and_bolt": "🔩",
    "gear": "⚙️",
    "chains": "⛓",
    "gun": "🔫",
    "bomb": "💣",
    "hocho": "🔪",
    "knife": "🔪",
    "dagger": "🗡",
    "crossed_swords": "⚔️",
    "shield": "🛡",
    "smoking": "🚬",
    "coffin": "⚰️",
    "funeral_urn": "⚱️",
    "amphora": "🏺",
    "crystal_ball": "🔮",
    "prayer_beads": "📿",
    "barber": "💈",
    "alembic": "⚗️",
    "telescope": "🔭",
    "microscope": "🔬",
    "hole": "🕳",
    "pill": "💊",
    "syringe": "💉",
    "thermometer": "🌡",
    "toilet": "🚽",
    "potable_water": "🚰",
    "shower": "🚿",
    "bathtub": "🛁",
    "bath": "🛀",
    "bellhop_bell": "🛎",
    "key": "🔑",
    "old_key": "🗝",
    "door": "🚪",
    "couch_and_lamp": "🛋",
    "bed": "🛏",
    "sleeping_bed": "🛌",
    "framed_picture": "🖼",
    "shopping": "🛍",
    "shopping_cart": "🛒",
    "gift": "🎁",
    "balloon": "🎈",
    "flags": "🎏",
    "ribbon": "🎀",
    "confetti_ball": "🎊",
    "tada": "🎉",
    "dolls": "🎎",
    "izakaya_lantern": "🏮",
    "lantern": "🏮",
    "wind_chime": "🎐",
    "email": "✉️",
    "envelope": "✉️",
    "envelope_with_arrow": "📩",
    "incoming_envelope": "📨",
    "e-mail": "📧",
    "love_letter": "💌",
    "inbox_tray": "📥",
    "outbox_tray": "📤",
    "package": "📦",
    "label": "🏷",
    "mailbox_closed": "📪",
    "mailbox": "📫",
    "mailbox_with_mail": "📬",
    "mailbox_with_no_mail": "📭",
    "postbox": "📮",
    "postal_horn": "📯",
    "scroll": "📜",
    "page_with_curl": "📃",
    "page_facing_up": "📄",
    "bookmark_tabs": "📑",
    "bar_chart": "📊",
    "chart_with_upwards_trend": "📈",
    "chart_with_downwards_trend": "📉",
    "spiral_notepad": "🗒",
    "spiral_calendar": "🗓",
    "calendar": "📆",
    "date": "📅",
    "card_index": "📇",
    "card_file_box": "🗃",
    "ballot_box": "🗳",
    "file_cabinet": "🗄",
    "clipboard": "📋",
    "file_folder": "📁",
    "open_file_folder": "📂",
    "card_index_dividers": "🗂",
    "newspaper_roll": "🗞",
    "newspaper": "📰",
    "notebook": "📓",
    "notebook_with_decorative_cover": "📔",
    "ledger": "📒",
    "closed_book": "📕",
    "green_book": "📗",
    "blue_book": "📘",
    "orange_book": "📙",
    "books": "📚",
    "book": "📖",
    "open_book": "📖",
    "bookmark": "🔖",
    "link": "🔗",
    "paperclip": "📎",
    "paperclips": "🖇",
    "triangular_ruler": "📐",
    "straight_ruler": "📏",
    "pushpin": "📌",
    "round_pushpin": "📍",
    "scissors": "✂️",
    "pen": "🖊",
    "fountain_pen": "🖋",
    "black_nib": "✒️",
    "paintbrush": "🖌",
    "crayon": "🖍",
    "memo": "📝",
    "pencil": "📝",
    "pencil2": "✏️",
    "mag": "🔍",
    "mag_right": "🔎",
    "lock_with_ink_pen": "🔏",
    "closed_lock_with_key": "🔐",
    "lock": "🔒",
    "unlock": "🔓",
    "heart": "❤️",
    "yellow_heart": "💛",
    "green_heart": "💚",
    "blue_heart": "💙",
    "purple_heart": "💜",
    "black_heart": "🖤",
    "broken_heart": "💔",
    "heavy_heart_exclamation": "❣️",
    "two_hearts": "💕",
    "revolving_hearts": "💞",
    "heartbeat": "💓",
    "heartpulse": "💗",
    "sparkling_heart": "💖",
    "cupid": "💘",
    "gift_heart": "💝",
    "heart_decoration": "💟",
    "peace_symbol": "☮️",
    "latin_cross": "✝️",
    "star_and_crescent": "☪️",
    "om": "🕉",
    "wheel_of_dharma": "☸️",
    "star_of_david": "✡️",
    "six_pointed_star": "🔯",
    "menorah": "🕎",
    "yin_yang": "☯️",
    "orthodox_cross": "☦️",
    "place_of_worship": "🛐",
    "ophiuchus": "⛎",
    "aries": "♈️",
    "taurus": "♉️",
    "gemini": "♊️",
    "cancer": "♋️",
    "leo": "♌️",
    "virgo": "♍️",
    "libra": "♎️",
    "scorpius": "♏️",
    "sagittarius": "♐️",
    "capricorn": "♑️",
    "aquarius": "♒️",
    "pisces": "♓️",
    "id": "🆔",
    "atom_symbol": "⚛️",
    "accept": "🉑",
    "radioactive": "☢️",
    "biohazard": "☣️",
    "mobile_phone_off": "📴",
    "vibration_mode": "📳",
    "eight_pointed_black_star": "✴️",
    "vs": "🆚",
    "white_flower": "💮",
    "ideograph_advantage": "🉐",
    "secret": "㊙️",
    "congratulations": "㊗️",
    "u6e80": "🈵",
    "a": "🅰️",
    "b": "🅱️",
    "ab": "🆎",
    "cl": "🆑",
    "o2": "🅾️",
    "sos": "🆘",
    "x": "❌",
    "o": "⭕️",
    "stop_sign": "🛑",
    "no_entry": "⛔️",
    "name_badge": "📛",
    "no_entry_sign": "🚫",
    "anger": "💢",
    "hotsprings": "♨️",
    "no_pedestrians": "🚷",
    "do_not_litter": "🚯",
    "no_bicycles": "🚳",
    "non-potable_water": "🚱",
    "underage": "🔞",
    "no_mobile_phones": "📵",
    "no_smoking": "🚭",
    "exclamation": "❗️",
    "heavy_exclamation_mark": "❗️",
    "grey_exclamation": "❕",
    "question": "❓",
    "grey_question": "❔",
    "bangbang": "‼️",
    "interrobang": "⁉️",
    "low_brightness": "🔅",
    "high_brightness": "🔆",
    "part_alternation_mark": "〽️",
    "warning": "⚠️",
    "children_crossing": "🚸",
    "trident": "🔱",
    "fleur_de_lis": "⚜️",
    "beginner": "🔰",
    "recycle": "♻️",
    "white_check_mark": "✅",
    "chart": "💹",
    "sparkle": "❇️",
    "eight_spoked_asterisk": "✳️",
    "negative_squared_cross_mark": "❎",
    "globe_with_meridians": "🌐",
    "diamond_shape_with_a_dot_inside": "💠",
    "m": "Ⓜ️",
    "cyclone": "🌀",
    "zzz": "💤",
    "atm": "🏧",
    "wc": "🚾",
    "wheelchair": "♿️",
    "parking": "🅿️",
    "sa": "🈂️",
    "passport_control": "🛂",
    "customs": "🛃",
    "baggage_claim": "🛄",
    "left_luggage": "🛅",
    "mens": "🚹",
    "womens": "🚺",
    "baby_symbol": "🚼",
    "restroom": "🚻",
    "put_litter_in_its_place": "🚮",
    "cinema": "🎦",
    "signal_strength": "📶",
    "koko": "🈁",
    "symbols": "🔣",
    "information_source": "ℹ️",
    "abc": "🔤",
    "abcd": "🔡",
    "capital_abcd": "🔠",
    "ng": "🆖",
    "ok": "🆗",
    "up": "🆙",
    "cool": "🆒",
    "new": "🆕",
    "free": "🆓",
    "zero": "0️⃣",
    "one": "1️⃣",
    "two": "2️⃣",
    "three": "3️⃣",
    "four": "4️⃣",
    "five": "5️⃣",
    "six": "6️⃣",
    "seven": "7️⃣",
    "eight": "8️⃣",
    "nine": "9️⃣",
    "keycap_ten": "🔟",
    "hash": "#️⃣",
    "asterisk": "*️⃣",
    "arrow_forward": "▶️",
    "pause_button": "⏸",
    "play_or_pause_button": "⏯",
    "stop_button": "⏹",
    "record_button": "⏺",
    "next_track_button": "⏭",
    "previous_track_button": "⏮",
    "fast_forward": "⏩",
    "rewind": "⏪",
    "arrow_double_up": "⏫",
    "arrow_double_down": "⏬",
    "arrow_backward": "◀️",
    "arrow_up_small": "🔼",
    "arrow_down_small": "🔽",
    "arrow_right": "➡️",
    "arrow_left": "⬅️",
    "arrow_up": "⬆️",
    "arrow_down": "⬇️",
    "arrow_upper_right": "↗️",
    "arrow_lower_right": "↘️",
    "arrow_lower_left": "↙️",
    "arrow_upper_left": "↖️",
    "arrow_up_down": "↕️",
    "left_right_arrow": "↔️",
    "arrow_right_hook": "↪️",
    "leftwards_arrow_with_hook": "↩️",
    "arrow_heading_up": "⤴️",
    "arrow_heading_down": "⤵️",
    "twisted_rightwards_arrows": "🔀",
    "repeat": "🔁",
    "repeat_one": "🔂",
    "arrows_counterclockwise": "🔄",
    "arrows_clockwise": "🔃",
    "musical_note": "🎵",
    "notes": "🎶",
    "heavy_plus_sign": "➕",
    "heavy_minus_sign": "➖",
    "heavy_division_sign": "➗",
    "heavy_multiplication_x": "✖️",
    "heavy_dollar_sign": "💲",
    "currency_exchange": "💱",
    "tm": "™️",
    "copyright": "©️",
    "registered": "®️",
    "wavy_dash": "〰️",
    "curly_loop": "➰",
    "loop": "➿",
    "end": "🔚",
    "back": "🔙",
    "on": "🔛",
    "top": "🔝",
    "soon": "🔜",
    "heavy_check_mark": "✔️",
    "ballot_box_with_check": "☑️",
    "radio_button": "🔘",
    "white_circle": "⚪️",
    "black_circle": "⚫️",
    "red_circle": "🔴",
    "large_blue_circle": "🔵",
    "small_red_triangle": "🔺",
    "small_red_triangle_down": "🔻",
    "small_orange_diamond": "🔸",
    "small_blue_diamond": "🔹",
    "large_orange_diamond": "🔶",
    "large_blue_diamond": "🔷",
    "white_square_button": "🔳",
    "black_square_button": "🔲",
    "black_small_square": "▪️",
    "white_small_square": "▫️",
    "black_medium_small_square": "◾️",
    "white_medium_small_square": "◽️",
    "black_medium_square": "◼️",
    "white_medium_square": "◻️",
    "black_large_square": "⬛️",
    "white_large_square": "⬜️",
    "speaker": "🔈",
    "mute": "🔇",
    "sound": "🔉",
    "loud_sound": "🔊",
    "bell": "🔔",
    "no_bell": "🔕",
    "mega": "📣",
    "loudspeaker": "📢",
    "eye_speech_bubble": "👁‍🗨",
    "speech_balloon": "💬",
    "thought_balloon": "💭",
    "right_anger_bubble": "🗯",
    "spades": "♠️",
    "clubs": "♣️",
    "hearts": "♥️",
    "diamonds": "♦️",
    "black_joker": "🃏",
    "flower_playing_cards": "🎴",
    "mahjong": "🀄️",
    "clock1": "🕐",
    "clock2": "🕑",
    "clock3": "🕒",
    "clock4": "🕓",
    "clock5": "🕔",
    "clock6": "🕕",
    "clock7": "🕖",
    "clock8": "🕗",
    "clock9": "🕘",
    "clock10": "🕙",
    "clock11": "🕚",
    "clock12": "🕛",
    "clock130": "🕜",
    "clock230": "🕝",
    "clock330": "🕞",
    "clock430": "🕟",
    "clock530": "🕠",
    "clock630": "🕡",
    "clock730": "🕢",
    "clock830": "🕣",
    "clock930": "🕤",
    "clock1030": "🕥",
    "clock1130": "🕦",
    "clock1230": "🕧",
    "white_flag": "🏳️",
    "black_flag": "🏴",
    "checkered_flag": "🏁",
    "triangular_flag_on_post": "🚩",
    "rainbow_flag": "🏳️‍🌈",
    "afghanistan": "🇦🇫",
    "aland_islands": "🇦🇽",
    "albania": "🇦🇱",
    "algeria": "🇩🇿",
    "american_samoa": "🇦🇸",
    "andorra": "🇦🇩",
    "angola": "🇦🇴",
    "anguilla": "🇦🇮",
    "antarctica": "🇦🇶",
    "antigua_barbuda": "🇦🇬",
    "argentina": "🇦🇷",
    "armenia": "🇦🇲",
    "aruba": "🇦🇼",
    "australia": "🇦🇺",
    "austria": "🇦🇹",
    "azerbaijan": "🇦🇿",
    "bahamas": "🇧🇸",
    "bahrain": "🇧🇭",
    "bangladesh": "🇧🇩",
    "barbados": "🇧🇧",
    "belarus": "🇧🇾",
    "belgium": "🇧🇪",
    "belize": "🇧🇿",
    "benin": "🇧🇯",
    "bermuda": "🇧🇲",
    "bhutan": "🇧🇹",
    "bolivia": "🇧🇴",
    "caribbean_netherlands": "🇧🇶",
    "bosnia_herzegovina": "🇧🇦",
    "botswana": "🇧🇼",
    "brazil": "🇧🇷",
    "british_indian_ocean_territory": "🇮🇴",
    "british_virgin_islands": "🇻🇬",
    "brunei": "🇧🇳",
    "bulgaria": "🇧🇬",
    "burkina_faso": "🇧🇫",
    "burundi": "🇧🇮",
    "cape_verde": "🇨🇻",
    "cambodia": "🇰🇭",
    "cameroon": "🇨🇲",
    "canada": "🇨🇦",
    "canary_islands": "🇮🇨",
    "cayman_islands": "🇰🇾",
    "central_african_republic": "🇨🇫",
    "chad": "🇹🇩",
    "chile": "🇨🇱",
    "cn": "🇨🇳",
    "christmas_island": "🇨🇽",
    "cocos_islands": "🇨🇨",
    "colombia": "🇨🇴",
    "comoros": "🇰🇲",
    "congo_brazzaville": "🇨🇬",
    "congo_kinshasa": "🇨🇩",
    "cook_islands": "🇨🇰",
    "costa_rica": "🇨🇷",
    "cote_divoire": "🇨🇮",
    "croatia": "🇭🇷",
    "cuba": "🇨🇺",
    "curacao": "🇨🇼",
    "cyprus": "🇨🇾",
    "czech_republic": "🇨🇿",
    "denmark": "🇩🇰",
    "djibouti": "🇩🇯",
    "dominica": "🇩🇲",
    "dominican_republic": "🇩🇴",
    "ecuador": "🇪🇨",
    "egypt": "🇪🇬",
    "el_salvador": "🇸🇻",
    "equatorial_guinea": "🇬🇶",
    "eritrea": "🇪🇷",
    "estonia": "🇪🇪",
    "ethiopia": "🇪🇹",
    "eu": "🇪🇺",
    "european_union": "🇪🇺",
    "falkland_islands": "🇫🇰",
    "faroe_islands": "🇫🇴",
    "fiji": "🇫🇯",
    "finland": "🇫🇮",
    "fr": "🇫🇷",
    "french_guiana": "🇬🇫",
    "french_polynesia": "🇵🇫",
    "french_southern_territories": "🇹🇫",
    "gabon": "🇬🇦",
    "gambia": "🇬🇲",
    "georgia": "🇬🇪",
    "de": "🇩🇪",
    "ghana": "🇬🇭",
    "gibraltar": "🇬🇮",
    "greece": "🇬🇷",
    "greenland": "🇬🇱",
    "grenada": "🇬🇩",
    "guadeloupe": "🇬🇵",
    "guam": "🇬🇺",
    "guatemala": "🇬🇹",
    "guernsey": "🇬🇬",
    "guinea": "🇬🇳",
    "guinea_bissau": "🇬🇼",
    "guyana": "🇬🇾",
    "haiti": "🇭🇹",
    "honduras": "🇭🇳",
    "hong_kong": "🇭🇰",
    "hungary": "🇭🇺",
    "iceland": "🇮🇸",
    "india": "🇮🇳",
    "indonesia": "🇮🇩",
    "iran": "🇮🇷",
    "iraq": "🇮🇶",
    "ireland": "🇮🇪",
    "isle_of_man": "🇮🇲",
    "israel": "🇮🇱",
    "it": "🇮🇹",
    "jamaica": "🇯🇲",
    "jp": "🇯🇵",
    "crossed_flags": "🎌",
    "jersey": "🇯🇪",
    "jordan": "🇯🇴",
    "kazakhstan": "🇰🇿",
    "kenya": "🇰🇪",
    "kiribati": "🇰🇮",
    "kosovo": "🇽🇰",
    "kuwait": "🇰🇼",
    "kyrgyzstan": "🇰🇬",
    "laos": "🇱🇦",
    "latvia": "🇱🇻",
    "lebanon": "🇱🇧",
    "lesotho": "🇱🇸",
    "liberia": "🇱🇷",
    "libya": "🇱🇾",
    "liechtenstein": "🇱🇮",
    "lithuania": "🇱🇹",
    "luxembourg": "🇱🇺",
    "macau": "🇲🇴",
    "macedonia": "🇲🇰",
    "madagascar": "🇲🇬",
    "malawi": "🇲🇼",
    "malaysia": "🇲🇾",
    "maldives": "🇲🇻",
    "mali": "🇲🇱",
    "malta": "🇲🇹",
    "marshall_islands": "🇲🇭",
    "martinique": "🇲🇶",
    "mauritania": "🇲🇷",
    "mauritius": "🇲🇺",
    "mayotte": "🇾🇹",
    "mexico": "🇲🇽",
    "micronesia": "🇫🇲",
    "moldova": "🇲🇩",
    "monaco": "🇲🇨",
    "mongolia": "🇲🇳",
    "montenegro": "🇲🇪",
    "montserrat": "🇲🇸",
    "morocco": "🇲🇦",
    "mozambique": "🇲🇿",
    "myanmar": "🇲🇲",
    "namibia": "🇳🇦",
    "nauru": "🇳🇷",
    "nepal": "🇳🇵",
    "netherlands": "🇳🇱",
    "new_caledonia": "🇳🇨",
    "new_zealand": "🇳🇿",
    "nicaragua": "🇳🇮",
    "niger": "🇳🇪",
    "nigeria": "🇳🇬",
    "niue": "🇳🇺",
    "norfolk_island": "🇳🇫",
    "northern_mariana_islands": "🇲🇵",
    "north_korea": "🇰🇵",
    "norway": "🇳🇴",
    "oman": "🇴🇲",
    "pakistan": "🇵🇰",
    "palau": "🇵🇼",
    "palestinian_territories": "🇵🇸",
    "panama": "🇵🇦",
    "papua_new_guinea": "🇵🇬",
    "paraguay": "🇵🇾",
    "peru": "🇵🇪",
    "philippines": "🇵🇭",
    "pitcairn_islands": "🇵🇳",
    "poland": "🇵🇱",
    "portugal": "🇵🇹",
    "puerto_rico": "🇵🇷",
    "qatar": "🇶🇦",
    "reunion": "🇷🇪",
    "romania": "🇷🇴",
    "ru": "🇷🇺",
    "rwanda": "🇷🇼",
    "st_barthelemy": "🇧🇱",
    "st_helena": "🇸🇭",
    "st_kitts_nevis": "🇰🇳",
    "st_lucia": "🇱🇨",
    "st_pierre_miquelon": "🇵🇲",
    "st_vincent_grenadines": "🇻🇨",
    "samoa": "🇼🇸",
    "san_marino": "🇸🇲",
    "sao_tome_principe": "🇸🇹",
    "saudi_arabia": "🇸🇦",
    "senegal": "🇸🇳",
    "serbia": "🇷🇸",
    "seychelles": "🇸🇨",
    "sierra_leone": "🇸🇱",
    "singapore": "🇸🇬",
    "sint_maarten": "🇸🇽",
    "slovakia": "🇸🇰",
    "slovenia": "🇸🇮",
    "solomon_islands": "🇸🇧",
    "somalia": "🇸🇴",
    "south_africa": "🇿🇦",
    "south_georgia_south_sandwich_islands": "🇬🇸",
    "kr": "🇰🇷",
    "south_sudan": "🇸🇸",
    "es": "🇪🇸",
    "sri_lanka": "🇱🇰",
    "sudan": "🇸🇩",
    "suriname": "🇸🇷",
    "swaziland": "🇸🇿",
    "sweden": "🇸🇪",
    "switzerland": "🇨🇭",
    "syria": "🇸🇾",
    "taiwan": "🇹🇼",
    "tajikistan": "🇹🇯",
    "tanzania": "🇹🇿",
    "thailand": "🇹🇭",
    "timor_leste": "🇹🇱",
    "togo": "🇹🇬",
    "tokelau": "🇹🇰",
    "tonga": "🇹🇴",
    "trinidad_tobago": "🇹🇹",
    "tunisia": "🇹🇳",
    "tr": "🇹🇷",
    "turkmenistan": "🇹🇲",
    "turks_caicos_islands": "🇹🇨",
    "tuvalu": "🇹🇻",
    "uganda": "🇺🇬",
    "ukraine": "🇺🇦",
    "united_arab_emirates": "🇦🇪",
    "gb": "🇬🇧",
    "uk": "🇬🇧",
    "us": "🇺🇸",
    "us_virgin_islands": "🇻🇮",
    "uruguay": "🇺🇾",
    "uzbekistan": "🇺🇿",
    "vanuatu": "🇻🇺",
    "vatican_city": "🇻🇦",
    "venezuela": "🇻🇪",
    "vietnam": "🇻🇳",
    "wallis_futuna": "🇼🇫",
    "western_sahara": "🇪🇭",
    "yemen": "🇾🇪",
    "zambia": "🇿🇲",
    "zimbabwe": "🇿🇼"
  };

  var emojies_shortcuts = {
    angry: ['>:(', '>:-('],
    blush: [':")', ':-")'],
    broken_heart: ['</3', '<\\3'],
    // :\ and :-\ not used because of conflict with markdown escaping
    confused: [':/', ':-/'],
    // twemoji shows question
    cry: [":'(", ":'-(", ':,(', ':,-('],
    frowning: [':(', ':-('],
    heart: ['<3'],
    imp: [']:(', ']:-('],
    innocent: ['o:)', 'O:)', 'o:-)', 'O:-)', '0:)', '0:-)'],
    joy: [":')", ":'-)", ':,)', ':,-)', ":'D", ":'-D", ':,D', ':,-D'],
    kissing: [':*', ':-*'],
    laughing: ['x-)', 'X-)'],
    neutral_face: [':|', ':-|'],
    open_mouth: [':o', ':-o', ':O', ':-O'],
    rage: [':@', ':-@'],
    smile: [':D', ':-D'],
    smiley: [':)', ':-)'],
    smiling_imp: [']:)', ']:-)'],
    sob: [":,'(", ":,'-(", ';(', ';-('],
    stuck_out_tongue: [':P', ':-P'],
    sunglasses: ['8-)', 'B-)'],
    sweat: [',:(', ',:-('],
    sweat_smile: [',:)', ',:-)'],
    unamused: [':s', ':-S', ':z', ':-Z', ':$', ':-$'],
    wink: [';)', ';-)']
  };

  function emoji_html(tokens, idx
  /*, options, env */
  ) {
    return tokens[idx].content;
  }

  function create_rule(md, emojies, shortcuts, scanRE, replaceRE) {
    var arrayReplaceAt = md.utils.arrayReplaceAt,
        ucm = md.utils.lib.ucmicro,
        ZPCc = new RegExp([ucm.Z.source, ucm.P.source, ucm.Cc.source].join('|'));

    function splitTextToken(text, level, Token) {
      var token,
          last_pos = 0,
          nodes = [];
      text.replace(replaceRE, function (match, offset, src) {
        var emoji_name; // Validate emoji name

        if (shortcuts.hasOwnProperty(match)) {
          // replace shortcut with full name
          emoji_name = shortcuts[match]; // Don't allow letters before any shortcut (as in no ":/" in http://)

          if (offset > 0 && !ZPCc.test(src[offset - 1])) {
            return;
          } // Don't allow letters after any shortcut


          if (offset + match.length < src.length && !ZPCc.test(src[offset + match.length])) {
            return;
          }
        } else {
          emoji_name = match.slice(1, -1);
        } // Add new tokens to pending list


        if (offset > last_pos) {
          token = new Token('text', '', 0);
          token.content = text.slice(last_pos, offset);
          nodes.push(token);
        }

        token = new Token('emoji', '', 0);
        token.markup = emoji_name;
        token.content = emojies[emoji_name];
        nodes.push(token);
        last_pos = offset + match.length;
      });

      if (last_pos < text.length) {
        token = new Token('text', '', 0);
        token.content = text.slice(last_pos);
        nodes.push(token);
      }

      return nodes;
    }

    return function emoji_replace(state) {
      var i,
          j,
          l,
          tokens,
          token,
          blockTokens = state.tokens,
          autolinkLevel = 0;

      for (j = 0, l = blockTokens.length; j < l; j++) {
        if (blockTokens[j].type !== 'inline') {
          continue;
        }

        tokens = blockTokens[j].children; // We scan from the end, to keep position when new tags added.
        // Use reversed logic in links start/end match

        for (i = tokens.length - 1; i >= 0; i--) {
          token = tokens[i];

          if (token.type === 'link_open' || token.type === 'link_close') {
            if (token.info === 'auto') {
              autolinkLevel -= token.nesting;
            }
          }

          if (token.type === 'text' && autolinkLevel === 0 && scanRE.test(token.content)) {
            // replace current node
            blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, splitTextToken(token.content, token.level, state.Token));
          }
        }
      }
    };
  }

  function quoteRE(str) {
    return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
  }

  function normalize_opts(options) {
    var emojies = options.defs,
        shortcuts; // Filter emojies by whitelist, if needed

    if (options.enabled.length) {
      emojies = Object.keys(emojies).reduce(function (acc, key) {
        if (options.enabled.indexOf(key) >= 0) {
          acc[key] = emojies[key];
        }

        return acc;
      }, {});
    } // Flatten shortcuts to simple object: { alias: emoji_name }


    shortcuts = Object.keys(options.shortcuts).reduce(function (acc, key) {
      // Skip aliases for filtered emojies, to reduce regexp
      if (!emojies[key]) {
        return acc;
      }

      if (Array.isArray(options.shortcuts[key])) {
        options.shortcuts[key].forEach(function (alias) {
          acc[alias] = key;
        });
        return acc;
      }

      acc[options.shortcuts[key]] = key;
      return acc;
    }, {}); // Compile regexp

    var names = Object.keys(emojies).map(function (name) {
      return ':' + name + ':';
    }).concat(Object.keys(shortcuts)).sort().reverse().map(function (name) {
      return quoteRE(name);
    }).join('|');
    var scanRE = RegExp(names);
    var replaceRE = RegExp(names, 'g');
    return {
      defs: emojies,
      shortcuts: shortcuts,
      scanRE: scanRE,
      replaceRE: replaceRE
    };
  }

  function emoji_plugin(md, options) {
    var defaults = {
      defs: emojies_defs,
      shortcuts: emojies_shortcuts,
      enabled: []
    };
    var opts = normalize_opts(md.utils.assign({}, defaults, options || {}));
    md.renderer.rules.emoji = emoji_html;
    md.core.ruler.push('emoji', create_rule(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE));
  }

  var mermaid = window.mermaid;

  function mermaidChart(code) {
    try {
      mermaid.parse(code);
      return mermaid.mermaidAPI.render("chart_".concat(new Date().getTime()), code);
    } catch (str) {
      return "<pre>".concat(str, "</pre>");
    }
  }

  function MermaidPlugin(markdownIt) {
    if (mermaid) {
      markdownIt.mermaid = mermaid;

      mermaid.loadPreferences = function (preferenceStore) {
        var mermaidTheme = preferenceStore.get('mermaid-theme');
        if (!mermaidTheme) mermaidTheme = 'default';
        var ganttAxisFormat = preferenceStore.get('gantt-axis-format');
        if (!ganttAxisFormat) ganttAxisFormat = '%Y-%m-%d';
        mermaid.initialize({
          theme: mermaidTheme,
          gantt: {
            axisFormatter: [[ganttAxisFormat, function (d) {
              return d.getDay() === 1;
            }]]
          }
        });
        return {
          'mermaid-theme': mermaidTheme,
          'gantt-axis-format': ganttAxisFormat
        };
      };

      var temp = markdownIt.renderer.rules.fence.bind(markdownIt.renderer.rules);

      markdownIt.renderer.rules.fence = function (tokens, idx, options, env, slf) {
        var token = tokens[idx];
        var code = token.content.trim();
        if (token.info === 'mermaid') return mermaidChart(code);
        var firstLine = code.split(/\n/)[0].trim();
        if (firstLine === 'gantt' || firstLine === 'sequenceDiagram' || firstLine.match(/^graph (?:TB|BT|RL|LR|TD);?$/)) return mermaidChart(code);
        return temp(tokens, idx, options, env, slf);
      };
    } else {
      console.warn('Smartmd: mermaid is used but not import');
    }
  }

  /*
  rewrite by: https://github.com/runarberg/markdown-it-math
  */
  var katex = window.katex; // Test if potential opening or closing delimieter
  // Assumes that there is a "$" at state.src[pos]

  function isValidDelim(state, pos) {
    var prevChar,
        nextChar,
        max = state.posMax,
        can_open = true,
        can_close = true;
    prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1;
    nextChar = pos + 1 <= max ? state.src.charCodeAt(pos + 1) : -1; // Check non-whitespace conditions for opening and closing, and
    // check that closing delimeter isn't followed by a number

    if (prevChar === 0x20
    /* " " */
    || prevChar === 0x09
    /* \t */
    || nextChar >= 0x30
    /* "0" */
    && nextChar <= 0x39
    /* "9" */
    ) {
      can_close = false;
    }

    if (nextChar === 0x20
    /* " " */
    || nextChar === 0x09
    /* \t */
    ) {
        can_open = false;
      }

    return {
      can_open: can_open,
      can_close: can_close
    };
  }

  function math_inline(state, silent) {
    var start, match, token, res, pos;

    if (state.src[state.pos] !== "$") {
      return false;
    }

    res = isValidDelim(state, state.pos);

    if (!res.can_open) {
      if (!silent) {
        state.pending += "$";
      }

      state.pos += 1;
      return true;
    } // First check for and bypass all properly escaped delimieters
    // This loop will assume that the first leading backtick can not
    // be the first character in state.src, which is known since
    // we have found an opening delimieter already.


    start = state.pos + 1;
    match = start;

    while ((match = state.src.indexOf("$", match)) !== -1) {
      // Found potential $, look for escapes, pos will point to
      // first non escape when complete
      pos = match - 1;

      while (state.src[pos] === "\\") {
        pos -= 1;
      } // Even number of escapes, potential closing delimiter found


      if ((match - pos) % 2 === 1) {
        break;
      }

      match += 1;
    } // No closing delimter found.  Consume $ and continue.


    if (match === -1) {
      if (!silent) {
        state.pending += "$";
      }

      state.pos = start;
      return true;
    } // Check if we have empty content, ie: $$.  Do not parse.


    if (match - start === 0) {
      if (!silent) {
        state.pending += "$$";
      }

      state.pos = start + 1;
      return true;
    } // Check for valid closing delimiter


    res = isValidDelim(state, match);

    if (!res.can_close) {
      if (!silent) {
        state.pending += "$";
      }

      state.pos = start;
      return true;
    }

    if (!silent) {
      token = state.push('math_inline', 'math', 0);
      token.markup = "$";
      token.content = state.src.slice(start, match);
    }

    state.pos = match + 1;
    return true;
  }

  function math_block(state, start, end, silent) {
    var firstLine,
        lastLine,
        next,
        lastPos,
        found = false,
        token,
        pos = state.bMarks[start] + state.tShift[start],
        max = state.eMarks[start];

    if (pos + 2 > max) {
      return false;
    }

    if (state.src.slice(pos, pos + 2) !== '$$') {
      return false;
    }

    pos += 2;
    firstLine = state.src.slice(pos, max);

    if (silent) {
      return true;
    }

    if (firstLine.trim().slice(-2) === '$$') {
      // Single line expression
      firstLine = firstLine.trim().slice(0, -2);
      found = true;
    }

    for (next = start; !found;) {
      next++;

      if (next >= end) {
        break;
      }

      pos = state.bMarks[next] + state.tShift[next];
      max = state.eMarks[next];

      if (pos < max && state.tShift[next] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        break;
      }

      if (state.src.slice(pos, max).trim().slice(-2) === '$$') {
        lastPos = state.src.slice(0, max).lastIndexOf('$$');
        lastLine = state.src.slice(pos, lastPos);
        found = true;
      }
    }

    state.line = next + 1;
    token = state.push('math_block', 'math', 0);
    token.block = true;
    token.content = (firstLine && firstLine.trim() ? firstLine + '\n' : '') + state.getLines(start + 1, next, state.tShift[start], true) + (lastLine && lastLine.trim() ? lastLine : '');
    token.map = [start, state.line];
    token.markup = '$$';
    return true;
  }

  function MarkdownItKatex (md, options) {
    if (katex) {
      options = options || {}; // set KaTeX as the renderer for markdown-it-simplemath

      var katexInline = function katexInline(latex) {
        options.displayMode = false;

        try {
          return katex.renderToString(latex, options);
        } catch (error) {
          if (options.throwOnError) {
            console.log(error);
          }

          return latex;
        }
      };

      var inlineRenderer = function inlineRenderer(tokens, idx) {
        return katexInline(tokens[idx].content);
      };

      var katexBlock = function katexBlock(latex) {
        options.displayMode = true;

        try {
          return "<p class='math'>".concat(katex.renderToString(latex, options), "</p>");
        } catch (error) {
          if (options.throwOnError) {
            console.log(error);
          }

          return latex;
        }
      };

      var blockRenderer = function blockRenderer(tokens, idx) {
        return katexBlock(tokens[idx].content) + '\n';
      };

      md.inline.ruler.after('escape', 'math_inline', math_inline);
      md.block.ruler.after('blockquote', 'math_block', math_block, {
        alt: ['paragraph', 'reference', 'blockquote', 'list']
      });
      md.renderer.rules.math_inline = inlineRenderer;
      md.renderer.rules.math_block = blockRenderer;
    } else {
      console.warn("Smartmd: katex is used but not import");
    }
  }

  var plugins = {
    emoji: {
      plugin: emoji_plugin
    },
    mermaid: {
      plugin: MermaidPlugin,
      options: {
        throwOnError: true,
        errorColor: "#cc0000"
      }
    },
    katex: {
      plugin: MarkdownItKatex
    }
  };
  function MarkdownIt$1 (editor) {
    var options = editor.options;
    var markdownOptions = options.MarkdownItConfig;

    if (options.highlight) {
      if (window.hljs) {
        markdownOptions.options.highlight = function (str) {
          return "<pre class=\"hljs\"><code>".concat(window.hljs.highlightAuto(str).value, "</code></pre>");
        };
      } else {
        console.warn("Smartmd: highlight used but not import");
      }
    }

    var md = _markdownIt_8_4_2_markdownIt(markdownOptions.options);
    markdownOptions.plugins.forEach(function (item) {
      if (typeof item === "function") {
        md.use(item);
      } else if (typeof item === "string" && item in plugins) {
        md.use(plugins[item].plugin, plugins[item].options || {});
      }
    });
    return md;
  }

  function buildPreview (editor) {
    var cm = editor.codemirror;
    var cmElement = cm.getWrapperElement();
    var preview = document.createElement("div");
    var scrollbar = document.createElement("div");
    var scrollbarChild = document.createElement("div");
    var content = document.createElement("div");
    preview.className = "smartmd__preview ";
    scrollbar.className = "smartmd__preview__scrollbar";
    content.className = "smartmd__preview__content markdown-body";
    scrollbarChild.style.minWidth = "1px";
    scrollbar.appendChild(scrollbarChild);
    preview.appendChild(scrollbar);
    preview.appendChild(content);
    cmElement.parentNode.append(preview);
    editor.gui.preview = preview;
    editor.gui.previewScrollbar = scrollbar;
    editor.gui.previewContent = content;
  }

  function buildTooltips(title, actionName) {
    var tooltips = title;
    var action = menuList[actionName];

    if (typeof action === "function") {
      if (shortcuts[actionName]) {
        tooltips += " (".concat(fixShortcut(shortcuts[actionName]), ")");
      }
    }

    return tooltips;
  }

  function buildIcon(options) {
    var icon = document.createElement("a");
    if (options.title) icon.title = buildTooltips(options.title, options.action);
    icon.tabIndex = -1;
    icon.className = options.className;
    return icon;
  }

  function buildItem(editor, name) {
    var options = editor.options;
    var toolbarConfig = options.toolbarConfig;
    var item = toolbarConfig[name];
    if (!item) return false;

    if (/split-line-[0-9]+/.test(name)) {
      var line = document.createElement("i");
      line.className = item.className;
      return line;
    }

    var icon = buildIcon(item);
    var action = menuList[item.action];

    if (typeof action === "function") {
      icon.onclick = function (e) {
        e.preventDefault();
        Reflect.apply(action, editor, []);
      };
    } else if (isUrl(item.action)) {
      icon.href = item.action;
      icon.target = "_blank";
    }

    return icon;
  }

  function buildToolbar (editor) {
    var bar = document.createElement("div");
    var toolbarElements = [];
    var cm = editor.codemirror;
    var options = editor.options;
    var cmElement = cm.getWrapperElement();
    var toolbarConfig = options.toolbarConfig; // set toolbar option

    var toolbar = options.toolbar;
    var hideToolbar = options.hideToolbar;
    bar.className = "smartmd__toolbar";

    function build(name) {
      var icon = buildItem(editor, name);
      if (!icon) return;
      if (inArray(name, hideToolbar)) icon.style.display = "none";
      toolbarElements[name] = icon;
      bar.appendChild(icon);
    }

    if (Array.isArray(toolbar)) {
      for (var i = 0; i < toolbar.length; i++) {
        var name = toolbar[i];
        if (name === "|") name = "split-line";
        build(name);
      }
    } else {
      for (var _name in toolbarConfig) {
        if (toolbarConfig.hasOwnProperty(_name)) build(_name);
      }
    }

    cm.on("cursorActivity", function () {
      var stat = getState(cm);
      Object.keys(bar).forEach(function (key) {
        var item = bar[key];

        if (stat[key]) {
          addClass(item, "active");
        } else {
          removeClass(item, "active");
        }
      });
    });
    cmElement.parentNode.insertBefore(bar, cmElement);
    editor.gui.toolbar = bar;
    editor.gui.toolbarElements = toolbarElements;
  }

  function buildRender (editor) {
    var cmElement = editor.codemirror.getWrapperElement();
    var render = document.createElement("div");
    var container = document.createElement("div");
    var closeButton = document.createElement("button");
    var body = document.createElement("div");
    render.className = "smartmd__render";
    container.className = "smartmd__render__container";
    closeButton.className = "smartmd__render__closeButton fa fa-close";
    body.className = "markdown-body smartmd__render__body";
    container.appendChild(closeButton);
    container.appendChild(body);
    render.appendChild(container);
    cmElement.parentNode.append(render); // closeButton click function

    closeButton.onclick = function () {
      editor.toggleRender();
    };

    editor.gui.render = render;
    editor.gui.renderBody = body;
  }

  function wordCount(data) {
    var pattern = /[a-zA-Z0-9_\u0392-\u03c9\u0410-\u04F9]+|[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/g;
    var m = data.match(pattern);
    var count = 0;
    if (m === null) return count;

    for (var i = 0; i < m.length; i++) {
      if (m[i].charCodeAt(0) >= 0x4E00) {
        count += m[i].length;
      } else {
        count += 1;
      }
    }

    return count;
  }

  var defaultStatus = {
    "words": {
      defaultValue: "0",
      onUpdate: function onUpdate(el) {
        el.innerHTML = wordCount(this.codemirror.getValue());
      }
    },
    "lines": {
      defaultValue: "0",
      onUpdate: function onUpdate(el) {
        el.innerHTML = this.codemirror.lineCount();
      }
    },
    "cursor": {
      defaultValue: "0:0",
      onUpdate: function onUpdate(el) {
        var pos = this.codemirror.getCursor();
        el.innerHTML = pos.line + ":" + pos.ch;
      }
    },
    "autoSave": {
      defaultValue: function defaultValue(el) {
        el.innerHTML = "wait auto saving...";
        this.options.autoSaveElement = el;
      }
    },
    "block": {
      defaultValue: "noType",
      onUpdate: function onUpdate(el) {
        var pos = this.codemirror.getCursor();
        el.innerHTML = this.codemirror.getTokenTypeAt(pos) || "noType";
      }
    }
  };
  function buildStatusbar (editor) {
    var options = editor.options;
    var statusbarElements = [];
    var status = options.statusbar;
    var statusbar = document.createElement("div");
    var cm = editor.codemirror;
    var cmElement = cm.getWrapperElement();
    statusbar.className = "smartmd__statusbar";

    if (Array.isArray(status)) {
      status.forEach(function (item) {
        var el = document.createElement("span");
        var obj = defaultStatus[item];
        if (!isObject(obj)) return;
        el.className = obj.className || "smartmd__statusbar__".concat(item);

        if (typeof obj.onUpdate === "function") {
          cm.on("update", function () {
            Reflect.apply(obj.onUpdate, editor, [el]);
          });
        }

        if (typeof obj.defaultValue === "function") {
          Reflect.apply(obj.defaultValue, editor, [el]);
        } else if (typeof obj.defaultValue === "string") {
          el.innerHTML = obj.defaultValue;
        } // append the item to the status bar


        statusbar.appendChild(el);
        statusbarElements[item] = el;
      });
    }

    cmElement.parentNode.append(statusbar);
    editor.gui.statusbar = statusbar;
    editor.gui.statusbarElements = statusbarElements;
  }

  function buildAlert (editor) {
    var alert = document.createElement("div");
    var cmElement = editor.codemirror.getWrapperElement();
    alert.className = "smartmd__alert";
    cmElement.parentNode.append(alert);
    editor.gui.alert = alert;
  }

  function initGui (editor) {
    var options = editor.options;
    var wrapper = document.createElement("div");
    var cm = editor.codemirror;
    var cmElement = cm.getWrapperElement();
    editor.gui = {};
    wrapper.className = "smartmd";
    cmElement.parentNode.replaceChild(wrapper, cmElement);
    options.el.parentNode.replaceChild(wrapper, options.el);
    wrapper.appendChild(cmElement);
    wrapper.appendChild(options.el);
    editor.gui.wrapper = wrapper;
    buildPreview(editor);
    buildAlert(editor);
    buildRender(editor);
    buildToolbar(editor);
    buildStatusbar(editor);
  }

  function buildUploadWidget () {
    var widget = document.createElement("div");
    var progress = document.createElement("div");
    widget.className = "smartmd__upload";
    progress.className = "smartmd__upload__progress";
    widget.appendChild(progress);
    return widget;
  }

  function checkImage(file) {
    var options = this.options;
    var maxSize = options.uploads.maxSize;
    var type = options.uploads.type;
    var suffix = file.name.toLowerCase().split(".").splice(-1)[0];
    var delay = this.options.alertDelay;

    if (type.indexOf(suffix) === -1) {
      this.alert("Image support format <strong>".concat(type.join(","), "</strong>."), delay, "error");
      return false;
    } else if (file.size / 1024 > maxSize) {
      this.alert("Image size is more than <strong>".concat(maxSize, "</strong> kb."), delay, "error");
      return false;
    }

    return true;
  }
  function uploadImages (file) {
    var options = this.options;
    var cm = this.codemirror;
    var delay = this.options.alertDelay;
    var url = options.uploads.url; // image validator

    if (!Reflect.apply(checkImage, this, [file])) return;
    var from = cm.getCursor("start");
    var uploadWidget = buildUploadWidget();
    var progress = uploadWidget.firstChild;
    cm.execCommand("newlineAndIndent");
    var bookmark = cm.setBookmark(from, {
      widget: uploadWidget
    });
    var formData = new FormData();
    var xhr = new XMLHttpRequest();
    xhr.open("post", url);

    xhr.onreadystatechange = function (response) {
      if (this.readyState === 4) {
        bookmark.clear(); // write to parse your response data

        try {
          var data = JSON.parse(response);

          if (xhr.status === 200) {
            cm.setSelection(from);
            cm.replaceSelection("![](".concat(data.path, ")"));
          } else {
            this.alert("Upload failed on: ".concat(data.msg), delay, "error");
          }
        } catch (e) {
          console.warn("Smartmd: Json data cannot be parse check your request return");
        }
      }
    }.bind(this);

    xhr.upload.onprogress = function (ev) {
      if (ev.lengthComputable) {
        var value = 100 * (ev.loaded / ev.total);

        if (progress) {
          progress.style.width = value + "%";
          progress.innerText = Math.ceil(value) + "%";
        }
      }
    };

    formData.append("image", file); // try to get laravel csrf-token

    var token = getToken();
    if (token) xhr.setRequestHeader("X-CSRF-TOKEN", token);
    xhr.send(formData);
  }

  function alert (content, delay, theme) {
    var alertWrapper = this.gui.alert;
    theme = this.options.alertTheme[theme] || this.options.alertTheme.success;
    var block = document.createElement("div");
    var button = document.createElement("button");
    button.className = "fa fa-close";
    block.className = "smartmd__alert__item ".concat(theme.className);
    block.innerHTML = "<i class='".concat(theme.icon, "'></i>").concat(content);
    block.appendChild(button);
    alertWrapper.appendChild(block);
    setTimeout(function () {
      addClass(block, "smartmd__alert__item--fadeIn");
    }, 0);
    var p = new Promise(function (resolve) {
      button.onclick = function () {
        resolve();
      };

      if (delay) {
        setTimeout(function () {
          resolve();
        }, delay);
      }
    });
    p.then(function () {
      removeClass(block, "smartmd__alert__item--fadeIn");
      setTimeout(function () {
        block.remove();
      }, 500);
    });
  }

  var loaded,
      interval,
      autoSaveOptions,
      el$1,
      uuid = false;

  function getOptions() {
    if (isObject(autoSaveOptions) && isLocalStorage()) {
      if (!autoSaveOptions.uuid) {
        console.warn("Smartmd: You must set a uuid to autoSaved");
        return false;
      }

      return true;
    }

    return false;
  }

  function update() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    m = m < 10 ? "0" + m : m;
    h = h < 10 ? "0" + h : h;
    s = s < 10 ? "0" + s : s;
    el$1.innerHTML = "auto saved at: ".concat(h, ":").concat(m, ":").concat(s);
    localStorage.setItem(uuid, this.value());
  }

  function clearAutoSaved() {
    if (!interval) return;
    clearInterval(interval);
    interval = false;
    el$1.innerHTML = "auto save stopped";
  }
  function clearAutoSavedValue() {
    if (uuid) localStorage.removeItem(uuid);
  }
  function autoSaveUpdate() {
    if (loaded) update.apply(this);
  }
  function startAutoSave() {
    autoSaveOptions = this.options.autoSave;
    el$1 = this.options.autoSaveElement;
    if (!getOptions()) return;
    uuid = autoSaveOptions.uuid;
    var delay = autoSaveOptions.delay || 5000;
    var text = localStorage.getItem(uuid);
    if (text) this.codemirror.setValue(text);
    loaded = true; // restart autoSave need clear interval

    clearAutoSaved();
    update.apply(this);
    interval = setInterval(update.bind(this), delay);
  }

  function toTextArea() {
    var gui = this.gui;
    var children = gui.wrapper.childNodes;
    this.codemirror.toTextArea();

    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName !== 'TEXTAREA') {
        children[i].remove();
      }
    }
  }

  function parsePixes(pixes) {
    return isNaN(pixes) ? pixes : "".concat(pixes, "px");
  }

  function resize(width, height) {
    var gui = this.gui;
    if (width) gui.wrapper.style.width = parsePixes(width);
    if (height) gui.wrapper.style.height = parsePixes(height);
  }

  var ext = {
    toTextArea: toTextArea,
    alert: alert,
    uploadImages: uploadImages,
    autoSaveUpdate: autoSaveUpdate,
    clearAutoSaved: clearAutoSaved,
    clearAutoSavedValue: clearAutoSavedValue,
    startAutoSave: startAutoSave,
    resize: resize
  };
  function initExtend (editor) {
    for (var name in ext) {
      if (ext.hasOwnProperty(name)) {
        def(editor, name, ext[name]);
      }
    }
  }

  var uid = 0;

  var Dep =
  /*#__PURE__*/
  function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = ++uid;
      this.subs = [];
    }

    _createClass(Dep, [{
      key: "addSub",
      value: function addSub(sub) {
        this.subs.push(sub);
      }
    }, {
      key: "removeSub",
      value: function removeSub(sub) {
        remove(this.subs, sub);
      }
    }, {
      key: "depend",
      value: function depend() {
        if (Dep.target) {
          Dep.target.addDep(this);
        }
      }
    }, {
      key: "notify",
      value: function notify() {
        var subs = this.subs.slice();

        for (var i = 0, l = subs.length; i < l; i++) {
          subs[i].update();
        }
      }
    }]);

    return Dep;
  }();

  function defineReactive(obj, key, val) {
    var dep = new Dep();
    var property = Reflect.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) return;
    var getter = property && property.get;
    var setter = property && property.set;
    if ((!getter || setter) && arguments.length === 2) val = obj[key];
    var childOb = observe(val);
    Reflect.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function get() {
        var value = getter ? Reflect.apply(getter, obj, []) : val;
        dep.depend();

        if (childOb) {
          childOb.dep.depend();
        }

        return value;
      },
      set: function set(newVal) {
        var value = getter ? Reflect.apply(getter, obj, []) : val;
        if (newVal === value) return;
        if (getter && !setter) return;

        if (setter) {
          Reflect.apply(setter, obj, [newVal]);
        } else {
          val = newVal;
        }

        dep.notify();
      }
    });
  }

  var Observer = function Observer(value) {
    _classCallCheck(this, Observer);

    this.value = value;
    this.dep = new Dep();
    def(value, '__ob__', this);

    if (Array.isArray(value)) {
      observeArray(value);
    } else {
      walk(value);
    }
  };

  function walk(value) {
    var keys = Object.keys(value);

    for (var i = 0; i < keys.length; i++) {
      defineReactive(value, keys[i]);
    }
  }

  function observeArray(items) {
    for (var i = 0; i < items.length; i++) {
      observe(items[i]);
    }
  }

  function observe(value) {
    if (!isObject(value)) return false;
    return new Observer(value);
  }

  var uid$1 = 0;
  Dep.target = null;
  var targetStack = [];
  function pushTarget(target) {
    targetStack.push(target);
    Dep.target = target;
  }
  function popTarget() {
    targetStack.pop();
    Dep.target = targetStack[targetStack.length - 1];
  }

  var Watcher =
  /*#__PURE__*/
  function () {
    function Watcher(obj, exp, cb) {
      _classCallCheck(this, Watcher);

      this.obj = obj;
      this.exp = exp;
      this.cb = cb;
      this.id = ++uid$1;
      this.deps = [];
      this.newDeps = [];
      this.depIds = new Set();
      this.newDepIds = new Set();
      this.value = this.get();
    }

    _createClass(Watcher, [{
      key: "update",
      value: function update() {
        this.run();
      }
    }, {
      key: "run",
      value: function run() {
        var value = this.get();

        if (value !== this.value) {
          var oldValue = this.value;
          this.value = value;
          Reflect.apply(this.cb, this.obj, [value, oldValue]);
        }
      }
    }, {
      key: "get",
      value: function get() {
        pushTarget(this);
        var value = this.obj[this.exp];
        popTarget();
        this.cleanupDeps();
        return value;
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.newDepIds.has(id)) {
          this.newDepIds.add(id);
          this.newDeps.push(dep);

          if (!this.depIds.has(id)) {
            dep.addSub(this);
          }
        }
      }
    }, {
      key: "cleanupDeps",
      value: function cleanupDeps() {
        var i = this.deps.length;

        while (i--) {
          var dep = this.deps[i];

          if (!this.newDepIds.has(dep.id)) {
            dep.removeSub(this);
          }
        }

        var tmp = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = tmp;
        this.newDepIds.clear();
        tmp = this.deps;
        this.deps = this.newDeps;
        this.newDeps = tmp;
        this.newDeps.length = 0;
      }
    }]);

    return Watcher;
  }();

  var isFixed,
      toolbarTop,
      toolbar = false;
  function clearFixed() {
    removeClass(toolbar, "smartmd__toolbar--fixed");
    window.removeEventListener("scroll", checkHeight);
  }

  function checkHeight() {
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

    if (scrollTop >= toolbarTop) {
      if (isFixed) return;
      isFixed = true;
      addClass(toolbar, "smartmd__toolbar--fixed");
    } else {
      isFixed = false;
      removeClass(toolbar, "smartmd__toolbar--fixed");
    }
  }

  function startFixedToolbar() {
    toolbar = this.gui.toolbar;
    var ele = toolbar;
    toolbarTop = toolbar.offsetTop;

    while (ele.offsetParent) {
      ele = ele.offsetParent;
      toolbarTop += ele.offsetTop;
    }

    window.addEventListener("scroll", checkHeight);
  }

  function isFixedToolbar(val) {
    val ? startFixedToolbar.apply(this) : clearFixed();
  }

  function autoSave(val) {
    isObject(val) ? startAutoSave.apply(this) : clearAutoSaved();
  }

  function isRenderActive$1() {
    this.toggleRender();
  }

  function isFullScreen$1() {
    this.toggleFullScreen();
  }

  function isPreviewActive$1() {
    this.togglePreview();
  }

  function height(val) {
    this.resize(null, val);
  }

  function width(val) {
    this.resize(val, null);
  }

  var watchers = {
    isFixedToolbar: isFixedToolbar,
    autoSave: autoSave,
    isRenderActive: isRenderActive$1,
    isFullScreen: isFullScreen$1,
    isPreviewActive: isPreviewActive$1,
    height: height,
    width: width
  };
  function initState (editor) {
    var options = editor.options; // init editor state with options

    if (options.isFixedToolbar) startFixedToolbar.apply(editor);
    if (isObject(options.autoSave)) startAutoSave.apply(editor);
    if (options.isFullScreen) editor.toggleFullScreen();
    if (options.isPreviewActive) editor.togglePreview();
    if (options.width) editor.resize(options.width, null);
    if (options.height) editor.resize(null, options.height);
    var wClass = []; // watch options change

    for (var name in watchers) {
      if (watchers.hasOwnProperty(name)) {
        var watch = new Watcher(options, name, watchers[name].bind(editor));
        wClass.push(watch);
      }
    }

    return wClass;
  }

  var Smartmd =
  /*#__PURE__*/
  function () {
    function Smartmd(options) {
      _classCallCheck(this, Smartmd);

      var opt = extend({}, defaults, options); // find textArea element

      if (!opt.el) {
        // no element was found
        console.error("Smartmd: Error. No element was found.");
        return;
      }

      new Observer(opt);
      this.options = opt;
      this.utils = utils; // toolbar list active function

      initMenu(this); // Smartmd Class extend function

      initExtend(this);
      this.markdown = MarkdownIt$1(this);
      this.codemirror = CodeMirror$1(this);
      initGui(this);
      this.watchers = initState(this);
    }

    _createClass(Smartmd, [{
      key: "value",
      value: function value(text) {
        if (text === undefined) {
          return this.codemirror.getValue();
        }

        this.codemirror.setValue(text);
        return this;
      }
    }, {
      key: "set",
      value: function set(options) {
        if (isObject(options)) assign(this.options, options);
      }
    }, {
      key: "get",
      value: function get(option) {
        return this.options[option];
      }
    }]);

    return Smartmd;
  }();

  return Smartmd;

})));
