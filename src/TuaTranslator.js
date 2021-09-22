import antlr4 from 'antlr4';
import TuaListener from "../antlr/src/TuaListener.js";
import TokenStreamRewriter from "./TokenStreamRewriter.js";
import {ClassRecord} from "./ClassRecord.js";
import TuaParser from "../antlr/src/TuaParser.js";
import TuaLexer from "../antlr/src/TuaLexer.js";
import FS from 'fs';

class TreeNode{
    constructor(data = null){
        this.data = data;
        this.children = [];
    }

    addChild(data){
        const childNode = new TreeNode(data);
        this.children.push(childNode);
    }

    collect(array = []){
        for(let child of this.children){
            child.collect(array);
        }

        if (this.data) array.unshift(this.data);
        return array;
    }
}

class Includer {
    /**
     * @param {IncludesContext} ctx 
     */
    constructor(ctx){
       this.ctx = ctx;
       this.records = {};
       this._order = new TreeNode();
    }

    process(){
        if (!this.ctx) return;

        const includes = this.ctx.include();        
        for (let include of includes){
            const text = include.FILENAME().getText();
        }
    }

    /**
     * Add a file to the parse project.
     * If it has previously been added, skip.
     * Put's the file in front of the file file specfied in 'parent'.
     * 
     * @param {*} filename path of the file to include
     * @param {IncludeContext} includeContext used for error reporting
     * @param {*} parent record for the parent file
     * @returns 
     */
    add(filename, inputText = undefined, includeContext = undefined, parent = undefined){
        if (this.records[filename]){            
            const msg = `Warning: ${parent?.filename} ${includeContext.start.line}:${includeContext.start.column} file previously included: ${filename}`;  
            console.error(msg);
            return;
        }

        try{
            const record = {};
            const input  = inputText ?? FS.readFileSync(filename);
            const chars  = new antlr4.InputStream(input.toString());
            const lexer  = new TuaLexer(chars);
    
            record.filename = filename;
            record.tokens = new antlr4.CommonTokenStream(lexer);
            record.parser = new TuaParser(record.tokens);
            record.parser.buildParseTrees = true;
            record.root = record.parser.chunk();
            record.tsr = new TokenStreamRewriter(record.tokens);
            
            this.records[filename] = record;
            this._order.addChild(filename);
            new TuaIncludeParser(this, record).run();            
        } catch (err){
            if (includeContext){
                const msg = `Line ${includeContext.start.line}:${includeContext.start.column} include file not found: ${filename}`;
                console.error(msg);
            } else {
                console.error(`Could not open file ${filename}`);
            }            
        }
    }

    get order(){
        return this._order.collect();
    }
}

class TuaIncludeParser{

    /**
     * Include all files indicated by record.
     * Removes include directive from output.
     * @param {Includer} includer 
     * @param {*} record source record
     */
    constructor(includer, record){
        this.includer = includer;
        this.record = record;
    }

    run(){        
        for (let include of this.record.root.includes().include()){
            let filename = include.string().getText();              
            filename = filename.substr(1, filename.length - 2);            
            const parent = this.record.filename;
            this.includer.add(filename, undefined, include, this.record);
            const text = this.record.tokens.getText(include);
            this.record.tsr.replace(include, `---> ${text}`);
        }
    }
}

class TuaClassParser extends TuaListener{
    constructor(tsr){
        super();
        this.tsr = tsr;
    }

    /**
     * @param {ClassDelclarationContext} ctx 
     */
    enterClassDeclaration(ctx){
        new ClassRecord(ctx, this.tsr);
    }
}

class TuaTranslator{
    constructor(){
        this.includer = new Includer();
    }

    getRecord(index){
        return this.includer.records[this.includer.order[index]];
    }

    parseClasses(){
        for (let filename in this.includer.records){
            console.log("source: " + filename);
            const record = this.includer.records[filename];
            const classParser = new TuaClassParser(record.tsr);
            antlr4.tree.ParseTreeWalker.DEFAULT.walk(classParser, record.root);
        }
    }

    addSource(filepath, inputText = undefined){
        this.includer.add(filepath, inputText);
    }

    printSource(filename){
        const parser = this.includer.records[filename].parser;
        const root = this.includer.records[filename].root;
        console.log(parser.getTokenStream().getText(root));
    }

    /**
     * Write the translated code to string.
     */
    toString(){
        let rvalue = "";
        for (const filename of this.includer.order){
            const record = this.includer.records[filename];
            const code = record.tsr.getText()
            rvalue = rvalue + code;
        }
        return rvalue;
    }

    /**
     * Write the translated code to file.
     * @param {*} filename 
     */
    saveResult(filename){
        console.log("saving to " + filename);
        if (FS.existsSync(filename)) FS.rmSync(filename);
        for (const src of this.includer.order){
            const record = this.includer.records[src];
            const parser = record.parser;
            const root = record.root;
            FS.appendFileSync(filename, "---> file " + src + "\n");           
            FS.appendFileSync(filename, record.tsr.getText());           
        }
    }
}

export default TuaTranslator;