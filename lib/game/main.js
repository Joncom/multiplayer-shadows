ig.module('game.main')
.requires(
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
            this.loadLevel(LevelTest);
            var data = [
                [1,2,6],
                [0,3,5],
                [2,8,1],
            ];
            this.shadowMap = new ig.ShadowMap(8, data, 'media/tileset.png');
        },

        update: function() {
            // Update all entities and backgroundMaps
            this.parent();

            // Add your own, additional update code here
        },

        draw: function() {
            // Draw all entities and backgroundMaps
            this.parent();
        }

    });

    // Start the Game with 60fps, a resolution of 320x240, scaled
    // up by a factor of 2
    ig.main( '#canvas', MyGame, 60, 320, 240, 2 );

});
