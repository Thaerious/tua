import TuaListener from "../antlr/src/TuaListener.js";
import antlr4 from 'antlr4';

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
        this.extendClassName = null;
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
        let text = "";

        if (memberFieldKeys.length !== 0){
            text = text + `${this.name} = {\n`;

            for (let key of memberFieldKeys) {
                if (this.memberFieldValues[key]) {
                    text = text + "\t" + key + " = " + this.memberFieldValues[key] + ";\n";
                }
                else {
                    text = text + "\t" + key + " = nil;\n";
                }
            }
            text = text + "};\n";
        } else {
            text = text + `${this.name} = {}\n`
        }

        if (this.extendClassName){
            text = text + `setmetatable(${this.name}, {__index = ${this.extendClassName}});`
        }

        return text;
    }

    printConstructor() {
        let text = "";

        let parameterList = "";
        let constructorCall = "";
        let localChild = `local child = {};`;
        let setMetaTable = `setmetatable(child, {__index = self});`;                

        if (this.newParameterList){
            parameterList = this.newParameterList.getText();
            constructorCall = `\t${this.name}:constructor(${this.newParameterList.getText()});\n`;
        }

        text = `function ${this.name}:new(${parameterList})\n`;
        text = text + "\t" + localChild + "\n";
        text = text + "\t" + setMetaTable + "\n";    
        text = text + constructorCall;
        text = text + "\treturn child;\n";
        text = text + "end;\n";
        return text;
    }

    enterSuperCall(ctx){
        this.superArgs = ctx.args();
    }

    enterExtendHead(ctx){
        this.extendClassName = ctx.NAME().getText();
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

        const interval = ctx.getSourceInterval();
        const tokens = this.tsr.tokenStream;

        const left = tokens.getHiddenTokensToLeft(interval.start, 2);
        for (let t of left) this.tsr.remove(t);

        this.tsr.remove(ctx);
    }

    exitClassDeclaration(ctx){
        this.tsr.replace(ctx.classHead(), this.printObject());  
        this.tsr.replace(ctx.classBody().END(), "");              
    }
};

export {ClassRecord, DiscreteClassRecord};