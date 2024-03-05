<script setup>
import { ref, onMounted } from 'vue'
import { ToyClaw } from './tools/index'

import config from "/config.json?url"
const stage = ref(null);
let toyClaw;
onMounted(() => {
    toyClaw = new ToyClaw(
        {
            el: stage.value, // 容器 必须要传, 其他字段都有默认值
            ...config,
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
</script>
<template>
    <div ref="stage" id="stage" class="stage" style="width: 100%;height: 100%;"></div>
    <button @click="toyClaw.leftAction">左</button>
    <button @click="toyClaw.rightAction">右</button>
    <button @click="toyClaw.downAction">下</button>
</template>