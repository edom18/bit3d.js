(function (win, doc, Class, exports) {
    
    'use strict';

    /* ---------------------------------
        IMPORT
    ------------------------------------ */
    var cos    = Math.cos,
        sin    = Math.sin,
        abs    = Math.abs,
        PI     = Math.PI,
        sqrt   = Math.sqrt,
        floor  = Math.floor,
        pow    = Math.pow,
        random = Math.random;

    //namespace
    var bit3d = {};

    /**
     * Camera data.
     */
    var Camera = Class.extend({
        focus: 300,
        init: function () {
            this.position = {
                x: 0,
                y: 0,
                z: 0
            };
            this.rotate = {
                x: 0,
                y: 0,
                z: 0
            };
            this.up = {
                x: 0,
                y: 1,
                z: 0
            };
        },
        applyView: function (target) {
            var ret = target;
            
            ret = this.applyRotate(ret);
            ret = this.applyTranslate(ret);
            ret = this.perspective(ret);

            return ret;
        },
        applyRotate: function (target) {

            var xrad = this.rotate.x * PI / 180,
                yrad = this.rotate.y * PI / 180,
                zrad = this.rotate.z * PI / 180,
                ret = target;

            ret = affine.rotate.x(xrad, ret);
            ret = affine.rotate.y(yrad, ret);
            ret = affine.rotate.z(zrad, ret);

            return ret;
        },
        applyTranslate: function (target) {

            var x = this.position.x,
                y = this.position.y,
                z = this.position.z;

            return {
                x: target.x - x,
                y: target.y - y,
                z: target.z - z
            };
        },
        perspective: function (position) {

            var fl = (this.focus - this.position.z) || 0.00001,
                x = position.x,
                y = position.y,
                z = position.z;

            return {
                x: x * (fl / (fl - z)),
                y: y * (fl / (fl - z)),
                z: z * (fl / (fl - z)),
                w: z
            };
        }
    });


    /**
     * Vertex 3d class.
     * @constructor
     * @extend Class
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    var Vertex3d = Class.extend({
        init: function (x, y, z) {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        },
        setAttribute: function (name, val) {
            this[name] = val;
        },
        getAttribute: function (name) {
            return this[name];
        }
    });
    

    /**
     * Particle class
     * @constructor
     * @extend Vertex3d
     * @param {number} x x position.
     * @param {number} y y position.
     * @param {number} z z position.
     * @param {Object} opt An option data.
     */
    var Particle = Vertex3d.extend({
        init: function (x, y, z, opt) {
            this._super.apply(this, arguments);
            
            opt || (opt = {});
            
            this.size = opt.size || 5;
            this.sp   = opt.sp || 5;
            this.color = opt.color || 'red';
        },
        update: function () {
            var temp = affine.rotate.y(this.sp / 10 * PI / 180, this);
            this.x = temp.x;
            this.y = temp.y;
            this.z = temp.z;
        },
        draw: function (ctx, camera) {
            var m = camera.applyView(this);
            m.r = this.size;
            
            var d = abs(m.z / m.w);
    
            ctx.save();
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.r * d, 0, PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = d;
            ctx.fill();
            ctx.closePath();
            ctx.restore();   
        }
    });

    
    /**
     * Affine methods.
     */
    var affine = {
        rotate: {
            x: function (rad, position) {
                return {
                    x: position.x,
                    y: position.y *  cos(rad) + position.z * sin(rad),
                    z: position.y * -sin(rad) + position.z * cos(rad)
                };
            },
            y: function (rad, position) {
                return {
                    x: position.x * cos(rad) + position.z * -sin(rad),
                    y: position.y,
                    z: position.x * sin(rad) + position.z * cos(rad)
                };
            },
            z: function (rad, position) {
                return {
                    x: position.x *  cos(rad) + position.y * sin(rad),
                    y: position.x * -sin(rad) + position.y * cos(rad),
                    z: position.z
                };
            }
        }
    };

    bit3d.Camera   = Camera;
    bit3d.Vertex3d = Vertex3d;
    bit3d.Particle = Particle;
    exports.bit3d  = bit3d;
    
}(window, window.document, window.Class, window));
