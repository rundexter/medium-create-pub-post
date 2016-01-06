var util = require('./util.js'),
    _ = require('lodash');
var request = require('request').defaults({
    baseUrl: 'https://api.medium.com/'
});

var pickInputs = {
        'publicationId': { key: 'publicationId', validate: {req: true} },
        'authorId': { key: 'authorId', validate: {req: true} },
        'title': { key: 'title', validate: {req: true} },
        'contentFormat': { key: 'contentFormat', validate: {req: true} },
        'content': { key: 'content', validate: {req: true} },
        'tags': { key: 'tags', type: 'array' },
        'canonicalUrl': 'canonicalUrl',
        'publishStatus': 'publishStatus',
        'license': 'license'
    }, pickOutputs = {
        'id': 'data.id',
        'title': 'data.title',
        'authorId': 'data.authorId',
        'tags': 'data.tags',
        'url': 'data.url',
        'canonicalUrl': 'data.canonicalUrl',
        'publishStatus': 'data.publishStatus',
        'publicationId': 'data.publicationId',
        'license': 'data.license',
        'licenseUrl': 'data.licenseUrl'
    };

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var inputs = util.pickInputs(step, pickInputs),
            validationErrors = util.checkValidateErrors(inputs, pickInputs),
            token = dexter.environment('medium_access_token');

        if (!token)
            return this.fail('A [medium_access_token] environment variable is required for this module');

        if (validationErrors)
            return this.fail(validationErrors);

        request.post({
            uri: '/v1/publications/' + inputs.publicationId + '/posts',
            body: _.omit(inputs, 'publicationId'),
            auth: { bearer: token },
            json: true
        }, function (error, response, body) {
            if (error)
                this.fail(error);
            else
                this.complete(util.pickOutputs(body, pickOutputs));
        }.bind(this));
    }
};
