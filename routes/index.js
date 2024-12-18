const router = require('express').Router();
const deleteController = require('../controllers/deleteController');
const getController = require('../controllers/getController');
const patchController = require('../controllers/patchController');
const postController = require('../controllers/postController');

router.get('/apartments', getController.get_all_apartments);
router.get('/apartments/:id', getController.get_apartment);
router.patch('/apartments/:id', patchController.patch_apartment);
router.post('/apartments', postController.create_apartment);
router.delete('/apartments/:id', deleteController.delete_apartment);
router.post('/register', postController.register);
router.post('/login', postController.login);

module.exports = router;