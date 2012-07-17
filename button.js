(function(){
    var speeds = [175, 150, 125, 100, 90, 80, 70];

    // Connect to the channel
    var youtube = chrome.extension.connect({name: "udacity" + Math.random()});

    // Retrieve current course from the URL
    var currentCourse = function() {
      return window.location.hash.replace(/Unit.*/, '');
    };

    // localStorage getter wrapper
    // Format: {course_id : {type1: speed, type2: speed}, ...}
    // Leave some room to set different speeds for different
    // lectures within the same course
    // (some of the TA's talk *much* slower than the profs)
    var getFromLocalStorage = function() {
      var LS = JSON.parse(localStorage.getItem('playbackRate'));
      if (LS && LS[currentCourse()]) {
        return LS[currentCourse()]['main'];
      }
    };

    // localStorage setter wrapper
    var updateLocalStorage = function(speed) {
      var LS = {};
      LS[currentCourse()] = {main: speed};
      localStorage.setItem('playbackRate', JSON.stringify(LS));
    };

    // Show/hide speed selection menu
    var togglePopup = function(button) {
      var menu = document.getElementById('speed-button-menu');
      menu.style.display = (menu.style.display == 'block' ? 'none' : 'block');
    };

    // Send the update event to the playback content script,
    // save to localStorage and update video speed display on the button.
    // Things have a chance of getting out of sync here if the playback
    // content script fails to set the speed, but it seems too cumbersome
    // to set up the callback chain needed to verify it so we just
    // plow ahead here.
    var updateSpeed = function(speed) {
      youtube.postMessage({data: speed});
      var button = document.getElementById('speed-update-button');
      button.innerHTML = button.innerHTML.replace(/[0-9]*%/, '' + speed + '%');
      updateLocalStorage(speed);
      togglePopup();
    };

    // Send video speed info to the playback content script
    var speedPingCallback = function(msg) {
      setTimeout(function() {
        var speed = getFromLocalStorage();
        if (speed != msg.data) {
          youtube.postMessage({data: speed ? speed : 100});
        }
      }, 0);
    };

    // Set up the menu overlay
    var buildMenuOverlay = function(button) {
      // Generate the outer container
      var container = document.createElement('div');
      // can't do this with CSS, position relative/absolute relationship
      // with the inner div doesn't seem to get set up properly unless
      // this is set directly :/
      container.style.position = 'relative';
      button.parentNode.appendChild(container);

      // Generate the actual menu. We want to float it above the button
      // while not being part of the button, hence all the round-aboutedness
      var menu = document.createElement('div');
      menu.id = 'speed-button-menu';
      menu.style.top = "-" + (26 * speeds.length + 1) + "px";

      // Generate all the menu entries
      for (var i = 0; i < speeds.length; i++) {
        var entry = document.createElement('div');
        entry.className = 'button';
        entry.style.width = '98px';
        entry.innerHTML = '' + speeds[i] + '%';
        entry.addEventListener('click', function(e) {
          var speed = this.innerHTML.match(/[0-9]+/);
          if (speed) { updateSpeed(speed); }
          e.stopPropagation();
        }, false);
        menu.appendChild(entry);
      }
      container.appendChild(menu);
    };

    // Generate the speed toggle button, immitating the autoplay button
    var buildButton = function(a){
      var button = document.createElement('div');
      var speed = getFromLocalStorage();
      button.id = 'speed-update-button'; 
      button.innerHTML = "Speed: <strong>" + (speed ? speed : "100") +"%</strong>";
      button.className = 'button gray-button';
      button.addEventListener('click', function(e) {
        togglePopup(button);
        e.stopPropagation();
      }, false);
      a.parentNode.insertBefore(button, a);
      return a;
    };

    // Set callback to send video speed to the playback content script
    youtube.onMessage.addListener(speedPingCallback);

    // wait until the autoplay button has loaded in order to get
    // the right positioning info
    var id_ = setInterval(function() {
      var buttons = document.getElementsByClassName('button gray-button');
      if (buttons.length) {
        // yay, the autoplay button is here, kill the interval
        clearInterval(id_);
        delete id_;
        var autoPlayButton = buttons[0];
        // make some space for the other button
        autoPlayButton.style.width = "98px";
        var button = buildButton(autoPlayButton);
        buildMenuOverlay(button);
      }
    }, 1000);
})();
