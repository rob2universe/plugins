import React, { Fragment, Component } from 'camunda-modeler-plugin-helpers/react';
import { Fill } from 'camunda-modeler-plugin-helpers/components';
import classNames from 'classnames';
import { find } from 'lodash';

import exporter from '../../utils/exporter';
import exportUtils, { DIAGRAM_FLOW, DOCUMENTATION_ORDER_FLOW } from '../../utils/exportUtils';

import { TOGGLE_MODE_EVENT } from '../../utils/EventHelper';

const defaultState = {
  modeler: null,
  tabModeler: [],
  tabId: null,
  exportMode: false
};

class ExportToolbar extends Component {
  constructor(props) {
    super(props);

    this.state = defaultState;
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
      // eslint-disable-next-line react/prop-types
      subscribe
    } = this.props;

    subscribe('bpmn.modeler.created', ({ modeler, tab }) => {
      const { tabModeler } = this.state;
      this.setState({
        modeler: modeler,
        tabModeler: [...tabModeler, { tabId: tab.id, modeler: modeler, exportMode: false }],
        tabId: tab.id
      });
    });

    subscribe('app.activeTabChanged', (tab) => {
      const {
        tabModeler
      } = this.state;
      let activeTabId = tab.activeTab.id;
      const activeTab = find(tabModeler, { tabId: activeTabId });
      if (activeTab) {
        this.setState({ modeler: activeTab.modeler, tabId: activeTabId, exportMode: activeTab.exportMode });
      }
    });
  }

  exportDiagram = async (modeler, flowType) => {
    const {
      config
    } = this.props;
    const elementRegistry = modeler.get('elementRegistry');
    const canvas = modeler.get('canvas');

    // Ottengo tutti gli elementi che presentano documentazione
    let utils = new exportUtils(elementRegistry);
    let elementsToExport = [];

    switch (flowType) {
    case DIAGRAM_FLOW: {
      let startEvents = utils.getStartEvents();
      startEvents.forEach((startEvent) => {
        elementsToExport = elementsToExport.concat(utils.navigateFromStartEvent(startEvent));
      });
      break;
    }
    case DOCUMENTATION_ORDER_FLOW:
      elementsToExport = utils.getAllElementsWithDocumentationOrder();
      break;
    }

    if (elementsToExport.length > 0) {

      let svgImage;
      let errorSvg;

      try {
        const { svg } = await modeler.saveSVG();
        svgImage = svg;
      } catch (err) {
        errorSvg = err;
      }

      if (!errorSvg) {
        let file = {
          contents: exporter(elementsToExport, flowType, canvas, svgImage).export(),
          name: 'documentation.html',
          fileType: 'html'
        };
        let savePath = await config.backend.send('dialog:save-file', {
          title: 'Export Documentation',
          saveAs: true,
          filters: [{ name: 'HTML', extensions: ['html'] }],
          file: file
        });

        if (savePath) {
          config.backend.send('file:write', savePath, file, { encoding: 'utf8', fileType: 'html' }).then((resolve) => {
            if (resolve) {
              config.backend.send('dialog:show', {
                message: 'Documentation was exported correctly!',
                title: 'Exported documentation',
                type: 'info'
              });
            }
          }).catch(error => {
            this.props.log.error(error);
            config.backend.send('dialog:show', {
              message: 'Unexpected failure exporting documentation!',
              title: 'Error exporting documentation',
              type: 'error'
            });
          });
        }
      } else {
        this.props.log.error(errorSvg);
        config.backend.send('dialog:show', {
          message: 'Unexpected failure getting bpmn image!',
          title: 'Error exporting documentation',
          type: 'error'
        });
      }
    } else {
      config.backend.send('dialog:show', {
        message: 'No elements to export!',
        title: 'Error exporting documentation',
        type: 'error'
      });
    }
  };

  toggleExportMode = (tabId) => {
    const {
      tabModeler
    } = this.state;
    const activeTab = find(tabModeler, { tabId: tabId });
    this.setState(prevState => {
      let eventBus = activeTab.modeler.get('eventBus');
      let exportMode = !prevState.exportMode;
      eventBus.fire(TOGGLE_MODE_EVENT, {
        exportMode: exportMode,
        fromModeler: true
      });
      return {
        exportMode: exportMode,
        tabModeler: [...tabModeler, { modeler: activeTab.modeler, tabId: tabId, exportMode: exportMode }]
      };
    });
  };

  render() {
    const {
      tabModeler,
      tabId
    } = this.state;
    const activeTab = find(tabModeler, { tabId: tabId });

    return (
      <Fragment>
        <Fill slot="toolbar" group="9_n_exportDocumentation">
          <button title="Export mode" type="button" className={classNames('toolbarBtn', this.state.exportMode ? 'active' : null)}
            onClick={() => {this.toggleExportMode(tabId);}}><span className="icon-button bpmn-icon-screw-wrench"/>
          </button>
          <button title="Export on diagram flow" type="button" className={classNames('exportBtn', 'toolbarBtn')} onClick={() => {
            this.exportDiagram(activeTab.modeler, DIAGRAM_FLOW);
          }}/>
          <button title="Export on documentation order" type="button" className={classNames('exportBtn', 'toolbarBtn')} onClick={() => {
            this.exportDiagram(activeTab.modeler, DOCUMENTATION_ORDER_FLOW);
          }}/>
        </Fill>
      </Fragment>
    );
  }
}

export default ExportToolbar;