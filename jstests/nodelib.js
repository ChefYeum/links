/* LIST MANIPULATING FUNCTIONS */
const LINKEDLIST = (function () {

  return Object.freeze({


    Nil: null,

    isNil: function (n) { return n === null; },

    Cons: function (x, xs) { DEBUG.assert(LINKEDLIST.isLinkedList(xs), "Second argument must be linked list"); return { _head: x, _tail: xs }; },



    isLinkedList: function (v) {
      return LINKEDLIST.isNil(v) || v.hasOwnProperty("_head") && v.hasOwnProperty("_tail");
      //could test list-property recursively, but seems overly expensive
      //&& LINKEDLIST.isLinkedList(v._tail)

    },

    forEach: function (list, f) {
      while (!LINKEDLIST.isNil(list)) {
        let cur = list._head;
        f(cur);
        list = list._tail;
      }
    },

    map: function (list, f) {
      let cur = LINKEDLIST.singleton(null);
      const res = cur;
      while (!LINKEDLIST.isNil(list)) {
        cur._tail = LINKEDLIST.Cons(f(list._head), Nil);
        cur = cur.tail;
        list = list._tail;
      }
      return res._tail;
    },

    mapFromArray: function (array, f) {
      let cur = LINKEDLIST.singleton(null);
      const res = cur;
      for (let i = 0; i < array.length; i++) {
        cur._tail = LINKEDLIST.Cons(f(array[i]), Nil);
        cur = cur.tail;
        list = list._tail;
      }
      return res._tail;
    },

    toArray: function (list) {
      const res = [];
      let cur = list;
      while (!LINKEDLIST.isNil(cur)) {
        res[res.length] = cur._head;
        cur = cur._tail;
      }
      return res;
    },


    snoc: function (xs, x) { return LINKEDLIST.append(xs, LINKEDLIST.singleton(x)); },

    singleton: function (head) { return LINKEDLIST.Cons(head, Nil); },

    lsFromArray: function (arr) {
      let out = Nil;
      for (let i = arr.length - 1; i >= 0; --i) {
        out = LINKEDLIST.Cons(arr[i], out);
      }
      return out;
    },

    take: function (n, xs) {
      let arr = [];
      while (!LINKEDLIST.isNil(xs) && n > 0) {
        arr.push(xs._head);
        xs = xs._tail;
        --n;
      }
      return LINKEDLIST.lsFromArray(arr);
    },

    drop: function (n, xs) {
      while (!LINKEDLIST.isNil(xs) && n > 0) {
        xs = xs._tail;
        --n;
      }
      return xs;
    },

    length: function (xs) {
      let out = 0;
      while (!LINKEDLIST.isNil(xs)) {
        out += 1;
        xs = xs._tail;
      }
      return out;
    },

    equal: function (l, r) {
      let curL = l;
      let curR = r;
      while (!LINKEDLIST.isNil(curL) && !LINKEDLIST.isNil(curR)) {
        if (!LINKS.eq(curL._head, curR._head))
          return false;
        curL = curL._tail;
        curR = curR._tail;

      }
      return LINKEDLIST.isNil(curL) && LINKEDLIST.isNil(curR);
    },

    head: function (v) {
      DEBUG.assert(TYPES.isLinkedList(v), "Not a linked list");
      return LINKEDLIST.isNil(v) ? _error('head') : v._head;
    },

    tail: function (v) {
      DEBUG.assert(TYPES.isLinkedList(v), "Not a linked list");
      return LINKEDLIST.isNil(v) ? _error('tail') : v._tail;
    },

    last: function (xs) {
      if (LINKEDLIST.isNil(xs)) {
        return _error('last');
      }
      var out = xs._head;
      while (!LINKEDLIST.isNil(xs)) {
        out = xs._head;
        xs = xs._tail;
      }
      return out;
    },

    revAppend: function (xs, ys) {
      let out = ys;
      while (!LINKEDLIST.isNil(xs)) {
        out = LINKEDLIST.Cons(LINKEDLIST.head(xs), out);
        xs = LINKEDLIST.tail(xs);
      }
      return out;
    },

    append: function (xs, ys) {
      DEBUG.assert(TYPES.isLinkedList(xs) && TYPES.isLinkedList(ys), "Not linked lists");
      if (LINKEDLIST.isNil(xs)) {
        return ys;
      }
      const origxs = xs;
      const rootEl = _Cons(xs._head, Nil);
      let curr = rootEl;
      xs = xs._tail;
      while (!LINKEDLIST.isNil(xs)) {
        curr._tail = _Cons(xs._head, Nil);
        xs = xs._tail;
        curr = curr._tail;
      }
      curr._tail = ys;
      return rootEl;
    },


    at: function (xs, i) {
      let out = null;
      while (!LINKEDLIST.isNil(xs) && i >= 0) {
        out = xs._head;
        xs = xs._tail;
        --i;
      }
      // FIXME should check i / index out of bounds here
      return out;
    },

    empty: function (xs) {
      return LINKEDLIST.isNil(xs);
    },

    zip: function (xs, ys) {
      let arr = [];
      while (!LINKEDLIST.isNil(xs) && !LINKEDLIST.isNil(ys)) {
        arr.push({ "1": xs._head, "2": ys._head }); // { ctor:"_Tuple2", _0:x, _1:y }
        xs = xs._tail;
        ys = ys._tail;
      }
      return LINKEDLIST.lsFromArray(arr);
    },

    range: function (a, b) {
      let lst = Nil;
      if (a <= b) {
        do {
          lst = LINKEDLIST.Cons(b, lst);
        } while (b-- > a);
      }
      return lst;
    },

    replicate: function (n, item) {
      let out = Nil;
      while (n > 0) {
        out = LINKEDLIST.Cons(item, out);
        --n;
      }
      return out;
    },

    // faster than _replicate? not really?
    repeat: function (n, x) {
      let arr = [];
      let pattern = [x];
      while (n > 0) {
        if (n & 1) {
          arr = arr.concat(pattern);
        }
        n >>= 1;
        pattern = pattern.concat(pattern);
      }
      return LINKEDLIST.lsFromArray(arr);
    },

    // FIXME: max and min rely on '<' and '>', which
    // may not do the right thing for non-primitive types
    // (of course, we really want something like type classes
    // in order to be able to handle this kind of situation
    // more robustly)

    min: function (xs) {
      let currentMin = LINKEDLIST.head(xs);
      while (!LINKEDLIST.isNil(xs)) {
        if (xs._head < currentMin) currentMin = xs._head;
        xs = xs._tail;
      }
      return currentMin;
    },

    max: function (xs) {
      let currentMax = LINKEDLIST.head(xs);
      while (!LINKEDLIST.isNil(xs)) {
        if (xs._head > currentMax) currentMax = xs._head;
        xs = xs._tail;
      }
      return currentmax;
    },

    some: function (f, xs) {
      let ptr = xs;
      let found = false;
      while ((found || LINKEDLIST.isNil(ptr)) === false) {
        found = f(ptr._head);
        ptr = ptr._tail;
      }
      return found;
    }
  });
}());

