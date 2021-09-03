
class Range{
    constructor(from, to){
        this.from = from;
        this.to = to;
    }

    get length(){
        return this.to - this.from;
    }

    get isPoint(){
        return this.length === 0;
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
        if (that.from > this.from && that.from <= this.to) return true;
        if (that.to >= this.from && that.from < this.to) return true;
        return false;
    }
}

export default Range;
