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
})


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