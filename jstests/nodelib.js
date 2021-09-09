

// SCHEDULER
var _yieldCount = 0;
var _yieldGranularity = 60;

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
        return setZeroTimeout(function() { _current_pid = current_pid; return f(); });
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

// From compiler
var _yieldCont = _yieldCont_Default;

module.exports = {
  _yieldCount: _yieldCount,
  _yieldGranularity: _yieldGranularity,
  _yield: _yield,
  _yieldCont_Default: _yieldCont_Default,
  _yieldCont: _yieldCont,
};