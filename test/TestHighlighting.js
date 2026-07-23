/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-md-editor
 * License: MIT, see file 'LICENSE'
 */

import {describe, it, assert} from "../node_modules/teevi/src/teevi.js"
import {makeEditor} from "./EditorHarness.js"

// Highlighting emits inline color spans as rgba(<r,g,b>,...). We assert on the
// raw rgb triplet of the relevant color prop, picking props with unique values.
function segment(editor, text) {
    return editor.highlightTextSegment(editor.escapeHtml(text))
}

describe("TestHighlighting", () => {

    it("should color a heading line", () => {
        const {editor} = makeEditor("# Title")
        editor.updateHighlight()
        assert.true(editor.highlightLayer.innerHTML.includes("rgba(" + editor.props.colorHeading))
    })

    it("should color bold text", () => {
        const {editor} = makeEditor()
        assert.true(segment(editor, "**bold**").includes("255,180,80"))
    })

    it("should color italic text", () => {
        const {editor} = makeEditor()
        assert.true(segment(editor, "_ital_").includes("180,130,255"))
    })

    it("should color strikethrough text", () => {
        const {editor} = makeEditor()
        assert.true(segment(editor, "~~gone~~").includes("255,100,100"))
    })

    it("should color highlighted text", () => {
        const {editor} = makeEditor()
        assert.true(segment(editor, "==hi==").includes("230,200,90"))
    })

    it("should color inline code", () => {
        const {editor} = makeEditor()
        assert.true(editor.highlightInline("`code`").includes("130,170,200"))
    })

    it("should color a link", () => {
        const {editor} = makeEditor()
        assert.true(segment(editor, "[text](http://x)").includes("100,180,220"))
    })

    it("should color an unordered list marker", () => {
        const {editor} = makeEditor()
        assert.true(segment(editor, "- item").includes("100,200,150"))
    })

    it("should protect inline code from other inline rules", () => {
        const {editor} = makeEditor()
        const html = editor.highlightInline("`**not bold**`")
        assert.true(html.includes("130,170,200"))   // code color present
        assert.false(html.includes("255,180,80"))   // bold color absent
    })

    it("should color a fenced code block", () => {
        const {editor} = makeEditor("```\nvar x = 1\n```")
        editor.updateHighlight()
        assert.true(editor.highlightLayer.innerHTML.includes("rgba(" + editor.props.colorCode))
    })

    it("should color YAML front matter", () => {
        const {editor} = makeEditor("---\ntitle: x\n---\nbody")
        editor.updateHighlight()
        assert.true(editor.highlightLayer.innerHTML.includes("rgba(" + editor.props.colorFrontMatter))
    })

    it("should end the highlight layer with a trailing newline", () => {
        const {editor} = makeEditor("line")
        editor.updateHighlight()
        assert.true(editor.highlightLayer.innerHTML.endsWith("\n"))
    })
})
