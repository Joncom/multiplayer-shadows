ig.module(
	'game.light'
)
.requires(
    'plugins.joncom.shadow-casting.shadow-map',
    'plugins.joncom.interpolation.interpolation'
)
.defines(function() {

    ig.Light = ig.Class.extend({

        pos: { x: 0, y: 0 }, // Actual position drawn to canvas
        target: { x: 0, y: 0 }, // Position moving toward
        trackDelay: 16, // How long to reach target position
        radiusA: 15, // First radius size to have
        radiusB: 16, // Second radius size to have
        radiusTween: null, // Used to change between radius sizes
        tweenDelay: 2, // How long to change between radius sizes

        init: function(x, y) {
            this.pos.x = x;
            this.pos.y = y;
            this.target.x = x;
            this.target.y = y;
            this.radiusTween = this.createTween(this.radiusA, this.radiusB);
        },

        update: function() {
            // Track to new destination
            this.pos.x += (this.target.x - this.pos.x) / this.trackDelay;
            this.pos.y += (this.target.y - this.pos.y) / this.trackDelay;

            if(this.radiusTween.done) {
                // Swap radius values.
                var n = this.radiusA;
                this.radiusA = this.radiusB;
                this.radiusB = n;

                this.radiusTween = this.createTween(this.radiusA, this.radiusB);
            }
        },

        emit: function() {
            var tilesize = ig.game.collisionMap.tilesize;
            var x = Math.floor((this.pos.x)/tilesize);
            var y = Math.floor((this.pos.y)/tilesize);
            ig.game.shadowMap.do_fov(x, y, this.radiusTween.value);
        },

        createTween: function(first, last) {
            return new ig.Interpolation(
                first, // start
                last, // end
                this.tweenDelay, // seconds
                ig.Interpolation.EASE.SMOOTHSTEP);
        }

    });

});
