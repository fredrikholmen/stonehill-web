angular.module("leadric").factory('Industries', function(Restangular, $q) {
	
	var factory = {};

	factory.listUsed = function() {
        return Restangular.one('industry/').get({listUsed: true});
    }
    
    return factory;

});