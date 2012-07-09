(function(){
    var speeds = [175, 150, 125, 100, 90, 80, 70];

    var togglePopup = function(button) {
      var o = button.lastChild;
      o.style.display = (o.style.display == 'block' ? 'none' : 'block');
    };

    var updateSpeed = function(button, speed) {
      var o = button.lastChild;
      o.style.display = (o.style.display == 'block' ? 'none' : 'block');
    };

    var addOverlay = function(button) {
      var o = document.createElement('div');
      o.style.position = "absolute";
      o.style.right = "25px";
      o.style.top = "-" + (26 * speeds.length + 1) + "px";
      o.style.width = "98px";
      o.style.zIndex = "1000";
      o.style.backgroundColor = 'gray';
      o.style.display = "none";
      for (var i = 0; i < speeds.length; i++) {
        o.innerHTML += '<div class="button" style="width:98px;" onclick="(' + updateSpeed + ')(' + speeds[i] + ');">' + speeds[i] + "%</div>";
      }
      button.appendChild(o);
    };

    var buildButton = function(){
      var b = document.createElement('div');
      b.innerHTML = "Speed: <strong>100%</strong>";
      b.style.paddingLeft = "5px";
      b.style.margin = "2px 0px 0px 22px";
      b.style.width = "98px";
      b.style.position = "relative";
      b.className = 'button gray-button';
      b.onclick = function(e) { e.stopPropagation(); };
      b.onmouseover = b.onmouseout = function(e) { togglePopup(b); };
      return b;
    };

    var id_ = setInterval(function() {
      var buttons = document.getElementsByClassName('button gray-button');
      if (buttons.length) {
        clearInterval(id_);
        delete id_;
        var a = buttons[0];
        a.style.width = "98px"; // make some space for the other button
        var b = buildButton();
        a.parentNode.insertBefore(b, a);
        addOverlay(b);
      }
    }, 1000);
})();
