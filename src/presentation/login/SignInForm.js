import React from 'react'
import { Field, reduxForm } from 'redux-form'
import PropTypes from 'prop-types'
import { TextField } from 'redux-form-material-ui'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import { FacebookLoginButton } from 'react-social-login-buttons'
import { get } from 'lodash'
import SocialLoginButton from 'react-social-login-buttons/lib/buttons/SocialLoginButton'
import { Grid, Row, Col } from 'react-flexbox-grid'
import './signInForm.css'
import { Link } from 'react-router-dom'

const GoogleLoginButton = (props) => {
  const customProps = {
    style: {
      background: 'white',
      color: '#808080'
    },
    activeStyle: {
      background: '#eeeeee'
    }
  }

  return (<SocialLoginButton {...{ ...customProps, ...props }}>
    <img
      alt=""
      style={{ verticalAlign: 'middle', height: 26, paddingRight: 10 }}
      src="https://cdn4.iconfinder.com/data/icons/new-google-logo-2015/400/new-google-favicon-128.png"
    />
    <span style={{ verticalAlign: 'middle' }}>Log in with Google</span>
  </SocialLoginButton>)
}

const fireBaseErrorCode = (code) => {
  switch (code) {
    case 'auth/account-exists-with-different-credential':
      return 'An account is already associated with this email. Please enter your email and password'
    case 'auth/wrong-password': return 'Invalid Password'
    case 'auth/user-not-found': return 'No user with that email exists'
    default:
      return 'Error Signing In'
  }
}

class SignInForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = { open: false }
    this.handleClose = this.handleClose.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
  }
  handleOpen() {
    this.setState({ open: true })
  }
  handleClose() {
    const { cancelSignInUpForm } = this.props
    cancelSignInUpForm()
    this.setState({ open: false })
  }
  render() {
    const { account, handleSubmit, error, pristine, submitting, sendSubmit, signInWithFacebook, signInWithGoogle, browser } = this.props
    const lessThanSmall = get(browser, 'lessThan.small', '')
    const socialSignInError = get(account, 'socialSignInError.code')
    const signInError = get(account, 'signInError.code')
    const actions = [
      <div id="actionContainer">
        <FlatButton
          id="signInCancel"
          style={{ textAlign: 'center' }}
          label="Cancel"
          primary
          onClick={this.handleClose}
        />
        <FlatButton
          id="signInSubmit"
          label="Login"
          primary
          disabled={error || pristine || submitting}
          onClick={() => {
            sendSubmit()
          }}
        />
      </div>
    ]
    return (
      <div>
        <FlatButton label="Login" style={{ color: 'white' }} labelStyle={{ fontSize: '12pt' }} onClick={this.handleOpen} />
        <Dialog
          title="Login"
          actions={actions}
          modal={false}
          open={this.state.open}
          autoScrollBodyContent
          onRequestClose={this.handleClose}
        >
          <Grid fluid>
            <Row around="sm">
              <Col xs={12} sm={5} style={{ paddingTop: 40 }}>
                <FacebookLoginButton onClick={() => signInWithFacebook()} text="Log in with Facebook" style={{ marginBottom: 20 }} />
                <GoogleLoginButton onClick={() => signInWithGoogle()} />
              </Col>
              <Col xs={12} sm={2}>
                {
                  !lessThanSmall ? (
                    <div style={{ paddingLeft: 20 }}>
                      <Row style={{ marginLeft: 45, marginTop: 10, border: '1px solid #979797', height: 60, width: 0 }} />
                      <Row style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: 22, width: 48, height: 48, borderRadius: '50%', border: '1px solid grey' }}> OR </Row>
                      <Row style={{ marginLeft: 45, border: '1px solid #979797', height: 60, width: 0 }} />
                    </div>
                  ) : (
                    <Row style={{ marginTop: 16, marginBottom: -7 }}>
                      <Col xs={5} style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <hr style={{ height: 0, width: '100%', marginTop: 22 }} />
                      </Col>
                      <Col xs={2} style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <div className="circle-responsive">
                          <div className="circle-content">OR</div>
                        </div>
                      </Col>
                      <Col xs={5} style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <hr style={{ height: 0, width: '100%', marginTop: 22 }} />
                      </Col>
                    </Row>
                  )
                }
              </Col>
              <Col xs={12} sm={5} style={{ paddingLeft: lessThanSmall ? 0 : 60 }}>
                <form onSubmit={handleSubmit}>
                  <div>
                    <Field
                      fullWidth
                      name="email"
                      component={TextField}
                      hintText="Email"
                      floatingLabelText="Email"
                      type="email"
                      onKeyPress={(ev) => {
                        if (ev.key === 'Enter') {
                          sendSubmit()
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Field
                      fullWidth
                      name="password"
                      component={TextField}
                      hintText="Password"
                      floatingLabelText="Password"
                      type="password"
                      onKeyPress={(ev) => {
                        if (ev.key === 'Enter') {
                          sendSubmit()
                        }
                      }}
                    />
                  </div>
                </form>
                <div id="forgotPasswordContainer">
                  <Link to="/forgotpassword">
                    <FlatButton
                      label="Forgot Password?"
                      onClick={this.handleClose}
                    />
                  </Link>
                </div>
              </Col>
            </Row>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 10, color: 'red' }}>
              {signInError ? fireBaseErrorCode(signInError) : socialSignInError ? fireBaseErrorCode(socialSignInError) : '' }
            </div>
          </Grid>
        </Dialog>
      </div>
    )
  }
}

SignInForm.propTypes = {
  browser: PropTypes.shape({
    lessThan: PropTypes.shape({
      small: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  cancelSignInUpForm: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
  signInWithGoogle: PropTypes.func.isRequired,
  signInWithFacebook: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  sendSubmit: PropTypes.func.isRequired
}

const SignInFormEnriched = reduxForm({
  form: 'signIn'
})(SignInForm)

export default SignInFormEnriched
