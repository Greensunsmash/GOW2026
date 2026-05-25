import * as GUI from "@babylonjs/gui";
import { BasicInstContainer } from "./BasicInstContainer";
import { SetVarContainer } from "./Prefabs/SetVarContainer";

export class FacticeBlock {
    public innerCtrl?: GUI.Control;
    public updateOnModeChange: boolean = false;
    public firstTextBlok: GUI.TextBlock | undefined = undefined;
    public origText: string = "";
    public origWidthInPx?: number;

    constructor() {}

    public setFirstText(text: string) {
        if (!this.firstTextBlok)
            return;
        this.firstTextBlok!.text = text;
        this.innerCtrl!.widthInPixels = 150;
    }

    public resetFirstText() {
        if (!this.firstTextBlok)
            return;
        this.firstTextBlok.text = this.origText;
        this.innerCtrl!.widthInPixels = this.origWidthInPx!;
    }
}

export class FacticeFactory {
    private static ultimateReaders_aux(c: GUI.Control, factBlk?: FacticeBlock): GUI.Control {
        let new_superContainer: GUI.Control;

        if (c instanceof GUI.Rectangle) {
            new_superContainer = new GUI.Rectangle();
            (new_superContainer as GUI.Rectangle).thickness = (c as GUI.Rectangle).thickness;
            (new_superContainer as GUI.Rectangle).color = (c as GUI.Rectangle).color;
            (new_superContainer as GUI.Rectangle).paddingTop = (c as GUI.Rectangle).paddingTop;
            (new_superContainer as GUI.Rectangle).paddingBottom = (c as GUI.Rectangle).paddingBottom;
            (new_superContainer as GUI.Rectangle).paddingRight = (c as GUI.Rectangle).paddingRight;
            (new_superContainer as GUI.Rectangle).paddingLeft = (c as GUI.Rectangle).paddingLeft;
            (new_superContainer as GUI.Rectangle).cornerRadius = (c as GUI.Rectangle).cornerRadius;
            (new_superContainer as GUI.Rectangle).background = (c as GUI.Rectangle).background;
            (new_superContainer as GUI.Rectangle).alpha = c.alpha;
            if (factBlk?.updateOnModeChange)
                (new_superContainer as GUI.Rectangle).adaptWidthToChildren = true;
        } else if (c instanceof GUI.StackPanel) {
            new_superContainer = new GUI.StackPanel();
            (new_superContainer as GUI.StackPanel).paddingTop = (c as GUI.StackPanel).paddingTop;
            (new_superContainer as GUI.StackPanel).paddingBottom = (c as GUI.StackPanel).paddingBottom;
            (new_superContainer as GUI.StackPanel).paddingRight = (c as GUI.StackPanel).paddingRight;
            (new_superContainer as GUI.StackPanel).paddingLeft = (c as GUI.StackPanel).paddingLeft;
            if (factBlk?.updateOnModeChange)
                (new_superContainer as GUI.StackPanel).adaptWidthToChildren = true;
            (new_superContainer as GUI.StackPanel).isVertical = (c as GUI.StackPanel).isVertical;
        } else if (c instanceof GUI.TextBlock) {
            new_superContainer = new GUI.TextBlock();
            //console.log("found a text block", new_superContainer);
            //console.log("factblk is ", factBlk);
            (new_superContainer as GUI.TextBlock).text = (c as GUI.TextBlock).text;
            (new_superContainer as GUI.TextBlock).color = (c as GUI.TextBlock).color;
            (new_superContainer as GUI.TextBlock).fontSize = (c as GUI.TextBlock).fontSize;
            (new_superContainer as GUI.TextBlock).fontFamily = (c as GUI.TextBlock).fontFamily;
            if (factBlk?.updateOnModeChange)
                (new_superContainer as GUI.TextBlock).resizeToFit = true;
            (new_superContainer as GUI.TextBlock).paddingLeft = c.paddingLeft;
            (new_superContainer as GUI.TextBlock).paddingRight = c.paddingRight;
            (new_superContainer as GUI.TextBlock).paddingTop = c.paddingTop;
            (new_superContainer as GUI.TextBlock).paddingBottom = c.paddingBottom;
            if (factBlk && !factBlk.firstTextBlok) {
                factBlk.origText = (c as GUI.TextBlock).text;
                factBlk.firstTextBlok = new_superContainer as GUI.TextBlock;
            }
        } else {
            return new GUI.Control();
        }

        new_superContainer.left = c.left;
        new_superContainer.top = c.top;
        new_superContainer.widthInPixels = c.widthInPixels;
        if (factBlk && !factBlk.origWidthInPx)
            factBlk.origWidthInPx = new_superContainer.widthInPixels;
        new_superContainer.heightInPixels = c.heightInPixels;
        new_superContainer.horizontalAlignment = c.horizontalAlignment;
        new_superContainer.verticalAlignment = c.verticalAlignment;

        if (c instanceof GUI.Container && new_superContainer instanceof GUI.Container) {
            for (const child of (c as GUI.Container).children) {
                new_superContainer.addControl(this.ultimateReaders_aux(child, factBlk));
            }
        }

        return new_superContainer;
    }

    static ultimateReaders(c: GUI.Rectangle): FacticeBlock {
        const factBlk = new FacticeBlock();
        if ((c instanceof BasicInstContainer  || c instanceof SetVarContainer) && c.hasModeUpdateBehavior())
            factBlk.updateOnModeChange = true;
        factBlk.innerCtrl = this.ultimateReaders_aux(c, factBlk);
        //console.log(factBlk.innerCtrl);
        return factBlk;
    }
}