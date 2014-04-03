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
            console.log('emitting.');
            ig.game.shadowMap.do_fov(this.pos.x, this.pos.y, 16);
            ig.game.shadowMap.do_fov(3, 3, 16);
        }

    });

});
