import { Button, Container, Control, Rectangle, ScrollViewer, StackPanel, TextBlock } from "@babylonjs/gui";
import { BlocContainer } from "../Containers/BlocContainer";
import { DragBehavior } from "../Containers/DragBehavior";
import { FacticeBlock, FacticeFactory } from "../Containers/FacticeFactory";
import { InstructionContainer } from "../Containers/InstructionContainer";
import { ListContainer } from "../Containers/ListContainer";
import { FlagContainer } from "../Containers/Prefabs/FlagContainer";
import type { GameScene } from "../MainLoop/Scene/GameScene";
import { VarValueContainer } from "../Containers/Prefabs/VarValueContainer";
import { SetVarContainer } from "../Containers/Prefabs/SetVarContainer";
import { OneButtonModal } from "./windows/OneButtonModal";
import type { PlayScene } from "../MainLoop/Scene/PlayScene";
import { Memory } from "../Language/Memory";
import { BasicInstContainer } from "../Containers/BasicInstContainer";
import type { WorkSpace } from "./Workspace";
import { Colors } from "../Shared/Colors";
import { BaseVSpacer } from "./misc/BaseSpacers";
import type { ExecutionContext } from "../MainLoop/ExecutionContext";

export class DoublePeloteDeLaineEloignezLesChats extends StackPanel {
    constructor(height?: number) {
        super("ficelle-n");

        const ficelle = new Rectangle();
        ficelle.widthInPixels = 6;
        ficelle.height = "100%";
        ficelle.cornerRadius = 3;
        ficelle.background = Colors.SecondaryEnseignement;
        ficelle.thickness = 0;

        const ficelle2 = new Rectangle();
        ficelle2.widthInPixels = 6;
        ficelle2.height = "100%";
        ficelle2.cornerRadius = 3;
        ficelle2.background = Colors.SecondaryEnseignement;
        ficelle2.thickness = 0;

        this.isVertical = false;
        this.spacing = 150;
        this.heightInPixels = height ?? 75;
        this.addControl(ficelle);
        this.addControl(ficelle2);
    }

}

/*
La bôite à boîtes,
à gauche de l'écran.
*/
export class OutilsBox extends Rectangle {
    private readonly scrollViewer: ScrollViewer;
    private readonly stack: StackPanel;
    private facticeBlocks: FacticeBlock[] = [];
    private categories = new Map<string, StackPanel>();
    private buttons : Button[] = [];
    private vars: string[] = [];
    private varPanel: StackPanel;
    private readonly scene: PlayScene;
    private readonly root: Container;
    private readonly workspace : WorkSpace;
    private templateRegistry = new Map<string, Set<string>>();
    private blockLimit: number | null = null;

    constructor(root: Container, workspace:WorkSpace, scene: PlayScene) {
        super();
        this.root = root;
        this.scene = scene;
        this.workspace = workspace;

        this.width = "40%";
        this.height = "100%";
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.background = Colors.ToolboxBg;
        this.thickness = 1;
        this.root.addControl(this);

        this.scrollViewer = new ScrollViewer();
        //this.scrollViewer.horizontalBar.
        this.scrollViewer.thickness = 0;
        this.addControl(this.scrollViewer);

        this.stack = new StackPanel();
        this.stack.isVertical = true;
        this.stack.adaptHeightToChildren = true;
        this.stack.clipChildren = false;
        this.stack.clipContent = false;
        this.scrollViewer.addControl(this.stack);
    }

