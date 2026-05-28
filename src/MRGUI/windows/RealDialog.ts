import { AdvancedDynamicTexture, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { GreyBlocker } from "../misc/GreyBlocker";
import { BaseVSpacer } from "../misc/BaseSpacers";
import { Colors } from "../../Shared/Colors";
import { BaseButton } from "../buttons/BaseButton";
import type { BaseScene } from "../../MainLoop/Scene/BaseScene";

export class RealDialog extends Rectangle {
    private panel: StackPanel;
    private blocker: GreyBlocker;
    private textBlock: TextBlock;
    private ended = false;
    private auto = false;

    constructor(root: AdvancedDynamicTexture, scene: BaseScene, auto = false) {
        super("realdialog");

        this.auto = auto;

        this.blocker = new GreyBlocker();
        this.blocker.background = "rgba(36, 36, 36, 1)";
        this.blocker.addControl(this);

        this.width = "500px";
        this.adaptHeightToChildren = true;
        this.background = Colors.ToolboxBg;
        this.cornerRadius = 10;
        this.thickness = 2;
        this.color = Colors.AccentDuSud;
        this.shadowOffsetX = 1;
        this.shadowOffsetY = 1;
        this.shadowColor = "#00000040";
        this.shadowBlur = 6;
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.paddingBottom = "10%";

        this.panel = new StackPanel();
        this.addControl(this.panel);
        this.panel.addControl(new BaseVSpacer());

        const textBlockRect = new Rectangle("dialogTextRect");
        textBlockRect.adaptHeightToChildren = true;
        textBlockRect.widthInPixels = 400;
        textBlockRect.thickness = 0;
        textBlockRect.background = "#00000000";

        this.textBlock = new TextBlock("dialogText");
        this.textBlock.resizeToFit = true;
        this.textBlock.textWrapping = true;
        this.textBlock.color = "black";
        this.textBlock.fontSize = 20;
        this.textBlock.fontWeight = "300";
        this.textBlock.fontFamily = "Inter";
        this.textBlock.text = "";

        textBlockRect.addControl(this.textBlock);
        this.panel.addControl(textBlockRect);
        this.panel.addControl(new BaseVSpacer());

        this.onPointerClickObservable.add(() => this.end());
        this.blocker.onPointerClickObservable.add(() => this.end());
        root.addControl(this.blocker);
    }

    private sleep(ms: number) {
        return new Promise(res => setTimeout(res, ms));
    }

    private end() {
        if (this.ended) return;
        this.ended = true;
        if (this.auto) {
            this.blocker.dispose();
            return;
        }
        this.panel.addControl(new BaseButton("continuer-btn", "Continuer", () => {
            this.blocker.dispose();
        }, 0));
        this.panel.addControl(new BaseVSpacer());
    }

    private async typewriter(text: string, speed = 100) {
        this.textBlock.text = "";
        for (let i = 0; i < text.length; i++) {
            if (this.ended) { this.textBlock.text = text; return; }
            this.textBlock.text += text[i];
            if (text[i] === ",") await this.sleep(speed * 2.5);
            else if ("?.!".includes(text[i])) await this.sleep(speed * 5);
            else await this.sleep(speed);
        }
        if (!this.ended) {
            await this.sleep(speed * 5);
            this.end();
        }
    }

    public static async show(root: AdvancedDynamicTexture, scene: BaseScene, text: string, auto = false): Promise<void> {
        return new Promise((resolve) => {
            const dialog = new RealDialog(root, scene, auto);
            dialog.blocker.onDisposeObservable.add(() => resolve());
            scene.scene.onAfterRenderObservable.addOnce(() => {
                dialog.typewriter(text);
            });
        });
    }
}