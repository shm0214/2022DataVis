"use strict";
import * as d3 from "d3";
import histogram from "./histogram.js";
import $ from "jquery";
import total from "../data/AQI-rank/total.csv"

const colorMap = new Map();
colorMap.set("PM2.5", "rgb(66,133,244)");
colorMap.set("PM10", "rgb(109,57,140)");
colorMap.set("SO2", "rgb(15,157,88)");
colorMap.set("NO2", "rgb(237,99,37)");
colorMap.set("CO", "rgb(237,99,37)");
colorMap.set("O3", "rgb(202,156,44)");


d3.csv(total).then((data, error) => {
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
            num: 20,
        });
    }
});
