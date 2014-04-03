ig.module(
	'game.light'
)
.requires(
    'plugins.joncom.shadow-casting.shadow-map'
)
.defines(function() {

    ig.Light = ig.Class.extend({

        delay: 16,

        targetPos = {
            x: 0,
            y: 0
        },

        realPos: {
            x: 0,
            y: 0
        },

        init: function(id, x, y) {
            this.id = id;
            this.pos.x = x;
            this.pos.y = y;
        },

        update: function() {
            // Track to new destination
            this.realPos.x += (nX - this.realPos.x) / this.delay;
            this.realPos.y += (nY - this.realPos.y) / this.delay;
        }

    });

});
