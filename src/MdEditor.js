/**
 * Author: Stefan Haack (https://shaack.com)
 * Date: 2023-11-12
 */
export class MdEditor {

    constructor(element) {
        this.element = element
        this.element.addEventListener('keydown', (e) => this.handleKeyDown(e))
        this.createToolbar()
    }

    createToolbar() {
        const wrapper = document.createElement('div')
        this.element.parentNode.insertBefore(wrapper, this.element)
        wrapper.appendChild(this.element)
        const toolbar = document.createElement('div')
        toolbar.style.cssText = 'display:flex;gap:2px;padding:4px;flex-wrap:wrap;'
        wrapper.insertBefore(toolbar, this.element)
        const buttons = [
            {title: 'H1', icon: '<path d="M4 3v18h3v-7h6v7h3V3h-3v8H7V3zm17 14v-4h-2V3h-3v18h3v-4z"/>', action: () => this.toggleHeading(1)},
            {title: 'H2', icon: '<path d="M4 3v18h3v-7h6v7h3V3h-3v8H7V3zm11 18h8v-3h-5l4.5-5.5A3.5 3.5 0 0019 6h-1a3.49 3.49 0 00-3.5 3.5h3A.5.5 0 0118 9h1a.5.5 0 01.4.8L15 15.33z"/>', action: () => this.toggleHeading(2)},
            {title: 'H3', icon: '<path d="M4 3v18h3v-7h6v7h3V3h-3v8H7V3zm11 18h5a3 3 0 001.75-5.43A3 3 0 0020 6h-5v3h5v3h-4v3h4v3h-5z"/>', action: () => this.toggleHeading(3)},
            {title: 'Bold', icon: '<path d="M6 4v16h7a4 4 0 001.69-7.63A3.5 3.5 0 0012.5 4zm3 3h3.5a.5.5 0 010 1H9zm0 4h4a1 1 0 010 2H9zm0 5h4a1 1 0 010 2H9z"/>', action: () => this.toggleBold()},
            {title: 'Italic', icon: '<path d="M10 4v3h2.2l-3.4 10H6v3h8v-3h-2.2l3.4-10H18V4z"/>', action: () => this.toggleItalic()},
            {title: 'Unordered List', icon: '<circle cx="4" cy="7" r="2"/><circle cx="4" cy="17" r="2"/><rect x="9" y="5.5" width="12" height="3" rx="1"/><rect x="9" y="15.5" width="12" height="3" rx="1"/>', action: () => this.insertUnorderedList()},
            {title: 'Ordered List', icon: '<text x="2" y="9" font-size="8" font-family="sans-serif" font-weight="bold">1</text><text x="2" y="19" font-size="8" font-family="sans-serif" font-weight="bold">2</text><rect x="9" y="5.5" width="12" height="3" rx="1"/><rect x="9" y="15.5" width="12" height="3" rx="1"/>', action: () => this.insertOrderedList()},
        ]
        buttons.forEach(btn => {
            const button = document.createElement('button')
            button.type = 'button'
            button.title = btn.title
            button.style.cssText = 'background:none;border:1px solid currentColor;border-radius:3px;cursor:pointer;padding:2px;display:flex;align-items:center;justify-content:center;color:inherit;opacity:0.7;'
            button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">${btn.icon}</svg>`
            button.addEventListener('click', (e) => {
                e.preventDefault()
                btn.action()
                this.element.focus()
            })
            toolbar.appendChild(button)
        })
    }

    getCurrentLineInfo() {
        const start = this.element.selectionStart
        const text = this.element.value
        const lineStart = text.lastIndexOf('\n', start - 1) + 1
        let lineEnd = text.indexOf('\n', start)
        if (lineEnd === -1) lineEnd = text.length
        const line = text.substring(lineStart, lineEnd)
        return {lineStart, lineEnd, line}
    }

    selectLineRange(lineStart, lineEnd) {
        this.element.selectionStart = lineStart
        this.element.selectionEnd = lineEnd
    }

    toggleHeading(level) {
        const {lineStart, lineEnd, line} = this.getCurrentLineInfo()
        const prefix = '#'.repeat(level) + ' '
        const headingMatch = line.match(/^(#{1,6}) /)
        this.selectLineRange(lineStart, lineEnd)
        if (headingMatch && headingMatch[1].length === level) {
            this.insertTextAtCursor(line.substring(prefix.length))
        } else if (headingMatch) {
            this.insertTextAtCursor(prefix + line.substring(headingMatch[0].length))
        } else {
            this.insertTextAtCursor(prefix + line)
        }
    }

    toggleWrap(marker) {
        const start = this.element.selectionStart
        const end = this.element.selectionEnd
        const text = this.element.value
        const len = marker.length
        const before = text.substring(start - len, start)
        const after = text.substring(end, end + len)
        if (before === marker && after === marker) {
            // Remove markers, keep selection on the inner text
            this.element.selectionStart = start - len
            this.element.selectionEnd = end + len
            const selected = text.substring(start, end)
            this.insertTextAtCursor(selected)
            this.element.selectionStart = start - len
            this.element.selectionEnd = end - len
        } else if (start !== end) {
            // Wrap selection, keep selection on the inner text
            this.insertTextAtCursor(marker + text.substring(start, end) + marker)
            this.element.selectionStart = start + len
            this.element.selectionEnd = end + len
        } else {
            this.insertTextAtCursor(marker)
        }
    }

    toggleBold() {
        this.toggleWrap('**')
    }

    toggleItalic() {
        this.toggleWrap('_')
    }

    insertUnorderedList() {
        const {lineStart, lineEnd, line} = this.getCurrentLineInfo()
        this.selectLineRange(lineStart, lineEnd)
        if (line.startsWith('- ')) {
            this.insertTextAtCursor(line.substring(2))
        } else {
            this.insertTextAtCursor('- ' + line)
        }
    }

    insertOrderedList() {
        const {lineStart, lineEnd, line} = this.getCurrentLineInfo()
        this.selectLineRange(lineStart, lineEnd)
        const olMatch = line.match(/^\d+\. /)
        if (olMatch) {
            this.insertTextAtCursor(line.substring(olMatch[0].length))
        } else {
            this.insertTextAtCursor('1. ' + line)
        }
    }

    insertTextAtCursor(text) {
        // execCommand is deprecated, but without alternative to insert text and preserve the correct undo/redo stack
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
                this.toggleBold()
            } else if (e.key === 'i') { // italic
                e.preventDefault()
                this.toggleItalic()
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
        const matchHyphen = currentLine.match(/^(\s*- )/)
        if (matchEmpty) {
            const pre = matchEmpty[1]
            this.element.selectionStart = this.element.selectionEnd - pre.length - 1
        } else if (matchHyphen) {
            e.preventDefault()
            const pre = matchHyphen[1]
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

    // test

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
