/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.8,
  height = window.innerHeight * 0.8,
  margin = { top: 20, bottom: 50, left: 60, right: 90 },
  radius = 5;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let div;
let xScale;
let yScale;

/* APPLICATION STATE - I am starting to realize that
javascript is a lot of objects, and all your really doing is just calling on 
multiple keys with in the object so you can access
its values and methods. */
let state = {
  data: [],
  selected_position: "All" // + YOUR FILTER SELECTION
};

/* LOAD DATA */
d3.csv("players.csv", d3.autoType).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in 
function init() {
  // + SCALES - In the demo code I saw that you used d3.extent
  //to recieve an array of the min and max value from your data.
  //Wouldnt that map your smallest value to the min value of the range?
  //I set my min value to 0 and used d3.max to get my max value.
  xScale=d3
    .scaleLinear()
    .domain([0,d3.max(state.data,d => d.MP)]) 
    .range([margin.left,width-margin.right]);
  
  yScale=d3
    .scaleLinear()
    .domain([0,d3.max(state.data,d=>d.PTS)])
    .range([height-margin.bottom,margin.top]);

  // + AXES
  const xaxis= d3.axisBottom(xScale);
  const yaxis=d3.axisLeft(yScale);

  // + UI ELEMENT SETUP - So i tried adding in the code for adding the options
  // to our dropdown before the "on" function but realized that this does 
  // not work. Am i correct to assume that it should be before because 
  // we are using change in the "on" function and its looks at what has changed in 
  // in the dropdown element and not the option element?

  const selectElement = d3.select("#dropdown").on("change", function() {
    // `this` === the selectElement
    console.log("The new selected position is",this.value);
    // 'this.value' holds the dropdown value a user just selected
    state.selected_position = this.value;
    //console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  }).selectAll("option")
  .data(["All", "SG", 
        "PF", "PG",
        "C",'SF',
        "SF/SG",
        "SF/PF",
        "C/PF"]) // + ADD UNIQUE VALUES
  .join("option")
  .attr("value", d => d)
  .text(d => d);

  // + CREATE SVG ELEMENT
  svg = d3
      .select("#d3-container")
      .append("svg")
        .attr("width",width)
        .attr("height",height)
      .append("g")
        .attr("transform",`translate(80,0)`);

  // + CALL AXES
  svg
    .append("g")
    .attr("class","axis")
    .attr("transform",`translate(${margin.left},0)`)
    .call(yaxis)
    .append("text")
    .attr("class","axis-label")
    .attr("y","50%")
    .attr("dx","-4em")
    .attr("writing-mode","vertical-rl")
    .text('Points Scored');
  
  svg
    .append("g")
    .attr("class","axis")
    .attr("transform",`translate(0,${height-margin.bottom})`)
    .call(xaxis)
    .append("text")
    .attr("class","axis-label")
    .attr("x","50%")
    .attr("dy","3em")
    .text("Minutes Played");

  //Defining a div for our tool tip
  div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);


  draw(); // calls the draw function
}

/* DRAW FUNCTION */
 // we call this everytime there is an update to the data/state. 
 // And this is the case because we call the draw function in "d3.on()" above?
function draw() {
  
  // + FILTER DATA BASED ON STATE
  let filteredData = state.data;

  //This filters our dataset and then restores the new
  //values in filtered Data. It happens when ever state.selected_position is not equal to "all"

  if(state.selected_position!=='All'){
    filteredData=state.data.filter(d=>d.Pos===state.selected_position);
  }

  const dot = svg
    .selectAll(".dot")
    .data(filteredData,d=>d.Player)
    //Can you tell me if I am correct in understanding how join works and if I am missing anything? 
    //So when we call on the .data() function. That always returns to us an object and in that object
    // we have an enter key, as well as a exit key. When we first call data and there are more data points
    // then elements then the enter key will have an empty array of enter nodes. And the Exit key is empty. There are data bound to
    //these enter nodes but not any elements. In order to add add elements we do .append(). If we remove a
    // data point from our data set, then there will be one element in the exit key. When we use join we 
    //give the function three parameter, enter calls all of the enter selections from our enter key, exit will
    //call the elements in the exit key, and we can add code to say what we want to do specifically to these elements.
    //I understand thats its not the best explanation but all we are doing is calling on the enter, exit keys from the 
    //object that data returns to us correct? 
    .join(
      enter => enter
                .append("circle")
                .attr("class","dot")
                .attr("stroke","yellow")
                .attr("Opacity",0.5)
                .attr("fill",d=>{
                  if(d.Pos==="SG") return "#e41a1c";
                  else if(d.Pos==="PF") return "#377eb8";
                  else if(d.Pos==="PG") return "#4daf4a";
                  else if(d.Pos==="C") return "#984ea3";
                  else if(d.Pos==="SF") return "#ff7f00";
                  else if(d.Pos==="SF-SG") return "#999999";
                  else if(d.Pos==="SF-PF") return "#f781bf";
                  else if(d.Pos==="C-PF") return "#a65628";
                })
                .attr("r",radius)
                .attr("cx",d=>xScale(d.MP))
                .attr("cy",margin.top)
                .on("mouseover",d=>{
                  div.transition()
                     .duration(250)
                     .style("opacity",.9);
                  div.html(d.Player + "</br>" + d.Pos + "</br>"+ d.Tm + "</br>" +`pts scored: ${d.PTS}`+"</br>"+`Minutes plyed:${d.MP}`)
                     .style("left", (d3.event.pageX) + "px")		
                     .style("top", (d3.event.pageY - 28) + "px");

                })
                .on("mouseout",d=>{
                  div.transition()
                     .duration(250)
                     .style("opacity", 0);
                })
                .call(enter=>
                  enter
                  .transition()
                  .delay((d,i)=>i*.5)
                  .duration(500)
                  .attr("cy",d=>yScale(d.PTS))
                ),
      update=>
        update.call(update=>
          update
            .transition()
            .duration(250)
            .attr("stroke","green")
            .transition()
            .duration(250)
            .attr("stroke","lightgrey")
      ),
      exit=>
        exit.call(exit=>
          exit
            .transition()
            .delay((d,i)=>i*.5)
            .duration(500)
            .attr("cy",height-margin.bottom)
            .remove())
    );

}
