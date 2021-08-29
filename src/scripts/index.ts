import * as THREE from "three";
import { BoxGeometry, MeshBasicMaterial } from "three";
import { OrbitControls } from "three-orbitcontrols-ts";

(function (): void {

	/*
		Variables
	*/

	const CUBE_SIZE: number = 3;
	const CUBE_SPACING: number = 0;
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

	const RESOLUTION: number = 10;

	let isInteracting: boolean = false;

	let rootElement: HTMLDivElement;

	let camera: THREE.PerspectiveCamera;
	let dummyCamera: THREE.OrthographicCamera;

	let controls: OrbitControls;

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

		if (isInteracting === false) {
			cubeObject.rotation.x += 0.005;
			cubeObject.rotation.y += 0.005;
			cubeObject.rotation.z += 0.01;
		}

		controls.update();
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

		for (let x = 0; x < CUBE_SIZE; x++) {
			for (let y = 0; y < CUBE_SIZE; y++) {
				for (let z = 0; z < CUBE_SIZE; z++) {
					const box: THREE.BoxGeometry = new THREE.BoxGeometry(1, 1, 1);
					const cubeColor: string = CUBE_COLORS[Math.floor(Math.random()*CUBE_COLORS.length)];
					const material: THREE.MeshLambertMaterial = new THREE.MeshLambertMaterial({ color: cubeColor });
					const mesh: THREE.Mesh = new THREE.Mesh(box, material);
					mesh.position.set(x+x*CUBE_SPACING, y+y*CUBE_SPACING, z+z*CUBE_SPACING);
					cubeObject.add(mesh);
				}
			}
		}
 
		cubeObject.position.set(-0.5*(CUBE_SIZE+CUBE_SPACING*CUBE_SIZE-2), -0.5*(CUBE_SIZE+CUBE_SPACING*CUBE_SIZE-2), -0.5*(CUBE_SIZE+CUBE_SPACING*CUBE_SIZE-2));
		cubeObject.rotation.set(0,0,0);
		cubeObject.receiveShadow = true;
		cubeObject.scale.set(50, 50, 50);
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

		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableZoom = true;
		controls.addEventListener("start", () => {
			isInteracting = true;
		});

		controls.addEventListener("end", () => {
			isInteracting = false;
		});
		// camera.position.set(0, 20, 100);
	};

	/*
		Events
	*/

	window.addEventListener("DOMContentLoaded", handleOnDOMContentLoaded, false);
	window.addEventListener("resize", handleOnResize, false);
	window.requestAnimationFrame(handleRequestAnimationFrame);

})();