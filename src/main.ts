import { Game } from "./MainLoop/Game";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const game = await Game.Create(canvas);




