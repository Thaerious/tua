import antlr4 from "antlr4";
import TuaListener from "../antlr/src/TuaListener.js";
import TokenStreamRewriter from "./TokenStreamRewriter.js";
import { ClassRecord } from "./ClassRecord.js";
import TuaParser from "../antlr/src/TuaParser.js";
import TuaLexer from "../antlr/src/TuaLexer.js";
import FS from "fs";
import { error } from "antlr4";
import Path from "path";

class TreeNode {
    constructor(data = null, parent = null) {
        this.data = data;
        this.children = [];
        this._parent = parent;
    }

    get parent(){
        return this._parent
    }

    get root(){
        let current = this;
        while (current.parent) current = current.parent;
        return current;
    }

    addChild(data) {
        const childNode = new TreeNode(data, this);
        this.children.push(childNode);
        return childNode
    }

    collect(array = []) {
        for (let child of this.children) {
            child.collect(array);
        }

        if (this.data) array.push(this.data);
        return array;
    }

    toString(depth = 0, str = ""){
        str = `${str}${depth}${"  ".repeat(depth)} -- ${this.data}\n`;
        for (let child of this.children) {
            str = child.toString(depth + 1, str);
        }
        return str;
    }
}

/**
 * The Includer is responsible for maintaining a list of all source files.
 * The files get returned in the order in which they are included.
 */
class Includer {

    constructor() {
        this.records = {};
        this.includePaths = ["."];
    }

    addIncludePath(...paths){
        for (const path of paths) this.includePaths.push(path);
    }

    getFullIncludePath(filename){
        for (const includePath of this.includePaths){            
            const fullpath = Path.join(includePath, filename);
            if (FS.existsSync(fullpath)) return fullpath;
        }
        return filename;
    }

    process() {
        if (!this.ctx) return;

        const includes = this.ctx.include();
        for (let include of includes) {
            const text = include.FILENAME().getText();
        }
    }

    /**
     * Add a file to the parse project.
     * If it has previously been added, skip.
     * Put's the file in front of the file specfied in 'parent'.  This makes all
     * included code show up before the code they were included in.
     *
     * This method performs the code lex & parse.
     * 
     * @param {*} filename path of the file to include
     * @param {IncludeContext} includeContext AST context object used for error reporting
     * @param {*} parent record for the parent file
     * @returns
     */
    add(filename, includeContext = undefined, parent = undefined) {
        if (this.records[filename]) {
            const msg = `Warning: ${parent?.filename} ${includeContext.start.line}:${includeContext.start.column} file previously included: ${filename}`;
            console.log(msg);
            return;
        }

        try {
            const record = {};
            const fullIncludePath = this.getFullIncludePath(filename);
            const input = FS.readFileSync(fullIncludePath);
            const chars = new antlr4.InputStream(input.toString());
            const lexer = new TuaLexer(chars);

            record.filename = filename;
            record.fullIncludePath = fullIncludePath;
            record.tokens = new antlr4.CommonTokenStream(lexer);
            record.parser = new TuaParser(record.tokens);
            record.parser.buildParseTrees = true;
            record.parser.removeErrorListeners();
            record.parser.addErrorListener(new TuaErrorListener(fullIncludePath));

            /* this starts the antlr parser */
            record.root = record.parser.chunk();
            record.tokenStreamRewriter = new TokenStreamRewriter(record.tokens);
            this.records[filename] = record;

            if (!this._order) this._order = new TreeNode(filename);
            else this._order = this._order.addChild(filename);

            new TuaIncludeParser(this, record).run(); // recursivly called on #include nodes
            if (this._order.parent) this._order = this._order.parent;
        } catch (err) {
            if (includeContext) {
                const msg = `${parent?.filename ?? ""} ${includeContext.start.line}:${includeContext.start.column}\n\tinclude file not found: '${filename}'`;
                console.error(msg);
            } else {
                console.error(`Could not open file ${filename}`);
                console.log(err);
            }
        }
    }

    get order() {        
        return this._order.collect();
    }
}

class TuaErrorListener extends error.ErrorListener {
    constructor(filename) {
        super();
        this.filename = filename
    }

    syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
        console.error("Syntax Error in '" + this.filename + ":" + line + ":" + column + "'\n\t" + msg);
    }
}

class TuaIncludeParser {
    /**
     * Include all files indicated by record.
     * Removes include directive from output.
     * @param {Includer} includer
     * @param {*} record source record
     */
    constructor(includer, record) {
        this.includer = includer;
        this.record = record;
    }

    run() {
        if (!this.record.root.includes()) return;

        /* Get all #include statements from the antlr AST */
        /* replace the statements with a REM statement.   */
        /* run the includer add function on that include  */
        for (let include of this.record.root.includes().include()) {
            let filename = include.string().getText();
            filename = filename.substr(1, filename.length - 2);
            const parent = this.record.filename;
            this.includer.add(filename, include, this.record);
            const text = this.record.tokens.getText(include);
            this.record.tokenStreamRewriter.replace(include, `---- ${text}`);
        }
    }
}

class TuaClassParser extends TuaListener {
    constructor(tsr) {
        super();
        this.tokenStreamRewriter = tsr;
    }

    /**
     * @param {ClassDelclarationContext} ctx
     */
    enterClassDeclaration(ctx) {
        new ClassRecord(ctx, this.tokenStreamRewriter);
    }
}

class TuaTranslator {
    constructor() {
        this.includer = new Includer();
    }

    addIncludePath(...paths){
        this.includer.addIncludePath(...paths);
    }

    getRecord(index) {
        return this.includer.records[this.includer.order[index]];
    }

    parseClasses() {
        for (let filename in this.includer.records) {
            const record = this.includer.records[filename];
            const classParser = new TuaClassParser(record.tokenStreamRewriter);
            antlr4.tree.ParseTreeWalker.DEFAULT.walk(classParser, record.root);
        }
    }

    /**
     * Add a source file to this project.
     * The include paths will be searched for a file matching sourcePath.
     * @param {String} sourcePath 
     */
    addSource(sourcePath) {
        this.rootfile = this.rootfile ?? sourcePath;
        this.includer.add(sourcePath);
    }

    printSource(filename) {
        const parser = this.includer.records[filename].parser;
        const root = this.includer.records[filename].root;
        console.log(parser.getTokenStream().getText(root));
    }

    /**
     * Write the translated source code to string.
     * First writes all included files in the order that they appear.
     * Second writes the original source file.
     */
    toString() {
        let rvalue = "";
  
        if (this.rootfile.indexOf("global.tua") !== -1){
            console.log(this.rootfile);
            console.log(this.includer._order.toString());
            console.log(this.includer.order);
        }

        for (let i = 0; i < this.includer.order.length - 1; i++) {
            const filename = this.includer.order[i];
            const record = this.includer.records[filename];
            const code = record.tokenStreamRewriter.getText();
            rvalue = `${rvalue}---> ${record.filename}\n`;
            rvalue = `${rvalue}${code}\n`;
            rvalue = `${rvalue}---< \n`;
        }

        const filename = this.includer.order[this.includer.order.length - 1];
        const record = this.includer.records[filename];
        const code = record.tokenStreamRewriter.getText();
        rvalue = `${rvalue}${code}\n`;

        return rvalue;
    }

    /**
     * Write the translated code to file.
     * Writing each include and source file in order.
     * @param {*} filename
     */
    saveResult(filename) {
        console.log("saving to " + filename);
        if (FS.existsSync(filename)) FS.rmSync(filename);
        FS.writeFileSync(filename, this.toString());
    }
}

export default TuaTranslator;
