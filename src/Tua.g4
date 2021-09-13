grammar Tua;

chunk : includes block EOF ;
includes : include* ;
include : '#include' string ;
block : statement* last_statement? ;

statement
    : ';'
    | varlist '=' explist
    | functioncall
    | 'break'
    | do_block
    | 'while' exp do_block
    | 'repeat' block 'until' exp
    | 'if' exp 'then' block ('elseif' exp 'then' block)* ('else' block)? END
    | 'for' NAME '=' exp ',' exp (',' exp)? do_block
    | 'for' namelist 'in' explist do_block
    | functionDeclaration
    | classDeclaration
    ;

do_block : 'do' block END;
classDeclaration : classHead classBody ;
classHead : 'class' NAME ('extends' NAME)? ;

classBody : classElement* END ;

classElement : memberField | memberMethod ;

memberField  : nameExpList ';'?;
memberMethod : NAME '(' funcParamList? ')' funcbody ';'?;
nameExpList : namelist ('=' explist)?; // was ('=' explist)*
namelist : NAME (',' NAME)* ;

// type : 'void' | 'boolean' | 'number' | 'string' | NAME;

last_statement
    : 'return' explist?
    | 'break'
    ;

functioncall : varOrExp nameAndArgs+ ;
varOrExp : variable | '(' exp ')' ;

functionDeclaration: 'function' funcname '(' funcParamList? ')' funcbody ;

anonfunc : 'function' '(' funcParamList? ')' funcbody ;
funcname : NAME ('.' NAME)* ;
funcbody : block END;
funcParamList : NAME (',' NAME)* (',' '...')? | '...' ;

nameAndArgs : (':' NAME)? args ;

args : '(' explist? ')' | tableconstructor | string ;

tableconstructor : '{' fieldlist? '}' ;

fieldlist : field (fieldsep field)* fieldsep? ;

fieldsep : ',' | ';' ;

field : '[' exp ']' '=' exp | NAME '=' exp | exp ;

varlist : variable (',' variable)* ;

explist : exp (',' exp)* ;

variable : (NAME | '(' exp ')' varSuffix) varSuffix* ;
varSuffix : nameAndArgs* ('[' exp ']' | '.' NAME) ;

exp
    : 'nil' 
    | 'false' 
    | 'true'
    | number
    | string
    | '...'
    | anonfunc
    | prefixexp
    | tableconstructor
    | <assoc=right> exp '^' exp
    | operatorUnary exp
    | exp operatorMulDivMod exp
    | exp operatorAddSub exp
    | <assoc=right> exp '..' exp
    | exp operatorComparison exp
    | exp 'and' exp
    | exp 'or' exp
    | exp operatorBitwise exp
    ;

prefixexp : varOrExp nameAndArgs* ;
operatorMulDivMod : '*' | '/' | '%' | '//';
operatorAddSub : '+' | '-';
operatorComparison : '<' | '>' | '<=' | '>=' | '~=' | '==';
operatorBitwise	: '&' | '|' | '~' | '<<' | '>>';
operatorUnary : 'not' | '#' | '-' | '~';

number : INT | HEX | FLOAT | HEX_FLOAT ;

string locals [int i=0]
    : QUOTE_STRING | '[' NESTED_STR ']' ;

QUOTE_STRING
    : '"' ( EscapeSequence | ~('\\'|'"') )* '"'
    | '\'' ( EscapeSequence | ~('\''|'\\') )* '\''
    ;

fragment
EscapeSequence
    : '\\' [abfnrtvz"'\\]
    | '\\' '\r'? '\n'
    | DecimalEscape
    | HexEscape
    | UtfEscape
    ;

fragment
DecimalEscape
    : '\\' Digit
    | '\\' Digit Digit
    | '\\' [0-2] Digit Digit
    ;
fragment
HexEscape
    : '\\' 'x' HexDigit HexDigit
    ;

fragment
UtfEscape
    : '\\' 'u{' HexDigit+ '}'
    ;

fragment
Digit
    : [0-9]
    ;
fragment
HexDigit
    : [0-9a-fA-F]
    ;

// lexical

NESTED_STR 
    : '=' NESTED_STR '='
    | '[' .*? ']'
    ;

INT
    : Digit+
    ;

HEX
    : '0' [xX] HexDigit+
    ;

FLOAT
    : Digit+ '.' Digit* ExponentPart?
    | '.' Digit+ ExponentPart?
    | Digit+ ExponentPart
    ;

HEX_FLOAT
    : '0' [xX] HexDigit+ '.' HexDigit* HexExponentPart?
    | '0' [xX] '.' HexDigit+ HexExponentPart?
    | '0' [xX] HexDigit+ HexExponentPart
    ;

fragment
ExponentPart
    : [eE] [+-]? Digit+
    ;

fragment
HexExponentPart : [pP] [+-]? Digit+ ;

/* keywords ------------------- */
END : 'end' ;
/* ---------------------------- */

NAME : [a-zA-Z_][a-zA-Z0-9_]* ;

COMMENT
    : '--[' NESTED_STR ']' -> channel(1)
    ;

LINE_COMMENT
    : '--'
    (                                               // --
    | '[' '='*                                      // --[==
    | '[' '='* ~('='|'['|'\r'|'\n') ~('\r'|'\n')*   // --[==AA
    | ~('['|'\r'|'\n') ~('\r'|'\n')*                // --AAA
    ) ('\r\n'|'\r'|'\n'|EOF)
    -> channel(1)
    ;

WS : [ \t\r\n]+ -> channel(2);

SHEBANG
    : '#' '!' ~('\n'|'\r')* -> channel(HIDDEN) ;