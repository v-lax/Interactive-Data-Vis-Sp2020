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
    .join("tr")
    .attr("class", (data) => {
        let tag;
        if(+data['Pct']>.500){
           return tag='above500'
        }else{
           return tag=null; 
        };
    });
rows
    .selectAll('td')
    .data(d=>Object.values(d))
    .join("td")
    .text(d=>d);
});
