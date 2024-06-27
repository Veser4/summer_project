
(async () =>
{
    const app = new PIXI.Application();
    await app.init({ background: '#1099bb', resizeTo: window });

    document.body.appendChild(app.canvas);

    const floorTexture = await PIXI.Assets.load('floor_1.png');
    const floor = new PIXI.Sprite(floorTexture);

    const texture = await PIXI.Assets.load('mc.json');
    const knightTextures = [];
    for (let i = 0; i < 30; i++)
    {
        const texture = PIXI.Texture.from(`Knight ${i + 1}.png`);
        knightTextures.push(texture);
    }

    const knight = new PIXI.AnimatedSprite(knightTextures);
    knight.animationSpeed = 0.13;
    
    app.stage.addChild(knight);
    app.stage.addChild(floor);

    knight.stop();

    knight.anchor.set(0.5, 1);
    floor.anchor.set(0.5, 0);

    knight.x = app.screen.width / 2;
    knight.y = 200;

    floor.x = app.screen.width / 2;
    floor.y = 450;
    // knight.y = app.screen.height / 2;
    knight.speed = 2;
    let vy = 0;
    knight.vx = 0;
    let vyj = 5;
    knight.gravity = 0.1;
    knight.jumping = false;
    knight.onTheGround = true;
    knight.right = false;
    knight.left = false;
    knight.top = false;

    document.addEventListener('keydown', (e) => {

        const { code } = e;

        if (code === 'ArrowRight')
        {
            knight.right = true;
        }
        if (code === 'ArrowLeft')
        {
            knight.left = true;
        }
        if (code === 'ArrowUp') 
        {
            knight.top = true;
            jump()
        }
    });

    function jump()
    {
        if ((knight.top) && (!knight.jumping) && (knight.onTheGround))
        {
            knight.jumping = true;
            knight.onTheGround = false;
        }
    }

    function intersects(object1, object2)
    {
        const bounds1 = object1.getBounds();
        const bounds2 = object2.getBounds();

        return (
            bounds1.x < bounds2.x + bounds2.width
            && bounds1.x + bounds1.width > bounds2.x
            && bounds1.y < bounds2.y + bounds2.height
            && bounds1.y + bounds1.height > bounds2.y
        );
    }

    document.addEventListener('keyup', (e) => {

        const { code } = e;

        if (code === 'ArrowRight')
        {
            knight.right = false;
            knight.vx = 0;
            knight.currentFrame = 0
        }
        if (code === 'ArrowLeft')
        {
            knight.left = false;
            knight.vx = 0;
            knight.currentFrame = 0
        }
        if (code === 'ArrowUp')
            {
                knight.top = false;
            }
    });

    console.log(knight.y);

    app.ticker.add((time) =>
    {
        knight.play();
        if (knight.right)
        {
            knight.scale.x = 1;
            if (knight.vx < knight.speed)
            {
                knight.vx += 0.02;
            }
            if (knight.currentFrame == 11)
            {
                knight.currentFrame = 6
            }
            knight.x += knight.vx;
        }
        if (knight.left)
        {
            knight.scale.x = -1;
            if (knight.vx < knight.speed)
            {
                knight.vx += 0.02;
            }
            if (knight.currentFrame == 11)
            {
                knight.currentFrame = 6
            }
            knight.x -= knight.vx;
        }

        if (!knight.jumping && !knight.right && !knight.left)
        {
            if (knight.currentFrame == 3)
            {
                knight.currentFrame = 0
            }
        }
        jump();
        if (knight.jumping)
        {
            vyj -= knight.gravity;
            knight.y -= vyj;

            if (vyj <= 0)
            {
                vyj = 5;
                knight.jumping = false;
            }   
        }
        else
        {
            vy += knight.gravity;
            knight.y += vy;
            if (intersects(knight, floor))
            {
                vy = 0;
                knight.y = 450;
                knight.onTheGround = true;
            }
        }

        
    });
})();

// var Example = Example || {};

// Example.bridge = function() {
//     var Engine = Matter.Engine,
//         Render = Matter.Render,
//         Runner = Matter.Runner,
//         Body = Matter.Body,
//         Composites = Matter.Composites,
//         Common = Matter.Common,
//         Constraint = Matter.Constraint,
//         MouseConstraint = Matter.MouseConstraint,
//         Mouse = Matter.Mouse,
//         Composite = Matter.Composite,
//         Bodies = Matter.Bodies;

//     // create engine
//     var engine = Engine.create(),
//         world = engine.world;

//     // create renderer
//     var render = Render.create({
//         element: document.body,
//         engine: engine,
//         options: {
//             width: 800,
//             height: 600,
//             showAngleIndicator: true
//         }
//     });

//     Render.run(render);

//     // create runner
//     var runner = Runner.create();
//     Runner.run(runner, engine);

//     // add bodies
//     var group = Body.nextGroup(true);

//     var bridge = Composites.stack(160, 290, 15, 1, 0, 0, function(x, y) {
//         return Bodies.rectangle(x - 20, y, 53, 20, { 
//             collisionFilter: { group: group },
//             chamfer: 5,
//             density: 0.005,
//             frictionAir: 0.05,
//             render: {
//                 fillStyle: '#060a19'
//             }
//         });
//     });
    
//     Composites.chain(bridge, 0.3, 0, -0.3, 0, { 
//         stiffness: 0.99,
//         length: 0.0001,
//         render: {
//             visible: false
//         }
//     });
    
//     var stack = Composites.stack(250, 50, 6, 3, 0, 0, function(x, y) {
//         return Bodies.rectangle(x, y, 50, 50, Common.random(20, 40));
//     });

//     Composite.add(world, [
//         bridge,
//         stack,
//         Bodies.rectangle(30, 490, 220, 380, { 
//             isStatic: true, 
//             chamfer: { radius: 20 }
//         }),
//         Bodies.rectangle(770, 490, 220, 380, { 
//             isStatic: true, 
//             chamfer: { radius: 20 }
//         }),
//         Constraint.create({ 
//             pointA: { x: 140, y: 300 }, 
//             bodyB: bridge.bodies[0], 
//             pointB: { x: -25, y: 0 },
//             length: 2,
//             stiffness: 0.9
//         }),
//         Constraint.create({ 
//             pointA: { x: 660, y: 300 }, 
//             bodyB: bridge.bodies[bridge.bodies.length - 1], 
//             pointB: { x: 25, y: 0 },
//             length: 2,
//             stiffness: 0.9
//         })
//     ]);

//     // add mouse control
//     var mouse = Mouse.create(render.canvas),
//         mouseConstraint = MouseConstraint.create(engine, {
//             mouse: mouse,
//             constraint: {
//                 stiffness: 0.1,
//                 render: {
//                     visible: false
//                 }
//             }
//         });

//     Composite.add(world, mouseConstraint);

//     // keep the mouse in sync with rendering
//     render.mouse = mouse;

//     // fit the render viewport to the scene
//     Render.lookAt(render, {
//         min: { x: 0, y: 0 },
//         max: { x: 800, y: 600 }
//     });

//     // context for MatterTools.Demo
//     return {
//         engine: engine,
//         runner: runner,
//         render: render,
//         canvas: render.canvas,
//         stop: function() {
//             Matter.Render.stop(render);
//             Matter.Runner.stop(runner);
//         }
//     };
// };

// Example.bridge.title = 'Bridge';
// Example.bridge.for = '>=0.14.2';

// if (typeof module !== 'undefined') {
//     module.exports = Example.bridge;
// }