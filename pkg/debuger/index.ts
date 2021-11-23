
import { h } from '../core/src/h'
import cloneDeep from 'lodash/cloneDeep'

const states: any[] = [];
let isBackInTime = false;

const stateSaverModule = (state) => ({
  key: state,
  init: (state) => [
    {
      run: () => {
        if (!isBackInTime) {
          states.push(cloneDeep(state))
        }
      }
    },
    state
  ]
})

const container = `
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  color-scheme: light dark;
  background-color: ButtonFace;
  color: CanvasText;
  padding: 1rem;
  border-radius: 0.5rem;
`

const title = `
  margin: 0;
`

const range = `
  width: 100%;
`

const HandleChange = (state, ev) => {
  const stateIndex = Number(ev.target.value);
  if (stateIndex === states.length) {
    setTimeout(() => {
      setTimeout(() => {
        isBackInTime = false
      })
    })
    return state
  }

  isBackInTime = true
  const next = states[stateIndex];
  return next
}

export const Debugger = ({}) => [
  stateSaverModule,
  h('div', { style: container }, [
    h('h4', { style: title }, ['State: ']),
    h('pre', {}, [
      h('code', {}, [
        (state) => JSON.stringify(state, null, 2)
      ])
    ]),
    (state) => h('input', {
      style: range,
      type: 'range',
      id: 'stateId',
      name: 'stateId',
      min: 0,
      max: states.length,
      value: states.length,
      oninput: HandleChange
    })
  ])
]