    // Ajoute une catégorie dans la toolbox.
    // Crée un rectangle de titre
    // et un stack panel pour loger les blocs de cette catégorie
    // Fonction appelée par addTemplate() ou addButton()
    // au cas ou la catégorie n'existe pas encore
    addCategory(shortName: string) {
        if (this.categories.get(shortName)) {
            return;
        }

        const sp = new StackPanel();
        if (shortName === "variables") {
            this.varPanel = sp;
        }
        sp.isVertical = true;
        sp.spacing = 15;
        sp.paddingTop = "10px";
        sp.paddingBottom = "10px";
        sp.adaptHeightToChildren = true;
        sp.clipChildren = false;
        sp.clipContent = false;
        sp.background = Colors.Workbench;

        const catLabel = new TextBlock();
        catLabel.color = "white";
        catLabel.fontSize = 18;
        catLabel.fontFamily = "Inter";
        catLabel.fontWeight = "300";
        catLabel.resizeToFit = true;
        catLabel.textWrapping = true; 
        catLabel.paddingLeft = "10px";
        catLabel.paddingRight = "10px";
        catLabel.paddingTop = "10px";
        catLabel.paddingBottom = "10px";
        catLabel.isHitTestVisible = false;

        
        const catLabelRect = new Rectangle();
        //catLabelRect.adaptWidthToChildren = true;
        catLabelRect.adaptHeightToChildren = true;
        catLabelRect.isHitTestVisible = false;
        catLabelRect.thickness = Colors.GeneralContour;
        catLabelRect.color = Colors.AccentDuSud;
        catLabelRect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        catLabelRect.widthInPixels = 150;
        
        catLabelRect.addControl(catLabel);
        catLabelRect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;


        const catLabelWithScotch = new Container();
        catLabelWithScotch.adaptHeightToChildren = true;
        catLabelWithScotch.width = "100%";
        catLabelWithScotch.clipChildren = false;
        catLabelWithScotch.clipContent = false;

        catLabelRect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

        // scotch gauche
        const scotchGauche = new Rectangle();
        scotchGauche.widthInPixels = 20;
        scotchGauche.heightInPixels = 25;
        scotchGauche.cornerRadius = 8;
        scotchGauche.background = Colors.SecondaryEnseignement;
        scotchGauche.thickness = 0;
        scotchGauche.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        scotchGauche.leftInPixels = -catLabelRect.widthInPixels / 2;
        scotchGauche.alpha = 0.5;

        // ficelle droite
        const scotchDroite = new Rectangle();
        scotchDroite.widthInPixels = 20;
        scotchDroite.heightInPixels = 25;
        scotchDroite.cornerRadius = 8;
        scotchDroite.background = Colors.SecondaryEnseignement;
        scotchDroite.thickness = 0;
        scotchDroite.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        scotchDroite.leftInPixels = catLabelRect.widthInPixels / 2;
        scotchDroite.alpha = 0.5;
        
        catLabelWithScotch.addControl(catLabelRect);;
        catLabelWithScotch.addControl(scotchGauche);
        catLabelWithScotch.addControl(scotchDroite);

        // selon la catégorie,
        // on change l'apparence
        // du titre
        switch(shortName) {
            // Instructions (violet)
            case "instructions":
                catLabel.text = "Actions";
                catLabelRect.background = Colors.PtitRoseDuSoir;
                catLabelRect.cornerRadius = Colors.CornerRadiusCarrePasTrop;
                break;
            
            // Structures (violet)
            case "structures":
                catLabel.text = "Structures";
                catLabelRect.background = Colors.PtitRoseDuSoir;
                catLabelRect.cornerRadius = Colors.CornerRadiusCarrePasTrop;
                break;

            // Booléens (vert fluo)
            case "booleans":
                catLabel.text = "Booléens";
                catLabelRect.background = Colors.PtitRoseDuSoir;
                catLabelRect.cornerRadius = Colors.CornerRadiusVraimentArrondi;
                break;

            // Capteurs (vert fluo)
            case "sensors":
                catLabel.text = "Capteurs";
                catLabelRect.background = Colors.PtitRoseDuSoir;
                catLabelRect.cornerRadius = Colors.CornerRadiusVraimentArrondi;
                break;

            // Variables (orange)
            case "variables":
                catLabel.text =  "Variables";
                catLabelRect.background = Colors.PtitRoseDuSoir;
                catLabelRect.cornerRadius = Colors.CornerRadiusVraimentArrondi;
                break;

            // Opérations (orange)
            case "ops":
                catLabel.text =  "Opérations";
                catLabelRect.background = Colors.PtitRoseDuSoir;
                catLabelRect.cornerRadius = Colors.CornerRadiusVraimentArrondi;
                break;

            // Fonctions (rose/fuchsia)
            case "functions":
                catLabel.text = "Blocs de plastique mou";
                catLabelRect.background = Colors.PtitRoseDuSoir;
                catLabelRect.cornerRadius = Colors.CornerRadiusCarrePasTrop;
                break;

            // Départ (rose)
            case "start":
                catLabel.text = "Départ";
                catLabelRect.background = Colors.PtitRoseDuSoir;
                catLabelRect.cornerRadius = Colors.CornerRadiusCarrePasTrop;
                break;
            
            default:
                throw new Error("this category does not exist : " + shortName);
        }

        const wrapper = new Rectangle();
        wrapper.adaptHeightToChildren = true;
        wrapper.background = Colors.Workbench;
        wrapper.thickness = 2;
        wrapper.color = Colors.SecondaryEnseignement;
        wrapper.cornerRadius = 12;
        wrapper.width = "90%";

        
        const innerStack = new StackPanel();
        innerStack.isVertical = true;
        innerStack.adaptHeightToChildren = true;

        innerStack.addControl(new BaseVSpacer());
        innerStack.addControl(catLabelWithScotch);
        innerStack.addControl(new BaseVSpacer());
        innerStack.addControl(sp);
        innerStack.addControl(new BaseVSpacer());


        wrapper.addControl(innerStack);
        this.stack.addControl(new DoublePeloteDeLaineEloignezLesChats(this.categories.size > 0 ? 50 : 25));
        this.stack.addControl(wrapper);
        this.categories.set(shortName, sp);
    }

