import exportUtils from '../../client/utils/exportUtils';

import Modeler from 'bpmn-js/lib/Modeler';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

describe('Test element navigation from a fake startEvent', () => {

  const utils = new exportUtils(undefined);

  it('should return an empty array', () => {
    let resultArray = utils.navigateFromStartEvent();
    expect(resultArray).to.be.an('array').that.is.empty;
  });

  it('should navigate on 2 elements', () => {
    let startEvent = {
      id: 'A',
      $type: 'bpmn:StartEvent',
      $instanceOf: (type) => {
        return type === 'bpmn:StartEvent';
      },
      outgoing: [
        {
          id: 'S1',
          $type: 'bpmn:SequenceFlow',
          $instanceOf: (type) => {
            return type === 'bpmn:SequenceFlow';
          },
          target: {
            id: 'B',
            $type: 'bpmn:EndEvent',
            $instanceOf: (type) => {
              return type === 'bpmn:EndEvent';
            },
            outgoing: []
          }
        }
      ]
    };

    let resultArray = utils.navigateFromStartEvent(startEvent);
    expect(resultArray).to.be.an('array').to.have.lengthOf(2);
  });

  it('should navigate on 3 elements \'in-a-row\'', () => {
    let startEvent = {
      id: 'A',
      $type: 'bpmn:StartEvent',
      $instanceOf: (type) => {
        return type === 'bpmn:StartEvent';
      },
      outgoing: [
        {
          id: 'S1',
          $type: 'bpmn:SequenceFlow',
          $instanceOf: (type) => {
            return type === 'bpmn:SequenceFlow';
          },
          target: {
            id: 'B',
            $type: 'bpmn:Task',
            $instanceOf: (type) => {
              return type === 'bpmn:Task';
            },
            outgoing: [
              {
                id: 'S2',
                type: 'bpmn:SequenceFlow',
                $instanceOf: (type) => {
                  return type === 'bpmn:SequenceFlow';
                },
                target: {
                  id: 'C',
                  type: 'bpmn:EndEvent',
                  $instanceOf: (type) => {
                    return type === 'bpmn:EndEvent';
                  },
                  outgoing: []
                }
              }
            ]
          }
        }
      ]
    };

    let resultArray = utils.navigateFromStartEvent(startEvent);
    expect(resultArray).to.be.an('array').to.have.lengthOf(3);
  });

  it('should navigate on two different branches and find 5 elements', () => {
    let startEvent = {
      id: 'A',
      $type: 'bpmn:StartEvent',
      $instanceOf: (type) => {
        return type === 'bpmn:StartEvent';
      },
      outgoing: [
        {
          id: 'S_Gateway',
          $type: 'bpmn:SequenceFlow',
          $instanceOf: (type) => {
            return type === 'bpmn:SequenceFlow';
          },
          target: {
            id: 'Gateway',
            $type: 'bpmn:Gateway',
            $instanceOf: (type) => {
              return type === 'bpmn:Gateway';
            },
            outgoing: [
              {
                id: 'S1',
                $type: 'bpmn:SequenceFlow',
                $instanceOf: (type) => {
                  return type === 'bpmn:SequenceFlow';
                },
                target: {
                  id: 'B',
                  $type: 'bpmn:Task',
                  $instanceOf: (type) => {
                    return type === 'bpmn:Task';
                  },
                  outgoing: [
                    {
                      id: 'S2',
                      type: 'bpmn:SequenceFlow',
                      $instanceOf: (type) => {
                        return type === 'bpmn:SequenceFlow';
                      },
                      target: {
                        id: 'C',
                        type: 'bpmn:EndEvent',
                        $instanceOf: (type) => {
                          return type === 'bpmn:EndEvent';
                        },
                        outgoing: []
                      }
                    }
                  ]
                }
              },
              {
                id: 'S3',
                $type: 'bpmn:SequenceFlow',
                $instanceOf: (type) => {
                  return type === 'bpmn:SequenceFlow';
                },
                target: {
                  id: 'D',
                  $type: 'bpmn:Task',
                  $instanceOf: (type) => {
                    return type === 'bpmn:Task';
                  },
                  outgoing: [
                    {
                      id: 'S4',
                      type: 'bpmn:SequenceFlow',
                      $instanceOf: (type) => {
                        return type === 'bpmn:SequenceFlow';
                      },
                      target: {
                        id: 'E',
                        type: 'bpmn:EndEvent',
                        $instanceOf: (type) => {
                          return type === 'bpmn:EndEvent';
                        },
                        outgoing: []
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    };

    let resultArray = utils.navigateFromStartEvent(startEvent);
    expect(resultArray).to.be.an('array').to.have.lengthOf(6);
  });
});

import simpleDiagram from './simple.bpmn';
import subProcessDiagram from './subprocess.bpmn';
import boundaryEventDiagram from './boundary-event.bpmn';
import completionDiagram from './completion.bpmn';

describe('Test element navigation from real BPMNs', () => {
  describe('simple', () => {

    let startEvent;
    let utils;

    beforeEach(bootstrapModeler(simpleDiagram, {
      additionalModules: [].concat(Modeler.prototype._modules)
    }));

    beforeEach(inject(function(elementRegistry) {
      utils = new exportUtils(elementRegistry);
      startEvent = elementRegistry.get('StartEvent_1');
    }));

    it('should navigate through 9 elements', function(done) {
      let resultArray = utils.navigateFromStartEvent(startEvent);
      expect(resultArray).to.be.an('array').to.have.lengthOf(9);
      done();
    });
  });

  describe('subprocess', () => {

    let startEvent;
    let utils;

    beforeEach(bootstrapModeler(subProcessDiagram, {
      additionalModules: [].concat(Modeler.prototype._modules)
    }));

    beforeEach(inject(function(elementRegistry) {
      utils = new exportUtils(elementRegistry);
      startEvent = elementRegistry.get('StartEvent_1');
    }));

    it('should navigate through 6 elements', function(done) {
      let resultArray = utils.navigateFromStartEvent(startEvent);
      expect(resultArray).to.be.an('array').to.have.lengthOf(6);
      done();
    });
  });

  describe('boundaryEvent', () => {

    let startEvent;
    let utils;

    beforeEach(bootstrapModeler(boundaryEventDiagram, {
      additionalModules: [].concat(Modeler.prototype._modules)
    }));

    beforeEach(inject(function(elementRegistry) {
      utils = new exportUtils(elementRegistry);
      startEvent = elementRegistry.get('StartEvent');
    }));

    it('should navigate through 10 elements', function(done) {
      let resultArray = utils.navigateFromStartEvent(startEvent);

      expect(resultArray).to.be.an('array').to.have.lengthOf(10);
      done();
    });
  });

  describe('completion', () => {

    let startEvent;
    let utils;

    beforeEach(bootstrapModeler(completionDiagram, {
      additionalModules: [].concat(Modeler.prototype._modules)
    }));

    beforeEach(inject(function(elementRegistry) {
      utils = new exportUtils(elementRegistry);
      startEvent = elementRegistry.get('StartEvent');
    }));

    it('should navigate through 8 elements', function(done) {
      let resultArray = utils.navigateFromStartEvent(startEvent);

      expect(resultArray).to.be.an('array').to.have.lengthOf(8);
      done();
    });
  });

});