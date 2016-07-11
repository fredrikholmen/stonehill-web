angular.module("leadric").factory('Verticals', function(Restangular) {
	
	var factory = {};
	
	factory.all = [];
    factory.current = false;
    
    factory.load = function() {
        var restangularVerticals = Restangular;
        restangularVerticals.addResponseInterceptor(function (data, operation, what) {
            var newData = data.data || [];
            if(data) {
                Object.keys(data).forEach(function (key) {
                    if (key !== 'data') {
                        newData[key] = data[key];
                    }
                });
            }
            data = newData;
            return data;
        });
        return restangularVerticals.all('vertical').getList().then(function(data) {
            factory.all = data;
            return factory.loadDefault();
        });
    }
    
    factory.loadDefault = function() {
        return Restangular.one('vertical/get_default').get().then(function(data) {
            factory.current = _.findWhere(factory.all, { id: data[0].id })
        });
    }
    
    factory.createVerticalWithUsers = function(name, userList) {
        return Restangular.all('vertical').post({name: name}).then(function(data) {
            _.each(userList, function(user) {
                Restangular.all('vertical/'+data.insertId).all('member/'+user.id).post()
            });
            factory.load().then(function() {
                factory.current = _.find(factory.all, {id: data.insertId});
            });
        });
    }
    
    factory.createVertical = function(name) {
        return Restangular.all('vertical').post({name: name}).then(function(data) {
            factory.load().then(function() {
                factory.current = _.find(factory.all, {id: data.insertId});
            });
        });
    }
    
    factory.connectProfileWithVertical = function(verticalId, profileId) {
        return Restangular.all('vertical/' + verticalId).all('member/' + profileId).post();
    }
    
    factory.delete = function(vertical) {
        return vertical.remove();
    }
	
	return factory;
	
});