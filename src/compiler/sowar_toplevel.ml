open Js_of_ocaml
open Js_of_ocaml_toplevel

(* --- 1. GLOBAL STATE --- *)
(* We use ONE buffer for everything to ensure order is preserved *)
let global_buffer = Buffer.create 1024
let formatter = Format.formatter_of_buffer global_buffer

(* Track initialization state *)
let initialized = ref false

(* --- 2. INITIALIZATION ROUTINE --- *)
let init_env () =
  if not !initialized then begin
    (* FIX 1: Use Firebug.console for JS logging, not Console.log (which doesn't exist in OCaml) *)
    Firebug.console##log (Js.string "OCaml: Initializing Toplevel Environment...");
    
    JsooTop.initialize ();
    
    (* FIX 2: set_channel_flusher expects the channel to be flushed, NOT the stdout object directly *)
    (* It hooks into the internal OCaml runtime system handling of channels *)
    Sys_js.set_channel_flusher stdout (fun str ->
      Buffer.add_string global_buffer str
    );
    Sys_js.set_channel_flusher stderr (fun str ->
      Buffer.add_string global_buffer str
    );
    
    (* Redirect standard formatters to our buffer *)
    Format.set_formatter_out_channel stdout;
    
    initialized := true;
    Firebug.console##log (Js.string "OCaml: Ready.")
  end

(* --- 3. EXECUTION LOGIC --- *)
let execute code_js =
  init_env ();
  let code_str = Js.to_string code_js in
  
  (* Clear buffer for this run *)
  Buffer.clear global_buffer;

  (* A. Execute the code *)
  (* JsooTop.execute returns a bool (success/failure), not unit *)
  let _success = JsooTop.execute true formatter code_str in

  (* B. Force Flush to capture print_endline *)
  (* Important: Flush the formatter first, then the channels *)
  Format.pp_print_flush formatter ();
  flush stdout;
  flush stderr;

  (* C. Return the result *)
  Js.string (Buffer.contents global_buffer)

(* --- 4. EXPORT TO BROWSER --- *)
let () =
  Js.export "ocaml"
    (object%js
       method run code = execute code
    end)

