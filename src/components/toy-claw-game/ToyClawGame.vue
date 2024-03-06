<!--
 * @Description: 
 * @Author: zhoulx
 * @Date: 2024-03-05 17:47:09
 * @LastEditors: zhoulx
 * @LastEditTime: 2024-03-06 20:27:58
-->

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ToyClaw } from './tools/index'

const stage = ref(null);
let toyClaw;
let config = ref({
    "width": "1920px",
    "height": "1080px",
    "left": "0px",
    "right": "0px",
});
onMounted(() => {
    fetch('config.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            config.value = data;
            console.log('JSON data:', data);
            nextTick(() => {
                toyClaw = new ToyClaw(
                    {
                        el: stage.value, // 容器 必须要传, 其他字段都有默认值
                        ...config.value,
                        onSuccess: (url) => {
                            toyClaw.watchGame(url)
                        },
                    }
                )
                window.moveLeft = () => {
                    toyClaw.leftAction()
                }
                window.moveRight = () => {
                    toyClaw.rightAction()
                }
                window.moveDown = () => {
                    toyClaw.downAction()
                }
            })
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });

})
</script>

<template>
    <div ref="stage" id="stage" class="stage"
        :style="{ width: config.width, height: config.height, marginLeft: config.left, marginTop: config.top }">
    </div>
    <button @click="toyClaw.leftAction">左</button>
    <button @click="toyClaw.rightAction">右</button>
    <button @click="toyClaw.downAction">下</button>
</template>