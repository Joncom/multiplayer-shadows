ig.module(
	'game.server.user'
)
.defines(function() {

    ig.User = ig.Class.extend({

        socket: null,
        pos: {
            x: 0,
            y: 0
        },

        init: function(socket, x, y) {
            this.socket = socket;
            this.pos.x = x;
            this.pos.y = y;
        }

    });

});
