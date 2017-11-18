import React from 'react'
import { Field, reduxForm } from 'redux-form'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import PropTypes from 'prop-types'

const renderTextField = ({ input, name, label, meta: { touched, error }, ...custom }) => (
  <TextField
    hintText={label}
    hintStyle={{ float: 'left' }}
    textareaStyle={{ float: 'left' }}
    floatingLabelText={label}
    errorText={touched && error}
    multiLine={input.name === 'bio'}
    fullWidth
    {...input}
    {...custom}
  />
)

const renderSelectField = ({
  input,
  label,
  meta: { touched, error },
  children,
  ...custom
}) => (
  <SelectField
    floatingLabelText={label}
    errorText={touched && error}
    {...input}
    onChange={(event, index, value) => input.onChange(value)}
    children={children}
    {...custom}
  />
)

const validate = (values) => {
  const errors = {}
  if (!values.role) {
    errors.role = 'A role is required'
  }
  if (!values.year) {
    errors.year = 'A year is required'
  }
  if (!values.title) {
    errors.title = 'A title is required'
  }
  return errors
}

const AddCreditForm = ({ handleSubmit, userRoles }) => (
  <form onSubmit={handleSubmit}>
    <div>
      <Field
        name="role"
        component={renderSelectField}
        label="Role"
      >
        {userRoles.map((role, i) => (
          <MenuItem key={role.roleName} value={i} primaryText={role.roleName} />
        ))}
      </Field>
      <Field
        name="title"
        component={renderTextField}
        floatingLabelText="Title"
        type="text"
      />
      <Field
        name="year"
        component={renderTextField}
        floatingLabelText="Year"
        type="text"
      />
    </div>
  </form>
)

AddCreditForm.propTypes = {
  userRoles: PropTypes.arrayOf(PropTypes.shape({
    roleName: PropTypes.string,
    roleId: PropTypes.string
  })).isRequired,
  handleSubmit: PropTypes.func.isRequired
}

export default reduxForm({
  form: 'AddCreditForm',
  validate
})(AddCreditForm)
