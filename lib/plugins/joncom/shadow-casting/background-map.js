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
        }
    });

});