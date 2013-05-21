/**
 * MenuScene
 * A template menu scene
 */
MenuScene = pc.Scene.extend('MenuScene',{},
{
    menuLayer:null,
    menuItems:null,
    currentMenuSelection: 0,

    init:function ()
    {
        this._super();

        this.menuItems = [];
        this.currentMenuSelection = 0;
        this.menuLayer = this.addLayer(new pc.EntityLayer('menu layer', 10000, 10000));

        this.menuLayer.addSystem(new pc.systems.Render());
        this.menuLayer.addSystem(new pc.systems.Effects());
        this.menuLayer.addSystem(new pc.systems.Layout());
        this.menuLayer.addSystem(new pc.systems.Input());

        var title = pc.Entity.create(this.menuLayer);
        title.addComponent(pc.components.Spatial.create({ w:200, h:50 }));
        title.addComponent(pc.components.Layout.create({ vertical:'middle', horizontal:'left', margin:{ left:40, bottom:50 }}));
        title.addComponent(pc.components.Text.create({
            fontHeight:40, 
            lineWidth:1, 
            strokeColor:'#ffffff', 
            color:'#222288', 
            text:['Players'] 
        }));

        var menuItemText = ["~[ Player vs Player ]", "~[ Player vs AI ]"];
        this.menuItems = [];

        for (var i=0; i < menuItemText.length; i++) {
            var menuItem = pc.Entity.create(this.menuLayer);

            menuItem.addComponent(pc.components.Spatial.create({ w:200, h:40 }));
            menuItem.addComponent(pc.components.Alpha.create({}));
            menuItem.addComponent(pc.components.Layout.create({ vertical:'middle', horizontal:'left', margin:{left:50 }}));
            menuItem.addComponent(pc.components.Text.create({ fontHeight:30, text: [menuItemText[i]] }));

            var fader = pc.components.Fade.create({ fadeInTime:500, fadeOutTime:500, loops:0 });
            menuItem.addComponent(fader);
            fader.active = false;

            this.menuItems.push(menuItem);
        }

        this.changeMenuSelection(0); // default select the first item

        this.displayHelp(this.menuLayer);

        pc.device.input.bindAction(this, 'up', 'UP');
        pc.device.input.bindAction(this, 'down', 'DOWN');
        pc.device.input.bindAction(this, 'execute', 'ENTER');
    },

    changeMenuSelection: function(newSelection)
    {
        var currentMenuItem = this.menuItems[this.currentMenuSelection];
        currentMenuItem.getComponent('fade').active = false;
        currentMenuItem.getComponent('alpha').setAlpha(1);

        var newMenuItem = this.menuItems[newSelection];
        newMenuItem.getComponent('fade').active = true;

        this.currentMenuSelection = newSelection;
    },

    onAction:function (actionName, event, pos, uiTarget)
    {
        if (actionName === 'execute') {
            var currentMenuItem = this.menuItems[this.currentMenuSelection];
            switch (currentMenuItem.getComponent('text').text[0]) {
                case '~[ Player vs Player ]':
                    pc.device.game.gameScene.ai = false;
                    pc.device.game.activateGameScene();
                    break;
                case '~[ Player vs AI ]':
                    pc.device.game.gameScene.ai = true;
                    pc.device.game.activateGameScene();
                    break;
            }
        }

        if (actionName === 'down' || actionName === 'up') {
            var m = this.currentMenuSelection;
            if (actionName == 'down') m++;
            if (actionName == 'up') m--;

            if (m > this.menuItems.length - 1) m = 0;
            if (m < 0) m = this.menuItems.length - 1;

            this.changeMenuSelection(m);
        }
    },
    displayHelp:function(layer)
    {
        var help = pc.Entity.create(layer);

        help.addComponent(pc.components.Spatial.create({ w:200, h:40 }));
        help.addComponent(pc.components.Layout.create({ vertical:'top', horizontal:'left', margin:{left:50 }}));
        help.addComponent(pc.components.Text.create({ fontHeight:20, text: ['Use UP and DOWN arrow key to move and ENTER to select menu'] }));
    },

    process:function ()
    {
        pc.device.ctx.clearRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);
        this._super();
    }
});
