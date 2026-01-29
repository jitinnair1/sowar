(* This code is silently appended to the user's code *)
let () =
  let result1 = add_thirteen 7 in
  if result1 <> 20 then begin
    print_endline ("Test failed: add_thirteen 7 returned " ^ (string_of_int result1) ^ " but expected 20");
    failwith "Test failed"
  end else
    print_endline "✓ Test passed: add_thirteen 7 = 20";;

let () =
  let result2 = multiply_by_17 2 in
  if result2 <> 34 then begin
    print_endline ("Test failed: multiply_by_17 2 returned " ^ (string_of_int result2) ^ " but expected 34");
    failwith "Test failed"
  end else
    print_endline "✓ Test passed: multiply_by_17 2 = 34";;
