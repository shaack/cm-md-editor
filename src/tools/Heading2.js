export class Heading2 {
    constructor(editor) {
        this.editor = editor
    }
    toolbarButtons() {
        return [{name: 'h2', title: 'Heading 2', iconFile: 'type-h2.svg', action: () => this.toggleHeading()}]
    }
    toggleHeading() {
        const editor = this.editor
        editor.element.focus()
        const {lineStart, lineEnd, line} = editor.getCurrentLineInfo()
        const prefix = '## '
        const headingMatch = line.match(/^(#{1,6}) /)
        editor.selectLineRange(lineStart, lineEnd)
        if (headingMatch && headingMatch[1].length === 2) {
            editor.insertTextAtCursor(line.substring(prefix.length))
        } else if (headingMatch) {
            editor.insertTextAtCursor(prefix + line.substring(headingMatch[0].length))
        } else {
            editor.insertTextAtCursor(prefix + line)
        }
    }
}
