import { DeepPartial } from '@pulsor/core';
import { CounterState } from '/src/pages/counter';
import { PageState } from '/src/pages/keyed-arrays';
import { UpdateState } from '/src/pages/updates';

export type State =
  // Allows some non-strictness if necessary
  Record<string, unknown>

  // Import "partial" types defined elsewhere
  & DeepPartial<
    PageState
    & CounterState
    & UpdateState
  >;


// Use our custom State type as the "default"
// for pulsor's types using Module Augmentation
declare module '@pulsor/core/dist/types' {
  export type State = import('./state').State;
}
