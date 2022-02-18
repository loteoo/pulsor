import { Action } from "@pulsor/core";
import { Form, Input, Textarea, Checkbox, Radio, Select } from "@pulsor/form";


const SetValuesA: Action = ({
  firstName: 'Foo',
  lastName: 'Bar',
  description: 'Descriptionnnne',
  checkbox1: true,
  checkbox2: false,
  picked: 'One',
  dropdown: 'dog',
})

const SetValuesB: Action = ({
  firstName: '',
  lastName: '',
  description: '',
  checkbox1: false,
  checkbox2: true,
  picked: 'Three',
  dropdown: 'hamster',
})

const HandleForm: Action = (state) => {
  alert(JSON.stringify(state, null, 2))
}

const app = (
  <main>
    <h1>Forms</h1>
    <Form name="coolForm" onsubmit={HandleForm}>
      <fieldset>
        <legend>Input</legend>
        <Input name="firstName" />
        <Input name="lastName" />
      </fieldset>
      <fieldset>
        <legend>Textarea</legend>
        <Textarea name="description" />
      </fieldset>
      <fieldset>
        <legend>Checkbox</legend>
        <p>
          <label>
            <Checkbox name="checkbox1" type="checkbox"  />
            Checkbox 1
          </label>
        </p>
        <p>
          <label>
            <Checkbox name="checkbox2" type="checkbox" defaultChecked />
            Checkbox 2
          </label>
        </p>
      </fieldset>
      <fieldset>
        <legend>Radio</legend>
        <label>
          <Radio type="radio" name="picked" value="One" />
          One
        </label>
        <label>
          <Radio type="radio" name="picked" value="Two" defaultChecked />
          Two
        </label>
        <label>
          <Radio type="radio" name="picked" value="Three" />
          Three
        </label>
      </fieldset>
      <fieldset>
        <legend>Select</legend>
        <label>
          Dropdown
        </label>
        <br />
        <Select
          name="dropdown"
          defaultValue="cat"
          options={[
            { label: '--Please choose an option--' },
            { value: 'dog', label: 'Dog', },
            { value: 'cat', label: 'Cat', },
            { value: 'hamster', label: 'Hamster', },
            { value: 'parrot', label: 'Parrot', },
            { value: 'spider', label: 'Spider', },
            { value: 'goldfish', label: 'Goldfish', },
          ]}
        />
      </fieldset>
      <button type="submit">Submit</button>

      <br />
      <button type="button" onclick={SetValuesA}>SetValuesA</button>
      <button type="button" onclick={SetValuesB}>SetValuesB</button>
    </Form>


    <details open>
      <summary>State</summary>
      <pre>
        <code>
          state: {(s) => {

            // console.log(s)
            return JSON.stringify(s, null, 2)
          }}
        </code>
      </pre>
    </details>
  </main>
)


export default app