// Set up optimised setZeroTimeout
// (function() {
var timeouts = [];

var messageName = "0TMsg";

function setZeroTimeout(fn) {
  timeouts.push(fn);
  // window.postMessage(messageName, "*");
}

function handleMessage(_event) {
  if (
    // _event.source == window &&
    _event.data == messageName
  ) {
    event = _event;
    _event.stopPropagation();

    if (timeouts.length > 0) {
      timeouts.shift()();
    }
  }
}

// window.addEventListener("message", handleMessage, true);

// window.setZeroTimeout = setZeroTimeout;
// })();


/**
 * Provides a number of type-checking functions
 */
const TYPES = {
  isUnit: function (val) { return (TYPES.isObject(val) && val.constructor === Object && Object.keys(val).length === 0); },
  isObject: function (val) { return (val && val instanceof Object && !Array.isArray(val)); },
  isNumber: function (val) { return (typeof val === 'number'); },
  isString: function (val) { return (typeof val === 'string'); },
  isBoolean: function (val) { return (typeof val === 'boolean'); },
  isXmlNode: function (val) {
    try {
      return (val instanceof Node);
    } catch (err) {
      return Boolean(val.nodeType);
    }
  },
  isArray: function (val) { return Array.isArray(val); },
  isLinkedList: LINKEDLIST.isLinkedList,
  isCharlist: function (val) { return (TYPES.isArray(val) && !val.some(function (c) { return !TYPES.isString(c); })); },
  isEvent: function (val) { return (val instanceof Event); },
  isTextnode: function (val) { return (TYPES.isXmlNode(val) && val.nodeType === document.TEXT_NODE); },
  isUndefined: function (val) { return (typeof val === 'undefined'); },
  isNull: function (val) { return (val === null); },
  isFunction: function (val) { return (typeof val === 'function'); },
  getType: function (val) {
    if (TYPES.isNumber(val)) return 'number';
    else if (TYPES.isString(val)) return 'string';
    else if (TYPES.isBoolean(val)) return 'boolean';
    else if (TYPES.isTextnode(val)) return 'textnode';
    else if (TYPES.isXmlnode(val)) return 'xmlnode';
    else if (TYPES.isArray(val)) return 'array';
    else if (TYPES.isLinkedList(val)) return 'linkedlist';
    else if (TYPES.isEvent(val)) return 'event';
    else if (TYPES.isUndefined(val)) return 'undefined';
    else if (TYPES.isNull(val)) return 'null';
    else if (typeof (val) == 'object' && 'constructor' in val) return new String(val.constructor); // makes garbage
    else return 'Unknown Type';
  }
};

