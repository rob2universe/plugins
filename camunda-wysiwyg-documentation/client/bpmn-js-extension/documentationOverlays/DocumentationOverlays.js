import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import { domify } from 'min-dom';
import { filter, sortBy } from 'lodash';

import {
  REMOVE_DOCUMENTATION_ORDER_EVENT,
  SET_DOCUMENTATION_ORDER_EVENT,
  TOGGLE_MODE_EVENT,
  UNSET_DOCUMENTATION_ORDER_EVENT,
  UPDATE_ELEMENT_EVENT
} from '../../utils/EventHelper';
import exportUtils from '../../utils/exportUtils';

const OFFSET_BOTTOM = 10,
      OFFSET_RIGHT = 15;

export default function DocumentationOverlays(eventBus, overlays, commandStack, elementRegistry) {
  const self = this;

  this._eventBus = eventBus;
  this._overlays = overlays;
  this._elementRegistry = elementRegistry;
  this.exportMode = false;

  function updateOverlays() {
    self.overlayIds = {};
    self.counter = 1;

    let utils = new exportUtils(self._elementRegistry);
    let allNodes = utils.getAllElementsWithDocumentationOrder();

    allNodes.forEach((element) => {
      let elementBo = getBusinessObject(element);
      addNewOverlay(element, elementBo.order);

      let split = elementBo.order.split('.');

      if (self.counter < +split[0]) {
        self.counter = +split[0];
      }
    });
  }

  function clearOverlays() {
    self.overlayIds = {};
    self.counter = 1;

    self._overlays.remove({ type: 'docOrder-badge' });
  }

  function newOverlayBadgeForDocOrder(element, counter) {
    const overlayHtml = domify(`<div class="documentation-order order-count" title="Documentation Order">${counter}</div>`);
    const position = { bottom: OFFSET_BOTTOM, right: OFFSET_RIGHT };
    return self._overlays.add(element, 'docOrder-badge', {
      position: position,
      html: overlayHtml,
      scale: { min: 1 }
    });
  }

  function addNewOverlay(element, counter) {
    const overlayId = newOverlayBadgeForDocOrder(element, counter);
    self.overlayIds[element.id] = {
      element: element,
      overlayId: overlayId,
      order: '' + counter
    };
  }

  function getNextDocOrder(counter) {
    let utils = new exportUtils(self._elementRegistry);
    if (!utils.notExistsDocOrder(undefined, counter)) {
      return getNextDocOrder(counter + 1);
    }
    return counter;
  }

  eventBus.on(TOGGLE_MODE_EVENT, 100, function(context) {
    self.exportMode = context.exportMode;

    if (context.exportMode) {
      updateOverlays();
    } else {
      clearOverlays();
    }
  });
  eventBus.on(UPDATE_ELEMENT_EVENT, function(context) {
    self._overlays.remove({ element: context.element, type: 'docOrder-badge' });

    if (self.exportMode) {
      addNewOverlay(context.element, context.order);
    }
  });
  eventBus.on(REMOVE_DOCUMENTATION_ORDER_EVENT, function(context) {
    let element = context.element;
    let bo = getBusinessObject(element);
    const overlayHistory = self.overlayIds[element.id];
    if (overlayHistory) {
      const overlayId = overlayHistory.overlayId;

      // Updating counter
      const removedCounter = overlayHistory.order.split('.');
      self.counter = +removedCounter[0] + 1;

      // Removing the overlay
      self._overlays.remove(overlayId);
      delete self.overlayIds[element.id];

      let command = cmdHelper.updateBusinessObject(element, bo, { order: undefined });
      commandStack.execute(command.cmd, command.context);
    }
  });

  eventBus.on(SET_DOCUMENTATION_ORDER_EVENT, function(context) {
    const element = context.element;
    const bo = getBusinessObject(element);

    if (!bo.get('order') && is(element, 'bpmn:FlowNode')) {
      let nextCounterValue = getNextDocOrder(self.counter);

      let command = cmdHelper.updateBusinessObject(element, bo, { order: '' + nextCounterValue });
      commandStack.execute(command.cmd, command.context);

      addNewOverlay(element, nextCounterValue);
      self.counter = nextCounterValue;
    }
  });

  eventBus.on(UNSET_DOCUMENTATION_ORDER_EVENT, function(context) {
    const element = context.element;
    const bo = getBusinessObject(element);

    if (bo.get('order') && is(element, 'bpmn:FlowNode')) {
      const overlayHistory = self.overlayIds[element.id];
      if (!overlayHistory) {
        return;
      }

      const commands = [];
      commands.push(cmdHelper.updateBusinessObject(element, bo, { order: undefined }));

      const overlayId = overlayHistory.overlayId;
      const removedCounter = overlayHistory.order;

      // Removing the overlay
      self._overlays.remove(overlayId);
      delete self.overlayIds[element.id];
      if (self.counter > 1) {
        self.counter--;
      }

      // Getting all the overlays with order > removedCounter and update them
      const toUpdate = sortBy(filter(self.overlayIds, (overlay) => {
        let split = overlay.order.split('.');
        return +split[0] >= removedCounter;
      }), ['order']);
      toUpdate.forEach((overlayIdObject) => {
        let updateBo = getBusinessObject(overlayIdObject.element);

        let split = overlayIdObject.order.split('.');
        split[0] = +split[0] - 1;
        let newOrder = split.join('.');
        commands.push(cmdHelper.updateBusinessObject(overlayIdObject.element, updateBo, { order: newOrder }));

        self._overlays.remove(overlayIdObject.overlayId);
        overlayIdObject.overlayId = newOverlayBadgeForDocOrder(overlayIdObject.element, newOrder);
        overlayIdObject.order = newOrder;
      });

      commands.forEach((command) => {
        commandStack.execute(command.cmd, command.context);
      });
    }
  });
}

DocumentationOverlays.$inject = ['eventBus', 'overlays', 'commandStack', 'elementRegistry'];