/**
 * Author: Stefan Haack (https://shaack.com)
 * Date: 2023-11-12
 */
export class MdEditor {

    constructor(element) {
        this.element = element
        this.undoRedoManager = new UndoRedoManager()

        this.saveState()
        // listen to typing
        this.element.addEventListener('keydown', (e) => this.handleKeyDown(e))
        this.element.addEventListener('input', () => {
            this.saveState()
        })
    }

    saveState() {
        const currentState = this.element.value
        const execute = (state) => this.element.value = state
        const unexecute = (state) => this.element.value = state
        const command = new Command(execute, unexecute, currentState)
        this.undoRedoManager.execute(command)
    }

    setValue(value) {
        this.element.value = value
        let event = new Event('input', {
            bubbles: true,
            cancelable: true,
        })
        this.element.dispatchEvent(event)
    }

    handleKeyDown(e) {
        const start = this.element.selectionStart
        const end = this.element.selectionEnd
        const before = this.element.value.substring(0, start)
        const selected = this.element.value.substring(start, end)
        const after = this.element.value.substring(end)
        const currentLine = before.substring(before.lastIndexOf('\n') + 1)
        const isListMode = currentLine.match(/^\t*- /)
        if (e.key === 'Tab') {
            e.preventDefault()
            if (isListMode) {
                if (!e.shiftKey) {
                    this.insertTabAtLineStart()
                } else {
                    this.removeTab()
                }
            } else {
                this.insertTabAtCursorPosition()
            }
        } else if (e.key === 'Enter') {
            const didHandleEnter = this.handleEnterKey()
            if (didHandleEnter) {
                if (currentLine.match(/^\s*- $/)) {
                    // end list mode, remove the last line
                    this.setValue(before.substring(0, before.lastIndexOf('\n')) + "\n")
                } else {
                    e.preventDefault()
                }
            }
        } else if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') { // bold
                e.preventDefault()
                this.setValue(before + '**' + selected + '**' + after)
                this.element.selectionStart = this.element.selectionEnd = start + 2 + selected.length + 2
            } else if (e.key === 'i') { // italic
                e.preventDefault()
                this.setValue(before + '_' + selected + '_' + after)
                this.element.selectionStart = this.element.selectionEnd = start + 1 + selected.length + 1
            } else if (e.key === 'g') { // game todo this could be an extension
                e.preventDefault()
                this.setValue(before + '[game id="' + selected + '"]' + after)
                this.element.selectionEnd = this.element.selectionStart = start + 10
            } else if (e.key === 'z') { // undo, redo
                e.preventDefault()
                if (e.shiftKey) {
                    this.undoRedoManager.redo(this.element.value)
                } else {
                    this.undoRedoManager.undo(this.element.value)
                }
            }
        }
    }

    handleEnterKey() {
        const start = this.element.selectionStart
        const before = this.element.value.substring(0, start)
        const currentLine = before.substring(before.lastIndexOf('\n') + 1)
        const match = currentLine.match(/^(\s*- )/)
        if (match) {
            const spaces = match[1]
            const after = this.element.value.substring(start)
            this.setValue(before + '\n' + spaces + after)
            this.element.selectionStart = this.element.selectionEnd = start + spaces.length + 1
            return true
        }
        return false
    }

    insertTabAtCursorPosition() {
        const start = this.element.selectionStart
        const end = this.element.selectionEnd
        const before = this.element.value.substring(0, start)
        const after = this.element.value.substring(end)
        this.setValue(before + '\t' + after)
        this.element.selectionStart = this.element.selectionEnd = start + 1
    }

    insertTabAtLineStart() {
        const start = this.element.selectionStart
        const before = this.element.value.substring(0, start)
        const lineStart = before.lastIndexOf('\n') + 1
        const after = this.element.value.substring(start)
        this.setValue(before.substring(0, lineStart) + '\t' + before.substring(lineStart) + after)
        this.element.selectionStart = this.element.selectionEnd = start + 1
    }

    removeTab() {
        const start = this.element.selectionStart
        const end = this.element.selectionEnd
        const before = this.element.value.substring(0, start)
        const after = this.element.value.substring(end)
        const lineStart = before.lastIndexOf('\n') + 1
        const currentLine = before.substring(lineStart)
        if (currentLine.startsWith('\t')) {
            this.setValue(before.substring(0, lineStart) + currentLine.substring(1) + after)
            this.element.selectionStart = this.element.selectionEnd = start - 1
        }
    }
}

class Command {
    constructor(execute, unexecute, state) {
        this.execute = execute
        this.unexecute = unexecute
        this.state = state
    }
}

class UndoRedoManager {
    constructor() {
        this.undoStack = []
        this.redoStack = []
    }

    execute(command) {
        console.log("execute", command.state)
        command.execute(command.state)
        this.undoStack.push(command)
        this.redoStack = [] // clear redoStack whenever new command is executed
    }

    undo() {
        if (this.undoStack.length === 0) return
        const command = this.undoStack.pop()
        console.log("undo", command, this.undoStack)
        command.unexecute(command.state)
        this.redoStack.push(command)
    }

    redo() {
        console.log("redo", this.redoStack)
        if (this.redoStack.length === 0) return
        const command = this.redoStack.pop()
        command.execute(command.state)
        this.undoStack.push(command)
    }
}
