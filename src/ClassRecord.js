import TuaListener from "../antlr/src/TuaListener.js";
import antlr4 from 'antlr4';
import {ScopeTable} from "./ScopeManager.js";

class DiscreteClassRecord{
    constructor(name){
        this._name = name;
    }

    get name(){
        return this._name;
    }
}

/**
 * Replaces a class declaration with lua code.
 * Maintains a type table for the methods and fields.
 */
class ClassRecord extends TuaListener{
    /**
     * Create a new type based on a context.
     * @param {ClassDeclarationContext} ctx 
     */
    constructor(ctx, tsr) {
        super();
        this.ctx = ctx;
        this.tsr = tsr;
        this.memberFieldValues = {};
        antlr4.tree.ParseTreeWalker.DEFAULT.walk(this, ctx);
        this.newParameterList = null;
    }

    get name(){
        return this.ctx.classHead().NAME();
    }

    recordMemberField(varName, initialValue = "nil") {
        this.memberFieldValues[varName] = initialValue;
    }

    printObject(){
        return this.printDeclaration() + "\n" + this.printConstructor();
    }

    printDeclaration() {
        let memberFieldKeys = Object.keys(this.memberFieldValues);
        if (memberFieldKeys.length === 0) return `${this.ctx.NAME()} = {};`;
        let text = `${this.name} = {\n`;

        for (let key of memberFieldKeys) {
            if (this.memberFieldValues[key]) {
                text = text + "\t" + key + " = " + this.memberFieldValues[key] + ";\n";
            }
            else {
                text = text + "\t" + key + " = nil;\n";
            }
        }
        return text + "};";
    }

    printConstructor() {
        let text = "";
        if (this.newParameterList){
            text = `function ${this.name}:new(${this.newParameterList.getText()})\n`;
            text = text + "local child = {};\n";
            text = text + "setmetatable(child, {__index = self});\n";    
            text = text + `${this.name}:constructor(${this.newParameterList.getText()});\n`;
        } else {
            text = `function ${this.name}:new()\n`;
            text = text + "local child = {};\n";
            text = text + "setmetatable(child, {__index = self});\n";    
        }

        text = text + "return child;\n";
        text = text + "end;\n";
        return text;
    }

    enterMemberMethod(ctx){
        if (ctx.NAME().getText() === "constructor"){
            this.newParameterList = ctx.funcParamList();
        }

        this.tsr.replace(ctx.NAME(), `function ${this.name}:${ctx.NAME().getText()}`);
    }

    enterMemberField(ctx){
        const nameList = ctx.nameExpList().namelist().NAME();
        const explist = ctx.nameExpList().explist();

        for (let i = 0; i < nameList.length; i++){
            if (explist){
                const exp = explist.exp(i) ? explist.exp(i).getText() : undefined;
                this.recordMemberField(nameList[i].getText(), exp);
            } else {
                this.recordMemberField(nameList[i].getText(), undefined);
            }
        }

        this.tsr.replace(ctx, "");
    }

    exitClassDeclaration(ctx){
        this.tsr.replace(ctx.classHead(), this.printObject());                
    }
};

export {ClassRecord, DiscreteClassRecord};