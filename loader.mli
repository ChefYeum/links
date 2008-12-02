type envs = Var.var Env.String.t * Types.typing_environment
type program = Ir.binding list * Ir.computation * Types.datatype

val load_file : envs -> string -> envs * program
val precompile_cache : envs -> string -> unit