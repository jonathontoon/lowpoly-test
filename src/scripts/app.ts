import { DirectionalLight, OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer } from "three";

import RubiksCube from "./rubikscube";
import TexturedPlane from "./texturedplane";

class App {
	private readonly rootElement: HTMLDivElement;

	private readonly scene: Scene;
	private readonly camera: PerspectiveCamera;
	
	private readonly dummyScene: Scene;
	private readonly dummyCamera: OrthographicCamera;

	private readonly light: DirectionalLight;

	private readonly rubikscube: RubiksCube;
	private readonly texturedPlane: TexturedPlane;

	private readonly renderer: WebGLRenderer;

	constructor() {
		this.rootElement = document.querySelector("#root") as HTMLDivElement;
		
		this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
		this.camera.position.z = 600;

		this.dummyCamera = new OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 10000, 10000);
		this.dummyCamera.position.z = 1;
       
		this.scene = new Scene();
		this.dummyScene = new Scene();

		this.rubikscube = new RubiksCube({
			spacing: 0.05,
			colors: ["#C41E3A", "#009E60", "#0051BA", "#FF5800", "#FFD500", "#FFFFFF"],
			size: 3
		});

		this.rubikscube.addToScene(this.scene);

		this.light = new DirectionalLight("#FFFFFF", 2);
		this.light.castShadow = true;
		this.light.target = this.rubikscube.object;
		this.light.position.set(10, 10, 10);
		this.scene.add(this.light);

		this.texturedPlane = new TexturedPlane({ width: window.innerWidth, height: window.innerHeight, resolution: 8 });
		this.texturedPlane.addToScene(this.dummyScene);

		this.renderer = new WebGLRenderer();
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setClearColor("#ffffff");
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.autoClear = false;
		this.rootElement.appendChild(this.renderer.domElement);

		this.handleOnResize = this.handleOnResize.bind(this);
		this.handleRequestAnimationFrame = this.handleRequestAnimationFrame.bind(this);

		window.addEventListener("resize", this.handleOnResize, false);
		window.requestAnimationFrame(this.handleRequestAnimationFrame);
	};

	private handleOnResize(event: Event): void {
		const windowTarget: Window = event.target as Window;
		this.camera.aspect = windowTarget.innerWidth / windowTarget.innerHeight;
        
		this.dummyCamera.left = windowTarget.innerWidth / - 2;
		this.dummyCamera.right = windowTarget.innerWidth / 2;
		this.dummyCamera.top = windowTarget.innerHeight / 2;
		this.dummyCamera.bottom = windowTarget.innerHeight / - 2;

		this.texturedPlane.setSize(windowTarget.innerWidth, windowTarget.innerHeight);

		this.renderer.setSize(windowTarget.innerWidth, windowTarget.innerHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);
	};

	private handleRequestAnimationFrame(): void {
		const canvas: HTMLCanvasElement = this.renderer.domElement;
		this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
		this.camera.updateProjectionMatrix();
		this.camera.lookAt(this.scene.position);
		this.light.position.copy(this.camera.position);

		this.rubikscube.setRotation(0.005, 0.005, 0.01);
		this.texturedPlane.addToRenderer(this.renderer);

		this.renderer.clear();
		this.renderer.render(this.scene, this.camera);

		this.renderer.setRenderTarget(null);
		this.renderer.clear();
		this.renderer.render(this.dummyScene, this.dummyCamera);

		window.requestAnimationFrame(this.handleRequestAnimationFrame);
	};

	public static initialize(): App {
		return new App();
	};
};

export default App;