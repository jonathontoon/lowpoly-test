import { Object3D, MeshLambertMaterial, BoxGeometry, Mesh, Scene } from "three";

class RubiksCube {
	private readonly size: number;
	private readonly spacing: number;
	private readonly colors: string[];
	private readonly faceMaterials: MeshLambertMaterial[];

	public object: Object3D;

	constructor({ spacing, colors, size }: CRubiksCube) {
		this.spacing = spacing;
		this.colors = colors;
		this.size = size;
		this.faceMaterials = this.colors.map((c: string) => { return new MeshLambertMaterial({ color: c }); });

		this.object = new Object3D();

		this.generateMeshes();
	};

	private generateMeshes(): void {
		const start: number = Math.floor(this.size) / 2 * -1;
		const end: number = Math.floor(this.size) / 2;

		for (let x = start; x <= end; x++) {
			for (let y = start; y <= end; y++) {
				for (let z = start; z <= end; z++) {
					const box: BoxGeometry = new BoxGeometry(1, 1, 1);
					const mesh: Mesh = new Mesh(box, this.faceMaterials);
					mesh.position.set(x+x*this.spacing, y+y*this.spacing, z+z*this.spacing);
					this.object.add(mesh);
				}
			}
		}

		this.object.position.set(-0.5*(this.size+this.spacing*this.size-2), -0.5*(this.size+this.spacing*this.size-2), -0.5*(this.size+this.spacing*this.size-2));
		this.object.rotation.set(0,0,0);
		this.object.scale.set(50, 50, 50);
	};

	public addToScene(scene: Scene): void {
		scene.add(this.object);
	};

	// public setRotation(x: number, y: number, z: number): void {
	// 	this.object.rotation.x += x;
	// 	this.object.rotation.y += y;
	// 	this.object.rotation.z += z;
	// };
};

export default RubiksCube;