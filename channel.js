/*
 * Shuffle messages between udacity and youtube content scripts
 */
(function() {
    var udacity_port, youtube_port;
    chrome.extension.onConnect.addListener(function(port) {
      if (port.name == 'udacity' && !udacity_port) {
        udacity_port = port;
        udacity_port.onMessage.addListener(function(msg) {
          if (youtube_port) {
            youtube_port.postMessage(msg);
          }
        });
      } else if (port.name == 'youtube' && !youtube_port) {
        youtube_port = port;
        youtube_port.onMessage.addListener(function(msg) {
          if (udacity_port) {
            udacity_port.postMessage(msg);
          }
        });
      }
    });
})();
