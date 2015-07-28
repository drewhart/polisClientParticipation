var PolisStorage = require("./polisStorage");
var Url = require("./url");
var millisPerDay = 1000 * 60 * 60 * 24;

function millisSinceJoin() {
  return Date.now() - PolisStorage.userCreated();
}
function daysSinceJoin() {
  console.log('daysSinceJoin', millisSinceJoin(), millisPerDay);
  return (millisSinceJoin() / millisPerDay) >> 0;
}
function numberOfDaysInTrial() {
  return (window.userObject && window.userObject.daysInTrial) || 10;
}
function trialDaysRemaining() {
  console.log('trial', numberOfDaysInTrial(), daysSinceJoin());

  return Math.max(0, numberOfDaysInTrial() - daysSinceJoin());
}

function mapObj(o, f) {
  var out = {};

  var ff = _.isFunction(f) ? function(val, key) {
      out[key] = f(val, key);
  } : function(val, key) {
      out[key] = o[key];
  };
  _.each(o, ff);
  return out;
}

// http://stackoverflow.com/questions/8112634/jquery-detecting-cookies-enabled
function are_cookies_enabled()
{
  if ((""+document.cookie).length > 0) {
    console.log("cookieEnabled true " + document.cookie);
    return true;
  }
    // var cookieEnabled = (navigator.cookieEnabled) ? true : false;

    // if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled)
    // { 

    // create a temporary cookie 
    var soon = new Date(Date.now() + 1000).toUTCString();
    var teststring = "_polistest_cookiesenabled";
    document.cookie = teststring + "=1; expires=" + soon;
    // see if it worked
    var cookieEnabled = document.cookie.indexOf(teststring) != -1;
    console.log("cookieEnabled  " + cookieEnabled + " "+ document.cookie);

    // clear the cookie
    document.cookie = teststring + "=; expires=" + (new Date(0)).toUTCString();

    // }
    return cookieEnabled;
}


function strToHex(str) {
var hex, i;
var result = "";
for (i=0; i<str.length; i++) {
  hex = str.charCodeAt(i).toString(16);
  result += ("000"+hex).slice(-4);
}
return result;
}
function hexToStr(hexString) {
var j;
var hexes = hexString.match(/.{1,4}/g) || [];
var str = "";
for(j = 0; j<hexes.length; j++) {
  str += String.fromCharCode(parseInt(hexes[j], 16));
}
return str;
}

function decodeParams(encodedStringifiedJson) {
    if (!encodedStringifiedJson.match(/^\/?ep1_/)) {
      throw new Error("wrong encoded params prefix");
    }
    if (encodedStringifiedJson[0] === "/") {
      encodedStringifiedJson = encodedStringifiedJson.slice(5);
    } else {
      encodedStringifiedJson = encodedStringifiedJson.slice(4);
    }
    var stringifiedJson = hexToStr(encodedStringifiedJson);
    var o = JSON.parse(stringifiedJson);
    return o;
}

function encodeParams(o) {
  if (!o || !_.keys(o).length) {
    return "";
  }
  var stringifiedJson = JSON.stringify(o);
  var encoded = "ep1_" + strToHex(stringifiedJson);
  return encoded;
}

function isInIframe() {
  return window.top != window;
}

// http://www.html5rocks.com/en/tutorials/pagevisibility/intro/
function getHiddenProp(){
    var prefixes = ['webkit','moz','ms','o'];
    
    // if 'hidden' is natively supported just return it
    if ('hidden' in document) {
      return 'hidden';
    }
    
    // otherwise loop over all the known prefixes until we find one
    for (var i = 0; i < prefixes.length; i++){
      if ((prefixes[i] + 'Hidden') in document) {
        return prefixes[i] + 'Hidden';
      }
    }

    // otherwise it's not supported
    return null;
}
function isHidden() {
    var prop = getHiddenProp();
    if (!prop) {
      return false;
    }
    
    return document[prop];
}

function shouldFocusOnTextareaWhenWritePaneShown() {
  // Not when we're embedded in an iframe.
  //  it ends up stealing focus and causing the parent to scroll to our iframe.
  //  (this happens where there are no comments to vote on, and we show the write tab first)
  // return !isInIframe();
  return false;
}

function parseQueryParams(s) {
  if (!_.isString(s)) {
    console.warn("2839748273")
    return {};
  }
  if (s.charAt(0) === "?") {
    s = s.slice(1);
  }
  var pairStrings = s.split("&");
  var pairArrays = _.map(pairStrings, function(pairString) {
    return pairString.split("=");
  });
  return _.object(pairArrays);
}

