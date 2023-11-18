/**
 * Author: Stefan Haack (https://shaack.com)
 * Date: 2023-11-12
 */
export class MdEditor {

    constructor(element) {
        this.element = element

        // listen to typing
        this.element.addEventListener('keydown', (e) => this.handleKeyDown(e))
    }

    insertTextAtCursor(text) {
        document.execCommand("insertText", false, text)
    }

    handleKeyDown(e) {
        const start = this.element.selectionStart
        const end = this.element.selectionEnd
        const before = this.element.value.substring(0, start)
        const selected = this.element.value.substring(start, end)
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
            this.handleEnterKey(e)
        } else if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') { // bold
                e.preventDefault()
                if (selected) {
                    this.insertTextAtCursor('**' + selected + '**')
                } else {
                    this.insertTextAtCursor('**')
                }
            } else if (e.key === 'i') { // italic
                e.preventDefault()
                if (selected) {
                    this.insertTextAtCursor('_' + selected + '_')
                } else {
                    this.insertTextAtCursor('_')
                }
            } else if (e.key === 'e') { // game todo this could be an extension
                e.preventDefault()
                this.insertTextAtCursor('[game id="' + selected + '"]')
                this.element.selectionStart = start + 10
                this.element.selectionEnd = start + 10 + selected.length
            }
        }
    }

    handleEnterKey(e) {
        const start = this.element.selectionStart
        const before = this.element.value.substring(0, start)
        const currentLine = before.substring(before.lastIndexOf('\n') + 1)
        const matchEmpty = currentLine.match(/^(\s*- )$/)
        const match = currentLine.match(/^(\s*- )/)
        if(matchEmpty) {
            e.preventDefault()
            const pre = matchEmpty[1]
            this.element.selectionStart = before.lastIndexOf('\n') + 1
            this.element.selectionEnd = this.element.selectionStart + pre.length
            this.insertTextAtCursor('')
        } else if (match) {
            e.preventDefault()
            const pre = match[1]
            this.insertTextAtCursor('\n' + pre)
        }
    }

    insertTabAtCursorPosition() {
        this.insertTextAtCursor('\t')
    }

    insertTabAtLineStart() {
        const start = this.element.selectionStart
        const before = this.element.value.substring(0, start)
        const lineStart = before.lastIndexOf('\n') + 1
        this.element.selectionStart = this.element.selectionEnd = lineStart
        this.insertTextAtCursor('\t')
        this.element.selectionStart = this.element.selectionEnd = start + 1
    }

    removeTab() {
        const start = this.element.selectionStart
        const before = this.element.value.substring(0, start)
        const lineStart = before.lastIndexOf('\n') + 1
        const currentLine = before.substring(lineStart)
        if (currentLine.startsWith('\t')) {
            this.element.selectionStart = lineStart
            this.element.selectionEnd = lineStart + 1
            this.insertTextAtCursor("")
            this.element.selectionStart = this.element.selectionEnd = start - 1
        }
    }
}
