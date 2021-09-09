let add_lib_import jscode = "
var {
  _yieldCount,
  _yieldGranularity,
  _yield,
  _yieldCont_Default,
  _yieldCont,
} = require("./nodelib.js");
" ^ jscode

let save venv program outputFilename = 
  let _venv, code =
    (* let venv = Irtojs.VEnv.empty in *)
    Irtojs.Compiler.generate_program venv program
  in let jscode = Irtojs.Js_CodeGen.string_of_js code |> add_lib_import
  in let oc = open_out outputFilename in (* create or truncate file, return channel *)
    Printf.fprintf oc "%s" jscode; (* write something *)   
    close_out oc;                  (* flush and close the channel *)