import * as d3 from "d3";
import $ from "jquery";

function nightingale(
    data,
    {
        width = 975,
        height = width,
        idx = 3,
        month = 1,
        innerRadius = 200,
        outerRadius = /*Math.min(width, height) / 2*/ 400,
    } = {}
) {
    //选择出来的省份一年的数据
    var province_data = data.slice(idx * 365, (idx + 1) * 365);
    var month_begin_index;
    var month_end_index;
    var if_begin_found = false;
    var gas_num = 6;

    for (let i = 0; i < 365; i++) {
        if (province_data[i].month == month && !if_begin_found) {
            month_begin_index = i;
            if_begin_found = true;
        } else if (if_begin_found) {
            if (province_data[i].month != month) {
                month_end_index = i;
                break;
            }
        }
    }

    var month_data = province_data.slice(month_begin_index, month_end_index);
    // console.log(month_data);

    //total计算
    for (let i = 0; i < month_data.length; i++) {
        let total =
            parseFloat(month_data[i]["PM2.5"]) +
            parseFloat(month_data[i]["PM10"]) +
            parseFloat(month_data[i]["SO2"]) +
            parseFloat(
                month_data[i]["NO2"] +
                    parseFloat(month_data[i]["CO"]) +
                    parseFloat(month_data[i]["O3"])
            );
        // console.log(total);
        month_data[i].total = total;
    }
    // console.log(month_data);
    month_data.columns = data.columns;
    // console.log(month_data);

    const arc = d3.arc()
        .innerRadius(d => innerRadius/*y(d[0])+1*/)
        .outerRadius(d => y(d[1] * 3))
        .startAngle(d => x(d.data.day) + x.bandwidth() * (d.type_num / gas_num+0.5))
        .endAngle(d => x(d.data.day) + x.bandwidth() * ((d.type_num + 1) / gas_num+0.5))
        .padAngle(0.01)
        .padRadius(innerRadius);

    const x = d3
        .scaleBand()
        .domain(month_data.map((d) => d.day))
        .range([0, 2 * Math.PI])
        .align(0);

    // This scale maintains area proportionality of radial bars
    const y = d3
        .scaleRadial()
        .domain([0, d3.max(month_data, (d) => d.total)])
        .range([innerRadius, outerRadius]);

    const z = d3.scaleOrdinal()
        .domain(month_data.columns.slice(3, 9))
        .range([
            "rgb(66, 133, 244)",
            "rgb(109, 57, 140)",
            "rgb(22, 174, 188)",
            "rgb(237, 99, 37)",
            "rgb(195, 26, 127)",
            "rgb(202, 156, 44)" /*, "#ff8c00"*/,
        ]);

    const xAxis = (g) =>
        g.attr("text-anchor", "middle").call((g) =>
            g
                .selectAll("g")
                .data(month_data)
                .join("g")
                .attr(
                    "transform",
                    (d) => `
            rotate(${((x(d.day) + x.bandwidth() / 2) * 180) / Math.PI - 90})
            translate(${innerRadius},0)
          `)
            .call(g => g.append("line")
                .attr("x1",-30)
                .attr("x2", 300)
                .attr("stroke", "#000")
                .attr("stroke-opacity", 0.5))
            .call(g => g.append("text")
                .attr("transform", d => (x(d.day) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                    ? "rotate(90)translate(0,16)"
                    : "rotate(-90)translate(0,-9)")
                .attr("font-size","18px")
                .text(d => d.day)));

    const yAxis = (g) =>
        g
            .attr("text-anchor", "middle")
            .call((g) =>
                g
                    .append("text")
                    .attr("y", (d) => -y(y.ticks(5).pop()))
                    .attr("dy", "-1em")
                    .text("concentration")
            )
            .call((g) =>
                g
                    .selectAll("g")
                    .data(y.ticks(4).slice(1))
                    .join("g")
                    .attr("fill", "none")
                    .call((g) =>
                        g
                            .append("circle")
                            .attr("stroke", "#000")
                            .attr("stroke-opacity", 0.5)
                            .attr("r", y)
                    )
                    .call((g) =>
                        g
                            .append("text")
                            .attr("y", (d) => -y(d))
                            .attr("dy", "0.35em")
                            .attr("stroke", "#fff")
                            .attr("stroke-width", 2)
                            .text(y.tickFormat(5, "s"))
                            .clone(true)
                            .attr("fill", "#000")
                            .attr("stroke", "none")
                    )
            );

    // console.log(month_data);
    // console.log(data);

    const legend = (g) =>
        g
            .append("g")
            .selectAll("g")
            .data(month_data.columns.slice(3, 9))
            .join("g")
            .attr("transform", (d, i) => `translate(-40,${(i - 6 / 2) * 20})`)
            .call((g) =>
                g
                    .append("rect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .attr("fill", z)
            )
            .call((g) =>
                g
                    .append("text")
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", "0.35em")
                    .text((d) => d)
            );

    const class_right_left = d3.select(".right-left");

    const svg = class_right_left
        .select("svg")
        .attr("height", height)
        .attr("width", width)
        .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
        .style("width", "100%")
        .style("height", "100%")
        .style("font", "15px sans-serif");

    // console.log(d3.stack().keys(month_data.columns.slice(3, 9))(month_data));

    var stack_data = d3.stack().keys(month_data.columns.slice(3, 9))(month_data);
    for (let i = 0; i < stack_data.length; i++) {
        for (let j = 0; j < stack_data[i].length; j++) {
            stack_data[i][j].type_num = i;
            stack_data[i][j][1] = stack_data[i][j][1] - stack_data[i][j][0];
        }

        console.log(stack_data[i]);
    }


    // var max;
    // for(let i = 0;i<stack_data.length;i++){
    //     if(i==0){
    //         max = Math.max.apply(Math,stack_data[i].map(item => { return item[1]; }));
    //     }
    //     else{
    //         for(let j=0;j<stack_data[i].length;j++){
    //             var value = stack_data[i][j][1] - stack_data[i][j][0];
    //             stack_data[i][j][0]=max;
    //             stack_data[i][j][1]=max+value;
    //         }
    //         max = Math.max.apply(Math,stack_data[i].map(item => { return item[1]; }));
    //     }
    // }
    console.log(stack_data);
    console.log(month_data);


    //6种气体分别按顺序来

    svg.append("g")
        .selectAll("g")
        .data(/*d3.stack().keys(month_data.columns.slice(3, 9))(month_data)*/stack_data)
        .join("g")
        .attr("fill", (d) => z(d.key))
        .selectAll("path")
        .data((d) => d)
        .join("path")
        .attr("d", arc)
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
            // console.log(this);
            // console.log(i);
            var value = d[1];
            var gas_List = ["PM2.5", "PM10", "SO2", "NO2", "CO", "O3"];
            var type = gas_List[d.type_num];
            // console.log(d.data);
            return type + "AQI: " + value.toFixed(2);
        });

    svg.append("g").call(xAxis);

    // svg.append("g")
    //     .call(yAxis);

    // svg.append("g")
    //     .call(legend);

    return svg.node();
}

export default nightingale;
