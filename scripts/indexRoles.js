const algoliasearch = require('algoliasearch')
const firebase = require('firebase')

const ALGOLIA_APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID
const ALGOLIA_ADMIN_KEY = process.env.REACT_APP_ALGOLIA_ADMIN_KEY
const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET
}

firebase.initializeApp(firebaseConfig)

const roleIndex = algoliaClient.initIndex('roles')

firebase.database().ref('/roles').once('value').then((snapshot) => {
  const roles = snapshot.val()
  const rolesToIndex = Object.keys(roles).map((roleId) => {
    const roleName = roles[roleId].roleName
    return { objectID: roleId, roleName }
  })
  roleIndex.addObjects(rolesToIndex).then(() => firebase.database().goOffline())
})
