(function() {
    // connect to the channel
    var port = chrome.extension.connect({name: "youtube" + Math.random()});

    // handle speed update messages
    var updateSpeed = function(msg) {
      if (!msg.data) return;
      var videos = document.getElementsByTagName('video');
      if (videos.length) {
        videos[0].playbackRate = parseInt(msg.data) / 100;
      }
    };
    port.onMessage.addListener(updateSpeed);

    var sendPing = function(video) {
      var currentSpeed = video.playbackRate;
      // assume 100% if we didn't get anything
      currentSpeed = currentSpeed ? parseFloat(currentSpeed) * 100 : 100;
      port.postMessage({data: currentSpeed});
    };

    // Send initial speed ping request along with current speed
    // after the video tag has been loaded
    var id_ = setInterval(function(){
      var videos = document.getElementsByTagName('video');
      if (videos.length) {
        clearInterval(id_);
        delete id_;
        var video = videos[0];
        video.parentNode.addEventListener('DOMSubtreeModified', function() {
          sendPing(video);
        }, false);
        sendPing(video);
      }
    }, 1000);
})();
