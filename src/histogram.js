import * as d3 from "d3";

function Histogram(
    data,
    {
        width = 640, // outer width of chart, in pixels
        height = 400, // outer height of chart, in pixels
        num = 20,
        colorMap = colorMap,
    } = {}
) {
    const svg = d3
        .select("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; max-height: 100%; height: intrinsic;");

    var topMargin = 0.05 * height;
    var leftMargin = 0.4 * width;
    var maxWidth = 0.55 * width;

    var rectHeight = ((0.95 * height) / num) * 0.8;
    var margin = rectHeight / 4;

    svg.append("text")
        .attr("font-size", "20px")
        .text("AQI排行榜")
        .attr("x", 0.5 * width)
        .attr("text-anchor", "middle")
        .attr("y", (topMargin * 2) / 3);

    for (let i = 0; i < num; i++) {
        var d = data[i];
        var startY = topMargin + (rectHeight + margin) * i;
        var aqi = parseInt(data[i].AQI);
        aqi = Math.min(500, aqi);

        svg.append("rect")
            .attr("x", leftMargin)
            .attr("y", startY)
            .attr("width", (maxWidth * aqi) / 500)
            .attr("height", rectHeight)
            .attr("fill", colorMap.get(d.type))
            .append("title")
            .text(d.data + (d.type == "CO" ? "m" : "u") + "g/m2");

        var text = svg.append("text").attr("font-size", "14px");

        var tspan1 = text
            .append("tspan")
            .text(d.province + " " + d.city)
            .attr("x", leftMargin - 0.03 * width)
            .attr("y", startY + rectHeight / 2)
            .attr("text-anchor", "end");
        var textHeight = tspan1.node().getBoundingClientRect().height;
        tspan1.attr("y", startY + rectHeight / 2 - textHeight / 4);

        text.append("tspan")
            .text(d.month + "月" + d.day + "日")
            .attr("x", leftMargin - 0.03 * width)
            .attr("y", startY + rectHeight / 2 + textHeight / 2)
            .attr("text-anchor", "end");

        svg.append("text")
            .attr("font-size", "14px")
            .text(aqi)
            .attr("x", leftMargin + 0.01 * width)
            .attr("y", startY + rectHeight / 2 + textHeight / 4)
            .attr("fill", "white");
    }

    return svg.node();
}

export default Histogram;
