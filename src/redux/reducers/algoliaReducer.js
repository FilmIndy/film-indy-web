import {
  REMOVE_ROLE_SEARCH_FILTER, ADD_ROLE_SEARCH_FILTER, SEARCH_INDEX, ENRICH_SEARCH_RESULT,
  SEARCH_FOR_CREW, SEARCH_FOR_CREW_ENRICHED, RESET_SEARCH_RESULTS, SEARCH_FOR_VENDORS,
  SEARCH_FOR_VENDORS_ENRICHED, SEARCH_FOR_LOCATIONS, SEARCH_FOR_LOCATIONS_ENRICHED,
  SEARCH_FOR_ROLES, ADD_EXPERIENCE_SEARCH_FILTER, SEARCH_FOR_LOCATION_TYPES,
  ADD_LOCATION_TYPE_SEARCH_FILTER, REMOVE_LOCATION_TYPE_SEARCH_FILTER } from '../actions/types/algoliaActionsTypes'

import { uniqBy, get } from 'lodash'

const initalState = {
  offset: 0,
  length: 10,
  totalHits: { hasLoaded: false, profiles: 0, names: 0 },
  queryResults: [],
  enrichedResults: [],
  crewQueryResults: [],
  enrichedCrewResults: [],
  vendorQueryResults: [],
  enrichedVendorQueryResults: [],
  locationQueryResults: [],
  enrichedLocationQueryResults: [],
  roleSearchResults: [],
  locationTypeSearchResults: [],
  roleFilters: [],
  locationTypeFilters: [],
  experienceFilter: { min: undefined, max: undefined },
  totalVendorHits: { hasLoaded: false },
  totalLocationHits: { hasLoaded: false }
}

export default (state = initalState, action) => {
  switch (action.type) {
    case `${RESET_SEARCH_RESULTS}_STARTING`:
      const roleFilters = action.payload.filters.filter(filter => filter.type === 'role').map(filter => filter.role)
      const locationTypeFilters = action.payload.locationTypeFilters.filter(filter => filter.type === 'location').map(t => t.locationType)
      return {
        ...state,
        offset: action.payload.offset,
        length: action.payload.length,
        totalHits: { hasLoaded: false },
        enrichedCrewResults: [],
        crewQueryResults: [],
        vendorQueryResults: [],
        enrichedVendorQueryResults: [],
        locationQueryResults: [],
        enrichedLocationQueryResults: [],
        roleFilters,
        locationTypeFilters
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
        crewQueryResults: [...state.crewQueryResults, ...action.payload.reduce((acc, r) => [...acc, ...get(r, 'results.hits', [])], [])]
      }
    case `${SEARCH_FOR_CREW_ENRICHED}_STARTING`:
      const profileHits = get(action, 'payload.totalHits.profiles', 0)
      const nameHits = get(action, 'payload.totalHits.names', 0)
      return {
        ...state,
        totalHits: {
          ...state.totalHits,
          profiles: profileHits,
          names: nameHits
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

    case `${SEARCH_FOR_LOCATIONS}_STARTING`:
      return {
        ...state,
        ...action.payload,
        totalLocationHits: {
          ...state.totalLocationHits,
          hasLoaded: false
        }
      }
    case `${SEARCH_FOR_LOCATIONS}_SUCCESS`:
      return {
        ...state,
        locationQueryResults: [...state.locationQueryResults, ...action.payload.reduce((acc, r) => [...acc, ...r.results.hits], [])]
      }
    case `${SEARCH_FOR_LOCATIONS_ENRICHED}_STARTING`:
      return {
        ...state,
        totalLocationHits: {
          ...state.totalLocationHits,
          ...action.payload.totalHits
        }
      }
    case `${SEARCH_FOR_LOCATIONS_ENRICHED}_SUCCESS`:
      if (action.payload.length > 0) {
        const newResults = [...state.enrichedLocationQueryResults, ...state.locationQueryResults.map((result) => {
          const objectID = result.objectID
          const enrichmentData = action.payload.find(enriched => enriched.objectID === objectID)
          if (enrichmentData) {
            return { ...result, ...enrichmentData.value }
          }
          return { ...result }
        })]
        return {
          ...state,
          totalLocationHits: {
            ...state.totalLocationHits,
            hasLoaded: true
          },
          enrichedLocationQueryResults: uniqBy(newResults, 'objectID')
        }
      }
      return {
        ...state,
        totalLocationHits: {
          ...state.totalLocationHits,
          hasLoaded: true
        }
      }

    case `${SEARCH_FOR_ROLES}_SUCCESS`:
      return {
        ...state,
        roleSearchResults: action.payload.hits
      }

    case `${SEARCH_FOR_LOCATION_TYPES}_SUCCESS`:
      return {
        ...state,
        locationTypeSearchResults: action.payload.hits
      }

    case ADD_ROLE_SEARCH_FILTER:
      return {
        ...state,
        roleFilters: [...state.roleFilters, ...action.payload]
      }

    case REMOVE_ROLE_SEARCH_FILTER:
      return {
        ...state,
        roleFilters: state.roleFilters.filter(role => role !== action.payload)
      }

    case ADD_LOCATION_TYPE_SEARCH_FILTER:
      return {
        ...state,
        locationTypeFilters: [...state.locationTypeFilters, ...action.payload]
      }

    case REMOVE_LOCATION_TYPE_SEARCH_FILTER:
      return {
        ...state,
        locationTypeFilters: state.locationTypeFilters.filter(t => t !== action.payload)
      }

    case ADD_EXPERIENCE_SEARCH_FILTER:
      return {
        ...state,
        experienceFilter: { min: action.payload.min, max: action.payload.max }
      }


    default:
      return state
  }
}
