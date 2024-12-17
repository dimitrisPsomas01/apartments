const router = require('express').Router();
const {get_all_apartments, get_apartment, patch_apartment, create_apartment, delete_apartment, register, login} = require('../controllers/controll');

router.get('/apartments', get_all_apartments);
router.get('/apartments/:id', get_apartment);
router.patch('/apartments/:id', patch_apartment);
router.post('/apartments', create_apartment);
router.delete('/apartments/:id', delete_apartment);
router.post('/register', register);
router.post('/login', login);

module.exports = router;