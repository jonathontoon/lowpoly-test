import { DirectionalLight, OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { Key } from "./enums";

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
		
		this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
		this.camera.position.y = 80;
		this.camera.position.z = 500;

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
		this.rubikscube.object.rotation.x = -0.8;
		this.rubikscube.object.rotation.y = 0.8;
		this.rubikscube.object.rotation.z = 0;

		this.light = new DirectionalLight("#FFFFFF", 2);
		this.light.castShadow = true;
		this.light.target = this.rubikscube.object;
		this.light.position.set(0, 0, 0);
		this.scene.add(this.light);

		this.texturedPlane = new TexturedPlane({ width: window.innerWidth, height: window.innerHeight, resolution: 8 });
		this.texturedPlane.addToScene(this.dummyScene);

		this.renderer = new WebGLRenderer();
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setClearColor("#dddddd");
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.autoClear = false;
		this.rootElement.appendChild(this.renderer.domElement);

		this.handleOnResize = this.handleOnResize.bind(this);
		this.handleRequestAnimationFrame = this.handleRequestAnimationFrame.bind(this);

		this.handleOnKeyUp = this.handleOnKeyUp.bind(this);

		window.addEventListener("resize", this.handleOnResize, false);
		window.addEventListener("keyup", this.handleOnKeyUp, false);
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

	private handleOnKeyUp(event: KeyboardEvent): void {
		const keyboardEvent: KeyboardEvent = event as KeyboardEvent;
		const key: Key | undefined = Key[keyboardEvent.code as keyof typeof Key];
		
		switch (key) {
			case "ArrowLeft": {
				this.rubikscube.object.rotation.y += -0.4;
				break;
			}
			case "ArrowDown": {
				this.rubikscube.object.rotation.x += 0.4;
				break;
			}
			case "ArrowRight": {
				this.rubikscube.object.rotation.y += 0.4;
				break;
			}
			case "ArrowUp": {
				this.rubikscube.object.rotation.x += -0.4;
				break;
			}
			default: {
				break;
			}
		};
	};

	private handleRequestAnimationFrame(): void {
		const canvas: HTMLCanvasElement = this.renderer.domElement;
		this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
		this.camera.updateProjectionMatrix();
		this.camera.lookAt(this.scene.position);
		this.light.position.copy(this.camera.position);

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