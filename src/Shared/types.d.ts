import type { Robot } from "../Entity/Robot"

export type ExecutionContext = {
    robot: Robot;
};

type InstructionBlock =
  | "forward"
  | "backward"
  | "left"
  | "right"
  | "print";

type StructureBlock = "for" | "if";

type BooleanBlock =
  | "true"
  | "false"
  | "not"
  | "and"
  | "or"
  | "inf"
  | "sup"
  | "eq";

type SensorBlock = "obstacle";

type VariableBlock = "var_create" | "plus" | "minus";

type FunctionBlock = "function_create";

type StartBlock = "start";

type ToolboxBlockMap = {
  instructions: InstructionBlock;
  structures: StructureBlock;
  booleans: BooleanBlock;
  sensors: SensorBlock;
  variables: VariableBlock;
  functions: FunctionBlock;
  start: StartBlock;
};

type Factory = (root: any) => any;

type CategoryFactories<T extends string> = Record<T, Factory>;