import {ClassRecord, DiscreteClassRecord} from "./ClassRecord.js";

/**
 * A record of declared types.
 * Each type must have a .name and a .ctx field.
 */
class TypeTable {

    constructor() {
        this.table = {};
        this.map = new Map();
        this.scope = [];

        this.table["string"] = new DiscreteClassRecord("string");
        this.table["number"] = new DiscreteClassRecord("number");
        this.table["boolean"] = new DiscreteClassRecord("boolean");
        this.table["void"] = new DiscreteClassRecord("void");
    }

    has(typename) {
        return this.table[typename] !== undefined;
    }

    add(record) {
        this.table[record.name] = record;
        this.map.set(record.ctx, record);
    }
   
    get(name) {
        return this.table[name];
    }

    findContext(ctx){
        return this.map.get(ctx);
    }
};

export default TypeTable;