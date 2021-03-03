import React from 'camunda-modeler-plugin-helpers/react';

import { Editor } from 'react-draft-wysiwyg';
import { EditorState, RichUtils, Modifier } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const documentationEditor = (props) => {

  function uploadImageCallBack(file) {
    return new Promise(
      (resolve, reject) => {
        const reader = new FileReader();
        let img = new Image();

        // let url = ''
        reader.onload = function(e) {
          img.src = reader.result;
          resolve({
            data: {
              link: img.src
            }
          });
        };
        reader.onerror = function(event) {
          reader.abort();
          reject('Failed to read file!\n\n' + reader.error);
        };

        reader.readAsDataURL(file);
      });
  }

  function onTab(event, editorState, maxDepth) {
    const selection = editorState.getSelection();
    const key = selection.getAnchorKey();

    if (key !== selection.getFocusKey()) {
      return editorState;
    }

    const content = editorState.getCurrentContent();
    const block = content.getBlockForKey(key);
    const type = block.getType();

    if (type === 'unordered-list-item' && type === 'ordered-list-item') {
      return RichUtils.onTab(event, editorState, maxDepth);
    }

    const tabCharacters = ' '.repeat(maxDepth);
    let newContentState = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      tabCharacters
    );
    return EditorState.push(editorState, newContentState, 'insert-characters');
  }

  return (<div>
    <Editor
      editorState={props.editorState}
      wrapperClassName="docEditor-wrapper"
      editorClassName="docEditor"
      toolbarClassName="docEditor-toolbar"
      onEditorStateChange={props.onChange}
      localization={{
        locale: 'it',
      }}
      toolbar={{
        image: {
          uploadCallback: uploadImageCallBack,
          alt: { present: true, mandatory: false },
        },
        fontFamily: {
          options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Courier New', 'Verdana']
        }
      }}
      onTab={(event) => {
        event.preventDefault();
        event.stopPropagation();

        const maxDepth = 4;
        props.onChange(onTab(event, props.editorState, maxDepth));
        return true;
      }}
    />
  </div>);
};

export default documentationEditor;