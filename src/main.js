"use strict";
import * as d3 from "d3";
import histogram from "./histogram.js";
import aqimap from "./map.js";
import nightingale from "./nightingale.js";
import $ from "jquery";
import total from "../data/AQI-rank/total.csv";
import province from "../data/data-province.csv";
import rank_11 from "../data/AQI-rank/11.csv";
import rank_12 from "../data/AQI-rank/12.csv";
import rank_13 from "../data/AQI-rank/13.csv";
import rank_14 from "../data/AQI-rank/14.csv";
import rank_15 from "../data/AQI-rank/15.csv";
import rank_21 from "../data/AQI-rank/21.csv";
import rank_22 from "../data/AQI-rank/22.csv";
import rank_23 from "../data/AQI-rank/23.csv";
import rank_31 from "../data/AQI-rank/31.csv";
import rank_32 from "../data/AQI-rank/32.csv";
import rank_33 from "../data/AQI-rank/33.csv";
import rank_34 from "../data/AQI-rank/34.csv";
import rank_35 from "../data/AQI-rank/35.csv";
import rank_36 from "../data/AQI-rank/36.csv";
import rank_37 from "../data/AQI-rank/37.csv";
import rank_41 from "../data/AQI-rank/41.csv";
import rank_42 from "../data/AQI-rank/42.csv";
import rank_43 from "../data/AQI-rank/43.csv";
import rank_44 from "../data/AQI-rank/44.csv";
import rank_45 from "../data/AQI-rank/45.csv";
import rank_46 from "../data/AQI-rank/46.csv";
import rank_50 from "../data/AQI-rank/50.csv";
import rank_51 from "../data/AQI-rank/51.csv";
import rank_52 from "../data/AQI-rank/52.csv";
import rank_53 from "../data/AQI-rank/53.csv";
import rank_54 from "../data/AQI-rank/54.csv";
import rank_61 from "../data/AQI-rank/61.csv";
import rank_62 from "../data/AQI-rank/62.csv";
import rank_63 from "../data/AQI-rank/63.csv";
import rank_64 from "../data/AQI-rank/64.csv";
import rank_65 from "../data/AQI-rank/65.csv";
import rank_71 from "../data/AQI-rank/71.csv";
import rank_81 from "../data/AQI-rank/81.csv";
import geocn from "../data/geocn.json";
import Calendar from "./calendar.js";

const colorMap = new Map();
colorMap.set("PM2.5", "rgb(66, 133, 244)");
colorMap.set("PM10", "rgb(109, 57, 140)");
colorMap.set("SO2", "rgb(15, 157, 88)");
colorMap.set("NO2", "rgb(237, 99, 37)");
colorMap.set("CO", "rgb(195, 26, 127)");
colorMap.set("O3", "rgb(202, 156, 44)");

$("#range").on("change", function (e) {
    var val = $("#range").val();
    $("#num").attr("placeholder", val);
    num = parseInt(val);
    left_render();
});

$("#select").on("change", function (e) {
    var val = $("#select").val();
    switch (val) {
        case "total":
            csv = total;
            break;
        case "11":
            csv = rank_11;
            break;
        case "12":
            csv = rank_12;
            break;
        case "13":
            csv = rank_13;
            break;
        case "14":
            csv = rank_14;
            break;
        case "15":
            csv = rank_15;
            break;
        case "21":
            csv = rank_21;
            break;
        case "22":
            csv = rank_22;
            break;
        case "23":
            csv = rank_23;
            break;
        case "31":
            csv = rank_31;
            break;
        case "32":
            csv = rank_32;
            break;
        case "33":
            csv = rank_33;
            break;
        case "34":
            csv = rank_34;
            break;
        case "35":
            csv = rank_35;
            break;
        case "36":
            csv = rank_36;
            break;
        case "37":
            csv = rank_37;
            break;
        case "41":
            csv = rank_41;
            break;
        case "42":
            csv = rank_42;
            break;
        case "43":
            csv = rank_43;
            break;
        case "44":
            csv = rank_44;
            break;
        case "45":
            csv = rank_45;
            break;
        case "46":
            csv = rank_46;
            break;
        case "50":
            csv = rank_50;
            break;
        case "51":
            csv = rank_51;
            break;
        case "52":
            csv = rank_52;
            break;
        case "53":
            csv = rank_53;
            break;
        case "54":
            csv = rank_54;
            break;
        case "61":
            csv = rank_61;
            break;
        case "62":
            csv = rank_62;
            break;
        case "63":
            csv = rank_63;
            break;
        case "64":
            csv = rank_64;
            break;
        case "65":
            csv = rank_65;
            break;
        case "71":
            csv = rank_71;
            break;
        case "81":
            csv = rank_81;
            break;
    }
    left_render();
});

var csv = total;
var num = 20;

function left_render() {
    $(".svg-left-down").empty();
    d3.csv(csv).then((data, error) => {
        if (error) {
            console.log(error);
        } else {
            console.log(data);
            var width = $(".left-down").width();
            var height = $(".left-down").height();
            histogram(data, {
                width: width,
                height: height,
                colorMap: colorMap,
                num: num,
            }).then(change_highlight_color(highlightColor));
        }
    });
}

