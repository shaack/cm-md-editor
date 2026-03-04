/**
 * Author: Stefan Haack (https://shaack.com)
 * Date: 2023-11-12
 */
export class MdEditor {

    constructor(element) {
        this.element = element
        this.element.addEventListener('keydown', (e) => this.handleKeyDown(e))
        this.createToolbar()
        this.createHighlightBackdrop()
    }

    createToolbar() {
        const wrapper = document.createElement('div')
        this.element.parentNode.insertBefore(wrapper, this.element)
        wrapper.appendChild(this.element)
        const toolbar = document.createElement('div')
        toolbar.style.cssText = 'display:flex;gap:1px;padding:2px;flex-wrap:wrap;background:rgba(128,128,128,0.15);border:1px solid rgba(128,128,128,0.3);border-bottom:none;border-radius:4px 4px 0 0;box-sizing:border-box;width:100%;'
        wrapper.insertBefore(toolbar, this.element)
        this.element.style.borderRadius = '0 0 4px 4px'
        const buttons = [
            {title: 'Heading 1', icon: '<text x="12" y="17.5" font-size="16" font-family="system-ui,sans-serif" font-weight="700" text-anchor="middle">H1</text>', action: () => this.toggleHeading(1)},
            {title: 'Heading 2', icon: '<text x="12" y="17.5" font-size="16" font-family="system-ui,sans-serif" font-weight="700" text-anchor="middle">H2</text>', action: () => this.toggleHeading(2)},
            {title: 'Heading 3', icon: '<text x="12" y="17.5" font-size="16" font-family="system-ui,sans-serif" font-weight="700" text-anchor="middle">H3</text>', action: () => this.toggleHeading(3)},
            {title: 'Bold', icon: '<text x="12" y="18" font-size="18" font-family="system-ui,sans-serif" font-weight="800" text-anchor="middle">B</text>', action: () => this.toggleBold()},
            {title: 'Italic', icon: '<text x="12" y="18" font-size="18" font-family="system-ui,sans-serif" font-weight="600" font-style="italic" text-anchor="middle">I</text>', action: () => this.toggleItalic()},
            {title: 'Unordered List', icon: '<circle cx="5" cy="7" r="1.8"/><circle cx="5" cy="17" r="1.8"/><rect x="9.5" y="5.5" width="11" height="3" rx="1"/><rect x="9.5" y="15.5" width="11" height="3" rx="1"/>', action: () => this.insertUnorderedList()},
            {title: 'Ordered List', icon: '<text x="3" y="9.5" font-size="8.5" font-family="system-ui,sans-serif" font-weight="700">1</text><text x="3" y="19.5" font-size="8.5" font-family="system-ui,sans-serif" font-weight="700">2</text><rect x="9.5" y="5.5" width="11" height="3" rx="1"/><rect x="9.5" y="15.5" width="11" height="3" rx="1"/>', action: () => this.insertOrderedList()},
        ]
        buttons.forEach(btn => {
            const button = document.createElement('button')
            button.type = 'button'
            button.title = btn.title
            button.style.cssText = 'background:none;border:none;border-radius:3px;cursor:pointer;padding:4px 6px;display:flex;align-items:center;justify-content:center;color:inherit;opacity:0.6;transition:opacity 0.15s,background 0.15s;'
            button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">${btn.icon}</svg>`
            button.addEventListener('mouseenter', () => { button.style.opacity = '1'; button.style.background = 'rgba(128,128,128,0.2)' })
            button.addEventListener('mouseleave', () => { button.style.opacity = '0.6'; button.style.background = 'none' })
            button.addEventListener('mousedown', (e) => {
                e.preventDefault()
            })
            button.addEventListener('click', (e) => {
                e.preventDefault()
                btn.action()
            })
            toolbar.appendChild(button)
        })
    }

