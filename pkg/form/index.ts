/// <reference types="@pulsor/core/jsx" />

import { Action, h, VChildNode } from "../core/src";

// ======== Shared =========

const PreventDefault = (_: any, ev: any) => ({
  effect: () => ev.preventDefault()
})

const selectField = (name: string) => (state: any) => state[name]

// ======== Form =========

type FormProps = JSX.IntrinsicElements['form'] & {
  name?: string;
  defaultValue?: any;
}

export const Form = (props: FormProps, children: VChildNode) => {
  const propsOverrides: any = {
    method: 'post',
  }
  if (props.name) {
    propsOverrides.scope = props.name;
    propsOverrides.init = props.defaultValue ?? {}
  }
  propsOverrides.onsubmit = [
    PreventDefault,
    props.onsubmit,
  ]
  return h(
    'form',
    {
      ...props,
      ...propsOverrides,
    },
    children
  )
}


// ======== Input =========

type InputProps = Omit<JSX.IntrinsicElements['input'], 'init' | 'value' | 'oninput'>  & {
  name: string;
  parse?: (value: any) => string;
  format?: (value: string) => any;
}

const HandleInput = (name: string, format?: any) => (_: any, ev: any): Action => ({
  [name]: format ? format(ev.target.value) : ev.target.value
});

export const Input = ({
  defaultValue = '',
  format,
  parse,
  ...props
}: InputProps) => {
  const type = props.type ?? 'text';

  return h(
    'input',
    {
      ...props,
      type,
      init: ({ [props.name]: defaultValue }),
      value: (state: any) => {
        let value = selectField(props.name)(state);
        if (parse) {
          value = parse(value)
        }
        return value
      },
      oninput: HandleInput(props.name, format),
    }
  )
}



// ======== Textarea =========

export const Textarea = (props: InputProps) => {
  const vNode = Input(props);
  vNode.tag = 'textarea';
  delete vNode.props?.type;
  return vNode;
}



// ======== Checkbox =========

const HandleCheckbox = (name: string) => (_: any, ev: any): Action =>
  ({ [name]: ev.target.checked })

type CheckboxProps = Omit<JSX.IntrinsicElements['input'], 'type' | 'init' | 'checked' | 'oninput'> & {
  name: string;
}

export const Checkbox = ({ defaultChecked, ...props }: CheckboxProps) => {
  return h(
    'input',
    {
      ...props,
      type: 'checkbox',
      init: ({ [props.name]: Boolean(defaultChecked) }),
      checked: (state: any) => Boolean(selectField(props.name)(state)),
      oninput: HandleCheckbox(props.name),
    }
  )
}



// ======== Radio =========

const HandleRadio = (name: string) => (_: any, ev: any): Action => ({
  [name]: ev.target.value
});

type RadioProps = Omit<JSX.IntrinsicElements['input'], 'type' | 'init' | 'checked' | 'oninput'> & {
  name: string;
}

export const Radio = ({ defaultChecked, ...props }: RadioProps) => {
  return h(
    'input',
    {
      ...props,
      type: 'radio',
      init: defaultChecked ? ({ [props.name]: props.value }) : undefined,
      checked: (state: any) => selectField(props.name)(state) === props.value,
      oninput: HandleRadio(props.name),
    }
  )
}



// ======== Select =========


const HandleSelect = (name: string) => (_: any, ev: any): Action => ({
  [name]: ev.target.value
});

type OptionProps = JSX.IntrinsicElements['option'] & {

}

type SelectProps = Omit<JSX.IntrinsicElements['select'], 'init' | 'oninput' | 'options' | 'value'> & {
  name: string;
  defaultValue?: string;
  options?: OptionProps[];
}

export const Select = ({
  options = [],
  defaultValue = '',
  ...props
}: SelectProps) => {
  return h(
    'select',
    {
      ...props,
      init: ({ [props.name]: defaultValue }),
      oninput: HandleSelect(props.name),
      value: selectField(props.name),
    },
    (state) => {
      const selectedValue = selectField(props.name)(state);
      return options.map((option) => h(
        'option',
        {
          ...option,
          selected: option.value === selectedValue,
        },
        { text: option.label }
      ))
    }
  )
}

// To decide: Should there be default "defaultValues"? Maybe the default should be undefined instead of false / empty strings
