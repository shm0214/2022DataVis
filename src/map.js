import * as d3 from "d3";

function AqiMap(
    mapData,
    aqiData,
    { width = 640, height = 400, date = "2018-01-01" } = {}
) {
    const svg = d3
        .select(".svg-right-right")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-10, -10, width, height])
        .attr("style", "max-width: 100%; max-height: 100%; height: intrinsic;");

    const projection = d3
        .geoMercator()
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
            if (
                aqiData[j].province.match(name) &&
                dateObj.getMonth() + 1 == aqiData[j].month &&
                dateObj.getDate() == aqiData[j].day
            ) {
                aqiByDate.push(aqiData[j].AQI);
                break;
            }
        }
    }
    // console.log(aqiByDate);

    // AQI 颜色分级
    const colorScale = (aqi) => {
        if (aqi >= 0 && aqi <= 50) return "rgb(0, 153, 102)";
        else if (aqi <= 100) return "rgb(255, 222, 51)";
        else if (aqi <= 150) return "rgb(255, 153, 51)";
        else if (aqi <= 200) return "rgb(204, 0, 51)";
        else if (aqi <= 300) return "rgb(102, 0, 153)";
        else if (aqi <= 500) return "rgb(126, 0, 35)";
        else return "#fff";
    };

    svg.append("rect") //添加一个矩形
        .attr("class", "map")
        .attr("x", 50)
        .attr("y", 360)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", "rgb(0, 153, 102)");

    svg.append("g")
        .append("text")
        .attr("x", 70)
        .attr("y", 374)
        .style("font-weight", 20)
        .style("font-family", "Arial")
        .style("fill", "grey")
        .text("优(0<AQI<=50)");

    svg.append("rect") //添加一个矩形
        .attr("class", "map")
        .attr("x", 50)
        .attr("y", 383)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", "rgb(255, 222, 51)");

    svg.append("g")
        .append("text")
        .attr("x", 70)
        .attr("y", 397)
        .style("font-weight", 20)
        .style("font-family", "Arial")
        .style("fill", "grey")
        .text("良(50<AQI<=100)");

    svg.append("rect") //添加一个矩形
        .attr("class", "map")
        .attr("x", 50)
        .attr("y", 406)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", "rgb(255, 153, 51)");

    svg.append("g")
        .append("text")
        .attr("x", 70)
        .attr("y", 420)
        .style("font-weight", 20)
        .style("font-family", "Arial")
        .style("fill", "grey")
        .text("轻度污染(100<AQI<=150)");

    svg.append("rect") //添加一个矩形
        .attr("class", "map")
        .attr("x", 50)
        .attr("y", 429)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", "rgb(204, 0, 51)");

    svg.append("g")
        .append("text")
        .attr("x", 70)
        .attr("y", 443)
        .style("font-weight", 20)
        .style("font-family", "Arial")
        .style("fill", "grey")
        .text("中度污染(150<AQI<=200)");

    svg.append("rect") //添加一个矩形
        .attr("class", "map")
        .attr("x", 50)
        .attr("y", 452)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", "rgb(102, 0, 153)");

    svg.append("g")
        .append("text")
        .attr("x", 70)
        .attr("y", 466)
        .style("font-weight", 20)
        .style("font-family", "Arial")
        .style("fill", "grey")
        .text("重度污染(200<AQI<=300)");

    svg.append("rect") //添加一个矩形
        .attr("class", "map")
        .attr("x", 50)
        .attr("y", 475)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", "rgb(126, 0, 35)");

    svg.append("g")
        .append("text")
        .attr("x", 70)
        .attr("y", 489)
        .style("font-weight", 20)
        .style("font-family", "Arial")
        .style("fill", "grey")
        .text("严重污染(AQI>300)");

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
            d3.select(e.target).attr("stroke", "#fff").attr("stroke-width", 3);
        })
        .on("mouseout", (e) => {
            d3.select(e.target).attr("stroke", "#eee").attr("stroke-width", 1);
        })
        .append("title")
        .text((d, i) => {
            return (
                d.properties.name +
                "\nAQI: " +
                parseFloat(aqiByDate[i]).toFixed(2)
            );
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