    createHighlightBackdrop() {
        const container = this.element.parentNode
        container.style.position = 'relative'
        this.backdrop = document.createElement('div')
        this.highlightLayer = document.createElement('div')
        this.backdrop.appendChild(this.highlightLayer)
        container.appendChild(this.backdrop)

        // Copy textarea computed styles to backdrop
        const cs = window.getComputedStyle(this.element)
        this.backdrop.style.cssText = `position:absolute;overflow:hidden;pointer-events:none;z-index:1;`
        this.highlightLayer.style.cssText = `white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;color:transparent;`

        const syncStyles = () => {
            const cs = window.getComputedStyle(this.element)
            const props = ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
                'tab-size', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left']
            props.forEach(p => this.highlightLayer.style[p.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = cs.getPropertyValue(p))
            this.highlightLayer.style.boxSizing = 'border-box'
            // Use clientWidth to match the textarea's content area (excludes scrollbar)
            this.highlightLayer.style.width = this.element.clientWidth + 'px'
            const borderTop = parseInt(cs.getPropertyValue('border-top-width')) || 0
            const borderLeft = parseInt(cs.getPropertyValue('border-left-width')) || 0
            this.backdrop.style.top = (this.element.offsetTop + borderTop) + 'px'
            this.backdrop.style.left = (this.element.offsetLeft + borderLeft) + 'px'
            this.backdrop.style.width = this.element.clientWidth + 'px'
            this.backdrop.style.height = this.element.clientHeight + 'px'
        }
        syncStyles()

        // Make textarea background transparent so backdrop shows through
        this.element.style.background = 'transparent'
        this.element.style.position = 'relative'
        this.element.style.caretColor = cs.color

        // Sync scroll
        this.element.addEventListener('scroll', () => {
            this.highlightLayer.style.transform = `translate(0, -${this.element.scrollTop}px)`
        })

        // Update on input
        this.element.addEventListener('input', () => this.updateHighlight())
        new ResizeObserver(() => { syncStyles(); this.updateHighlight() }).observe(this.element)
        this.updateHighlight()
    }

    updateHighlight() {
        const text = this.element.value
        const lines = text.split('\n')
        let html = ''
        for (let i = 0; i < lines.length; i++) {
            if (i > 0) html += '\n'
            let line = lines[i]
            let result = this.escapeHtml(line)

            // Headings: emphasize entire line
            const headingMatch = line.match(/^(#{1,6}) /)
            if (headingMatch) {
                const hashes = this.escapeHtml(headingMatch[1])
                const rest = this.escapeHtml(line.substring(headingMatch[0].length))
                const opacity = Math.max(0.3, 0.8 - (headingMatch[1].length - 1) * 0.1)
                result = `<span style="color:rgba(100,160,255,${opacity})">${hashes} </span><span style="color:rgba(100,160,255,${opacity})">${rest}</span>`
            } else {
                // Bold **text**
                result = result.replace(/(\*\*)(.*?)(\*\*)/g,
                    '<span style="color:rgba(255,180,80,0.5)">$1</span><span style="color:rgba(255,180,80,0.8)">$2</span><span style="color:rgba(255,180,80,0.5)">$3</span>')
                // Italic _text_
                result = result.replace(/((?:^|[^\\]))(\_)(.*?[^\\])(\_)/g,
                    '$1<span style="color:rgba(180,130,255,0.5)">$2</span><span style="color:rgba(180,130,255,0.8)">$3</span><span style="color:rgba(180,130,255,0.5)">$4</span>')
                // Unordered list markers
                result = result.replace(/^(\t*)(- )/, (_, tabs, marker) =>
                    this.escapeHtml(tabs) + '<span style="color:rgba(100,200,150,0.7)">' + this.escapeHtml(marker) + '</span>')
                // Ordered list markers
                result = result.replace(/^(\t*)(\d+\. )/, (_, tabs, marker) =>
                    this.escapeHtml(tabs) + '<span style="color:rgba(100,200,150,0.7)">' + this.escapeHtml(marker) + '</span>')
            }
            html += result
        }
        // Trailing newline so the backdrop height matches the textarea
        this.highlightLayer.innerHTML = html + '\n'
    }

    escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
            this.insertTextAtCursor(marker + marker)
            this.element.selectionStart = this.element.selectionEnd = start + len
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
        const isListMode = currentLine.match(/^\t*- /) || currentLine.match(/^\t*\d+\. /)
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
        const matchEmptyUl = currentLine.match(/^(\s*- )$/)
        const matchEmptyOl = currentLine.match(/^(\s*)\d+\. $/)
        const matchHyphen = currentLine.match(/^(\s*- )/)
        const matchOl = currentLine.match(/^(\s*)(\d+)\. ./)
        if (matchEmptyUl) {
            this.element.selectionStart = this.element.selectionEnd - matchEmptyUl[1].length - 1
        } else if (matchEmptyOl) {
            this.element.selectionStart = this.element.selectionEnd - matchEmptyOl[0].length - 1
        } else if (matchHyphen) {
            e.preventDefault()
            this.insertTextAtCursor('\n' + matchHyphen[1])
        } else if (matchOl) {
            e.preventDefault()
            const nextNum = parseInt(matchOl[2]) + 1
            this.insertTextAtCursor('\n' + matchOl[1] + nextNum + '. ')
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
