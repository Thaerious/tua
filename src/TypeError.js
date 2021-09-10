class TypeError extends Error{}

class RepeatedClassError extends TypeError{
    constructor(ctx, prevCtx, name){
        const message = 
            `Line ${ctx.start.line}:${ctx.start.column} type already declared: ${name}\n` +
            `Type previously declared at line ${prevCtx.start.line}:${prevCtx.start.column}`;
        super(message);
    }
}

class TypeMismatchError extends TypeError{
    constructor(ctx, prevCtx){
        const message = 
            `Line ${ctx.start.line}:${ctx.start.column} type mismatch for variable: ${ctx.NAME()}\n` +
            `Type set at ${prevCtx.start.line}:${prevCtx.start.column}`;
        super(message);
    }    
}

export {TypeError, RepeatedClassError, TypeMismatchError};