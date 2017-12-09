import { SEARCH_INDEX, ENRICH_SEARCH_RESULT, SEARCH_FOR_CREW, SEARCH_FOR_CREW_ENRICHED, RESET_SEARCH_RESULTS, SEARCH_FOR_VENDORS, SEARCH_FOR_VENDORS_ENRICHED, SEARCH_FOR_ROLES } from '../actions/types/algoliaActionsTypes'
import { uniqBy } from 'lodash'

const initalState = {
  offset: 0,
  length: 10,
  totalHits: { hasLoaded: false },
  queryResults: [],
  enrichedResults: [],
  crewQueryResults: [],
  enrichedCrewResults: [],
  vendorQueryResults: [],
  enrichedVendorQueryResults: [],
  roleSearchResults: [],
  totalVendorHits: { hasLoaded: false }
}

export default (state = initalState, action) => {
  switch (action.type) {
    case `${RESET_SEARCH_RESULTS}_STARTING`:
      return {
        ...state,
        offset: action.payload.offset,
        length: action.payload.length,
        totalHits: { hasLoaded: false },
        enrichedCrewResults: [],
        crewQueryResults: [],
        vendorQueryResults: [],
        enrichedVendorQueryResults: []
      }
    case `${SEARCH_INDEX}_SUCCESS`:
      return {
        enrichedResults: [],
        queryResults: action.payload.hits
      }
    case `${ENRICH_SEARCH_RESULT}_SUCCESS`:
      return {
        ...state,
        enrichedResults: [...state.enrichedResults, ...state.queryResults.map((result) => {
          const objectID = result.objectID
          const enrichmentData = action.payload.find(enriched => enriched.objectID === objectID)
          return { ...result, ...enrichmentData.value }
        })]
      }
    case `${SEARCH_FOR_CREW}_STARTING`:
      return {
        ...state,
        ...action.payload,
        totalHits: {
          ...state.totalHits,
          hasLoaded: false
        }
      }
    case `${SEARCH_FOR_CREW}_SUCCESS`:
      return {
        ...state,
        crewQueryResults: [...state.crewQueryResults, ...action.payload.reduce((acc, r) => [...acc, ...r.results.hits], [])]
      }
    case `${SEARCH_FOR_CREW_ENRICHED}_STARTING`:
      return {
        ...state,
        totalHits: {
          ...state.totalHits,
          ...action.payload.totalHits
        }
      }
    case `${SEARCH_FOR_CREW_ENRICHED}_SUCCESS`:
      if (action.payload.length > 0) {
        const newResults = [...state.enrichedCrewResults, ...state.crewQueryResults.map((result) => {
          const objectID = result.objectID
          const enrichmentData = action.payload.find(enriched => enriched.objectID === objectID)
          if (enrichmentData) {
            return { ...result, ...enrichmentData.value }
          }
          return { ...result }
        })]
        return {
          ...state,
          totalHits: {
            ...state.totalHits,
            hasLoaded: true
          },
          enrichedCrewResults: uniqBy(newResults, 'objectID')
        }
      }
      return {
        ...state,
        totalHits: {
          ...state.totalHits,
          hasLoaded: true
        }
      }

    case `${SEARCH_FOR_VENDORS}_STARTING`:
      return {
        ...state,
        ...action.payload,
        totalVendorHits: {
          ...state.totalVendorHits,
          hasLoaded: false
        }
      }
    case `${SEARCH_FOR_VENDORS}_SUCCESS`:
      return {
        ...state,
        vendorQueryResults: [...state.vendorQueryResults, ...action.payload.reduce((acc, r) => [...acc, ...r.results.hits], [])]
      }
    case `${SEARCH_FOR_VENDORS_ENRICHED}_STARTING`:
      return {
        ...state,
        totalVendorHits: {
          ...state.totalVendorHits,
          ...action.payload.totalHits
        }
      }
    case `${SEARCH_FOR_VENDORS_ENRICHED}_SUCCESS`:
      if (action.payload.length > 0) {
        const newResults = [...state.enrichedVendorQueryResults, ...state.vendorQueryResults.map((result) => {
          const objectID = result.objectID
          const enrichmentData = action.payload.find(enriched => enriched.objectID === objectID)
          if (enrichmentData) {
            return { ...result, ...enrichmentData.value }
          }
          return { ...result }
        })]
        return {
          ...state,
          totalVendorHits: {
            ...state.totalVendorHits,
            hasLoaded: true
          },
          enrichedVendorQueryResults: uniqBy(newResults, 'objectID')
        }
      }
      return {
        ...state,
        totalVendorHits: {
          ...state.totalVendorHits,
          hasLoaded: true
        }
      }

    case `${SEARCH_FOR_ROLES}_SUCCESS`:
      return {
        ...state,
        roleSearchResults: action.payload.hits
      }


    default:
      return state
  }
}
