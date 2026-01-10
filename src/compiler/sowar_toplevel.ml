open Js_of_ocaml
open Js_of_ocaml_toplevel

let execute_code code_str =
  let buffer = Buffer.create 100 in
  let formatter = Format.formatter_of_buffer buffer in
  JsooTop.initialize (); (* Initialize the toplevel environment *)
  try
    let _ = JsooTop.execute true formatter code_str in
    Buffer.contents buffer
  with e ->
    Printexc.to_string e

let () =
  (* Expose the function to the global 'window' object *)
  Js.export "ocaml"
    (object%js
       method run code = Js.string (execute_code (Js.to_string code))
    end)
