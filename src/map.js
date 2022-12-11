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
        if (aqi >= 0 && aqi <= 50) return "rgb(15, 157, 88)";
        else if (aqi <= 100) return "#ffe401";
        else if (aqi <= 150) return "rgb(237, 99, 37)";
        else if (aqi <= 200) return "rgb(195, 26, 127)";
        else if (aqi <= 300) return "rgb(109, 57, 140)";
        else if (aqi <= 500) return "#82012a";
        else return "#fff";
    }

    svg.append("rect")  //添加一个矩形
    .attr("x",50)
    .attr("y",380)
    .attr("width",18)
    .attr("height",18)
    .attr("fill","rgb(15, 157, 88)");

    svg.append("g")
        .append('text')
        .attr("x",70)
        .attr("y",394)
        .style('font-weight', 20)
        .style('font-family', 'Arial')
        .style('fill', 'grey')
        .text("优");

    svg.append("rect")  //添加一个矩形
    .attr("x",50)
    .attr("y",403)
    .attr("width",18)
    .attr("height",18)
    .attr("fill","#ffe401");

    svg.append("g")
    .append('text')
    .attr("x",70)
    .attr("y",417)
    .style('font-weight', 20)
    .style('font-family', 'Arial')
    .style('fill', 'grey')
    .text("良");

    svg.append("rect")  //添加一个矩形
    .attr("x",50)
    .attr("y",426)
    .attr("width",18)
    .attr("height",18)
    .attr("fill","rgb(237, 99, 37)");

    svg.append("g")
    .append('text')
    .attr("x",70)
    .attr("y",440)
    .style('font-weight', 20)
    .style('font-family', 'Arial')
    .style('fill', 'grey')
    .text("轻度污染");

    svg.append("rect")  //添加一个矩形
    .attr("x",50)
    .attr("y",449)
    .attr("width",18)
    .attr("height",18)
    .attr("fill","rgb(195, 26, 127)");

    svg.append("g")
    .append('text')
    .attr("x",70)
    .attr("y",463)
    .style('font-weight', 20)
    .style('font-family', 'Arial')
    .style('fill', 'grey')
    .text("重度污染");

    svg.append("rect")  //添加一个矩形
    .attr("x",50)
    .attr("y",472)
    .attr("width",18)
    .attr("height",18)
    .attr("fill","rgb(109, 57, 140)");

    svg.append("g")
    .append('text')
    .attr("x",70)
    .attr("y",486)
    .style('font-weight', 20)
    .style('font-family', 'Arial')
    .style('fill', 'grey')
    .text("严重污染");


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
