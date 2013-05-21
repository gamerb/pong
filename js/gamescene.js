CollisionType =
{
    BALL :   0x0001,
    PADDLE : 0x0002,
    WALL :   0x0004
};

GamePhysics = pc.systems.Physics.extend( 'GameplayPhysics',{},
{
    onCollisionStart : function( aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact )
    {
        if(aType == pc.BodyType.ENTITY && bType == pc.BodyType.ENTITY) {
            if(entityA.hasTag('BALL') && entityB.hasTag('PADDLE')) {
                var bp = entityA.getComponent('physics');
                var xvel = bp.getLinearVelocity().x;
                var yvel = bp.getLinearVelocity().y;
                bp.setLinearVelocity(xvel, -yvel);
            } else if( entityA.hasTag('BALL') && entityB.hasTag('WALL') ) {
                var bp = entityA.getComponent('physics');
                var xvel = bp.getLinearVelocity().x;
                var yvel = bp.getLinearVelocity().y;
                bp.setLinearVelocity(-xvel, yvel);
            }
        }
    },

    onCollisionEnd : function( aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact )
    {
        if(entityA.hasTag('BALL')) {
            if( entityB.hasTag('PADDLE')) {
                entityB.getComponent('physics').setCollisionMask( CollisionType.BALL | CollisionType.WALL );
            } else if(entityB.hasTag('OPPONENT')){
                entityA.remove();
                entityA.active=false;
                pc.device.game.gameScene.gameOver = true;
                var opponentScore = parseInt(pc.device.game.gameScene.opponentScore.getComponent('text').text[0]);
                pc.device.game.gameScene.opponentScore.getComponent('text').text[0] = opponentScore + 1;
            } else if(entityB.hasTag('PLAYER')) {
                entityA.remove();
                entityA.active=false;
                pc.device.game.gameScene.gameOver = true;
				var playerScore = parseInt(pc.device.game.gameScene.playerScore.getComponent('text').text[0]);
                pc.device.game.gameScene.playerScore.getComponent('text').text[0] = playerScore + 1;
            }
        }
    }
});

