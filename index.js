'use strict';

(function() {

  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope
  let colors = {
    "Bug": "#4E79A7",
    "Dark": "#A0CBE8",
    "Electric": "#F28E2B",
    "Fairy": "#FFBE&D",
    "Fighting": "#59A14F",
    "Fire": "#8CD17D",
    "Ghost": "#B6992D",
    "Grass": "#499894",
    "Ground": "#86BCB6",
    "Ice": "#86BCB6",
    "Normal": "#E15759",
    "Poison": "#FF9D9A",
    "Psychic": "#79706E",
    "Steel": "#BAB0AC",
    "Water": "#D37295",
    "Dragon": "#b051ce",
    "Rock": "#54ff9f"
}

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 510)

    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("pokemon.csv")
      .then((data) => makeScatterPlot(data));
  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable

    // get arrays of fertility rate data and life Expectancy data
    let defense_data = data.map((row) => parseFloat(row["Sp. Def"])); // x axis
    let total_data = data.map((row) => parseFloat(row["Total"])); // y axis 

    // find data limits
    let axesLimits = findMinMax(defense_data, total_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();

  
  }

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 100)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text("Pokemon: Special Defense vs Total Stats");

    svgContainer.append('text')
      .attr('x', 130)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Special Defense');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Total');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    
    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    //make tooltip for country
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);



    // append data to SVG and plot as points
    var dot = svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 3)
        .attr('fill', function(d) {return colors[d["Type 1"]]})
        
        // add tooltip functionality to points
        .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html("Name: " + d.Name + "<br/>" + "First Type: " + d["Type 1"] + "<br/>" + "Second Type: " + d["Type 2"])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });

        // create the label for the legend
        svgContainer.append('text')
            .attr('x', 543)
            .attr('y', 70)
            .text("Legend")
            .style('font-size', '13pt')

        // get the svg area for the legend
        var Svg = svgContainer.append('g')
        .attr('transform', 'translate(450, 0)')

        // create a list of the keys and values of the colors
        var keys = Object.keys(colors)
        var values = Object.values(colors)


        // color scale for the legend
        var color = d3.scaleOrdinal()
        .domain(keys)
        .range(values);

        // Add one dot in the legend for each name
        Svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
            .attr("cx", 100)
            .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function(d){ return color(d)})

        // Add one label in the legend for each name
        Svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
            .attr("x", 120)
            .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return color(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")





        // Label for Generation filter
        d3.select("#filter")
                .append("b")
                .text(" Generation: ")

        let genMap = d3.map(data, function(d){return d.Generation})
        genMap.set("All")

        //make drop down for generation
        var dropDownGen = d3.select("#filter").append("select").attr("id", "gen")
          .attr("name", "Generation");

        var optionsGen = dropDownGen.selectAll("option")
            .data(genMap.keys())
          .enter()
            .append("option");



        optionsGen.text(function (d) { return d; })
            .attr("value", function (d) { return d; });


            dropDownGen.on("change", function() {
                filterCircles();
             });


            let legendMap = d3.map(data, function(d){return d.Legendary})
            legendMap.set("All")

            d3.select("#filter")
                .append("b")
                .text(" Legendary: ")

            //make drop down for legendary
            var dropDownLegend = d3.select("#filter").append("select").attr("id", "legend")
            .attr("name", "Legendary");

            var optionsLegend = dropDownLegend.selectAll("option")
                .data(legendMap.keys())
                .enter()
                .append("option");



            optionsLegend.text(function (d) { return d; })
                .attr("value", function (d) { return d; });


                dropDownLegend.on("change", function() {
                    filterCircles();
                });


                function filterCircles() {
                    dot
                        .attr("display", "none")


                    let legendValue = d3.select("#legend").node().value
                    let genValue = d3.select("#gen").node().value

                    if (legendValue == "All" && genValue == "All") {
                        dot
                            .attr("display", "inline")
                    }

                    if (legendValue == "All") {
                        dot 
                            .filter(function(d) {return genValue == d.Generation})
                            .attr("display", "inline")
                    }

                    if (genValue == "All") {
                        dot 
                            .filter(function(d) {return legendValue == d.Legendary})
                            .attr("display", "inline")
                    }

                    dot
                        .filter(function(d) {return legendValue == d.Legendary && genValue == d.Generation})
                        .attr("display", "inline")
                }
            
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
      .range([50, 450]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
