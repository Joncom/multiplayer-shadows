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

                    // Instruct clients to add user.
                    ig.io.sockets.emit('add-user', socket.id, x, y);
                });

                socket.on('disconnect', function(x, y) {
                    // Instruct clients to remove user.
                    ig.io.sockets.emit('remove-user', socket.id);

                    delete game.users[socket.id]; // Clean up.
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
