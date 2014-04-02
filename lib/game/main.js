ig.module('game.main')
.requires(
    'plugins.server',
    'impact.game',
    'impact.font',
    'game.levels.test',
    'plugins.joncom.shadow-casting.shadow-map'
)
.defines(function(){

    MyGame = ig.Game.extend({

        // Load a font
        font: new ig.Font( 'media/04b03.font.png' ),

        init: function() {
            ig.input.bind(ig.KEY.UP_ARROW, 'up');
            ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
            ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
            ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
            ig.input.bind(ig.KEY.W, 'up');
            ig.input.bind(ig.KEY.S, 'down');
            ig.input.bind(ig.KEY.A, 'left');
            ig.input.bind(ig.KEY.D, 'right');
            this.loadLevel(LevelTest);

            this.player = ig.game.getEntitiesByType(EntityPlayer)[0];


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

            // Add your own, additional update code here
        },

        draw: function() {
            // Draw all entities and backgroundMaps
            this.parent();

            var tilesize = this.collisionMap.tilesize;
            var x = Math.floor((this.player.pos.x + this.player.size.x/2) / tilesize);
            var y = Math.floor((this.player.pos.y + this.player.size.y/2) / tilesize);
            this.shadowMap.blackout();
            this.shadowMap.do_fov(0, 0, 16);
            this.shadowMap.do_fov(x, y, 16);

            this.shadowMap.draw();
        }

    });

    // Start the Game with 60fps, a resolution of 320x240, scaled
    // up by a factor of 2
    ig.main( '#canvas', MyGame, 60, 480, 320, 2 );

});
