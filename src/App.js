import React from 'react'
import { Route, Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { firebaseConnect } from 'react-redux-firebase'
import QueryString from 'query-string'
import { get } from 'lodash'
import PropTypes from 'prop-types'
import { InstantSearch, Index, Configure, CurrentRefinements } from 'react-instantsearch/dom'
import { connectAutoComplete, connectMenu } from 'react-instantsearch/connectors'
import Autosuggest from 'react-autosuggest'
import { Grid, Row, Col } from 'react-flexbox-grid'
import 'react-instantsearch-theme-algolia/style.css'

// Material UI Components
import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import { Card } from 'material-ui/Card'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Popover from 'material-ui/Popover'
import Snackbar from 'material-ui/Snackbar'
import IconButton from 'material-ui/IconButton'
import Drawer from 'material-ui/Drawer'


// Material UI SVG Icons
import MenuIcon from 'material-ui/svg-icons/navigation/menu'
import AccountCircle from 'material-ui/svg-icons/action/account-circle'
import LogoutIcon from 'material-ui/svg-icons/action/exit-to-app'
import ViewIcon from 'material-ui/svg-icons/image/remove-red-eye'
import ArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-down'

// Page components
import SearchBar from './presentation/common/SearchBar'
import Home from './containers/home'
import Account from './containers/account/account'
import EditProfile from './containers/profile/EditProfile'
import ViewProfile from './containers/profile/ViewProfile'
import VendorProfile from './containers/vendorProfile/VendorProfile'
import EditVendorProfile from './containers/vendorProfile/EditVendorProfile'
import LocationProfile from './containers/locationProfile/LocationProfile'
import EditLocationProfile from './containers/locationProfile/EditLocationProfile'
import Search from './containers/search/Search'
import ForgotPassword from './containers/forgotPassword/forgotPassword'
import SignUpForm from './presentation/signup/SignUpForm'
import SignInForm from './presentation/login/SignInForm'
import VendorMenu from './presentation/common/VendorMenu'
import AddVendorModal from './presentation/common/AddVendorModalMenu'
import LocationMenu from './presentation/common/LocationMenu'
import AddLocationModal from './presentation/common/AddLocationModalMenu'

// Style and images
import './App.css'

import Logo from './film-indy-logo.png'

import * as accountActions from './redux/actions/creators/accountActions'

const VirtualMenu = connectMenu(() => null)

const styles = {
  container: {
    flexGrow: 1,
    position: 'relative',
    paddingTop: 3
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    marginTop: 1,
    marginBottom: 1 * 3,
    left: 0,
    right: 0
  },
  sectionTitle: {
    backgroundColor: '#fff'
  },
  suggestion: {
    display: 'block'
  },
  suggestionHiglighted: {
    opacity: 1
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
    backgroundColor: '#fff'
  },
  textField: {
    width: '100%'
  }
}

const ALGOLIA_SEARCH_KEY = process.env.REACT_APP_ALGOLIA_SEARCH_KEY
const ALGOLIA_APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID

const AutoCompleteBar = connectAutoComplete(
  ({ hits, currentRefinement, refine, onUpdateInput, onSuggestionClicked, onEnterHit, searchBarUpdated, initalQuery }) => {
    const subsetHits = hits.map(hit => ({ ...hit, hits: hit.hits.slice(0, 3) }))
    let refinement = currentRefinement
    if (!searchBarUpdated && initalQuery) {
      refinement = initalQuery
    }
    return (
      <Autosuggest
        theme={styles}
        suggestions={subsetHits}
        multiSection
        onSuggestionsFetchRequested={({ value }) => refine(value)}
        onSuggestionsClearRequested={() => refine('')}
        getSuggestionValue={hit => hit.roleName}
        onSuggestionSelected={(event, { suggestion, sectionIndex }) => {
          onSuggestionClicked(suggestion, sectionIndex)
        }}
        renderInputComponent={(inputProps) => {
          const onBlur = (event) => {
            inputProps.onBlur()
            refine(refinement)
          }
          const moreInputProps = { ...inputProps, onBlur }
          return (
            <SearchBar
              onRequestSearch={() => onEnterHit()}
              id="autocomplete-text-field"
              onKeyPress={(ev) => {
                if (ev.key === 'Enter') {
                  onEnterHit()
                }
              }}
              {...moreInputProps}
            />
          )
        }}
        renderSuggestion={(hit) => {
          if (hit.roleName) {
            return (
              <MenuItem
                style={{ whiteSpace: 'inital' }}
              >
                {hit.roleName}
              </MenuItem>
            )
          } else if (hit.firstName || hit.lastName) {
            return (
              <MenuItem style={{ whiteSpace: 'inital' }}>
                {`${get(hit, 'firstName', '')} ${get(hit, 'lastName', '')}`}
              </MenuItem>
            )
          } else if (hit.vendorName) {
            return (
              <MenuItem style={{ whiteSpace: 'inital' }}>
                {`${hit.vendorName}`}
              </MenuItem>
            )
          } else if (hit.locationName) {
            return (
              <MenuItem style={{ whiteSpace: 'inital' }}>
                {`${hit.locationName}`}
              </MenuItem>
            )
          } else if (hit.type) {
            return (
              <MenuItem style={{ whiteSpace: 'inital' }}>
                {`${hit.type}`}
              </MenuItem>
            )
          }
          return (null)
        }}
        renderSectionTitle={(section) => {
          if (section.hits.length > 0) {
            if (section.index === 'roles') {
              return (
                <strong>Roles</strong>
              )
            } else if (section.index === 'names') {
              return (
                <strong>Crew</strong>
              )
            } else if (section.index === 'vendors') {
              return (<strong>Vendors</strong>)
            } else if (section.index === 'locations') {
              return (<strong>Locations</strong>)
            } else if (section.index === 'locationTypes') {
              return (
                <strong>Locations Types</strong>
              )
            }
          }
          return ''
        }}
        renderSuggestionsContainer={({ containerProps, children }) => (
          <Card {...containerProps}>
            {children}
          </Card>
        )}
        getSectionSuggestions={section => section.hits}
        inputProps={{
          placeholder: 'Search our database....',
          style: {
            width: '100%'
          },
          value: refinement,
          onChange: (event) => {
            onUpdateInput(event.target.value)
          }
        }}
      />
    )
  })

class App extends React.Component {
  constructor(props) {
    const parsedQs = QueryString.parse(window.location.search)
    const query = get(parsedQs, 'query', '')
    super(props)
    this.state = {
      searchQuery: '',
      initalQuery: query,
      searchBarUpdated: false,
      open: false,
      signedOut: false,
      addVendorModalOpen: false,
      addLocationModalOpen: false,
      displayVendors: false,
      displayLocations: false
    }
    this.handleAvatarTouch = this.handleAvatarTouch.bind(this)
    this.handleDropdownClose = this.handleDropdownClose.bind(this)
    this.handleSignOutClose = this.handleSignOutClose.bind(this)
    this.signOutMessage = this.signOutMessage.bind(this)
  }

  handleAvatarTouch(event) {
    // This prevents ghost click.
    event.preventDefault()

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
      signedOut: false
    })
  }

  handleDropdownClose() {
    this.setState({
      open: false
    })
  }

  signOutMessage() {
    this.setState({
      signedOut: true,
      open: false
    })
  }

  handleSignOutClose() {
    this.setState({
      signedOut: false
    })
  }

  render() {
    const { cancelSignInUpForm, account, profile, auth, firebase, browser,
      history, signUp, signUpWithGoogle, signUpWithFacebook, submitSignUp, signIn,
      signInWithFacebook, signInWithGoogle, submitSignIn, location, usersVendors,
      submitVendorCreate, createVendor, usersLocations, submitLocationCreate, createLocation,
      getDefaultAccountImages } = this.props
    const { addVendorModalOpen, addLocationModalOpen, showSubMenu } = this.state
    const searchQuery = get(this.state, 'searchQuery', '')
    const searchBarUpdated = get(this.state, 'searchBarUpdated', false)
    const initalQuery = get(this.state, 'initalQuery', '')
    const photoURL = get(profile, 'photoURL', '')
    const uid = get(auth, 'uid')
    const appBarStyle = location.pathname === '/search' ? { boxShadow: 'none' } : {}
    const lessThanSm = get(browser, 'lessThan.small', false)
    return (
      <div className="App">
        <Grid fluid style={{ padding: 0 }}>
          <AppBar
            style={{ ...appBarStyle }}
            titleStyle={{ overflow: 'none', lineHeight: '20px', height: 20 }}
            title={location.pathname !== '/' &&
            <Col xs={12} md={6} lg={6}>
              <Row style={{ marginTop: !lessThanSm ? 20 : 5 }}>
                <Col xs={12}>
                  <InstantSearch
                    appId={ALGOLIA_APP_ID}
                    apiKey={ALGOLIA_SEARCH_KEY}
                    indexName="roles"
                  >
                    <Index indexName="names">
                      <Configure />
                      <CurrentRefinements
                        transformItems={items => items.filter(item => item.public === 'true' || item.public === 'false')}
                      />
                      <VirtualMenu attributeName="public" defaultRefinement={'true'} />
                    </Index>
                    <Index indexName="vendors">
                      <Configure />
                      <CurrentRefinements
                        transformItems={items => items.filter(item => item.public === 'true' || item.public === 'false')}
                      />
                      <VirtualMenu attributeName="public" defaultRefinement={'true'} />
                    </Index>
                    <Index indexName="locations">
                      <Configure />
                      <CurrentRefinements
                        transformItems={items => items.filter(item => item.public === 'true' || item.public === 'false')}
                      />
                      <VirtualMenu attributeName="public" defaultRefinement={'true'} />
                    </Index>
                    <Index indexName="locationTypes" />
                    <AutoCompleteBar
                      initalQuery={initalQuery}
                      searchBarUpdated={searchBarUpdated}
                      onUpdateInput={query => this.setState({ searchQuery: query, searchBarUpdated: true })}
                      onEnterHit={() => {
                        if (searchQuery) {
                          if (!searchBarUpdated) {
                            history.push({ pathname: '/search', search: `?query=${encodeURIComponent(initalQuery)}&show=all` })
                          } else {
                            history.push({ pathname: '/search', search: `?query=${encodeURIComponent(searchQuery)}&show=all` })
                          }
                        } else {
                          history.push({ pathname: '/search', search: `?query=${encodeURIComponent('')}&show=all` })
                        }
                      }}
                      onSuggestionClicked={(suggestion, index) => {
                        if (index === 0) {
                          history.push({ pathname: '/search', search: `?query=${encodeURIComponent(suggestion.roleName)}&show=all&role=${encodeURIComponent(suggestion.roleName)}` })
                        } else if (index === 1) {
                          history.push({ pathname: '/profile', search: `?query=${encodeURIComponent(suggestion.objectID)}` })
                        } else if (index === 2) {
                          history.push({ pathname: `/vendor/${suggestion.objectID}` })
                        } else if (index === 3) {
                          history.push({ pathname: `/location/${suggestion.objectID}` })
                        } else if (index === 4) {
                          history.push({ pathname: '/search', search: `?query=''&show=locations&locationType=${encodeURIComponent(suggestion.type)}` })
                        }
                      }}
                    />
                  </InstantSearch>
                </Col>
              </Row>
            </Col>
            }
            iconElementLeft={
              <div>
                <Row>
                  <Col xs>
                    <Link to="/"><img src={Logo} className="logo" alt="Film Indy Logo" /></Link>
                  </Col>
                </Row>
              </div>
            }
            iconElementRight={uid ? (
              <Col xs>
                <div className="avatar-wrapper" onClick={this.handleAvatarTouch}>
                  <Avatar className="accountIcon avatar" src={photoURL} />
                  <ArrowIcon className="arrowIcon" />
                </div>
              </Col>
            ) : (
              <Col xs>
                {
                  !lessThanSm ? (
                    <Row style={{ marginTop: 35 }}>
                      <Col xs={6}>
                        <SignUpForm
                          browser={browser}
                          onSubmit={(values) => {
                            const photoFile = values.photoFile || values.avatar
                            signUp(values.firstName, values.lastName, photoFile, values.email, values.password)
                          }}
                          getDefaultAccountImages={getDefaultAccountImages}
                          defaultAccountImages={account.defaultAccountImages}
                          account={account}
                          cancelSignInUpForm={cancelSignInUpForm}
                          signUpWithGoogle={signUpWithGoogle}
                          signUpWithFacebook={signUpWithFacebook}
                          sendSubmit={submitSignUp}
                        />
                      </Col>
                      <Col xs={6}>
                        <SignInForm
                          browser={browser}
                          onSubmit={(values) => {
                            signIn(values.email, values.password)
                          }}
                          account={account}
                          cancelSignInUpForm={cancelSignInUpForm}
                          signInWithFacebook={signInWithFacebook}
                          signInWithGoogle={signInWithGoogle}
                          sendSubmit={submitSignIn}
                        />
                      </Col>
                    </Row>
                  ) : (
                    <IconButton
                      onClick={() => this.setState({ open: !this.state.open })}
                      iconStyle={{ color: '#fff' }}
                    >
                      <MenuIcon />
                    </IconButton>
                  )
                }
              </Col>
            )}
            zDepth={2}
          />
        </Grid>
        <AddVendorModal
          open={addVendorModalOpen}
          onCancel={() => {
            this.handleDropdownClose()
            this.setState({ addVendorModalOpen: false })
          }}
          submitVendorCreate={submitVendorCreate}
          onSubmit={(values) => {
            createVendor(values.name)
            this.setState({ addVendorModalOpen: false })
          }}
        />
        <AddLocationModal
          open={addLocationModalOpen}
          onCancel={() => {
            this.handleDropdownClose()
            this.setState({ addLocationModalOpen: false })
          }}
          submitLocationCreate={submitLocationCreate}
          onSubmit={(values) => {
            createLocation(values.name)
            this.setState({ addLocationModalOpen: false })
          }}
        />

        {
          !lessThanSm ? (
            uid ? (
              <Popover
                open={this.state.open}
                anchorEl={this.state.anchorEl}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                onRequestClose={this.handleDropdownClose}
              >
                <Menu >
                  <div>
                    <Link onClick={this.handleDropdownClose} to="/account">
                      <MenuItem primaryText="Account Settings" leftIcon={<AccountCircle />} />
                    </Link>

                    <Link onClick={this.handleDropdownClose} to={{ pathname: '/profile', search: `?query=${uid}` }}>
                      <MenuItem primaryText="View Profile" leftIcon={<ViewIcon />} />
                    </Link>

                    <VendorMenu
                      closeDropdown={this.handleDropdownClose}
                      vendors={usersVendors}
                      onAddVendorClick={() => {
                        this.handleDropdownClose()
                        this.setState({ addVendorModalOpen: true })
                      }}
                    />

                    <LocationMenu
                      showSubMenu={showSubMenu}
                      onClickSubMenu={() => this.setState({ showSubMenu: true })}
                      closeDropdown={this.handleDropdownClose}
                      locations={usersLocations}
                      onAddLocationClick={() => {
                        this.handleDropdownClose()
                        this.setState({ addLocationModalOpen: true })
                      }}
                    />
                    <MenuItem primaryText="Log Out" leftIcon={<LogoutIcon />} onClick={(e) => { firebase.logout(); this.signOutMessage() }} />

                  </div>
                </Menu>
              </Popover>
            ) : null
          ) : (
            <Drawer
              docked={false}
              open={this.state.open}
              openSecondary
              onRequestChange={() => this.setState({ open: !this.state.open })}
            >
              { uid ? ( // renders dropdown items depending on if logged in
                <div>
                  <Link onClick={this.handleDropdownClose} to="/account">
                    <MenuItem innerDivStyle={{ padding: 0 }}primaryText="Account Settings" leftIcon={<AccountCircle />} />
                  </Link>

                  <Link onClick={this.handleDropdownClose} to={{ pathname: '/profile', search: `?query=${uid}` }}>
                    <MenuItem innerDivStyle={{ padding: '0px 40px 0px 0px' }} primaryText="View Profile" leftIcon={<ViewIcon />} />
                  </Link>

                  <VendorMenu
                    closeDropdown={this.handleDropdownClose}
                    vendors={usersVendors}
                    onAddVendorClick={() => {
                      this.handleDropdownClose()
                      this.setState({ addVendorModalOpen: true })
                    }}
                  />

                  <LocationMenu
                    showSubMenu={showSubMenu}
                    onClickSubMenu={() => this.setState({ showSubMenu: true })}
                    closeDropdown={this.handleDropdownClose}
                    locations={usersLocations}
                    onAddLocationClick={() => {
                      this.handleDropdownClose()
                      this.setState({ addLocationModalOpen: true })
                    }}
                  />
                  <MenuItem innerDivStyle={{ padding: '0px 40px 0px 0px' }} primaryText="Log Out" leftIcon={<LogoutIcon />} onClick={(e) => { firebase.logout(); this.signOutMessage() }} />

                </div>
              ) : (
                <div>
                  <SignUpForm
                    browser={browser}
                    mobile
                    onSubmit={(values) => {
                      const photoFile = values.photoFile || values.avatar
                      signUp(values.firstName, values.lastName, photoFile, values.email, values.password)
                    }}
                    getDefaultAccountImages={getDefaultAccountImages}
                    defaultAccountImages={account.defaultAccountImages}
                    account={account}
                    cancelSignInUpForm={cancelSignInUpForm}
                    signUpWithGoogle={signUpWithGoogle}
                    signUpWithFacebook={signUpWithFacebook}
                    sendSubmit={submitSignUp}
                  />
                  <SignInForm
                    browser={browser}
                    mobile
                    onSubmit={(values) => {
                      signIn(values.email, values.password)
                    }}
                    account={account}
                    cancelSignInUpForm={cancelSignInUpForm}
                    signInWithFacebook={signInWithFacebook}
                    signInWithGoogle={signInWithGoogle}
                    sendSubmit={submitSignIn}
                  />
                </div>
              )}
            </Drawer>
          )
        }
        <Snackbar
          bodyStyle={{ backgroundColor: '#00C853' }}
          open={this.state.signedOut}
          message={'Successfully Logged Out.'}
          autoHideDuration={4000}
          onRequestClose={this.handleSignOutClose}
        />
        <Route exact path="/" component={Home} />
        <Route exact path="/account" component={Account} />
        <Route path="/search" component={Search} />
        <Route exact path="/forgotpassword" component={ForgotPassword} />
        <Route exact path="/profile/edit" component={EditProfile} />
        <Route exact path="/profile" component={ViewProfile} />
        <Route exact path="/vendor/:vendorId" component={VendorProfile} />
        <Route exact path="/vendor/:vendorId/edit" component={EditVendorProfile} />
        <Route exact path="/location/:locationId" component={LocationProfile} />
        <Route exact path="/location/:locationId/edit" component={EditLocationProfile} />
      </div>
    )
  }
}

