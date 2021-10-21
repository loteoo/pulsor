// Utils
type HyperScript = (type: string, props?: VProps, ...children: VChildNode[]) => VDomElement;
type JSXPragma = (type: string | Component, props?: VProps, ...children: VChildNode[]) => VChildNode;

// Generic
type Falsy = false | null | undefined;
type DomElement = HTMLElement | Text | Comment;

// App
type State = Record<string, any>;
type Selector = (state: State) => any;
type Transform = (state: State) => State;
type Dispatch = (eventName: string, handler: Action, payload?: any) => void;

interface Cycle {
  state: State,
  needsRerender: boolean;
  domEmitter: any;
  createEmitter: any;
}

// Actions
type Emitter = (eventName: string, payload?: any) => void;
type TaskRunner = (emit: Emitter) => void;
type EventKey = string;

interface Task {
  run: TaskRunner;
  [x: string]: any; // in reality, EventHandler;
}

type Action =
  | State
  | ((state: State, payload?: any) => Action) // Nested action based on state
  | Array<Action> // Nested action
  | Task
  | Falsy


// Vdom

type VProps = Record<string, any | Action>;

type VTextElement = string | number | bigint;

interface VDomElement {
  type?: string;
  props?: VProps;
  children?: VChildNode;
  key?: string;
  init?: Action;
  listener?: Listener;
}

type ListenerCleanupFn = () => void;
type Listener = (emit: Emitter) => ListenerCleanupFn;

type VElement =
  | VTextElement
  | VDomElement;

type VChildNodeFn = ((state: State) => VChildNode)

type VChildNode = // Maybe rename this "VChildNode"
  | VElement
  | VChildNodeFn
  | Array<VChildNode>
  | Falsy;

type Component = (...args: any[]) => VChildNode;
