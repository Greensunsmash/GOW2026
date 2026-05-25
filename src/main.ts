import { Game } from "./MainLoop/Game";

await document.fonts.ready;
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const game = await Game.Create(canvas);




