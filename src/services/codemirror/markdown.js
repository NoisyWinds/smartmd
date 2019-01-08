import CodeMirror from "codemirror"
import "codemirror/addon/mode/overlay"

/**
 * extand codemirror markdown mode for future.
 */

function getType(state) {
  if (state.math) return "math";
  if (state.emoji) return "emoji";
  return null;
}

function startState() {
  return {
    math: 0
  }
}

function copyState(s) {
  return {
    math: s.math
  }
}

function token(stream, state) {
  let ch = stream.next();
  if (ch === "$") {
    stream.eatWhile('$');
    let count = stream.current().length;
    if (state.math === 0) {
      state.math = count;
      return getType(state);
    } else if (count === state.math) {
      // close math
      let t = getType(state);
      state.math = 0;
      return t;
    }
  }
  if (ch === ":" && stream.match(/^[^: \\/?'"]+:/)) {
     return "emoji";
  }
  return getType(state);
}

CodeMirror.defineMode("smartmd", function (config) {
  return CodeMirror.overlayMode(CodeMirror.getMode(config, "markdown"), {
    startState,
    token,
    copyState
  });
});
