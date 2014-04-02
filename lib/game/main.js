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
        localPos: { x: null, y: null },

        // Load a font
        font: new ig.Font( 'media/04b03.font.png' ),

        init: function() {

            var game = this;
            jQuery.getScript('http://localhost:3000/socket.io/socket.io.js', function() {
                ig.socket = io.connect('http://localhost:3000');
                ig.socket.emit('init', game.localPos.x, game.localPos.y);

                ig.socket.on('add-user', function(id, x, y) {
                    users[id] = new ig.User(id, x, y);
                    console.log("Added removed.");
                });

                ig.socket.on('remove-user', function(id) {
                    delete users[id];
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

            var tilesize = this.collisionMap.tilesize;
            var x = Math.floor(ig.input.mouse.x/tilesize) * ig.system.scale;
            var y = Math.floor(ig.input.mouse.y/tilesize) * ig.system.scale;
            if(this.localPos.x !== x) { // If X changed..
                this.localPos.x = x; // TODO: Update server.
            }
            if(this.localPos.y !== y) {
                this.localPos.y = y;
            }
        },

        draw: function() {
            // Draw all entities and backgroundMaps
            this.parent();

            this.shadowMap.blackout();
            this.shadowMap.do_fov(this.localPos.x, this.localPos.y, 16);

            for(var id in this.users) {
                this.shadowMap.do_fov(
                    this.users[id].pos.x,
                    this.users[id].pos.y, 16);
            }

            this.shadowMap.draw();
        }

    });

    // Start the Game with 60fps, a resolution of 320x240, scaled
    // up by a factor of 2
    ig.main( '#canvas', MyGame, 60, 480, 320, 2 );

});
