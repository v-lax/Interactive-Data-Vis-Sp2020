d3.csv("./nba_standings.csv").then(data => {

//Logging our data to the console
console.log(data);

const table = d3.select('#d3-table');
const thead = table.append("thead");
const tbody = table.append("tbody");

thead
    .append("tr")
    .append("th")
    .attr("colspan", "7")
    .text("2019-2020 NBA Standings");

thead
    .append("tr")
    .selectAll("th")
    .data(data.columns)
    .join("td")
    .text(d => d);

//body
const rows=tbody
    .selectAll("tr")
    .data(data)
    .join("tr");

// adding in the values for each cell.
// I tried my best with the logic here. I tried to access highlight a cell in the "PCT"column if it was greater
// than .500. But only issue is that I did not know what d was here and had a tough time trying to select
//values only in the column.  
rows
    .selectAll('td')
    .data(d=>Object.values(d))
    .join("td")
    .attr("class", d => d[3] > .5 ? 'above500' : null)
    .text(d=>d);
});
