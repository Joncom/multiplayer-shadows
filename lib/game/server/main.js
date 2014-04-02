ig.module(
	'game.server.main'
)
.requires(
    'plugins.server'
)
.defines(function() {

    MyGame = ig.Game.extend({
        users: [],
        timer: null,
        freq: 3,
        init: function() {
            this.timer = new ig.Timer(1/this.freq);

            ig.io.sockets.on('connection', function(socket) {
                console.log("Client " + socket.id + " connected.");
            });
        },

        update: function() {
            this.parent();
            if(this.timer.delta() >= 0) {
                this.timer.reset();
                console.log("Tick");
            }
        }
    });

    ig.main('#canvas', MyGame, 60, 320, 240, 2);

});
