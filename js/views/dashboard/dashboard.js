// controller; dashCtrl
angular.module('app').controller('dashCtrl', ['$scope', 'mockService', function($scope, mockService) {

    $scope.colSorted = 'name'; // set the default sort type
    $scope.sortReverse = false; // set the default sort order

    $scope.sortCol = function(col) {

        if ($scope.colSorted === col) {
            $scope.sortReverse = !$scope.sortReverse;
        } else {
            $scope.colSorted = col;
            $scope.sortReverse = false;
        }
    }

    $scope.isSorted = function(col) {
        return $scope.colSorted === col;
    }

    // get employees from service
    mockService.getEmployees().then(function(data) {
        // convert tenure to integers
        angular.forEach(data, function(employee) {
            employee.tenure = parseFloat(employee.tenure);
        });
        $scope.employees = data;

        // set chart data
        setPieChartData(data);
        setBarChartData(data);
    });

    function isMatch(val, index, arr){
        console.log(val);
        return val === arr[index].jobTitle;
    }

    function setPieChartData(data){
        // for(var i = 0; i < data.length; i++){
        //     if(data[i])

        //
        var titlesArr = [];
        var uniqueJobs = [];

        for(var i = 0; i < data.length; i++) {
            if (uniqueJobs.indexOf(data[i].jobTitle) == -1) {
                uniqueJobs.push(data[i].jobTitle);
            }
        }

        // create new array of jobTitles and counts
        for(var i = 0; i < uniqueJobs.length; i++) {
            // results length gives count of jobTitle
            var results = data.filter(function(obj){
                return obj.jobTitle === uniqueJobs[i];
            });
            titlesArr.push({
                label: uniqueJobs[i],
                value: results.length 
            });
        }
        console.table(titlesArr);

        // $scope.pieData = [
        //     {label: "Dev", value: 80},
        //     {label: "QA", value: 20}
        // ];

        $scope.pieData = titlesArr;
    }

    function setBarChartData(data){
        var transformedData = [], femCount=0, maleCount=0
        for(var i=0; i < data.length; i++){
            var obj = { 
                name: data[i].name, 
                value: data[i].gender
            };
            if(data[i].gender === 'Female'){
                femCount++;
            }else{
                maleCount++;
            }
            transformedData.push(obj);
        }

        // $scope.barChartConfig.series = transformedData;
        $scope.barChartConfig = {
            options: {
                chart: {
                    type: 'column'
                    
                },
                colors: ['#147dff', '#e851d3']
            },
            
            xAxis: {
                categories: ['Male', 'Female']
            },
            series: [{
                name: 'Gender',
                data: [maleCount, femCount],
                colorByPoint: true
            }],
            title: {
                text: ''
            },
            loading: false
        };
        // $scope.barChartConfig.series = [maleCount, femCount];
        // console.log($scope.barChartConfig.series);   
    }

}]);