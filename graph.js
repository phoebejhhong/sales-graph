Graph = function (filePath) {
  this.filePath = filePath;
};

Graph.prototype.getData = function () {
  var req =new XMLHttpRequest;

  function reqListener (event) {
    this.DATA = event.currentTarget.responseText;
    console.log(this.DATA);
  };

  req.onload = reqListener.bind(this);
  req.open("get", this.filePath, true);
  req.send();
};

g = new Graph("numbers.json");
g.getData();
