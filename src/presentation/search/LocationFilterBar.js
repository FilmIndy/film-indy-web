import React from 'react'
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more'
import NavigationExpandLessIcon from 'material-ui/svg-icons/navigation/expand-less'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import Paper from 'material-ui/Paper'
import Popover from 'react-simple-popover'
import QueryString from 'query-string'
import PropTypes from 'prop-types'
import { get } from 'lodash'
import 'react-input-range/lib/css/index.css'
import SearchAndSelectLocationTypes from '../common/SearchAndSelectLocationTypes'

class LocationFilterBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = { menuOpen: false }
    this.openMenu = this.openMenu.bind(this)
    this.closeMenu = this.closeMenu.bind(this)
  }
  openMenu(event) {
    event.preventDefault()
    this.setState({ menuOpen: true, anchorEl: event.currentTarget })
  }
  closeMenu() {
    this.setState({ menuOpen: false })
  }
  render() {
    const { menuOpen } = this.state
    const { history, addLocationTypeSearchFilter, removeLocationTypeSearchFilter, locationTypeFilters } = this.props
    return (
      <Paper>
        <Toolbar style={{ backgroundColor: '#FFFFF' }}>
          <ToolbarGroup style={{ marginLeft: 220 }}>
            <div role="button" style={{ color: 'black' }} onClick={this.openMenu} >
              <ToolbarTitle text="Location Types" />
              {
                menuOpen ?
                  (<NavigationExpandLessIcon style={{ color: 'black', verticalAlign: 'text-bottom' }} />)
                  : (<NavigationExpandMoreIcon style={{ color: 'black', verticalAlign: 'text-bottom' }} />)
              }
              <Popover
                placement="bottom"
                container={this}
                target={this.state.anchorEl}
                show={menuOpen}
                onHide={this.closeMenu}
              >
                <Paper style={{ marginTop: 125, position: 'fixed', zIndex: 2100, overflowY: 'auto' }}>
                  <SearchAndSelectLocationTypes
                    page="search"
                    locationTypeFilters={locationTypeFilters}
                    onItemSelected={(selectedItem, itemSelected, type) => {
                      const parsedQs = QueryString.parse(window.location.search)
                      const typesFromQs = get(parsedQs, 'locationType', [])
                      const types = typeof (typesFromQs) === 'string' ? [typesFromQs] : typesFromQs
                      if (type === 'add') {
                        addLocationTypeSearchFilter([itemSelected.type])
                        const newTypes = [...types, itemSelected.type]
                        const newQs = QueryString.stringify({ ...parsedQs, locationType: newTypes })
                        history.push({ pathname: '/search', search: newQs })
                      } else if (type === 'remove') {
                        removeLocationTypeSearchFilter(itemSelected.type)
                        const newTypes = types.filter(t => t !== itemSelected.type)
                        const newQs = QueryString.stringify({ ...parsedQs, locationType: newTypes })
                        history.push({ pathname: '/search', search: newQs })
                      }
                    }}
                  />
                </Paper>
              </Popover>
            </div>
          </ToolbarGroup>
        </Toolbar>
      </Paper>
    )
  }
}

LocationFilterBar.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  removeLocationTypeSearchFilter: PropTypes.func.isRequired,
  addLocationTypeSearchFilter: PropTypes.func.isRequired,
  locationTypeFilters: PropTypes.arrayOf(PropTypes.string).isRequired
}

export default LocationFilterBar
