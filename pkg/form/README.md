# @puslor/form

State-bound form handling primitives for pulsor

## Installation
```
npm install @pulsor/form
```

## Usage

```jsx
import { Form, Input, Textarea, Checkbox, Radio, Select } from '@pulsor/form'

const SubmitSignupForm = (state) => ({
  run: async (emit) => {
    const formData = state.signup;
    // ...
  }
})

const form = (
  <Form name="signup" onsubmit={SubmitSignupForm}>

    <Input name="name" />

    <Textarea name="description" />
    
    <Checkbox name="remember_me" type="checkbox"  />

    <Radio type="radio" name="favorite_color" value="Red" />
    <Radio type="radio" name="favorite_color" value="Blue" defaultChecked />
    <Radio type="radio" name="favorite_color" value="Green" />

    <Select
      name="favorite_pet"
      defaultValue="dog"
      options={[
        { label: '--Please choose an option--' },
        { value: 'dog', label: 'Dog', },
        { value: 'cat', label: 'Cat', },
        { value: 'hamster', label: 'Hamster', },
        { value: 'parrot', label: 'Parrot', },
        { value: 'goldfish', label: 'Goldfish', },
      ]}
    />

    <button type="submit">Submit</button>

  </Form>
)

```
