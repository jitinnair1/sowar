We looked at the `let` keyword earlier. But there's something fundamentally different about how OCaml treats functions compared to C-style languages.

Say you want to process a list of numbers - add 5 to some, multiply by 2 for others. In C with function pointers, you might write something like:

```c
int add_five(int x) { return x + 5; }
int add_ten(int x) { return x + 10; }

void process(int* arr, int len, int (*fn)(int)) {
    for(int i = 0; i < len; i++) {
        arr[i] = fn(arr[i]);
    }
}

process(arr, len, add_five);
```
But now, say you wanted to process the list with additional similar functions (likesay `add_ten`). For this, you'd have to write a new function that does this and then call it with `process` like this:

```c
...
process(arr, len, add_five);

//now add ten
process(arr, len, add_ten);
```

So what if you could build up  `add_ten` and `add_five` from a general `add` function?

## Currying

In OCaml, when you write something like:

```ocaml
let sum x y = x + y;;
```
Here, technically, `sum` is not a function that takes two arguments. It builds up like this: When you call `sum 1 2`, what actually happens is, `sum 1` returns a new function that adds 1 to its argument.

Now, that new function is immediately called with `2` as its argument which gives the result `3`.

This is called currying (names after Haskell Curry) and what this means is technically, every function in Ocaml takes exactly one argument. So multi-argument functions are essentially just syntactic sugar.

But why do this? What benefits does this give us?

## Partial Application

Since multi-argument functions are built up via currying, if we provide fewer argumnets than a function expects, we get a perfectly usable function back.

Again, we can compare this with C-styled languages. If we had a multi-argument function, we would need all argumnets to call it.

Well, this idea, called partial application can be useful in creating specialised functions without wrappers as we saw earlier.

If we already had `add` and `multiply` functions, we could we could create specialised functions by partail application like this:

```ocaml
let add x y = x + y;;
let multiply x y = x * y;;

(* now we can create specialized functions *)
let add_five = add 5;;
let multiply_by_two = multiply 2;;
```
Notice how although `add` requires two arguments, we can define `add_five` as a derived function of add but it just adds 5 to its input.

While this example is a bit silly, the point was to intoduce the way in which currying and partial application work.

# Problem Statement

Given two functions, `add` and `multiply`, create a function `add_thirteen` and a function `multiply_by_17`
