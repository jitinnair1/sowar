open Js_of_ocaml
open Js_of_ocaml_toplevel

(* --- 1. TYPED JS BINDINGS --- *)
class type console = object
  method log : Js.js_string Js.t -> unit Js.meth
  method error : Js.js_string Js.t -> unit Js.meth
end
let console : console Js.t = Js.Unsafe.global##.console
let log s = console##log (Js.string s)

(* --- 2. STATE --- *)
let stdout_buffer = Buffer.create 1024
let stderr_buffer = Buffer.create 1024
let formatter = Format.formatter_of_buffer stdout_buffer
let initialized = ref false

(* --- 3. INIT --- *)
let init_env () =
  if not !initialized then begin
    log "OCaml: Initializing...";
    JsooTop.initialize ();

    (* Separate stdout and stderr capture *)
    Sys_js.set_channel_flusher stdout (Buffer.add_string stdout_buffer);
    Sys_js.set_channel_flusher stderr (Buffer.add_string stderr_buffer);

    Format.set_formatter_out_channel stdout;

    initialized := true;
    log "OCaml: Ready."
  end

  (* Define the return type explicitly *)
  class type compiler_result = object
  method out : Js.js_string Js.t Js.readonly_prop
  method err : Js.js_string Js.t Js.readonly_prop
  method success : bool Js.t Js.readonly_prop
  end

(* Helper to create the object *)
let make_result o e s : compiler_result Js.t =
  object%js
  val out = Js.string o
    val err = Js.string e
    val success = Js.bool s
  end

(* --- 4. EXECUTION --- *)
let execute code_js : compiler_result Js.t =
  log "DEBUG: Starting execute..."; (* <--- ADD THIS *)
  init_env ();
  let code = Js.to_string code_js in

  Buffer.clear stdout_buffer;
  Buffer.clear stderr_buffer;

  try
    log "DEBUG: About to call JsooTop.execute"; (* <--- ADD THIS *)
    let () = JsooTop.execute true formatter code in
    log "DEBUG: JsooTop.execute finished"; (* <--- ADD THIS *)

    Format.pp_print_flush formatter ();
    flush stdout;
    flush stderr;

    let out_str = Buffer.contents stdout_buffer in
    let err_str = Buffer.contents stderr_buffer in
    (* Determine success based on stderr emptiness *)
    let is_success = (String.length err_str) = 0 in

    make_result out_str err_str is_success

  with e ->
    let msg = Printexc.to_string e in
    log ("DEBUG: Exception caught: " ^ msg); (* <--- ADD THIS *)
    object%js
      val out = Js.string ""
      val err = Js.string ("Compiler Crash: " ^ msg)
      val success = Js.bool false
    end

(* --- 5. EXPORT --- *)
let () =
  Js.export "ocaml"
    (object%js
       (* Explicitly annotate the method return type *)
       method run (code : Js.js_string Js.t) : compiler_result Js.t =
         execute code
    end)
