grammar Tua;

chunk
    : block EOF
    ;

block
    : statement* last_statement?
    ;

statement 
    : ';'
    | varlist '=' explist
    | functioncall
    | label
    | 'break'
    | 'goto' NAME
    | content_block  
    | 'while' exp content_block
    | 'repeat' block 'until' exp
    | 'if' exp 'then' block ('elseif' exp 'then' block)* ('else' block)? 'end'
    | 'for' NAME '=' exp ',' exp (',' exp)? content_block
    | 'for' namelist 'in' explist content_block
    | 'function' funcname funcbody
    | 'local' 'function' NAME funcbody
    | 'local' namelist ('=' explist)*
    ;

content_block : curly_block | do_block;
curly_block : '{' block '}';
do_block : 'do' block 'end';

last_statement 
    : 'return' explist?
    | 'break'
    ;

label
    : '::' NAME '::'
    ;

functioncall
    : varOrExp nameAndArgs+
    ;

varOrExp
    : variable | '(' exp ')'
    ;

namelist
    : NAME (',' NAME)*
    ;

funcname
    : NAME ('.' NAME)* (':' NAME)?
    ;

funcbody
    : '(' parlist? ')' block 'end'
    ;

parlist
    : namelist (',' '...')? | '...'
    ;

nameAndArgs
    : (':' NAME)? args
    ;

args
    : '(' explist? ')' | tableconstructor | STRING
    ;

tableconstructor
    : '{' fieldlist? '}'
    ;

fieldlist
    : field (fieldsep field)* fieldsep?
    ;

fieldsep
    : ',' | ';'
    ;

field
    : '[' exp ']' '=' exp | NAME '=' exp | exp
    ;


varlist : variable (',' variable)* ;

explist : exp (',' exp)* ;

variable : (NAME | '(' exp ')' varSuffix) varSuffix* ;
varSuffix : nameAndArgs* ('[' exp ']' | '.' NAME) ;

exp
    : 'nil' 
    | 'false' 
    | 'true'
    | number
    | STRING
    | '...'
    | functiondef
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

functiondef : 'function' funcbody ;
prefixexp : varOrExp nameAndArgs* ;
operatorMulDivMod : '*' | '/' | '%' | '//';
operatorAddSub : '+' | '-';
operatorComparison : '<' | '>' | '<=' | '>=' | '~=' | '==';
operatorBitwise	: '&' | '|' | '~' | '<<' | '>>';
operatorUnary : 'not' | '#' | '-' | '~';

number : INT | HEX | FLOAT | HEX_FLOAT ;

STRING 
    : '"' ( EscapeSequence | ~('\\'|'"') )* '"'
    | '\'' ( EscapeSequence | ~('\''|'\\') )* '\''
    | '[' NESTED_STR ']'
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

fragment
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
HexExponentPart
    : [pP] [+-]? Digit+
    ;

NAME : [a-zA-Z_][a-zA-Z0-9_]* ;

COMMENT
    : '--[' NESTED_STR ']' -> channel(HIDDEN)
    ;

LINE_COMMENT
    : '--'
    (                                               // --
    | '[' '='*                                      // --[==
    | '[' '='* ~('='|'['|'\r'|'\n') ~('\r'|'\n')*   // --[==AA
    | ~('['|'\r'|'\n') ~('\r'|'\n')*                // --AAA
    ) ('\r\n'|'\r'|'\n'|EOF)
    -> channel(HIDDEN)
    ;

WS : [ \t\r\n]+ -> channel(HIDDEN);

SHEBANG
    : '#' '!' ~('\n'|'\r')* -> channel(HIDDEN)
    ;