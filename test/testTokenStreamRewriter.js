import TokenStreamRewriter from "../src/TokenStreamRewriter.js";
import assert from 'assert/strict';

const tsr = new TokenStreamRewriter();
tsr.replace(2, 5, "x");
tsr.replace(1, 2, "apple");
tsr.replace(5, 5, "x");

const normal = tsr.normalizeProgram()
console.log(tsr.normalizeProgram());
assert.equal(normal[0].index, 1);
assert.equal(normal[1].index, 2);
assert.equal(normal[2].index, 5);