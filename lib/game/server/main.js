ig.module(
	'game.server.main'
)
.requires(
    'plugins.server',
    'game.server.user'
)
.defines(function() {

    MyGame = ig.Game.extend({
        users: [],
        counter: 0,
        timer: null,
        freq: 3,
        init: function() {
            this.timer = new ig.Timer(1/this.freq);

            ig.io.sockets.on('connection', function(socket) {
                var user = new ig.User(socket, 0, 0);

                console.log("Client " + socket.id + " connected.");

                socket.on('init', function(x, y) {
                    var id = MyGame.userCounter++;
                    var user = new User(id, x, y);
                    user.socket = socket;
                    MyGame.users.push();
                });

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
