import React from 'react';
import { connect, Provider } from 'react-redux';
import {stateFromHTML} from 'draft-js-import-html';
// import { EditorContainer } from './editorContainer';
import Editor from 'draft-js-plugins-editor-wysiwyg';
import { EditorState, RichUtils, Entity, Modifier, ContentState, convertToRaw, AtomicBlockUtils, genKey, ContentBlock, DefaultDraftBlockRenderMap, DraftCustomBlock } from 'draft-js';
import createCounterPlugin from 'draft-js-counter-plugin';
import addBlock from '../addBlock';
import removeBlock from '../removeBlock';
import 'core-js';
import { Map } from 'immutable';
import createImagePlugin, { imageCreator, imageStyles } from 'draft-js-image-plugin';
import createCleanupEmptyPlugin from 'draft-js-cleanup-empty-plugin';
import createFocusPlugin, { FocusDecorator } from 'draft-js-focus-plugin';
import createAlignmentPlugin, { AlignmentDecorator } from 'draft-js-alignment-plugin';
import createEntityPropsPlugin from 'draft-js-entity-props-plugin';
import createToolbarPlugin, { ToolbarDecorator } from 'draft-js-toolbar-plugin';
import createDndPlugin, { DraggableDecorator } from 'draft-js-dnd-plugin';
import createTablePlugin, { tableCreator, tableStyles } from 'draft-js-table-plugin';
import createLinkifyPlugin from 'draft-js-linkify-plugin';

const counterPlugin = createCounterPlugin();
const { CharCounter } = counterPlugin;

const styleMap = {
  left: {
    textAlign: 'left'
  },
  right: {
    textAlign: 'right'
  },
  center: {
    textAlign: 'center'
  }
}
const BLOCK_TYPES = [
  {label: 'UL', style: 'unordered-list-item'},
  {label: 'OL', style: 'ordered-list-item'},
];

const NESTED_TYPES = [{
  buttons: [
    {label: 'Normal Text', style: 'unstyled', tag: 'p'},
    {label: 'Quote', style: 'blockquote', tag: 'blockquote'},
    {label: 'Header 1', style: 'header-one', tag: 'h1'},
    {label: 'Header 2', style: 'header-two', tag: 'h2'},
    {label: 'Header 3', style: 'header-three', tag: 'h3'},
    {label: 'Header 4', style: 'header-four', tag: 'h4'},
    {label: 'Header 5', style: 'header-five', tag: 'h5'},
    {label: 'Header 6', style: 'header-six', tag: 'h6'}
  ]
}]


const tagNameToBlockType = {
  IMG: 'block-image'
}

class HR extends React.Component {
  render (){
    return <hr/>
  }
}

const image = (
  DraggableDecorator(
    FocusDecorator(
      AlignmentDecorator(
        ToolbarDecorator()(
          imageCreator({ theme: imageStyles })
        )
      )
    )
  )
)

const table = FocusDecorator(
  DraggableDecorator(
    ToolbarDecorator()(
      tableCreator({ theme: tableStyles, Editor })
    )
  )
);

function customBlockRender(contentBlock, { getEditorState, setEditorState }) {
  const type = contentBlock.getType();
  if (type === 'block-image') {
    const entityKey = contentBlock.getEntityAt(0);
    const data = entityKey ? Entity.get(entityKey).data : {};
    return {
      component: image,
      props: {
        entityData: {
          src: data.src,
          progress: 100
        }
      },
      editable: true
    }
  }
  if (type === 'hr') {
    const entityKey = contentBlock.getEntityAt(0);
    return {
      component: HR,
      editable: true
    }
  }
  return null;
}

const renderStyleButton = (blockType, showLabel, { label, style, onToggle, modifier}) => {
  return <StyleButton
    key={label}
    active={style === blockType}
    label={showLabel ? label : ''}
    onToggle={onToggle}
    style={style}
    modifier={modifier}
  />
}

