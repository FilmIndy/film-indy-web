import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import SearchPage from '../../presentation/search/Search'
import * as algoliaActions from '../../redux/actions/creators/algoliaActions'

class Search extends React.Component {
  render() {
    return (
      <SearchPage {...this.props} />
    )
  }
}

Search.propTypes = {
  searchIndex: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired
  }).isRequired,
  enriched: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default withRouter(connect(
  state => ({ profileIndex: state.algolia.queryResults, enriched: state.algolia.enrichedResults }),
  { ...algoliaActions },
)(Search))
