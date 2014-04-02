ig.module('game.main')
.requires(

    // Load server module only if in NodeJS.
    (typeof global !== 'undefined' ? 'plugins.server' : 'impact.game'),

    'impact.game',
    'impact.font',
    'game.levels.test',
    'game.user',
    'plugins.joncom.shadow-casting.shadow-map'
)
.defines(function(){

    MyGame = ig.Game.extend({

        users: {},
        last: { x: null, y: null },

        // Load a font
        font: new ig.Font( 'media/04b03.font.png' ),

        init: function() {

            var game = this;
            jQuery.getScript('http://localhost:3000/socket.io/socket.io.js', function() {
                ig.socket = io.connect('http://localhost:3000');

                var pos = game.getMousePos();
                ig.socket.emit('init', pos.x, pos.y);

                ig.socket.on('add-user', function(id, x, y) {
                    game.users[id] = new ig.User(id, x, y);
                    console.log("User added.");
                });

                ig.socket.on('update-user', function(id, x, y) {
                    game.users[id].x = x;
                    game.users[id].y = y;
                    console.log("User updated.");
                });

                ig.socket.on('remove-user', function(id) {
                    delete game.users[id];
                    console.log("User removed.");
                });
            });

            ig.input.initMouse();
            this.loadLevel(LevelTest);

            // Create shadow map.
            var data = [];
            for(var y=0; y<ig.game.collisionMap.height; y++) {
                if(data[y] === undefined) {
                    data[y] = [];
                }
                for(var x=0; x<ig.game.collisionMap.width; x++) {
                    data[y][x] = 5;
                }
            }
            this.shadowMap = new ig.ShadowMap(8, data);
        },

        update: function() {
            // Update all entities and backgroundMaps
            this.parent();

            // Send update to server if local position changed.
            var current = this.getMousePos();
            if(this.last.x !== current.x) {
                this.last.x = current.x;
                update = true;
            }
            if(this.last.y !== current.y) {
                this.last.y = current.y;
                update = true;
            }
            if(update && typeof ig.socket !== 'undefined') {
                ig.socket.emit('update-pos', this.last.x, this.last.y);
                console.log("Update sent.");
            }

            this.last = current;
        },

        draw: function() {
            // Draw all entities and backgroundMaps
            this.parent();

            this.shadowMap.blackout();
            this.shadowMap.do_fov(this.last.x, this.last.y, 16);

            for(var id in this.users) {
                this.shadowMap.do_fov(
                    this.users[id].x,
                    this.users[id].y, 16);
            }

            this.shadowMap.draw();
        },

        getMousePos: function() {
            var tilesize = this.collisionMap.tilesize;
            var x = Math.floor(ig.input.mouse.x/tilesize) * ig.system.scale;
            var y = Math.floor(ig.input.mouse.y/tilesize) * ig.system.scale;
            return { x: x, y: y };
        }

    });

    // Start the Game with 60fps, a resolution of 320x240, scaled
    // up by a factor of 2
    ig.main( '#canvas', MyGame, 60, 480, 320, 2 );

});
