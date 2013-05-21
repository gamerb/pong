
Pong = pc.Game.extend('TheGame',{},
{
    gameScene:null,
		menuSeene:null,
    onReady:function ()
    {
        this._super();
        this.gameScene = new GameScene();
        this.addScene(this.gameScene,false);
        pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));
    },

    onLoading:function (percentageComplete)
    {
    },

    onLoaded:function ()
    {
				this.menuScene = new MenuScene();
				this.addScene(this.menuScene);
    },

		activateGameScene: function()
		{
			this.deactivateScene(this.menuScene);
			this.activateScene(this.gameScene);			
		},
		deactivateGameScene: function()
		{
			this.deactivateScene(this.gameScene);			
			this.activateScene(this.menuScene);
		}
});
