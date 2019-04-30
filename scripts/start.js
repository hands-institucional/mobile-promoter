function start(material, video) {

	THREEx.ArToolkitContext.baseURL = '../';

	var renderer	= new THREE.WebGLRenderer({
		antialias : true,
		alpha: true,
		logarithmicDepthBuffer: true
	});

	renderer.setClearColor(new THREE.Color('lightgrey'), 0);
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '0px';
	renderer.domElement.style.left = '0px';
	document.body.appendChild(renderer.domElement);
	
	var onRenderFcts= [];
	var scene = new THREE.Scene();
	
	var camera = new THREE.Camera();
	scene.add(camera);
	
	var arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
	});
	
	arToolkitSource.init(function onReady(){
		onResize()
	});
	
	window.addEventListener('resize', function(){
		onResize()
	});

	function onResize(){
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)

		if( arToolkitContext.arController !== null ){
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}
	
	// create atToolkitContext
	var arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: THREEx.ArToolkitContext.baseURL + 'lib/data/camera_para',
		detectionMode: 'mono',
		maxDetectionRate: 30,
		canvasWidth: 80*3,
		canvasHeight: 60*3,
	})

	// initialize it
	arToolkitContext.init(function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	})
	
	// update artoolkit on every frame
	onRenderFcts.push(function(){
		if( arToolkitSource.ready === false )	return
		smoothedControls.update(markerRoot)
		arToolkitContext.update( arToolkitSource.domElement )
	})
	
	var markerRoot = new THREE.Group

	scene.add(markerRoot)
	var artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
		type : 'pattern',
		patternUrl : THREEx.ArToolkitContext.baseURL + 'lib/data/qr-test'
	})
	
	// build a smoothedControls
	var smoothedRoot = new THREE.Group()
	scene.add(smoothedRoot)
	var smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
		lerpPosition: 0.2,
		lerpQuaternion: 0.03,
		lerpScale: 0.01,
	})
	
	var arWorldRoot = smoothedRoot

	var size = 4.5;
	var geometry	= new THREE.SphereGeometry(0.5, 64, 64);
	
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(0, 1.5, 0);

	arWorldRoot.add(mesh);
	
	// var stats = new Stats();
	// document.body.appendChild( stats.dom );

	// render the scene
	onRenderFcts.push(function(){
		renderer.render( scene, camera );
		// stats.update();
	})
	
	// run the rendering loop
	var lastTimeMsec= null;
	requestAnimationFrame(function animate(nowMsec){

		if(scene.children[2].visible) {
			if(video && video.paused) video.play();
			scene.children[2].children[0].visible = true;
		}
		else {
			if(video) {
				video.pause(); 
				video.currentTime = 0;
			}
			scene.children[2].children[0].visible = false;
		}
	
		// keep looping
		requestAnimationFrame( animate );
	
		// measure time
		lastTimeMsec = lastTimeMsec || nowMsec-1000/60
		var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
		lastTimeMsec = nowMsec;

		// call each update function
		onRenderFcts.forEach(function(onRenderFct){
			onRenderFct(deltaMsec/1000, nowMsec/1000);
		})
	})
}