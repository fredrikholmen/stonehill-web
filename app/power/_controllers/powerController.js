angular.module("leadric").controller("powerController", function($scope, Restangular) {

	$scope.powerConsumption = {
		effect: 345,
		today: 1.4,
		month: 14.2,
		money: 3424
	};

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

	var chartData = Restangular.one('power/timeline/today');
		chartData.getList().then(function(response) {
		$scope.labels = [];
		$scope.data = [[]];
		$scope.series = ['Förbrukning (Wh)'];

		$scope.labels = response.map(function(obj){
			return obj.slot;
		});

		$scope.data[0] = response.map(function(obj){
			return obj.energy;
		});		

		console.log($scope.labels);

	});
});
