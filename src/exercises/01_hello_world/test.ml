(* This code is silently appended to the user's code *)
let () =
  print_newline (); (* Ensure we are on a new line *)
  print_endline "---TEST-START---";

  (* We capture output or check logic.
     Since we can't easily capture output inside OCaml without libraries,
     we might just check return values if the exercise allows,
     or rely on the runtime wrapper to capture stdout. *)

  match greet () with
  | () -> print_endline "PASS"
  | _ -> print_endline "FAIL"
