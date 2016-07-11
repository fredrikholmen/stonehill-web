angular.module("leadric").controller("twitterController", function($scope, Verticals, Profiles, Congregations, $timeout) {
    
    $scope.profiles = Profiles;
    $scope.verticals = Verticals;
    $scope.congregations = Congregations;
    
    $scope.newGroupMode = false;
    $scope.followersSumFromProfiles = 0;
    $scope.downloadedFollowersSumFromProfiles = 0;
    
    // Profiles
    
    $scope.addProfileToGroup = function() {
        
        function _profileExistsInGroup(profileHandle, loadedProfiles) {
            var result = false;
            _.each(loadedProfiles, function(item) {
                if(item.tw_screen_name.toLowerCase() == profileHandle.toLowerCase())
                    result = item
            });
            return result;
        }

        if(!$scope.profileHandle) {
            alert("Please enter a Twitter username in the left field");
            return;
        }
        
        var existingProfile = _profileExistsInGroup($scope.profileHandle, Profiles.all)
        if(existingProfile) {
            $scope.profileHandle = null;
            alert("Twitter user already exists in group");
            return;
        }
        
        $scope.addProfileButtonLoader = true;
        Profiles.addToGroup($scope.profileHandle, Verticals.current).then(function() {
            $scope.profileHandle = null;
            $scope.addProfileButtonLoader = false;
        });
    }
    
    $scope.refreshProfile = function(profile) {
        profile.refreshing = true;
        Profiles.refreshProfile(profile.tw_screen_name, Verticals.current.id).then(function(newProfile) {
            profile.refreshing = false;
            angular.extend(profile, newProfile);
        });
        _calculateFollowersSumFromProfiles();
    }

    $scope.refreshAllProfiles = function() {
        _.each(Profiles.all, function(item) {
            $scope.refreshProfile(item);
        });
    }
    
    $scope.removeProfileFromVertical = function(profile) {
        if(confirm("Are you sure you want to remove this profile from the group")) {
            Profiles.removeFromVertical(profile.id, Verticals.current.id);
            var index = Profiles.all.indexOf(profile);
            Profiles.all.splice(index, 1);
            _calculateFollowersSumFromProfiles();
        }
    }
    
    $scope.removeAllProfilesFromVertical = function() {
        if(confirm("Are you sure you want to remove all profiles from this group")) {
            Profiles.removeAllFromVertical(Verticals.current.id);
            Profiles.all = [];
            _calculateFollowersSumFromProfiles();
        }
    }
    
    $scope.updateFollowersForProfile = function(profile) {
        Profiles.updateFollowers(profile).then(function() {
            $scope.getUpdatedFollowersState(profile);
        });
    }

    $scope.updateFollowersForAllProfile = function() {
        $scope.allProfilesFollowersRefreshing = true;
        _.each(Profiles.all, function(item) {
            $scope.updateFollowersForProfile(item);
        });
        
        var pingFollowersRefresh = function() {
            var profilesUpdating = false;
            _.each(Profiles.all, function(item) {
                if(item.updateFollowersState)
                    profilesUpdating = true;
            });
            if(profilesUpdating)
                $timeout(function() { pingFollowersRefresh(); }, 5000);
            else
                $scope.allProfilesFollowersRefreshing = false;
        }
        pingFollowersRefresh();
    }
    
    $scope.getUpdatedFollowersState = function(profile) {
        profile.updateFollowersState = "Queuing";
        Profiles.getUpdateFollowersState(profile).then(
            function(newProfile) {
                profile.updateFollowersState = false;
            },
            function(newProfile) {
                console.log(error);
            },
            function(newProfile) {
                if(newProfile.followers_updated_state === 1)
                    profile.updateFollowersState = "Queuing";
                else if(newProfile.followers_updated_state === 2)
                    profile.updateFollowersState = "Processing";
                profile.collected_followers_count = newProfile.collected_followers_count;
                profile.collected_followers_updated = newProfile.collected_followers_updated;
                _calculateFollowersSumFromProfiles();
            }
        );
    }
    var _calculateFollowersSumFromProfiles = function() {
        $scope.followersSumFromProfiles = 0;
        $scope.downloadedFollowersSumFromProfiles = 0;
        _.each(Profiles.all, function(item) {
            $scope.followersSumFromProfiles += item.tw_followers_count;
            $scope.downloadedFollowersSumFromProfiles += item.collected_followers_count;
        });
    }
    
    
    
    // Verticals
    
    $scope.toggleNewGroup = function() {
        if($scope.newGroupMode)
            $scope.newGroupMode = false;
        else
            $scope.newGroupMode = true;
    }
    
    $scope.createVerticalWithProfiles = function() {
        if(!$scope.groupName) {
            alert("Please enter a group name");
            return;
        }
        
        var labBench = _.find(Verticals.all, {is_default: 1});
        var createdFromLabBench = false;
        if(labBench && Verticals.current === labBench)
            createdFromLabBench = true;
        $scope.addGroupWithProfilesButtonLoader = true;
        Verticals.createVerticalWithUsers($scope.groupName, Profiles.all).then(function(data) {
            $scope.addGroupWithProfilesButtonLoader = false;
            $scope.newGroupMode = false;
            if(createdFromLabBench)
                Profiles.removeAllFromVertical(labBench.id);
        });
    }
    
    $scope.createVertical = function() {
        if(!$scope.groupName) {
            alert("Please enter a group name");
            return;
        }
        
        Verticals.createVertical($scope.groupName).then(function(data) {
            $scope.addGroupButtonLoader = false;
            $scope.newGroupMode = false;
            Profiles.all = [];
        });
    }
    
    $scope.selectVertical = function() {
        Profiles.load(Verticals.current).then(function() {
            _calculateFollowersSumFromProfiles();
        });
        Congregations.current = false;
        Congregations.currentCount = false;
        Congregations.currentCutoff = false;
        $scope.congregationsGraph = false;
    }
    
    $scope.deleteVertical = function(vertical) {
        if(confirm("Are you sure you want to delete this group?")) {
            Profiles.removeAllFromVertical(Verticals.current.id);
            Profiles.all = [];
            Verticals.delete(vertical);
            var index = Verticals.all.indexOf(vertical);
            Verticals.all.splice(index, 1);
            Verticals.loadDefault().then(function() {
                Profiles.load(Verticals.current);
            });
        }
    }
    
    
    // Congragations
    
    $scope.getCongregationCount = function() {
        $scope.refreshCongregationCountLoader = true;
        Congregations.getCongregationCount(Verticals.current).then(function() {
            $scope.generateGraph();
            $timeout(function() { $scope.refreshCongregationCountLoader = false; }, 900);
        });
    }
    

    $scope.generateGraph = function() {
        
        $scope.congregationsGraph = Congregations.currentCount;

        var index = $scope.congregationsGraph.indexOf($scope.congregationsGraph[0]);
        $scope.congregationsGraph.splice(index, 1);
        
        var highestAmountOfProfiles = 0;
        var secondHighestAmountOfProfiles = 0;
        var thirdHighestAmountOfProfiles = 0;
        _.each($scope.congregationsGraph, function(item) {
            if(item.count > highestAmountOfProfiles)
                highestAmountOfProfiles = item.count;
            else if(item.count > secondHighestAmountOfProfiles)
                secondHighestAmountOfProfiles = item.count;
            else if(item.count > thirdHighestAmountOfProfiles)
                thirdHighestAmountOfProfiles = item.count;
        });
        secondHighestAmountOfProfiles = secondHighestAmountOfProfiles * 1.1;
        _.each($scope.congregationsGraph, function(item) {
            item.width = (item.count / secondHighestAmountOfProfiles) * 100;
        });
    }
    
    $scope.getCongregation = function(bar) {
        Congregations.getCongregation(Verticals.current, bar.cutoff);
    }
    
    $scope.populateCongregation = function() {
        if($scope.refreshPopulate) {
            alert('You can only populate one power middle segment at a time.');
        }
        else {
            $scope.refreshPopulate = Congregations.currentCutoff;
            Congregations.populateCongregation(Verticals.current, Congregations.currentCutoff);
            Congregations.checkPopulationStatus(Verticals.current, Congregations.currentCutoff).then(function() {
                $scope.refreshPopulate = false;
                $scope.getCongregation({cutoff: Congregations.currentCutoff});
            });
        }
    }
    
    $scope.closeCongregationTable = function() {
        Congregations.current = false;
    }
    
    Verticals.load().then(function() {
        Profiles.load(Verticals.current).then(function() {
            _.each(Profiles.all, function(item) {
                $scope.getUpdatedFollowersState(item);
            });
            _calculateFollowersSumFromProfiles();
        });
    });
    
});