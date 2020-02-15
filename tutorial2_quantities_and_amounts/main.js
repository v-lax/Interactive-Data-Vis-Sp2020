d3.csv('../data/squirrelActivities.csv',d3.autoType).then(data=>{

//Lets log our data to the console to see if our data was loaded correctly. 
console.log(data);

//Set our constants. We are going to use the const key words because these variables
//Will not change throughout our code and we will not have to reassign it to other values
const width = (window.innerWidth)*.7;
const height = (window.innerHeight)*.5;

//The inner padding constant allows us to add some space between our rectangles in the bar graph
//The margin object is used to add some space between the actual width of our browser and
//our SVG element.  
const innerpadding = .2;
const margin = {top:20,bottom:40,right:80,left:60};

//Lets create some scales. Because we are creating a horizontal bar graph here our scales
// will be flipped from the demo that was done in class. So we will have to use scale
//band for our y axis and then the linear scale for the xaxis. 
const yscale = d3.scaleBand()
    .domain(data.map(d => d.activity)) //data.map()takes an input of values and maps them to an array.
    .range([margin.top,height-margin.bottom])
    .paddingInner(innerpadding);
const xscale = d3.scaleLinear()
    .domain([0,d3.max(data,d => d.count)])
    .range([0,width-margin.right]);
const colorscale=d3.scaleLinear()
                   .domain([0,d3.max(data,d=>d.count)])
                   .range(["White","Orange"])

//Lets define both our xaxis and our yaxis  
const xaxis= d3.axisTop(xscale).ticks(data.length);
const yaxis= d3.axisLeft(yscale);

//We have all the constants that we need and our scales are ready to go. Lets create 
//our svg element and then append some rectangles to it. 
const svg = d3.select('#bar')
  .append('svg')
  .attr("width",width)
  .attr("height",height);

//lets append some rectangles to our svg. 
const rect = svg
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("y", d=>yscale(d.activity)+5)
    .attr("x", margin.left)
    .attr("height", yscale.bandwidth())
    .attr("width",d=>xscale(d.count))
    .attr("fill", d=>colorscale(d.count));

//Alright, so now we have our rectangles! Success. Lets give them some text 
const text= svg
    .selectAll("text")
    .data(data)
    .join('text')
    .attr('class','bar-labels')
    .attr("y", d => yscale(d.activity)+ (yscale.bandwidth() *.67))
    .attr("dy", ".35em")
    .attr("x", d=> xscale(d.count)+30)//I would love to know what kind of tricks there are to add the labels so they fit right next to the border of the rect. 
    .text(d => d.count);

//add our axis to our graph. 
svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(xaxis); 

svg
    .append("g")
    .attr("class", "axis")
    .attr('transform',`translate(${margin.left},0)`)
    .call(yaxis)

// There is a good chance that when I am adding in a rectangle element or axis, that they 
// get cut off. That is because I dont really have a good sense for what my drawing canvas 
// really looks like. Because I dont have that I under estimate the spacing that each
// of these elements are going to need. I am thinking that the best way to avoid this
// is to actually draw a quick schematic of your svg with margins and see how much space
// you will need. That way Im not going in and changing numbers and then refreshing. Are there
// ways to avoid this issue down the road?  
});