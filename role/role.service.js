const db = require('_helpers/db');

module.exports = {
    
    getAll,
    getAllEnable,
    getById,
    create,
    update,
    delete: _delete
};

async function getAllEnable() {
    const role = await db.Role.find({status:'enable'});
    return role.map(x => basicDetails(x));
}

async function getAll() {
    const role = await db.Role.find();
    return role.map(x => basicDetails(x));
}

async function getById(id) {
    const role = await getRole(id);
    return basicDetails(role);
}

async function create(params) {
    // validate
    if (await db.Role.findOne({ role: params.role })) {
        throw 'Role "' + params.role + '" is already taken.';
    }

    const role = new db.Role(params);
    role.verified = Date.now();

    // save account
    await role.save();

    return basicDetails(role);
}

async function update(id, params) {
    const role = await getRole(id);

    // validate (if role was changed)
    if (params.role && role.role !== params.role && await db.Role.findOne({ role: params.role })) {
        throw 'Role "' + params.role + 'is already taken';
    }

    // copy params to account and save
    Object.assign(role, params);
    role.updated = Date.now();
    await role.save();

    return basicDetails(role);
}

async function _delete(id) {
    const role = await getRole(id);
    await role.remove();
}

// helper functions

async function getRole(id) {
    if (!db.isValidId(id)) throw 'Role not found';
    const role = await db.Role.findById(id);
    if (!role) throw 'Role not found';
    return role;
}

function basicDetails(role) {
    const { id, name, status, created, updated } = role;
    return { id, name, status, created, updated };
}
