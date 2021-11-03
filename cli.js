import TuaTranslator from "./src/TuaTranslator.js";

const tuaTranslator = new TuaTranslator();
tuaTranslator.includer.addIncludePath("test");
tuaTranslator.addSource(process.argv[2]);
tuaTranslator.parseClasses();
tuaTranslator.saveResult(process.argv[3] ?? "a.lua");