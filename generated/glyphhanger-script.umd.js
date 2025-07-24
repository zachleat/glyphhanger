var GlyphHanger = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/GlyphHangerClientScript.js
  var GlyphHangerClientScript_exports = {};
  __export(GlyphHangerClientScript_exports, {
    default: () => GH
  });

  // node_modules/characterset/lib/characterset.js
  function CharacterSet(input) {
    this.data = {};
    this.size = 0;
    if (typeof input === "string") {
      for (var i = 0; i < input.length; i += 1) {
        var codePoint = input.charCodeAt(i);
        if ((codePoint & 63488) === 55296 && i < input.length) {
          var nextCodePoint = input.charCodeAt(i + 1);
          if ((nextCodePoint & 64512) === 56320) {
            this.add(((codePoint & 1023) << 10) + (nextCodePoint & 1023) + 65536);
          } else {
            this.add(codePoint);
          }
          i += 1;
        } else {
          this.add(codePoint);
        }
      }
    } else if (typeof input === "number") {
      this.add(input);
    } else if (Array.isArray(input)) {
      input = this.expandRange(input);
      for (var i = 0; i < input.length; i += 1) {
        this.add(input[i]);
      }
    }
  }
  CharacterSet.Range;
  CharacterSet.prototype.getSize = function() {
    return this.size;
  };
  CharacterSet.prototype.expandRange = function(range) {
    var result = [];
    for (var i = 0; i < range.length; i += 1) {
      if (Array.isArray(range[i])) {
        for (var j = range[i][0]; j < range[i][1] + 1; j += 1) {
          result.push(j);
        }
      } else {
        result.push(range[i]);
      }
    }
    return result;
  };
  CharacterSet.prototype.compressRange = function(codePoints) {
    var result = [];
    for (var i = 0; i < codePoints.length; i += 1) {
      var previous = i > 0 ? codePoints[i - 1] : null, next = i < codePoints.length - 1 ? codePoints[i + 1] : null, current = codePoints[i];
      if ((current - 1 !== previous || previous === null) && (current + 1 !== next || next === null)) {
        result.push(current);
      } else if ((current - 1 !== previous || previous === null) && (current + 1 === next || next === null)) {
        result.push(current);
      } else if ((current - 1 === previous || previous === null) && (current + 1 !== next || next === null)) {
        if (current - result[result.length - 1] > 1) {
          result[result.length - 1] = [result[result.length - 1], current];
        } else {
          result.push(current);
        }
      }
    }
    return result;
  };
  CharacterSet.prototype.toArray = function() {
    var result = [];
    for (var codePoint in this.data) {
      if (this.data.hasOwnProperty(codePoint) && this.data[codePoint] === true) {
        result.push(parseInt(codePoint, 10));
      }
    }
    result.sort(function(a, b) {
      return a - b;
    });
    return result;
  };
  CharacterSet.prototype.toRange = function() {
    return this.compressRange(this.toArray());
  };
  CharacterSet.prototype.isEmpty = function() {
    return this.size === 0;
  };
  CharacterSet.prototype.add = function(var_args) {
    for (var i = 0; i < arguments.length; i += 1) {
      var codePoint = arguments[i];
      if (this.data[codePoint] !== true) {
        this.data[codePoint] = true;
        this.size += 1;
      }
    }
  };
  CharacterSet.prototype.remove = function(var_args) {
    for (var i = 0; i < arguments.length; i += 1) {
      var codePoint = arguments[i];
      if (this.data[codePoint] === true) {
        this.data[codePoint] = false;
        this.size -= 1;
      }
    }
  };
  CharacterSet.prototype.contains = function(codePoint) {
    return this.data[codePoint] === true;
  };
  CharacterSet.prototype.equals = function(other) {
    var codePoints = this.toArray();
    if (this.getSize() === other.getSize()) {
      for (var i = 0; i < codePoints.length; i += 1) {
        if (!other.contains(codePoints[i])) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  };
  CharacterSet.prototype.union = function(other) {
    return new CharacterSet(this.toArray().concat(other.toArray()));
  };
  CharacterSet.prototype.intersect = function(other) {
    var result = new CharacterSet(), codePoints = this.toArray();
    for (var i = 0; i < codePoints.length; i += 1) {
      if (other.contains(codePoints[i])) {
        result.add(codePoints[i]);
      }
    }
    return result;
  };
  CharacterSet.prototype.difference = function(other) {
    var result = new CharacterSet(), codePoints = this.toArray();
    for (var i = 0; i < codePoints.length; i += 1) {
      if (!other.contains(codePoints[i])) {
        result.add(codePoints[i]);
      }
    }
    return result;
  };
  CharacterSet.prototype.subset = function(other) {
    var codePoints = this.toArray();
    for (var i = 0; i < codePoints.length; i += 1) {
      if (!other.contains(codePoints[i])) {
        return false;
      }
    }
    return true;
  };
  CharacterSet.prototype.extractHighSurrogate = function(codePoint) {
    return Math.floor((codePoint - 65536) / 1024) + 55296;
  };
  CharacterSet.prototype.extractLowSurrogate = function(codePoint) {
    return (codePoint - 65536) % 1024 + 56320;
  };
  CharacterSet.prototype.encodeCodePoint = function(codePoint) {
    if (codePoint >= 65 && codePoint <= 90 || // A-Z
    codePoint >= 97 && codePoint <= 122 || // a-z
    codePoint >= 48 && codePoint <= 57) {
      return String.fromCharCode(codePoint);
    } else if (codePoint <= 65535) {
      return "\\u" + (codePoint + 65536).toString(16).substr(-4).toUpperCase();
    } else {
      return this.encodeCodePoint(this.extractHighSurrogate(codePoint)) + this.encodeCodePoint(this.extractLowSurrogate(codePoint));
    }
  };
  CharacterSet.prototype.toRegExp = function() {
    var codePoints = this.toArray(), bmp = new CharacterSet(), surrogates = new CharacterSet(), highSurrogates = {}, lowSurrogates = {}, result = [];
    for (var i = 0; i < codePoints.length; i += 1) {
      if (codePoints[i] >= 884736 && codePoints[i] <= 56319) {
        surrogates.add(codePoints[i]);
      } else if (codePoints[i] <= 65535) {
        bmp.add(codePoints[i]);
      } else {
        var highSurrogate = this.extractHighSurrogate(codePoints[i]), lowSurrogate = this.extractLowSurrogate(codePoints[i]);
        if (!highSurrogates.hasOwnProperty(highSurrogate)) {
          highSurrogates[highSurrogate] = new CharacterSet();
        }
        highSurrogates[highSurrogate].add(lowSurrogate);
      }
    }
    for (var highSurrogate in highSurrogates) {
      var lowSurrogateSet = highSurrogates[highSurrogate], lowSurrogateKey = lowSurrogateSet.toRangeString();
      if (!lowSurrogates.hasOwnProperty(lowSurrogateKey)) {
        lowSurrogates[lowSurrogateKey] = new CharacterSet();
      }
      lowSurrogates[lowSurrogateKey].add(parseInt(highSurrogate, 10));
    }
    if (!bmp.isEmpty()) {
      result.push(bmp.toRangeString());
    }
    for (var lowSurrogateRange in lowSurrogates) {
      var highSurrogateSet = lowSurrogates[lowSurrogateRange];
      result.push(highSurrogateSet.toRangeString() + lowSurrogateRange);
    }
    if (!surrogates.isEmpty()) {
      result.push(surrogates.toRangeString());
    }
    return result.join("|");
  };
  CharacterSet.prototype.toRangeString = function() {
    var containsRange = false, result = this.toRange().map(function(value) {
      if (Array.isArray(value)) {
        containsRange = true;
        return this.encodeCodePoint(value[0]) + "-" + this.encodeCodePoint(value[1]);
      } else {
        return this.encodeCodePoint(value);
      }
    }, this);
    if (result.length === 0) {
      return "";
    } else if (result.length === 1 && !containsRange) {
      return result[0];
    } else {
      return "[" + result.join("") + "]";
    }
  };
  CharacterSet.prototype.toHexString = function() {
    return this.toArray().map(function(codePoint) {
      return "U+" + codePoint.toString(16).toUpperCase();
    }).join(",");
  };
  CharacterSet.prototype.toHexRangeString = function() {
    return this.toRange().map(function(value) {
      if (Array.isArray(value)) {
        return "U+" + value[0].toString(16).toUpperCase() + "-" + value[1].toString(16).toUpperCase();
      } else {
        return "U+" + value.toString(16).toUpperCase();
      }
    }).join(",");
  };
  CharacterSet.prototype.toString = function() {
    return this.toArray().map(this.encodeCodePoint.bind(this)).join("");
  };
  CharacterSet.parseUnicodeRange = function(input) {
    var ranges = input.split(/\s*,\s*/);
    var result = new CharacterSet();
    for (var i = 0; i < ranges.length; i++) {
      var match = /^(u\+([0-9a-f?]{1,6})(?:-([0-9a-f]{1,6}))?)$/i.exec(ranges[i]), start = null, end = null;
      if (match) {
        if (match[2].indexOf("?") !== -1) {
          start = parseInt(match[2].replace("?", "0"), 16);
          end = parseInt(match[2].replace("?", "f"), 16);
        } else {
          start = parseInt(match[2], 16);
          if (match[3]) {
            end = parseInt(match[3], 16);
          } else {
            end = start;
          }
        }
        if (start !== end) {
          for (var codePoint = start; codePoint <= end; codePoint++) {
            result.add(codePoint);
          }
        } else {
          result.add(start);
        }
      }
    }
    return result;
  };
  var characterset_default = CharacterSet;

  // src/GlyphHangerClientScript.js
  var GH = class {
    constructor() {
      this.globalSet = new characterset_default();
      this.fontFamilySets = {};
      this.displayFontFamilyNames = {};
      this.defaultFontFamily = "serif";
      if (typeof window !== "undefined") {
        this.win = window;
      }
    }
    setEnv(win) {
      this.win = win;
    }
    init(contextNode, opts, isJSDOM = false) {
      opts = opts || {};
      if (contextNode) {
        var nodes = Array.from(contextNode.getElementsByTagName("*"));
        nodes.push(contextNode);
        nodes.forEach(function(node) {
          if (node.tagName) {
            var tagName = node.tagName.toLowerCase();
            if (tagName === "script") {
              return;
            }
          }
          if (opts.onlyVisible && !(node.offsetWidth || node.offsetHeight || node.getClientRects().length)) {
            return;
          }
          if (opts.cssSelector && !node.matches(opts.cssSelector)) {
            return;
          }
          this.getTextNodeChildren(node).filter(function(textNode) {
            return this.hasValue(textNode);
          }.bind(this)).forEach(function(textNode) {
            var fontFamily = this.getFontFamilyNameFromNode(textNode, null);
            var text = this.getNodeValue(textNode);
            this.saveGlyphs(text, fontFamily);
          }.bind(this));
          if (!isJSDOM) {
            var beforeContent = this.getPseudoContent(node, ":before");
            if (beforeContent) {
              var beforeFamily = this.getFontFamilyNameFromNode(node, ":before");
              this.saveGlyphs(beforeContent, beforeFamily);
            }
            var afterContent = this.getPseudoContent(node, ":after");
            if (afterContent) {
              var afterFamily = this.getFontFamilyNameFromNode(node, ":after");
              this.saveGlyphs(afterContent, afterFamily);
            }
          }
        }.bind(this));
      }
    }
    getPseudoContent(node, pseudo) {
      if (!pseudo) {
        return;
      }
      return this.removeQuotes(this.win.getComputedStyle(node, pseudo).getPropertyValue("content"), true);
    }
    // TODO resolve keywords when not string content
    removeQuotes(text, requireQuotes) {
      if (text.indexOf("'") === 0) {
        return text.replace(/[\']/g, "");
      } else if (text.indexOf('"') === 0) {
        return text.replace(/[\"]/g, "");
      }
      if (!requireQuotes) {
        return text;
      }
    }
    getFontFamilyName(fontFamilyList) {
      if (!fontFamilyList) {
        return "";
      }
      var split = fontFamilyList.split(",").map(function(family) {
        return family.trim();
      }).map(function(family) {
        return this.removeQuotes(family);
      }.bind(this));
      return split.length ? split[0] : "";
    }
    getFontFamilyNameFromNode(node, pseudo) {
      var context = node;
      if (node.nodeType === 3) {
        context = node.parentNode;
      }
      var fontFamilyList;
      if (context) {
        var fontFamily = this.win.getComputedStyle(context, pseudo).getPropertyValue("font-family");
        fontFamilyList = fontFamily || this.defaultFontFamily;
      }
      return this.getFontFamilyName(fontFamilyList);
    }
    fakeInnerText(node) {
      var value = node.nodeValue.trim();
      if (node.nodeType !== 3) {
        return "";
      }
      if (node.parentNode) {
        var style = this.win.getComputedStyle(node.parentNode);
        var textTransform = style.getPropertyValue("text-transform");
        var fontVariant = style.getPropertyValue("font-variant");
        if (fontVariant === "small-caps" || textTransform === "capitalize") {
          return value.toUpperCase() + value.toLowerCase();
        } else if (textTransform === "uppercase") {
          return value.toUpperCase();
        } else if (textTransform === "lowercase") {
          return value.toLowerCase();
        }
      }
      return value;
    }
    getNodeValue(node) {
      var innerText = this.fakeInnerText(node);
      return node.innerText || innerText || "";
    }
    hasValue(node) {
      return (node.innerText || node.nodeValue).trim().length > 0;
    }
    getTextNodeChildren(node) {
      var all = [];
      var node;
      for (node = node.firstChild; node; node = node.nextSibling) {
        if (node.nodeType === 3) {
          all.push(node);
        }
      }
      return all;
    }
    saveGlyphs(text, fontFamily) {
      var set = new characterset_default(text);
      this.globalSet = this.globalSet.union(set);
      if (fontFamily) {
        var key = fontFamily.toLowerCase();
        this.displayFontFamilyNames[key] = fontFamily;
        if (key) {
          this.fontFamilySets[key] = this.getFamilySet(key).union(set);
        }
      }
    }
    getFamilySet(fontFamily) {
      return fontFamily in this.fontFamilySets ? this.fontFamilySets[fontFamily] : new characterset_default();
    }
    getGlyphs() {
      return this.globalSet.toArray();
    }
    toString() {
      return this.globalSet.toString();
    }
    toJSONString() {
      return JSON.stringify(this.toJSON());
    }
    toJSON() {
      var obj = {};
      for (var family in this.fontFamilySets) {
        obj[this.displayFontFamilyNames[family]] = this.fontFamilySets[family].toArray();
      }
      obj["*"] = this.getGlyphs();
      return obj;
    }
  };
  return __toCommonJS(GlyphHangerClientScript_exports);
})();
