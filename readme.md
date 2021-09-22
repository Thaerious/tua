TUA - Typed LUA
===============

- class - end keyword pair will inject a class into the generated code.
- all fields are put into the class object.
- the 'new' function calls the 'constructor' if it exists.
- the 'extends' keyword will set the meta-table on the class object.
- the super keyword will call a parent function on 'self' object
- table constructors and strings can not be used in lieu of argument lists (diff LUA)

cli - index.js
node . [source] [destination = a.out]






