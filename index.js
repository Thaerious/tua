import TuaTranslator from "./src/TuaTranslator.js";

const tuaTranslator = new TuaTranslator();
tuaTranslator.addSource(process.argv[2]);
tuaTranslator.parseClasses();

// let ctx = tuaTranslator.getRecord(0).root;
// let tokens = tuaTranslator.getRecord(0).tokens.getTokens(0, 50);
// for (let t of tokens){
//     console.log(`${t.start} ${t.stop} '${t.text.replaceAll(/[\n\r]/g, "[]")}'`);
// } 


// console.log(tuaTranslator.getRecord(0).tsr.normalizeProgram());

tuaTranslator.saveResult(process.argv[3] ?? "a.lua");