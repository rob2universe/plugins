import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import exportUtils from '../../../utils/exportUtils';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import { UPDATE_ELEMENT_EVENT, REMOVE_DOCUMENTATION_ORDER_EVENT } from '../../../utils/EventHelper';

export default function(translate, elementRegistry, eventBus, element) {
  return entryFactory.validationAwareTextField(translate, {
    id: 'documentation-order',
    label: 'Documentation order',
    modelProperty: 'order',
    validate: function(el, values) {
      let utils = new exportUtils(elementRegistry);
      let newValue = values['order'];
      if (newValue) {

        if (!/^(\d+\.)*(\d+)$/.test(newValue)) {
          return { 'order': 'Value must be a number, optionally split by dots' };
        }
        if (!utils.notExistsDocOrder(el.id, newValue)) {
          return { 'order': 'Value already exists' };
        }
      }
      return {};
    },
    getProperty: function(elem) {
      let bo = getBusinessObject(elem);
      return bo.get('order');
    },
    setProperty: function(elem, values) {
      let res = {};
      let value = values['order'];
      if (value !== undefined) {
        res['order'] = value;
        if (value) {
          eventBus.fire(UPDATE_ELEMENT_EVENT, {
            element: elem,
            order: value
          });
        } else {
          eventBus.fire(REMOVE_DOCUMENTATION_ORDER_EVENT, {
            element: elem
          });
        }
      }
      return cmdHelper.updateProperties(element, res);
    }
  });
}