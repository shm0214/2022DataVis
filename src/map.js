import * as d3 from "d3";

function AqiMap(
    mapData,
    aqiData,
    {
        width = 640,
        height = 400,
    } = {}
) {
    const svg = d3
        .select(".svg-right-right")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; max-height: 100%; height: intrinsic;");
    
    const projection = d3.geoMercator()
        .center([107, 31])
        .scale(550)
        .translate([width / 2, height / 2]);
    
    const geoPath = d3.geoPath().projection(projection);

    svg.append("g")
        .attr("transform", "translate(0, 50)")
        .selectAll("path")
        .data(mapData.features)
        .join("path")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("fill", "#ddd")
        .attr("d", geoPath);
    
    svg.append("g")
        .attr("transform", "translate(0, 50)")
        .selectAll("text")
        .data(mapData.features)
        .join("text")
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .attr("x", function(d, i) {
            return projection(d.properties.cp || [0, 0])[0];
        })
        .attr("y", function(d, i) {
            return projection(d.properties.cp || [0, 0])[1];
        })
        .attr("dy", function(d, i) {
            if (d.properties.name == "澳门") {
                return 10;
            }
        })
        .text(function(d, i) {
            return d.properties.name;
        });
    
    return svg.node();
}

export default AqiMap;
