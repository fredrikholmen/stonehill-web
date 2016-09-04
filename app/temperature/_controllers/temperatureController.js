angular.module("leadric").controller("temperatureController", function($scope, $interval, Restangular) {

	$scope.temperature = {
		Outdoor: "N/A",	
		Basement: "N/A"
	};

	$scope.timeline = null;

	$scope.refreshAllActivities = function() {
		$scope.allActivitiesRefreshing = true;

		var effect = Restangular.one('temperature/current');
		effect.getList().then(function(response) {
			$scope.temperature['Outdoor'] = response[0];
			$scope.temperature['Basement'] = response[1];
		});

	}

	$scope.refreshAllActivities();


	var stop;
	$scope.refresh = function() {
		console.log("Start refresh chart");
		if (angular.isDefined(stop)) return;

		stop = $interval(function() {
			if ($scope.timeline == 'minute') {
				console.log("Update chart");
				populateChart('minute');
				$scope.refreshAllActivities();
			} else {
				console.log("STOPPING Update chart");
				$scope.stopRefresh();
			}
		}, 60000);
	};

	$scope.stopRefresh = function() {
		if (angular.isDefined(stop)) {
			$interval.cancel(stop);
			stop = undefined;
		}
	};

	$scope.$on('$destroy', function() {
		$scope.stopRefresh();
	})


	$scope.getLast60MinutesTimeline = function() {
		$scope.timeline = 'minute';
		populateChart('minute');
		$scope.refresh();

	}

	$scope.getTodayTimeline = function() {
		$scope.timeline = "today";
		populateChart('today');

	}

	$scope.getLast7DaysTimeline = function() {
		$scope.timeline = "7days";
		populateChart('7days');

	}

	$scope.getLast30DaysTimeline = function() {
		$scope.timeline = "30days";
		populateChart('30days');

	}

	$scope.getLast90DaysTimeline = function() {
		$scope.timeline = "90days";
		populateChart('90days');

	}

	function populateChart(period) {
		var chartData = Restangular.one('temperature/timeline/' + period);
		chartData.getList().then(function(response) {
		$scope.labels = [];
		$scope.data = [[]];
		$scope.series = ['Outdoor (°C)', 'Outdoor Min (°C)','Basement Avg. (°C)'];

		$scope.labels = response.map(function(obj){
			return obj.slot;
		});

		$scope.data[0] = response.map(function(obj){
			return obj.Outdoor_max;
		});	
		
		$scope.data[1] = response.map(function(obj){
			return obj.Outdoor_min;
		});	

		$scope.data[2] = response.map(function(obj){
			return obj.Basement_avg;
		});	

		//console.log($scope.labels);
		//console.log($scope.data);

	});
	} 

	$scope.getTodayTimeline();
	
});
