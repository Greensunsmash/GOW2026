import { Container, Control, GUI3DManager, Rectangle, ScrollViewer, StackPanel, TextBlock } from "@babylonjs/gui";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { BlocContainer } from "./BlocContainer";
import { DragBehavior } from "./DragBehavior";
import { InstructionContainer } from "./InstructionContainer";
import { ListContainer } from "./ListContainer";
import { FacticeFactory } from "./FacticeFactory";


export class OutilsBox extends Rectangle {
    private readonly scrollViewer: ScrollViewer;
    private readonly stack: StackPanel;
    private categories = new Map<string, StackPanel>();
    private readonly scene: GameScene;
    private readonly root: Container;

    constructor(root: Container, scene: GameScene) {
        super();
        this.root = root;
        this.scene = scene;

        this.width = "30%";
        this.height = "100%";
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.background = "#101010";
        this.thickness = 1;
        this.root.addControl(this);

        this.scrollViewer = new ScrollViewer();
        //this.scrollViewer.horizontalBar.
        this.scrollViewer.thickness = 0;
        this.addControl(this.scrollViewer);

        this.stack = new StackPanel();
        this.stack.isVertical = true;
        this.stack.spacing = 15;
        this.stack.paddingTop = "10px";
        this.stack.paddingBottom = "10px";
        this.stack.adaptHeightToChildren = true;
        this.scrollViewer.addControl(this.stack);
    }

    addCategory(name: string, color: string, arronding?: boolean) {
        const sp = new StackPanel();
        sp.isVertical = true;
        sp.spacing = 15;
        sp.paddingTop = "10px";
        sp.paddingBottom = "10px";
        sp.adaptHeightToChildren = true;
        sp.background = "#202020";

        const catLabel = new TextBlock();
        catLabel.text = name;
        catLabel.color = "white";
        catLabel.fontSize = 14;
        catLabel.resizeToFit = true;
        catLabel.paddingLeft = "10px";
        catLabel.paddingRight = "10px";
        catLabel.paddingTop = "10px";
        catLabel.paddingBottom = "10px";
        catLabel.isHitTestVisible = false;

        const catLabelRect = new Rectangle();
        catLabelRect.background = color;
        catLabelRect.adaptWidthToChildren = true;
        catLabelRect.adaptHeightToChildren = true;
        catLabelRect.isHitTestVisible = false;
        catLabelRect.thickness = 2;
        if (arronding)
            catLabelRect.cornerRadius = 10;
        catLabelRect.addControl(catLabel);
        this.stack.addControl(catLabelRect);

        this.categories.set(name, sp);
        this.stack.addControl(sp);
    }

    addTemplate(category: string, buildBlock: (root: Container) => Rectangle) {
        const newRoot = this.categories.get(category);
        if (!newRoot) {
            console.error("cant add template to category " + category + " cause its not created");
            return;
        }
        const realBlock = buildBlock(newRoot);

        setTimeout(() => {
            //console.error("FIRST CALL TO UR");
            const facticeBlock = FacticeFactory.ultimateReaders(realBlock);
            newRoot.removeControl(realBlock);
            realBlock.dispose();

            newRoot.addControl(facticeBlock);

            facticeBlock.onPointerDownObservable.add((evt) => {
                const realDragBlock = buildBlock(this.root);

                const absoluteLeft = facticeBlock._currentMeasure.left;
                const absoluteTop = facticeBlock._currentMeasure.top;
                
                if (realDragBlock instanceof ListContainer) {
                    realDragBlock.leftInPixels = absoluteLeft;
                    realDragBlock.topInPixels = absoluteTop;
                    //listCtn.click(evt.x, evt.y);
                    //realDragBlock.getDetector().onPointerDownObservable.add(() => console.error("You clicked on the wrong block my friend"));
                    //listCtn.getDetector().onPointerDownObservable.notifyObservers(new Vector2WithInfo(new Vector2(evt.x,evt.y)));
                    realDragBlock.click(evt.x, evt.y, true);
                } else if (realDragBlock instanceof InstructionContainer) {
                    const listCtn = new ListContainer(this.root, this.scene);
                    listCtn.addInstruction(realDragBlock, 0);       
                    listCtn.leftInPixels = absoluteLeft;
                    listCtn.topInPixels = absoluteTop;
                    //listCtn.click(evt.x, evt.y);
                    
                    //listCtn.getDetector().onPointerDownObservable.add(() => console.error("You clicked on the wrong block my friend"));
                    //listCtn.getDetector().onPointerDownObservable.notifyObservers(new Vector2WithInfo(new Vector2(evt.x,evt.y)));
                    listCtn.click(evt.x, evt.y, true);
                } else if (realDragBlock instanceof BlocContainer)  {
                    realDragBlock.leftInPixels = absoluteLeft;
                    realDragBlock.topInPixels = absoluteTop;
                    const d = new DragBehavior(realDragBlock);
                    d.startDrag(evt.x, evt.y, true);
                } else {
                    console.error("ntm");
                }
            })
        }, 50);
    }
}