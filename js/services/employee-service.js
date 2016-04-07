(function (undefined) {
// employee dataservice
    angular.module('app').factory('mockService', ['$http', function($http) {
        var serviceUrl = 'https://demo2358851.mockable.io/employees';

        return {
            getEmployees: getEmployees
        };

        function getEmployees() {
            return $http.get(serviceUrl)
                .then(getEmployeesComplete)
                .catch(getEmployeesFailed);

            function getEmployeesComplete(response) {
                return response.data;
            }

            function getEmployeesFailed(error) {
                logger.error('XHR Failed for getEmployees.' + error.data);
            }
        }
    }]);
    // end mock service
})();