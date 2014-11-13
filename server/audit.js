var etcd = require('./etcd'),
    _ = require('underscore'),
    config = require('./../config/config.json');

var getUserDetails = function(req){
  return config.RequiresAuth ? req.user._json : { name: 'Anonymous'};
};

module.exports = {
    getApplicationAuditTrail: function(applicationName, callback){
        var path = 'v1/audit/application/' + applicationName;
        etcd.client.get(path, {recursive: true}, function(err, result){
            if (err) {
                callback(err);
                return;
            }

            var auditTrail = _.map(result.node.nodes || [], function(node)
                {
                    var auditJson = JSON.parse(node.value);
                    auditJson.createdIndex = node.createdIndex;
                    return auditJson;
                });
            callback(null, auditTrail);
        });
    },

    getFeatureAuditTrail: function(applicationName, featureName, callback){
        var path = 'v1/audit/feature/' + applicationName + '/' + featureName;
        etcd.client.get(path, {recursive: true}, function(err, result){
            if (err) {
                callback(err);
                return;
            }

            var auditTrail = _.map(result.node.nodes || [], function(node)
            {
                var auditJson = JSON.parse(node.value);
                auditJson.createdIndex = node.createdIndex;
                return auditJson;
            });
            callback(null, auditTrail);
        });
    },

    addApplicationAudit: function(req, applicationName, action, callback){
        var audit = {
            user: getUserDetails(req),
            action: action,
            dateModified: new Date().toISOString() // todo: should be UTC time
        };
        var auditJson = JSON.stringify(audit);

        var path = 'v1/audit/application/' + applicationName;
        etcd.client.post(path, auditJson, function(err){
            if (err) {
                callback(err);
                return;
            }
            callback();
        });
    },

    addFeatureAudit: function(req, applicationName, featureName, toggleName, value, action, callback){
        var audit = {
            user: getUserDetails(req),
            toggleName: toggleName,
            value: value,
            action: action,
            dateModified: new Date().toISOString() // todo: should be UTC time
        };
        console.log(audit);
        var auditJson = JSON.stringify(audit);

        var path = 'v1/audit/feature/' + applicationName + '/' + featureName;
        etcd.client.post(path, auditJson, function(err){
            if (err) {
                callback(err);
                return;
            }
            callback();
        });
    }
};