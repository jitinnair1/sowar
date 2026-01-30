let () =
  let result = average 2. 5. in
  if result <> 3.5 then begin
    Printf.printf "\nTest failed: average 2. 5. returned " ^ (string_of_float result) ^ " but expected 3.5";
    failwith "Test failed"
  end else
    Printf.printf "\nTest passed: average 2. 5. = 3.5";;