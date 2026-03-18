# cm-md-editor

A minimal, dependency-free markdown editor as a vanilla JavaScript ES6 module.

[Demo](https://shaack.com/projekte/cm-md-editor/)

![Screenshot](screenshot.png)

## Key features

- Vanilla JavaScript module, zero dependencies
- Syntax highlighting for headings, bold, italic, code, lists, links, images, blockquotes, HTML tags, horizontal rules, front matter and more
- Toolbar with configurable buttons (headings, bold, italic, lists, links, images)
- Word wrap toggle with persistent state (localStorage)
- List mode: Tab/Shift-Tab to indent/outdent, auto-continuation on Enter
- Bold with Ctrl/Cmd+B, italic with Ctrl/Cmd+I
- Native undo/redo support (Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z)
- Lightweight, fast, easy to use

## Installation

```bash
npm install cm-md-editor
```

## Usage

```html
<textarea id="editor"></textarea>

<script type="module">
    import {MdEditor} from "cm-md-editor/src/MdEditor.js"

    const editor = new MdEditor(document.getElementById("editor"))
</script>
```

With custom configuration:

```javascript
const editor = new MdEditor(document.getElementById("editor"), {
    wordWrap: false,
    toolbarButtons: ["h1", "h2", "bold", "italic", "ul", "link"]
})
```

## Configuration (props)

All props are optional. Pass them as the second argument to the constructor.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `wordWrap` | `boolean` | `true` | Default word wrap state. Overridden by localStorage if the user has toggled it |
| `toolbarButtons` | `string[]` | `["h1", "h2", "h3", "bold", "italic", "ul", "ol", "link", "image"]` | Which toolbar buttons to show. Available: `h1`, `h2`, `h3`, `bold`, `italic`, `ul`, `ol`, `link`, `image` |
| `addOns` | `class[]` | `[]` | AddOn classes to instantiate. See [AddOns](#addons) |
| `colorHeading` | `string` | `"100,160,255"` | RGB color for headings |
| `colorCode` | `string` | `"130,170,200"` | RGB color for code spans and fenced code blocks |
| `colorComment` | `string` | `"128,128,128"` | RGB color for HTML comments |
| `colorLink` | `string` | `"100,180,220"` | RGB color for links and images |
| `colorBlockquote` | `string` | `"100,200,150"` | RGB color for blockquote prefixes |
| `colorList` | `string` | `"100,200,150"` | RGB color for list markers |
| `colorStrikethrough` | `string` | `"255,100,100"` | RGB color for ~~strikethrough~~ |
| `colorBold` | `string` | `"255,180,80"` | RGB color for **bold** |
| `colorItalic` | `string` | `"180,130,255"` | RGB color for _italic_ |
| `colorHtmlTag` | `string` | `"200,120,120"` | RGB color for HTML tags |
| `colorHorizontalRule` | `string` | `"128,128,200"` | RGB color for horizontal rules |
| `colorEscape` | `string` | `"128,128,128"` | RGB color for escape sequences |
| `colorFrontMatter` | `string` | `"128,128,200"` | RGB color for YAML front matter |

Colors are specified as RGB strings (e.g. `"255,180,80"`) and rendered at full opacity.

## AddOns

AddOns extend the editor with custom toolbar buttons, keyboard shortcuts, and syntax highlighting. They keep the core editor generic while allowing app-specific functionality.

### Usage

Pass AddOn classes via the `addOns` prop. The editor instantiates each with `new AddOn(editor)`.

```javascript
const editor = new MdEditor(document.getElementById("editor"), {
    addOns: [GameAddOn, MyOtherAddOn]
})
```

### Writing an AddOn

An AddOn is a class that receives the editor instance in its constructor. It can implement any combination of three optional methods:

```javascript
class MyAddOn {
    constructor(editor) {
        this.editor = editor
    }

    // Optional: add buttons to the toolbar
    toolbarButtons() {
        return [{
            name: 'mybutton',
            title: 'My Button',
            icon: '<path d="..."/>',  // SVG path content for a 16x16 viewBox
            action: () => { /* ... */ }
        }]
    }

    // Optional: register keyboard shortcuts
    keyboardShortcuts() {
        return [{
            key: 'e',            // the key to match (KeyboardEvent.key)
            ctrlOrMeta: true,    // require Ctrl (Windows/Linux) or Cmd (Mac)
            action: (e) => { /* ... */ }
        }]
    }

    // Optional: extend syntax highlighting (receives already-escaped HTML)
    highlightInline(html) {
        return html.replace(/(\[game id=&amp;quot;)(.*?)(&amp;quot;\])/g, (_, p1, p2, p3) =>
            this.editor.colorSpan('colorLink', p1 + p2 + p3))
    }
}
```

### Editor API available to AddOns

These public methods and properties are available via `this.editor`:

| Method / Property | Description |
|-------------------|-------------|
| `editor.element` | The textarea element (read `value`, `selectionStart`, `selectionEnd`) |
| `editor.insertTextAtCursor(text)` | Insert text at cursor, preserving native undo/redo |
| `editor.getCurrentLineInfo()` | Returns `{lineStart, lineEnd, line}` for the current line |
| `editor.selectLineRange(start, end)` | Set the textarea selection range |
| `editor.toggleWrap(marker)` | Toggle wrapping markers around the selection (e.g. `**` for bold) |
| `editor.escapeHtml(str)` | Escape a string for use in the highlight layer |
| `editor.colorSpan(colorProp, content)` | Wrap content in a colored `<span>` using an RGB color prop |

### Example: GameAddOn

A complete AddOn that adds a toolbar button, a Ctrl+E shortcut, and syntax highlighting for `[game id="..."]` shortcodes:

```javascript
class GameAddOn {
    constructor(editor) {
        this.editor = editor
    }

    toolbarButtons() {
        return [{
            name: 'game',
            title: 'Insert Game (Ctrl+E)',
            icon: '<path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219z"/>',
            action: () => this.insertGame()
        }]
    }

    keyboardShortcuts() {
        return [{key: 'e', ctrlOrMeta: true, action: () => this.insertGame()}]
    }

    highlightInline(html) {
        return html.replace(/(\[game id=&amp;quot;)(.*?)(&amp;quot;\])/g, (_, p1, p2, p3) =>
            this.editor.colorSpan('colorLink', p1 + p2 + p3))
    }

    insertGame() {
        const el = this.editor.element
        const start = el.selectionStart
        const selected = el.value.substring(start, el.selectionEnd)
        this.editor.insertTextAtCursor('[game id="' + selected + '"]')
        el.selectionStart = start + 10
        el.selectionEnd = start + 10 + selected.length
    }
}
```

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + B | Toggle bold |
| Ctrl/Cmd + I | Toggle italic |
| Tab | Indent list item or insert tab |
| Shift + Tab | Outdent list item |
| Enter | Auto-continue list (unordered and ordered) |

## License

MIT
