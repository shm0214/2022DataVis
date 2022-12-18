import * as d3 from "d3";

function AqiMap(
    mapData,
    aqiData,
    {
        width = 640,
        height = 400,
        colorMap = null,
        date = "2018-01-01",
        type = "all",
    } = {}
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
    var dataStr = type == "all" ? "AQI" : type + "-AQI";
    console.log(dataStr);
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
                aqiByDate.push(aqiData[j][dataStr]);
                break;
            }
        }
    }
    // console.log(aqiByDate);

    // AQI 分级
    const getAqiLevel = (aqi) => {
        if (aqi >= 0 && aqi <= 50) return 0;
        else if (aqi <= 100) return 1;
        else if (aqi <= 150) return 2;
        else if (aqi <= 200) return 3;
        else if (aqi <= 300) return 4;
        else if (aqi <= 500) return 5;
        else return 6;
    }
    const colorScale = [
        "rgb(0, 153, 102)",
        "rgb(255, 222, 51)",
        "rgb(255, 153, 51)",
        "rgb(204, 0, 51)",
        "rgb(102, 0, 153)",
        "rgb(126, 0, 35)",
        "#fff",
    ];

    if (type == "all") {
        svg.append("rect") //添加一个矩形
            .attr("class", "map")
            .attr("x", 20)
            .attr("y", 342)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", "rgb(0, 153, 102)");

        svg.append("text")
            .attr("x", 40)
            .attr("y", 356)
            .style("font-weight", 20)
            .style("font-family", "Arial")
            .style("fill", "grey")
            .text("优(0<AQI<=50)");

        svg.append("rect") //添加一个矩形
            .attr("class", "map")
            .attr("x", 20)
            .attr("y", 365)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", "rgb(255, 222, 51)");

        svg.append("text")
            .attr("x", 40)
            .attr("y", 379)
            .style("font-weight", 20)
            .style("font-family", "Arial")
            .style("fill", "grey")
            .text("良(50<AQI<=100)");

        svg.append("rect") //添加一个矩形
            .attr("class", "map")
            .attr("x", 20)
            .attr("y", 388)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", "rgb(255, 153, 51)");

        svg.append("text")
            .attr("x", 40)
            .attr("y", 402)
            .style("font-weight", 20)
            .style("font-family", "Arial")
            .style("fill", "grey")
            .text("轻度污染(100<AQI<=150)");

        svg.append("rect") //添加一个矩形
            .attr("class", "map")
            .attr("x", 20)
            .attr("y", 411)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", "rgb(204, 0, 51)");

        svg.append("text")
            .attr("x", 40)
            .attr("y", 425)
            .style("font-weight", 20)
            .style("font-family", "Arial")
            .style("fill", "grey")
            .text("中度污染(150<AQI<=200)");

        svg.append("rect") //添加一个矩形
            .attr("class", "map")
            .attr("x", 20)
            .attr("y", 434)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", "rgb(102, 0, 153)");

        svg.append("text")
            .attr("x", 40)
            .attr("y", 448)
            .style("font-weight", 20)
            .style("font-family", "Arial")
            .style("fill", "grey")
            .text("重度污染(200<AQI<=300)");

        svg.append("rect") //添加一个矩形
            .attr("class", "map")
            .attr("x", 20)
            .attr("y", 457)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", "rgb(126, 0, 35)");

        svg.append("text")
            .attr("x", 40)
            .attr("y", 471)
            .style("font-weight", 20)
            .style("font-family", "Arial")
            .style("fill", "grey")
            .text("严重污染(AQI>300)");
    } else {
        const g = svg.append("g")
            .attr("transform", "translate(20, 340)");
        const legendSize = 24;
        
        g.selectAll("rect")
            .data([0, 1, 2, 3, 4, 5])
            .join("rect")
            .attr("y", (d, i) => {
                return i * legendSize;
            })
            .attr("width", legendSize)
            .attr("height", legendSize)
            .attr("fill", colorMap.get(type))
            .attr("opacity", (d, i) => {
                return d * 0.1 + 0.5;
            });
        
        g.selectAll("text")
            .data([0, 50, 100, 150, 200, 300, 500])
            .join("text")
            .attr("font-size", 12)
            .attr("x", legendSize + 6)
            .attr("y", (d, i) => {
                return i * legendSize + legendSize / 5;
            })
            .text((d) => d);
    }

    svg.append("g")
        .attr("transform", "translate(10, 40)")
        .selectAll("path")
        .data(mapData.features)
        .join("path")
        .attr("stroke", "#eee")
        .attr("stroke-width", 1)
        .attr("fill", (d, i) => {
            if (type == "all") {
                return colorScale[getAqiLevel(aqiByDate[i])];
            } else {
                return colorMap.get(type);
            }
        })
        .attr("opacity", (d, i) => {
            if (type != "all") {
                return getAqiLevel(aqiByDate[i]) * 0.1 + 0.5;
            }
        })
        .attr("d", geoPath)
        .on("mouseover", (e) => {
            // console.log(e);
            d3.select(e.target).attr("stroke", "#fff").attr("stroke-width", 2);
        })
        .on("mouseout", (e) => {
            d3.select(e.target).attr("stroke", "#eee").attr("stroke-width", 1);
        })
        .append("title")
        .text((d, i) => {
            return (
                d.properties.name +
                "\n" +
                dataStr +
                ": " +
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
            return projection(d.properties.centroid || [0, 0])[0];
        })
        .attr("y", (d, i) => {
            return projection(d.properties.centroid || [0, 0])[1];
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
            if (d.properties.name == "内蒙古") {
                return 20;
            }
        })
        .text((d, i) => {
            return d.properties.name;
        });

    return svg.node();
}

export default AqiMap;
