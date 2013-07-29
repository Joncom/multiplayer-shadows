ig.module('game.entities.player')
.requires('impact.entity')
.defines(function(){

    EntityPlayer = ig.Entity.extend({

        size: { x: 8, y: 8 },
        input: null,
        speed: 100,
        animSheet: new ig.AnimationSheet('media/tileset.png', 8, 8),

        init: function(x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('default', 1, [0]);
        },

        update: function() {

            this.vel.x = this.vel.y = 0;

            if(ig.input.state('up')) {
                this.input = 'up';
            } else if(ig.input.state('down')) {
                this.input = 'down';
            } else if(ig.input.state('left')) {
                this.input = 'left';
            } else if(ig.input.state('right')) {
                this.input = 'right';
            } else {
                this.input = null;
            }

            if(this.input === 'up') {
                this.vel.y = -this.speed;
            } else if(this.input === 'down') {
                this.vel.y = this.speed;
            } else if(this.input === 'left') {
                this.vel.x = -this.speed;
            } else if(this.input === 'right') {
                this.vel.x = -this.speed;
            }

            this.parent();
        }

    });

});
