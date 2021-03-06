var _ = require('underscore'),
    config = require('./../../config/config.json'),
    acl = require('./../acl'),
    audit = require('./../audit'),
    etcdBaseUrl = "http://" + config.etcdHost + ":" + config.etcdPort + '/v2/keys/';

var getCategory = function(id, name, description, columns, features){
    return {
        id: id,
        name: name,
        description: description || "",
        columns: columns || [],
        features: features || [] 
    };
};

var simpleCategoryId = 0;
module.exports.simpleCategoryId = simpleCategoryId;

var getSimpleCategory = function(name, description){
    return getCategory(0, name || 'Simple Features', 
        description || 'Used for simple on/off feature toggles', [""]);
};

var isSimpleCategory = function(categoryId){
    return categoryId === simpleCategoryId;
};

module.exports.getCategoriesFromConfig = function() {
    if (!config.categories) {
        return { simpleCategoryId: getSimpleCategory() };
    }

    var categories = _.map(config.categories, function(c) {
        if (isSimpleCategory(c.id)) {
            return [simpleCategoryId, getSimpleCategory(c.name, c.description)];
        }
        return [c.id, getCategory(c.id, c.name, c.description, _.clone(c.values))];
    });
    return _.object(categories);
};

