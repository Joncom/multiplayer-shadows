ig.module('game.main')
.requires(
    //'impact.debug.debug',
    'impact.game',
    'game.config',
    'game.loader',
    'game.levels.test',
    'game.light',
    'plugins.joncom.interpolation.interpolation',
    'plugins.joncom.shadow-casting.shadow-map'
)
.defines(function(){

    MyGame = ig.Game.extend({

        netLights: {},
        localLight: null,
        timer: new ig.Timer(1/8),
        lastMousePos: null,
        lastPosSent: { x: 0, y: 0 },

        init: function() {

            // Used to prevent needless socket messages.
            this.lastMousePos = this.getMousePx();

            this.loadLevel(LevelTest);
            this.localLight = new ig.Light(0, 0);

            window.onresize = this.onresize.bind(this);
            this.onresize.call(this);

            var game = this;
            var url = 'http://' + ig.config.host + ':' + ig.config.port;
            jQuery.getScript(url + '/socket.io/socket.io.js', function() {
                ig.socket = io.connect(url, { reconnect: false });

                ig.socket.on('connect', function () {
                    console.log("Connected to socket server.");
                    var px = ig.game.getMousePx();
                    ig.socket.emit('init', px.x, px.y);
                });

                ig.socket.on('add-user', function(id, x, y) {
                    game.netLights[id] = new ig.Light(x, y);
                    console.log("User added. X=" + x + ", Y=" + y);
                });

                ig.socket.on('update-user', function(id, x, y) {
                    game.netLights[id].target.x = x;
                    game.netLights[id].target.y = y;
                    console.log("User updated. ID=" + id + ", X=" + x + ", Y=" + y);
                });

                ig.socket.on('remove-user', function(id) {
                    delete game.netLights[id];
                    console.log("User removed. ID=" + id);
                });

                ig.socket.on('disconnect', function(){
                    console.log('Lost connection to server.');
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

            var px = this.getMousePx();
            this.localLight.target.x = px.x;
            this.localLight.target.y = px.y;

            // Is there a server to send updates to?
            if(this.connectedToServer()) {
                // Mouse moved and enough time passed to send update.
                if(this.mousePosHasChanged() && this.timer.delta() > 0) {
                    this.timer.reset();
                    this.sendPos();
                }
                // No mouse movement, but resting position needs to be sent.
                else if(!this.mousePosHasChanged() && !this.sentCurrentPos()) {
                    this.sendPos();
                }
            }

            this.shadowMap.blackout();

            // Track lights to destination.
            this.localLight.update();
            for(var id in this.netLights) {
                this.netLights[id].update();
            }

            // Emit light.
            this.localLight.emit();
            for(var id in this.netLights) {
                this.netLights[id].emit();
            }

            this.lastMousePos = px;
        },

        draw: function() {
            // Draw all entities and backgroundMaps
            this.parent();

            this.shadowMap.draw();
        },

        sendPos: function() {
            ig.socket.emit('update-pos',
                this.localLight.target.x,
                this.localLight.target.y);
            this.lastPosSent.x = this.localLight.target.x;
            this.lastPosSent.y = this.localLight.target.y;
            console.log(
                "Update sent. X=" + this.localLight.target.x +
                ", Y=" + this.localLight.target.y);
        },

        sentCurrentPos: function() {
            var px = this.getMousePx();
            this.localLight.target.x = px.x;
            this.localLight.target.y = px.y;
            return (
                this.lastPosSent.x === px.x &&
                this.lastPosSent.y === px.y);
        },

        connectedToServer: function() {
            return typeof ig.socket !== 'undefined';
        },

        mousePosHasChanged: function() {
            var px = this.getMousePx();
            this.localLight.target.x = px.x;
            this.localLight.target.y = px.y;
            return (
                this.lastMousePos.x !== px.x ||
                this.lastMousePos.y !== px.y);
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
