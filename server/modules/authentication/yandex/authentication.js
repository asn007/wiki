/* global WIKI */

// ------------------------------------
// Yandex Account
// ------------------------------------

const YandexStrategy = require('./strategy')

module.exports = {
  init (passport, conf) {
    passport.use('yandex',
      new YandexStrategy({
        clientID: conf.clientId,
        clientSecret: conf.clientSecret,
        callbackURL: conf.callbackURL,
        passReqToCallback: true
      }, async (req, accessToken, refreshToken, profile, cb) => {
        if (profile._json.default_email.split('@')[1] !== conf.authenticationDomain) { return cb(new Error('Authentication domain does not match!'), null) }
        try {
          const user = await WIKI.models.users.processProfile({
            providerKey: req.params.strategy,
            profile: {
              ...profile,
              displayName: profile._json.real_name,
              email: profile._json.default_email,
              picture: profile._json.is_avatar_empty ?
                undefined :
                profile.photos.find((item) => item.type === 'thumbnail')
                  .value
            }
          })
          return cb(null, user)
        } catch (err) {
          return cb(err, null)
        }
      }
      ))
  }
}