    // Ajoute un bouton dans la toolbox,
    // qui exécute callback() quand on appuie 
    addButton(category: string, label: string, callback: () => void) {
        // si la catégorie existe pas,
        // on la crée
        let newRoot = this.categories.get(category);
        if (!newRoot) {
            this.addCategory(category);
            newRoot = this.categories.get(category);
            if (!newRoot) {
                console.error("vous me faites chier");
                return;
            }
        }
        
        const btn = Button.CreateSimpleButton(label.trim(), label);
        //btn.width = "50px";
        btn.adaptHeightToChildren = true;
        
        if (btn.textBlock) {
            btn.textBlock.resizeToFit = true;
            btn.textBlock.textWrapping = true; 
            btn.textBlock.paddingTop = "10px";
            btn.textBlock.paddingBottom = "10px";
            btn.textBlock.fontFamily = "Inter";
        }
        btn.color = "white";
        btn.background = Colors.Accent; 
        btn.thickness = 2;
        btn.fontSize = 18;
        btn.cornerRadius = Colors.CornerRadiusCarrePasTrop;
        btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        btn.width = "80%";
        btn.onPointerUpObservable.add(callback);
        newRoot.addControl(btn);
        this.buttons.push(btn);
    }

    // Ajoute un bloc dans la catégorie donnée
    // plus précisémenet, prend en argument une fonction qui permet de créer ce bloc
    // le bloc dans la toolbox sera l'équivalent factice du bloc que construit buildBlock,
    // mais quand l'user drag depuis ce bloc factice, il obtient un bloc réel
    addTemplate(category: string, buildBlock: (root: Container, content_root:Container) => Rectangle | undefined) {
        let newRoot = this.categories.get(category);
        if (!newRoot) {
            this.addCategory(category);
            newRoot = this.categories.get(category);
            if (!newRoot) {
                console.error("vous me faites chier");
                return;
            }
        }

        // Partie pour ignorer l'instruction si le template a déjà été ajouté
        /* jsuis dsl...
        const key = buildBlock.toString();
        if (!this.templateRegistry.has(category)) this.templateRegistry.set(category, new Set());
        const registry = this.templateRegistry.get(category)!;
        if (registry.has(key)) return;
        registry.add(key); */

        // on crée un bloc temporaire, 
        // qui nous servira à construire le factice
        const realBlock = buildBlock(newRoot, newRoot);
        if (!realBlock) {
            console.log("block not build");
            return;
        }

        // on attend que BJS ait eu le temps de créer le bloc
        // (onAfterRender est plus fiable que le timeout)
        this.scene.scene.onAfterRenderObservable.addOnce(() => {
            // On crée le bloc factice
            const facticeBlock = FacticeFactory.ultimateReaders(realBlock);
            // Et on drop le bloc de base, qui nous servait juste à ça
            newRoot.removeControl(realBlock);
            realBlock.dispose();
            this.facticeBlocks.push(facticeBlock);
            facticeBlock.innerCtrl.left = "15px";
            newRoot.addControl(facticeBlock.innerCtrl);

            // quand l'user va cliquer sur le bloc factice
            facticeBlock.innerCtrl.onPointerDownObservable.add((evt) => {
                if (this.blockLimit
                    && ((realBlock instanceof ListContainer) || (realBlock instanceof InstructionContainer))
                ) {
                    //console.log("block count is " + this.scene.blockCount);
                    if (this.scene.blockCount >= this.blockLimit) {
                        new OneButtonModal(
                            this.scene.advancedTexture,
                            `Limite de ${this.scene.blockCount} blocs atteinte`,
                            "J'ai compris",
                            () => {}
                        );
                        return;
                    }
                }

                // on build le bloc réel
                const realDragBlock = buildBlock(this.root, this.workspace.getContentRoot());

                // on le place là ou état le bloc factice
                // (_curentMeasure c pour avoir les coords. absolues)
                const absoluteLeft = facticeBlock.innerCtrl.transformedMeasure.left;
                const absoluteTop = facticeBlock.innerCtrl.transformedMeasure.top;
                
                // on agit différemment selon le type de blocs
                // si c'est une List (donc probablement une structure)
                if (realDragBlock instanceof ListContainer) {
                    this.scene.updateInstructionCount?.();
                    // on se contente de la mettre au bon endroit
                    realDragBlock.leftInPixels = absoluteLeft;
                    realDragBlock.topInPixels = absoluteTop;
                    // et de transmettre le clic pour trigger le drag
                    requestAnimationFrame(() => {
                        realDragBlock.click(evt.x, evt.y, true);
                    });
                // si c'est une instruction
                } else if (realDragBlock instanceof InstructionContainer) {  
                    if (realDragBlock instanceof BasicInstContainer || realDragBlock instanceof SetVarContainer) {
                        // ca devient "avancer d'une case" si on est en pig mode
                        realDragBlock.triggerModeUpdate();
                    }

                    // on l'encadre dans une liste,
                    // elle peut pas existe rseule
                    const listCtn = new ListContainer(this.root, this.workspace.getContentRoot(), this.scene);
                    listCtn.addInstruction(realDragBlock, 0);
                    this.scene.updateInstructionCount?.();
                    
                    listCtn.leftInPixels = absoluteLeft;
                    listCtn.topInPixels = absoluteTop;
                    requestAnimationFrame(() => {
                        listCtn.click(evt.x, evt.y, true);
                    });
                // si c'set un blocContainer
                } else if (realDragBlock instanceof BlocContainer)  {
                    realDragBlock.leftInPixels = absoluteLeft;
                    realDragBlock.topInPixels = absoluteTop;
                    const d = new DragBehavior(realDragBlock);
                    requestAnimationFrame(() => {
                        d.startDrag(evt.x, evt.y, true);
                    });
                } else {
                    console.error("ntm");
                }
            })
        });
    }

