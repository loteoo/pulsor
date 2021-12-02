// === Generic

type Falsy = false | null | undefined;
type TextElement = string | number | bigint;
type State = Record<string, any>



// === Actions

type EventData = Record<string, any>;

// Task
type Emitter = (eventName: string, payload?: EventData) => void;
type TaskCleanupFunction = () => void | Promise<void>;
type TaskRunner = (emit: Emitter, payload?: EventData) => TaskCleanupFunction | void;

interface Task {
  vNode?: VNode;
  payload?: EventData;
  run: TaskRunner;
  [x: string]: any; // in reality, EventHandler;
}

// Update
type Update = Record<string, any>

// Action
type ActionFunction = (state: State, payload?: EventData) => Action;

type Action =
  | Update
  | ActionFunction // Nested action based on state
  | Array<Action> // Nested action
  | Task
  | Falsy



// === VNode

type Context = Record<string, any>
type ContextProp = Context | ((ctx: Context) => Context);

// Props you can set on both props and vNode directly
interface LogicalProps {
  key: string;
  init: Action;
  clear: Action;
  ctx: ContextProp;
}

// Props

type AllEventNames = keyof HTMLElementEventMap;
type OnEventNames = `on${AllEventNames}`
type EventProps = Record<OnEventNames, Action>;

type CSSProperties = Record<keyof CSSStyleDeclaration, string | number>;
type CSSProp = string | Partial<CSSProperties>;

type ClassObject = Record<string, boolean>;
type ClassProp = string | ClassObject;

type SpecialProps = {
  style: CSSProp;
  class: ClassProp;
}

type HtmlProps = Record<string, TextElement>;

type VProps = Partial<LogicalProps & EventProps & SpecialProps & HtmlProps>;

// Children

type VChildNodeFunction<S extends State = State> = ((state: S, ctx: Context) => VChildNode<S>)

type VChildNode<S extends State = State> =
  | VNode<S>
  | VChildNodeFunction<S>
  | Array<VChildNode<S>>
  | TextElement
  | Falsy;

// VNode

interface VNode<S extends State = State> extends Partial<LogicalProps> {
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



// Internals

interface Cycle {
  state: State,
  needsRerender: boolean;
  domEmitter: any;
  createEmitter: any;
  tasks: Task[];
}