left_render();

var highlightColor = null;
var type = "all";

function change_highlight_color(color) {
    if (highlightColor == color) return;
    highlightColor = color;
    if (color) {
        $(".highlight").remove();
        var index = Array.from(colorMap.values()).indexOf(color);
        var name = Array.from(colorMap.keys())[index];
        type = name;
        var g = d3.selectAll("g .rect").filter(function (index) {
            return $("rect", this).css("fill") == color;
        });
        var bbox = g.select("text").node().getBBox();
        var padding = 1;
        g.insert("rect", "text")
            .attr("x", (d) => bbox.x - padding)
            .attr("y", (d) => bbox.y - padding)
            .attr("class", "highlight")
            .attr("name", (d) => Array.from(colorMap.keys())[d])
            .attr("width", (d) => bbox.width + padding * 2)
            .attr("height", (d) => bbox.height + padding * 2)
            .style("fill", "rgb(205, 205, 205)");
        $("rect:not(.calendar)").css("opacity", "1");
        $("rect:not(.calendar)")
            .filter(function (index) {
                return $(this).css("fill") != color;
            })
            .css("opacity", "0.5");
    } else {
        type = "all";
        $(".highlight").remove();
        $("rect:not(.calendar)").css("opacity", "1");
    }
    right_down_render();
}

function right_top_render() {
    var width = $(".right-top").width();
    var height = $(".right-top").height();
    console.log(width, height);
    const svg = d3
        .select(".svg-right-top")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; max-height: 100%; height: intrinsic;");

    svg.append("text")
        .text("2018年中国空气质量分析")
        .attr("font-size", "24px")
        .attr("x", "25%")
        .attr("y", "50%")
        .attr("text-anchor", "middle");

    let g = svg.append("g").attr("transform", `translate(0, ${height - 30})`);

    let keys = Array.from(colorMap.keys());
    let values = Array.from(colorMap.values());

    let g1 = g
        .selectAll("g.rect")
        .data([0, 1, 2, 3, 4, 5])
        .enter()
        .append("g")
        .attr("class", "rect");

    var text = g1
        .append("text")
        .text((d) => keys[d])
        .attr("y", 16)
        .attr("x", (d) => 25 + 100 * d);

    // var bbox = Array();
    // $(".svg-right-top g text").each(function () {
    //     bbox.push(this.getBBox());
    // });
    // console.log(bbox);
    // var padding = 1;
    // g1.insert("rect", "text")
    //     .attr("x", (d) => bbox.x - padding)
    //     .attr("y", (d) => bbox.y - padding)
    //     .attr("class", "highlight")
    //     .attr("name", (d) => keys[d])
    //     .attr("width", (d) => bbox.width + padding * 2)
    //     .attr("height", (d) => bbox.height + padding * 2)
    //     .style("fill", "rgb(205, 205, 205)");

    g1.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", (d) => 100 * d + 3)
        .attr("fill", (d) => values[d])
        .attr("rx", "5")
        .attr("ry", "5")
        .attr("cursor", "pointer")
        .on("click", function (d) {
            var color = $(this).css("fill");
            if (highlightColor != color) {
                change_highlight_color(color);
            } else {
                change_highlight_color(null);
            }
        });
}

right_top_render();

var mapDate = "2018-01-01";

$("#map-date").on("change", function(e) {
    mapDate = $("#map-date").val();
    right_right_render();
});

function right_right_render() {
    $(".svg-right-right").empty();
    // console.log(geocn);
    d3.csv(province).then((data, error) => {
        if (error) {
            console.log(error);
        } else {
            // console.log(data);
            var width = $(".right-right").width();
            var height = $(".right-right").height();
            aqimap(geocn, data, {
                width: width,
                height: height,
                date: mapDate,
            });
        }
    });
}

right_right_render();

var provinceIdx = 3;

$("#select1").on("change", function (e) {
    provinceIdx = parseInt($("#select1").val());
    right_down_render();
    // right_left_render();
});

function right_down_render() {
    $(".svg-right-down").empty();
    d3.csv(province).then((data, error) => {
        if (error) {
            console.log(error);
        } else {
            var width = $(".right-down").width();
            var height = $(".right-down").height();
            Calendar(data, {
                width: width,
                height: height,
                colorMap: colorMap,
                idx: provinceIdx,
                type: type,
            });
        }
    });
}

right_down_render();

var monthIdx = 1;

$("#select2").on("change", function (e) {
    monthIdx = parseInt($("#select2").val());
    right_left_render();
});

$("#select3").on("change", function (e) {
    provinceIdx = parseInt($("#select3").val());
    right_left_render();
});

function right_left_render(){
    $(".svg-right-left").empty();
    d3.csv(province).then((data, error) => {
        if (error) {
            console.log(error);
        } else {
            console.log(data);
            nightingale(data, {
                width: 975,
                height: 975,
                idx: provinceIdx,
                month: monthIdx,
            });
        };
    }); 
}

right_left_render();
