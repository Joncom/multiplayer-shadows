// Algorthym found here:
// http://roguebasin.roguelikedevelopment.org/index.php?title=C%2B%2B_shadowcasting_implementation
ig.module('plugins.joncom.shadow-casting.shadow-map')
.requires('impact.background-map')
.defines(function(){ "use strict";

    // TODO: Is shadow-map more like a map
    //       than a background-map?
    ig.ShadowMap = ig.BackgroundMap.extend({

        multipliers: [
            [1, 0, 0, -1, -1, 0, 0, 1],
            [0, 1, -1, 0, 0, -1, 1, 0],
            [0, 1, 1, 0, 0, -1, -1, 0],
            [1, 0, 0, 1, -1, 0, 0, -1]
        ],

        blackout: function() {
            for(var y=0; y<this.height; y++) {
                for(var x=0; x<this.width; x++) {
                    this.data[y][x] = 5;
                }
            }
        },

        set_visible: function(x, y, visible) {
            this.data[y][x] = (visible ? 0 : 5);
        },

        is_opaque: function(x, y) {
            return ig.game.collisionMap.data[y][x] !== 0;
        },

        cast_light: function(x, y, radius, row, start_slope, end_slope, xx, xy, yx, yy) {
            if (start_slope < end_slope) {
                return;
            }
            var next_start_slope = start_slope;
            for (var i = row; i <= radius; i++) {
                var blocked = false;
                for (var dx = -i, dy = -i; dx <= 0; dx++) {
                    var l_slope = (dx - 0.5) / (dy + 0.5);
                    var r_slope = (dx + 0.5) / (dy - 0.5);
                    if (start_slope < r_slope) {
                        continue;
                    } else if (end_slope > l_slope) {
                        break;
                    }
                    var sax = dx * xx + dy * xy;
                    var say = dx * yx + dy * yy;
                    if ((sax < 0 && parseInt(Math.abs(sax), 10) > x) ||
                            (say < 0 && parseInt(Math.abs(say), 10) > y)) {
                        continue;
                    }
                    var ax = x + sax;
                    var ay = y + say;
                    if (ax >= this.width || ay >= this.height) {
                        continue;
                    }
                    var radius2 = radius * radius;
                    if (parseInt(dx * dx + dy * dy, 10) < radius2) {
                        this.set_visible(ax, ay, true);
                    }
                    if (blocked) {
                        if (this.is_opaque(ax, ay)) {
                            next_start_slope = r_slope;
                            continue;
                        } else {
                            blocked = false;
                            start_slope = next_start_slope;
                        }
                    } else if (this.is_opaque(ax, ay)) {
                        blocked = true;
                        next_start_slope = r_slope;
                        this.cast_light(x, y, radius, i + 1, start_slope, l_slope, xx,
                                xy, yx, yy);
                    }
                }
                if (blocked) {
                    break;
                }
            }
        },

        do_fov: function(x, y, radius) {
            this.set_visible(x, y, true); // Origin always visible!
            for (var i = 0; i < 8; i++) {
                this.cast_light(x, y, radius, 1, 1.0, 0.0, this.multipliers[0][i],
                        this.multipliers[1][i], this.multipliers[2][i], this.multipliers[3][i]);
            }
        },

        tile_is_lit: function(x, y) {
            return this.data[y][x] === 0;
        },

        _drawColumn: function (x, y, tiles) {
            ig.system.context.fillStyle = 'black';
            ig.system.context.fillRect(this._realSize(x),
                this._realSize(y), this._realSize(1), this._realSize(tiles));
        },

        _realSize: function (number) {
            // TODO: Tilesize should be known already?
            var tilesize = ig.game.collisionMap.tilesize;
            return number * tilesize * ig.system.scale;
        },

        draw: function() {
            var columns = [];
            var column = null;

            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    if (!column) {
                        column = { x: x, y: y, tiles: 0 };
                    }
                    if (this.tile_is_lit(x, y) && column.tiles > 0) {
                        columns.push(column);
                        column = null;
                    } else if (this.tile_is_lit(x, y) && column.tiles === 0) {
                        column = null;
                    } else if (y + 1 === this.height) {
                        column.tiles++;
                        columns.push(column);
                        column = null;
                    } else {
                        column.tiles++;
                    }
                }
            }

            for (var i = 0; i < columns.length; i++) {
                var col = columns[i];
                this._drawColumn(col.x, col.y, col.tiles);
            }

            var tilesize = ig.game.collisionMap.tilesize;
            for(var y=0; y<this.height; y++) {
                for(var x=0; x<this.width; x++) {
                    var tile = this.data[y][x];
                    this.tiles.drawTile(x * tilesize, y * tilesize, tile, tilesize);
                }
            }
        }

    });

});