const CustomControls = ({ editorState, customBlockTypes }) => {
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();
  return (
    <div className="RichEditor-controls">
      { customBlockTypes.map((block) =>{
        if (block.nestedTypes) {
          return <div className={`RichEditor-controls--nested-${block.type}`}>
            <div className={`RichEditor-controls--nested-${block.type}--menu`}>
              { block.nestedTypes.map(renderStyleButton.part(blockType, true)) }
            </div>
          </div>
        }
        return renderStyleButton(blockType, false, block)
    })}
    </div>
  )
}

const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          onToggle={props.onToggle}
          style={type.style}
          modifier={type.label}
        />
      )}
      {NESTED_TYPES.map((nestedType) =>
        <div className="RichEditor-nestedButton">
            <input id="RichEditor-nestedButton__input" type="checkbox" className="N"></input>
            <label htmlFor="RichEditor-nestedButton__input" className="RichEditor-nestedButton__label"/>
            <div className="RichEditor-nestedButton__container">
              { nestedType.buttons.map((type) => {
                  let className = 'RichEditor-nestedButton__container__button'
                  className += type.style === blockType ? ` ${className}--active` : '';
                  return React.createElement(type.tag, {className, onMouseDown: (e) => {
                    e.preventDefault();
                    props.onToggle(type.style);
                  }}, type.label)
                })
              }
            </div>
        </div>
      )}
    </div>
  );
}

const INLINE_STYLES = [
        {label: 'B', style: 'BOLD'},
        {label: 'I', style: 'ITALIC'},
        {label: 'U', style: 'UNDERLINE'}
      ];

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map(type =>
        <StyleButton
          className="RichEditor-controls__inline"
          key={type.label}
          active={currentStyle.has(type.style)}
          onToggle={props.onToggle}
          style={type.style}
          modifier={type.label}
        />
      )}
    </div>
  );
};

const TableControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      <StyleButton
        key={'table'}
        active={'table' === blockType}
        onToggle={props.onToggle}
        style="table"
        modifier='table'
      />
    </div>
  );
}

function findLinkEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
}

const Link = (props) => {
  const {url, caption} = Entity.get(props.entityKey).getData();
  const linkCaption = props.children && !caption ? props.children : <span>{caption}</span>
  return (
    <a href={url} style={styles.link}>
      {linkCaption }
    </a>
  );
};

const linkPlugin = (config = {}) => {
  return {
    decorators: [{
      strategy: findLinkEntities,
      component: Link
    }]
  }
}

const plugins = [ linkPlugin(),
  createCleanupEmptyPlugin({
    types: ['block-image', 'block-table']
  }),
  createEntityPropsPlugin({}),
  createToolbarPlugin({ clearTextActions: true, inlineStyles: []}),
  createFocusPlugin({}),
  createAlignmentPlugin({}),
  createDndPlugin({
    allowDrop: true
  }),
  createImagePlugin({ component: image }),
  createTablePlugin({ component: table, Editor }),
  counterPlugin
]

export class EditorPOC extends React.Component {
    constructor(props){
      super(props)
      const { editorState } = this.props;
      const customBlockRendering = Map({
        'block-image': {
          element: 'figure'
        },
        'hr': {},
        'alignment--left': {
          element: 'div'
        },
        'alignment--center': {
          element: 'div'
        },
        'alignment--right': {
          element: 'div'
        },
        'block-table': {
          element: 'div'
        }
      });
      this.state = {
        blockRenderMap: DefaultDraftBlockRenderMap.merge(customBlockRendering),
        editorState: EditorState.createEmpty(),
        showURLInput: false,
        urlValue: '',
        alignment: 'alignment--left',
        blockStyleFn: (contentBlock) => {
         const type = contentBlock.getType();
         return `blockType__${type}`
        }
      }
      this.focus = () => this.refs.editor.focus();
      this.changeState = this.changeState.bind(this);
      this.handleKeyCommand = this.handleKeyCommand.bind(this);
      this.logState = () => {
          const content = this.state.editorState.getCurrentContent();
          console.log(convertToRaw(content));
      };
      this.promptForLink = this._promptForLink.bind(this);
      this.onURLChange = (e) => this.setState({urlValue: e.target.value});
      // this.onLinkCaptionChange = (e) => this.setState({linkCaption: e.target.value});
      this.confirmLink = this._confirmLink.bind(this);
      this.onLinkInputKeyDown = this._onLinkInputKeyDown.bind(this);
      this.removeLink = this._removeLink.bind(this);
      this.toggleBlockType = (type) => this._toggleBlockType(type);
      this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
      this.toggleTable = (style) => this._toggleTable(style);
      this.handleDrop = this._handleDrop.bind(this);
      this.addHr = this._addHr.bind(this);
      this.toggleAlignMent = this._toggleAlignMent.bind(this);
    }


