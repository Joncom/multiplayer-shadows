ig.module(
	'game.server.main'
)
.requires(
    'plugins.server',
    'game.server.user'
)
.defines(function() {

    MyGame = ig.Game.extend({

        users: {},
        counter: 0,
        timer: null,
        freq: 3,

        init: function() {
            this.timer = new ig.Timer(1/this.freq);
            var game = this;

            ig.io.sockets.on('connection', function(socket) {
                var user = new ig.User(socket, 0, 0);

                console.log("Client " + socket.id + " connected.");

                socket.on('init', function(x, y) {
                    var id = game.userCounter++;
                    var user = new ig.User(id, x, y);
                    game.users[socket.id] = user;
                    console.log("User added.");
                });

                socket.on('disconnect', function(x, y) {
                    delete game.users[socket.id];
                    console.log("User removed.");
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
