import React from 'react'
import PropTypes from 'prop-types'
import { get } from 'lodash'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { firebaseConnect } from 'react-redux-firebase'
import EditProfile from '../../presentation/profile/EditProfile'

class EditProfileContainer extends React.Component {
  render() {
    console.log(this.props)
    return (
      <EditProfile {...this.props} />
    )
  }
}

EditProfileContainer.propTypes = {
}

const WrappedEditProfile = firebaseConnect((props, firebase) => {
  const uid = get(firebase.auth(), 'currentUser.uid', '')
  return [
    `/userProfiles/${uid}`,
    'roles'
  ]
})(EditProfileContainer)


export default withRouter(connect(
  state => ({ firebase: state.firebase, auth: state.firebase.auth, profile: state.firebase.profile, data: state.firebase.data }),
  {},
)(WrappedEditProfile))

