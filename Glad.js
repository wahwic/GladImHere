// ==UserScript==
// @name         GladImHere
// @namespace    tralala
// @version      1.2
// @description  Gladiatus stuff
// @author       Wah
// @match        https://*.gladiatus.gameforge.com/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @icon         https://i.imgur.com/loWkqOF.jpg
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

const settings = {
    dungeonVersion: "9371",
    minHp: 15,
    upgradeSkills: 0,
    expeditionsAttack: 1,
    dungeonAttack: 1,
    circusTurmaAttack: 1,
    arenaAttack: 0,
    mobGroupPosition: "7",
    mobPosition: 3,
    dungeonDifficulty: "dif2"
};

(function () {
    'use strict';

    function attackMethod(method, url, data, shash) {
        var request = {
            method: method,
            url: url,
            data: data + "&a=" + new Date().getTime() + "&sh=" + shash,
            onComplete: function (response) {
                eval(response);
            }
        };
        new Request(request).send();
    }

    function dungeonAttack(dungeonPage) {
        if (dungeonPage) {
            var inDungeon = document.querySelectorAll("img[src*='" + settings.dungeonVersion + "/img/dungeons/']").length;
            if (inDungeon) {
                var attackDungeon = document.querySelectorAll("img[src='" + settings.dungeonVersion + "/img/combatloc.gif']");
                if (attackDungeon.length) {
                    attackDungeon[0].click();
                } else {
                    location.reload();
                }
            } else {
                var clickDiff = document.getElementsByName(settings.dungeonDifficulty)[0];
                clickDiff.click();
            }
        } else {
            var clickDungeon = document.getElementById("cooldown_bar_dungeon").getElementsByClassName("cooldown_bar_link")[0];;
            clickDungeon.click();
        }
    }

    function expeditionsAttack(expeditionsPage) {
        if (expeditionsPage) {
            var readyToAttack = document.querySelectorAll(".expedition_cooldown_reduce");
            if (readyToAttack.length == 0) {
                attack(null, settings.mobGroupPosition, settings.mobPosition, 0, '');
            }
        } else {
            var redirectButton = document.querySelectorAll('a[href*="&loc=2"]')[0];
            redirectButton.click();
        }
    }

    function arenaAttack(arenaPage) {
        if (arenaPage) {
            // var pickedEnemy = $(".attack:last").attr("onClick").toString();
            // var returnedArray = pickedEnemy.match(/startFight\(this\,\s(.+?)\)/);
            // attackMethod("get", "ajax/doArenaFight.php", "did=" + returnedArray[1], secureHash);
			var enemy = document.querySelector("#own2 > table > tbody > tr:nth-child(2) > td:nth-child(4) > div");
			enemy.click();
        } else {
            var clickArena = document.querySelectorAll("#cooldown_bar_arena>a")[0];
            clickArena.click();
        }
    }

    function ctAttack(circusPage) {
        if (circusPage) {
            var users = document.getElementsByClassName("attack");
            users[2].click();
        } else {
            var clickCircusTurma = document.querySelectorAll("#cooldown_bar_ct>a")[0];
            clickCircusTurma.click();
        }
    }

    function startEatingIfFoodExists() {
        var checkExist = setInterval(function () {
            if (document.querySelectorAll("div[data-content-type='64']").length) {
                moveItem(extractFoodData(foodLogic(getFoodList())));
                clearInterval(checkExist);
            }
        }, 300);
    }

    function getFoodList() {
        var allFoodItems = document.querySelectorAll("div[data-content-type='64']");
        var arrayFoodItems = $.map(allFoodItems, function (value, index) {
            return [value];
        });

        var healValues = [];
        arrayFoodItems.forEach(function (item) {
            var rawElem = $(item).attr("data-tooltip").match(/Heals\s(.+?)\sof life/);
            var healVal = rawElem[1].toInt();
            healValues.push(healVal);
        });

        var toReturn = [];
        toReturn.push(healValues, arrayFoodItems);

        return toReturn;
    }

    function foodLogic(foodData) {
        var missingHp = $("#header_values_hp_bar").attr("data-max-value").toInt() - $("#header_values_hp_bar").attr("data-value").toInt();
        var minPos = null;
        var minVal = 99999;
        foodData[0].forEach(function (item) {
            var diff = item.toInt() - missingHp;
            if (diff < minVal && diff < 0) {
                minVal = diff;
                minPos = foodData[0].indexOf(item);
            } else {
                minVal = diff;
                minPos = foodData[0].indexOf(item);
            }
        });

        return foodData[1][minPos];
    }

    function extractFoodData(selectedFood) {
        var xCoord = $(selectedFood).attr("data-position-x").toInt();
        var yCoord = $(selectedFood).attr("data-position-y").toInt();
        var sendable = {
            from: 514,
            fromX: xCoord,
            fromY: yCoord,
            to: 8,
            toX: 1,
            toY: 1,
            amount: 1
        };

        return sendable;
    }

    function moveItem(dataToParam) {
        const requestUrl = "ajax.php?mod=inventory&submod=move&" + jQuery.param(dataToParam);
        const data = "&a=" + new Date().getTime() + "&sh=" + secureHash;
        jQuery.ajax({
            url: requestUrl,
            type: 'POST',
            data: data,
            async: false,
        });
    }

    // function upgradeSkills(upgrades, trainingPage, myGold) {
        // if (Boolean(upgrades.length)) {
            // if (trainingPage == true) {
                // var costs = JSON.parse(GM_getValue("upgCost"));
                // var upgradeToDo = upgrades[0];
                // upgrades.shift();
                // var selectedUpgrade = costs.indexOf(upgradeToDo) + 1;
                // var upgradeButton = document.querySelectorAll('a[href*="?mod=training&submod=train&skillToTrain=' + selectedUpgrade + '"]');
                // if (upgradeButton.length) {
                    // upgradeButton[0].click();
                // }
            // } else {
                // var trainingButton = document.querySelectorAll("a[href*='mod=training']");
                // trainingButton[0].click();
            // }
        // }
    // }

    // function calcSkill(gold, skillCost) {
        // var skills = [],
            // total = 0;
        // skillCost.forEach(function (cost) {
            // while (total + cost <= gold) {
                // skills.push(cost);
                // total += cost;
            // }
        // });
        // return skills;
    // }

    var myLoc = location.toString();
    var fullLoc = location.origin.toString() + location.pathname.toString();
    var myGold = $("#sstat_gold_val").text().trim().replace('.', '').toInt();
    var circusPage = Boolean(myLoc.match(/mod=arena&submod=serverArena&aType=3/));
    var arenaPage = Boolean(myLoc.match(/.+index\.php\?(mod\=arena)\&sh\=.+$/));
    var expeditionsPage = Boolean(myLoc.match(/mod=location&loc=/));
    var dungeonPage = Boolean(myLoc.match(/mod=dungeon&loc=/));
    var trainingPage = Boolean(myLoc.match(/mod=training/));
    var homepage = Boolean(myLoc.match(/mod=overview/));
    var rnadominterval = (Math.random() * 3000) + 1000;
	var homeButton = document.querySelectorAll("a[href*='mod=overview']")[0];

	// --REPEAT--
    // setInterval(function () {
        // if (trainingPage == true) {
            // var trainingCosts = $(".training_costs").map(function () {
                // return $(this).text().trim().replace('.', '').toInt();
            // }).get();
            // var upgradePlan = calcSkill(myGold, trainingCosts);
            // GM_setValue("upgPlan", JSON.stringify(upgradePlan));
            // GM_setValue("upgCost", JSON.stringify(trainingCosts));
        // } else {
            // var trainingButton = document.querySelectorAll("a[href*='mod=training']")[0];
            // trainingButton.click();
        // }
    // }, 45000);

    setInterval(function () {
        var circusTurmaLoad = document.getElementById("cooldown_bar_fill_ct").style.width;
        var arenaLoad = document.getElementById("cooldown_bar_fill_arena").style.width;
        var expeditionsLoad = document.getElementById("cooldown_bar_fill_expedition").style.width;
        var dungeonLoad = document.getElementById("cooldown_bar_fill_dungeon").style.width;
        var selfHp = document.getElementById("header_values_hp_bar_fill").style.width.toInt();

        // if(settings.upgradeSkills) {
            // var upgrades = JSON.parse(GM_getValue("upgPlan") || "[]");

            // upgrades = upgrades.filter(function (item, i, ar) { return ar.indexOf(item) === i; });
            // if (upgrades[0] > myGold) {
                // GM_setValue("upgPlan", JSON.stringify([]));
                // console.log("RESET UPGRADE PLAN");
            // }

            // upgradeSkills(upgrades, trainingPage, myGold);
        // }
		if (selfHp <= settings.minHp) {
			if(!homepage){
				homeButton.click();
			}
			startEatingIfFoodExists();
		} else {
            if (settings.expeditionsAttack && expeditionsLoad == "100%") {
                expeditionsAttack(expeditionsPage);
            }
            if (settings.arenaAttack && arenaLoad == "100%") {
                arenaAttack(arenaPage);
            }
			if (settings.dungeonAttack && dungeonLoad == "100%") {
				dungeonAttack(dungeonPage);
			}
			if (settings.circusTurmaAttack && circusTurmaLoad == "100%") {
				ctAttack(circusPage);
			}
        }
    }, rnadominterval);
})();
