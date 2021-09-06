let save outputFilename program = 
  let _venv, code =
    let venv = Irtojs.VEnv.empty
    in  Irtojs.Compiler.generate_program venv program
  in let jscode = Irtojs.Js_CodeGen.string_of_js code
  in let oc = open_out outputFilename in (* create or truncate file, return channel *)
    Printf.fprintf oc "%s" jscode; (* write something *)   
    close_out oc;                  (* flush and close the channel *)