App.propTypes = {
  browser: PropTypes.shape({
    lessThan: PropTypes.shape({
      small: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  profile: PropTypes.shape({
    photoURL: PropTypes.string
  }).isRequired,
  auth: PropTypes.shape({
    uid: PropTypes.string
  }).isRequired,
  cancelSignInUpForm: PropTypes.func.isRequired,
  signUp: PropTypes.func.isRequired,
  signUpWithGoogle: PropTypes.func.isRequired,
  signUpWithFacebook: PropTypes.func.isRequired,
  submitSignUp: PropTypes.func.isRequired,
  signIn: PropTypes.func.isRequired,
  signInWithFacebook: PropTypes.func.isRequired,
  signInWithGoogle: PropTypes.func.isRequired,
  submitSignIn: PropTypes.func.isRequired,
  getDefaultAccountImages: PropTypes.func.isRequired,
  usersVendors: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.objectOf(PropTypes.shape({
      creator: PropTypes.string,
      name: PropTypes.string
    }))
  ]),
  usersLocations: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.objectOf(PropTypes.shape({
      creator: PropTypes.string,
      name: PropTypes.string
    }))
  ]),
  history: PropTypes.shape({
    push: PropTypes.func
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired
}

App.defaultProps = {
  usersVendors: PropTypes.any,
  usersLocations: PropTypes.any
}

const wrappedApp = firebaseConnect((props) => {
  const uid = get(props, 'firebase.auth.uid', '')
  return [
    {
      path: 'vendorProfiles',
      storeAs: 'usersVendors',
      queryParams: ['orderByChild=creator', `equalTo=${uid}`]
    },
    {
      path: 'locationProfiles',
      storeAs: 'usersLocations',
      queryParams: ['orderByChild=creator', `equalTo=${uid}`]
    }
  ]
})(App)

export default withRouter(connect(
  state => ({ account: state.account,
    firebase: state.firebase,
    browser: state.browser,
    profile: state.firebase.profile,
    auth: state.firebase.auth,
    usersVendors: state.firebase.data.usersVendors,
    usersLocations: state.firebase.data.usersLocations }),
  { ...accountActions },
)(wrappedApp))
