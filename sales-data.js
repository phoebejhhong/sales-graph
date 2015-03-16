var SalesData = function (filePath) {
  this.filePath = filePath;
};

SalesData.prototype.getData = function () {
  var req =new XMLHttpRequest;

  function reqListener (event) {
    this.data = JSON.parse(event.currentTarget.responseText);
    this.drawGraph(this.data);
    this.createTable(this.data);
  };

  req.onload = reqListener.bind(this);
  req.open("get", this.filePath, true);
  req.send();
};

SalesData.prototype.changeData = function (condition) {
  switch(condition) {
    case "all":
      this.currentData = this.data;
      break;
    case "last-one-year":
      this.currentData = this.data.slice(12);
      break;
    case "first-one-year":
      this.currentData = this.data.slice(0,11);
      break;
  };
  d3.select("svg").selectAll("*").remove();
  d3.select("table").selectAll("*").remove();
  this.drawGraph(this.currentData);
  this.createTable(this.currentData);
};

SalesData.prototype.drawGraph = function (data) {

  var margin = {top: 100, right: 40, bottom: 100, left:100},
    width = 900,
    height = 450,
    barPadding=5;

  // get max sales value
  var maxSales = d3.max(data, function(d, i) {
    return d.sales;
  });

  // set x and y scale
  var x = d3.time.scale()
    .domain([
      new Date(Date.parse(data[0].label)),
      new Date(Date.parse(data[data.length-1].label))
    ])
    .rangeRound([0, width]);

  var y = d3.scale.linear()
    .domain([0, maxSales])
    .range([height, 0]);

  // create svg
  var svg = d3.select("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

  var rects = svg.selectAll("rect")
  .data(data);

  // create x axis
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.months, 1)
    .tickFormat(d3.time.format("%b"))
    .tickSize(0)
    .tickPadding(15);

  // additional axis for year
  var yearAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.years, 0)
    .tickFormat(d3.time.format("%Y"))
    .tickSize(0)
    .tickPadding(0);

  // additional axis for tick marks without labels
  var yearTickAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.years, 1)
    .tickFormat("")
    .tickSize(65)
    .tickPadding(0);

  // create y axis
  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickSize(0)
    .tickPadding(15);

  // append axes
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(" + (margin.left + 15) + "," + (height + margin.top) + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "year-axis")
    .attr("transform", "translate(" + (margin.left + 25) + "," + (height + margin.top + 50) + ")")
    .call(yearAxis);

    svg.append("g")
    .attr("class", "year-tick-axis")
    .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
    .call(yearTickAxis);

  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .text("$");

  // create and append groups for rects
  var newRects = rects.enter()
    .append("g")
    .attr("class", "bar-group");

  // bars for fees on the top
  newRects.append("rect")
    .attr("class", "fee-bar")
    .attr("x", function(d) {
      return margin.left + x(new Date(d.label));
    })
    .attr("y", function(d) {
      return y(d.sales) + margin.top;
    })
    .attr("height", function(d) {
      return height - y(d.fees);
    })
    .attr("width", width / data.length - barPadding)

  var showTooltip = function () {
    var rect = d3.select(this).selectAll("rect"),
    // get the values of this bar
      x = Number(rect.attr("x")) - 60,
      y = Number(rect.attr("y")) - 100,
      values = rect.data()[0];

    d3.select(".tooltip")
    .style("display", "block")

    d3.select(".tooltip").select("span")
    .style("left", x + "px")
    .style("top", y + "px")
    .html(values.count + " donuts<br />fees: " + values.fees + "</span><br /> sales: " + values.sales);
  };

  var hideTooltip = function () {
    d3.select(".tooltip")
    .attr("style", "display: none")
  };

  // bars for sales minus fees on the bottom
  newRects.append("rect")
    .attr("class", "bar")
    .attr("x", function(d) {
      return margin.left + x(new Date(d.label));
    })
    .attr("y", function(d) {
      return y(d.sales - d.fees) + margin.top;
    })
    .attr("height", function(d) {
      return height - y(d.sales - d.fees);
    })
    .attr("width", width / data.length - barPadding)

  newRects.on("mouseover", showTooltip)
    .on("mouseout", hideTooltip);

};

SalesData.prototype.createTable = function (data) {
  var table = d3.select("table"),
    thead = table.append("thead"),
    tbody = table.append("tbody"),
    columns = Object.keys(data[0]);

  // append the header
  thead.append("tr")
    .selectAll("th")
    .data(columns)
    .enter()
    .append("th")
    .text(function(columns) {
      return columns
    });

  // create rows
  var rows = tbody.selectAll("tr")
    .data(data)
    .enter()
    .append("tr");

  // create cells
  var cells = rows.selectAll("td")
  .data(function (row) {
    return columns.map(function (column) {
      return {column: column, value: row[column]};
    });
  })
  .enter()
  .append("td")
  .text(function(d) {return d.value});
};


salesData = new SalesData("http://phoebehong.com/sales-graph/numbers.json");
salesData.getData();
