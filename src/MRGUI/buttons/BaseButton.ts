import { Button, TextBlock } from "@babylonjs/gui";

export class BaseButton extends Button {
    text: TextBlock; 
    constructor(name: string, label: string) {
        super(name);
        this.width = "120px";
        this.height = "40px";
        this.color = "white";
        this.cornerRadius = 5;
        this.text = new TextBlock();
        // finir
    }

}