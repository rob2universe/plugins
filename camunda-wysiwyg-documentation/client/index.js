import {
  registerBpmnJSModdleExtension,
  registerBpmnJSPlugin, registerClientExtension
} from 'camunda-modeler-plugin-helpers';

import BpmnExtensionModule from './bpmn-js-extension';
import WysiwygFragment from './react/Documentation/WysiwygFragment';
import ExportToolbar from './react/ExportToolbar/ExportToolbar';

import documentationModdle from './bpmn-js-extension/propertiesProvider/moddle/documentation.json';

registerBpmnJSPlugin(BpmnExtensionModule);
registerBpmnJSModdleExtension(documentationModdle);

registerClientExtension(WysiwygFragment);
registerClientExtension(ExportToolbar);
