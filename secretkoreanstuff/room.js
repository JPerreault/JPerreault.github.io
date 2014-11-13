<!doctype html>
<html lang="en">
<head>
<title>Camera Texture (Three.js)</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
<link rel=stylesheet href="css/base.css"/>
</head>
<body>

<script src="js/Three.js"></script>
<script src="js/Detector.js"></script>
<script src="js/Stats.js"></script>
<script src="js/TrackballControls.js"></script>
<script src="js/THREEx.KeyboardState.js"></script>
<script src="js/THREEx.FullScreen.js"></script>
<script src="js/THREEx.WindowResize.js"></script>

<!-- jQuery code to display an information button and box when clicked. -->
<script src="js/jquery-1.9.1.js"></script>
<script src="js/jquery-ui.js"></script>
<link rel=stylesheet href="css/jquery-ui.css" />
<link rel=stylesheet href="css/info.css"/>
<script src="js/info.js"></script>
<div id="infoButton"></div>
<div id="infoBox" title="Demo Information">
Movement controls: <br/>
<ul>
<li>W/S: Translate Forward/Backward
<li>A/D: Rotate Left/Right
<li>Q/E: Translate Left/Right
<li>R/F: Rotate Up/Down
<li>Z: Reset position and rotation.
</ul>
This three.js demo is part of a collection at
<a href="http://stemkoski.github.io/Three.js/">http://stemkoski.github.io/Three.js/</a>
</div>
<!-- ------------------------------------------------------------ -->

<div id="ThreeJS" style="position: absolute; left:0px; top:0px"></div>
<script>
/*
 Three.js "tutorials by example"
 Author: Lee Stemkoski
 Date: July 2013 (three.js v59dev)
 */

// MAIN

// standard global variables
var container, scene, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// custom global variables
var MovingCube;
var textureCamera, mainCamera;

// intermediate scene for reflecting the reflection
var screenScene, screenCamera, firstRenderTarget, finalRenderTarget;

init();
animate();

// FUNCTIONS
function init()
{
	// SCENE
	scene = new THREE.Scene();
    
	// CAMERAS
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	// camera 1
	mainCamera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
	scene.add(mainCamera);
	mainCamera.position.set(0,200,500);
	mainCamera.lookAt(scene.position);
	// camera 2
	textureCamera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
	scene.add(textureCamera);
    
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer();
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	// EVENTS
	THREEx.WindowResize(renderer, mainCamera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);
	// FLOOR
	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
	// SKYBOX/FOG
	var materialArray = [];
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-xpos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-xneg.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-ypos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-yneg.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-zpos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/dawnmountain-zneg.png' ) }));
	for (var i = 0; i < 6; i++)
        materialArray[i].side = THREE.BackSide;
	var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
	
	var skyboxGeom = new THREE.CubeGeometry( 5000, 5000, 5000, 1, 1, 1 );
	
	var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
	scene.add( skybox );
	
	////////////
	// CUSTOM //
	////////////
	
	// create an array with six textures for a cool cube
	var materialArray = [];
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/xpos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/xneg.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/ypos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/yneg.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/zpos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/zneg.png' ) }));
	var MovingCubeMat = new THREE.MeshFaceMaterial(materialArray);
	var MovingCubeGeom = new THREE.CubeGeometry( 50, 50, 50, 1, 1, 1, materialArray );
	MovingCube = new THREE.Mesh( MovingCubeGeom, MovingCubeMat );
	MovingCube.position.set(0, 25.1, 0);
	scene.add( MovingCube );
	
	// a little bit of scenery...
	var ambientlight = new THREE.AmbientLight(0x111111);
	scene.add( ambientlight );
	var wireMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } );
	// torus knot
	var colorMaterial = new THREE.MeshPhongMaterial( { color: 0xff3333 } );
	var shape = THREE.SceneUtils.createMultiMaterialObject(
                                                           new THREE.TorusKnotGeometry( 30, 6, 160, 10, 2, 5 ), [ colorMaterial, wireMaterial ] );
	shape.position.set(-200, 50, -200);
	scene.add( shape );
	// torus knot
	var colorMaterial = new THREE.MeshPhongMaterial( { color: 0x33ff33 } );
	var shape = THREE.SceneUtils.createMultiMaterialObject(
                                                           new THREE.TorusKnotGeometry( 30, 6, 160, 10, 3, 2 ), [ colorMaterial, wireMaterial ] );
	shape.position.set(200, 50, -200);
	scene.add( shape );
	// torus knot
	var colorMaterial = new THREE.MeshPhongMaterial( { color: 0xffff33 } );
	var shape = THREE.SceneUtils.createMultiMaterialObject(
                                                           new THREE.TorusKnotGeometry( 30, 6, 160, 10, 4, 3 ), [ colorMaterial, wireMaterial ] );
	shape.position.set(200, 50, 200);
	scene.add( shape );
	// torus knot
	var colorMaterial = new THREE.MeshPhongMaterial( { color: 0x3333ff } );
	var shape = THREE.SceneUtils.createMultiMaterialObject(
                                                           new THREE.TorusKnotGeometry( 30, 6, 160, 10, 3, 4 ), [ colorMaterial, wireMaterial ] );
	shape.position.set(-200, 50, 200);
	scene.add( shape );
    
	
	// intermediate scene.
	//   this solves the problem of the mirrored texture by mirroring it again.
	//   consists of a camera looking at a plane with the mirrored texture on it.
	screenScene = new THREE.Scene();
	
	screenCamera = new THREE.OrthographicCamera(
                                                window.innerWidth  / -2, window.innerWidth  /  2,
                                                window.innerHeight /  2, window.innerHeight / -2,
                                                -10000, 10000 );
	screenCamera.position.z = 1;
	screenScene.add( screenCamera );
    
	var screenGeometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
	
	firstRenderTarget = new THREE.WebGLRenderTarget( 512, 512, { format: THREE.RGBFormat } );
	var screenMaterial = new THREE.MeshBasicMaterial( { map: firstRenderTarget } );
	
	var quad = new THREE.Mesh( screenGeometry, screenMaterial );
	// quad.rotation.x = Math.PI / 2;
	screenScene.add( quad );
    
	// final version of camera texture, used in scene.
	var planeGeometry = new THREE.CubeGeometry( 400, 200, 1, 1 );
	finalRenderTarget = new THREE.WebGLRenderTarget( 512, 512, { format: THREE.RGBFormat } );
	var planeMaterial = new THREE.MeshBasicMaterial( { map: finalRenderTarget } );
	var plane = new THREE.Mesh( planeGeometry, planeMaterial );
	plane.position.set(0,100,-500);
	scene.add(plane);
	// pseudo-border for plane, to make it easier to see
	var planeGeometry = new THREE.CubeGeometry( 420, 220, 1, 1 );
	var planeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
	var plane = new THREE.Mesh( planeGeometry, planeMaterial );
	plane.position.set(0,100,-502);
	scene.add(plane);
	
}

