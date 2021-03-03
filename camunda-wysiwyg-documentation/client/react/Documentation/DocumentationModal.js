import React from 'camunda-modeler-plugin-helpers/react';
import { Modal } from 'camunda-modeler-plugin-helpers/components';

import DocumentationEditor from './DocumentationEditor';

// polyfill upcoming structural components
const Title = Modal.Title || (({ children }) => <h2>{children}</h2>);
const Body = Modal.Body || (({ children }) => <div>{children}</div>);
const Footer = Modal.Footer || (({ children }) => <div>{children}</div>);

const documentationModal = (props) => {

  return <Modal onClose={props.close} className="documentationModal">
    <Title>Documentation</Title>
    <Body>
      <form id="documentationForm" onSubmit={props.close}>
        <DocumentationEditor editorState={props.editorState} onChange={props.onEditorChange}/>
      </form>
    </Body>
    <Footer>
      <div id="documentationButtons">
        <button type="submit" className="btn btn-secondary" form="documentationForm">Close</button>
      </div>
    </Footer>
  </Modal>;
};

export default documentationModal;