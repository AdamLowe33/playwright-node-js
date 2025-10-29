module.exports = {
  // Example hook to modify request data before sending
  beforeRequest: function (req, context, ee, next) {
    console.log(`➡️  Requesting ${req.url}`);
    return next();
  },

  generateRandomEmail: function(context, events, done) {
    context.vars.randomEmail = `test_${Date.now()}@example.com`;
    return done();
  },
  
  // logResponse: function(requestParams, response, context, ee, next) {
  //   console.log('Response status:', response.statusCode);
  //   return next();
  // }

  afterResponse: function (req, res, context, ee, next) {
    console.log(`✅ ${req.url} -> ${res.statusCode}`);
    return next();
  }
};
