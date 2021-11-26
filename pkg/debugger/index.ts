
import { h } from '../core/src/h'

const states: any[] = [];
let isBackInTime = false;

const stateSaverModule = (state) => ({
  key: state,
  init: (state) => [
    {
      run: () => {
        if (!isBackInTime) {
          states.push(JSON.parse(JSON.stringify(state)))
        }
      }
    }
  ]
})


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

const ToggleDebug = (state) => ({
  debug: !state.debug
})

export const Debugger = () => [
  stateSaverModule,
  h('div', { style: css.container, onclick: ToggleDebug },
    (state) => {
      if (state.debug) {
        return [
          h('h4', { style: css.title }, ['State: ']),
          h('pre', { style: css.pre }, [
            h('code', {}, [
              (state) => JSON.stringify(state, null, 2)
            ])
          ]),
          h('input', {
            style: css.range,
            type: 'range',
            id: 'stateId',
            name: 'stateId',
            min: 0,
            max: states.length,
            value: states.length,
            oninput: HandleChange
          })
        ]
      }
      return (
        h('small', { style: css.title }, 'debug')
      )
    }
  )
]


const css = {
  container: {
    all: 'unset',
    position: 'fixed',
    bottom: '1rem',
    right: '1rem',
    colorScheme: 'light dark',
    backgroundColor: 'ButtonFace',
    color: 'CanvasText',
    padding: '1rem',
    borderRadius: '0.5rem',
    zIndex: 1000
  },
  title: {
    margin: 0,
    color: 'black'
  },
  range: {
    width: '100%'
  },
  pre: {
    overflow: 'auto',
    maxWidth: '64rem',
    maxHeight: '64rem',
    whiteSpace: 'pre',
    wordBreak: 'keep-all',
    overflowWrap: 'break-word'
  }
}
