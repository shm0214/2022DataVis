import * as d3 from "d3";
import $ from "jquery";

function nightingale(data, {
    width = 975,
    height = width,
    idx = 3,
    month = 1,
    innerRadius = 200,
    outerRadius = /*Math.min(width, height) / 2*/400,
} = {}) {

    //选择出来的省份一年的数据
    var province_data = data.slice(idx * 365, (idx + 1) * 365);
    var month_begin_index;
    var month_end_index;
    var if_begin_found = false;

    for (let i = 0; i < 365; i++) {
        if (province_data[i].month == month && !if_begin_found) {
            month_begin_index = i;
            if_begin_found = true;
        }
        else if (if_begin_found) {
            if (province_data[i].month != month) {
                month_end_index = i;
                break;
            }
        }
    }

    var month_data = province_data.slice(month_begin_index, month_end_index);
    console.log(month_data);

    //total计算
    for (let i = 0; i < month_data.length; i++) {
        let total = parseFloat(month_data[i]["PM2.5"]) + parseFloat(month_data[i]["PM10"]) + parseFloat(month_data[i]["SO2"]) + parseFloat(month_data[i]["NO2"] + parseFloat(month_data[i]["CO"]) + parseFloat(month_data[i]["O3"]));
        // console.log(total);
        month_data[i].total = total;
    }
    // console.log(month_data);
    month_data.columns = data.columns;
    // console.log(month_data);

    const arc = d3.arc()
        .innerRadius(d => y(d[0])+1)
        .outerRadius(d => y(d[1]))
        .startAngle(d => x(d.data.day))
        .endAngle(d => x(d.data.day) + x.bandwidth())
        .padAngle(0.01)
        .padRadius(innerRadius);

    const x = d3.scaleBand()
        .domain(month_data.map(d => d.day))
        .range([0, 2 * Math.PI])
        .align(0);

    // This scale maintains area proportionality of radial bars
    const y = d3.scaleRadial()
        .domain([0, d3.max(month_data, d => d.total)])
        .range([innerRadius, outerRadius]);


    const z = d3.scaleOrdinal()
        .domain(month_data.columns.slice(3, 9))
        .range(["rgb(66, 133, 244)", "rgb(109, 57, 140)", "rgb(15, 157, 88)", "rgb(237, 99, 37)", "rgb(195, 26, 127)", "rgb(202, 156, 44)"/*, "#ff8c00"*/]);

    const xAxis = g => g
        .attr("text-anchor", "middle")
        .call(g => g.selectAll("g")
            .data(month_data)
            .join("g")
            .attr("transform", d => `
            rotate(${((x(d.day) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
            translate(${innerRadius},0)
          `)
            .call(g => g.append("line")
                .attr("x2", -5)
                .attr("stroke", "#000"))
            .call(g => g.append("text")
                .attr("transform", d => (x(d.day) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                    ? "rotate(90)translate(0,16)"
                    : "rotate(-90)translate(0,-9)")
                .text(d => d.day)));

    const yAxis = g => g
        .attr("text-anchor", "middle")
        .call(g => g.append("text")
            .attr("y", d => -y(y.ticks(5).pop()))
            .attr("dy", "-1em")
            .text("concentration"))
        .call(g => g.selectAll("g")
            .data(y.ticks(4).slice(1))
            .join("g")
            .attr("fill", "none")
            .call(g => g.append("circle")
                .attr("stroke", "#000")
                .attr("stroke-opacity", 0.5)
                .attr("r", y))
            .call(g => g.append("text")
                .attr("y", d => -y(d))
                .attr("dy", "0.35em")
                .attr("stroke", "#fff")
                .attr("stroke-width", 2)
                .text(y.tickFormat(5, "s"))
                .clone(true)
                .attr("fill", "#000")
                .attr("stroke", "none")))

    console.log(month_data);
    console.log(data);

    const legend = g => g.append("g")
        .selectAll("g")
        .data(month_data.columns.slice(3, 9))
        .join("g")
        .attr("transform", (d, i) => `translate(-40,${(i - 6 / 2) * 20})`)
        .call(g => g.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", z))
        .call(g => g.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .text(d => d));



    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip") //用于css设置类样式
        .attr("opacity", 0.0);

    const class_right_left = d3.select(".right-left");


    const svg = class_right_left.select("svg")
        .attr("height", height)
        .attr("width", width)
        .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
        .style("width", "100%")
        .style("height", "100%")
        .style("font", "15px sans-serif");


    svg.append("g")
        .selectAll("g")
        .data(d3.stack().keys(month_data.columns.slice(3, 9))(month_data))
        .join("g")
        .attr("fill", d => z(d.key))
        .selectAll("path")
        .data(d => d)
        .join("path")
        .attr("d", arc)
        .append("title")
        .text((d, i) => {

            console.log(this);
            console.log(i);
            var value = d[1]-d[0];
            var type;
            if(value == d.data["PM2.5"]){
                type="PM2.5";
            }
            else if(value == d.data["PM10"]){
                type="PM10";
            }
            else if(value == d.data["SO2"]){
                type="SO2";
            }
            else if(value == d.data["NO2"]){
                type="NO2";
            }
            else if(value == d.data["CO"]){
                type="CO";
            }
            else{
                type="O3";
            }
            console.log(d.data);
            return type + "AQI: " + value.toFixed(2);
        });
        // .on("mouseover", function (d) {
        //     console.log(d.path);

        //     const colorMap = new Map();
        //     colorMap.set("rgb(66, 133, 244)","PM2.5");
        //     colorMap.set("rgb(109, 57, 140)","PM10");
        //     colorMap.set("rgb(15, 157, 88)","SO2");
        //     colorMap.set("rgb(237, 99, 37)","NO2");
        //     colorMap.set("rgb(195, 26, 127)","CO");
        //     colorMap.set("rgb(202, 156, 44)","O3");

        //     var g = d.path[1];
        //     console.log(g.getAttribute("fill"));
        //     var type = colorMap.get(g.getAttribute("fill"));
        //     var value = d.path[0].__data__[1]-d.path[0].__data__[0];

        //     var p = d3.pointer(d);
        //     //设置tooltip文字
        //     tooltip.html(type+"浓度:\n"+value.toFixed(2))
        //         //设置tooltip的位置(left,top 相对于页面的距离) 
        //         .style("left", (p[0]+490) + "px")
        //         .style("top", (p[1]+290) + "px")
        //         .style("opacity", 1.0);
        // })
        // //--鼠标移出事件
        // .on("mouseout", function (d) {
        //     tooltip.style("opacity", 0.0);
        // });


    svg.append("g")
        .call(xAxis);

    // svg.append("g")
    //     .call(yAxis);

    // svg.append("g")
    //     .call(legend);

    return svg.node();
}

export default nightingale;