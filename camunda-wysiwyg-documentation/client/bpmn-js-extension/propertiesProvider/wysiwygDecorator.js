import { domify, query as domQuery } from 'min-dom';

import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import { getCorrectBusinessObject } from './utils';

import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';

const wysiwygDecorator = function(translate, eventBus, commandStack, bpmnFactory, entry) {

  let htmlObject = entry.html;
  if (typeof entry.html === 'string') {
    htmlObject = domify(entry.html);
  }

  let label = domQuery('label', htmlObject).innerHTML;
  let modelProperty = domQuery('div#camunda-' + entry.id, htmlObject).getAttribute('name');

  let getValue = function(businessObject) {
    let documentations = businessObject && businessObject.get('documentation'),
        text = (documentations && documentations.length > 0) ? documentations[0].text : '';

    return { documentation: text };
  };

  let setValue = function(businessObject, element, values) {
    let newObjectList = [];

    if (typeof values.documentation !== 'undefined' && values.documentation !== '') {
      newObjectList.push(bpmnFactory.create('bpmn:Documentation', {
        text: values.documentation
      }));
    }

    return cmdHelper.setList(element, businessObject, 'documentation', newObjectList);
  };

  return entryFactory.textField(translate, {
    label: label,
    id: entry.id,
    modelProperty: modelProperty,
    buttonLabel: 'Edit',
    disabled: function() {
      return true;
    },
    buttonAction: {
      name: 'openRichTextEditor',
      method: function(element, inputNode) {
        eventBus.fire('wysiwyg.open', {
          element: element,
          node: inputNode,
          data: entry.get(element).documentation,
          isProcessDocumentation: entry.id !== modelProperty
        });

        eventBus.once('wysiwyg.saveData', 10000, function(event) {
          const { element, data, isProcessDocumentation } = event;
          let updateElement = setValue(getCorrectBusinessObject(element, isProcessDocumentation), element, { documentation: data });
          if (updateElement) {
            commandStack.execute(updateElement.cmd, updateElement.context);
          }
          return false;
        });

        return true;
      }
    },
    buttonShow: {
      name: 'showRichTextEditor',
      method: function() { return true; }
    },
    get: function(element) {
      return getValue(getCorrectBusinessObject(element, entry.id !== modelProperty));
    },
    set: function() {
      return null;
    }
  });
};

export default wysiwygDecorator;