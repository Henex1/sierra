/*
 The MIT License (MIT)

 Copyright (c) 2014 gskinner.com, inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

var $ = {};
$.bind = function (o, f) {
  return function () {
    return f.apply(o, Array.prototype.slice.call(arguments));
  };
};

var CMUtils = {};
CMUtils.getCharIndexAt = function (cm, winX, winY) {
  var pos = cm.coordsChar({ left: winX, top: winY }, "page");
  // test current and prev character, since CM seems to use the center of each character for coordsChar:
  for (var i = 0; i <= 1; i++) {
    var rect = cm.charCoords(pos, "page");
    if (
      winX >= rect.left &&
      winX <= rect.right &&
      winY >= rect.top &&
      winY <= rect.bottom
    ) {
      return cm.indexFromPos(pos);
    }
    if (pos.ch-- <= 0) {
      break;
    }
  }
  return null;
};

CMUtils.getCharRect = function (cm, index) {
  if (index == null) {
    return null;
  }
  var pos = cm.posFromIndex(index);
  var rect = cm.charCoords(pos);
  rect.x = rect.left;
  rect.y = rect.top;
  rect.width = rect.right - rect.left;
  rect.height = rect.bottom - rect.top;
  return rect;
};

var ExpressionHover = function (cm, highlighter) {
  this.initialize(cm, highlighter);
};
var p = ExpressionHover.prototype;

p.cm = null;
p.tooltip = null;
p.highlighter = null;
p.token = null;
p.offset = 0;
p.isMouseDown = false;

p.initialize = function (cm, highlighter) {
  this.cm = cm;
  this.highlighter = highlighter;
  this.offset = highlighter.offset;

  cm.on("mousedown", $.bind(this, this.onMouseDown));
};

p.onMouseDown = function (cm, evt) {
  if (evt.which != 1 && evt.button != 1) {
    return;
  }
  this.onMouseMove(); // clear current
  this.isMouseDown = true;
  var _this = this,
    f,
    t = window.addEventListener ? window : document;
  t.addEventListener(
    "mouseup",
    (f = function () {
      t.removeEventListener("mouseup", f);
      _this.isMouseDown = false;
    })
  );
};

p.onMouseMove = function (evt) {
  if (this.isMouseDown) {
    return;
  }
  var index,
    cm = this.cm,
    token = this.token,
    target = null;

  if (
    evt &&
    token &&
    (index = CMUtils.getCharIndexAt(
      cm,
      evt.clientX,
      evt.clientY + window.pageYOffset
    )) != null
  ) {
    index -= this.offset;
    while (token) {
      if (index >= token.i && index < token.end) {
        target = token;
        break;
      }
      token = token.next;
    }
  }
  if (target && target.proxy) {
    target = target.proxy;
  }

  this.highlighter.selectToken(target);
  var rect = index != null && CMUtils.getCharRect(cm, index);
  if (rect) {
    rect.right = rect.left = evt.clientX;
  }
};

p.onMouseOut = function (evt) {
  this.highlighter.selectToken(null);
};

module.exports = ExpressionHover;
