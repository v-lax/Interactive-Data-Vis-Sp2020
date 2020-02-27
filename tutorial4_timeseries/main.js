/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.8,
  height = window.innerHeight * 0.8,
  margin = { top: 20, bottom: 50, left: 60, right: 90 },
  radius = 2;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let yAxis;

/* APPLICATION STATE */
let state = {
  data: [],
  selected_country: 'Afghanistan', // + Selected Country. 
};

/* LOAD DATA */
//Before we load in our data, we have to make sure that it is formatted correctly. 
//The CSV that I downloaded had columns that were years and rows that were countries.
//I did some cleaning in python to convert the columns to row values, but I am curious 
//to know if it is possible to use the csv as is (where columns are years and rows are conuntries)?
d3.csv("./child_mortality.csv", d=>({
  year: new Date(d.variable,0,1),
  Country: d.country,
  mortality: +d.value,
})).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES
    xScale = d3.scaleTime()
               .domain(d3.extent(state.data,d=>d.year))
               .range([margin.left,width-margin.right]);
    yScale = d3.scaleLinear()
               .domain([0,d3.max(state.data,d=>d.mortality)])
               .range([height-margin.bottom,margin.top]) 
  // + AXES
  const xAxis = d3.axisBottom(xScale);
  //We don't make this const because this needs to change when we select a different country
  yAxis=d3.axisLeft(yScale);

  // + UI ELEMENT SETUP
  const selectElement = d3.select("#dropdown").on("change", function() {
    //`this` === the selectElement
    //'this.value' holds the dropdown value a user just selected
    state.selected_country = this.value; // + UPDATE STATE WITH YOUR SELECTED VALUE
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
    });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(Array.from(new Set(state.data.map(d=>d.Country)))) // + ADD DATA VALUES FOR DROPDOWN
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // + CREATE SVG ELEMENT
  svg=d3.select("#d3-container")
        .append("svg")
        .attr("width",width)
        .attr("height",height);
  
  //Adding the x-axis
  svg.append('g')
     .attr('class','x-axis')
     .attr('transform',`translate(0,${height-margin.bottom})`)
     .call(xAxis)
     .append('text')
     .attr('class','axis-label')
     .attr('x','50%')
     .attr('dy','3em')
     .text('Year');
  
  //adding the y-axis
  svg.append('g')
     .attr('class','y-axis')
     .attr('transform',`translate(${margin.left},0)`)
     .call(yAxis)
     .append('text')
     .attr('class','axis-label')
     .attr('y','50%')
     .attr('dx','-3em')
     .attr('writing-mode','vertical-rl')
     .text('Child Deaths per 1000 Children')
  
  div = d3.select("body").append("div")	
     .attr("class", "tooltip")				
     .style("opacity", 0)

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE
  let filteredData;
  if(state.selected_country!==null){
    filteredData = state.data.filter(d=>d.Country === state.selected_country);
  }

  // + Updating my y scale
  yScale.domain([0,d3.max(filteredData,d=>d.mortality)])
  // + UPDATE AXIS/AXES, You need to update your y-axis
  d3.select('g.y-axis')
    .transition()
    .duration(1000)
    .call(yAxis.scale(yScale))
  // + DRAW CIRCLES
  const dot = svg
       .selectAll(".dot")
       .data(filteredData, d => d.year)
//Now I saw that in the demo code that you added in a seperate call function for the enter/update
//selections outside of join and that you added the call function for the exit selections inside the
// join function. Can we use the call function that we set up outside of the 
//join function for the exit selection as well or does that have to be inside of our join function? If that 
// is the case then why is that? Would't the join function return either the enter/update/exit selections? 
       .join(
       enter => enter
                .append('circle')
                .attr('class','dot')
                .attr('r',radius)
                .attr('cy',height-margin.bottom)
                .attr('cx',d=>xScale(d.year))
                .on('click', function(d, i) {
                  console.log("clicking on", this);
                  // transition the clicked element
                  // to have a radius of 20
                  d3.select(this)
                    .transition()
                    .attr('r',15);
                })
                .on("mouseover",(d,i)=>{
                  div.transition()
                     .duration(250)
                     .style("opacity",.9);
                  div.html(`Mortality:${d.mortality}`+ "</br>" + `Year:${d.year.getFullYear()}`)
                     .style("left", (d3.event.pageX) + "px")		
                     .style("top", (d3.event.pageY - 28) + "px")
                    // This was the code i wanted to use to change the fill of my circle as we hovered
                    // over each circle element, and I would similar code in my "mouseout" function. But everytime I kept running it, it gave me the following error: "this.getattribute
                    // is not a function". I think beacuse the 'this' keyword was referring to the whole window and not the reterned element.
                    // How would I change it to get "this" to return my selected circle element? 
                    //d3.select(this).attr('fill','red')
                })
                .on("mouseout",d=>{
                  div.transition()
                      .duration(250)
                      .style("opacity", 0);
                    })
                .call(
                  enter=>enter
                  .transition()
                  .duration(1000)
                  .attr('cy',d=>yScale(d.mortality))), // + HANDLE ENTER SELECTION
       update => update
       .call(
        update=>update
        .transition()
        .duration(1000)
        .attr('cy',d=>yScale(d.mortality))), // + HANDLE UPDATE SELECTION
       exit => exit.call(exit =>exit 
        .transition()
        .delay(d=>d.year)
        .duration(500)
        .attr('cy',height-margin.bottom)
        .remove()
         // + HANDLE EXIT SELECTION
     ));
  const AreaFunction = d3.area()
                       .x(d=>xScale(d.year))
                       .y0(function(){ return yScale.range()[0];})
                       .y1(d=>yScale(d.mortality));
  // + DRAW LINE AND AREA

  const area = svg
                .selectAll('path.trend')
                .data([filteredData])
                .join(
                 enter => enter
                          .append('path')
                          .attr('class','trend')
                          .attr('opacity',0),
                  update=>update,
                  exit=>exit.remove()
                )
                .call(selection=>
                  selection
                    .transition()
                    .duration(1000)
                    .attr('opacity',.3)
                    .attr("d",d=>AreaFunction(d))
                    );
}
