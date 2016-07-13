angular.module("leadric").controller("powerController", function($scope, $interval, Restangular) {

	$scope.powerConsumption = {
		effect: 345,
		today: 1.4,
		month: 14.2,
		money: 3424
	};

	$scope.timeline = null;

	$scope.refreshAllActivities = function() {
		$scope.allActivitiesRefreshing = true;

		var effect = Restangular.one('power/effect');
		effect.getList().then(function(response) {
			$scope.powerConsumption.effect = response[0].P;
		});

		var today = Restangular.one('power/today');
		today.getList().then(function(response) {
			$scope.powerConsumption.today = response[0].today / 1000;
		});

		var month = Restangular.one('power/month');
		month.getList().then(function(response) {
			$scope.powerConsumption.month = response[0].month / 1000;
			$scope.powerConsumption.money = response[0].month * 0.0012;
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
				var effect = Restangular.one('power/effect');
				effect.getList().then(function(response) {
					$scope.powerConsumption.effect = response[0].P;
				});
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

	function populateChart(period) {
		var chartData = Restangular.one('power/timeline/' + period);
		chartData.getList().then(function(response) {
		$scope.labels = [];
		$scope.data = [[]];
		$scope.series = ['Förbrukning (kWh)'];

		$scope.labels = response.map(function(obj){
			return obj.slot;
		});

		$scope.data[0] = response.map(function(obj){
			return obj.energy;
		});	

	});
	} 

	$scope.getLast60MinutesTimeline();
	
});
