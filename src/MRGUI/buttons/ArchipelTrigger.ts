import { Button, Image, Rectangle } from "@babylonjs/gui";
import { Colors } from "../../Shared/Colors";
import { ASSETS_ROOT } from "../../Shared/Constants";

export class ArchipelTrigger extends Button {
    private outerCircle: Rectangle;
    private innerCircle: Rectangle;
    private img: Image;
    private callback: (() => void) |undefined = undefined;

    constructor(name: string, callback?: () => void, radius = 20) {
        super(name);

        this.widthInPixels = 300;
        this.heightInPixels = 300;
        this.cornerRadius = 100;
        this.background = "#ffffff00";
        this.thickness = 0;

        this.callback = callback;
        this.onPointerClickObservable.add(() => this.onClick());

        this.img = new Image(name + "-img", ASSETS_ROOT + "map/" + name + ".png");
        this.addControl(this.img);

        this.outerCircle = new Rectangle();
        this.outerCircle.widthInPixels = radius*2;
        this.outerCircle.heightInPixels = radius*2;
        this.outerCircle.color = Colors.BehindWorkbench;
        this.outerCircle.thickness = 4;
        this.outerCircle.background = "#00000000";
        this.outerCircle.cornerRadius = radius;
        this.outerCircle.shadowOffsetX = 5;
        this.outerCircle.shadowOffsetY = 5;
        this.outerCircle.shadowColor = "#00000065";
        this.outerCircle.shadowBlur = 4;
        this.addControl(this.outerCircle);

        const innerCirclePaddingPx = 8;

        this.innerCircle = new Rectangle();
        this.innerCircle.background = this.outerCircle.color;
        this.innerCircle.widthInPixels = (radius - innerCirclePaddingPx) * 2;
        this.innerCircle.heightInPixels = (radius - innerCirclePaddingPx) * 2;
        this.innerCircle.thickness = 0;
        this.innerCircle.cornerRadius = radius - innerCirclePaddingPx;
        this.innerCircle.isVisible = false;

        this.addControl(this.innerCircle);
    }

    setCallback(call: () => void) {
        this.callback = call;
    }

    onClick() {
        this.innerCircle.isVisible = !this.innerCircle.isVisible;
        this.callback?.();

        if (this.innerCircle.isVisible) {
            this.background = "#ffffff00";
        } else {
            this.background = "#ffffff00";
        }
    }

    setUnselected() {
        this.innerCircle.isVisible = false;
        this.background = "#ffffff00";
    }

    setDone() {
        this.outerCircle.color = Colors.Accent;
        this.innerCircle.color = Colors.Accent;
    }
}
