let code = "console.log('Hello World'))"

(* Write code to file *)
let save outputFilename = 
  let oc = open_out outputFilename in (* create or truncate file, return channel *)
    Printf.fprintf oc "%s\n" code; (* write something *)   
    close_out oc;                  (* flush and close the channel *)