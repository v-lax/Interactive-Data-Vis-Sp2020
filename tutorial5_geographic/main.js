/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth,
  height = window.innerHeight,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

/** these variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.*/
let svg;

/**
 * APPLICATION STATE
 * */
let state = {
  geojson: null,
  carbon_values: null,
  hover:{
    city: null,
    longitude: null,
    latitude: null,
    total_emissions: null,
  }
};

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
  d3.json("../data/usState.json"),
  d3.csv("../data/carbon_emissions.csv", d3.autoType),
]).then(([geojson, CarbonData]) => {
  // + SET STATE WITH DATA
  state.geojson = geojson;
  state.carbon_values = CarbonData;
  console.log("state: ", state);
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // + SET UP PROJECTION
  projection = d3.geoAlbersUsa().fitSize([width,height],state.geojson);
  // + SET UP GEOPATH
  path = d3.geoPath().projection(projection);

  // Setting up a scale for our circle radiuses
  let rScale = d3.scaleLinear()
                 .domain([d3.min(state.carbon_values,d=>d['Total emissions (CDP) [tCO2-eq]']),d3.max(state.carbon_values,d=>d['Total emissions (CDP) [tCO2-eq]'])])
                 .range([10,30])

  // + DRAW BASE MAP PATH
  // so state.geojson.features gives us an array of each state. In each arrary there are types, geometry etc.
  // How does path know to access the coordinates in our geojson object when we only specify it to use "state.geojson.features"?
  // Shouldn't we specify the exactly that we want path to use the coordinates, so "state.geojson.features.geometry.coordinates"? 
  svg
    .selectAll('.state')
    .data(state.geojson.features)
    .join('path')
    .attr('d',path)
    .attr('class','state');

  // Drawing Circles
let circle = svg
  .selectAll('circle')
  .data(state.carbon_values)
  .join('circle')
  .attr('r', 0)
  .attr('cx',d=>projection([d['Longitude (others) [degrees]'],d['Latitude (others) [degrees]']])[0])
  .attr('cy',d=>projection([d['Longitude (others) [degrees]'],d['Latitude (others) [degrees]']])[1])
  .attr('fill','red')
  .attr('opacity',.5)
  .style('stroke','black')
  .on('mouseover',d=>{
    state.hover['city']=d['City name'];
    state.hover['longitude']=d['Longitude (others) [degrees]'];
    state.hover['latitude']=d['Latitude (others) [degrees]'];
    state.hover['total_emissions']=d['Total emissions (CDP) [tCO2-eq]'];
    draw();
  })
  .call(selection=>selection
      .transition()
      .delay((d,i)=>i*30)
      .duration(3000)
      .attr('r',d=>rScale(d['Total emissions (CDP) [tCO2-eq]'])));
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
 hoverData = Object.entries(state.hover);
 
 d3.select('#tooltip')
   .selectAll('div.row')
   .data(hoverData)
   .join('div')
   .attr('class','row')
   .html(d=>{
    
    if(d[1]!==null){
      return `${d[0]}: ${d[1]}`;
   }else{
     return null;
   }
  });

}
