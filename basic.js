import antlr4 from 'antlr4';
import TuaParser from "./antlr/src/TuaParser.js";
import TuaLexer from "./antlr/src/TuaLexer.js";
import FS from 'fs';
import {error} from "antlr4";

const filename = process.argv[2];
const input  = FS.readFileSync(filename);
const chars  = new antlr4.InputStream(input.toString());
const lexer  = new TuaLexer(chars);
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new TuaParser(tokens);
parser.buildParseTrees = true;

const errorListener = new error.ErrorListener();
errorListener.syntaxError = function(recognizer, offendingSymbol, line, column, msg, e) {
      console.error("Syntax Error line " + line + ":" + column + " " + msg);
}

parser.removeErrorListeners();
parser.addErrorListener(errorListener);

const root = parser.chunk();

// const output = root.parser.getTokenStream().getText(root);

console.log("\n\n");

let tree = root.toStringTree(parser.ruleNames);

let output = ""
let depth = 0;
for (let i = 0; i < tree.length; i++){
      if(tree.charAt(i) == "("){
            output = output + "\n";
            output = output + "- ".repeat(depth);
            depth++;
      } 
      else if(tree.charAt(i) == ")"){
            depth--;
      }
      else {
            output = output + tree.charAt(i);
      }
}

console.log(tree);