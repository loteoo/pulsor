// === Generic
export type Falsy = false | null | undefined | void;
export type TextElement = string | number | bigint;
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

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
export type Update<S = State> = {
  [K in keyof S]?: S[K] | ((v: S[K]) => S[K]) | Update<S[K]>;
};

// Action
export type ActionFunction<S = State> = (state: S, payload?: EventData) => Action<S>;

export type ActionItem<S = State> = Update<S> | Task;

export type Action<S = State> =
  | ActionItem<S>
  | ActionFunction<S> // Nested action based on state
  | Array<Action<S>> // Nested action
  | Falsy;



// === VNode

export type Context = Record<string, any>;
export type ContextProp = Context | ((ctx: Context) => Context);
export type Key = any;

// Props you can set on both props and vNode directly
export interface LogicalProps {
  key: Key;
  init: Action | Action<unknown>;
  clear: Action | Action<unknown>;
  ctx: ContextProp;
};

// Props

export type AllEventNames = keyof HTMLElementEventMap;
export type OnEventNames = `on${AllEventNames}`;
export type EventProps = Record<OnEventNames, Action | Action<unknown>>;

export type CSSProperties = Record<keyof CSSStyleDeclaration, any>;
export type CSSProp = string | Partial<CSSProperties>;

export type ClassObject = Record<string, boolean>;
export type ClassProp = string | ClassObject;

export type SpecialProps = {
  style: CSSProp;
  class: ClassProp;
};

export type HtmlProps = Record<string, any>;

export type VProps = Partial<LogicalProps & EventProps & SpecialProps & HtmlProps>;

// Children

export type VChildNodeFunction<S = State> = ((state: S, ctx: Context) => VChildNode<S>);

export type VChildNode<S = State> =
  | VNode<S>
  | VChildNodeFunction<S>
  | Array<VChildNode<S>>
  | TextElement
  | Falsy;

// VNode

export interface VNode<S = State> extends Partial<LogicalProps> {
  type?: string;
  props?: VProps;
  children?: VChildNode<S>;
  text?: TextElement;

  // Maybe move somewhere else
  clearTasks?: TaskCleanupFunction[];

  // TODO: maybe only 1 is needed, maybe move to "LogicalProps" type
  el?: Node;
  mount?: Node; /* Node on which to mount child elements onto */
};

export type Component<S = State> = (...args: any[]) => VChildNode<S>;

export type HyperScript = <T = string | Component>(type: T, props: VProps, ...children: VChildNode[]) => T extends Function ? VChildNode : VNode;

// Internals

export interface Cycle {
  state: State,
  needsRerender: boolean;
  domEmitter: any;
  createEmitter: any;
  tasks: Task[];
};
