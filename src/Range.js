/**
 * A range includes all locations between from and to inclusively.
 */
class Range{
    constructor(from, to){
        this.from = from;
        this.to = to;
    }

    get isPoint(){
        return false;
    }

    intersects(that){        
        if (!this || !that) return false;
        if (this.isPoint && that.isPoint) return false;
        if (this.isPoint){
            if (this.from > that.from && this.from <= that.to) return true;
            return false;
        }
        if (that.isPoint){
            if (that.from > this.from && that.from <= this.to) return true;
            return false;
        }
        if (that.to < this.from) return false;
        if (that.from > this.to) return false;
        return true;
    }
}

/**
 * A point describes a location before index
 */
class Point extends Range{
    constructor(index){
        super(index, index);
    }

    get isPoint(){
        return true;
    }
}

export {Range, Point};
