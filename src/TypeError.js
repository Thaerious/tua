class TypeError extends Error{}

class RepeatedClassError extends TypeError{
    constructor(ctx, prevCtx){
        const message = 
            `Line ${ctx.start.line}:${ctx.start.column} class already declared: ${ctx.NAME()}\n` +
            `Class previously declared at line ${prevCtx.start.line}:${prevCtx.start.column}`;
        super(message);
    }
}

export {TypeError, RepeatedClassError};