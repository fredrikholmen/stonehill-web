angular.module('leadric',[
    'ngDialog',
    'ui.router',
    'restangular',
    'ngSanitize',
    'chart.js'
])

.config(function(RestangularProvider, $stateProvider, $urlRouterProvider) {
    if(document.domain === 'local.stonehill.com')
        RestangularProvider.setBaseUrl('http://localhost:5000');
    else
        RestangularProvider.setBaseUrl('http://192.168.1.3:5000');
        
    //RestangularProvider.setDefaultHttpFields({withCredentials:true});

    $urlRouterProvider.otherwise('/power');
    $stateProvider
    	.state('power', {
        url: '/power',
        templateUrl: '/app/power/power.view.html',
        controller: 'powerController'
      })
      .state('temperature', {
        url: '/temperature',
        templateUrl: '/app/temperature/_views/temperature.view.html',
        controller: 'temperatureController'
      })
})

.config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
      onAnimationComplete: function(){
      var pos = this.datasets[0].bars.length;
      console.log(this.datasets[0].bars[pos-1]);
      this.datasets[0].bars[pos-1].fillColor = "rgba(251, 192, 45, 0.2)";
      this.datasets[0].bars[pos-1].strokeColor = "rgba(251, 192, 45, 1)";
      this.datasets[0].bars[pos-1].highlightFill = "rgba(251, 192, 45, 1)";
      this.update()
    },
      responsive: true
    });
}])

.filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  }
});