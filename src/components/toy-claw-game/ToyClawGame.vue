<script setup>
import { ref, onMounted } from 'vue'
import { ToyClaw } from './tools/index'
import { PixiApp } from './tools/pixiApp'
console.log(document.getElementById('stage'))
const stage = ref(null);
let toyClaw;
onMounted(() => {
    stage.value.appendChild(PixiApp.view);
    toyClaw = new ToyClaw()
})
</script>

<template>
    <div ref="stage" id="stage" class="stage"></div>
    <button @click="toyClaw.leftAction">左</button>
    <button @click="toyClaw.rightAction">右</button>
    <button @click="toyClaw.downAction">下</button>
</template>