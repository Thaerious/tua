
class TypeRecord {
    /**
     * @param {ClassDeclarationContext} ctx 
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.memberFields = {};
    }

    addMemberField(name, value) {
        this.memberFields[name] = value;
    }

    printObject(){
        return this.printDeclaration() + "\n" + this.printConstructor();
    }

    printDeclaration() {
        let memberFieldKeys = Object.keys(this.memberFields);
        if (memberFieldKeys.length === 0) return `${this.ctx.NAME()} = {};`;
        let text = `${this.ctx.NAME()} = {\n`;

        for (let key of memberFieldKeys) {
            if (this.memberFields[key]) {
                text = text + "\t" + key + " = " + this.memberFields[key] + ";\n";
            }
            else {
                text = text + "\t" + key + " = nil;\n";
            }
        }
        return text + "};";
    }

    printConstructor() {
        let memberFieldKeys = Object.keys(this.memberFields);
        let text = `function ${this.ctx.NAME()}:new()\n`;
        text = text + "local child = {};\n";
        text = text + "setmetatable(child, {__index = self});\n";
        text = text + "return child;\n";
        text = text + "end;\n";
        return text;
    }
};

class TypeTable {

    constructor() {
        this.table = {};
        this.scope = [];
    }

    get last(){
        return this.scope[this.scope.length - 1];
    }

    /**
     * @param {ClassDeclarationContext} ctx 
     * @returns 
     */
    has(ctx) {
        return this.table[ctx.NAME()] !== undefined;
    }

    /**
     * @param {ClassDeclarationContext} ctx 
     * @returns 
     */
    enterClassScope(ctx) {
        const record = new TypeRecord(ctx);
        this.table[ctx.NAME()] = record;
        this.scope.push(ctx.NAME());
        return record;
    }

    exitClassScope(){
        this.scope.pop();
    }

    getCurrentScope(){
        if (this.scope.length === 0) return "";
        let text = this.scope[0];
        for (let i = 1; i < this.scope.length; i++){
            text = text + "." + this.scope[i];
        }
        return text;
    }

    get(name) {
        return this.table[name];
    }

    getLast() {
        return this.get(this.last);
    }
};

export default TypeTable;