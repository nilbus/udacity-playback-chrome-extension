(function(){
    var youtube = chrome.extension.connect({name: "udacity"});
    youtube.onMessage.addListener(function(msg) {
    });

    var speeds = [175, 150, 125, 100, 90, 80, 70];

    var togglePopup = function(button) {
      var o = document.getElementById('speed-button-menu');
      o.style.display = (o.style.display == 'block' ? 'none' : 'block');
    };

    var updateSpeed = function(speed) {
      var button = document.getElementById('speed-update-button');
      button.innerHTML = button.innerHTML.replace(/[0-9]*%/, '' + speed + '%');
      var o = document.getElementById('speed-button-menu');
      o.style.display = (o.style.display == 'block' ? 'none' : 'block');
    };

    var buildOverlay = function(b) {
      var outer = document.createElement('div');
      outer.style.position = "relative";
      outer.onclick = function(e) { e.stopPropagation(); };
      b.parentNode.appendChild(outer);
      var o = document.createElement('div');
      o.id = 'speed-button-menu';
      o.style.position = "absolute";
      o.style.right = "155px";
      o.style.top = "-" + (26 * speeds.length + 1) + "px";
      o.style.width = "98px";
      o.style.zIndex = "1000";
      o.style.backgroundColor = 'gray';
      o.style.display = "none";
      for (var i = 0; i < speeds.length; i++) {
        o.innerHTML += '<div class="button" style="width:98px;" onclick="(' + updateSpeed + ')(' + speeds[i] + '); return false;">' + speeds[i] + "%</div>";
      }
      outer.appendChild(o);
    };

    var buildButton = function(a){
      var b = document.createElement('div');
      b.id = 'speed-update-button'; 
      b.innerHTML = "Speed: <strong>100%</strong>";
      b.style.paddingLeft = "5px";
      b.style.margin = "2px 0px 0px 22px";
      b.style.width = "98px";
      b.className = 'button gray-button';
      b.onclick = function(e) { e.stopPropagation(); togglePopup(b); };
      b.addEventListener('DOMSubtreeModified', function() {
          setTimeout(function() {
            youtube.postMessage({data: b.innerHTML.match(/[0-9]+/)});
          }, 0); },
          false);
      a.parentNode.insertBefore(b, a);
      return a;
    };

    var id_ = setInterval(function() {
      var buttons = document.getElementsByClassName('button gray-button');
      if (buttons.length) {
        clearInterval(id_);
        delete id_;
        var a = buttons[0];
        a.style.width = "98px"; // make some space for the other button
        var b = buildButton(a);
        buildOverlay(b);
      }
    }, 1000);
})();
