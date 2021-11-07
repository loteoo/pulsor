// Utils
type HyperScript = (type: string, props?: VProps, ...children: VChildNode[]) => VNode;
type JSXPragma = (type: string | Component, props?: VProps, ...children: VChildNode[]) => VChildNode;
type FragmentPragma = (props?: VProps, ...children: VChildNode[]) => VChildNode;

// Generic
type Falsy = false | null | undefined;

// App
type State = Record<string, any>;
type Selector = (state: State) => any;
type Transform = (state: State) => State;
type Dispatch = (eventName: string, handler: Action, payload?: any, isFromView?: boolean) => void;

interface Cycle {
  state: State,
  needsRerender: boolean;
  domEmitter: any;
  createEmitter: any;
  dispatch: Dispatch;
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
  | ActionFunction // Nested action based on state
  | Array<Action> // Nested action
  | Task
  | Falsy

type ActionFunction = (state: State, payload?: any) => Action;

// Vdom

type VProps = Record<string, any | Action>;

type TextElement = string | number | bigint;

interface VNode {
  type?: string;
  props?: VProps;
  children?: VChildNode;
  text?: TextElement;
  key?: string;
  init?: Action;
  cleanup?: Action;
  listener?: Listener | ListenerCleanupFunction;
  el?: Node;
  mount?: Node;
}

type ListenerCleanupFunction = () => void;
type Listener = (emit: Emitter) => ListenerCleanupFunction;

type VChildNodeFunction = ((state: State) => VChildNode)

type VChildNode =
  | VNode
  | VChildNodeFunction
  | Array<VChildNode>
  | TextElement
  | Falsy;

type Component = (...args: any[]) => VChildNode;
