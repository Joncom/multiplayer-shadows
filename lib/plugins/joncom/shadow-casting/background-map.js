// Algorthym found here:
// http://roguebasin.roguelikedevelopment.org/index.php?title=C%2B%2B_shadowcasting_implementation
ig.module('plugins.joncom.shadow-casting.background-map')
.requires('impact.background-map')
.defines(function(){ "use strict";

    ig.ShadowMap = ig.BackgroundMap.extend({

        set_visible: function(x, y, visible) {
            // Set the visibility of the cell at the given position.
        },

        get_width: function() {
            return this.width;
        },

        get_height: function() {
            return this.height;
        },

        is_opaque: function(x, y) {
            // Return whether the given position holds an opaque cell.
            return false;
        },

        cast_light: function(map, x, y, radius, row, start_slope, end_slope, xx, xy, yx, yy) {
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
                    if ((sax < 0 && parseInt(Math.abs(sax)), 10) > x) ||
                            (say < 0 && parseInt(Math.abs(say)) > y)) {
                        continue;
                    }
                    uint ax = x + sax;
                    uint ay = y + say;
                    if (ax >= map.get_width() || ay >= map.get_height()) {
                        continue;
                    }
                    var radius2 = radius * radius;
                    if ((uint)(dx * dx + dy * dy) < radius2) {
                        map.set_visible(ax, ay, true);
                    }
                    if (blocked) {
                        if (map.is_opaque(ax, ay)) {
                            next_start_slope = r_slope;
                            continue;
                        } else {
                            blocked = false;
                            start_slope = next_start_slope;
                        }
                    } else if (map.is_opaque(ax, ay)) {
                        blocked = true;
                        next_start_slope = r_slope;
                        cast_light(map, x, y, radius, i + 1, start_slope, l_slope, xx,
                                xy, yx, yy);
                    }
                }
                if (blocked) {
                    break;
                }
            }
        },
    });

});