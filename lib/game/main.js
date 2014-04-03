ig.module('game.main')
.requires(
    'impact.debug.debug',
    'impact.game',
    'impact.font',
    'game.levels.test',
    'game.user',
    'game.light',
    'plugins.joncom.interpolation.interpolation',
    'plugins.joncom.shadow-casting.shadow-map'
)
.defines(function(){

    MyGame = ig.Game.extend({

        netLights: {},
        localLight: null,
        interpolation: { x: null, y: null },

        // Load a font
        font: new ig.Font( 'media/04b03.font.png' ),

        init: function() {

            this.loadLevel(LevelTest);
            this.localLight = new ig.Light(0, 0);

            window.onresize = this.onresize.bind(this);
            this.onresize.call(this);

            var game = this;
            jQuery.getScript('http://localhost:3000/socket.io/socket.io.js', function() {
                ig.socket = io.connect('http://localhost:3000');
                console.log("Connected to socket server.");

                var px = game.getMousePx();
                ig.socket.emit('init', px.x, px.y);

                ig.socket.on('add-user', function(id, x, y) {
                    game.netLights[id] = new ig.Light(x, y);
                    console.log("User added. X=" + x + ", Y=" + y);
                });

                ig.socket.on('update-user', function(id, x, y) {
                    game.netLights[id].target.x = x;
                    game.netLights[id].target.y = y;
                    console.log("User updated. X=" + x + ", Y=" + y);
                });

                ig.socket.on('remove-user', function(id) {
                    delete game.netLights[id];
                    console.log("User removed.");
                });
            });

            ig.input.initMouse();

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

            if(typeof ig.socket !== 'undefined') {
                ig.socket.emit('update-pos',
                    this.localLight.target.x,
                    this.localLight.target.y);
                console.log("Update sent.");
            }

            this.shadowMap.blackout();

            // Track lights to destination.
            this.localLight.update();
            for(var id in this.netLights) {
                this.netLights[id].update();
            }

            var px = this.getMousePx();
            this.localLight.target.x = px.x;
            this.localLight.target.y = px.y;

            // Emit light.
            this.localLight.emit();
            for(var id in this.netLights) {
                this.netLights[id].emit();
            }
        },

        draw: function() {
            // Draw all entities and backgroundMaps
            this.parent();

            this.shadowMap.draw();
        },

        getMousePx: function() {
            var x = ig.input.mouse.x + this.screen.x;
            var y = ig.input.mouse.y + this.screen.y;
            return { x: x, y: y };
        },

        onresize: function(event) {
            var width = Math.floor(window.innerWidth/ig.system.scale);
            var height = Math.floor(window.innerHeight/ig.system.scale);
            ig.system.resize(width, height);

            // Position "camera" over map.
            if(this.backgroundMaps.length > 0) {
                var mapWidth = this.backgroundMaps[0].data[0].length;
                var mapHeight = this.backgroundMaps[0].data.length;
                var tilesize = this.backgroundMaps[0].tilesize;
                this.screen.x = -(ig.system.width/2) + (mapWidth * tilesize)/2;
                this.screen.y = -(ig.system.height/2) + (mapHeight * tilesize)/2;
            }
        }

    });

    var scale = 2;
    var width = Math.floor(window.innerWidth/scale);
    var height = Math.floor(window.innerHeight/scale);
    ig.main('#canvas', MyGame, 60, width, height, scale);

});
