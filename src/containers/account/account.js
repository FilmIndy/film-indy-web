import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import * as exampleActions from '../../redux/actions/creators/exampleActions'
import * as accountActions from '../../redux/actions/creators/accountActions'
import AccountPage from '../../presentation/account/accountPage'

class Account extends React.Component {
  render() {
    return (
      <AccountPage {...this.props} />
    )
  }
}

Account.propTypes = {

}

export default withRouter(connect(
  state => ({ home: state.home, account: state.account }),
  { ...exampleActions, ...accountActions },
)(Account))
