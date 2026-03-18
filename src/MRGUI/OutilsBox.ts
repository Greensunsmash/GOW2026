import { Button, Container, Control, Rectangle, ScrollViewer, StackPanel, TextBlock } from "@babylonjs/gui";
import { BlocContainer } from "../Containers/BlocContainer";
import { DragBehavior } from "../Containers/DragBehavior";
import { FacticeFactory } from "../Containers/FacticeFactory";
import { InstructionContainer } from "../Containers/InstructionContainer";
import { ListContainer } from "../Containers/ListContainer";
import { FlagContainer } from "../Containers/Prefabs/FlagContainer";
import type { GameScene } from "../MainLoop/Scene/GameScene";


export class OutilsBox extends Rectangle {
    private readonly scrollViewer: ScrollViewer;
    private readonly stack: StackPanel;
    private categories = new Map<string, StackPanel>();
    private buttons : Button[] = [];
    private readonly scene: GameScene;
    private readonly root: Container;

    constructor(root: Container, scene: GameScene) {
        super();
        this.root = root;
        this.scene = scene;

        this.width = "40%";
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

    addCategory(shortName: string) {
        if (this.categories.get(shortName)) {
            return;
        }

        const sp = new StackPanel();
        sp.isVertical = true;
        sp.spacing = 15;
        sp.paddingTop = "10px";
        sp.paddingBottom = "10px";
        sp.adaptHeightToChildren = true;
        sp.background = "#202020";

        const catLabel = new TextBlock();
        catLabel.color = "white";
        catLabel.fontSize = 14;
        catLabel.resizeToFit = true;
        catLabel.textWrapping = true; 
        catLabel.paddingLeft = "10px";
        catLabel.paddingRight = "10px";
        catLabel.paddingTop = "10px";
        catLabel.paddingBottom = "10px";
        catLabel.isHitTestVisible = false;

        const catLabelRect = new Rectangle();
        catLabelRect.adaptWidthToChildren = true;
        catLabelRect.adaptHeightToChildren = true;
        catLabelRect.isHitTestVisible = false;
        catLabelRect.thickness = 2;
            

        switch(shortName) {
            // Instructions (violet)
            case "instructions":
                catLabel.text = "Instructions";
                catLabelRect.background = "#8727F5";
                break;
            
            // Structures (violet)
            case "structures":
                catLabel.text = "Structures";
                catLabelRect.background = "#8727F5";
                break;

            // Booléens (vert fluo)
            case "booleans":
                catLabel.text = "Booléens";
                catLabelRect.background = "#95F527";
                catLabelRect.cornerRadius = 10;
                break;

            // Capteurs (vert fluo)
            case "sensors":
                catLabel.text = "Capteurs";
                catLabelRect.background = "#95F527";
                catLabelRect.cornerRadius = 10;
                break;

            // Variables et opérations (orange)
            case "variables":
                catLabel.text =  "Variables et opérations";
                catLabelRect.background = "#F58727";
                catLabelRect.cornerRadius = 10;
                break;

            // Fonctions (rose/fuchsia)
            case "functions":
                catLabel.text = "Blocs de plastique mou";
                catLabelRect.background = "#F52795";
                break;

            // Départ (rose)
            case "start":
                catLabel.text = "Départ";
                catLabelRect.background = "#F52795";
                break;
            
            default:
                throw new Error("this category does not exist : " + shortName);
        }

        catLabelRect.addControl(catLabel);
        this.stack.addControl(catLabelRect);

        this.categories.set(shortName, sp);
        this.stack.addControl(sp);
    }

    addButton(category: string, label: string, callback: () => void) {
        let newRoot = this.categories.get(category);
        if (!newRoot) {
            this.addCategory(category);
            newRoot = this.categories.get(category);
        }
        
        const btn = Button.CreateSimpleButton(label.trim(), label);
        //btn.width = "50px";
        btn.adaptHeightToChildren = true;
        
        if (btn.textBlock) {
            btn.textBlock.resizeToFit = true;
            btn.textBlock.textWrapping = true; 
            btn.textBlock.paddingTop = "10px";
            btn.textBlock.paddingBottom = "10px";
        }
        btn.color = "white";
        btn.background = "#ff0000"; 
        btn.thickness = 2;
        btn.fontSize = 14;
        btn.left = "15px";
        btn.onPointerUpObservable.add(callback);
        newRoot.addControl(btn);
        this.buttons.push(btn);
    }

    addTemplate(category: string, buildBlock: (root: Container) => Rectangle | undefined) {
        let newRoot = this.categories.get(category);
        if (!newRoot) {
            this.addCategory(category);
            newRoot = this.categories.get(category);
            if (!newRoot) {}
        }
        const realBlock = buildBlock(newRoot);
        if (!realBlock) {
            console.log("block not build");
            return;
        }

        // plus fiable que le timeout
        this.scene.scene.onAfterRenderObservable.addOnce(() => {
            //console.error("FIRST CALL TO UR");
            const facticeBlock = FacticeFactory.ultimateReaders(realBlock);
            newRoot.removeControl(realBlock);
            realBlock.dispose();

            facticeBlock.left = "15px";
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

                    if (realDragBlock instanceof FlagContainer) {
                        this.scene.setGroupToRun(listCtn);
                    }
                    
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
        });
    }
}