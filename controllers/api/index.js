const router = require('express').Router();

const userRoutes = require('./user-routes.js');
const pokemonRoutes = require('./pokemon')

router.use('/users', userRoutes);
router.use('/pokemon', pokemonRoutes);

module.exports = router;