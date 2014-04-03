ig.module(
	'game.light'
)
.requires(
    'plugins.joncom.shadow-casting.shadow-map'
)
.defines(function() {

    ig.Light = ig.Class.extend({

        delay: 16,

        pos: {
            x: 0,
            y: 0
        },

        target: {
            x: 0,
            y: 0
        },

        init: function(x, y) {
            this.pos.x = x;
            this.pos.y = y;
        },

        update: function() {
            // Track to new destination
            this.pos.x += (this.target.x - this.pos.x) / this.delay;
            this.pos.y += (this.target.y - this.pos.y) / this.delay;
        },

        emit: function() {
            var tilesize = ig.game.collisionMap.tilesize;
            var x = Math.floor((this.pos.x)/tilesize);
            var y = Math.floor((this.pos.y)/tilesize);
            ig.game.shadowMap.do_fov(x, y, 16);
        }

    });

});
