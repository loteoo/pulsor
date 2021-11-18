import get from 'lodash-es/get'
import set from 'lodash-es/set'
import { h } from "../core/src/h";


// ======== Shared =========

const InitField = (name: string, defaultValue: any): Action => (state) =>
  set(
    state,
    name,
    defaultValue,
  )

const PreventDefault = {
  run: (_: any, ev: any) => ev.preventDefault()
}

const getFieldName = (name: string, scope?: string) => scope ? `${scope}.${name}` : name;

// ======== Form =========

interface FormProps extends Partial<HTMLFormElement> {
}

export const Form = (props: FormProps, children: VChildNode) => {
  const propsOverrides: any = {
    method: 'post',
  }
  if (props.name) {
    propsOverrides.ctx = (ctx: any) => ({ ...ctx, scope: props.name })
    propsOverrides.init = InitField(props.name, {})
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

interface InputProps extends Partial<HTMLInputElement> {
  name: string;
  format?: (value: string) => string
}

const HandleInput = (name: string, format?: any) => (state: any, ev: any): Action => ({
  ...set(
    state,
    name,
    format ? format(ev.target.value) : ev.target.value,
  )
})

export const Input = ({
  defaultValue = '',
  ...props
}: InputProps) => (_: any, { scope }: any) => {
  const type = props.type ?? 'text';
  const name = getFieldName(props.name, scope);
  return h(
    'input',
    {
      type,
      init: InitField(name, defaultValue),
      oninput: HandleInput(name, props.format),
      value: (state: any) => get(state, name),
      ...props,
    }
  )
}



// ======== Textarea =========

export const Textarea = (props: InputProps) => (state: any, ctx: any) => {
  const vNode = Input(props)(state, ctx);
  vNode.type = 'textarea';
  return vNode;
}



// ======== Checkbox =========

const HandleCheckbox = (name: string) => (state: any, ev: any): Action => ({
  ...set(
    state,
    name,
    ev.target.checked,
  )
})

interface CheckboxProps extends Partial<HTMLInputElement> {
  name: string;
}

export const Checkbox = ({ defaultChecked, ...props }: CheckboxProps) => (_: any, { scope }: any) => {
  const name = getFieldName(props.name, scope);
  return h(
    'input',
    {
      type: 'checkbox',
      init: InitField(name, Boolean(defaultChecked)),
      oninput: HandleCheckbox(name),
      checked: (state: any) => Boolean(get(state, name)),
      ...props,
    }
  )
}



// ======== Radio =========

const HandleRadio = (name: string) => (state: any, ev: any): Action => ({
  ...set(
    state,
    name,
    ev.target.value,
  )
})

interface RadioProps extends Partial<HTMLInputElement> {
  name: string;
}

export const Radio = ({ defaultChecked, ...props }: RadioProps) => (_: any, { scope }: any) => {
  const name = getFieldName(props.name, scope);
  return h(
    'input',
    {
      type: 'radio',
      init: defaultChecked ? InitField(name, props.value) : undefined,
      oninput: HandleRadio(name),
      checked: (state: any) => get(state, name) === props.value,
      ...props,
    }
  )
}



// ======== Select =========

const HandleSelect = (name: string) => (state: any, ev: any): Action => ({
  ...set(
    state,
    name,
    ev.target.value,
  )
})


interface OptionProps extends Partial<HTMLOptionElement> {

}

interface SelectProps extends Partial<Omit<HTMLSelectElement, 'options'>> {
  name: string;
  defaultValue?: string;
  options?: OptionProps[];
}

export const Select = ({
  options = [],
  defaultValue = '',
  ...props
}: SelectProps) => (_: any, { scope }: any) => {
  const name = getFieldName(props.name, scope);
  return h(
    'select',
    {
      init: InitField(name, defaultValue),
      oninput: HandleSelect(name),
      value: (state: any) => get(state, name),
      ...props,
    },
    (state) => {
      const selectedValue = get(state, name);
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



// TODO: Select


// To decide: Should there be default "defaultValues"? Maybe the default should be undefined instead of false / empty strings
