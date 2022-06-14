const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const roleService = require('./role.service');

// routes

router.get('/', authorize(Role.Admin), getAll);
router.get('/all-enabled', authorize(Role.Admin), getAllEnable);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), createSchema, create);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function getAllEnable(res, next) {
    roleService.getAllEnable()
        .then(role => res.json(role))
        .catch(next);
}

function getAll(res, next) {
    roleService.getAll()
        .then(role => res.json(role))
        .catch(next);
}

function getById(req, res, next) {
    // users can get their own account and admins can get any account
    //if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    //    return res.status(401).json({ message: 'Unauthorized' });
    //}

    roleService.getById(req.params.id)
        .then(role => role ? res.json(role) : res.sendStatus(404))
        .catch(next);
}

function createSchema(req, next) {
    const schema = Joi.object({
        
        Name: Joi.string().required(),
        
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    roleService.create(req.body)
        .then(role => res.json(role))
        .catch(next);
}

function updateSchema(req, next) {
    const schemaRules = {
    
        Name: Joi.string().empty(''),
    
    };

    // only admins can update role
    if (req.user.role === Role.Admin) {
        schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    }

    const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    // users can update their own account and admins can update any account
    //if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
     //   return res.status(401).json({ message: 'Unauthorized' });
    //}

    roleService.update(req.params.id, req.body)
        .then(role => res.json(role))
        .catch(next);
}

function _delete(req, res, next) {
    // users can delete their own account and admins can delete any account
    //if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    //    return res.status(401).json({ message: 'Unauthorized' });
    //}

    roleService.delete(req.params.id)
        .then(() => res.json({ message: 'Role deleted successfully' }))
        .catch(next);
}
