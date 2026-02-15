This guide is provided to point developers in the right direction when writing Leo code. There are many conventions that are unique to the Leo language and the circuits it generates.

This guide is a living document. As new Leo programming conventions arise and old ones become obsolete this guide should reflect the changes. Feel free to add your comments and recommendations here.

Content
Conditional Branches
The Leo compiler rewrites if-else statements inside transitions into a sequence of ternary expressions. This is because the underlying circuit construction does not support branching. For precise control over the circuit size, it is recommended to use ternary expressions directly.

If-Else:
if (condition) {
return a;
} else {
return b;
}

Ternary:
return condition ? a : b;

Why?
Ternary expressions are the cheapest form of conditional. We can resolve the first expression and second expression values before evaluating the condition. This is very easy to convert into a circuit because we know that each expression does not depend on information in later statements.

In the original Example, We cannot resolve the return statements before evaluating the condition. As a solution, Leo creates branches in the circuit so both paths can be evaluated.

branch 1, condition = true
return a;

branch 2, condition = false
return b;

When the input value condition is fetched at proving time, we select a branch of the circuit to evaluate. Observe that the statement return a is repeated in both branches. The cost of every computation within the conditional will be doubled. This greatly increases the constraint numbers and slows down the circuit.

Async Functions vs. Blocks
For code conciseness and readability, prefer using async blocks rather than a separately declared async function:

Async Function:
mapping accumulator: u8 => u64;

async transition increment_accumulator() -> Future {
return increment_state_onchain();
}
async function increment_accumulator_onchain(){
let current_count: u64 = accumulator.get_or_use(0u8, 0u64);
let new_count: u64 = current_count + 1u64;
accumulator.set(0u8, new_count);

}

Async Block:
mapping accumulator: u8 => u64;

async transition increment_accumulator() -> Future {
let f : Future = async {
let current_count: u64 = accumulator.get_or_use(0u8, 0u64);
let new_count: u64 = current_count + 1u64;
accumulator.set(0u8, new_count);
}
return f;
}

Modules
For maximal code cleanliness and readability, take full advantage of Leo's module system:

src
├── constants.leo
├── utils.leo
├── structs.leo
└── main.leo

With the above structure, consider the following:

Move all consts to the constants.leo module
Move all inline functions to the utils.leo module
Move some structs to modules (but this may not make sense in the general case)
The goal is to only have the interface of the program in main.leo. Every function should correspond to something than can be called from an external context such as another program. Note that there is no impact on final program size since modules are flattened into a single program eventually anyways.

Layout
Indentation
4 spaces per indentation level.

Blank lines
A single blank line should separate the top-level declarations in a program scope, namely transition, function, struct, record, and mapping declarations. Multiple imports can be optionally separated by a single blank line; the last import at the top of the file should be followed by a blank line.

Yes:
import std.io.Write;
import std.math.Add;

program prog.aleo {

    struct A {
        // ...
    }

    function foo() {
        // ...
    }

}

No:
import std.io.Write;

import std.math.Add;
program prog.aleo {
struct A {
// ...
}
function foo() {
// ...
}
}

Naming Conventions
Item Convention
Packages snake_case (but prefer single word)
Structs and Records CamelCase
Struct and Record Members snake_case
Functions snake_case
Function Parameters snake_case
Variables snake_case
Inputs snake_case
Layout
Leo file elements should be ordered:

Imports
Program declaration
Mappings
Records + Structs
Functions + Transitions
Braces
Opening braces always go on the same line.

struct A {
// ...
}

transition main() {
// ...
}

let a: A = A { };

Semicolons
Every statement including the return statement should end in a semicolon.

let a: u32 = 1u32;
let b: u32 = a + 5u32;
b \*= 2u32;

return b;

Commas
Trailing commas should be included whenever the closing delimiter appears on a separate line.

let a: A = A { x: 0, y: 1 };

let a: A = A {
x: 0,
y: 1,
};
