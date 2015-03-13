SalesData = function (filePath) {
  this.filePath = filePath;
};

SalesData.prototype.getData = function () {
  var req =new XMLHttpRequest;

  function reqListener (event) {
    this.data = JSON.parse(event.currentTarget.responseText);
    this.drawGraph(this.data);
  };

  req.onload = reqListener.bind(this);
  req.open("get", this.filePath, true);
  req.send();
};

SalesData.prototype.drawGraph = function (data) {

  var margin = {top: 40, right: 40, bottom: 40, left:80},
    width = 900,
    height = 450;

  var svg = d3.select("svg")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  var rects = svg.selectAll('rect')
    .data(data);

  var maxCount = d3.max(data, function(d, i) {
    return d.count;
  });

  var x = d3.time.scale()
    .domain([
      new Date(Date.parse(data[0].label)),
      new Date(Date.parse(data[data.length-1].label))
    ])
    .rangeRound([0, width]);

  var y = d3.scale.linear()
    .domain([0, maxCount])
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.months, 0)
    .tickFormat(d3.time.format("%b %y"))
    .tickSize(10)
    .tickPadding(15);

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickSize(10)
    .tickPadding(15);

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(" + margin.left + "," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + margin.left + ",10)")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("count");

  var newRects = rects.enter();

  newRects.append('rect')
  .attr('x', function(d) {
    return margin.left + x(new Date(d.label));
  })
  .attr('y', function(d) {
    return y(d.count);
  })
  .attr('height', function(d) {
    return height - y(d.count);
  })
  .attr('width', 10)
    .text(function(d) {
      return d.count
    });
};

salesData = new SalesData("http://phoebehong.com/sales-graph/numbers.json");
salesData.getData();
