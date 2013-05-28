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
        init: function (attr) {
            attr || (attr = {});

            this.position = { x: 0, y: 0, z: 0 };
            this.rotate   = { x: 0, y: 0, z: 0 };
            this.up       = { x: 0, y: 1, z: 0 };
            this.focus    = attr.focus || this.focus;
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
                z = position.z,
                pers = fl / (fl - z);

            if (pers < 0) {
                pers = 1;
            }

            return {
                x: x * pers,
                y: y * pers,
                z: z * pers,
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
        init: function (vector) {
            this.x = vector[0] || 0;
            this.y = vector[1] || 0;
            this.z = vector[2] || 0;
        },
        setAttribute: function (name, val) {
            this[name] = val;
        },
        getAttribute: function (name) {
            return this[name];
        }
    });

    var Bit3dObject = Class.extend({
        init: function () {}
    });

    var Line = Bit3dObject.extend({
        init: function (vertex1, vertex2, opt) {
            opt || (opt = {});
            this.vertex1 = vertex1;
            this.vertex2 = vertex2;
            this.color = opt.color || '#fff';
        },
        draw: function (ctx, camera) {
            var v1 = camera.applyView(this.vertex1);
            var v2 = camera.applyView(this.vertex2);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.closePath();
            ctx.strokeStyle = this.color;
            ctx.stroke();
            ctx.restore();   
        }
    });
    
    /**
     * Face class.
     * @constructor
     * @param {Array.<Vertex3d>} vertices
     * @param {Object} opt Option data.
     */
    var Face = Bit3dObject.extend({
        init: function (vertices, opt) {
            opt || (opt = {});
            this.vertices = vertices;
            this.color    = opt.color || '#ccc';
            this.strokeColor = opt.strokeColor || '#999';
        },
        draw: function (ctx, camera) {
            var vertices = this.vertices;

            ctx.save();
            ctx.beginPath();
            for (var i = 0, l = vertices.length; i < l; i++) {
                var v = vertices[i];
                v = camera.applyView(v);
                (i === 0) ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y);
            }
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.strokeColor;
            ctx.fill();
            ctx.stroke();
            ctx.restore();   
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
    var Particle = Bit3dObject.extend({
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

    bit3d.Bit3dObject = Bit3dObject;
    bit3d.Camera   = Camera;
    bit3d.Vertex3d = Vertex3d;
    bit3d.Line     = Line;
    bit3d.Face     = Face;
    bit3d.Particle = Particle;
    exports.bit3d  = bit3d;
    
}(window, window.document, window.Class, window));
