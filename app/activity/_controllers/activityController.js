angular.module("leadric").controller("activityController", function($scope, Profiles, Keywords, RestFullResponse) {

	$scope.activities = {
		profiles: 0,
		updatingProfiles: 0,
		keywords: 0,
		kwLast1Day: 0,
		kwLast7Days: 0
	};

	$scope.sos = [{domain: "keybroker.se", sos: 0.34}];

	$scope.refreshAllActivities = function() {
		$scope.allActivitiesRefreshing = true;

		var countProfiles = RestFullResponse.one('profiles/');
		countProfiles.head().then(function(response) {
			$scope.activities.profiles = response.headers("x-total-count");
			$scope.activities.updatingProfiles = response.headers("x-updating-count");
			$scope.allActivitiesRefreshing = false;
		});	

		var keyword = RestFullResponse.one('keyword/');
		keyword.head().then(function(response) {
			$scope.activities.keywords = response.headers("x-total-count");

			var updates = JSON.parse(response.headers("x-updating-count"));
			$scope.activities.kwLast1Day = updates[1][0].count;
			$scope.activities.kwLast7Days = updates[2][0].count;
			
		});	

	}

	$scope.refreshAllActivities();

	
	

});
