angular.module("leadric").controller("powerController", function($scope, $interval, Restangular) {

	$scope.powerConsumption = {
		effect: "N/A",
		today: "N/A",
		month: "-",
		money: "-"
	};

	$scope.timeline = null;
	$scope.refreshingEffect = null;

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

	$scope.refreshEffect = function() {
		refreshingEffect = true;
		$scope.powerConsumption.effect = "Wait..."
		var effect = Restangular.one('power/effect');
		effect.getList().then(function(response) {
			$scope.powerConsumption.effect = Math.round(3600 / ((response[0].P - response[1].P) / 1000 ));
			refreshingEffect = null;
		});
	}

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

	$scope.refreshAllActivities = function() {
		$scope.allActivitiesRefreshing = true;

		$scope.refreshEffect();

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

	$scope.getLast60MinutesTimeline();
	
});
