import {Range, Point} from "../src/Range.js";
import assert from 'assert/strict';

function isFalse(value){
    assert.equal(value, false);
}

function isTrue(value){
    assert.equal(value, true);
}

// undefined
(function(){
    const r1 = new Range(0, 0);
    const r2 = undefined;
    isFalse(r1.intersects(r2));
})();

// two points
(function(){
    const r1 = new Point(0, 0);
    const r2 = new Point(0, 0);
    isFalse(r1.intersects(r2));
    isFalse(r2.intersects(r1));
})();

// two short ranges
(function(){
    const r1 = new Range(0, 0);
    const r2 = new Range(0, 0);
    isTrue(r1.intersects(r2));
    isTrue(r2.intersects(r1));
})();

// point before range
(function(){
    const r1 = new Point(0, 0);
    const r2 = new Range(1, 3);
    isFalse(r1.intersects(r2));
    isFalse(r2.intersects(r1));
})();

// short range on leading edge
(function(){
    const r1 = new Range(1, 1);
    const r2 = new Range(1, 3);
    isTrue(r1.intersects(r2));
    isTrue(r2.intersects(r1));
})();

// short range on trailing edge
(function(){
    const r1 = new Range(3, 3);
    const r2 = new Range(1, 3);
    isTrue(r1.intersects(r2));
    isTrue(r2.intersects(r1));
})();

// point before range, edge
(function(){
    const r1 = new Point(0, 0);
    const r2 = new Range(0, 2);
    isFalse(r1.intersects(r2));
    isFalse(r2.intersects(r1));
})();

// point within range
(function(){
    const r1 = new Point(1, 1);
    const r2 = new Range(0, 2);
    isTrue(r1.intersects(r2));
    isTrue(r2.intersects(r1));
})();

// point within range, edge
(function(){
    const r1 = new Point(5, 5);
    const r2 = new Range(3, 5);
    isTrue(r1.intersects(r2));
    isTrue(r2.intersects(r1));
})();

// point after range
(function(){
    const r1 = new Point(6, 6);
    const r2 = new Range(3, 5);
    isFalse(r1.intersects(r2));
    isFalse(r2.intersects(r1));
})();

// two of the same range
(function(){
    const r1 = new Range(0, 1);
    const r2 = new Range(0, 1);
    isTrue(r1.intersects(r2));
    isTrue(r2.intersects(r1));
})();

// edge intersecting ranges
(function(){
    const r1 = new Range(0, 2);
    const r2 = new Range(2, 4);
    isTrue(r1.intersects(r2));
    isTrue(r2.intersects(r1));
})();

// intersecting ranges
(function(){
    const r1 = new Range(0, 3);
    const r2 = new Range(1, 4);
    isTrue(r1.intersects(r2));
    isTrue(r2.intersects(r1));
})();

// non-intersecting ranges
(function(){
    const r1 = new Range(0, 1);
    const r2 = new Range(2, 4);
    isFalse(r1.intersects(r2));
    isFalse(r2.intersects(r1));
})();

// fully contained leading edge
(function(){
    const r1 = new Range(0, 1);
    const r2 = new Range(0, 4);
    isTrue(r1.intersects(r2));
    isTrue(r2.intersects(r1));
})();

// fully contained trailing edge
(function(){
    const r1 = new Range(3, 4);
    const r2 = new Range(0, 4);
    isTrue(r1.intersects(r2));
    isTrue(r2.intersects(r1));
})();

// fully contained no edges
(function(){
    const r1 = new Range(1, 3);
    const r2 = new Range(0, 4);
    isTrue(r1.intersects(r2));
    isTrue(r2.intersects(r1));
})();
