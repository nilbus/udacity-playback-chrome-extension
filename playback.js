(function() {

    var videos = document.getElementsByTagName('video');
    if (videos.length) {
      setInterval(function() {
        videos[0].playbackRate = 0.75;
      }, 0);
    }
})();
