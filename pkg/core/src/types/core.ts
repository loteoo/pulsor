// === Generic

export type Falsy = false | null | undefined;
export type TextElement = string | number | bigint;
export type State = Record<string, any>



// === Actions

export type EventData = any;

// Task
export type Emitter = (eventName: string, payload?: EventData) => void;
export type TaskCleanupFunction = () => void | Promise<void>;
export type TaskRunner = (emit: Emitter, payload?: EventData) => TaskCleanupFunction | void;

export interface Task {
  vNode?: VNode;
  payload?: EventData;
  run: TaskRunner;
  [x: string]: any; // in reality, EventHandler;
}

// Update
export type Update = Record<string, any>

// Action
export type ActionFunction = (state: State, payload?: EventData) => Action;

export type Action =
  | Update
  | ActionFunction // Nested action based on state
  | Array<Action> // Nested action
  | Task
  | Falsy



// === VNode

export type Context = Record<string, any>
export type ContextProp = Context | ((ctx: Context) => Context);

// Props you can set on both props and vNode directly
export interface LogicalProps {
  key: string;
  init: Action;
  clear: Action;
  ctx: ContextProp;
}

// Props

export type AllEventNames = keyof HTMLElementEventMap;
export type OnEventNames = `on${AllEventNames}`
export type EventProps = Record<OnEventNames, Action>;

export type CSSProperties = Record<keyof CSSStyleDeclaration, any>;
export type CSSProp = string | Partial<CSSProperties>;

export type ClassObject = Record<string, boolean>;
export type ClassProp = string | ClassObject;

export type SpecialProps = {
  style: CSSProp;
  class: ClassProp;
}

export type HtmlProps = Record<string, any>;

export type VProps = Partial<LogicalProps & EventProps & SpecialProps & HtmlProps>;

// Children

export type VChildNodeFunction<S extends State = State> = ((state: S, ctx: Context) => VChildNode<S>)

export type VChildNode<S extends State = State> =
  | VNode<S>
  | VChildNodeFunction<S>
  | Array<VChildNode<S>>
  | TextElement
  | Falsy;

// VNode

export interface VNode<S extends State = State> extends Partial<LogicalProps> {
  type?: string;
  props?: VProps;
  children?: VChildNode<S>;
  text?: TextElement;

  // Maybe move somewhere else
  clearTasks?: TaskCleanupFunction[];

  // TODO: maybe only 1 is needed, maybe move to "LogicalProps" type
  el?: Node;
  mount?: Node; /* Node on which to mount child elements onto */
}

export type Component = (...args: any[]) => VChildNode;


// Internals

export interface Cycle {
  state: State,
  needsRerender: boolean;
  domEmitter: any;
  createEmitter: any;
  tasks: Task[];
}
