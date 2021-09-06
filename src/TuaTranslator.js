import TuaListener from "../antlr/src/TuaListener.js";
import TokenStreamRewriter from "./TokenStreamRewriter.js";
import TypeTable from "./TypeTable.js";
import { RepeatedClassError } from "./TypeError.js";

class TuaTranslator extends TuaListener{

    constructor(tokens){
        super();
        this.tsr = new TokenStreamRewriter(tokens);
        this.typeTable = new TypeTable();
    }

    exitCurly_block(ctx){
        this.tsr.replace(ctx.OPEN_BLOCK(), "do");
        this.tsr.replace(ctx.CLOSE_BLOCK(), "end");
    }
    
    exitCfuncbody(ctx){
        this.tsr.replace(ctx.OPEN_BLOCK(), "");
        this.tsr.replace(ctx.CLOSE_BLOCK(), "end;");
    }

    enterClassHead(ctx){
        console.log(`${ctx.constructor.name} ${ctx.NAME()}`);

        if (this.typeTable.has(ctx)){
            throw new RepeatedClassError(ctx, this.typeTable.get(ctx.NAME()).ctx);
        }

        this.typeTable.enterClassScope(ctx);
    }

    enterClassBody(ctx){
        this.tsr.replace(ctx.OPEN_BLOCK(), "");
        this.tsr.replace(ctx.CLOSE_BLOCK(), "");
    }

    enterMemberMethod(ctx){
        this.tsr.replace(ctx.type(), "");
        this.tsr.replace(ctx.NAME(), `function ${this.typeTable.getCurrentScope()}:${ctx.NAME().getText()}`);
    }

    enterMemberField(ctx){
        const typeRecord = this.typeTable.getLast();
        const nameList = ctx.nameExpList().namelist().NAME();
        const explist = ctx.nameExpList().explist();

        for (let i = 0; i < nameList.length; i++){
            const exp = explist.exp(i) ? explist.exp(i).getText() : undefined;
            typeRecord.addMemberField(nameList[i].getText(), exp);
        }
        console.log(typeRecord.staticFields);

        this.tsr.replace(ctx, "");
    }

    exitClassDeclaration(ctx){
        this.tsr.replace(ctx.classHead(), this.typeTable.get(ctx.classHead().NAME()).printObject());        
    }
}

export default TuaTranslator;