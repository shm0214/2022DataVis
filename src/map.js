import * as d3 from "d3";

function AqiMap(
    mapData,
    aqiData,
    {
        width = 640,
        height = 400,
        date = "2018-01-01"
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
    var dateObj = new Date(date);
    // console.log(mapData.features.length, aqiData.length);
    for (let i = 0; i < mapData.features.length; ++i) {
        let name = mapData.features[i].properties.name;
        // console.log(name);
        for (let j = 0; j < aqiData.length; ++j) {
            if (aqiData[j].province.match(name)
                && (dateObj.getMonth() + 1) == aqiData[j].month
                && dateObj.getDate() == aqiData[j].day) {
                    aqiByDate.push(aqiData[j].AQI);
                    break;
            }
        }
    }
    // console.log(aqiByDate);

    // AQI 颜色分级
    const colorScale = (aqi) => {
        if (aqi >= 0 && aqi <= 50) return "#01e400";
        else if (aqi <= 100) return "#ffe401";
        else if (aqi <= 150) return "#fe7e00";
        else if (aqi <= 200) return "#fe0000";
        else if (aqi <= 300) return "#98004b";
        else if (aqi <= 500) return "#82012a";
        else return "#fff";
    }

    svg.append("g")
        .attr("transform", "translate(10, 40)")
        .selectAll("path")
        .data(mapData.features)
        .join("path")
        .attr("stroke", "#eee")
        .attr("stroke-width", 1)
        .attr("fill", (d, i) => {
            return colorScale(aqiByDate[i]);
        })
        .attr("d", geoPath)
        .on("mouseover", (e) => {
            // console.log(e);
            d3.select(e.target)
                .attr("stroke", "#fff")
                .attr("stroke-width", 3);
        })
        .on("mouseout", (e) => {
            d3.select(e.target)
                .attr("stroke", "#eee")
                .attr("stroke-width", 1);
        })
        .append("title")
        .text((d, i) => {
            return d.properties.name + "\nAQI: " + parseFloat(aqiByDate[i]).toFixed(2);
        });
    
    svg.append("g")
        .attr("transform", "translate(10, 40)")
        .selectAll("text")
        .data(mapData.features)
        .join("text")
        .attr("font-size", 13)
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .attr("x", (d, i) => {
            return projection(d.properties.cp || [0, 0])[0];
        })
        .attr("y", (d, i) => {
            return projection(d.properties.cp || [0, 0])[1];
        })
        .attr("dx", (d, i) => {
            if (d.properties.name == "香港") {
                return 16;
            }
        })
        .attr("dy", (d, i) => {
            if (d.properties.name == "澳门") {
                return 10;
            }
        })
        .text((d, i) => {
            return d.properties.name;
        });
    
    return svg.node();
}

export default AqiMap;
