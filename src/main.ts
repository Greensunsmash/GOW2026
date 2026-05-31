import FontFaceObserver from "fontfaceobserver";
import { Game } from "./MainLoop/Game";

const observer1 = new FontFaceObserver('Inter');
const observer2 = new FontFaceObserver('Material Symbols Outlined');
try {
    await Promise.all([
        observer1.load(null, 3000),
        observer2.load('\ue88a\ue037\ue020\ue01f\ue045', 3000) 
    ]);
    //console.log("fonts loaded");
} catch (e) {
    console.warn("fonts unable to load", e);
}

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const game = await Game.Create(canvas);




