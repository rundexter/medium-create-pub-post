var _     = require('lodash')
  , agent = require('superagent')
  , q     = require('q')
;

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var items = step.inputObject(['publicationId', 'title', 'contentFormat', 'content', 'tags', 'canonicalUrl', 'publishStatus', 'license'])
          , token = dexter.provider('medium').credentials('access_token')
        ;

        q.all(_.map(items, function(item) {
            var deferred = q.defer();
            agent.post('https://api.medium.com/v1/publications/'+item.publicationId+'/posts')
              .set('Authorization', 'Bearer '+token)
              .send(_.omit(item, 'publicationId'))
              .type('json')
              .end(deferred.makeNodeResolver())
            ;

            return deferred
                     .promise
                     .then(function(result) {
                        return _.get(result, 'body.data');
                     })
                   ;
          }))
          .then(this.complete.bind(this))
          .catch(this.fail.bind(this))
        ;
    }
};
