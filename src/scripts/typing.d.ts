import { Texture } from "three";

type Point = {
	x: number;
	y: number;
};

type Size = {
	width: number;
	height: number;
};

type CRubik = {
	width: number;
	gap: number;
};

type CPlane = {
	texture: Texture;
};

type CCanvas = {
	canvasSize: Size;
	bufferSize: Size;
    enableSmoothing: boolean;
};

type CBuffer = {
	size: Size;
	enableSmoothing: boolean;
};

type RenderCallback = {
	(bufferContext: CanvasRenderingContext2D, bufferSize: Size): void;
};
