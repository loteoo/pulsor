// / <reference types="@pulsor/dev/env" />
/// <reference types="../../../pkg/dev" />
/// <reference types="@pulsor/core/jsx" />

import * as Pulsor from '@pulsor/core';

declare module '@pulsor/core/dist/types' {
  export type State = Pulsor.DeepPartial<
    Record<string, unknown> // Allows some non-strictness if necessary
    & import('./pages/keyed-arrays').PageState
    & import('./pages/counter').CounterState
    & import('./pages/updates').UpdateState
  >;
}
