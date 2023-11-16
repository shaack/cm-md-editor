/**
 * Author: Stefan Haack (https://shaack.com)
 * Date: 2023-11-12
 */
export class ExtremeMinimalMdEditor {
    constructor(context) {
        this.element = context
        this.element.addEventListener('keydown', (e) => this.handleKeyDown(e))
    }
    insertTab() {
        const start = this.element.selectionStart
        const end = this.element.selectionEnd
        const before = this.element.value.substring(0, start)
        const after = this.element.value.substring(end)
        const lineStart = before.lastIndexOf('\n') + 1
        this.element.value = before.substring(0, lineStart) + '\t' + before.substring(lineStart) + after
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
            this.element.value = before.substring(0, lineStart) + currentLine.substring(1) + after
            this.element.selectionStart = this.element.selectionEnd = start - 1
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
            this.element.value = before + '\n' + spaces + after
            this.element.selectionStart = this.element.selectionEnd = start + spaces.length + 1
            return true
        }
        return false
    }

    handleKeyDown(e) {
        if (e.key === 'Tab') {
            e.preventDefault()
            if (!e.shiftKey) {
                this.insertTab()
            } else {
                this.removeTab()
            }
        } else if (e.key === 'Enter') {
            const didHandleEnter = this.handleEnterKey()
            if (didHandleEnter) e.preventDefault()
        }
    }
}