    _handleDrop(selection, dataTransfer) {
      const dataTransferData = dataTransfer.data.getData('draggable-data');
      if (dataTransferData) {
        const { blockType, data } = JSON.parse(dataTransferData)
        this.changeState(addBlock(this.state.editorState, selection, blockType, data));
        this.dropped = true;
        return true;
      }
    }

    _promptForLink() {
      const {editorState} = this.state;
      const selection = editorState.getSelection();
      if (!selection.isCollapsed()) {
        this.setState({
          showURLInput: true,
          urlValue: '',
        }, () => {
          setTimeout(() => this.refs.url.focus(), 0);
        });
      }
    }

    _confirmLink(e) {
      e.preventDefault();
      const {editorState, urlValue, linkCaption} = this.state;
      const selection = editorState.getSelection();
      const entityKey = Entity.create('LINK', 'MUTABLE', {url: urlValue, caption: linkCaption});
      this.setState({
       editorState: RichUtils.toggleLink(
         editorState,
         editorState.getSelection(),
         entityKey
       ),
       showURLInput: false,
       urlValue: '',
       linkCaption: ''
      }, () => {
       setImmediate(() => this.refs.editor.focus());
      });
    }

     _onLinkInputKeyDown(e) {
       if (e.which === 13) {
         this._confirmLink(e);
       }
     }

     _removeLink(e) {
       const {editorState} = this.state;
       const selection = editorState.getSelection();
       if (!selection.isCollapsed()) {
         this.setState({
           editorState: RichUtils.toggleLink(editorState, selection, null),
         });
       }
     }

    changeState(editorState){
          let content = editorState.getCurrentContent();
          const selection = editorState.getSelection();
          const blockType = content
            .getBlockForKey(selection.getStartKey())
            .getType();
          this.props.changeState(convertToRaw(content));
          this.setState({ editorState });
    }


    handleKeyCommand(command) {
    const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
      if (newState) {
        this.changeState(newState);
        return true;
      }
      return false;
    }

    _toggleBlockType(blockType) {
       this.changeState(
         RichUtils.toggleBlockType(
           this.state.editorState,
           blockType
         )
       );
     }

     _toggleTable() {
       this.addBlockForSelection(this.state.editorState, 'block-table')
     }

     addBlockForSelection(editorState, blockType){
       const selection = editorState.getSelection();
       this.changeState(addBlock(editorState, selection, blockType));
     }

     _addHr(){
       this.addBlockForSelection(this.state.editorState, 'hr')
     }

     _toggleInlineStyle(inlineStyle) {
       this.changeState(
         RichUtils.toggleInlineStyle(
           this.state.editorState,
           inlineStyle,
         )
       );
     }

     _toggleAlignMent(direction){
       const { editorState } = this.state;
       const contentState = editorState.getCurrentContent();
       const selectionState = editorState.getSelection();
       this.setState({ alignment: `alignment--${direction}`, editorState: EditorState.push(editorState, Modifier.setBlockType( contentState, selectionState, `alignment--${direction}`)) });
     }

     getCustomBlockTypes(){
       const { toggleTable, promptForLink, addHr, toggleAlignMent, removeLink } = this;

       return [{
         type: 'alignment',
         nestedTypes: [{
           label: 'Align Left',
           onToggle: toggleAlignMent.part('left')
         },{
           label: 'Align Center',
           onToggle: toggleAlignMent.part('center')
         },{
           label: 'Align Right',
           onToggle: toggleAlignMent.part('right')
         }]
       }, {
         type: 'link',
         nestedTypes: [{
           label: 'Link',
           modifier: 'link',
           onToggle: promptForLink
         }, {
           label: 'Unlink',
           modifier: 'unlink',
           onToggle: removeLink
         }]
       }, {
         modifier: "table",
         onToggle: toggleTable
       }, {
         label: "---",
         modifier: "hr",
         onToggle: addHr
       }]
     }

