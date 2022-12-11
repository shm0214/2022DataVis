import * as d3 from "d3";

function AqiMap(
    mapData,
    aqiData,
    {
        width = 640,
        height = 400,
        date = new Date(2018, 0, 1)
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

    var aqiByDate = Array();
    // console.log(mapData.features.length, aqiData.length);
    for (let i = 0; i < mapData.features.length; ++i) {
        let name = mapData.features[i].properties.name;
        // console.log(name);
        for (let j = 0; j < aqiData.length; ++j) {
            if (aqiData[j].province.match(name)
                && (date.getMonth() + 1) == aqiData[j].month
                && date.getDate() == aqiData[j].day) {
                    aqiByDate.push(aqiData[j].AQI);
                    break;
            }
        }
    }
    console.log(aqiByDate);

    // AQI 颜色分级
    const colorScale = d3.scaleSequential()
        .domain([0, 50, 100, 150, 200, 300, 500])
        .range(["#01e400", "#ffe401", "#fe7e00", "#fe0000", "#98004b", "#82012a"]);

    svg.append("g")
        .attr("transform", "translate(10, 50)")
        .selectAll("path")
        .data(mapData.features)
        .join("path")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1)
        .attr("fill", function(d, i) {
            return colorScale(aqiByDate[i]);
        })
        .attr("d", geoPath);
    
    svg.append("g")
        .attr("transform", "translate(10, 50)")
        .selectAll("text")
        .data(mapData.features)
        .join("text")
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .attr("fill", "#777")
        .attr("x", function(d, i) {
            return projection(d.properties.cp || [0, 0])[0];
        })
        .attr("y", function(d, i) {
            return projection(d.properties.cp || [0, 0])[1];
        })
        .attr("dx", function(d, i) {
            if (d.properties.name == "香港") {
                return 10;
            }
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
