import React from 'react'
import { Field, reduxForm } from 'redux-form'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import PropTypes from 'prop-types'


const validate = (values) => {
  const errors = {}

  if (!values.title) {
    errors.title = 'A title is required'
  }
  if (!values.url) {
    errors.url = 'A url is required'
  }
  if ( values.url && (values.url.indexOf("youtube") < 0 && values.url.indexOf("vimeo") < 0) ) {
    errors.url = 'Enter a valid Youtube or Vimeo link'
  }

  return errors
}

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

const EditVideoForm = ({ handleSubmit, onDelete }) => (
  <form onSubmit={handleSubmit}>
    <div>
      <Field
        name="title"
        component={renderTextField}
        floatingLabelText="Title"
        type="text"
      />
      <Field
        name="url"
        component={renderTextField}
        floatingLabelText="Url"
        type="url"
      />
      <RaisedButton
        style={{ marginTop: 10 }}
        primary
        onClick={onDelete}
        label="Delete"
      />
    </div>
  </form>
)

EditVideoForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default reduxForm({
  form: 'EditVideoForm',
  validate
})(EditVideoForm)
