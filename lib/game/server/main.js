ig.module(
	'game.server.main'
)
.requires(
    'plugins.server',
    'game.server.light'
)
.defines(function() {

    MyGame = ig.Game.extend({

        lights: {}, // Contains all light instances, indexed by socket ID.
        timer: new ig.Timer(3), // Used to send 'tick' messages to console.

        init: function() {
            var game = this;

            ig.io.sockets.on('connection', function(socket) {

                console.log("Client " + socket.id + " connected.");

                socket.on('init', function(x, y) {
                    var light = new ig.Light(x, y);
                    game.lights[socket.id] = light;
                    console.log("User added. X=" + x + ", Y=" + y);

                    // Instruct existing clients to add user.
                    socket.broadcast.emit('add-user', socket.id, x, y);

                    // Instruct new client to add peers.
                    for(var id in game.lights) {
                        if(id === socket.id) continue;
                        var pos = game.lights[id].pos;
                        socket.emit('add-user', id, pos.x, pos.y);
                    }
                });

                socket.on('update-pos', function(x, y) {

                    if(typeof game.lights[socket.id] === 'undefined') {
                        console.log("Received update from non-initiated client.");
                        return;
                    }

                    game.lights[socket.id].pos.x = x;
                    game.lights[socket.id].pos.y = y;
                    console.log("User updated. X=" + x + ", Y=" + y);

                    // Inform clients of user update.
                    socket.broadcast.emit('update-user', socket.id, x, y);
                });

                socket.on('disconnect', function(x, y) {
                    // Instruct clients to remove user.
                    ig.io.sockets.emit('remove-user', socket.id);

                    delete game.lights[socket.id]; // Clean up.
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
