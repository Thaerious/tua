import TokenStreamRewriter from "../src/TokenStreamRewriter.js";
import assert from 'assert/strict';

(function(){
    const tsr = new TokenStreamRewriter();
    tsr.replace(0, 0, "a");
    tsr.replace(1, 1, "b");
    tsr.replace(2, 2, "c");

    const normal = tsr.normalizeProgram();
    assert.equal(normal[0].text, "a");
    assert.equal(normal[1].text, "b");
    assert.equal(normal[2].text, "c");
})();

(function(){
    const tsr = new TokenStreamRewriter();
    tsr.replace(0, 0, "a");
    tsr.replace(0, 1, "b");
    tsr.replace(2, 2, "c");

    const normal = tsr.normalizeProgram();
    console.log(normal);
    assert.equal(normal[0].text, "b");
    assert.equal(normal[1].text, "c");
})();

// (function(){
//     const tsr = new TokenStreamRewriter();
//     tsr.replace(1, 5, "x");
//     tsr.replace(1, 2, "apple");
//     tsr.replace(5, 5, "a");

//     const normal = tsr.normalizeProgram();
//     assert.equal(normal[0].text, "x");
//     assert.equal(normal[1].text, "a");
// })();

// (function(){
//     const tsr = new TokenStreamRewriter();
//     tsr.insertBefore(0, "x");
//     tsr.replace(0, 2, "a");

//     const program = tsr.getProgram();
//     console.log(program);
//     console.log();
//     const normal = tsr.normalizeProgram();
//     console.log(normal);
//     assert.equal(normal[0].text, "x");
//     assert.equal(normal[1].text, "a");
// })();

// (function(){
//     const tsr = new TokenStreamRewriter();
//     tsr.insertBefore(1, "x");
//     tsr.replace(0, 2, "a");

//     const program = tsr.getProgram();
//     console.log(program);
//     console.log();
//     const normal = tsr.normalizeProgram();
//     console.log(normal);
//     assert.equal(normal[0].text, "a");
// })();

// (function(){
//     const tsr = new TokenStreamRewriter();
//     tsr.insertBefore(1, "x");
//     tsr.replace(1, 2, "a");

//     const program = tsr.getProgram();
//     console.log(program);
//     console.log();
//     const normal = tsr.normalizeProgram();
//     console.log(normal);
// })();

// (function () {
//     const tsr = new TokenStreamRewriter();
//     tsr.insertBefore(1, "x");
//     tsr.replace(1, 2, "a");

//     const program = tsr.getProgram();
//     console.log(program);
//     console.log();
//     const normal = tsr.normalizeProgram();
//     console.log(normal);
// })();