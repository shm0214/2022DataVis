import * as d3 from "d3";
import $ from "jquery";

function Calendar(
    data,
    {
        width = 640, // outer width of chart, in pixels
        height = 400, // outer height of chart, in pixels
        colorMap = colorMap,
        idx = 3,
        type = "all",
    } = {}
) {
    const svg = d3
        .select(".svg-right-down")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; max-height: 100%; height: intrinsic;");
    var data1 = data.slice(idx * 365, (idx + 1) * 365);
    console.log(type)

    const margin = 30;
    const weekBoxWidth = 20;
    const monthBoxHeight = 20;

    const cellBox = svg
        .append("g")
        .attr(
            "transform",
            "translate(" + (margin + weekBoxWidth) + ", " + (margin + 10) + ")"
        );

    const cellMargin = 3;
    const cellSize = Math.min(
        (height - margin - monthBoxHeight - cellMargin * 6 - 10) / 7,
        (width - margin - weekBoxWidth - cellMargin * 53 - 10) / 54
    );
    var cellCol = 0;
    var aqiRange = [0, 50, 100, 150, 200, 300, 400, 500];

    var cell = cellBox
        .selectAll("rect")
        .data(data1)
        .enter()
        .append("rect")
        .attr("class", "calendar")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("rx", 3)
        .attr("fill", (v) => {
            if (type == "all") {
                return colorMap.get(v.type);
            }
            return colorMap.get(type);
        })
        .on("mouseover", (d, i) => {
            $("#aqi-info").html(
                `日期：${i.month}月${i.day}日<br>AQI：${parseFloat(
                    type == "all" ? i.AQI : i[type + '-AQI']
                ).toFixed(2)}<br>PM2.5：${parseFloat(i["PM2.5"]).toFixed(
                    2
                )}<br>PM10：${parseFloat(i["PM10"]).toFixed(
                    2
                )}<br>SO2：${parseFloat(i["SO2"]).toFixed(
                    2
                )}<br>NO2：${parseFloat(i["NO2"]).toFixed(
                    2
                )}<br>CO：${parseFloat(i["CO"]).toFixed(2)}<br>O3：${parseFloat(
                    i["O3"]
                ).toFixed(2)}<br>除CO单位为mg/m2外，其余均为ug/m2`
            );
        })
        .on("mouseout", () => {
            $("#aqi-info").html("");
        })
        .attr("opacity", (v) => {
            var aqi = type == "all" ? v.AQI : v[type + "-AQI"];
            var idx = 0;
            if (aqi >= 500) {
                idx = 7;
            } else {
                for (idx; idx < aqiRange.length - 1; idx++) {
                    if (aqi < aqiRange[idx + 1]) {
                        break;
                    }
                }
            }
            return idx * 0.1 + 0.3;
        })
        .attr("x", (v, i) => {
            if (i % 7 == 0) {
                cellCol++;
            }
            var x = (cellCol - 1) * cellSize;
            return cellCol > 1 ? x + cellMargin * (cellCol - 1) : x;
        })
        .attr("y", (v, i) => {
            var y = i % 7;
            return y > 0 ? y * cellSize + cellMargin * y : y * cellSize;
        });
    const boxWidth = cellCol * (cellMargin + cellSize);

    // 绘制月份坐标
    const monthBox = svg
        .append("g")
        .attr(
            "transform",
            "translate(" + (margin + weekBoxWidth) + ", " + margin + ")"
        );
    const monthScale = d3.scaleLinear().domain([0, 12]).range([0, boxWidth]);

    monthBox
        .selectAll("text")
        .data([
            "2018-01",
            "2018-02",
            "2018-03",
            "2018-04",
            "2018-05",
            "2018-06",
            "2018-07",
            "2018-08",
            "2018-09",
            "2018-10",
            "2018-11",
            "2018-12",
        ])
        .enter()
        .append("text")
        .text((v) => {
            return v;
        })
        .attr("font-size", "0.9em")
        .attr("font-family", "monospace")
        .attr("x", (v, i) => {
            return monthScale(i);
        });

    // 设置周坐标数据
    const weeks = ["一", "三", "五", "日"];
    // 绘制周坐标
    const weekBox = svg
        .append("g")
        .attr(
            "transform",
            "translate(" +
                (margin - 10) +
                ", " +
                (margin + monthBoxHeight) +
                ")"
        );
    const weekScale = d3
        .scaleLinear()
        .domain([0, weeks.length])
        .range([0, height - margin - monthBoxHeight + 14]);

    weekBox
        .selectAll("text")
        .data(weeks)
        .enter()
        .append("text")
        .text((v) => {
            return v;
        })
        .attr("font-size", "0.85em")
        .attr("y", (v, i) => {
            return weekScale(i);
        });

    return svg.node();
}

export default Calendar;
