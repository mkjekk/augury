import { Observable } from 'rxjs';

import { serialize } from '../../../utils/serialize'

import { MessagePipeBackend, MessageType, Message } from 'feature-modules/.lib';

// module deps
import { MutableTree, Node, Path } from '../module-dependencies.barrel';

export class ChangeDetectionProfiler {

  // injectables
  private _pipe: MessagePipeBackend;
  private _componentTree: MutableTree;
  private _appRef: any;
  private _nodeTree$: Observable<MutableTree>;

  // internals
  private _ngZone: any;
  private _innerZoneFork: any;
  private _topComponent: any;
  private _cyclesThisSecond: number = 0;
  // private _metricsPerSecondInterval;
  private _nodesCheckedThisCycle = {};
  private _trigger:any = undefined;
  private _inCycle: boolean = false;

  constructor() {
    (<any> window).n = this._nodesCheckedThisCycle
  }


  // --- Public Methods ---

  /**
   * @returns boolean
   */
  public isReady() {
    return (
      !!this._pipe &&
      !!this._componentTree
    );
  }

  watchNode = (node) => {
    if (node.isComponent) {

      const wrapDoCheck = (wrapped) => () => {
        this._nodesCheckedThisCycle[node.id] = merge(this._nodesCheckedThisCycle[node.id], {
          checked: true,
          componentName: node.name,
          startTime: Date.now(),
          changeDetectionType: node.changeDetection,
        })
        if (wrapped) return wrapped()
      }
      node.angularNode().ngDoCheck = wrapDoCheck(node.angularNode().ngDoCheck)

      const wrapOnChanges = (wrapped) => (changes) => {
        this._nodesCheckedThisCycle[node.id] = merge(this._nodesCheckedThisCycle[node.id], {
          propsChanged: true,
          changes,
        })
        if (wrapped) return wrapped()
      }
      node.angularNode().ngOnChanges = wrapOnChanges(node.angularNode().ngOnChanges)

      const wrapViewChecked = (wrapped) => () => {
        this._nodesCheckedThisCycle[node.id] = merge(this._nodesCheckedThisCycle[node.id], {
          viewCheckedFinishedAt: Date.now(),
          totalCheckTime: Date.now() - this._nodesCheckedThisCycle[node.id].startTime
        })
        if (wrapped) return wrapped()
      }
      node.angularNode().ngAfterViewChecked = wrapViewChecked(node.angularNode().ngAfterViewChecked)

    }
  }

  // --- Injectables ----

  /**
   */
  public useComponentTreeInstance(componentTree: MutableTree) {
    this._componentTree = componentTree;
  }

  /**
   */
  // TODO: clean this out, shouldnt be in the injection function
  public useApplicationRef(appRef){
    this._appRef = appRef;
    this._ngZone = this._appRef._zone;
    let cause,
        tree_snap,
        running_start,
        running_time,
        change_detection_start,
        change_detection_time;
    this._ngZone.augury_onQueueTask.subscribe((queue) => {
      console.log('queued task', queue)
      this._pipe.sendSimple({
        messageType: MessageType.CDP_QueuedTask,
        content: { queue: queue.map(task => ({
          type: task.type,
          eventName: task.eventName,
          source: task.source,
          callbackFnName: task.callback.name,
          targetType: task.target.constructor.name,
          targetClasses: Array.from(task.target.classList),
          targetAttributes: task.target.getAttributeNames(),
          _id: task._id
        })) }
      })
    })
    this._ngZone.augury_onDequeueTask.subscribe((queue) => {
      console.log('dequeued task', queue)
      this._pipe.sendSimple({
        messageType: MessageType.CDP_DequeuedTask,
        content: { queue: queue.map(task => task.type) }
      })
    })
    this._ngZone.augury_onInvokeTask.subscribe((task) => {
      console.log(task)
    })
    this._ngZone.onUnstable.subscribe(() => {
      running_time = 0
      running_start = Date.now()
      console.log('unstable')
    })
    this._ngZone.onStable.subscribe(() => {
      change_detection_time = Date.now() - change_detection_start
      console.log('stable, change detection time: ' + change_detection_time)
      this._pipe.sendSimple({
        messageType: MessageType.CDP_Tick,
        content: {
          tick: {
            id: running_start,
            tree_snap: serialize(tree_snap),
            start_time: running_start,
            running_time,
            change_detection_time,
            nodesChecked: this._nodesCheckedThisCycle
          }
        }
      })
      this._nodesCheckedThisCycle = {}
      this._cyclesThisSecond++;
    })
    this._topComponent = this._appRef.components[0].instance;
    this._topComponent.ngDoCheck = () => {
      change_detection_start = Date.now()
      running_time = Date.now() - running_start
      console.log('start change detection, running time: ' + running_time);
    };
    this._nodeTree$.subscribe(treeSnapshot => {
      tree_snap = treeSnapshot
    })
  }

  /**
   */
  public useNodeTree(nodeTree$: Observable<MutableTree>) {
    this._nodeTree$ = nodeTree$;
  }

  /**
   */
  public useMessagePipe(pipe: MessagePipeBackend) {
    this._pipe = pipe;
    this._pipe.addHandler((message: Message<any>) => {
      switch (message.messageType) {


      }
    });

    /* this._metricsPerSecondInterval = setInterval(() => {
      this._pipe.sendSimple({
        messageType: MessageType.CDP_MetricsPerSecond,
        content: {
          cycles: this._cyclesThisSecond
        }
      })
      this._cyclesThisSecond = 0;
    }, 1000);
   */
  }

}

const merge = (...objs) => Object.assign({}, ...objs.filter(obj => typeof obj === 'object'))
