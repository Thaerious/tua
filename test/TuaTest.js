import Assert from "assert";
import Path from "path";
import FS from "fs";
import TuaTranslator from "../src/TuaTranslator.js";

Assert.stringHas = function(result, expected){
      Assert.notStrictEqual(result.indexOf(expected), -1);
}

describe("Tua Sanity Test", ()=>{
      it("Will parse a simple file with no includes or classes", ()=>{            
            const tuaTranslator = new TuaTranslator();
            tuaTranslator.addSource("test/dummy_files/foo.tua");
            tuaTranslator.parseClasses();
            const result = tuaTranslator.toString();
            Assert.stringHas(result, "ima foo four ewe");
      });
      it("Single level include", ()=>{            
            const tuaTranslator = new TuaTranslator();
            tuaTranslator.addSource("test/dummy_files/has_foo.tua");
            tuaTranslator.parseClasses();
            const result = tuaTranslator.toString();
            console.log(result);
            Assert.stringHas(result, "ima foo four ewe");
      });      
});