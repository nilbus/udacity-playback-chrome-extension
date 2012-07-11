(function() {
    // connect to the channel
    var port = chrome.extension.connect({name: "youtube"});

    // handle speed update messages
    var updateSpeed = function(msg) {
      if (!msg.data) return;
      var videos = document.getElementsByTagName('video');
      if (videos.length) {
        videos[0].playbackRate = parseInt(msg.data) / 100;
      }
    };
    port.onMessage.addListener(updateSpeed);

    // Send initial speed ping request along with current speed
    setTimeout(function(){
      var videos = document.getElementsByTagName('video');
      if (videos.length) {
        var currentSpeed = videos[0].playbackRate;
        // assume 100% if we didn't get anything
        currentSpeed = currentSpeed ? parseFloat(currentSpeed) * 100 : 100;
        port.postMessage({data: currentSpeed});
      }
    }, 1000);
})();
