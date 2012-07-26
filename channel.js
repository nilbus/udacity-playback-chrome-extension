/*
 * Background page script.
 * Shuffle messages between udacity and youtube content scripts
 * and intercepts YouTube embed request headers to force HTML5 playback
 */
var udacity_ports = [];
var youtube_ports = [];

// Update the YouTube PREF cookie to request HTML5 version of the embed
// I've tried passing in html5=1 URL param but if the PREF cookie is
// set it seems to take precedence so that wasn't enough.
// This approach seems to more reliable..
chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details){
    var header;
    for (var i = 0; i < details.requestHeaders.length; i++) {
      header = details.requestHeaders[i];
      if (header.name === 'Cookie' && header.value.match(/PREF=/) &&
          !header.value.match(/f2=40000000/)) {
          if (header.value.match(/f3=[0-9]*/)) {
            header.value = header.value.replace(/f3=[0-9]*/, 'f2=40000000')
          } else {
            var f1 = header.value.match(/f1=[0-9]*/);
            if (f1.length) {
              f1 = f1[0];
              header.value = header.value.replace(f1, f1 + '&f2=40000000')
            }
          }
        return {requestHeaders: details.requestHeaders};
      }
    }
  },
  {urls: ["*://www.youtube.com/embed/*"]},
  ["blocking", "requestHeaders"]
);

var handleConnection = function(port, from, to) {
  var idx = from.length;
  from[idx] = port;
  port.onMessage.addListener(function(msg) {
    if (to.length > idx) {
      to[idx].postMessage(msg);
    }
  });
  port.onDisconnect.addListener(function() {
    from.splice(idx, 1);
  });
};

chrome.extension.onConnect.addListener(function(port) {
  try {
    if (port.name.match(/^udacity/) && !udacity_ports.indexOf(port) >= 0) {
      handleConnection(port, udacity_ports, youtube_ports);
    } else if (port.name.match(/^youtube/) && !youtube_ports.indexOf(port) >= 0) {
      handleConnection(port, youtube_ports, udacity_ports);
    }
  } catch (e) {
    alert('Udacity Speed Extension background page error: ' + e);
  }
});
