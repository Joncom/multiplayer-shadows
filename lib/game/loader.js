ig.module(
	'game.loader'
)
.requires(
    'impact.loader'
)
.defines(function() {

    ig.Loader.inject({

        draw: function() {
            this._drawStatus += (this.status - this._drawStatus)/5;
            var s = ig.system.scale;
            var w = ig.system.width;
            var h = 8;
            var x = 0;
            var y = 0;

            ig.system.context.fillStyle = '#000';
            ig.system.context.fillRect( x*s+s, y*s+s, w*s-s-s, h*s-s-s );

            ig.system.context.fillStyle = '#fff';
            ig.system.context.fillRect( x*s, y*s, w*s*this._drawStatus, h*s );
        }

    });

});
