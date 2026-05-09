import type { BlocContainer } from "../../Containers/BlocContainer";

// Type erasable pour ValueType
export type ValueType = "INT" | "FLOAT" | "STRING";

export class Value {

    private v1?: number;   // INT
    private v2?: number;   // FLOAT
    private v3?: string;   // STRING

    constructor(value: number | string) {
        if (typeof value === "number") {
            if (Number.isInteger(value)) {
                this.v1 = value;
            } else {
                this.v2 = value;
            }
        } else {
            this.v3 = value;
        }
    }

    getType(): ValueType | null {
        if (this.v1 !== undefined) return "INT";
        if (this.v2 !== undefined) return "FLOAT";
        if (this.v3 !== undefined) return "STRING";
        return null;
    }

    getValue(): number | string | null {
        if (this.v1 !== undefined) return this.v1;
        if (this.v2 !== undefined) return this.v2;
        if (this.v3 !== undefined) return this.v3;
        return null;
    }

    toString(): string {
        if (this.v1 !== undefined) return this.v1.toString();
        if (this.v2 !== undefined) return this.v2.toString();
        if (this.v3 !== undefined) return this.v3;
        return "null";
    }

    equalsTo(value: Value): boolean {
        if (this.getType() === value.getType()) {
            switch (this.getType()) {
                case "INT":
                    return this.v1 === value.getValue();
                case "FLOAT":
                    return this.v2 === value.getValue();
                case "STRING":
                    return this.v3 === value.getValue();
            }
        }
        return false;
    }

    infTo(value: Value): boolean {
        switch (this.getType()) {
            case "INT":
                switch (value.getType()) {
                    case "INT":
                    case "FLOAT":
                        return (this.getValue() as number) < (value.getValue() as number);
                    case "STRING":
                        return this.toString().localeCompare(value.getValue() as string) < 0;
                }
                break;

            case "FLOAT":
                switch (value.getType()) {
                    case "INT":
                    case "FLOAT":
                        return (this.getValue() as number) < (value.getValue() as number);
                    case "STRING":
                        return this.toString().localeCompare(value.getValue() as string) < 0;
                }
                break;

            case "STRING":
                return this.toString().localeCompare(value.getValue() as string) < 0;
        }

        return false;
    }

    add(value: Value): Value {
        switch (this.getType()) {
            case "INT":
                switch (value.getType()) {
                    case "INT":
                    case "FLOAT":
                        return new Value(
                            (this.getValue() as number) + (value.getValue() as number)
                        );
                    case "STRING":
                        return new Value(this.toString() + value.getValue());
                }
                break;

            case "FLOAT":
                switch (value.getType()) {
                    case "INT":
                    case "FLOAT":
                        return new Value(
                            (this.getValue() as number) + (value.getValue() as number)
                        );
                    case "STRING":
                        return new Value(this.toString() + value.getValue());
                }
                break;

            case "STRING":
                return new Value(this.toString() + value.toString());
        }

        return new Value("err");
    }

    substract(value: Value): Value {
        switch (this.getType()) {
            case "INT":
                switch (value.getType()) {
                    case "INT":
                    case "FLOAT":
                        return new Value(
                            (this.getValue() as number) - (value.getValue() as number)
                        );
                    case "STRING":
                        return new Value(
                            this.substractString(this.toString(), value.toString())
                        );
                }
                break;

            case "FLOAT":
                switch (value.getType()) {
                    case "INT":
                    case "FLOAT":
                        return new Value(
                            (this.getValue() as number) - (value.getValue() as number)
                        );
                    case "STRING":
                        return new Value(
                            this.substractString(this.toString(), value.toString())
                        );
                }
                break;

            case "STRING":
                return new Value(
                    this.substractString(this.toString(), value.toString())
                );
        }

        return new Value("err");
    }

    private substractString(s1: string, s2: string): string {
        if (!s1 || !s2) return s1;
        return s1.replace(s2, "");
    }
}

