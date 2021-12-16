// / <reference types="@pulsor/dev/env" />
/// <reference types="../../../pkg/dev" />
/// <reference types="@pulsor/core/jsx" />

type State = import('@pulsor/core').DeepPartial<
  Record<string, unknown> // Allows some non-strictness if necessary
  & import('./pages/keyed-arrays').PageState
  & import('./pages/counter').CounterState
  & import('./pages/updates').UpdateState
>;
