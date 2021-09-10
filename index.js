import TuaTranslator from "./src/TuaTranslator.js";

const tuaTranslator = new TuaTranslator();
tuaTranslator.addSource(process.argv[2]);

// tuaTranslator.parseClasses();

// tuaTranslator.printSource(process.argv[2]);
// tuaTranslator.printResult(process.argv[2]);

tuaTranslator.print();