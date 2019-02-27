/* WEBPACK VAR INJECTION */(function(__resourceQuery) {

/* global __resourceQuery WorkerGlobalScope self */
/* eslint prefer-destructuring: off */

var url = __webpack_require__(/*! url */ "./node_modules/url/url.js");
var stripAnsi = __webpack_require__(/*! strip-ansi */ "./node_modules/strip-ansi/index.js");
var log = __webpack_require__(/*! loglevel */ "./node_modules/loglevel/lib/loglevel.js").getLogger('webpack-dev-server');
var socket = __webpack_require__(/*! ./socket */ "./node_modules/webpack-dev-server/client/socket.js");
var overlay = __webpack_require__(/*! ./overlay */ "./node_modules/webpack-dev-server/client/overlay.js");

function getCurrentScriptSource() {
  // `document.currentScript` is the most accurate way to find the current script,
  // but is not supported in all browsers.
  if (document.currentScript) {
    return document.currentScript.getAttribute('src');
  }
  // Fall back to getting all scripts in the document.
  var scriptElements = document.scripts || [];
  var currentScript = scriptElements[scriptElements.length - 1];
  if (currentScript) {
    return currentScript.getAttribute('src');
  }
  // Fail as there was no script to use.
  throw new Error('[WDS] Failed to get current script source.');
}

var urlParts = void 0;
var hotReload = true;
if (typeof window !== 'undefined') {
  var qs = window.location.search.toLowerCase();
  hotReload = qs.indexOf('hotreload=false') === -1;
}
if (true) {
  // If this bundle is inlined, use the resource query to get the correct url.
  urlParts = url.parse(__resourceQuery.substr(1));
} else { var scriptHost; }

if (!urlParts.port || urlParts.port === '0') {
  urlParts.port = self.location.port;
}

var _hot = false;
var initial = true;
var currentHash = '';
var useWarningOverlay = false;
var useErrorOverlay = false;
var useProgress = false;

var INFO = 'info';
var WARNING = 'warning';
var ERROR = 'error';
var NONE = 'none';

// Set the default log level
log.setDefaultLevel(INFO);

// Send messages to the outside, so plugins can consume it.
function sendMsg(type, data) {
  if (typeof self !== 'undefined' && (typeof WorkerGlobalScope === 'undefined' || !(self instanceof WorkerGlobalScope))) {
    self.postMessage({
      type: 'webpack' + type,
      data: data
    }, '*');
  }
}

var onSocketMsg = {
  hot: function hot() {
    _hot = true;
    log.info('[WDS] Hot Module Replacement enabled.');
  },
  invalid: function invalid() {
    log.info('[WDS] App updated. Recompiling...');
    // fixes #1042. overlay doesn't clear if errors are fixed but warnings remain.
    if (useWarningOverlay || useErrorOverlay) overlay.clear();
    sendMsg('Invalid');
  },
  hash: function hash(_hash) {
    currentHash = _hash;
  },

  'still-ok': function stillOk() {
    log.info('[WDS] Nothing changed.');
    if (useWarningOverlay || useErrorOverlay) overlay.clear();
    sendMsg('StillOk');
  },
  'log-level': function logLevel(level) {
    var hotCtx = __webpack_require__("./node_modules/webpack/hot sync ^\\.\\/log$");
    if (hotCtx.keys().indexOf('./log') !== -1) {
      hotCtx('./log').setLogLevel(level);
    }
    switch (level) {
      case INFO:
      case ERROR:
        log.setLevel(level);
        break;
      case WARNING:
        // loglevel's warning name is different from webpack's
        log.setLevel('warn');
        break;
      case NONE:
        log.disableAll();
        break;
      default:
        log.error('[WDS] Unknown clientLogLevel \'' + level + '\'');
    }
  },
  overlay: function overlay(value) {
    if (typeof document !== 'undefined') {
      if (typeof value === 'boolean') {
        useWarningOverlay = false;
        useErrorOverlay = value;
      } else if (value) {
        useWarningOverlay = value.warnings;
        useErrorOverlay = value.errors;
      }
    }
  },
  progress: function progress(_progress) {
    if (typeof document !== 'undefined') {
      useProgress = _progress;
    }
  },

  'progress-update': function progressUpdate(data) {
    if (useProgress) log.info('[WDS] ' + data.percent + '% - ' + data.msg + '.');
    sendMsg('Progress', data);
  },
  ok: function ok() {
    sendMsg('Ok');
    if (useWarningOverlay || useErrorOverlay) overlay.clear();
    if (initial) return initial = false; // eslint-disable-line no-return-assign
    reloadApp();
  },

  'content-changed': function contentChanged() {
    log.info('[WDS] Content base changed. Reloading...');
    self.location.reload();
  },
  warnings: function warnings(_warnings) {
    log.warn('[WDS] Warnings while compiling.');
    var strippedWarnings = _warnings.map(function (warning) {
      return stripAnsi(warning);
    });
    sendMsg('Warnings', strippedWarnings);
    for (var i = 0; i < strippedWarnings.length; i++) {
      log.warn(strippedWarnings[i]);
    }
    if (useWarningOverlay) overlay.showMessage(_warnings);

    if (initial) return initial = false; // eslint-disable-line no-return-assign
    reloadApp();
  },
  errors: function errors(_errors) {
    log.error('[WDS] Errors while compiling. Reload prevented.');
    var strippedErrors = _errors.map(function (error) {
      return stripAnsi(error);
    });
    sendMsg('Errors', strippedErrors);
    for (var i = 0; i < strippedErrors.length; i++) {
      log.error(strippedErrors[i]);
    }
    if (useErrorOverlay) overlay.showMessage(_errors);
    initial = false;
  },
  error: function error(_error) {
    log.error(_error);
  },
  close: function close() {
    log.error('[WDS] Disconnected!');
    sendMsg('Close');
  }
};

var hostname = urlParts.hostname;
var protocol = urlParts.protocol;

// check ipv4 and ipv6 `all hostname`
if (hostname === '0.0.0.0' || hostname === '::') {
  // why do we need this check?
  // hostname n/a for file protocol (example, when using electron, ionic)
  // see: https://github.com/webpack/webpack-dev-server/pull/384
  // eslint-disable-next-line no-bitwise
  if (self.location.hostname && !!~self.location.protocol.indexOf('http')) {
    hostname = self.location.hostname;
  }
}

// `hostname` can be empty when the script path is relative. In that case, specifying
// a protocol would result in an invalid URL.
// When https is used in the app, secure websockets are always necessary
// because the browser doesn't accept non-secure websockets.
if (hostname && (self.location.protocol === 'https:' || urlParts.hostname === '0.0.0.0')) {
  protocol = self.location.protocol;
}

var socketUrl = url.format({
  protocol: protocol,
  auth: urlParts.auth,
  hostname: hostname,
  port: urlParts.port,
  pathname: urlParts.path == null || urlParts.path === '/' ? '/sockjs-node' : urlParts.path
});

socket(socketUrl, onSocketMsg);

var isUnloading = false;
self.addEventListener('beforeunload', function () {
  isUnloading = true;
});

function reloadApp() {
  if (isUnloading || !hotReload) {
    return;
  }
  if (_hot) {
    log.info('[WDS] App hot update...');
    // eslint-disable-next-line global-require
    var hotEmitter = __webpack_require__(/*! webpack/hot/emitter */ "./node_modules/webpack/hot/emitter.js");
    hotEmitter.emit('webpackHotUpdate', currentHash);
    if (typeof self !== 'undefined' && self.window) {
      // broadcast update to window
      self.postMessage('webpackHotUpdate' + currentHash, '*');
    }
  } else {
    var rootWindow = self;
    // use parent window for reload (in case we're in an iframe with no valid src)
    var intervalId = self.setInterval(function () {
      if (rootWindow.location.protocol !== 'about:') {
        // reload immediately if protocol is valid
        applyReload(rootWindow, intervalId);
      } else {
        rootWindow = rootWindow.parent;
        if (rootWindow.parent === rootWindow) {
          // if parent equals current window we've reached the root which would continue forever, so trigger a reload anyways
          applyReload(rootWindow, intervalId);
        }
      }
    });
  }

  function applyReload(rootWindow, intervalId) {
    clearInterval(intervalId);
    log.info('[WDS] App updated. Reloading...');
    rootWindow.location.reload();
  }
}
/* WEBPACK VAR INJECTION */}.call(this, "?http://localhost:8080"))//# sourceURL=[module]
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9ub2RlX21vZHVsZXMvd2VicGFjay1kZXYtc2VydmVyL2NsaWVudC9pbmRleC5qcz9odHRwOi8vbG9jYWxob3N0OjgwODAuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vKHdlYnBhY2spLWRldi1zZXJ2ZXIvY2xpZW50PzgxZGEiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyogZ2xvYmFsIF9fcmVzb3VyY2VRdWVyeSBXb3JrZXJHbG9iYWxTY29wZSBzZWxmICovXHJcbi8qIGVzbGludCBwcmVmZXItZGVzdHJ1Y3R1cmluZzogb2ZmICovXHJcblxyXG52YXIgdXJsID0gcmVxdWlyZSgndXJsJyk7XHJcbnZhciBzdHJpcEFuc2kgPSByZXF1aXJlKCdzdHJpcC1hbnNpJyk7XHJcbnZhciBsb2cgPSByZXF1aXJlKCdsb2dsZXZlbCcpLmdldExvZ2dlcignd2VicGFjay1kZXYtc2VydmVyJyk7XHJcbnZhciBzb2NrZXQgPSByZXF1aXJlKCcuL3NvY2tldCcpO1xyXG52YXIgb3ZlcmxheSA9IHJlcXVpcmUoJy4vb3ZlcmxheScpO1xyXG5cclxuZnVuY3Rpb24gZ2V0Q3VycmVudFNjcmlwdFNvdXJjZSgpIHtcclxuICAvLyBgZG9jdW1lbnQuY3VycmVudFNjcmlwdGAgaXMgdGhlIG1vc3QgYWNjdXJhdGUgd2F5IHRvIGZpbmQgdGhlIGN1cnJlbnQgc2NyaXB0LFxyXG4gIC8vIGJ1dCBpcyBub3Qgc3VwcG9ydGVkIGluIGFsbCBicm93c2Vycy5cclxuICBpZiAoZG9jdW1lbnQuY3VycmVudFNjcmlwdCkge1xyXG4gICAgcmV0dXJuIGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuZ2V0QXR0cmlidXRlKCdzcmMnKTtcclxuICB9XHJcbiAgLy8gRmFsbCBiYWNrIHRvIGdldHRpbmcgYWxsIHNjcmlwdHMgaW4gdGhlIGRvY3VtZW50LlxyXG4gIHZhciBzY3JpcHRFbGVtZW50cyA9IGRvY3VtZW50LnNjcmlwdHMgfHwgW107XHJcbiAgdmFyIGN1cnJlbnRTY3JpcHQgPSBzY3JpcHRFbGVtZW50c1tzY3JpcHRFbGVtZW50cy5sZW5ndGggLSAxXTtcclxuICBpZiAoY3VycmVudFNjcmlwdCkge1xyXG4gICAgcmV0dXJuIGN1cnJlbnRTY3JpcHQuZ2V0QXR0cmlidXRlKCdzcmMnKTtcclxuICB9XHJcbiAgLy8gRmFpbCBhcyB0aGVyZSB3YXMgbm8gc2NyaXB0IHRvIHVzZS5cclxuICB0aHJvdyBuZXcgRXJyb3IoJ1tXRFNdIEZhaWxlZCB0byBnZXQgY3VycmVudCBzY3JpcHQgc291cmNlLicpO1xyXG59XHJcblxyXG52YXIgdXJsUGFydHMgPSB2b2lkIDA7XHJcbnZhciBob3RSZWxvYWQgPSB0cnVlO1xyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICB2YXIgcXMgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnRvTG93ZXJDYXNlKCk7XHJcbiAgaG90UmVsb2FkID0gcXMuaW5kZXhPZignaG90cmVsb2FkPWZhbHNlJykgPT09IC0xO1xyXG59XHJcbmlmICh0eXBlb2YgX19yZXNvdXJjZVF1ZXJ5ID09PSAnc3RyaW5nJyAmJiBfX3Jlc291cmNlUXVlcnkpIHtcclxuICAvLyBJZiB0aGlzIGJ1bmRsZSBpcyBpbmxpbmVkLCB1c2UgdGhlIHJlc291cmNlIHF1ZXJ5IHRvIGdldCB0aGUgY29ycmVjdCB1cmwuXHJcbiAgdXJsUGFydHMgPSB1cmwucGFyc2UoX19yZXNvdXJjZVF1ZXJ5LnN1YnN0cigxKSk7XHJcbn0gZWxzZSB7XHJcbiAgLy8gRWxzZSwgZ2V0IHRoZSB1cmwgZnJvbSB0aGUgPHNjcmlwdD4gdGhpcyBmaWxlIHdhcyBjYWxsZWQgd2l0aC5cclxuICB2YXIgc2NyaXB0SG9zdCA9IGdldEN1cnJlbnRTY3JpcHRTb3VyY2UoKTtcclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlbGVzcy1lc2NhcGVcclxuICBzY3JpcHRIb3N0ID0gc2NyaXB0SG9zdC5yZXBsYWNlKC9cXC9bXlxcL10rJC8sICcnKTtcclxuICB1cmxQYXJ0cyA9IHVybC5wYXJzZShzY3JpcHRIb3N0IHx8ICcvJywgZmFsc2UsIHRydWUpO1xyXG59XHJcblxyXG5pZiAoIXVybFBhcnRzLnBvcnQgfHwgdXJsUGFydHMucG9ydCA9PT0gJzAnKSB7XHJcbiAgdXJsUGFydHMucG9ydCA9IHNlbGYubG9jYXRpb24ucG9ydDtcclxufVxyXG5cclxudmFyIF9ob3QgPSBmYWxzZTtcclxudmFyIGluaXRpYWwgPSB0cnVlO1xyXG52YXIgY3VycmVudEhhc2ggPSAnJztcclxudmFyIHVzZVdhcm5pbmdPdmVybGF5ID0gZmFsc2U7XHJcbnZhciB1c2VFcnJvck92ZXJsYXkgPSBmYWxzZTtcclxudmFyIHVzZVByb2dyZXNzID0gZmFsc2U7XHJcblxyXG52YXIgSU5GTyA9ICdpbmZvJztcclxudmFyIFdBUk5JTkcgPSAnd2FybmluZyc7XHJcbnZhciBFUlJPUiA9ICdlcnJvcic7XHJcbnZhciBOT05FID0gJ25vbmUnO1xyXG5cclxuLy8gU2V0IHRoZSBkZWZhdWx0IGxvZyBsZXZlbFxyXG5sb2cuc2V0RGVmYXVsdExldmVsKElORk8pO1xyXG5cclxuLy8gU2VuZCBtZXNzYWdlcyB0byB0aGUgb3V0c2lkZSwgc28gcGx1Z2lucyBjYW4gY29uc3VtZSBpdC5cclxuZnVuY3Rpb24gc2VuZE1zZyh0eXBlLCBkYXRhKSB7XHJcbiAgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyAmJiAodHlwZW9mIFdvcmtlckdsb2JhbFNjb3BlID09PSAndW5kZWZpbmVkJyB8fCAhKHNlbGYgaW5zdGFuY2VvZiBXb3JrZXJHbG9iYWxTY29wZSkpKSB7XHJcbiAgICBzZWxmLnBvc3RNZXNzYWdlKHtcclxuICAgICAgdHlwZTogJ3dlYnBhY2snICsgdHlwZSxcclxuICAgICAgZGF0YTogZGF0YVxyXG4gICAgfSwgJyonKTtcclxuICB9XHJcbn1cclxuXHJcbnZhciBvblNvY2tldE1zZyA9IHtcclxuICBob3Q6IGZ1bmN0aW9uIGhvdCgpIHtcclxuICAgIF9ob3QgPSB0cnVlO1xyXG4gICAgbG9nLmluZm8oJ1tXRFNdIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnQgZW5hYmxlZC4nKTtcclxuICB9LFxyXG4gIGludmFsaWQ6IGZ1bmN0aW9uIGludmFsaWQoKSB7XHJcbiAgICBsb2cuaW5mbygnW1dEU10gQXBwIHVwZGF0ZWQuIFJlY29tcGlsaW5nLi4uJyk7XHJcbiAgICAvLyBmaXhlcyAjMTA0Mi4gb3ZlcmxheSBkb2Vzbid0IGNsZWFyIGlmIGVycm9ycyBhcmUgZml4ZWQgYnV0IHdhcm5pbmdzIHJlbWFpbi5cclxuICAgIGlmICh1c2VXYXJuaW5nT3ZlcmxheSB8fCB1c2VFcnJvck92ZXJsYXkpIG92ZXJsYXkuY2xlYXIoKTtcclxuICAgIHNlbmRNc2coJ0ludmFsaWQnKTtcclxuICB9LFxyXG4gIGhhc2g6IGZ1bmN0aW9uIGhhc2goX2hhc2gpIHtcclxuICAgIGN1cnJlbnRIYXNoID0gX2hhc2g7XHJcbiAgfSxcclxuXHJcbiAgJ3N0aWxsLW9rJzogZnVuY3Rpb24gc3RpbGxPaygpIHtcclxuICAgIGxvZy5pbmZvKCdbV0RTXSBOb3RoaW5nIGNoYW5nZWQuJyk7XHJcbiAgICBpZiAodXNlV2FybmluZ092ZXJsYXkgfHwgdXNlRXJyb3JPdmVybGF5KSBvdmVybGF5LmNsZWFyKCk7XHJcbiAgICBzZW5kTXNnKCdTdGlsbE9rJyk7XHJcbiAgfSxcclxuICAnbG9nLWxldmVsJzogZnVuY3Rpb24gbG9nTGV2ZWwobGV2ZWwpIHtcclxuICAgIHZhciBob3RDdHggPSByZXF1aXJlLmNvbnRleHQoJ3dlYnBhY2svaG90JywgZmFsc2UsIC9eXFwuXFwvbG9nJC8pO1xyXG4gICAgaWYgKGhvdEN0eC5rZXlzKCkuaW5kZXhPZignLi9sb2cnKSAhPT0gLTEpIHtcclxuICAgICAgaG90Q3R4KCcuL2xvZycpLnNldExvZ0xldmVsKGxldmVsKTtcclxuICAgIH1cclxuICAgIHN3aXRjaCAobGV2ZWwpIHtcclxuICAgICAgY2FzZSBJTkZPOlxyXG4gICAgICBjYXNlIEVSUk9SOlxyXG4gICAgICAgIGxvZy5zZXRMZXZlbChsZXZlbCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgV0FSTklORzpcclxuICAgICAgICAvLyBsb2dsZXZlbCdzIHdhcm5pbmcgbmFtZSBpcyBkaWZmZXJlbnQgZnJvbSB3ZWJwYWNrJ3NcclxuICAgICAgICBsb2cuc2V0TGV2ZWwoJ3dhcm4nKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBOT05FOlxyXG4gICAgICAgIGxvZy5kaXNhYmxlQWxsKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgbG9nLmVycm9yKCdbV0RTXSBVbmtub3duIGNsaWVudExvZ0xldmVsIFxcJycgKyBsZXZlbCArICdcXCcnKTtcclxuICAgIH1cclxuICB9LFxyXG4gIG92ZXJsYXk6IGZ1bmN0aW9uIG92ZXJsYXkodmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xyXG4gICAgICAgIHVzZVdhcm5pbmdPdmVybGF5ID0gZmFsc2U7XHJcbiAgICAgICAgdXNlRXJyb3JPdmVybGF5ID0gdmFsdWU7XHJcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUpIHtcclxuICAgICAgICB1c2VXYXJuaW5nT3ZlcmxheSA9IHZhbHVlLndhcm5pbmdzO1xyXG4gICAgICAgIHVzZUVycm9yT3ZlcmxheSA9IHZhbHVlLmVycm9ycztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgcHJvZ3Jlc3M6IGZ1bmN0aW9uIHByb2dyZXNzKF9wcm9ncmVzcykge1xyXG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdXNlUHJvZ3Jlc3MgPSBfcHJvZ3Jlc3M7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgJ3Byb2dyZXNzLXVwZGF0ZSc6IGZ1bmN0aW9uIHByb2dyZXNzVXBkYXRlKGRhdGEpIHtcclxuICAgIGlmICh1c2VQcm9ncmVzcykgbG9nLmluZm8oJ1tXRFNdICcgKyBkYXRhLnBlcmNlbnQgKyAnJSAtICcgKyBkYXRhLm1zZyArICcuJyk7XHJcbiAgICBzZW5kTXNnKCdQcm9ncmVzcycsIGRhdGEpO1xyXG4gIH0sXHJcbiAgb2s6IGZ1bmN0aW9uIG9rKCkge1xyXG4gICAgc2VuZE1zZygnT2snKTtcclxuICAgIGlmICh1c2VXYXJuaW5nT3ZlcmxheSB8fCB1c2VFcnJvck92ZXJsYXkpIG92ZXJsYXkuY2xlYXIoKTtcclxuICAgIGlmIChpbml0aWFsKSByZXR1cm4gaW5pdGlhbCA9IGZhbHNlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXJldHVybi1hc3NpZ25cclxuICAgIHJlbG9hZEFwcCgpO1xyXG4gIH0sXHJcblxyXG4gICdjb250ZW50LWNoYW5nZWQnOiBmdW5jdGlvbiBjb250ZW50Q2hhbmdlZCgpIHtcclxuICAgIGxvZy5pbmZvKCdbV0RTXSBDb250ZW50IGJhc2UgY2hhbmdlZC4gUmVsb2FkaW5nLi4uJyk7XHJcbiAgICBzZWxmLmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gIH0sXHJcbiAgd2FybmluZ3M6IGZ1bmN0aW9uIHdhcm5pbmdzKF93YXJuaW5ncykge1xyXG4gICAgbG9nLndhcm4oJ1tXRFNdIFdhcm5pbmdzIHdoaWxlIGNvbXBpbGluZy4nKTtcclxuICAgIHZhciBzdHJpcHBlZFdhcm5pbmdzID0gX3dhcm5pbmdzLm1hcChmdW5jdGlvbiAod2FybmluZykge1xyXG4gICAgICByZXR1cm4gc3RyaXBBbnNpKHdhcm5pbmcpO1xyXG4gICAgfSk7XHJcbiAgICBzZW5kTXNnKCdXYXJuaW5ncycsIHN0cmlwcGVkV2FybmluZ3MpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHJpcHBlZFdhcm5pbmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGxvZy53YXJuKHN0cmlwcGVkV2FybmluZ3NbaV0pO1xyXG4gICAgfVxyXG4gICAgaWYgKHVzZVdhcm5pbmdPdmVybGF5KSBvdmVybGF5LnNob3dNZXNzYWdlKF93YXJuaW5ncyk7XHJcblxyXG4gICAgaWYgKGluaXRpYWwpIHJldHVybiBpbml0aWFsID0gZmFsc2U7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcmV0dXJuLWFzc2lnblxyXG4gICAgcmVsb2FkQXBwKCk7XHJcbiAgfSxcclxuICBlcnJvcnM6IGZ1bmN0aW9uIGVycm9ycyhfZXJyb3JzKSB7XHJcbiAgICBsb2cuZXJyb3IoJ1tXRFNdIEVycm9ycyB3aGlsZSBjb21waWxpbmcuIFJlbG9hZCBwcmV2ZW50ZWQuJyk7XHJcbiAgICB2YXIgc3RyaXBwZWRFcnJvcnMgPSBfZXJyb3JzLm1hcChmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgcmV0dXJuIHN0cmlwQW5zaShlcnJvcik7XHJcbiAgICB9KTtcclxuICAgIHNlbmRNc2coJ0Vycm9ycycsIHN0cmlwcGVkRXJyb3JzKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaXBwZWRFcnJvcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbG9nLmVycm9yKHN0cmlwcGVkRXJyb3JzW2ldKTtcclxuICAgIH1cclxuICAgIGlmICh1c2VFcnJvck92ZXJsYXkpIG92ZXJsYXkuc2hvd01lc3NhZ2UoX2Vycm9ycyk7XHJcbiAgICBpbml0aWFsID0gZmFsc2U7XHJcbiAgfSxcclxuICBlcnJvcjogZnVuY3Rpb24gZXJyb3IoX2Vycm9yKSB7XHJcbiAgICBsb2cuZXJyb3IoX2Vycm9yKTtcclxuICB9LFxyXG4gIGNsb3NlOiBmdW5jdGlvbiBjbG9zZSgpIHtcclxuICAgIGxvZy5lcnJvcignW1dEU10gRGlzY29ubmVjdGVkIScpO1xyXG4gICAgc2VuZE1zZygnQ2xvc2UnKTtcclxuICB9XHJcbn07XHJcblxyXG52YXIgaG9zdG5hbWUgPSB1cmxQYXJ0cy5ob3N0bmFtZTtcclxudmFyIHByb3RvY29sID0gdXJsUGFydHMucHJvdG9jb2w7XHJcblxyXG4vLyBjaGVjayBpcHY0IGFuZCBpcHY2IGBhbGwgaG9zdG5hbWVgXHJcbmlmIChob3N0bmFtZSA9PT0gJzAuMC4wLjAnIHx8IGhvc3RuYW1lID09PSAnOjonKSB7XHJcbiAgLy8gd2h5IGRvIHdlIG5lZWQgdGhpcyBjaGVjaz9cclxuICAvLyBob3N0bmFtZSBuL2EgZm9yIGZpbGUgcHJvdG9jb2wgKGV4YW1wbGUsIHdoZW4gdXNpbmcgZWxlY3Ryb24sIGlvbmljKVxyXG4gIC8vIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2svd2VicGFjay1kZXYtc2VydmVyL3B1bGwvMzg0XHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWJpdHdpc2VcclxuICBpZiAoc2VsZi5sb2NhdGlvbi5ob3N0bmFtZSAmJiAhIX5zZWxmLmxvY2F0aW9uLnByb3RvY29sLmluZGV4T2YoJ2h0dHAnKSkge1xyXG4gICAgaG9zdG5hbWUgPSBzZWxmLmxvY2F0aW9uLmhvc3RuYW1lO1xyXG4gIH1cclxufVxyXG5cclxuLy8gYGhvc3RuYW1lYCBjYW4gYmUgZW1wdHkgd2hlbiB0aGUgc2NyaXB0IHBhdGggaXMgcmVsYXRpdmUuIEluIHRoYXQgY2FzZSwgc3BlY2lmeWluZ1xyXG4vLyBhIHByb3RvY29sIHdvdWxkIHJlc3VsdCBpbiBhbiBpbnZhbGlkIFVSTC5cclxuLy8gV2hlbiBodHRwcyBpcyB1c2VkIGluIHRoZSBhcHAsIHNlY3VyZSB3ZWJzb2NrZXRzIGFyZSBhbHdheXMgbmVjZXNzYXJ5XHJcbi8vIGJlY2F1c2UgdGhlIGJyb3dzZXIgZG9lc24ndCBhY2NlcHQgbm9uLXNlY3VyZSB3ZWJzb2NrZXRzLlxyXG5pZiAoaG9zdG5hbWUgJiYgKHNlbGYubG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwczonIHx8IHVybFBhcnRzLmhvc3RuYW1lID09PSAnMC4wLjAuMCcpKSB7XHJcbiAgcHJvdG9jb2wgPSBzZWxmLmxvY2F0aW9uLnByb3RvY29sO1xyXG59XHJcblxyXG52YXIgc29ja2V0VXJsID0gdXJsLmZvcm1hdCh7XHJcbiAgcHJvdG9jb2w6IHByb3RvY29sLFxyXG4gIGF1dGg6IHVybFBhcnRzLmF1dGgsXHJcbiAgaG9zdG5hbWU6IGhvc3RuYW1lLFxyXG4gIHBvcnQ6IHVybFBhcnRzLnBvcnQsXHJcbiAgcGF0aG5hbWU6IHVybFBhcnRzLnBhdGggPT0gbnVsbCB8fCB1cmxQYXJ0cy5wYXRoID09PSAnLycgPyAnL3NvY2tqcy1ub2RlJyA6IHVybFBhcnRzLnBhdGhcclxufSk7XHJcblxyXG5zb2NrZXQoc29ja2V0VXJsLCBvblNvY2tldE1zZyk7XHJcblxyXG52YXIgaXNVbmxvYWRpbmcgPSBmYWxzZTtcclxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgaXNVbmxvYWRpbmcgPSB0cnVlO1xyXG59KTtcclxuXHJcbmZ1bmN0aW9uIHJlbG9hZEFwcCgpIHtcclxuICBpZiAoaXNVbmxvYWRpbmcgfHwgIWhvdFJlbG9hZCkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBpZiAoX2hvdCkge1xyXG4gICAgbG9nLmluZm8oJ1tXRFNdIEFwcCBob3QgdXBkYXRlLi4uJyk7XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZ2xvYmFsLXJlcXVpcmVcclxuICAgIHZhciBob3RFbWl0dGVyID0gcmVxdWlyZSgnd2VicGFjay9ob3QvZW1pdHRlcicpO1xyXG4gICAgaG90RW1pdHRlci5lbWl0KCd3ZWJwYWNrSG90VXBkYXRlJywgY3VycmVudEhhc2gpO1xyXG4gICAgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyAmJiBzZWxmLndpbmRvdykge1xyXG4gICAgICAvLyBicm9hZGNhc3QgdXBkYXRlIHRvIHdpbmRvd1xyXG4gICAgICBzZWxmLnBvc3RNZXNzYWdlKCd3ZWJwYWNrSG90VXBkYXRlJyArIGN1cnJlbnRIYXNoLCAnKicpO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICB2YXIgcm9vdFdpbmRvdyA9IHNlbGY7XHJcbiAgICAvLyB1c2UgcGFyZW50IHdpbmRvdyBmb3IgcmVsb2FkIChpbiBjYXNlIHdlJ3JlIGluIGFuIGlmcmFtZSB3aXRoIG5vIHZhbGlkIHNyYylcclxuICAgIHZhciBpbnRlcnZhbElkID0gc2VsZi5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmIChyb290V2luZG93LmxvY2F0aW9uLnByb3RvY29sICE9PSAnYWJvdXQ6Jykge1xyXG4gICAgICAgIC8vIHJlbG9hZCBpbW1lZGlhdGVseSBpZiBwcm90b2NvbCBpcyB2YWxpZFxyXG4gICAgICAgIGFwcGx5UmVsb2FkKHJvb3RXaW5kb3csIGludGVydmFsSWQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJvb3RXaW5kb3cgPSByb290V2luZG93LnBhcmVudDtcclxuICAgICAgICBpZiAocm9vdFdpbmRvdy5wYXJlbnQgPT09IHJvb3RXaW5kb3cpIHtcclxuICAgICAgICAgIC8vIGlmIHBhcmVudCBlcXVhbHMgY3VycmVudCB3aW5kb3cgd2UndmUgcmVhY2hlZCB0aGUgcm9vdCB3aGljaCB3b3VsZCBjb250aW51ZSBmb3JldmVyLCBzbyB0cmlnZ2VyIGEgcmVsb2FkIGFueXdheXNcclxuICAgICAgICAgIGFwcGx5UmVsb2FkKHJvb3RXaW5kb3csIGludGVydmFsSWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhcHBseVJlbG9hZChyb290V2luZG93LCBpbnRlcnZhbElkKSB7XHJcbiAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xyXG4gICAgbG9nLmluZm8oJ1tXRFNdIEFwcCB1cGRhdGVkLiBSZWxvYWRpbmcuLi4nKTtcclxuICAgIHJvb3RXaW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgfVxyXG59Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0EiLCJzb3VyY2VSb290IjoiIn0=
//# sourceURL=webpack-internal:///./node_modules/webpack-dev-server/client/index.js?http://localhost:8080


/*

DELETE LINE 249 ".call(this, "?http://localhost:8080")" in component.js
".call(this, \"?http://localhost:8080\")"

*/