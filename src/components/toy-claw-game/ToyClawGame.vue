<script setup>
import { ref, onMounted } from 'vue'
import { ToyClaw } from './tools/index'

import config from "/config.json?url"
const stage = ref(null);
let toyClaw;
onMounted(() => {
    console.log('%c config', 'color: red', config, );
    toyClaw = new ToyClaw(
        {
            el: stage.value, // 容器 必须要传, 其他字段都有默认值
            ...config,
        }
    )
})
</script>
<template>
    <div ref="stage" id="stage" class="stage" style="width: 960px;height: 540px;"></div>
    <button @click="toyClaw.leftAction">左</button>
    <button @click="toyClaw.rightAction">右</button>
    <button @click="toyClaw.downAction">下</button>
</template>