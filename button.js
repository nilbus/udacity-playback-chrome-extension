var speeds = [200, 175, 150, 125, 100, 90, 80, 70];

// Connect to the channel
var youtube = chrome.runtime.connect({name: "udacity" + Math.random()});

// Retrieve current course from the URL
var currentCourse = function() {
  return window.location.hash.split("/")[1];
};

// localStorage getter wrapper
// Format: {course_id : {type1: speed, type2: speed}, ...}
// Leave some room to set different speeds for different
// lectures within the same course
// (some of the TA's talk *much* slower than the profs)
var getFromLocalStorage = function() {
  var LS = JSON.parse(localStorage.getItem('playbackRate')) || {};
  if (LS && LS[currentCourse()]) {
    return LS[currentCourse()]['main'];
  }
};

// localStorage setter wrapper
var updateLocalStorage = function(speed) {
  var LS = JSON.parse(localStorage.getItem('playbackRate')) || {};
  LS[currentCourse()] = {main: speed};
  localStorage.setItem('playbackRate', JSON.stringify(LS));
};

// Show/hide speed selection menu
var togglePopup = function(button) {
  var menu = document.getElementById('speed-button-menu');
  if (menu) {
    button.removeChild(menu);
  } else {
    button.appendChild(buildDropdown());
  }
};

// Send the update event to the playback content script,
// save to localStorage and update video speed display on the button.
// Things have a chance of getting out of sync here if the playback
// content script fails to set the speed, but it seems too cumbersome
// to set up the callback chain needed to verify it so we just
// plow ahead here.
var updateSpeed = function(speed) {
  try {
    youtube.postMessage({data: speed});
  } catch (e) {
    youtube = chrome.runtime.connect({name: "udacity" + Math.random()});
    youtube.postMessage({data: speed});
  }
  var button = document.getElementById('speed-update-button');
  if (button) {
    button.innerHTML = button.innerHTML.replace(/[0-9]*%/, '' + speed + '%');
  }
  updateLocalStorage(speed);
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

// Set up the dropdown menu
var buildDropdown = function() {
  // Generate the outer container
  var container = document.createElement('div');
  container.className = "lesson-dropdown";
  container.style.display = "block";
  container.style.width = "140px";
  container.id = "speed-button-menu";

  // Generate the actual menu. We want to float it above the button
  // while not being part of the button, hence all the round-aboutedness
  var dropdownList = document.createElement("ul");
  dropdownList.className = "lesson-dropdown-list speed-dropdown-list";
  dropdownList.style.width = "130px";

  // Generate all the menu entries
  for (var i = 0; i < speeds.length; i++) {
    var entry = document.createElement("li");
    entry.className = "speed-button-entry";
    entry.style.width = "120px";
    entry.addEventListener("click", function(e) {
      var speed = this.innerHTML.match(/[0-9]+/);
      if (speed) {
        updateSpeed(speed);
      }
    }, false);
    dropdownList.appendChild(entry);
    var text = document.createElement('div');
    text.innerHTML = "" + speeds[i] + '%';
    entry.appendChild(text);
  }
  container.appendChild(dropdownList);
  return container;
};

// Generate the speed toggle dropdown, immitating the lesson dropdown
var buildButton = function(a){
  var outer = document.createElement('div');
  var speed = getFromLocalStorage();
  outer.id = 'speed-update-button';
  outer.className = a.className;
  outer.addEventListener('click', function(e) {
    togglePopup(outer);
    e.stopPropagation();
  }, false);
  a.parentNode.appendChild(outer);
  var button = document.createElement('div');
  button.className = a.getElementsByTagName('div')[0].className;
  var titleContainer = document.createElement('div');
  titleContainer.className = 'dropdown-menu-toggle-container';
  var title = document.createElement('div');
  title.className = 'dropdown-menu-toggle-title';
  title.innerHTML = "Speed: " + (speed ? speed : "100") + "%";
  var caret = document.createElement('div');
  caret.className = 'dropdown-menu-toggle-icon';
  caret.innerHTML = "<b class=\"caret\"></b>";
  titleContainer.appendChild(title);
  titleContainer.appendChild(caret);
  button.appendChild(titleContainer);
  outer.appendChild(button);
  return a;
};

// Set callback to send video speed to the playback content script
youtube.onMessage.addListener(speedPingCallback);

// wait until the autoplay button has loaded in order to get
// the right positioning info
var id_ = setInterval(function() {
  var buttons = document.getElementsByClassName('lesson-switcher');
  if (buttons.length > 0) {
    // yay, the lesson switcher button is here, kill the interval
    clearInterval(id_);
    delete id_;
    buildButton(buttons[0]);
  }
}, 1000);
