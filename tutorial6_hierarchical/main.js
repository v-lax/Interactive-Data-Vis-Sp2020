/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth,
  height = window.innerHeight,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;
let tooltip;

/**
 * APPLICATION STATE
 * */
let state = {
  data:null,
  hover:null,
};

/**
 * LOAD DATA
 * */
d3.json("../data/flare.json", d3.autotype).then(data => {
  state.data = data;
  console.log(state.data)
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  const container = d3.select("#d3-container").style("position", "relative");

  svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("position",'absolute');
  
  const color = d3.scaleOrdinal(d3.schemeDark2);;

  // + INITIALIZE TOOLTIP IN YOUR CONTAINER ELEMENT
  toolTip = container.append("div")
                     .attr("class","tooltip")
                     .attr("width",100)
                     .attr("height",100)
                     .style("position","absolute");
  // + CREATE YOUR ROOT HIERARCHY NODE
  const root = d3.hierarchy(state.data)
                 .sum(d=>d.value)
                 .sort((a,b)=>b.value-a.value);
  
  // + making packed circle layout generator
  const pack = d3
                .pack()
                .size([width,height])
                .padding(1);

  // + CALL YOUR LAYOUT FUNCTION ON YOUR ROOT DATA
  pack(root);
  console.log(root)
  // + CREATE YOUR GRAPHICAL ELEMENTS
  const leaf = svg
               .selectAll("g")
               .data(root.leaves())
               .join("g")
               .attr("transform",d=>`translate(${d.x},${d.y})`);
  
        leaf.append('circle')
            .attr('fill',d=>{
            const level1parent=d.ancestors().find(d=>d.depth===1);
            return color(level1parent.data.name)
          })
            .attr('opacity',.5)
            .attr('r',d=>d.r)
            .on('mouseover',d=>{
              state.hover={
                translate:[d.x,d.y],
                name:d.data.name,
                value:d.data.value,
                title:`${d.ancestors()
                          .reverse()
                          .map(d=>d.data.name)
                          .join("->")}`,
              };
              draw();
            });
  
  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  // + UPDATE TOOLTIP

  if (state.hover){
    toolTip
      .html(
        `
        <div>Name:${state.hover.name}</div>
        <div>Value:${state.hover.value}</div>
        <div>Ancestors:${state.hover.title}</div>
        `
      )
      .transition()
      .duration(500)
      .style("transform",`translate(${state.hover.translate[0]}px,${state.hover.translate[1]}px)`);
  }
}
