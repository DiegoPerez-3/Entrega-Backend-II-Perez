import passport from 'passport';

export const passportCall = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(
      strategy,
      { session: false },
      (err, user, info) => {
        if (err) return next(err);

        if (!user) {
          return res.status(401).json({
            status: 'error',
            message: info?.message || (info ? info.toString() : 'Unauthorized'),
          });
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  };
};
