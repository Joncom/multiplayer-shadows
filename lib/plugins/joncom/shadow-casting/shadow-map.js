// Algorthym found here:
// http://roguebasin.roguelikedevelopment.org/index.php?title=C%2B%2B_shadowcasting_implementation
ig.module('plugins.joncom.shadow-casting.shadow-map')
.requires('impact.map')
.defines(function(){ "use strict";

    ig.ShadowMap = ig.Map.extend({

        multipliers: [
            [1, 0, 0, -1, -1, 0, 0, 1],
            [0, 1, -1, 0, 0, -1, 1, 0],
            [0, 1, 1, 0, 0, -1, -1, 0],
            [1, 0, 0, 1, -1, 0, 0, -1]
        ],

        draw: function() {
            var columns = [];
            var column = null;
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    var reached_bottom = (y === this.height - 1);
                    var darkness = Math.floor((this.data[y][x] / 100) * 4) / 4;
                    if (!column) {
                        column = { x: x, y: y, tiles: 1, darkness: darkness };
                        if(reached_bottom) {
                            columns.push(column);
                            column = null;
                            continue;
                        }
                    } else {
                        var changed_darkness = column.darkness !== darkness;
                        if(reached_bottom && changed_darkness) {
                            columns.push(column);
                            column = { x: x, y: y, tiles: 1, darkness: darkness };
                            columns.push(column);
                            column = null;
                        } else if(reached_bottom && !changed_darkness) {
                            column.tiles++;
                            columns.push(column);
                            column = null;
                        } else if(!reached_bottom && changed_darkness) {
                            columns.push(column);
                            column = { x: x, y: y, tiles: 1, darkness: darkness };
                        } else if(!reached_bottom && !changed_darkness) {
                            column.tiles++;
                        }
                    }
                }
            }
            for (var i = 0; i < columns.length; i++) {
                var col = columns[i];
                this._drawColumn(col.x, col.y, col.tiles, col.darkness);
            }
        },

        _drawColumn: function (x, y, tiles, alpha) {
            ig.system.context.fillStyle = "rgba(0, 0, 0, " + alpha + ")";
            ig.system.context.fillRect(
                this._realSize(x) - ig.game.screen.x * ig.system.scale,
                this._realSize(y) - ig.game.screen.y * ig.system.scale,
                this._realSize(1),
                this._realSize(tiles));
            ig.Image.drawCount++;
        },

        do_fov: function(x, y, radius) {
            if( x < 0 || y < 0 || x >= this.width || y >= this.height) {
                return; // Nothing to do if outside map.
            }
            this.set_darkness(x, y, 0); // Origin always visible!
            for (var i = 0; i < 8; i++) {
                this.cast_light(x, y, radius, 1, 1.0, 0.0, this.multipliers[0][i],
                        this.multipliers[1][i], this.multipliers[2][i], this.multipliers[3][i]);
            }
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
                    var distance_from_origin = parseInt(dx * dx + dy * dy, 10);
                    if (distance_from_origin < radius2) {
                        var darkness = Math.floor((distance_from_origin / radius2)*100);
                        this.set_darkness(ax, ay, darkness);
                    }
                    var is_opaque = this.is_opaque(ax, ay);
                    if (blocked && is_opaque) {
                        next_start_slope = r_slope;
                        continue;
                    }
                    else if(blocked && !is_opaque) {
                        blocked = false;
                        start_slope = next_start_slope;
                    }
                    else if (!blocked && is_opaque) {
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

        blackout: function() {
            for(var y=0; y<this.height; y++) {
                for(var x=0; x<this.width; x++) {
                    this.data[y][x] = 100;
                }
            }
        },

        set_darkness: function(x, y, amount) {
            this.data[y][x] = amount;
        },

        is_opaque: function(x, y) {
            return ig.game.collisionMap.data[y][x] !== 0;
        },

        tile_is_lit: function(x, y) {
            return this.data[y][x] === 0;
        },

        _realSize: function (number) {
            var tilesize = ig.game.collisionMap.tilesize;
            return number * tilesize * ig.system.scale;
        }

    });

});