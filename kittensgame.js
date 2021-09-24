// ==UserScript==
// @name         猫国建设者
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       saltedfish
// @match        http://kittensgame.com/web/
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @grant        GM_info
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.setClipboard
// @grant        GM_info
// @grant        GM.xmlHttpRequest
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/vue/2.6.12/vue.min.js
// @include      *
// ==/UserScript==

if (window.location.origin !== 'http://kittensgame.com') return;

(function () {
    var vueApp = null;

    function createApp() {
        var html = `
        <div id="app" style="position: fixed; right: 0; top: 0; user-select: none; height: 100vh; width: 600px; background-color: #eee; overflow: auto; box-sizing: border-box; padding: 15px; z-index: 1000; display: none;">
            <div style="padding-bottom: 15px; text-align: right;">
                <button @click="onClose">关闭窗口</button>
            </div>
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
                <div v-for="(item, index) in list" :key="index" style="padding-bottom: 15px; width: 265px;">
                    <div style="color: #4fc08d;">物品名称：{{ item.name }}</div>
                    <div>
                        <div style="margin-bottom: 5px;">
                            <span>添加数量：</span>
                            <input 
                                type="number"
                                v-model="item.value" 
                                style="width: 150px;"
                                readonly
                            />
                        </div>
                        <div style="margin-bottom: 5px;">
                            <button @click="addValue(item, 1000)">+1k</button>
                            <button @click="addValue(item, 10000)">+10k</button>
                            <button @click="addValue(item, 100000)">+100k</button>
                            <button @click="addValue(item, 1000000)">+1000k</button>
                        </div>
                        <div>
                            <button @click="setZero(item)">清零</button>
                            <button @click="onSubmit(item)">确定</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        $('body').append(html);

        vueApp = new Vue({
            el: '#app',
            data: function () {
                return {
                    list: [],
                };
            },
            created: function () {
                var self = this;
                self.setList();
            },
            methods: {
                setList: function () {
                    var self = this;
                    var resourceMapKeys = Object.keys(gamePage.resPool.resourceMap);
                    var list = [];
                    var whiteList = ['kittens'];
                    resourceMapKeys.forEach(function (key) {
                        var isOK = whiteList.includes(gamePage.resPool.resourceMap[key].name) === false;
                        if (gamePage.resPool.resourceMap[key].unlocked && isOK) {
                            var maxValue = gamePage.resPool.resourceMap[key].maxValue.toFixed(2);
                            maxValue = Number(maxValue) ? maxValue : 100;

                            var haveMaxValue = gamePage.resPool.resourceMap[key].maxValue ? true : false;

                            var obj = {
                                key: key,
                                name: gamePage.resPool.resourceMap[key].title,
                                maxValue: maxValue,
                                haveMaxValue: haveMaxValue,
                                value: maxValue,
                            }
                            list.push(obj);
                        }
                    });
                    self.list = list;
                },
                addValue: function (row, value) {
                    var newValue = row.value + value;
                    if (row.haveMaxValue && newValue > row.maxValue) {
                        newValue = row.maxValue;
                    }
                    row.value = newValue;
                },
                setZero: function (row) {
                    row.value = 0;
                },
                onSubmit: function (row) {
                    var addValue = Number(row.value);
                    if (row.haveMaxValue) { 
                        var value = gamePage.resPool.resourceMap[row.key].value;
                        
                        var maxValue = Number(row.maxValue);
                        if (value + addValue > maxValue) {
                            gamePage.resPool.get(row.key).value = maxValue;
                        } else {
                            gamePage.resPool.get(row.key).value += addValue;
                        }
                    } else {
                        gamePage.resPool.get(row.key).value += addValue;
                    }
                },
                onClose: function () {
                    $('#app').hide();
                },
            },
        });
    }

    var isInit = false;
    var timer = setInterval(function () {
        if ($('#leftColumnViewport').text().trim() !== 'Loading...') {
            clearInterval(timer);
            timer = null;
            if (isInit === true) return;
            createApp();
            
            $("body").append(`<button id="open-app-btn" style="position: fixed; left: 30px; bottom: 30px; user-select: none;">修改器</button>`);
            $('#open-app-btn').on('click', function () {
                vueApp.setList();
                $('#app').toggle();
            });
            isInit = true;
        }
    }, 1000);
})();