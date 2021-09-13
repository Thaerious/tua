import { Range, Point } from "./Range.js";
import antlr4 from "antlr4";
import { Interval } from "antlr4";
import {Token} from "antlr4";

class RewriteOperation {
    constructor(text = null) {
        this.range = null;
        this.text = text;
    }

    /**
     * Perform the rewrite operation by appending to buffArray.
     * By default, does nothing.
     * @param {Array} bufferArray An array of strings that serves as the final output. 
     * @returns The next token index to perform an operation on.
     */
    execute(bufferArray) {
        return -1;
    }

    /**
     * Determine if this op's indices completely contain that
     * op's indices.
     * @param {*} that 
     * @returns 
     */
    contains(that) {
        if (!that) return false;
        if (this.index <= that.index && this.end >= that.end) return true;
        return false;
    }

    /**
     * Determine if this op's indices intersects that.
     * Also returns true if contained.
     * op's indices.
     * @param {*} that 
     * @returns 
     */
    intersects(that) {
        if (!that) return false;
        return this.range.intersects(that.range);
    }
}

/**
 * Replace range {from ... to} with text.
 * From and to are inclusive.
 * If text is not provided, removes the range.
 */
class ReplaceOperation extends RewriteOperation {
    constructor(from, to, text = "") {
        super(text);
        this.range = new Range(from, to);
    }

    execute(bufferArray) {
        if (this.text === "") return this.range.to + 1;
        bufferArray.push(this.text);
        return this.range.to + 1;
    }
}

/**
 * Replace range {from ... to} with text.
 * If text is not provided, removes the range.
 */
class InsertBeforeOperation extends RewriteOperation {
    constructor(index, text = "") {
        super(text);
        this.range = new Point(index);
    }

    execute(bufferArray) {
        if (this.text !== "") bufferArray.push(this.text);
        return this.range.from;
    }
}

class NoOperation{
    execute(){}
}

class TokenStreamRewriter {
    constructor(tokenStream) {
        this.tokenStream = tokenStream;
        this.programs = new Map(); // programName:string -> Array of RewriteOperation objects.
    }

    getProgram(programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
        if (!this.programs.has(programName)) {
            this.programs.set(programName, []);
        }
        return this.programs.get(programName);
    }

    remove(source, programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME){
        this.replace(source, "", programName);
    }

    replace(source, text = "", programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
        const program = this.getProgram(programName);
        if (source.getSourceInterval){
            const interval = source.getSourceInterval();
            const operation = new ReplaceOperation(interval.start, interval.stop, text)
            program.push(operation);
            operation.remove = this.tokenStream.getText(interval);
            return operation;
        }        
        else if (source instanceof Token){
            const operation = new ReplaceOperation(source.tokenIndex, source.tokenIndex, text)
            program.push(operation);
            operation.remove = this.tokenStream.getText(new Interval(source.tokenIndex, source.tokenIndex));
            return operation;            
        }
        return new NoOperation();
    }

    insertBefore(source, text = "", programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
        const program = this.getProgram(programName);
        const operation = new InsertBeforeOperation(index, text);
        program.push(operation);
        return operation;
    }

    insertAfter(index, text = "", programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
        const program = this.getProgram(programName);
        const operation = new InsertBeforeOperation(index + 1, text);
        program.push(operation);
        return operation;
    }

    getText(interval, programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
        if (interval === undefined || interval === null) {
            interval = new Interval(0, this.tokenStream.tokens.length - 1);
        }

        const buffer = [];
        const program = this.normalizeProgram(programName);
        let currentIndex = 0;

        while (currentIndex < this.tokenStream.tokens.length) {
            if (program.length === 0) {
                const interval = new Interval(currentIndex, this.tokenStream.tokens.length);
                buffer.push(this.tokenStream.getText(interval));
                currentIndex = this.tokenStream.tokens.length
            }
            else if (program[0].range.from > currentIndex) {
                const interval = new Interval(currentIndex, program[0].range.from - 1);
                buffer.push(this.tokenStream.getText(interval));
                currentIndex = program[0].range.from;
            }
            else {                
                currentIndex = program.shift().execute(buffer);
            }
        }

        return buffer.join("");
    }

    /**
     * Order the operation and remove redundant operations.
     * @param {*} program An array of RewriteOpertion objects.
     */
    normalizeProgram(programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
        const program = this.getProgram(programName);
        const newProgram = [];

        program.sort((first, second) => {
            if (first.range.from == second.range.from) {
                return second.range.to - first.range.to;
            }
            return first.range.from - second.range.from;
        });

        for (let i = 0; i < program.length; i++) {
            const operation = program[i];
            const prevOperation = newProgram[newProgram.length - 1];

            if (operation.intersects(prevOperation)) continue;
            newProgram.push(operation);
        }

        return newProgram;
    }
}

TokenStreamRewriter.DEFAULT_PROGRAM_NAME = "default";

export default TokenStreamRewriter;