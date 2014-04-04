ig.module(
	'game.light'
)
.requires(
    'plugins.joncom.shadow-casting.shadow-map',
    'plugins.joncom.interpolation.interpolation'
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

        radiusA: 15,
        radiusB: 16,
        radiusTween: null,
        tweenDelay: 1,

        init: function(x, y) {
            this.pos.x = x;
            this.pos.y = y;

            this.radiusTween = this.createTween(this.radiusA, this.radiusB);
        },

        update: function() {
            // Track to new destination
            this.pos.x += (this.target.x - this.pos.x) / this.delay;
            this.pos.y += (this.target.y - this.pos.y) / this.delay;

            if(this.radiusTween.done) {
                // Swap radius values.
                var n = this.radiusA;
                this.radiusA = this.radiusB;
                this.radiusB = n;

                this.radiusTween = this.createTween(this.radiusA, this.radiusB);
            }
            console.log(this.radiusTween.value);
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
