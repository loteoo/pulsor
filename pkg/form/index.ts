/// <reference types="@pulsor/core/jsx" />

import { Action, h, VChildNode } from "@pulsor/core";

// ======== Shared =========

const SetField = (name: string, value: any, scope?: string): Action => {
  const update = {
    [name]: value
  }
  return scope ? { [scope]: update } : update
}

const PreventDefault = (_: any, ev: any) => ({
  effect: () => ev.preventDefault()
})

const selectField = (name: string, scope?: string) => (state: any) => {
  if (scope) {
    return state[scope][name];
  }
  return state[name];
}

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
    propsOverrides.ctx = (ctx: any) => ({ ...ctx, scope: props.name })
    propsOverrides.init = SetField(props.name, props.defaultValue ?? {})
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

const HandleInput = (name: string, scope?: any, format?: any) => (_: any, ev: any): Action =>
  SetField(name, format ? format(ev.target.value) : ev.target.value, scope)

export const Input = ({
  defaultValue = '',
  format,
  parse,
  ...props
}: InputProps) => (_: any, { scope }: any) => {
  const type = props.type ?? 'text';

  return h(
    'input',
    {
      ...props,
      type,
      init: SetField(props.name, defaultValue, scope),
      value: (state: any) => {
        let value = selectField(props.name, scope)(state);
        if (parse) {
          value = parse(value)
        }
        return value
      },
      oninput: HandleInput(props.name, scope, format),
    }
  )
}



// ======== Textarea =========

export const Textarea = (props: InputProps) => (state: any, ctx: any) => {
  const vNode = Input(props)(state, ctx);
  vNode.tag = 'textarea';
  delete vNode.props?.type;
  return vNode;
}



// ======== Checkbox =========

const HandleCheckbox = (name: string, scope?: any) => (_: any, ev: any): Action =>
  SetField(name, ev.target.checked, scope)

type CheckboxProps = Omit<JSX.IntrinsicElements['input'], 'type' | 'init' | 'checked' | 'oninput'> & {
  name: string;
}

export const Checkbox = ({ defaultChecked, ...props }: CheckboxProps) => (_: any, { scope }: any) => {
  return h(
    'input',
    {
      ...props,
      type: 'checkbox',
      init: SetField(props.name, Boolean(defaultChecked), scope),
      checked: (state: any) => Boolean(selectField(props.name, scope)(state)),
      oninput: HandleCheckbox(props.name, scope),
    }
  )
}



// ======== Radio =========

const HandleRadio = (name: string, scope?: any) => (_: any, ev: any): Action =>
  SetField(name, ev.target.value, scope)

type RadioProps = Omit<JSX.IntrinsicElements['input'], 'type' | 'init' | 'checked' | 'oninput'> & {
  name: string;
}

export const Radio = ({ defaultChecked, ...props }: RadioProps) => (_: any, { scope }: any) => {
  return h(
    'input',
    {
      ...props,
      type: 'radio',
      init: defaultChecked ? SetField(props.name, props.value, scope) : undefined,
      checked: (state: any) => selectField(props.name, scope)(state) === props.value,
      oninput: HandleRadio(props.name, scope),
    }
  )
}



// ======== Select =========


const HandleSelect = (name: string, scope?: any) => (_: any, ev: any): Action =>
  SetField(name, ev.target.value, scope)

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
}: SelectProps) => (_: any, { scope }: any) => {
  return h(
    'select',
    {
      ...props,
      init: SetField(props.name, defaultValue, scope),
      oninput: HandleSelect(props.name, scope),
      value: selectField(props.name, scope),
    },
    (state) => {
      const selectedValue = selectField(props.name, scope)(state);
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
