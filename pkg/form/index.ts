import { h } from "../core/src/h";


// ======== Shared =========

const SetField = (name: string, value: any, scope?: string): Action => {
  const update = {
    [name]: value
  }
  return scope ? { [scope]: update } : update
}

const PreventDefault = {
  run: (_: any, ev: any) => ev.preventDefault()
}

const selectField = (name: string, scope?: string) => (state: any) => {
  if (scope) {
    return state[scope][name];
  }
  return state[name];
}

// ======== Form =========

interface FormProps extends Partial<HTMLFormElement> {
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

interface InputProps extends Partial<HTMLInputElement> {
  name: string;
  format?: (value: string) => string
}

const HandleInput = (name: string, scope?: any, format?: any) => (_: any, ev: any): Action =>
  SetField(name, format ? format(ev.target.value) : ev.target.value, scope)


export const Input = ({
  defaultValue = '',
  ...props
}: InputProps) => (_: any, { scope }: any) => {
  const type = props.type ?? 'text';
  return h(
    'input',
    {
      type,
      init: SetField(props.name, defaultValue, scope),
      oninput: HandleInput(props.name, props.format, scope),
      value: selectField(props.name, scope),
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


const HandleCheckbox = (name: string, scope?: any) => (_: any, ev: any): Action =>
  SetField(name, ev.target.checked, scope)

interface CheckboxProps extends Partial<HTMLInputElement> {
  name: string;
}

export const Checkbox = ({ defaultChecked, ...props }: CheckboxProps) => (_: any, { scope }: any) => {
  return h(
    'input',
    {
      type: 'checkbox',
      init: SetField(props.name, Boolean(defaultChecked), scope),
      oninput: HandleCheckbox(props.name, scope),
      checked: (state: any) => Boolean(selectField(props.name, scope)(state)),
      ...props,
    }
  )
}



// ======== Radio =========

const HandleRadio = (name: string, scope?: any) => (_: any, ev: any): Action =>
  SetField(name, ev.target.value, scope)

interface RadioProps extends Partial<HTMLInputElement> {
  name: string;
}

export const Radio = ({ defaultChecked, ...props }: RadioProps) => (_: any, { scope }: any) => {
  return h(
    'input',
    {
      type: 'radio',
      init: defaultChecked ? SetField(props.name, props.value, scope) : undefined,
      oninput: HandleRadio(props.name, scope),
      checked: (state: any) => selectField(props.name, scope)(state) === props.value,
      ...props,
    }
  )
}



// ======== Select =========


const HandleSelect = (name: string, scope?: any) => (_: any, ev: any): Action =>
  SetField(name, ev.target.value, scope)


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
  return h(
    'select',
    {
      init: SetField(props.name, defaultValue, scope),
      oninput: HandleSelect(props.name, scope),
      value: selectField(props.name, scope),
      ...props,
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



// TODO: Select


// To decide: Should there be default "defaultValues"? Maybe the default should be undefined instead of false / empty strings