/** A package of functions used internally, not callable from Links code. */
const LINKS = new (function () {

  var _formkey = null;

  /**
   * @TODO Doc
   *
   * @param {any} str
   * @returns
   */
  function _removeCGIArgs(str) {
    return str.replace(/\?.*/, "");
  }

  /**
   * Continue a thread at server after a client call has finished.
   *
   * @param {any} kappa local (client) continuation, for use when the server is really finished
   * @param {any} continuation server-side continuation which the server asked client to invoke it with
   * @param {any} mailbox
   */
  function _remoteContinue(kappa, continuation, mailbox) {
    return _makeCont(function (res) {
      DEBUG.debug('Continuing at server with value', res, 'and continuation', continuation);
      const request = new XMLHttpRequest();
      const rootUrl = _removeCGIArgs(location.href);

      request.open('POST', rootUrl);

      request.onreadystatechange = remoteCallHandler(kappa, request);

      request.setRequestHeader(
        'Content-Type',
        'application/x-www-form-urlencoded'
      );

      request.pid = _current_pid;

      const resultJSON = LINKS.stringify(res);

      return request.send(
        "__continuation=" + continuation +
        "&__result=" + LINKS.base64encode(resultJSON) +
        "&__client_id=" + LINKS.base64encode(_client_id)
      );
    });
  }

  /**
   * Resolve the JSON state for a top-level client program
   *
   * @param {any} state
   * @param {any} handlers
   */
  function _resolveJsonState(state, handlers) {
    for (let i in handlers) {
      const h = handlers[i];
      h.clientKey = _registerMobileKey(state, h.key);

      // Update nodes with the client keys
      const nodes = document.querySelectorAll('[key="' + h.key + '"]');
      Array.prototype.map.call(nodes, function (node) {
        node.setAttribute('key', h.clientKey);
      });
    }
    return;
  }


  /**
   * Register event handlers and spawn processes captured by the JSON
   * state for a top-level client program
   *
   * @param {any} state
   * @param {any} clientId
   * @param {any} processes
   * @param {any} handlers
   * @param {any} aps
   */
  function _activateJsonState(state, clientId, processes, handlers, aps, buffers) {
    // set client ID
    DEBUG.debug("Setting client ID to ", clientId);
    _client_id = clientId;

    // Register event handlers
    for (let i in handlers) {
      handlers[i].eventHandlers = resolveServerValue(state, handlers[i].eventHandlers);
      _registerMobileEventHandlers(handlers[i].clientKey, handlers[i].eventHandlers);
    }

    // Resolve and create mobile access points
    // Needs to be done before processes, since processes may (will!) reference
    for (let i in aps) {
      var ap = aps[i];
      newWithID(ap);
    }

    // Resolve and spawn the mobile processes
    for (let i in processes) {
      processes[i] = resolveServerValue(state, processes[i]);
      let p = processes[i];
      _spawnWithMessages(p.pid, p.process, p.messages);
    }

    for (let i in buffers) {
      let entry = buffers[i];
      let id = entry.buf_id;
      let buf = entry.values;
      for (let val in buf) {
        // TODO(dhil): Resolution of buffers currently depends on the
        // fact that resolveServerValue mutates `val` internally.
        resolveServerValue(state, val);
      }
      _buffers[id] = buf;
    }
    return;
  }

  /**
   * Resolve, spawn, and register, serialised client processes
   * received from the server
   *
   * it is important to do this is two stages as the process and message
   * values may themselves reference the mobile processes which must
   * have been registered
   *
   * @param {any} state
   * @param {any} processes
   * @param {any} handlers
   */
  function resolveMobileState(state, processes, handlers) {
    // register event handler keys
    for (let i in handlers) {
      handlers[i].clientKey = _registerMobileKey(state, handlers[i].key);
    }

    // register event handlers
    for (let i in handlers) {
      handlers[i].eventHandlers = resolveServerValue(state, handlers[i].eventHandlers);
      _registerMobileEventHandlers(handlers[i].clientKey, handlers[i].eventHandlers);
    }

    // resolve and spawn the mobile processes
    for (let i in processes) {
      processes[i] = resolveServerValue(state, processes[i]);
      let p = processes[i];
      _spawnWithMessages(p.pid, p.process, p.messages);
    }
    return;
  }


  /**
   * Resolve function references in the object `obj` and return the
   * updated `obj`. The `obj` is specified as records { function:f,
   * environment:e }, where the environment is optional. If an
   * environment is specified, we assume that the function denoted by
   * f is actually a wrapper and that f(e) is the desired function.
   * Without an environment, f itself denotes the desired function, a
   * standard CPS compiled Links function. This is recursive, so each
   * object in `obj` also has its functions resolved.
   *
   * NOTE due to the use of recursion, this function fails to resolve
   * deeply nested server values properly.
   *
   * @param {any} state
   * @param {any} obj
   * @return {any} obj
   */
  function resolveServerValue(state, obj) {
    if (obj._tag == null && obj.key != null) {
      obj.key = _lookupMobileKey(state, obj.key);
      return obj;
    }

    let tag = obj._tag;
    delete obj._tag;

    switch (tag) {
      case "Bool":
      case "Float":
      case "Int":
      case "String":
      case "Database":
      case "Table":
        return obj._value;
      case "Char":
      case "ClientDomRef":
      case "ClientAccessPoint":
      case "ServerAccessPoint":
      case "ClientPid":
      case "ServerPid":
      case "SessionChannel":
      case "ServerSpawnLoc":
      case "ClientSpawnLoc":
        return obj;
      case "XML":
        return resolveServerValue(state, obj._value);
      case "Text":
        return obj;
      case "NsNode":
        obj.children = resolveServerValue(state, obj.children);
        return obj;
      case "List":
        if (obj._head == null && obj._tail == null) return LINKEDLIST.Nil;

        obj._head = resolveServerValue(state, obj._head);
        obj._tail = resolveServerValue(state, obj._tail);
        return obj;
      case "Record":
        for (let k in obj)
          obj[k] = resolveServerValue(state, obj[k]);
        return obj;
      case "Variant":
        return { '_label': obj._label, '_value': resolveServerValue(state, obj._value) };
      case "FunctionPtr":
      case "ClientFunction":
        const f = (!TYPES.isObject(obj.environment)) ?
          eval(obj.func) :
          partialApply(eval(obj.func), resolveServerValue(state, obj.environment));
        f.location = obj.location; // This may be set to 'server' by the server serializer.
        f.func = obj.func;
        return f;
      case "Process":
        obj.process = resolveServerValue(state, obj.process);
        for (let k in obj.messages) {
          obj.messages[k] = resolveServerValue(state, obj.messages[k]);
        }
        return obj;
      default:
        throw "Unrecognised tag " + tag + " for object \"" + JSON.stringify(obj) + "\"";
    }
  }

  /**
   * @param {any[]} xs
   * @param {any} x
   * @returns {any[]} a new array with the elements of xs followed by x
   */
  function append(xs, x) {
    const out = new Array(xs.length + 1);
    xs.forEach(function (x, i) { out[i] = x; });
    out[xs.length] = x;
    return out;
  }

  /**
   * Perform a client call as specified in _callPackage, then re-invoke
   * the server using _remoteContinue
   * NOTE: variables defined within this function could shadow
   * the Links function we're trying to execute. Hence all local
   * vars are prefixed with underscore. Beware also of package variables
   * above shadowing.
   *
   * @param {any} kappa
   * @param {any} callPackage
   */
  function _invokeClientCall(kappa, callPackage) {
    DEBUG.debug('Invoking client call to ', callPackage.__name);
    DEBUG.debug('arguments: ', callPackage.__args);
    DEBUG.debug('arguments: ', callPackage.__args);

    // FIXME: the eval is redundant, because done in
    // remoteCallHandler; also this name may actually be a
    // closure-table reference, expecting "request" to be defined.
    const f = eval(callPackage.__name);

    const args = callPackage.__args;
    const k = _remoteContinue(
      kappa,
      callPackage.__continuation,
      _mailboxes[_current_pid] || []
    );

    return _yield(function () { return f.apply(f, append(args, k)); });
  }

  /**
   * remoteCallHandler is the trampoline that tunnels symmetrical
   * client-server calls over the request/response link.
   *
   * @param {any} kappa
   * @param {any} request
   * @returns
   */
  function remoteCallHandler(kappa, request) {
    return function () {
      if (request.readyState == CONSTANTS.AJAX.XHR_STATUS_IS_COMPLETE && !request.finished) {
        _current_pid = CONSTANTS.NO_PROCESS;

        // The 'finished' field guards against the callback being called more
        // than once on the same request object, an anomaly observed by EEKC.
        request.finished = true;

        DEBUG.debug("Server response: ", LINKS.base64decode(request.responseText));

        const serverResponse = LINKS.parseB64Safe(request.responseText);

        if (!serverResponse) {
          throw new Error("Fatal error: nonsense returned from server.");
        }

        // Any state that we need for resolving values
        // (currently just a mapping between server and client pids)
        const state = { mobileKeys: {} };

        if (serverResponse.content.hasOwnProperty("error")) {
          const gripe = serverResponse.content.error;
          throw new Error("Fatal error: call to server returned an error. Details: " + gripe);
        }

        resolveMobileState(
          state,
          serverResponse.content.state.processes,
          serverResponse.content.state.handlers
        );

        // Check whether we are bouncing the trampoline with a client call
        // or continuing with a final result.
        // TBD: Would be more elegant to use JS constructors instead of
        // using a signal member like __continuation.
        const callPackageOrServerValue = serverResponse.content.value;

        if ((callPackageOrServerValue instanceof Object) && ('__continuation' in callPackageOrServerValue)) {
          // callPackageOrServerValue is a call package.
          // Bouncing the trampoline

          DEBUG.debug("Client function name, before evaluation, is ", callPackageOrServerValue.__name);

          _current_pid = request.pid;
          // TODO(dhil): The call package should probably be tagged
          // such that we can supply it to resolveServerValue.
          // Resolve arguments.
          let args = callPackageOrServerValue.__args;
          for (let i = 0; i < args.length; i++) {
            args[i] = resolveServerValue(state, args[i]);
          }
          // TODO(dhil): The following is redundant at the moment, but
          // this is subject to change if/when we make
          // resolveServerValue purely functional.
          callPackageOrServerValue.__args = args;
          return _invokeClientCall(kappa, callPackageOrServerValue);
        } else {
          // callPackageOrServerValue is a server value
          const serverValue = resolveServerValue(state, callPackageOrServerValue);
          DEBUG.debug("Client continuing after remote server call, value ", serverValue);
          // it's the final result: return it.
          DEBUG.debug("Server response decoded: ", serverValue);
          return _applyCont(kappa, serverValue);
        }
      }
      return;
    };
  }

  var nextFuncID = 0;

  // Used to emulate DOMRef serialisation
  var domRefId = 0;
  var domRefs = {};

  function storeDomRef(ref) {
    const id = domRefId++;
    domRefs[id] = ref;
    return { _domRefKey: id };
  }


  function replacer(key, value) {
    DEBUG.debug("In replacer with key: ", key);
    DEBUG.debug("typeof value: ", typeof value);
    DEBUG.debug("value: ", value);

    if (typeof value === 'function') {
      if (value.location === 'server') {
        return {
          _serverFunc: value.func,
          _env: value.environment,
        };
      }
      const id = nextFuncID++;
      _closureTable[id] = function (env) { return value; };

      return { _closureTable: id };
    } else if ( // SL: HACK for sending XML to the server
      key !== '_xml' &&
      _isXmlItem(value)
    ) {
      return { _xml: value };
    } else if (value === Nil) {
      return Nil;
    } else if (value.nodeType !== undefined) {
      return storeDomRef(value);
    }
    return value;
  }

  const LINKS = {
    resolveJsonState: function (s) {
      const state = { mobileKeys: {} };
      _resolveJsonState(state, s.handlers);
      return state;
    },

    activateJsonState: function (state, s) {
      return _activateJsonState(state, s.client_id, s.processes, s.handlers, s.access_points, s.buffers);
    },

    resolveValue: function (state, v) {
      return resolveServerValue(state, v);
    },

    // JS uses UCS2 internally.
    // The (un)escape / URI nonsense converts back and forth between UCS2 and UTF-8
    // The btoa / atob methods convert back and forth between UTF-8 and base 64.
    base64encode: function (s) {
      return btoa(unescape(encodeURIComponent(s)));
    },

    base64decode: function (s) {
      return decodeURIComponent(escape(atob(s)));
    },

    unimpl: function (name) { throw new Error('Fatal error: function ' + name + ' not available on client.'); },

    /**
     * Turns a direct-style js function into a continuationized one under the
     * Links calling conventions. "trivial" means it cannot call back to a
     * Links function, and that the scheduler can safely be suspended
     * while it runs.
     */
    kify: function (f) {
      return function () {
        const kappa = arguments[arguments.length - 1];
        const args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
        return _applyCont(kappa, f.apply(f, args));
      };
    },


    eq: undefined,

    /**
     * String concatenation
     * @param {string} s1
     * @param {string} s2
     * @returns {string}
     */
    jsStrConcat: function (s1, s2) { return s1 + s2; },

    /**
     * Concatenate two lists
     * @param {any[]} l
     * @param {any[]} r
     */
    concat: function (l, r) { return l.concat(r); },

    /**
     * Concatenate multiple lists
     * @param {any[][]} lists
     */
    concatList: function (lists) { return [].concat(...lists); },

    singleXmlToDomNodes: undefined,

    map: function (f, list) { return list.map(f); },

    /*
      Implictly converts from linked list to JS Array, use with caution!
    */
    XmlToDomNodes: function (xmlForest) {
      DEBUG.assert(
        TYPES.isLinkedList(xmlForest),
        'LINKS.XmlToDomNodes expected a linked list, but got ',
        xmlForest
      );
      var domNodeArray = [];
      LINKEDLIST.forEach(xmlForest, function (xmlNode) {
        domNodeArray.push(LINKS.singleXmlToDomNodes(xmlNode));
      });
      return domNodeArray;
    },

    /**
     * Create a an XML value representation
     * @param {string} tag
     * @param {{ [attr: string]: string }} attr
     * @param { } body (linked list)
     */
    XML: function (tag, attrs, body) {
      var children = Nil;
      LINKEDLIST.forEach(body, function (e) {
        if (TYPES.isLinkedList(e)) {
          children = LINKEDLIST.append(children, e);
        } else {
          children = LINKEDLIST.snoc(children, e);
        }
      });
      return _Cons(
        {
          type: 'ELEMENT',
          tagName: tag,
          attrs: attrs,
          children: children
        },
        Nil);
    },


    // Records

    /**
     * Compute the union of dictionaries r and s
     * Precondition: r and s are disjoint
     */
    union: function (r, s) {
      return Object.assign({}, r, s);
    },

    /**
     * Project a field of a record
     * @param {Object} object
     * @param {any} name
     * @returns {any}
     */
    project: function (object, name) { return object[name]; },

    /**
     * Erase one ore more fields of a record.
     *
     * @param {Object} r
     * @param linkedlist labels
     * @returns {Object}
     */
    erase: function (r, labels) {
      let s = {};
      let ls = new Set();
      LINKEDLIST.forEach(labels, function (l) { return ls.add(l); });

      for (let l in r) {
        if (ls.has(l)) continue;
        else s[l] = r[l];
      }
      return s;
    },

    vrntLbl: function (o) { return o['_label']; },
    vrntVal: function (o) { return o['_value']; },

    deliverMessage: function (pid, msg) {
      if (!_mailboxes[pid]) {
        _makeMailbox(pid);
      }
      _mailboxes[pid].unshift(msg);
      _wakeup(pid);
      return DEBUG.debug(pid, ' now has ', _mailboxes[pid].length, ' message(s)');
    },

    // Remote calls

    remoteCall: function (kappa) {
      return function (name, env, args) {
        DEBUG.debug("Making remote call to: ", name);
        const currentPID = _current_pid;

        // setpid_kappa: Re-establish the process identifier and continue
        // with kappa.
        const setpidKappa = _makeCont(function (response) {
          _current_pid = currentPID;
          _applyCont(kappa, response);
        });

        const request = new XMLHttpRequest();

        // Posting to location.href works in both Firefox and IE
        // (unlike posting to '#', which IE mistakenly urlencodes as %23)
        request.open('POST', location.href);
        request.setRequestHeader(
          'Content-Type',
          'application/x-www-form-urlencoded'
        );

        request.onreadystatechange = remoteCallHandler(setpidKappa, request);

        request.pid = _current_pid;
        const argsJSON = LINKS.stringify(args);

        // TODO: get rid of env - this should be handled by closure conversion

        if (!env) {
          env = {};
        }

        const envJSON = LINKS.stringify(env);

        // request.funcs = _compose(argsJSON.funcs, envJSON.funcs);

        var argString =
          "__name=" + LINKS.base64encode(name) +
          "&__args=" + LINKS.base64encode(argsJSON) +
          "&__env=" + LINKS.base64encode(envJSON) +
          "&__client_id=" + LINKS.base64encode(_client_id);

        for (var i = 0; i < cgiEnv.length; ++i) {
          argString = argString + "&" + cgiEnv[i][1] + "=" + cgiEnv[i][2];
        };

        return request.send(argString);
      };
    },

    /**
     * Return the input value for the
     * input field whose name is 'name' in the current form
     * (identified by formkey)
     */
    fieldVal: function (name) {
      const forms = document.getElementsByTagName('form');
      var containingForm = null;

      // find the containing form
      for (let i = 0; i < forms.length; ++i) {
        const key = forms[i].getAttribute('key');
        if (key === formkey) {
          containingForm = forms[i];
          break;
        }
      }

      DEBUG.assert(Boolean(containingForm), "Form does not exist!");

      // find the input value
      const xs = document.getElementsByName(name);
      for (var i = 0; i < xs.length; ++i) {
        const node = xs[i];
        while (node) {
          if (node == containingForm) {
            return xs[i].value;
          }
          node = node.parentNode;
        }
      }

      return DEBUG.assert(false, "Form element with name '" + name + "' does not exist!");
    },

    /**
     * apply f to every node in the DOM tree rooted at root
     *
     * NOTE:
     * appDom is deliberately defined non-recursively as
     * JavaScript implementations have very ropey support
     * for recursive functions.
     *
     * It is implemented as a state machine that traverses
     * the tree.
     */
    appDom: function (root, f) {
      var down = 1;
      var right = 2;
      var up = 3;

      f(root);
      if (!root.firstChild)
        return;
      var node = root.firstChild;
      var direction = down;
      while (node != root) {
        switch (direction) {
          case down:
            f(node);
            if (node.firstChild) {
              node = node.firstChild;
              direction = down;
            } else {
              direction = right;
            }
            break;
          case right:
            if (node.nextSibling) {
              node = node.nextSibling;
              direction = down;
            } else {
              direction = up;
            }
            break;
          case up:
            node = node.parentNode;
            direction = right;
            break;
        }
      }
      return;
    },

    /**
     * Bind all handlers to the DOM node
     * @param {ElementNode} node
     */
    activateHandlers: function (node) {
      if (!isElement(node)) {
        return;
      }

      function activate(node) {
        if (!isElement(node)) {
          return;
        }

        const key = node.getAttribute('key');
        if (key) {
          const handlers = _eventHandlers[key];
          Object.keys(handlers || {}).forEach(function (event) {
            const target = event.match(/page$/) ? document.documentElement : node;
            const eventName = event.replace(/page$/, "").replace(/^on/, "");
            return target.addEventListener(eventName, function (e) {
              _formkey = key;
              var temp = handlers[event];
              temp(e);
              e.stopPropagation();
              return e.preventDefault();
            }, false);
          });
        }
      }

      return LINKS.appDom(node, activate);
    },

    stringify: function (v) {
      DEBUG.debug("stringifying: ", v);
      const t = JSON.stringify(v, replacer);
      DEBUG.debug("stringified: ", t);
      if (typeof t === 'string') {
        return t;
      }
      throw new Error("Internal error: unable to JSONize " + v);
    },

    stringifyB64: function (v) { return LINKS.b64encode(LINKS.stringify(v)); },
    parseB64: function (text) { return { content: JSON.parse(LINKS.base64decode(text)) }; },
    parseB64Safe: function (text) { return LINKS.parseB64(text.replace('\n', '')); },
  };


  LINKS.singleXmlToDomNodes = function (xmlObj) {
    DEBUG.assert(
      _isXmlItem(xmlObj),
      'LINKS.singleXmlToDomNodes expected a XmlItem, but got ' + xmlObj
    );

    const type = xmlObj.type;
    switch (type) {
      case 'ELEMENT':
        const tagName = xmlObj.tagName;
        const attributes = xmlObj.attrs;
        const children = xmlObj.children !== undefined ? LINKEDLIST.toArray(xmlObj.children) : [];
        const namespace = xmlObj.namespace;

        const node = namespace ?
          document.createElementNS(namespace, tagName) :
          document.createElement(tagName);

        Object.keys(attributes).forEach(function (k) {
          const splitRes = k.split(':');

          if (splitRes.length === 1) {
            const name = splitRes[0];
            node.setAttribute(name, attributes[k]);
          } else if (splitRes.length === 2) {
            const ns = splitRes[0];
            const name = splitRes[1];
            node.setAttributeNS(ns, name, attributes[k]);
          } else {
            throw new Error('attribute names can contain one or no colon. `' + k + '` found.');
          }
        });
        if (xmlObj.children) {
          LINKEDLIST.forEach(xmlObj.children, function (c) {
            node.appendChild(LINKS.singleXmlToDomNodes(c));
          });
        }

        return node;
      case 'TEXT':
        return document.createTextNode(xmlObj.text || '');
      default:
        return null;
    }
  };

  LINKS.eq = function (l, r) {
    if (l == r)
      return true;

    if (l == null)
      return (r == null);
    else if (r == null)
      return false;

    if (TYPES.isUnit(l) && TYPES.isUnit(r))
      return true;

    if (TYPES.isArray(l) && l != null &&
      TYPES.isArray(r) && r != null) {
      if (l.length != r.length)
        return false;

      for (var i = 0; i < l.length; ++i) {
        if (!LINKS.eq(l[i], r[i])) return false;
      }

      return true;
    }
    if (TYPES.isLinkedList(l) && l != null &&
      TYPES.isLinkedList(r) && r != null) {
      return LINKEDLIST.equal(l, r);
    }
    else if (typeof (l) == 'object' && l != undefined && l != null &&
      typeof (r) == 'object' && r != undefined && r != null) {
      if (l.constructor != r.constructor)
        return false;

      // DODGEYNESS:
      //   - it isn't clear that structural equality is always the same as
      //   referential equality for DOM nodes

      for (let p in l) {
        if (!LINKS.eq(l[p], r[p])) {
          return false;
        }
      }
      for (let p in r) {
        if (!LINKS.eq(l[p], r[p]))
          return false;
      }
      return true;
    }
    return false;
  };

  return LINKS;
})();

