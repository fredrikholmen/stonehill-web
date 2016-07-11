angular.module("leadric").factory('Congregations', function(Restangular, uiGridConstants, $q) {
	
	var factory = {};
	
	factory.all = [];
    factory.currentCount = false;
    factory.current = false;
    factory.currentCutoff = false;
    
    factory.getCongregationCount = function(vertical) {
        return Restangular.one('vertical', vertical.id).one('congregation_count').get().then(function(data) {
            factory.currentCount = data;
        });
    }
    
    factory.getCongregation = function(vertical, cutoff) {
        return Restangular.one('vertical', vertical.id).one('congregation').get({cutoff: cutoff}).then(function(data) {
            factory.gridOptions.data = data
            
            _.each(factory.gridOptions.data, function(item) {
                if(!item.tw_id_str)
                    item.name = "Profile is not populated..."
            });
            
            factory.current = data;
            factory.currentCutoff = cutoff;
        });
    }
    
    factory.populateCongregation = function(vertical, cutoff) {
        return Restangular.one('vertical', vertical.id).one('congregation').one('populate').get({cutoff: cutoff}).then(function() {
            factory.getCongregation(vertical, cutoff);
        });
    }

    
    factory.checkPopulationStatus = function(vertical, cutoff) {
        var deferred = $q.defer();
        var state = null;
        
        var pingServer = function() {
            Restangular.one('vertical', vertical.id).one('congregation').get({cutoff: cutoff}).then(function(data) {
                if(data[data.length - 1].tw_id_str) {
                    deferred.resolve(true);
                } else {
                    setTimeout(function() { pingServer() }, 5000 );
                }
            });
        }
        pingServer();
        
        return deferred.promise;
    }
    

	function formatAsDate(date) {
		return date.getFullYear() + '-' + (date.getMonth() > 8 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() > 8 ? (date.getDate() + 1) : '0' + (date.getDate() + 1))
	}
    
	var highlightFilteredHeader = function( row, rowRenderIndex, col, colRenderIndex ) {
		if( col.filters[0].term ){
			return 'header-filtered';
		} else {
			return '';
		}
	};
        
	factory.gridOptions = {
		showGridFooter: false,
		showColumnFooter: false,
		enableFiltering: true,
		enableSorting: true,
		enableGridMenu: true,
		enableSelectAll: true,
		exporterCsvColumnSeparator: ";",
		exporterCsvFilename: formatAsDate(new Date()) + '_' + 'selVert' + '_myFile.csv',
		exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
		columnDefs: [
		{name: 'Pic', field: 'tw_profile_image_url', width: '58', cellTemplate: 
		'<div class="ui-grid-cell-contents">' +
		'<img ng-src="{{row.entity.tw_profile_image_url}}" ></div>', enableFiltering: false},
		{name: 'followerId', field: 'followerId', width: '100', visible: false},
		{name: 'Name', field: 'name', width: '200', filters: [{
			condition: uiGridConstants.filter.CONTAINS,
			placeholder: "contains"
		}]},
		{name: 'Screen name', field: 'tw_screen_name', width: '200', 
            cellTemplate: '<div class="ui-grid-cell-contents"><a target="_new" href="https://twitter.com/{{row.entity.tw_screen_name}}">{{row.entity.tw_screen_name}}</a></div>',
            filters: [{
			condition: uiGridConstants.filter.CONTAINS,
			placeholder: "contains"
		}]},
		{name: 'Description', field: 'tw_description', width: '300', filters: [{
			condition: uiGridConstants.filter.CONTAINS,
			placeholder: "contains"
		}]},
		{name: 'Url', field: 'tw_url', width: '100', cellTemplate: '<div class="ui-grid-cell-contents"><a target="_new" href="{{row.entity.tw_url}}">URL</a></div>'	},
		{name: 'Location', field: 'tw_location', width: '100', filter: {
			condition: function(term, cellValue) {
				if (term.length < 3) return true;
				var tokens = term.split(",");
				if (tokens.some(function(v) { return cellValue.toLowerCase().indexOf(v.trim().toLowerCase()) >= 0; })) {
					return true;
				}
			},
			placeholder: 'is one of'
		}},
		{name: 'Time zone', field: 'tw_time_zone', width: '100'},
		{name: 'Profile location', field: 'tw_profile_location', width: '100'},
		{name: 'Followers', field: 'tw_followers_count', width: '100', filters: [
		{
			condition: uiGridConstants.filter.GREATER_THAN,
			placeholder: 'Greater than'
		},
		{
			condition: uiGridConstants.filter.LESS_THAN,
			placeholder: 'Less than'
		}
		], headerCellClass: highlightFilteredHeader,
		sort: {
			direction: uiGridConstants.DESC,
			priority: 1
		}},
		{name: 'Friends', field: 'tw_friends_count', width: '100',filters: [
		{
			condition: uiGridConstants.filter.GREATER_THAN,
			placeholder: 'Greater than'
		},
		{
			condition: uiGridConstants.filter.LESS_THAN,
			placeholder: 'Less than'
		}
		], headerCellClass: highlightFilteredHeader},
		{name: 'Statuses', field: 'tw_statuses_count', width: '100', filters: [
		{
			condition: uiGridConstants.filter.GREATER_THAN,
			placeholder: 'Greater than'
		},
		{
			condition: uiGridConstants.filter.LESS_THAN,
			placeholder: 'Less than'
		}
		], headerCellClass: highlightFilteredHeader},
		{name: 'Favourites', field: 'tw_favourites_count', width: '100', filters: [
		{
			condition: uiGridConstants.filter.GREATER_THAN,
			placeholder: 'Greater than'
		},
		{
			condition: uiGridConstants.filter.LESS_THAN,
			placeholder: 'Less than'
		}
		], headerCellClass: highlightFilteredHeader},
		{name: 'Id_str', field: 'tw_id_str', width: '100'},
		{name: 'email', field: 'email', width: '100'}
		]
	};
	
	return factory;
	
});