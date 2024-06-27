// const { setPositionsInIsometric } = require("./pixi");

(async () =>
    {
        const app = new PIXI.Application();
        await app.init({ background: '#00aeff', resizeTo: window });
        app.stage.interactive = true;
        document.body.appendChild(app.canvas);

    function cartesianToIsometric(cartX, cartY)
    {
        return {
            x: cartX - cartY,
            y: (cartX + cartY) / 2
        };
    }

    function cartesianToScreenFromIsometric(cartX, cartY)
    {
        return {
            x: cartX + cartY,
            y: (cartX - cartY) * 2
        };
    }


    function intersects(object1, object2)
    {
        const bounds1 = object1.getBounds();
        const bounds2 = object2.getBounds();
        return (
            bounds1.x + bounds1.width < bounds2.x + bounds2.width
            && bounds1.x + bounds1.width > bounds2.x
            && bounds1.y + bounds1.height < bounds2.y + bounds2.height
            && bounds1.y + bounds1.height > bounds2.y 
        );
    }

    textures = await PIXI.Assets.load('grounds.json');
    texturess = await PIXI.Assets.load('buildings.json');
    texteee = await PIXI.Assets.load(`house100x100.png`);

    class Cell {
        constructor(ptrTower, placeType)
        {
            this.__ptrTower = ptrTower;
            this.__placeType = placeType;
            this.__sprite;
            this.__bounds;
            this.__active = false;
            this.__cellId = 0;
            this.initSprite()
        }

        intersectWithCell(object) 
        {
            const bounds = object.getBounds();
            return (
                this.__bounds.x + this.__bounds.width / 3 < bounds.x + bounds.width / 2.8
                && this.__bounds.x + this.__bounds.width / 1.4 > bounds.x + bounds.width / 3
                && this.__bounds.y + this.__bounds.height / 4 < bounds.y + bounds.height / 1.6
                && this.__bounds.y + this.__bounds.height / 1.3 > bounds.y + bounds.height / 4
            );
        }

        getSprite()
        {
            return this.__sprite;
        }

        setCellId(id)
        {
            this.__cellId = id;
        }

        getCellId()
        {
            return this.__cellId;
        }

        activate()
        {
            this.__active = true;
        }

        deactivate()
        {
            this.__active = false;
        }

        getActive()
        {
            return this.__active;
        }

        getPtrTower()
        {
            return this.__ptrTower;
        }

        setPtrTower(newPtr)
        {
            this.__ptrTower = newPtr;
        }

        initSprite()
        {
            this.__sprite = new PIXI.Sprite(PIXI.Texture.from(`ground_${this.__placeType}.png`));
            this.__sprite.texture.rotate = 1;
            this.__sprite.texture.updateUvs();
            this.__sprite.height /= 2;
            app.stage.addChild(this.__sprite);
        }

        changeType(type)
        {
            this.__placeType = type;
            this.__sprite.texture = PIXI.Texture.from(`ground_${type}.png`);
            this.__sprite.texture.rotate = 1;
            this.__sprite.texture.updateUvs();
        }

        errorField()
        {
            this.__sprite.texture = PIXI.Texture.from(`ground_${3}.png`);
            this.__sprite.texture.rotate = 1;
            this.__sprite.texture.updateUvs();
        }

        okField()
        {
            this.__sprite.texture = PIXI.Texture.from(`ground_${4}.png`);
            this.__sprite.texture.rotate = 1;
            this.__sprite.texture.updateUvs();
        }

        setPositionsInIsometric(x, y)
        {
            const isoPos = cartesianToIsometric(x, y);
            this.__sprite.position.set(isoPos.x, isoPos.y);
            this.__bounds = this.__sprite.getBounds();
        }

        setDirectPositions(x, y)
        {
            this.__sprite.position.set(x, y);
            this.__bounds = this.__sprite.getBounds();
        }

        getPositions()
        {
            const x = this.__sprite.position.x;
            const y = this.__sprite.position.y;
            return {x, y};
        }

        getBounds()
        {
            return this.__sprite.getBounds();
        }

        getType()
        {
            return this.__placeType;
        }
    }

    class build
    {
        constructor(hp, defense, buildType)
        {
            this.__hp = hp;
            this.__defense = defense;
            this.__buildType = buildType;
            this.__sprite;
            this.__peopleCount;
            this.__droppingResources = [];
            this.__matrixPattern = [];
            this.__eCells = [];
            this.__cellsStatus = {};
            this.__stopMovingFlag = false;
            this.initSprite();
            window.addEventListener('click',() => this.mouseClick());
            app.stage.on('pointermove', (event) => this.startMouseFollowing(event));
            //app.stage.off('pointermove', (event) => this.startMouseFollowing(event))
        }
        getHp()
        {
            return this.__hp;
        }
        setHp(hp)
        {
            this.__hp = hp;
        }
        getECells()
        {
            return this.__eCells;
        }
        getDefense()
        {
            return this.__defense;
        }
        setDefense(defense)
        {
            this.__defense = defense;
        }
        getPtrTower()
        {
            return this.__buildType;
        }
        setTowerType(buildType)
        {
            this.__buildType = buildType;
        }
        initSprite()
        {
            this.__sprite = new PIXI.Sprite(PIXI.Texture.from(`building_${this.__buildType}.png`));
            app.stage.addChild(this.__sprite);
        }
        setPosition(x, y)
        {
            this.__sprite.position.set(x, y);
            this.__bounds = this.__sprite.getBounds();
        }
        setPeopleCount(count)
        {
            this.__peopleCount = count;
        }
        getPeopleCount()
        {
            return this.__peopleCount;
        }
        getDroppingResources()
        {
            return this.__droppingResources;
        }
        setDroppingResources(droppingResources)
        {
            this.__droppingResources = droppingResources;
        }
        getMatrixPattern()
        {
            return this.__matrixPattern;
        }
        setMatrixPattern(matrix)
        {
            this.__matrixPattern = matrix;
        }
        renderMatrixPattern()
        {
            let i = 0;
            let j = 0;
            let count = 0;
            this.__matrixPattern.forEach((row) => {
                row.forEach((num) => {
                    var cell = null;
                    if (num === 1)
                    {
                        cell = new Cell(this.__buildType, 5);
                        cell.activate();
                        this.__cellsStatus[count] = null;
                        cell.setCellId(count);
                    }
                    this.__eCells.push(cell);
                    j += 1
                    count += 1;
                })
                j = 0;
                i += 1;
            })
        }

        startMouseFollowing(event)
        {
            let position = event.data.global;
            if (this.__eCells[0]) {this.__eCells[0].setDirectPositions(position.x - this.__eCells[0].getBounds().width / 2, position.y - 28 - 14);}
            if (this.__eCells[1]) {this.__eCells[1].setDirectPositions(position.x - this.__eCells[1].getBounds().width + 4, position.y - 28);}
            if (this.__eCells[2]) {this.__eCells[2].setDirectPositions(position.x - this.__eCells[2].getBounds().width - 28 + 4, position.y - 14);}
            if (this.__eCells[3]) {this.__eCells[3].setDirectPositions(position.x - 4, position.y - 28);}
            if (this.__eCells[4]) {this.__eCells[4].setDirectPositions(position.x - this.__eCells[4].getBounds().width / 2, position.y - 14);}
            if (this.__eCells[5]) {this.__eCells[5].setDirectPositions(position.x - this.__eCells[5].getBounds().width + 4, position.y);}
            if (this.__eCells[6]) {this.__eCells[6].setDirectPositions(position.x + this.__eCells[6].getBounds().width / 2 - 8, position.y - 14);}
            if (this.__eCells[7]) {this.__eCells[7].setDirectPositions(position.x - 4, position.y);}
            if (this.__eCells[8]) {this.__eCells[8].setDirectPositions(position.x - this.__eCells[8].getBounds().width / 2, position.y + 14);}
            this.__sprite.x = position.x - this.__sprite.getBounds().width / 2;
            this.__sprite.y = position.y - this.__sprite.getBounds().height / 2;
            cells.forEach((cell) => {
                cell.changeType(cell.getType());
                this.__eCells.forEach((eCell => {
                    if ((eCell !== null) && (cell.intersectWithCell(eCell)))
                    {
                        cell.errorField();
                        this.__cellsStatus[eCell.getCellId()] = null
                        if ((cell.getType() == 1) && (cell.getPtrTower() == 0))
                        {
                            console.log(cell.getPtrTower())
                            cell.okField();
                            this.__cellsStatus[eCell.getCellId()] = cell;
                        }
                    }
                }));
            });
        }

        buildBuilding()
        {
            const sum =  Object.values(this.__cellsStatus).filter(value => value !== null).length;
            if (sum === Object.keys(this.__cellsStatus).length && sum !== 0)
            {
                Object.values(this.__cellsStatus).forEach(element => {
                    element.setPtrTower(this.getPtrTower());
                    this.__stopMovingFlag = true;
                    app.stage.on('pointermove', (event) => this.startMouseFollowing(event)).off('pointermove');
                    console.log(this.__sprite.getBounds().x)
                    this.__sprite.x = this.__cellsStatus[4].getBounds().x;
                    this.__sprite.y = this.__cellsStatus[4].getBounds().y - this.__sprite.getBounds().height / 3;
                    this.clearPatterns()
                });
            }
        }

        clearPatterns()
        {
            this.__eCells.forEach(cell => {
                if (cell !== null)
                {
                    //cell.getSprite().parent.removeChild(cell.getSprite());
                    for (let property in cell)
                    {
                        delete cell[property]
                    }
                }
            })
            Object.values(this.__cellsStatus).forEach(cell => {
                cell.changeType(cell.getType());
            })
        }

        mouseClick()
        {
            if (!this.__stopMovingFlag)
            {
                this.buildBuilding();
            }
        }
    }

    let worldMatrix = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, ],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, ],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, ],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, ],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 0, 0, ],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 0, ],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0, ],
        [0, 1, 1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 1, 1, 1, 1, 2, 0, 0, ],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0, 0, ],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, ],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, ],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, ],
        [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
        [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, ],
        [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, ],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, ],
    ];

    let cells = [];
    function mapReader(worldMatrix)
    {
        let i = 0;
        let j = 0;
        worldMatrix.forEach((row) => {
            row.forEach((num) => {
                var cell = new Cell(0, num);
                cell.setPositionsInIsometric(500 + 28 * i, -500 + 28 * j);
                if (i % 2 == 0)
                {   
                    cell.setPositionsInIsometric(500 + 28 * i, -500 + 28 * j);
                }
                cells.push(cell);
                j += 1
            })
            j = 0;
            i += 1;
        })
    }
    mapReader(worldMatrix)
    

    window.addEventListener('keydown', (key) => {
        if (key.key === 'r')
        {
            let t = new build(100, 0, 0);
            t.setMatrixPattern([
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0],
            ])
            t.renderMatrixPattern();
        }
    })
        
    return {
        stage: app.stage,
    };
})();
    

 