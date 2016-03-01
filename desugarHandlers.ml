open Utility
open Sugartypes

(*

 [open] [shallow]handler(m) {
    case Op_i(p_i,k_i) -> ...
    case Return(x) -> ...
  } 
  =>
  fun(m) {
    handle(m) {
      case Op_i(p_i,k_i) -> ...
      case Return(x) -> ...
    }
  }

*)


let dp = Sugartypes.dummy_position

(* Computes the set of names in a given pattern *)
let rec names : pattern -> string list
  = fun (pat,_) ->
    match pat with
      `Variant (_,pat_opt) -> opt_app names [] pat_opt
    | `Record (name_pats,pat_opt) ->
       let optns = opt_app names [] pat_opt in
       (List.fold_left (fun ns p -> (names p) @ ns) [] (List.map snd name_pats)) @ optns
    | `Variable (name,_,_)        -> [name]
    | `Cons (pat,pat')            -> (names pat) @ (names pat')
    | `Tuple pats
    | `List pats                  -> List.fold_left (fun ns pat -> (names pat) @ ns ) [] pats   
    | `Negative ns'               -> List.fold_left (fun ns n -> n :: ns) [] ns'
    | `As  ((name,_,_),pat)       -> [name] @ (names pat)
    | _                           -> []

(* This function resolves name conflicts in a given pattern p.
   The conflict resolution is simple: 
   Given a set of conflicting names ns, then for every name n if (n \in p && n \in ns) then n gets rewritten as _.
 *)       
let resolve_name_conflicts : pattern -> stringset -> pattern
  = fun pat conflicts ->
    let rec hide_names : pattern -> pattern
      = fun (pat,pos) ->
	(begin
	  match pat with
	  | `Variant (label, pat_opt)    -> `Variant (label, opt_map hide_names pat_opt)
	  | `Record (name_pats, pat_opt) -> `Record  (List.map (fun (label, pat) -> (label, hide_names pat)) name_pats, opt_map hide_names pat_opt)
	  | `Variable (name,_,_)         ->
	     if StringSet.mem name conflicts
	     then `Any
	     else pat
	  | `Cons (pat, pat')            -> `Cons (hide_names pat, hide_names pat')
	  | `Tuple pats                  -> `Tuple (List.map hide_names pats)
	  | `List pats                   -> `List (List.map hide_names pats)
	  | `Negative names              -> failwith "desugarHandlers.ml: hide_names `Negative not yet implemented"
	  | `As ((name,t,pos') as n,pat) -> let (p,_) as pat = hide_names pat in
					    if StringSet.mem name conflicts
					    then p
					    else `As (n, pat)
	  | _ -> pat
	 end
	   , pos)
    in hide_names pat
    
(* This function parameterises each clause computation, e.g.
 fun(m)(s) {
   handle(m) {
     case Op_i(p,k) -> M
     case Return(x) -> N
   }
 } =>
 fun(m)(s) {
   handle(m) {
     case Op_i(p,k) -> fun(s) { M }
     case Return(x) -> fun(s) { N }
   }
 }
 Furthermore, the function resolves name conflicts between clause-parameters 
 and the parameters of the introduced functions which encompass clause bodies. Currently,
 the clause-parameters shadow the introduced function parameters.
*)
let parameterize : (pattern * phrase) list -> pattern list option -> (pattern * phrase) list 
  = fun cases params ->
  let wrap_fun params body =
    (`FunLit (None, `Unl, (params, body), `Unknown), dp)
  in
  match params with
    None
  | Some [] -> cases
  | Some params ->
     List.map (fun (pat, body) ->
       let name_conflicts =
	 let param_names = List.concat (List.map names params) in
	 let pat_names   = names pat in
	 StringSet.inter (StringSet.from_list pat_names) (StringSet.from_list param_names)
       in
       let params = List.map (fun p -> resolve_name_conflicts p name_conflicts) params in
       (pat, wrap_fun [params] body)
     ) cases
  

let dummy_name = 0
let name_counter = ref dummy_name
let fresh_name : unit -> name =
  fun () ->
    incr name_counter;
    "__THIS_IS_A_GENERATED_NAME" ^ (string_of_int !name_counter)

(* This function assigns fresh names to `Any (_) *)
let rec deanonymize : pattern -> pattern
  = fun (pat, pos) ->
    (begin
      match pat with
	`Any                         -> `Variable (fresh_name (), None, dp)
      | `Nil                         -> `Nil
      | `Cons (p, p')                -> `Cons (deanonymize p, deanonymize p')
      | `List ps                     -> `List (List.map deanonymize ps)
      | `Variant (name, pat_opt)     -> `Variant (name, opt_map deanonymize pat_opt)
      | `Negative ns                 -> `Negative ns
      | `Record (name_pats, pat_opt) -> `Record (List.map (fun (n,p) -> (n, deanonymize p)) name_pats, opt_map deanonymize pat_opt)
      | `Tuple ps                    -> `Tuple (List.map deanonymize ps)
      | `Constant c                  -> `Constant c
      | `Variable b                  -> `Variable b
      | `As (b,p)                    -> `As (b, deanonymize p)
      | `HasType (p,t)               -> `HasType (deanonymize p, t)
     end, pos)

(* This function translates a pattern into a phrase. It assumes that the given pattern has been deanonymised. *)      
let rec phrase_of_pattern : pattern -> phrase
  = fun (pat,pos) ->
    (begin
      match pat with
	`Any                         -> assert false (* can never happen after the fresh name generation pass *)
      | `Nil                         -> `ListLit ([], None)
      | `Cons (hd, tl)               -> `InfixAppl (([], `Cons), phrase_of_pattern hd, phrase_of_pattern tl) (* x :: xs => (phrase_of_pattern x) :: (phrase_of_pattern xs) *)
      | `List ps                     -> `ListLit (List.map phrase_of_pattern ps, None)
      | `Variant (name, pat_opt)     -> `ConstructorLit (name, opt_map phrase_of_pattern pat_opt, None)
      | `Negative ns                 -> failwith "desugarHandlers.ml: phrase_of_pattern case for `Negative not yet implemented!"
      | `Record (name_pats, pat_opt) -> `RecordLit (List.map (fun (n,p) -> (n, phrase_of_pattern p)) name_pats, opt_map phrase_of_pattern pat_opt)
      | `Tuple ps                    -> `TupleLit (List.map phrase_of_pattern ps)
      | `Constant c                  -> `Constant c
      | `Variable b                  -> `Var (fst3 b)
      | `As (b,_)                    -> `Var (fst3 b)
      | `HasType (p,t)               -> `TypeAnnotation (phrase_of_pattern p, t)
    end, pos)
       
