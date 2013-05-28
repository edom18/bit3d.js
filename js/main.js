(function (win, doc, bit3d) {

    var cv = null;
    var ctx = null;
    var w = 0;
    var h = 0;
    var camera = new bit3d.Camera();
    var random = Math.random;
    var facies = [];

    var face_pos = [
        [
            [-50, -50, 10],
            [ 50, -50, 10],
            [ 50,  50, 10],
            [-50,  50, 10]
        ],
        [
            [-150, -150, 10],
            [ -50, -150, 10],
            [ -50,  -50, 10],
            [-150,  -50, 10]
        ],
        [
            [-50, -50, 100],
            [ 50, -50, 100],
            [ 50,  50, 100],
            [-50,  50, 100]
        ],
        [
            [ 50,  50, -100],
            [100,  50, 10],
            [100, 100, 10],
            [ 50, 100, -100]
        ]
    ];

    function init() {
        cv  = doc.getElementById('cv');
        ctx = cv.getContext('2d');
        w = cv.width = win.innerWidth;
        h = cv.height = win.innerHeight;

        for (var i = 0, l = face_pos.length; i < l; i++) {
            var pos = face_pos[i];
            var v1 = new bit3d.Vertex3d(pos[0]);
            var v2 = new bit3d.Vertex3d(pos[1]);
            var v3 = new bit3d.Vertex3d(pos[2]);
            var v4 = new bit3d.Vertex3d(pos[3]);
            var face = new bit3d.Face([v1, v2, v3, v4]);
            facies.push(face);
        }

        setEvents();
        draw();
    }

    function draw() {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'rgba(30, 30, 30, 0.5)';
        ctx.fillRect(0, 0, w, h);

        //Set center view port.
        ctx.translate(w / 2, h / 2);

        for (var i = 0, l = facies.length; i < l; i++) {
            facies[i].draw(ctx, camera);
        }

        ctx.restore();   
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

            camera.rotate.x += y;
            camera.rotate.y -= x;

            prevX = e.pageX;
            prevY = e.pageY;

            draw();
        }, false);

        doc.addEventListener(M_UP, function (e) {
            dragging = false;
        }, false);   
    }

    doc.addEventListener('DOMContentLoaded', init, false);

}(window, window.document, window.bit3d));
