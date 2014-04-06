ig.module(
	'game.server.light'
)
.defines(function() {

    ig.Light = ig.Class.extend({

        pos: {
            x: 0,
            y: 0
        },

        init: function(x, y) {
            this.pos.x = x;
            this.pos.y = y;
        }

    });

});
