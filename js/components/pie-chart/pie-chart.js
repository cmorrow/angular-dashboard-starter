(function (undefined) {

    angular.module('charts', [])
        .directive('pieChart', pieChartDirective);

    function pieChartDirective() {
        var directive = {
            restrict: 'EA',
            scope: {
                chartData: '='
            },
            link: chartLink
        };
        return directive;

        function chartLink(scope, el, attrs) {

            var colorScale = function(n){
                var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
                return colors[n % colors.length];
            };

            var isFirstRender = true;

            var donutWidth = 110,
                containerWidth = 0,
                containerHeight = 0;

            var legendRectSize = 20,
                legendSpacing = 4,
                legendTextIndent = 27,
                legendXPos = 15,
                legendWidth = 120,
                minHeight = 250,
                maxHeight = 330,
                chartMargin = 10,
                chartBounds = 0;

            // chart vars for reuse with updateCHart and drawChart
            var svg, pie, donut, arcs, path, labels, labelRadius, sliceLabel, arcOuterLabels;


            // on window resize, re-render d3 canvas
            window.addEventListener('resize', function(){  
                return scope.$apply();
            });

            // listen for data loaded
            scope.$watch('chartData', function (chartData) {
                if (chartData) {
                    scope.chartData = chartData;
                    if (isFirstRender) {
                        drawChart();
                        // start watching resize
                        scope.$watch(function() {
                            return el[0].offsetWidth;
                        }, function() {
                            return drawChart();
                        });
                    } else {
                        render();
                    }
                }
            });

            function render() {
                var data = scope.chartData;

                // redraw chart
                arcs = arcs.data(pie(data)); // compute the new angles
                arcs.transition().duration(750).attrTween("d", arcTween); // redraw the arcs

                // update labels
                var sliceLabel = labels.selectAll("text").data(pie(data));
                var arcOuterLabel = arcOuterLabels.selectAll("text").data(pie(data));

                sliceLabel
                .attr("transform", function (d) {
                    var c = donut.centroid(d);
                    return 'translate(' + Number(c[0]) + ', ' + Number(c[1]) + ')';
                })
                .text(function (d, i) {
                    return Math.round(d.value);
                });

                arcOuterLabel
                .attr("transform", function (d) {
                    return setOuterLabel(d);
                })
                .attr("text-anchor", function (d) {
                    // are we past the center?
                    return setTextAnchor(d);
                });

            }
            
            function drawChart() {
                var container = el[0];
                isFirstRender = false;
                var data = scope.chartData;
                var width = container.offsetWidth;
                chartBounds = (width <= maxHeight) ? width : maxHeight;
                var height = chartBounds;
                radius = calcRadius(chartBounds) - chartMargin;
                labelRadius = radius + 5;

                var leftMargin = Number((width / 2) - (chartBounds / 2));
                var topMargin = Number((height / 2) - (chartBounds / 2));
                topMargin = (topMargin < 0) ? 0 : topMargin;  

                pie = d3.layout.pie()
                    .value(function (d) {
                        return d.value;
                    })
                    .sort(null);

                donut = d3.svg.arc()
                    .innerRadius(0) //radius * .4
                    .outerRadius(radius);

                var parentEl = d3.select(container);

                parentEl.select("svg").remove();

                svg = d3.select(container).append("svg:svg")
                    .attr('class', 'channel-svg')
                    .attr("width", width)
                    .attr("height", chartBounds)
                    .append("g")
                    .attr("transform", "translate(" + ((width / 2)) + "," + Number(height / 2) + ")");

                arcs = svg.selectAll("g")
                    .data(pie(data))
                    .attr('y', topMargin);

                arcs.enter().append('svg:path')
                    .attr("width", radius)
                    .attr("height", radius)
                    .attr('class', 'arc')
                    .attr("fill", function (d, i) {
                        return colorScale(i);
                    })
                    .attr("d", donut)
                    .each(function (d) {
                        this._current = d;
                    }); // store the initial angles;

                // inner labels: values
                labels = svg.append("svg:g")
                    .attr("class", "labels");

                sliceLabel = labels.selectAll("text")
                    .data(pie(data));

                sliceLabel.enter().append("svg:text")
                    .attr("class", "arc-label")
                    .attr("transform", function (d) {
                        var c = donut.centroid(d);
                        return 'translate(' + Number(c[0]) + ', ' + Number(c[1]) + ')';
                    })
                    .attr("text-anchor", "middle")
                    .attr('fill', '#fff')
                    .text(function (d, i) {
                        return Math.round(data[i].value) + '%';
                    });

                // outer labels
                arcOuterLabels = svg.append('svg:g');

                var arcOuterLabel = arcOuterLabels.selectAll("text").data(pie(data));

                arcOuterLabel.enter().append('svg:text')
                    .attr("transform", function (d) {
                        return setOuterLabel(d);
                    })
                    .attr("text-anchor", function (d) {
                        return setTextAnchor(d);
                    })
                    .attr('font-size', '14px')
                    .attr('font-family', 'Arial')
                    .text(function (d, i) {
                        return data[i].label;
                    });;

            }

            // calculate old arc / new arc tween
            function arcTween(a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function (t) {
                    return donut(i(t));
                };
            }

            // get radius based on container width/height
            function calcRadius(chartBounds) {
                return (chartBounds / 2) - (chartMargin * 2);
            }

            function setTextAnchor(d) {
                return (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start";
            }

            function setOuterLabel(d) {
                var c = donut.centroid(d),
                    x = c[0],
                    y = c[1],
                // pythagorean theorem for hypotenuse
                    h = Math.sqrt(x * x + y * y);
                var lblRadius = labelRadius;
                if (y > radius / 2) { // if on bottom add spacing
                    lblRadius = labelRadius + 10;
                }
                return "translate(" + (x / h * lblRadius) + ',' + (y / h * lblRadius) + ")";
            }

        };

    };


})();
