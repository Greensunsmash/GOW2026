import { Button, Rectangle } from "@babylonjs/gui";
import { Colors } from "../../Shared/Colors";

export class ArchipelTrigger extends Button {
    private outerCircle: Rectangle;
    private innerCircle: Rectangle;
    private callback: (() => void) |undefined = undefined;

    constructor(name: string, callback?: () => void, radius = 20) {
        super(name);

        this.widthInPixels = 300;
        this.heightInPixels = 300;
        this.cornerRadius = 100;
        this.background = "#ffffff02";

        this.callback = callback;
        this.onPointerClickObservable.add(() => this.onClick());

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
            this.background = "#ffffff07";
        } else {
            this.background = "#ffffff02";
        }
    }

    setUnselected() {
        this.innerCircle.isVisible = false;
        this.background = "#ffffff02";
    }

    setDone() {
        this.outerCircle.color = Colors.Accent;
        this.innerCircle.color = Colors.Accent;
    }
}
