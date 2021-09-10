import { TypeMismatchError } from "./TypeError.js";

class ScopeRecord{
    /**
     * @param {*} name The name of the variable.
     * @param {*} type The class record of the type.
     * @param {*} ctx  The context where the type was declared.
     * @param {*} global Whether the variable is global.
     */
    constructor(name, type, ctx, global = false){
        this._name = name;
        this._type = type;
        this._ctx = ctx;
        this._global = global;
    }

    get name(){return this._name;}
    get type(){return this._type;}
    get ctx(){return this._ctx;}
    get global(){return this._global;}
}

class ScopeTable{
    static IS_ROOT = true;

    constructor(root = false){
        this._root = root;
        this.map = []; // variable name -> variable type
    }

    get isRoot(){
        return this._root;
    }

    setVariable(name, type, ctx, global = false){
        if (this.hasVariable(name)) throw new TypeMismatchError(this.getVariable(name).ctx, ctx);
        this.map[name] = new ScopeRecord(name, type, ctx, global);
    }

    getVariable(name){
        return this.map[name];
    }

    hasVariable(name){
        return this.map[name] !== undefined;
    }
}

class ScopeManager{
    constructor(){
        this.stack = [new ScopeTable(true)];
    }

    get table(){
        return this.stack[this.stack.length];
    }

    setVariable(name, type, ctx){
        if (this.stack[0].hasVariable(name)) throw new TypeMismatchError(this.getVariable(name).ctx, ctx);
        this.stack[0].setVariable(name, type, ctx, this.stack.length === 1);
    }

    getVariable(name){
        for (let i = 0; i < this.stack.length; i++){
            if (this.stack[i].map[name]) return this.stack[i].map[name];
            if (this.stack[i].isRoot) i = this.stack.length - 1;
        }
        return undefined;
    }

    hasVariable(name){
        return this.getVariable(name) !== undefined;
    }

    /**
     * Add a new table to the stack.
     * It becomes the active stack.
     */
    addTable(table = new ScopeDeclarationTable()){
        this.stack.unshift(table);
    }

    /**
     * Remove the top table from the stack,
     * the next table becomes active.
     */
    dropTable(){
        this.stack.shift();
    }

    collect(){
        let rvalue = {};
        for (let i = 0; i < this.stack.length; i++){
            for (let key in this.stack[i].map){
                if (!rvalue[key]){
                    rvalue[key] = this.stack[i].map[key].type;
                }
            }
        }
        return rvalue;
    }

    printScope(){
        const allVariables = this.collect();
        console.log("------ SCOPE - depth " + this.stack.length);
        for (let key in allVariables){
            console.log(key + " : " + allVariables[key]);
        }
        console.log("----------------------")
    }
}

export {ScopeRecord, ScopeTable, ScopeManager};
