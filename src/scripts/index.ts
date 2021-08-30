import * as THREE from "three";

(function (): void {

	/*
		Variables
	*/

	const CUBE_SIZE: number = 3;
	const CUBE_SPACING: number = 0.1;
	const CUBE_COLORS: string[] = ["#8CF4FF", "#437632", "#593C2C", "#707070", "#F43314"];
	
	const V_SHADER: string = `
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}
	`;

	const F_SHADER: string = `
		varying vec2 vUv;
		uniform sampler2D tDiffuse;

		void main() {
			gl_FragColor = texture2D( tDiffuse, vUv );
		}
	`;

	const RESOLUTION: number = 8;

	let rootElement: HTMLDivElement;

	let camera: THREE.PerspectiveCamera;
	let dummyCamera: THREE.OrthographicCamera;

	let scene: THREE.Scene;
	let dummyScene: THREE.Scene;

	let renderTarget: THREE.WebGLRenderTarget;

	let materialScreen: THREE.ShaderMaterial;
	let plane: THREE.PlaneGeometry;
	let quad: THREE.Mesh;

	let light: THREE.DirectionalLight;

	let cubeObject: THREE.Object3D;

	let renderer: THREE.WebGLRenderer;

	/*
		Functions
	*/

	function handleRequestAnimationFrame(): void {
		const canvas: HTMLCanvasElement = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
		camera.lookAt(scene.position);
		light.position.copy(camera.position);

		cubeObject.rotation.x += 0.005;
		cubeObject.rotation.y += 0.005;
		cubeObject.rotation.z += 0.01;

		renderer.setRenderTarget(renderTarget);
		renderer.clear();
		renderer.render(scene, camera);

		// Render full screen quad with generated texture
		renderer.setRenderTarget(null);
		renderer.clear();
		renderer.render(dummyScene, dummyCamera);

		window.requestAnimationFrame(handleRequestAnimationFrame);
	};

	function handleOnResize(event: Event): void {
		const windowTarget: Window = event.target as Window;
		camera.aspect = windowTarget.innerWidth / windowTarget.innerHeight;
        
		dummyCamera.left = windowTarget.innerWidth / - 2;
		dummyCamera.right = windowTarget.innerWidth / 2;
		dummyCamera.top = windowTarget.innerHeight / 2;
		dummyCamera.bottom = windowTarget.innerHeight / - 2;

		renderTarget.setSize(windowTarget.innerWidth / 10, windowTarget.innerHeight / 10);
		renderer.setSize(windowTarget.innerWidth, windowTarget.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
	};

	function handleOnDOMContentLoaded(): void {
		rootElement = document.querySelector("#root") as HTMLDivElement;
		
		camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.z = 600;

		dummyCamera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 10000, 10000);
		dummyCamera.position.z = 1;
       
		scene = new THREE.Scene();
		dummyScene = new THREE.Scene();

		const targetOptions: THREE.WebGLRenderTargetOptions = {
			minFilter: THREE.LinearFilter, 
			magFilter: THREE.NearestFilter, 
			format: THREE.RGBFormat 
		};
		
		renderTarget = new THREE.WebGLRenderTarget(window.innerWidth / RESOLUTION, window.innerHeight / RESOLUTION, targetOptions);

		cubeObject = new THREE.Object3D();

		const CUBE_START: number = ((CUBE_SIZE - 1) / 2) * -1;
		const CUBE_END: number = ((CUBE_SIZE - 1) / 2);

		console.log(CUBE_START, CUBE_END);

		const colours = [0xC41E3A, 0x009E60, 0x0051BA, 0xFF5800, 0xFFD500, 0xFFFFFF];
		const faceMaterials = colours.map((c) => {
			return new THREE.MeshLambertMaterial({ color: c });
		});
		
		for (let x = CUBE_START; x <= CUBE_END; x++) {
			for (let y = CUBE_START; y <= CUBE_END; y++) {
				for (let z = CUBE_START; z <= CUBE_END; z++) {
					const box: THREE.BoxGeometry = new THREE.BoxGeometry(1, 1, 1);
					// const cubeColor: string = CUBE_COLORS[Math.floor(Math.random()*CUBE_COLORS.length)];
					// const material: THREE.MeshLambertMaterial = new THREE.MeshLambertMaterial({ color: cubeColor });
					const mesh: THREE.Mesh = new THREE.Mesh(box, faceMaterials);
					mesh.position.set(x+x*CUBE_SPACING, y+y*CUBE_SPACING, z+z*CUBE_SPACING);
					cubeObject.add(mesh);
				}
			}
		}
 
		cubeObject.position.set(-0.5*(CUBE_SIZE+CUBE_SPACING*CUBE_SIZE-2), -0.5*(CUBE_SIZE+CUBE_SPACING*CUBE_SIZE-2), -0.5*(CUBE_SIZE+CUBE_SPACING*CUBE_SIZE-2));
		cubeObject.rotation.set(0,0,0);
		cubeObject.scale.set(60, 60, 60);
		scene.add(cubeObject);

		light = new THREE.DirectionalLight("#FFFFFF", 2);
		light.castShadow = true;
		light.target = cubeObject;
		light.position.set(10, 10, 10);
		scene.add(light);

		materialScreen = new THREE.ShaderMaterial({
			uniforms: { tDiffuse: { value: renderTarget.texture } },
			vertexShader: V_SHADER,
			fragmentShader: F_SHADER,
			depthWrite: false
		});

		plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
		quad = new THREE.Mesh(plane, materialScreen);
		quad.receiveShadow = true;
		quad.position.z = -100;
		dummyScene.add(quad);

		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setClearColor("#ffffff");
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.autoClear = false;

		rootElement.appendChild( renderer.domElement );
	};

	/*
		Events
	*/

	window.addEventListener("DOMContentLoaded", handleOnDOMContentLoaded, false);
	window.addEventListener("resize", handleOnResize, false);
	window.requestAnimationFrame(handleRequestAnimationFrame);

})();