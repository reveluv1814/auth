const passport = require('passport');

//estrategias de autentificacion
const LocalStrategy = require('./strategies/local.strategy');
//jwt
const JwtStrategy = require('./strategies/jwt');

passport.use(LocalStrategy);
passport.use(JwtStrategy);
