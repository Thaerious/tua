import antlr4 from 'antlr4';
import TuaLexer from './src/TuaLexer.js';
import TuaParser  from './src/TuaParser.js';
import TuaListener from './src/TuaListener.js';
import ParseTreeWalker from 'antlr4';
import FS from 'fs';
import KeyPrinter from 'antlr4';

const input = FS.readFileSync(process.argv[2]);

const chars = new antlr4.InputStream(input.toString());
const lexer = new TuaLexer(chars);
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new TuaParser(tokens);
parser.buildParseTrees = true;
const tree = parser.chunk();

const tuaListener = new TuaListener();

function onEnter(ctx){
    console.log(ctx.constructor.name);
}
const methods = Object.getOwnPropertyNames(TuaListener.prototype);
const enterMethods = methods.filter(n=>n.startsWith("enter"));
enterMethods.forEach(method=>tuaListener[method] = onEnter);

tuaListener.exitCurly_block = (ctx)=>{
    const text = ctx.parser.getTokenStream().getText(ctx.block());
    console.log(text);
    console.log(ctx.getText());
}

antlr4.tree.ParseTreeWalker.DEFAULT.walk(tuaListener, tree);
// console.log(tree);