    // Ajtr une variable dans le panel "Variable"
    addVariable(name: string, scene: GameScene, ctx: ExecutionContext) {
        if (name in this.vars) {
            console.error("variable already exists.");
            return;
        }

        // on doit tenir un registre des variables dans la toolbox
        this.vars.push(name);
        
        // on rebuild les composants stack panel "variables"
        // du haut vers le bas
        const btn = this.varPanel.getChildByType("variables", "Button");
        this.varPanel.clearControls();
        this.varPanel.addControl(btn);
        // pour chaque var,
        // on crée le container de valeur
        // et l'instruction qui set la variable
        this.vars.forEach((v) => {
            this.addTemplate("variables", (root, content_root) =>
                new VarValueContainer(v, root, content_root, scene)
            );
            this.addTemplate("variables", (root, content_root) =>
                new SetVarContainer(v, root, content_root, scene, ctx)
            );
        });
    }

    public setBlockLimit(limit: number | null) {
        console.log("tb block limit set to " + limit);
        this.blockLimit = limit;
    }

    public onModeChange() {
        const mode = Memory.get().getGameMode();
        for (const factBlk of this.facticeBlocks) {
            if (factBlk.updateOnModeChange) {
                if (mode === "PIGMODE")
                    factBlk.setFirstText("Avancer d'une case");
                else
                    factBlk.resetFirstText();
            }
        }
    }

    public clear() {
        // Supprimer tous les blocs présents dans la scène (sauf la toolbox)
        // euh ??? bah non en faittttt
        /*
        const children = [...this.root.children];
        for (const child of children) {
            if (child !== this) {
                this.root.removeControl(child);
                child.dispose();
            }
        }
        */
        //this.scene.blockCount = 0;
        this.facticeBlocks = [];
        this.categories.clear();
        this.stack.clearControls();
        this.vars = [];
        this.buttons = [];
        this.varPanel = undefined as any;
        this.templateRegistry.clear();
    }
}