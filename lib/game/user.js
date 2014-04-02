ig.module(
	'game.user'
)
.defines(function() {

    ig.User = ig.Class.extend({

        id: null,
        pos: {
            x: 0,
            y: 0
        },

        init: function(id, x, y) {
            this.id = id;
            this.pos.x = x;
            this.pos.y = y;
        },

        setPos: function(x, y) {
            this.pos.x = x;
            this.pos.y = y;
        }

    });

});