GameScene = pc.Scene.extend('GameScene',{},
{
    gameLayer:null,
    ball:null,
    player:null,
    opponent:null,
    gameBoard:null,
    scoreboard:null,
    ai:false,
    gameOver:false,

    init:function ()
    {
        var xb = 20;
        var yb = 20;
        var wb = 850;
        var hb = 700;

        this._super();

        this.gameLayer = this.addLayer(new pc.EntityLayer('game layer', 10000, 10000));

        var gamephy = new GamePhysics({debug:true});
        this.gameLayer.addSystem(gamephy);
        this.gameLayer.addSystem(new pc.systems.Render());

        this.gameBoard = pc.Entity.create(this.gameLayer);
        this.gameBoard.addComponent(pc.components.Spatial.create({ x: xb, y: yb, w: wb, h: hb }));
        this.gameBoard.addComponent(pc.components.Rect.create({ lineColor:'#e3e3e3', lineWidth:3, color:'#000000'}));

        this.scoreboard = pc.Entity.create(this.gameLayer);
        this.scoreboard.addComponent(pc.components.Spatial.create({x:885,y:20,w:75,h:700}));
        this.scoreboard.addComponent(pc.components.Rect.create({ lineColor:'#e3e3e3', lineWidth:3, color:'#000000'}));

        this.ball = pc.Entity.create(this.gameLayer);
        this.ball.addComponent(pc.components.Spatial.create({x:50, y:100, w:25, h:25,dir:45}));
        this.ball.addComponent(pc.components.Circle.create({color:'#eec400'}));
        this.ball.addComponent(pc.components.Physics.create({
            collisionCategory:CollisionType.BALL,
            collisionMask:CollisionType.PADDLE | CollisionType.WALL,
            bounce:1,
            mass:1,
            impulse:12
        }));

        this.ball.addTag('BALL');

        this.player = pc.Entity.create(this.gameLayer);
        this.player.addComponent(pc.components.Spatial.create({ x:200, y:22, w:150, h:12 }));
        this.player.addComponent(pc.components.Rect.create({ lineColor:'#ffffff', lineWidth:1,  color:'#ffffff'}));
        this.player.addComponent(pc.components.Physics.create({
            collisionCategory:CollisionType.PADDLE,
            collisionMask:CollisionType.BALL | CollisionType.WALL,
            fixedRotation: true,
            linearDamping: 0.5,
            mass: 100
        }));
        this.player.addTag('PADDLE');

        this.opponent = pc.Entity.create(this.gameLayer); //change ball color within range of player i.e from center to f00f0f
        this.opponent.addComponent(pc.components.Spatial.create({ x:200, y:705, w:150, h:12 }));
        this.opponent.addComponent(pc.components.Rect.create({ lineColor:'#f00f0f', lineWidth:1, color:'#f00f0f'}));
        this.opponent.addComponent(pc.components.Physics.create({
            collisionCategory:CollisionType.PADDLE,
            collisionMask:CollisionType.BALL | CollisionType.WALL,
            fixedRotation: true,
            linearDamping: 0.5,
            mass: 100
        }));
        this.opponent.addTag('PADDLE');

        this.createWall(this.gameLayer,  20, 20, 1, 720); // left
        this.createWall(this.gameLayer, 870, 0, 1, 720); // right

        this.createScoreWall(this.gameLayer, this.opponent, 20, 20, 870, 1); // top
        this.createScoreWall(this.gameLayer, this.player, 0, 720, 870, 1); // bottom

        this.playerScore = pc.Entity.create( this.gameLayer );
        this.playerScore.addComponent(pc.components.Text.create({color: '#FFFFFF', fontHeight: 40, text: ['0']}));
        this.playerScore.addComponent(pc.components.Spatial.create({x: 888 , y: 75}));

        this.opponentScore = pc.Entity.create(this.gameLayer);
        this.opponentScore.addComponent(pc.components.Text.create({color: '#FFFFFF', fontHeight: 40, text:['0']}));
        this.opponentScore.addComponent(pc.components.Spatial.create({x: 888, y: 700}));

        pc.device.input.bindState(this, 'player', 'MOUSE_MOVE');

    },

    process: function()
    {
        if (this.gameOver)
            return false;
        
        if(pc.device.input.isInputState(this,'player')) {
            if ((pc.device.game.gameScene.ai == false) ) {
                if (pc.device.input.mousePos.x <= 770 && pc.device.input.mousePos.x >= 70) {
                    this.opponent.getComponent('spatial').pos.x = pc.device.input.mousePos.x-50;
                    this.player.getComponent('spatial').pos.x = pc.device.input.mousePos.x-50;
                }
            } else if ((pc.device.game.gameScene.ai == true )) {
                var b = this.ball.getComponent('spatial');
                if (pc.device.input.mousePos.x <= 770 && pc.device.input.mousePos.x >= 70) {
                    this.player.getComponent('spatial').pos.x = pc.device.input.mousePos.x-50;
                }
                if ( b.pos.x <= 725 && b.pos.x >= 100 ) {
                    this.opponent.getComponent('spatial').pos.x = b.pos.x-50;
                }
            }
        }

        pc.device.ctx.clearRect( 0, 0, pc.device.canvas.width, pc.device.canvas.height );

        this._super();
    },

    
    createWall:function (layer, x, y, w, h)
    {
        var e = pc.Entity.create(layer);
        e.addTag('WALL');
        e.addComponent(pc.components.Spatial.create({x:x, y:y, w:w, h:h }));
        e.addComponent(pc.components.Physics.create({
            collisionCategory: CollisionType.WALL,
            collisionMask: CollisionType.BALL | CollisionType.PADDLE,
            immovable: true
        }));
    },
    
    createScoreWall: function(layer, paddle, x, y, w, h)
    {
        var e = pc.Entity.create( layer );

        if(paddle === this.player){
            e.addTag('PLAYER');
        } else {
            e.addTag('OPPONENT');
        }

        e.addComponent(pc.components.Spatial.create({ x: x, y: y, w: w, h: h }));

        e.addComponent( pc.components.Physics.create({
            collisionCategory: CollisionType.WALL,
            collisionMask: CollisionType.BALL,
            immovable: true,
        }));
    },
});