// var _maxPid = 0;             // the highest process id allocated so far
var _mainPid = "MAIN";       // the process id of the main process
var _current_pid = _mainPid; // the process id of the currently active process
var _client_id = undefined;  // the unique ID given to this client
// var _socket = undefined;     // reference to the websocket used to communicate with the server
var _handlingEvent = false;
// var _aps = [];                // list of active client access points
// var _returned_channels = {};  // channels that have been returned from an AP request.
// blocked PID |-> returned channel EP.
var _closureTable = {};

var _current_pid = _mainPid; // the process id of the currently active process
var _handlingEvent = false;

// SCHEDULER

var _yieldCount = 0;
var _yieldGranularity = 60;
// var _callCount = 0;

function _Continuation(v) { this.v = v; return; }

var _theContinuation = new _Continuation(LINKS._removeCGIArgs);


// yield: give up control for another "thread" to work.
// if we're running in an event handler then don't yield (but
// do throw away the stack periodically instead).
function _yield(f) {
  ++_yieldCount;
  if (_yieldCount == _yieldGranularity) {
    _yieldCount = 0;
    if (_handlingEvent) {
      _theContinuation.v = f; throw _theContinuation;
    } else {
      var current_pid = _current_pid;
      return setZeroTimeout(function () { _current_pid = current_pid; return f(); });
    }
  } else {
    return f();
  }
}

