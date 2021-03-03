import {
  SET_DOCUMENTATION_ORDER_EVENT,
  TOGGLE_MODE_EVENT,
  UNSET_DOCUMENTATION_ORDER_EVENT,
  UPDATE_ELEMENTS_EVENT
} from '../../utils/EventHelper';

var HIGH_PRIORITY = 10001;

export default function ExportMode(eventBus) {
  const self = this;

  this._eventBus = eventBus;
  this.exportMode = false;

  eventBus.on(TOGGLE_MODE_EVENT, HIGH_PRIORITY, function(context) {
    self.exportMode = context.exportMode;

    if (self.exportMode) {
      self._eventBus.on('selection.changed', 200, self.selectElement);
      self._eventBus.on('element.contextmenu', 200, self.rightSelectElement);
    } else {
      self._eventBus.off('selection.changed', self.selectElement);
      self._eventBus.off('element.contextmenu', self.rightSelectElement);
    }
  });

  this.selectElement = (event) => {
    let selection = event.newSelection;

    if (selection.length === 1) {
      self._eventBus.fire(SET_DOCUMENTATION_ORDER_EVENT, {
        element: selection[0]
      });
    }
  };

  this.rightSelectElement = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { element } = event;
    self._eventBus.fire(UNSET_DOCUMENTATION_ORDER_EVENT, {
      element: element
    });
  };
}

ExportMode.$inject = [
  'eventBus'
];