    render(){
      let urlInput;
      if (this.state.showURLInput) {
        urlInput =
          <div style={styles.urlInputContainer}>
            {
              // <label>Caption</label>
              // <input
              //   onChange={this.onLinkCaptionChange}
              //   ref="caption"
              //   style={styles.urlInput}
              //   type="text"
              //   value={this.state.linkCaption}
              //   onKeyDown={this.onLinkInputKeyDown}
              // />
            }
            <label>Url</label>
            <input
              onChange={this.onURLChange}
              ref="url"
              style={styles.urlInput}
              type="text"
              value={this.state.urlValue}
              onKeyDown={this.onLinkInputKeyDown}
            />
            <button onMouseDown={this.confirmLink}>
              Confirm
            </button>
          </div>;
      }
      return (
        this.props.clientRender ?
          <div style={styles.root}>
            <div className="RichEditorContainer">
              <div className="RichEditor-toolbar">
                <InlineStyleControls
                    editorState={this.state.editorState}
                    onToggle={this.toggleInlineStyle}
                />
                <BlockStyleControls
                   editorState={this.state.editorState}
                   onToggle={this.toggleBlockType}
                 />
               <CustomControls
                  editorState={this.state.editorState}
                  customBlockTypes={this.getCustomBlockTypes()}/>
              </div>
              {urlInput}
              <div style={styles.editor} onClick={this.focus}>
                  <Editor
                    blockRenderMap={this.state.blockRenderMap}
                    blockStyleFn={this.state.blockStyleFn}
                    blockRendererFn={customBlockRender}
                    editorState={this.state.editorState}
                    customStyleMap={styleMap}
                    onChange={this.changeState}
                    handleKeyCommand={this.handleKeyCommand}
                    plugins={ plugins }
                    handleDrop={ this.handleDrop }
                    ref="editor"
                  />
              </div>
            </div>
            <Draggable>
              <img src="http://dummyimage.com/qvga"></img>
            </Draggable>
            <CharCounter editorState={ this.state.editorState } limit={20} />
          </div> : false
      );
    }
}

const onDragStart = (e) => {
  const { tagName, dataset } = e.target;
  e.dataTransfer.setData("draggable-data", JSON.stringify({
    blockType: tagNameToBlockType[tagName],
    data: {
      src: e.target.getAttribute('src'),
      dataset
    }
  }));
  e.dataTransfer.setData("text/plain", ' ');
}

const Draggable = ({ src, children }) => {
  return <div draggable onDragStart={ onDragStart }>
    { children }
  </div>
}


function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }
    className += ` RichEditor-styleButton--${this.props.modifier}`

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

      const styles = {
        root: {
          padding: 20,
        },
        dialog: {
          boxShadow: '0 -2px 25px 0 rgba(0, 0, 0, 0.15), 0 13px 25px 0 rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(0,0,0,.15)',
          display: 'flex',
          justifyContent: 'flex-start',
          flexDirection: 'column',
          alignItems: 'center'
        },
        tablecell: {
          border: '1px solid rgba(0,0,0,.15)',
          padding: '5px'
        },
        dialogInputs: {
          height: '1.2rem',
          margin: '.5rem 0',
        },
        buttons: {
          marginBottom: 10,
        },
        urlInputContainer: {
          marginBottom: 10,
        },
        urlInput: {
          fontFamily: '\'Georgia\', serif',
          marginRight: 10,
          padding: 3,
        },
        editor: {
          borderTop: '1px solid #ccc',
          cursor: 'text',
          minHeight: 80,
          padding: 10,
        },
        button: {
          marginTop: 10,
          textAlign: 'center',
        },
        link: {
          color: '#3b5998',
          textDecoration: 'underline',
        },
      };

