angular.module("leadric").factory('Profiles', function(Restangular, Verticals, $q) {
	
	var factory = {};
	
	factory.all = [];

    factory.load = function(vertical) {
        var restangularProfiles = Restangular.all('vertical/'+vertical.id).all('member');
        return restangularProfiles.getList().then(function(data) {
            factory.all = data;
            /*
            _.each(factory.all, function(item) {
                factory.getFolloweeCount(item);
            });
        */
    });
    }

    factory.refreshProfile = function(profile, vertical) {
        var deferred = $q.defer();

        Restangular.all('profiles/twitter/' + profile).post().then(function(data) {
            Restangular.all('profiles').all('twitter').one(profile).get().then(function(data) {
                if(data[0]) {
                    deferred.resolve(data[0]);
                }
            });
        });
        return deferred.promise;
    }
    
    factory.addToGroup = function(profile, vertical) {
        return Restangular.all('profiles').all('twitter').one(profile).get().then(function(data) {
            if(data[0]) {
                Verticals.connectProfileWithVertical(vertical.id, data[0].id).then(function() {
                    factory.load(vertical);
                });
            }
            else {
                return Restangular.all('profiles/twitter/' + profile).post().then(function(data) {
                    Verticals.connectProfileWithVertical(vertical.id, data.insertId).then(function() {
                        factory.load(vertical);
                    });
                });
            }
        });
    }
    
    factory.removeFromVertical = function(profileId, verticalId) {
        return Restangular.one('vertical_beacon_map/'+verticalId+'/'+profileId).remove().then(function(data) {
            console.log(data) 
        });
    }
    
    factory.removeAllFromVertical = function(verticalId) {
        return Restangular.one('vertical_beacon_map/'+verticalId).remove().then(function(data) {
            console.log(data) 
        });
    }
    
    factory.delete = function(profile) {
        return Restangular.one('profiles/' + profile.id).remove().then(function() {
            factory.load(Verticals.current);
        })
    }
    
    factory.updateFollowers = function(profile) {
        return Restangular.one('twitter/update_followers_for_profile/' + profile.tw_screen_name + '/' + profile.tw_id_str).post();
    }
    
    factory.getUpdateFollowersState = function(profile) {
        var deferred = $q.defer();
        var state = null;
        
        var pingServer = function() {
            Restangular.one('profiles/' + profile.id).get().then(function(data) {
                state = data[0].followers_updated_state;
                deferred.notify(data[0]);
                if(state !== 3 && state !== 0)
                    setTimeout(function() { pingServer() }, 10000 );
                else
                    deferred.resolve(data[0]);
            });
        }
        pingServer();
        
        return deferred.promise;
    }
    
    factory.getProfile = function(profile) {
        return Restangular.one('profiles/' + profile.id).get();
    }

    
    /*
    fatory.getFolloweeCount = function(profile) {
        return Restangular.one('profiles/').one(profile.tw_id_str).one('followee_count');
    }
    */
    
    return factory;

})
.factory('RestFullResponse', ['Restangular', function (Restangular) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setFullResponse(true);
    });
  }]
);



