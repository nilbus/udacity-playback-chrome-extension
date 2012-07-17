/*
 * Shuffle messages between udacity and youtube content scripts
 */
var udacity_ports = [];
var youtube_ports = [];

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