function toQueryParamString(o) {
  var pairs = _.pairs(o);
  pairs = _.map(pairs, function(pair) {
    return pair[0] + '=' + encodeURIComponent(pair[1]);
  });
  return pairs.join("&");
}

function toUnitVector(x, y) {
  var magnitude = Math.sqrt(x*x + y*y);
  if (magnitude === 0) {
    return [0, 0];
  }
  return [x/magnitude, y/magnitude];
}


function argMin(items, f) {
  var lowestVal = Infinity;
  var lowestItem = null;
  if (!items) {
    return lowestItem;
  }
  for (var i = 0; i < items.length; i++) {
    var candidate = items[i];
    var candidateVal = f(candidate);
    if (candidateVal < lowestVal) {
      lowestVal = candidateVal;
      lowestItem = candidate;
    }
  }
  return lowestItem;
}

function argMax(items, f) {
  var highestVal = -Infinity;
  var highestItem = null;
  if (!items) {
    return highestItem;
  }
  for (var i = 0; i < items.length; i++) {
    var candidate = items[i];
    var candidateVal = f(candidate);
    if (candidateVal > highestVal) {
      highestVal = candidateVal;
      highestItem = candidate;
    }
  }
  return highestItem;
}

// Return the {x: {min: #, max: #}, y: {min: #, max: #}}
module.exports = {
  argMax: argMax,
  argMin: argMin,
  mapObj: mapObj,
  computeXySpans: function(points) {
    var spans = {
      x: { min: Infinity, max: -Infinity },
      y: { min: Infinity, max: -Infinity }
    };
    for (var i = 0; i < points.length; i++) {
      if (points[i].proj) {
        spans.x.min = Math.min(spans.x.min, points[i].proj.x);
        spans.x.max = Math.max(spans.x.max, points[i].proj.x);
        spans.y.min = Math.min(spans.y.min, points[i].proj.y);
        spans.y.max = Math.max(spans.y.max, points[i].proj.y);
      }
    }
    return spans;
  },
  toUnitVector: toUnitVector,
  toQueryParamString: toQueryParamString,
  parseQueryParams: parseQueryParams,

  supportsSVG: function() {
    return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
  },
  isIE8: function() {
    return navigator.userAgent.match(/MSIE [89]/);
  },
  isIphone: function() {
    return navigator.userAgent.match(/iPhone/);
  },
  isIpad: function() {
    return navigator.userAgent.match(/iPad/);
  },
  isIos: function() {
    return this.isIpad() || this.isIphone();
  },
  isAndroid: function() {
    return navigator.userAgent.match(/Android/);
  },
  isOldAndroid: function() {
    return navigator.userAgent.match(/Android [012]\.[0-3]/);
  },
  isMobile: function() {
    return this.isIphone() || this.isIpad() || this.isAndroid();
  },
  isShortConversationId: function(conversation_id) {
    return conversation_id.length <= 6;
  },
  supportsVis: function() {
    return this.supportsSVG() && !this.isIE8();
  },
  isTrialUser: function() {
    return !PolisStorage.planCode();
  },
  isIndividualUser: function() {
    return PolisStorage.planCode() === 1;
  },
  isStudentUser: function() {
    return PolisStorage.planCode() === 2;
  },
  isPpUser: function() {
    return PolisStorage.planCode() === 3;
  },
  isEnterpriseUser: function() {
    return PolisStorage.planCode() === 1000;
  },
  getAnonPicUrl: function() {
    return "https://pol.is/landerImages/anonProfileIcon64.png";
  },
  getGroupNameForGid: function(gid) {
    if (gid < 0) {
      return gid;
    } else if (!_.isNumber(gid)) {
      console.error("undexpected gid: " + gid);
    }
    return gid + 1;
  },
  isInIframe: isInIframe,
  isHidden: isHidden,
  shouldFocusOnTextareaWhenWritePaneShown: shouldFocusOnTextareaWhenWritePaneShown,
  projectComments: false,
  debugCommentProjection: false,
  projectRepfulTids: true,
  hexToStr: hexToStr,
  strToHex: strToHex,
  decodeParams: decodeParams,
  encodeParams: encodeParams,
  numberOfDaysInTrial: numberOfDaysInTrial,
  trialDaysRemaining: trialDaysRemaining,
  cookiesEnabled: are_cookies_enabled
};
