$(document).ready(function(){
    $("body").css({width: vsq_length / 10 + 200 + "px"});
    var dynChart = new Highcharts.Chart({
        chart: {
            renderTo: 'dynchart',
            defaultSeriesType: 'area',
            zoomType: 'x',
        },
        title: {
            text: "dynamics curve"
        },
        yAxis: {
        	title: {
        		text: 'dynamics'
        	},
            max: 128,
            min: 0
        },
        legend: {
            enabled :false,
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: [0, 0, 0, 300],
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, 'rgba(2,0,0,0)']
                    ]
                },
                lineWidth: 1,
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 5
                        }
                    }
                },
                shadow: false,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                }
            },
            series: {
                step: true
            }
        },
        series:[{
        	name: 'dynamics',
            data: []
        }]
    });
    var pitChart = new Highcharts.Chart({
        chart: {
            renderTo: 'pitchart',
            defaultSeriesType: 'area',
            zoomType: 'x',
        },
        colors: ['#AA4643'],
        title: {
            text: "pitch curve"
        },
        yAxis: {
        	title: {
        		text: 'pitch'
        	},
            max: 30000,
            min: -30000
        },
        legend: {
            enabled :false,
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: [0, 0, 0, 300],
                    stops: [
                        [0, Highcharts.getOptions().colors[1]],
                        [1, 'rgba(0,2,0,0)']
                    ]
                },
                lineWidth: 1,
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            radius: 5
                        }
                    }
                },
                shadow: false,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                }
            },
            series: {
            	name: 'pitch',
                step: true
            }
        },
        series:[{
            data: []
        }]
    });



    var changeHighlight = function(obj){
        var index = $(obj).parent().find("input:checkbox").index(obj);
        if(index !== -1){
            var cand = $(".cand" + $(obj).val());
            if($(obj).attr("checked") === "checked"){
                cand.addClass("choosen");
            } else {
                cand.removeClass("choosen");
            }
        }
    }
    var selectRule = function(obj){
        if($(obj).attr("selected") === "selected"){
            $(".anote").each(function(){
                $(this).removeClass("chooseable");
            });
            $(".anote").filter(function(){
                if($(this).attr("class").indexOf($(obj).val()) !== -1){
                    return true;
                } else {
                    return false;
                }
            }).addClass("chooseable");
        }
    }
    var changeGraph = function(){
        var options = {
            success: function(response){
                dataset = $.evalJSON(response);
                dynChart.series[0].setData(dataset.dyn);
                pitChart.series[0].setData(dataset.pit);
            },
        url: "/appliedvsq"
        };
        $("#rule-form").ajaxSubmit(options);
    };
    $("input:checkbox").change(function(){
        changeHighlight(this);
        changeGraph();
    });
    $("select").change(function(){ selectRule($(this).children("option:selected")) });
    //$(".chooseable").click(function(){
        //var clickedCandidate = $("input:checkbox[value="+$(this).attr("id").slice(5)+"]")
        //if(clickedCandidate.attr("checked") === "checked"){
            //clickedCandidate.removeAttr("checked");
        //} else {
            //clickedCandidate.attr("checked", "checked");
        //}
        //clickedCandidate.change();
    //});

    changeGraph();
    jQuery.getJSON("/appliedlyric", function(anote){
        init_time = anote[0].start_time;
        for (var i=0; i < anote.length; i++) {
            span = $("<span>").addClass("lyric").css({width: anote[i].length / 10 + "px"}).html(anote[i].lyric);
            div = $("<div>").addClass("anote").css({left: (anote[i].start_time - init_time) / 10 + $(".highcharts-series > path").offset().left + "px"});
            if(anote[i].rules.length > 0){
                if(anote[i].rules.length < 1){ //本来は===1とする。今はテストのため一つでもポップアップするように変更してある。
                    span.click(function(rules){
                        return function(){
                            for(var i=0; i < rules.length; i++){
                                var clickedCandidate = $("input:checkbox[value="+rules[i].id+"]");
                                if(clickedCandidate.attr("checked") === "checked"){
                                    clickedCandidate.removeAttr("checked");
                                } else {
                                    clickedCandidate.attr("checked", "checked");
                                }
                                clickedCandidate.change();
                            }
                        }
                    }(anote[i].rules));
                } else {
                    var ul = $("<ul>").addClass("popup");
                    for (var j=0; j < anote[i].rules.length; j++) {
                        var li = $("<li>").click(function(rule){
                            return function(){
                                clickedCandidate = $("#rule-form input:checkbox[value="+rule+"]");
                                if(clickedCandidate.attr("checked") === "checked"){
                                    clickedCandidate.removeAttr("checked");
                                } else {
                                    clickedCandidate.attr("checked", "checked");
                                }
                                $(this).parent(".popup").toggle();
                                console.log(this);
                                clickedCandidate.change();
                            };
                        }(anote[i].rules[j].id)).text(anote[i].rules[j].name);
                        ul.append(li);
                    };
                    span.click(function(){
                        $(this).siblings("ul").toggle();
                    });
                    $(div).append(ul);
                }
                div.addClass("chooseable");
                for (var j=0; j < anote[i].rules.length; j++) {
                    div.addClass("cand" + anote[i].rules[j].id);
                };
            }
            div.prepend(span);
            $("#float-lyric").append(div);
        };
        $("#float-lyric").css({width: vsq_length / 10 + "px"});
        $("select > option:selected").each(function(){ selectRule(this)} );
        $("input:checkbox").each(function(){ changeHighlight(this)} );
    });

});
