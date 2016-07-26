import { EditorFactory } from 'stewie-editor';
import 'stewie-editor/lib/StewieEditor.css';

const mockInitialState = JSON.parse('{"entityMap":{"0":{"type":"ALIGNMENT","mutability":"MUTABLE","data":{"alignment":"center"}},"1":{"type":"LINK","mutability":"MUTABLE","data":{"url":"asdsa"}},"2":{"type":"hr","mutability":"IMMUTABLE","data":{}}},"blocks":[{"key":"bhqu9","text":"asdasd as","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[]},{"key":"4b835","text":"da sd as","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[]},{"key":"c9haq","text":"d as das da","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[]},{"key":"dgspm","text":"asd","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[]},{"key":"2g3sq","text":"asdasd","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":2,"key":0},{"offset":2,"length":1,"key":1},{"offset":3,"length":3,"key":0}]},{"key":"56lth","text":"asdsad","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[]},{"key":"932b6","text":"asdasd","type":"blockquote","depth":0,"inlineStyleRanges":[],"entityRanges":[]},{"key":"vig8","text":"asdsad","type":"header-one","depth":0,"inlineStyleRanges":[],"entityRanges":[]},{"key":"70tgo","text":"asd","type":"header-two","depth":0,"inlineStyleRanges":[],"entityRanges":[]},{"key":"chqmb","text":" ","type":"hr","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":1,"key":2}]},{"key":"95jld","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[]},{"key":"fgi7e","text":"asdasdasd","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":7,"length":2,"style":"ITALIC"},{"offset":7,"length":2,"style":"UNDERLINE"},{"offset":7,"length":2,"style":"BOLD"}],"entityRanges":[]}]}');

const config  =  [{
  subscribers: {
    api: (api, id) => { window.editor = { ...window.editor, [id]: api } },
    wordCount: (words) => { console.log(words) },
    charCount: (chars) =>   { console.log(chars) },
    state: (state) => { console.log(state) }
  }
}];

const editorFactory = EditorFactory('.stewie-editor', config).mount();