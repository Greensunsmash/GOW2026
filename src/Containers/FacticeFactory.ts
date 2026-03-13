import * as GUI from "@babylonjs/gui";

export class FacticeFactory {

    static ultimateReaders(c: GUI.Control): GUI.Control {
        let new_superContainer;
        console.warn("ENTERING ultimateREADERS");

        // 1. Instanciation et copie des propriétés spécifiques au type
        if (c instanceof GUI.Rectangle) {
            new_superContainer = new GUI.Rectangle();
            new_superContainer.thickness = c.thickness;
            new_superContainer.cornerRadius = c.cornerRadius;
        } else if (c instanceof GUI.StackPanel) {
            new_superContainer = new GUI.StackPanel();
            new_superContainer.isVertical = c.isVertical;
        } else if (c instanceof GUI.TextBlock) {
            new_superContainer = new GUI.TextBlock();
            new_superContainer.text = c.text;
            new_superContainer.color = c.color;
            new_superContainer.fontSize = c.fontSize;
        } else {
            // Toujours un bon fallback !
            console.warn(c.getClassName());
            //return new GUI.TextBlock("", "Fuck you.");
            return new GUI.Control();
        }

        // 2. Copie des dimensions et positions de base (PAS les *InPixels)
        new_superContainer.left = c.left;
        new_superContainer.top = c.top;
        new_superContainer.widthInPixels = c.widthInPixels;
        new_superContainer.heightInPixels = c.heightInPixels;
        console.log("heightinpixels : " + new_superContainer.heightInPixels);
        new_superContainer.horizontalAlignment = c.horizontalAlignment;
        new_superContainer.verticalAlignment = c.verticalAlignment;
        
        // 3. Gestion récursive des conteneurs
        if (c instanceof GUI.Container && new_superContainer instanceof GUI.Container) {
            new_superContainer.background = c.background;
            new_superContainer.alpha = c.alpha;
            
            for (const child of c.children) {
                new_superContainer.addControl(this.ultimateReaders(child)); 
            }
        }
        
        console.info(new_superContainer);
        return new_superContainer;
    }
}