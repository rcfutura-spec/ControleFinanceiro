const MAX_HISTORY = 30

export function createUndoManager() {
  let history = []
  let pointer = -1

  return {
    push(snapshot) {
      // Discard any redo states
      history = history.slice(0, pointer + 1)
      history.push(snapshot)
      if (history.length > MAX_HISTORY) {
        history.shift()
      } else {
        pointer++
      }
    },

    undo() {
      if (pointer <= 0) return null
      pointer--
      return history[pointer]
    },

    redo() {
      if (pointer >= history.length - 1) return null
      pointer++
      return history[pointer]
    },

    canUndo() {
      return pointer > 0
    },

    canRedo() {
      return pointer < history.length - 1
    },

    clear() {
      history = []
      pointer = -1
    },

    getLength() {
      return history.length
    }
  }
}
