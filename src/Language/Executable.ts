export interface Executable {
    back_listeners : (() => void)[];
    next_listeners : (() => void)[];
    execute():void;
    next():void;
    back():void;
    getBaseInstruction():Executable; // Faire attention avec cette fonction
    getContainer():any;
}