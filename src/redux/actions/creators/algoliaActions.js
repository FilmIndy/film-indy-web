import * as firebase from 'firebase'
import algoliasearch from 'algoliasearch'
import { uniq } from 'lodash'
import { SEARCH_INDEX, SEARCH_FOR_CREW, SEARCH_FOR_CREW_ENRICHED, ENRICH_SEARCH_RESULT, PARTIAL_UPDATE_OBJECT, MIGRATE_PROFILE } from '../types/algoliaActionsTypes'


const ALGOLIA_APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID
const ALGOLA_ADMIN_KEY = process.env.REACT_APP_ALGOLIA_ADMIN_KEY

const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLA_ADMIN_KEY, { protocol: 'https:' })

export const searchIndex = (indexName, query, tableToEnrichFrom) => (dispatch) => {
  const index = algoliaClient.initIndex(indexName)
  return dispatch({
    type: SEARCH_INDEX,
    payload: index.search({ query })
  }).then((result) => {
    const hits = result.action.payload.hits
    const enriched = Promise.all(hits.map((hit) => {
      const objectID = hit.objectID
      return firebase.database().ref(`${tableToEnrichFrom}/${objectID}`).once('value').then((snapshot) => {
        const value = snapshot.val()
        return { objectID, value }
      })
    }))
    return dispatch({
      type: ENRICH_SEARCH_RESULT,
      payload: enriched
    })
  })
}

export const searchForCrew = query => (dispatch) => {
  const indexNames = ['profiles', 'names']
  const searchPromises = indexNames.map((indexName) => {
    const index = algoliaClient.initIndex(indexName)
    return index.search({ query }).then(results => ({ indexName, results }))
  })
  return dispatch({
    type: SEARCH_FOR_CREW,
    payload: Promise.all(searchPromises)
  }).then((searchResults) => {
    const uniqueHits = uniq(searchResults.value.reduce((acc, result) => [...acc, ...result.results.hits], []), 'objectID')
    const enrichPromises = Promise.all(uniqueHits.map(uniqueHit => firebase.database().ref(`userAccount/${uniqueHit.objectID}`)
      .once('value')
      .then(snapshot => ({ objectID: uniqueHit.objectID, value: snapshot.val() }))))
    return dispatch({
      type: SEARCH_FOR_CREW_ENRICHED,
      payload: enrichPromises
    })
  })
}

export const migrateProfile = (uid, email) => (dispatch) => {
  const profileIndex = algoliaClient.initIndex('profiles')
  const updatePromise = profileIndex.getObject(email).then((err, content) => profileIndex.addObject({
    ...content,
    objectID: uid
  })).then(() => profileIndex.deleteObject(email))
  return dispatch({
    type: MIGRATE_PROFILE,
    payload: updatePromise
  })
}

export const partialUpdateAlgoliaObject = (index, updateObject) => dispatch => dispatch({
  type: PARTIAL_UPDATE_OBJECT,
  payload: algoliaClient.initIndex(index).partialUpdateObject(updateObject)
})
