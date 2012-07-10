(function() {
    var port = chrome.extension.connect({name: "youtube"});
    port.onMessage.addListener(function(msg) {
      var videos = document.getElementsByTagName('video');
      if (videos.length && msg.data) {
        videos[0].playbackRate = parseInt(msg.data) / 100;
      }
    });
})();
