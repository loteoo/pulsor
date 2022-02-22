import { DeepPartial } from '../@pulsor/core/src';
import { CounterState } from '/src/pages/counter';
import { PageState } from '/src/pages/keyed-arrays';
import { UpdateState } from '/src/pages/updates';

export type State =
  // Allows some non-strictness if necessary
  Record<string, any>

  // Import "partial" types defined elsewhere
  & DeepPartial<
    PageState
    & CounterState
    & UpdateState
  >;


// Use our custom State type as the "default"
// for pulsor's types using Module Augmentation
declare module '../@pulsor/core/src/types' {
  export type State = import('./state').State;
}
