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

        users: [],
        localPos: { x: null, y: null },

        // Load a font
        font: new ig.Font( 'media/04b03.font.png' ),

        init: function() {
            jQuery.getScript('http://localhost:3000/socket.io/socket.io.js', function() {
                ig.socket = io.connect('http://localhost:3000');
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

            this.users.push(new ig.User(1, 3, 9));
            this.users.push(new ig.User(1, 15, 24));
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

            for(var i =0; i < this.users.length; i++) {
                this.shadowMap.do_fov(
                    this.users[i].pos.x,
                    this.users[i].pos.y, 16);
            }

            this.shadowMap.draw();
        }

    });

    // Start the Game with 60fps, a resolution of 320x240, scaled
    // up by a factor of 2
    ig.main( '#canvas', MyGame, 60, 480, 320, 2 );

});
