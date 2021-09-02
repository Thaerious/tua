
class RewriteOperation{
    constructor(index, text = null){
        this.index = index;
        this.lastIndex = index;
        this.text = text;
    }

    /**
     * Perform the rewrite operation by appending to buffArray.
     * By default, does nothing.
     * @param {Array} bufferArray An array of strings that serves as the final output. 
     * @returns The next token index to perform an operation on.
     */
    execute(bufferArray){
        return this.index
    }

    toString(){
        return `(${this.constructor.name}, ${this.index}, ${this.lastIndex})`;
    }
}

/**
 * Replace range {from ... to} with text.
 * If text is not provided, removes the range.
 */
class ReplaceOperation extends RewriteOperation{
    constructor(from, to, text = ""){
        super(from, text);
        this.lastIndex = to;
    }

    execute(bufferArray){
        if (this.text === "") return this.index;
        bufferArray.push(this.text);
        return this.lastIndex + 1;
    }
}

/**
 * Replace range {from ... to} with text.
 * If text is not provided, removes the range.
 */
 class InsertBeforeOperation extends RewriteOperation{
    constructor(index, text = ""){
        super(index, text);
    }

    execute(bufferArray){
        if (this.text === "") return this.index;
        bufferArray.push(this.text);
        return this.index;
    }
}

class TokenStreamRewriter{

    constructor(tokenStream){
        this.tokenStream = tokenStream;
        this.programs = new Map(); // programName:string -> Array of RewriteOperation objects.
    }

    getProgram(programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME){
        if (!this.programs.has(programName)){
            this.programs.set(programName, []);
        }
        return this.programs.get(programName);
    }

	replace(from, to, text = "", programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME) {
		const program = this.getProgram(programName);
        program.push(new ReplaceOperation(from, to, text));
	}

    getText(programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME, start = 0, stop = -1){

    }

    /**
     * Combine or remove opertions to remove the ambiguity of multiple
     * operstions per index.  Each index will have zero or one operations
     * working on it.
     * @param {*} program An array of RewriteOpertion objects.
     */
    normalizeProgram(programName = TokenStreamRewriter.DEFAULT_PROGRAM_NAME){
        const program = this.getProgram(programName);

        program.sort((first, second)=>{
            return first.index - second.index; 
        });

        for (operation of program){
            if (operation.constructor.name !== ReplaceOperation) continue;
            this.__removeContainedInsertions(program, )
        }

        return program;
    }

    __removeContainedInsertions(program, from, to){
        for (operation of program){
            if (operation.constructor.name !== ReplaceOperation) continue;
            this.__removeContainedInsertions(program, )
        }
    }
}

TokenStreamRewriter.DEFAULT_PROGRAM_NAME = "default";

export default TokenStreamRewriter;