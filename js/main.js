(function (win, doc, bit3d) {

    var cv = null;
    var ctx = null;
    var w = 0;
    var h = 0;
    var point = null;
    var particles = [];
    var particleNum = 300;
    var camera = new bit3d.Camera();
    var random = Math.random;

    function init() {
        
        cv  = doc.getElementById('cv');
        ctx = cv.getContext('2d');
        w = cv.width = win.innerWidth;
        h = cv.height = win.innerHeight;
        
        for (var i = 0; i < particleNum; i++) {
            var size = ~~(random() * 10) + 5;
            var x = ~~(random() * w) - w / 2;
            var y = ~~(random() * h) - h / 2;
            var z = ~~(random() * 1000);
            var sp = ~~(random() * 2);
            var r = ~~(random() * 255);
            var g = ~~(random() * 255);
            var b = ~~(random() * 255);
            var color = 'rgb(' + r + ', ' + g + ', ' + b + ')';
            var p = new bit3d.Particle(x, y, z, {
                size: size,
                sp: sp,
                color: color
            });
            particles.push(p);
        }
        
        setEvents();

        loop();
    }
    
    function setEvents() {
    
        var isTouch = 'ontouchstart' in window;
        var M_DOWN = isTouch ? 'touchstart' : 'mousedown';
        var M_MOVE = isTouch ? 'touchmove'  : 'mousemove';
        var M_UP   = isTouch ? 'touchend'   : 'mouseup';

        var prevX = 0;
        var prevY = 0;
        var dragging = false;

        doc.addEventListener(M_DOWN, function (e) {
            dragging = true;
            prevX = (isTouch ? e.touches[0].pageX : e.pageX);
            prevY = (isTouch ? e.touches[0].pageY : e.pageY);
            e.preventDefault();
            return false;
        });
        doc.addEventListener(M_MOVE, function (e) {

            if (!dragging) {
                return;
            }

            var x = (isTouch ? e.touches[0].pageX : e.pageX) - prevX;
            var y = (isTouch ? e.touches[0].pageY : e.pageY) - prevY;

            camera.rotate.x -= x;
            camera.rotate.y -= y;

            prevX = e.pageX;
            prevY = e.pageY;
        }, false);

        doc.addEventListener(M_UP, function (e) {
            dragging = false;
        }, false);   
    }
    
    function drawAxis() {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = '#333';
        ctx.moveTo(0, cv.height / 2);
        ctx.lineTo(cv.width, cv.height / 2);
        ctx.moveTo(cv.width / 2, 0);
        ctx.lineTo(cv.width / 2, cv.height);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }
    
    function loop() {
        //camera.rotate.x += 1;
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'rgba(30, 30, 30, 0.5)';
        ctx.fillRect(0, 0, w, h);

        //drawAxis();

        //Set center view port.
        ctx.translate(w / 2, h / 2);
        
        for (var i = 0, l = particles.length; i < l; i++) {
            var p = particles[i];
            p.update();
            p.draw(ctx, camera);
        }
        
        ctx.restore();
        setTimeout(loop, 16);
    }

    doc.addEventListener('DOMContentLoaded', init, false);

}(window, window.document, window.bit3d));