let make_handle : Sugartypes.handlerlit -> Sugartypes.hdescriptor -> Sugartypes.funlit
  = fun (m, cases, params) desc ->
    let pos = snd m in
    let m    = deanonymize m in
    let comp = phrase_of_pattern m in
    let cases = parameterize cases params in
    let handle : phrase = `Block ([], (`Handle (comp, cases, desc), pos)),pos in  
    let params = opt_map (List.map deanonymize) params in
    let body  =
      match params with
	None -> handle
      | Some params ->
	 let params = List.map phrase_of_pattern params in
	 `FnAppl (handle, params),dp
    in
    let fnparams : pattern list list =
      if HandlerUtils.HandlerDescriptor.is_closed desc
      then []
      else [[]]
    in
    let fnparams = 
      match params with
	Some params -> params :: ([m] :: fnparams)
      | None -> [m] :: fnparams
    in
    let fnlit = (fnparams, body) in
    fnlit
			     
let desugar_handlers_early =
object
  inherit SugarTraversals.map as super
  method phrasenode = function
    | `HandlerLit (spec, hnlit) ->      
       let handle = make_handle hnlit (spec,None) in
       let funlit : Sugartypes.phrasenode = `FunLit (None, `Unl, handle, `Unknown) in
       super#phrasenode funlit
    | e -> super#phrasenode e

  method bindingnode = function
    | `Handler (binder, spec, hnlit, annotation) ->
       let handle  = make_handle hnlit (spec,None) in
       `Fun (binder, `Unl, ([], handle), `Unknown, annotation)
    | b -> super#bindingnode b
end