function animate()
{
    requestAnimationFrame( animate );
	render();
	update();
}

function update()
{
	var delta = clock.getDelta(); // seconds.
	var moveDistance = 200 * delta; // 200 pixels per second
	var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second
	
	// local transformations
    
	// move forwards/backwards/left/right
	if ( keyboard.pressed("W") )
		MovingCube.translateZ( -moveDistance );
	if ( keyboard.pressed("S") )
		MovingCube.translateZ(  moveDistance );
	if ( keyboard.pressed("Q") )
		MovingCube.translateX( -moveDistance );
	if ( keyboard.pressed("E") )
		MovingCube.translateX(  moveDistance );
    
	// rotate left/right/up/down
	var rotation_matrix = new THREE.Matrix4().identity();
	if ( keyboard.pressed("A") )
		MovingCube.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
	if ( keyboard.pressed("D") )
		MovingCube.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
	if ( keyboard.pressed("R") )
		MovingCube.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
	if ( keyboard.pressed("F") )
		MovingCube.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);
	
	if ( keyboard.pressed("Z") )
	{
		MovingCube.position.set(0,25.1,0);
		MovingCube.rotation.set(0,0,0);
	}
	
	// update the texture camera's position and look direction
	var relativeCameraOffset = new THREE.Vector3(0,0,1);
	var cameraOffset = MovingCube.matrixWorld.multiplyVector3( relativeCameraOffset );
	textureCamera.position.x = cameraOffset.x;
	textureCamera.position.y = cameraOffset.y;
	textureCamera.position.z = cameraOffset.z;
	var relativeCameraLookOffset = new THREE.Vector3(0,0,-1);
	var cameraLookOffset = relativeCameraLookOffset.applyMatrix4( MovingCube.matrixWorld );
	textureCamera.lookAt( cameraLookOffset );
    
	stats.update();
}

function render()
{
	// textureCamera is located at the position of MovingCube
	//   (and therefore is contained within it)
	// Thus, we temporarily hide MovingCube
	//    so that it does not obscure the view from the camera.
	MovingCube.visible = false;
	// put the result of textureCamera into the first texture.
	renderer.render( scene, textureCamera, firstRenderTarget, true );
	MovingCube.visible = true;
    
	// slight problem: texture is mirrored.
	//    solve problem by rendering (and hence mirroring) the texture again
	
	// render another scene containing just a quad with the texture
	//    and put the result into the final texture
	renderer.render( screenScene, screenCamera, finalRenderTarget, true );
	
	// render the main scene
	renderer.render( scene, mainCamera );
}

</script>

</body>
</html>