import React from 'react'
import QueryString from 'query-string'
import { Card, CardMedia, CardText, CardTitle, CardActions } from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'
import { get } from 'lodash'
import PropTypes from 'prop-types'
import '../../App.css'
import './ViewProfile.css'
import WebsiteIcon from 'material-ui/svg-icons/hardware/laptop-mac'


// // Dummy filler data 

const defaultImage = 'http://sunfieldfarm.org/wp-content/uploads/2014/02/profile-placeholder.png'

// const vimeo = 'https://player.vimeo.com/video/47839264'

class ViewProfile extends React.Component {
  render() {
    const { data, location } = this.props

    // gets uid of current public profile from URL
    const parsed = QueryString.parse(location.search)
    const uid = parsed.query

    // grabs data using uid to populate page
    const roles = get(data, 'roles', {})
    const userProfile = get(data, `userProfiles.${uid}`)
    const userAccount = get(data, `userAccount.${uid}`)

    const userRoles = get(userProfile, 'roles', [])
      .map(roleId => ({ roleName: get(roles, `${roleId}.roleName`, ''), roleId }))
      .sort((a, b) => {
        const aCaps = a.roleName.toUpperCase()
        const bcaps = b.roleName.toUpperCase()
        if (aCaps < bcaps) {
          return -1
        } else if (aCaps > bcaps) {
          return 1
        }
        return 0
      })

    const userLinks = get(userProfile, 'links', [])
    const userCredits = get(userProfile, 'credits', [])
    const bio = get(userProfile, 'bio')
    const experience = get(userProfile, 'experience')
    const currentDate = new Date()
    const numYears = currentDate.getFullYear() - experience
    const headline = get(userProfile, 'headline')
    const video = get(userProfile, 'video', '')

    const profileImageUrl = get(userAccount, 'photoURL', defaultImage)
    const email = get(userAccount, 'email')
    const name = `${get(userAccount, 'firstName', '')} ${get(userAccount, 'lastName', '')}`
    const phone = get(userAccount, 'phone')


    return (
      <div className="ViewProfile">
        <div style={{ display: 'block', margin: 'auto' }}>
          <Card className="profile-card top-card" containerStyle={{ width: '50%', paddingBottom: 0, display: 'flex', flexDirection: 'row' }}>
            <CardMedia className="crew-image">
              <img src={profileImageUrl} alt="" style={{ width: 250, height: 250, objectFit: 'cover', borderBottomLeftRadius: 2, borderTopLeftRadius: 2 }} />
            </CardMedia>
            <div>
              <CardTitle title={name} titleStyle={{ fontWeight: 500, fontSize: '20px' }} subtitle={headline} subtitleStyle={{ minWidth: '250%', fontStyle: 'italic' }} />
              <CardText className="crew-text">
                {numYears} years in industry
              </CardText>
              <CardText className="crew-text">
                {phone}
              </CardText>
              <CardText className="crew-text">
                {email}
              </CardText>
            </div>
          </Card>

          <Card className="profile-card small-card">
            <CardTitle title="About Me" titleStyle={{ fontWeight: 500, fontSize: '20px' }} />
            <CardText>
              {bio}
            </CardText>
            <CardActions>
              {userLinks.map(link => (
                <RaisedButton primary label={link.title} target="_blank" href={link.url} icon={<WebsiteIcon />} />
              ))}
            </CardActions>
          </Card>

          <Card className="profile-card big-card">
            <CardTitle title="Featured Video" titleStyle={{ fontWeight: 500, fontSize: '20px' }} />
            <embed width="100%" height="500px" src={video} />
          </Card>

          <Card className="profile-card big-card">
            <CardTitle title="Credits" titleStyle={{ fontWeight: 500, fontSize: '20px' }} />
            <div className="roles">
              {
                userRoles.map((role) => {
                  const associatedCredits = userCredits.filter(c => c.roleId === role.roleId)
                  return (
                    <div className="role-column" key={role.roleId}>
                      <div className="rounded-header"><span>{role.roleName}</span></div>
                      <div className="credits">
                        { associatedCredits.map(credit => (
                          <p key={credit.title}>{credit.year} : {credit.title}</p>
                        )
                        )}
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </Card>
        </div>
      </div>
    )
  }
}

ViewProfile.propTypes = {
  auth: PropTypes.shape({
    uid: PropTypes.string
  }).isRequired,
  profile: PropTypes.shape({
    photoURL: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string
  }).isRequired,
  data: PropTypes.shape({
    roles: PropTypes.object,
    userProfile: PropTypes.object
  }).isRequired,
  firebase: PropTypes.shape({
    set: PropTypes.func
  }).isRequired
}

ViewProfile.defaultProps = {
}

export default ViewProfile
