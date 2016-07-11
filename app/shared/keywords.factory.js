angular.module("leadric").factory('Keywords', function(Restangular, $q) {
	
	var factory = {};
	
	factory.all = [];

    
    factory.sos = function(vertical, year, week) {
        return Restangular.one('sos/').one(vertical).one(year).one(week).get();
    }

    factory.list = function(vertical) {
    	return Restangular.one('keyword/').get({industry: vertical});
    }

    factory.update = function(keyword) {
    	return Restangular.one('keyword/').put(keyword);
    }
    
    return factory;

});

