export class Heading3 {
    constructor(editor) {
        this.editor = editor
    }
    toolbarButtons() {
        return [{name: 'h3', title: 'Heading 3', iconFile: 'type-h3.svg', action: () => this.toggleHeading()}]
    }
    toggleHeading() {
        const editor = this.editor
        editor.element.focus()
        const {lineStart, lineEnd, line} = editor.getCurrentLineInfo()
        const prefix = '### '
        const headingMatch = line.match(/^(#{1,6}) /)
        editor.selectLineRange(lineStart, lineEnd)
        if (headingMatch && headingMatch[1].length === 3) {
            editor.insertTextAtCursor(line.substring(prefix.length))
        } else if (headingMatch) {
            editor.insertTextAtCursor(prefix + line.substring(headingMatch[0].length))
        } else {
            editor.insertTextAtCursor(prefix + line)
        }
    }
}
