import antlr4 from 'antlr4';
import TuaLexer from './antlr/src/TuaLexer.js';
import TuaParser  from './antlr/src/TuaParser.js';
import TuaListener from './antlr/src/TuaListener.js';
import ParseTreeWalker from 'antlr4';
import FS from 'fs';
import KeyPrinter from 'antlr4';
import TokenStreamRewriter from './src/TokenStreamRewriter.js';
import TuaTranslator from "./src/TuaTranslator.js";
import { TypeError } from './src/TypeError.js';

const input = FS.readFileSync(process.argv[2]);

const chars = new antlr4.InputStream(input.toString());
const lexer = new TuaLexer(chars);
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new TuaParser(tokens);
parser.buildParseTrees = true;
const tree = parser.chunk();

console.log(parser.getTokenStream().getText(tree));

const tuaTranslator = new TuaTranslator(tokens);

try{
    antlr4.tree.ParseTreeWalker.DEFAULT.walk(tuaTranslator, tree);
    console.log(tuaTranslator.tsr.getProgram());
    console.log(tuaTranslator.tsr.normalizeProgram());
    console.log(tuaTranslator.tsr.getText());
} catch (error){
    if (error instanceof TypeError){
        console.log(error.message);
    }
    else {
        throw error;
    }
}

// while(index > -1){
//     console.log("[" + index + "] " + tokens.get(index).text.replaceAll(/[\r\n]/g, "[n]"));
// }

// while (index < tokens.getNumberOfOnChannelTokens()){
//     console.log("[" + index + "] " + tokens.get(index).text.replaceAll(/[\r\n]/g, "[n]"));
//     index++;
// }

// const tuaListener = new TuaListener();

// function onEnter(ctx){
//     console.log(ctx.constructor.name);
// }
// const methods = Object.getOwnPropertyNames(TuaListener.prototype);
// const enterMethods = methods.filter(n=>n.startsWith("enter"));
// enterMethods.forEach(method=>tuaListener[method] = onEnter);

// tuaListener.exitCurly_block = (ctx)=>{
//     const text = ctx.parser.getTokenStream().getText(ctx.block());
//     console.log(text);
//     console.log(ctx.getText());
// }

// antlr4.tree.ParseTreeWalker.DEFAULT.walk(tuaListener, tree);
// // console.log(tree);

