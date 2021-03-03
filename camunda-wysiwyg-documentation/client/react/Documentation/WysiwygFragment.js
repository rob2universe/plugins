import React, { Fragment, PureComponent } from 'camunda-modeler-plugin-helpers/react';

import DocumentationModal from './DocumentationModal';

import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

const defaultState = {
  modalOpen: false,
  element: null,
  node: null,
  editorState: EditorState.createEmpty()
};

export default class WysiwygFragment extends PureComponent {

  constructor(props) {
    super(props);

    this.state = defaultState;

    this.closeModal = this.closeModal.bind(this);
    this.onEditorStateChange = this.onEditorStateChange.bind(this);
  }

  componentDidMount() {

    /**
     * The component props include everything the Application offers plugins,
     * which includes:
     * - config: save and retrieve information to the local configuration
     * - subscribe: hook into application events, like <tab.saved>, <app.activeTabChanged> ...
     * - triggerAction: execute editor actions, like <save>, <open-diagram> ...
     * - log: log information into the Log panel
     * - displayNotification: show notifications inside the application
     */
    const {
      subscribe,
      displayNotification,
      triggerAction
    } = this.props;

    const saveTab = ({ activeTab }) => {
      if (activeTab.file && activeTab.file.path) {

        // trigger a tab save operation
        triggerAction('save')
          .then(tab => {
            if (!tab) {
              return displayNotification({ title: 'Failed to save' });
            }
          });
      }
    };

    subscribe('bpmn.modeler.created', ({ modeler }) => {
      this._eventBus = modeler.get('eventBus');
      this._eventBus.on('wysiwyg.open', (event) => {

        // Received command to open the modal for documentation
        let editorState = EditorState.createEmpty();
        if (event.data) {
          const { contentBlocks, entityMap } = htmlToDraft(event.data);
          editorState = EditorState.createWithContent(ContentState.createFromBlockArray(contentBlocks, entityMap));
        }
        this.setState({
          modalOpen: true,
          element: event.element,
          node: event.node,
          editorState: editorState,
          isProcessDocumentation: event.isProcessDocumentation
        });
      });
    });

    subscribe('app.activeTabChanged', saveTab);
    subscribe('close-all-tabs', saveTab);
  }

  closeModal() {
    let currentState = { ...this.state };
    const { element, node, isProcessDocumentation, editorState } = currentState;
    this.setState({
      ...defaultState
    });
    let data = null;
    if (editorState.getCurrentContent().hasText()) {
      data = draftToHtml(convertToRaw(editorState.getCurrentContent()));
      data = data.replace(/(\r\n|\n|\r)/gm, '');
    }
    this._eventBus.fire('wysiwyg.saveData', { element, node, isProcessDocumentation, data: data });
  }

  onEditorStateChange(editorState) {
    this.setState({
      editorState
    });
  }

  render() {
    const { modalOpen, editorState } = this.state;

    return <Fragment>
      {modalOpen && (
        <DocumentationModal editorState={editorState} onEditorChange={this.onEditorStateChange}
          close={this.closeModal}/>
      )}
    </Fragment>;
  }
}