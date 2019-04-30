function start(material, video) {

	var reg = new RegExp(/(hands-institucional)/g);
	var href = window.location.href;
	var prod = href.match(reg);

	THREEx.ArToolkitContext.baseURL = '../';

	var renderer	= new THREE.WebGLRenderer({
		antialias : true,
		alpha: true,
		logarithmicDepthBuffer: true
	});

	renderer.setClearColor(new THREE.Color('lightgrey'), 0);
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMapEnabled = true;
	renderer.sortObjects = false;
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '0px';
	renderer.domElement.style.left = '0px';
	document.body.appendChild(renderer.domElement);
	
	var onRenderFcts= [];
	var scene = new THREE.Scene();

	var ambient = new THREE.AmbientLight( 0x666666 );
	scene.add(ambient);

	var directionalLight = new THREE.DirectionalLight('white');
	directionalLight.position.set( 1, 2, 0.3 ).setLength(2)
	directionalLight.shadow.mapSize.set(128,128)
	directionalLight.shadow.camera.bottom = -0.6
	directionalLight.shadow.camera.top = 0.6
	directionalLight.shadow.camera.right = 0.6
	directionalLight.shadow.camera.left = -0.6
	directionalLight.castShadow = true;
	scene.add(directionalLight);

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
		cameraParametersUrl: prod ? 'assets/camera_para.dat' : THREEx.ArToolkitContext.baseURL + 'assets/camera_para.dat',
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
		patternUrl : prod ? 'assets/qr-test.patt' : THREEx.ArToolkitContext.baseURL + 'assets/qr-test.patt'
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
	var geometry = new THREE.SphereGeometry(0.5, 64, 64);
	
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(0, 0.5, 0);
	mesh.castShadow = true;
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	directionalLight.target = mesh
	mesh.name = "sphere";

	arWorldRoot.add(mesh);
	
	// var stats = new Stats();
	// document.body.appendChild( stats.dom );

	// render the scene
	onRenderFcts.push(function(){
		renderer.render( scene, camera );
		// stats.update();
	})

	var shadowMat = new THREE.ShadowMaterial();
	shadowMat.opacity = 0.7; //! bug in threejs. can't set in constructor

	var geometry = new THREE.PlaneGeometry(3, 3)
	var planeMesh = new THREE.Mesh(geometry, shadowMat);
	planeMesh.receiveShadow = true;
	planeMesh.depthWrite = false;
	planeMesh.rotation.x = -Math.PI/2
	markerRoot.add(planeMesh);
	
	// run the rendering loop
	var lastTimeMsec= null;
	requestAnimationFrame(function animate(nowMsec){

		if(scene.children[2].visible) {
			if(video && video.paused) video.play();
			scene.getObjectByName("sphere").visible = true;
		}
		else {
			if(video) {
				video.pause(); 
				video.currentTime = 0;
			}
			scene.getObjectByName("sphere").visible = false;
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