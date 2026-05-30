import { AdvancedDynamicTexture, Control, Rectangle, StackPanel, TextBlock } from "@babylonjs/gui";
import { GreyBlocker } from "../misc/GreyBlocker";
import { BaseVSpacer } from "../misc/BaseSpacers";
import { Colors } from "../../Shared/Colors";
import { BaseButton } from "../buttons/BaseButton";
import type { BaseScene } from "../../MainLoop/Scene/BaseScene";

export type  DialogSpeakername = "SCIENTIFIQUE" | "SIRC";

export class RealDialog extends Rectangle {
    private panel: StackPanel;
    private blocker: GreyBlocker;
    private textBlock: TextBlock;
    private ended = false;
    private auto = false;
    private speaker: DialogSpeakername

    constructor(root: AdvancedDynamicTexture, scene: BaseScene, speaker: DialogSpeakername, auto = false, hideName = false, fullBlack = false) {
        super("realdialog");

        this.speaker = speaker;

        this.auto = auto;

        this.blocker = new GreyBlocker();
        this.blocker.background = fullBlack ? "#000000ff" : "rgba(0,0,0,0.6)";
        this.blocker.addControl(this);

        this.width = "500px";
        this.adaptHeightToChildren = true;
        this.background = (speaker === "SCIENTIFIQUE") ? Colors.ToolboxBg : Colors.SirCDialogBg;
        this.cornerRadius = 10;
        this.thickness = 2;
        this.color = (speaker === "SCIENTIFIQUE") ? Colors.AccentDuSud : Colors.SirCDialogStroke;
        this.shadowOffsetX = 1;
        this.shadowOffsetY = 1;
        this.shadowColor = "#00000040";
        this.shadowBlur = 6;
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.verticalAlignment = (speaker === "SCIENTIFIQUE") ? Control.VERTICAL_ALIGNMENT_BOTTOM : Control.VERTICAL_ALIGNMENT_TOP;
        this.paddingBottom = (speaker === "SCIENTIFIQUE") ? "10%" : "0%";
        this.paddingTop = (speaker === "SCIENTIFIQUE") ? "0%" : "10%";

        this.panel = new StackPanel();
        this.addControl(this.panel);
        this.panel.addControl(new BaseVSpacer());

        if (!hideName) {
            const title = (speaker === "SCIENTIFIQUE") ? "La scientifique" : "Circé";
            const titleBlock = new TextBlock("dialogTitle", title);
            titleBlock.height = "50px";
            titleBlock.color = "white";
            titleBlock.fontSize = 18;
            titleBlock.fontWeight = "400";
            titleBlock.fontFamily = "Inter";
            titleBlock.widthInPixels = title.length*15 + 20;

            const titleBlockRect = new Rectangle("dialogTitleRect");
            titleBlockRect.height = "50px";
            titleBlockRect.background = (speaker === "SCIENTIFIQUE") ? Colors.PtitRoseDuSoir : Colors.SirCDialogStroke;
            titleBlockRect.cornerRadius = 22;
            titleBlockRect.thickness = 0;
            titleBlockRect.adaptWidthToChildren = true;

            titleBlockRect.addControl(titleBlock);
            this.panel.addControl(titleBlockRect);
            this.panel.addControl(new BaseVSpacer());
        }

        const textBlockRect = new Rectangle("dialogTextRect");
        textBlockRect.adaptHeightToChildren = true;
        textBlockRect.widthInPixels = 400;
        textBlockRect.thickness = 0;
        textBlockRect.background = "#00000000";

        this.textBlock = new TextBlock("dialogText");
        this.textBlock.resizeToFit = true;
        this.textBlock.textWrapping = true;
        this.textBlock.color = (speaker === "SCIENTIFIQUE") ? "black" : "white";
        this.textBlock.fontSize = 20;
        this.textBlock.fontWeight = "300";
        this.textBlock.fontFamily = "Inter";
        this.textBlock.text = "";

        textBlockRect.addControl(this.textBlock);
        this.panel.addControl(textBlockRect);
        this.panel.addControl(new BaseVSpacer());

        this.onPointerClickObservable.add(() => this.end(true));
        this.blocker.onPointerClickObservable.add(() => this.end(true));
        root.addControl(this.blocker);
    }

    private sleep(ms: number) {
        return new Promise(res => setTimeout(res, ms));
    }

    private end(manuallyClicked = false) {
        if (this.ended) return;
        this.ended = true;
        if (this.auto && !manuallyClicked) {
            this.blocker.dispose();
            return;
        }
        this.panel.addControl(new BaseButton(
            "continuer-btn", 
            "Continuer",
            () => {
                this.blocker.dispose();
            }, 0, 40, 
            (this.speaker === "SIRC" ? Colors.SirCDialogBtn : undefined),
            (this.speaker === "SIRC" ? Colors.SirCDialogStroke : undefined),
        ));
        this.panel.addControl(new BaseVSpacer());
    }

    private async typewriter(text: string, speed = 70) {
        this.textBlock.text = "";
        for (let i = 0; i < text.length; i++) {
            if (this.ended) { this.textBlock.text = text; return; }
            this.textBlock.text += text[i];
            if (text[i] === ",") await this.sleep(speed * 2.5);
            else if ("?.!".includes(text[i])) await this.sleep(speed * 5);
            else await this.sleep(speed);
        }
        if (!this.ended) {
            await this.sleep(speed * 10);
            this.end();
        }
    }

    public static async show(root: AdvancedDynamicTexture, scene: BaseScene, text: string, speaker: DialogSpeakername, auto = false, hideName = false, fullBlack = false): Promise<void> {
        return new Promise((resolve) => {
            const dialog = new RealDialog(root, scene, speaker, auto, hideName, fullBlack);
            dialog.blocker.onDisposeObservable.add(() => resolve());
            scene.scene.onAfterRenderObservable.addOnce(() => {
                dialog.typewriter(text);
            });
        });
    }
}