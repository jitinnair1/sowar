This series of exercises takes you through the basic syntax and concepts of OCaml. All exercies can be run right here in your browser.

We start with the basics and build up to the more advanced concepts. The objective is to write a (very simple) clone of FFTW[^1] in OCaml.

[^1]: Fastest Fourier Transform in the West!

(Fun fact, while FFTW is a C library, the core `genfft` part is written in OCaml)

If you're coming from C-styled languages, the functional style might take some time to get used to. But no worries, we'll get there. For now, let's start with the classic "Hello World" program.

In OCaml, the `print_endline` function is used to print to the console. So, to print a message you would use something like:

```ocaml
print_endline "some message";;
```
Now, when writing code in an OCaml script, you generally use a single semicolon (;) to sequence commands or simply rely on the compiler's structure.

However, in the in-browser environment (like we're using here), you must use double semicolons (;;) to signal to the interpreter that you have finished your expression and want it evaluated.

Now, check if the code in the exercise window looks alright and fix it if needed. Then, you can user the `Run` button to run the code.

# Problem Statement

Use `print_endline` to print out "Hello, world!"