function _yieldCont_Default(k, arg) {
  ++_yieldCount;
  if (_yieldCount == _yieldGranularity) {
    _yieldCount = 0;
    if (_handlingEvent) {
      _theContinuation.v = function () { return k(arg); }; throw _theContinuation;
    } else {
      var current_pid = _current_pid;
      return setZeroTimeout(function () { _current_pid = current_pid; return k(arg); });
    }
  } else {
    return k(arg);
  }
}

function _applyCont_Default(k, arg) { return k(arg); }

function _yieldCont_HO(ks, arg) {
  var k = _hd(ks);
  var ks = _tl(ks);
  ++_yieldCount;
  if (_yieldCount == _yieldGranularity) {
    _yieldCount = 0;
    if (_handlingEvent) {
      _theContinuation.v = function () { return k(arg, ks); }; throw _theContinuation;
    } else {
      var current_pid = _current_pid;
      return setZeroTimeout(function () { _current_pid = current_pid; return k(arg, ks); });
    }
  } else {
    return k(arg, ks);
  }
}

// function _applyCont_HO(ks, arg) {
//   var k = _hd(ks);
//   var ks = _tl(ks);

//   return k(arg, ks);
// }

// From compiler
var _yieldCont = _yieldCont_Default;

// function _makeCont(k) { return k; } ;
// var _idy = function (x) { return; }; ;
var _applyCont = _applyCont_Default;
// var _yieldCont = _yieldCont_Default;;
// var _cont_kind = "Default_Continuation";
// function is_continuation(value) { return value != undefined && (typeof value == 'function' || value instanceof Object && value.constructor == Function); } \n" ;
// var receive = _default_receive;

var _intToString = function (x) { return String(x); };
var _stringToInt = function (x) { return parseInt(x); };
var _intToFloat = Number;
var _floatToInt = Math.floor;
var _floatToString = function (x) { return String(x); };
var _stringToFloat = function (x) { return parseFloat(x); };

module.exports = {
  _yieldCount: _yieldCount,
  _yieldGranularity: _yieldGranularity,
  _yield: _yield,
  _yieldCont_Default: _yieldCont_Default,
  _yieldCont: _yieldCont,
  LINKS: LINKS,
  TYPES: TYPES,
  LINKEDLIST: LINKEDLIST,
  _applyCont: _applyCont,
  _intToString: _intToString,
  setZeroTimeout: setZeroTimeout,
  _print: function _print(...str) {
    console.info(...str);
    return 0;
  }
};
