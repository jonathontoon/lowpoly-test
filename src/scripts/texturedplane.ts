import { WebGLRenderTargetOptions, LinearFilter, NearestFilter, RGBFormat, WebGLRenderTarget, ShaderMaterial, PlaneGeometry, Mesh, WebGLRenderer, Scene } from "three";

class TexturedPlane {

	private readonly vShader: string = `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

	private readonly fShader: string = `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;

        void main() {
            gl_FragColor = texture2D(tDiffuse, vUv);
        }
    `;

	private readonly targetOptions: WebGLRenderTargetOptions = {
		minFilter: LinearFilter, 
		magFilter: NearestFilter, 
		format: RGBFormat 
	};

	private readonly resolution: number;
	private readonly renderTarget: WebGLRenderTarget;
	private readonly material: ShaderMaterial;
	private readonly geometry: PlaneGeometry;
	private readonly mesh: Mesh;

	constructor({ width, height, resolution }: CTexturedPlane) {
		this.resolution = resolution;
		this.renderTarget = new WebGLRenderTarget(width / this.resolution, height / this.resolution, this.targetOptions);
		
		this.material = new ShaderMaterial({
			uniforms: { tDiffuse: { value: this.renderTarget.texture } },
			vertexShader: this.vShader,
			fragmentShader: this.fShader,
			depthWrite: false
		});

		this.geometry = new PlaneGeometry(width, height);
		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.receiveShadow = true;
		this.mesh.position.z = -100;
	};

	public addToRenderer(renderer: WebGLRenderer): void {
		renderer.setRenderTarget(this.renderTarget);
	};

	public addToScene(scene: Scene): void {
		scene.add(this.mesh);
	};

	public setSize(width: number, height: number):void {
		this.renderTarget.setSize(width / this.resolution, height / this.resolution);
	};
};

export default TexturedPlane;