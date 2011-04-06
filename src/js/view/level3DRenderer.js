var levelRendererCreator = function(options) {
    var el, levelData,
        sprites = [], playerSprite,
        camera, scene, renderer,
        cellSize = options.cellSize || 40,
        gridWidth, gridHeight,
        cameraMode = "ortho",
        useWebGL = false,
        materials = {
            wall: 'images/sprites_all_3d_05.png',
            bigStone: 'images/sprites_all_3d_07.png',
            smallStone: 'images/sprites_all_3d_09.png',
            arrowUp: 'images/sprites_all_3d_16.png',
            arrowRight: 'images/sprites_all_3d_17.png',
            arrowDown: 'images/sprites_all_3d_18.png',
            arrowLeft: 'images/sprites_all_3d_19.png'
        },
        resolveXZPosition = function (x, y, sprite) {
            var newX = Math.floor( x ) * cellSize + cellSize/2 - gridWidth/1.6,
                newZ = Math.floor( y ) * cellSize + cellSize/2 - gridHeight/2.8;
            if (sprite.newPos) {
                sprite.newPos.x = newX;
                sprite.newPos.z = newZ;
            } else {
                sprite.position.x = newX;
                sprite.position.z = newZ;
            }
            if (sprite.alignToX) {
                sprite.translateZ(-cellSize/2);
            }
        },
        resolveSpritePosition = function (x, y, sprite) {
            var newY = ( sprite.scale.y * cellSize ) / 2;
            resolveXZPosition(x, y, sprite);
            if (sprite.newPos) {
                sprite.newPos.y = newY;
            } else {
                sprite.position.y = newY;
            }
        },
        createMaterial = function (options) {
            if (materials.hasOwnProperty(options.kind)) {
                if (navigator.userAgent.toLowerCase().indexOf("firefox") != -1) {
                    return new THREE.MeshBasicMaterial({
                        map: ImageUtils.loadTexture( materials[options.kind] ),
                        overdraw: true, doubleSided: false, shading: THREE.FlatShading
                    });
                } else {
                    return new THREE.MeshLambertMaterial({
                        map: ImageUtils.loadTexture( materials[options.kind] ),
                        overdraw: true, doubleSided: false, shading: THREE.FlatShading
                    });
                }
            } else {
                return new THREE.MeshLambertMaterial( { color: options.color || 0x333333, shading: THREE.FlatShading } );
            }
        },
        randomDiamondColor = function () {
            var r = 200 + Math.floor(55*Math.random()),
                g = 200 + Math.floor(55*Math.random()),
                b = 255,
                color = b + 256 * g + 65536 * r;
            console.log([r, g, b]);
            return color;

        },
        createDiamond = function (options) {
            var geometry = diamondModel,
                material = new THREE.MeshLambertMaterial( { color: randomDiamondColor(), shading: THREE.FlatShading } );
                diamond = new THREE.Mesh( geometry, material );
            diamond.doubleSided = true;
            diamond.rotation.z = -Math.PI/3.2;
            diamond.rotation.y = 2*Math.PI*Math.random();//Math.PI/8;
            scene.addObject(diamond);
            return diamond;
        },
        createBlock = function (options) {
            var size = cellSize - (options.offset ? options.offset : 0),
                geometry = new Cube( size, size, size ),
                material = createMaterial(options),
                cube = new THREE.Mesh( geometry, material );

            scene.addObject(cube);
            return cube;
        },
        createBall = function (options) {
            var geometry = new Sphere( options.size ? options.size : cellSize / 2 ),
                material = createMaterial(options),
                ball = new THREE.Mesh( geometry, material );

            scene.addObject(ball);
            return ball;
        },
        createGround = function (options) {
            var size = cellSize - 1,
                geometry = new Plane(size, size),
                material = createMaterial(options),
                plane = new THREE.Mesh( geometry, material );
            plane.rotation.x = options.rotationX != undefined ? options.rotationX : (-Math.PI / 2);
            if (options.alignToX) {
                plane.translateY(-cellSize/2);
                plane.alignToX = true;
            }
            scene.addObject(plane);
            return plane;
        },
        createSpritesForCell = function (x, y, cell) {
            if (cell.sprite && cell.sprite.kind !== cell.getType()) {
                cell.sprite = null;
            }

            if (!cell.sprite) {
                if (!cell.is("empty")) {
                    if (cell.is("player")) {
                        cell.sprite = createBall({ x: x, y: y, kind: cell.getType(), color: 0xffffff });
                        playerSprite = cell.sprite;
                    } else if (cell.is("tiamont")) {
                        cell.sprite = createDiamond({ x: x, y: y, kind: cell.getType(), color: 0xaaaaee, size: 15 });
                    } else if (cell.is("wall")) {
                        cell.sprite = createBlock({ x: x, y: y, kind: cell.getType() });
                    } else {
                        cell.sprite = createBlock({ x: x, y: y, kind: cell.getType(), offset: 1 });
                    }
                    cell.sprite.kind = cell.getType();
                    sprites.push(cell.sprite);
                }
            }
            if (!cell.groundSprite) {
                if (cell.is("exit")) {
                    cell.groundSprite = createGround({
                        x: x, y: y, kind: cell.getGroundType(),
                        rotationX: 0, alignToX: true
                    });
                } else {
                    cell.groundSprite = createGround({ x: x, y: y, kind: cell.getGroundType() });
                }
            }
        },
        resolveSpritePositionsForCell = function (x, y, cell) {
            if (cell.sprite) {
                resolveSpritePosition(x, y, cell.sprite);
            }
            if (cell.groundSprite) {
                resolveXZPosition(x, y, cell.groundSprite);
            }
        },
        
        init = function () {

            gridWidth = levelData.getWidth() * cellSize;
            gridHeight = levelData.getWidth() * cellSize;

            el = document.createElement( 'div' );

            if (cameraMode === "ortho") {
                camera = new THREE.Camera( 45, window.innerWidth / window.innerHeight, - 2000, 1000 );
                camera.up = new THREE.Vector3(0.3, -0.5, -1);
                camera.projectionMatrix = THREE.Matrix4.makeOrtho( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 2000, 1000 );
                camera.position.x = -20;
                camera.position.y = 100;
                camera.position.z = 50;
            } else {
                camera = new THREE.Camera( 45, window.innerWidth / window.innerHeight, - 4000, 500 );
                //camera.projectionMatrix = THREE.Matrix4.makeOrtho( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 2000, 1000 );
                camera.position.x = 200 + gridWidth/2;
                camera.position.y = 400;
                camera.position.z = 200 + gridHeight/2;
            }

            scene = new THREE.Scene();

            // Lights

            var ambientLight = new THREE.AmbientLight( 0x111111 );
            scene.addLight( ambientLight );

            var directionalLight = new THREE.DirectionalLight( 0xffffff );
            directionalLight.position.x = 1;
            directionalLight.position.y = 2;
            directionalLight.position.z = -1;
            directionalLight.position.normalize();
            scene.addLight( directionalLight );

            var directionalLight = new THREE.DirectionalLight( 0x666666 );
            directionalLight.position.x = 0;
            directionalLight.position.y = 0.5;
            directionalLight.position.z = 1;
            directionalLight.position.normalize();
            scene.addLight( directionalLight );

            if (useWebGL) {
                renderer = new THREE.WebGLRenderer();
            } else {
                //renderer = new THREE.SVGRenderer();
                renderer = new THREE.CanvasRenderer();
            }
            renderer.setSize( window.innerWidth, window.innerHeight );

            el.appendChild( renderer.domElement );
        },
        renderEndCallback = null,
        renderingProgress = 0,
        renderingStepSite = 0.1,
        renderStep = function () {
            renderingProgress = Math.min(renderingProgress, 1.0);

            for (i = 0; i < sprites.length; i++) {
                var sprite = sprites[i];
                if (sprite.newPos && sprite.oldPos) {
                    if (!sprite.delta) {
                        sprite.delta = sprite.newPos.clone();
                        sprite.delta.subSelf(sprite.oldPos);
                    }
                    if (sprite.delta.length() < 1.0) {
                        sprite.newPos = null;
                        sprite.oldPos = null;
                    } else {
                        sprite.position.x = sprite.oldPos.x + sprite.delta.x*renderingProgress;
                        sprite.position.y = sprite.oldPos.y + sprite.delta.y*renderingProgress;
                        sprite.position.z = sprite.oldPos.z + sprite.delta.z*renderingProgress;
                    }
                }
            }
            renderer.render( scene, camera );
            if (renderingProgress < 1.0) {
                renderingProgress += renderingStepSite;
                requestAnimationFrame(renderStep)
            } else {
                renderEndCallback && renderEndCallback();
            }
        },
        render = function (options) {
            options = options || {};
            renderEndCallback = options.renderEndCallback;
            for (var i = 0; i < sprites.length; i++) {
                sprites[i].hasOwner = false;
            }

            levelData.eachCell(function (x, y, cell) {
                createSpritesForCell(x, y, cell);
                if (cell.sprite) {
                    cell.sprite.hasOwner = true;
                    cell.sprite.oldPos = cell.sprite.position.clone();
                    cell.sprite.newPos = cell.sprite.position.clone();
                    cell.sprite.delta = null;
                }
                resolveSpritePositionsForCell(x, y, cell);
            });

            for (i = 0; i < sprites.length; i++) {
                if (sprites[i].hasOwner == false) {
                    scene.removeObject(sprites[i]);
                    sprites.splice(i, 1);
                }
            }
            renderingProgress = useWebGL ? 0.0 : 1.0;
            renderStep();
        },
        spin = function () {
            requestAnimationFrame( spin );

            var timer = new Date().getTime() * 0.0005;

            camera.position.x = Math.cos( timer ) * 200 + 20;
            camera.position.z = Math.sin( timer ) * 200 - 50;

            renderer.render( scene, camera );
        },
        animationProgress = 0,
        animationEndCallback,
        startLevelCompleteAnimation = function (callback) {
            if (callback) { animationEndCallback = callback; }

            animationProgress += 0.05;
            if(animationProgress >= 1.0) {
                animationEndCallback && animationEndCallback();
                return;
            }
            playerSprite.translateY(-cellSize * 0.15);
            playerSprite.scale.x = 1.0 - animationProgress;
            playerSprite.scale.y = 1.0 - animationProgress;
            playerSprite.scale.z = 1.0 - animationProgress;
            renderer.render( scene, camera );
            setTimeout(startLevelCompleteAnimation, 1000 / 30);
        };


    levelData = options.levelData;

    init();
    //spin();

    setTimeout(render, 500);

    return {
        el: el,
        render: render,
        startLevelCompleteAnimation: startLevelCompleteAnimation
    };
};