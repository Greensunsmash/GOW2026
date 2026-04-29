import type { MarcoBozo } from "../Entity/Robot"


/*
Tous les types de blocs,
par catégorie.
Nous servira à construire les blocs de la toolbox
à partir de données JSON.
*/

type InstructionBlock =
  | "forward"
  | "backward"
  | "left"
  | "right"
  | "pickup"
  | "wait"
  | "print";

type StructureBlock = "for" | "if" | "while" | "elif";

type BooleanBlock =
  | "true"
  | "false"
  | "not"
  | "and"
  | "or"
  | "inf"
  | "sup"
  | "eq";

type SensorBlock = "obstacle" | "item";

type VariableBlock = "var_create";

type OpBlock = "plus" | "minus";

type FunctionBlock = "function_create";

type StartBlock = "start";

type ToolboxBlockMap = {
  instructions: InstructionBlock;
  structures: StructureBlock;
  booleans: BooleanBlock;
  sensors: SensorBlock;
  variables: VariableBlock;
  ops: OpBlock;
  functions: FunctionBlock;
  start: StartBlock;
};

// Une factory est juste un fn qui prend un GUI.Container en arg
// pour y créer un bloc dedans
type Factory = (root: any) => any;

// Association d'un type de bloc et de la factory qui crée ce type de bloc
// (Record c'est juste un dico en TS)
type CategoryFactories<T extends string> = Record<T, Factory>;