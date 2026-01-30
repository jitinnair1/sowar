(* This code is silently appended to the user's code *)
let () =
  let result1 = add_thirteen 7 in
  if result1 <> 20 then begin
    Printf.printf "\nTest failed: add_thirteen 7 returned %d but expected 20\n\n" result1;
    failwith "Test failed"
  end else
    Printf.printf "\nTest passed: add_thirteen 7 = 20\n";;

let () =
  let result2 = multiply_by_17 2 in
  if result2 <> 34 then begin
    Printf.printf "\nTest failed: multiply_by_17 2 returned %d but expected 34\n\n" result2;
    failwith "Test failed"
  end else
    Printf.printf "\nTest passed: multiply_by_17 2 = 34\n";;
