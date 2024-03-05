<script setup>
import { ref, onMounted } from 'vue'
import { ToyClaw } from './tools/index'

import ball1 from "../../assets/ball1.png"
import ball2 from "../../assets/ball2.png"
import ball3 from "../../assets/ball3.png"
import ball4 from "../../assets/ball4.png"
import ball5 from "../../assets/ball5.png"
import ball6 from "../../assets/ball6.png"

const stage = ref(null);
let toyClaw;
onMounted(() => {
    toyClaw = new ToyClaw(
        {
            el: stage.value, // 容器 必须要传, 其他字段都有默认值
            /** 球出现间隔 */
            ballAppearInterval: 300,

            ballCount: 6,
            /** 彩球 */
            balls: [
                {
                    id: 1,
                    imgUrl: ball1,
                    probability: 100, // 掉落概率 0 - 100 default:0, 值越大,在回到洞口之前掉落的几率越大, 100 的时候有极小的概率会被抓起来, 完全抓不起来是 1000
                    weight: 1, // 出现权重 0 - 10 默认都是 1
                },
                {
                    id: 2,
                    imgUrl: ball2,
                    probability: 1,
                },
                {
                    id: 3,
                    imgUrl: ball3,
                    probability: 1,
                },
                {
                    id: 4,
                    imgUrl: ball4,
                    probability: 1,
                },
                {
                    id: 5,
                    imgUrl: ball5,
                    probability: 1,
                },
                {
                    id: 6,
                    imgUrl: ball6,
                    probability: 1,
                },
            ],

            /** 爪子下降速度 1-100 default:50  */
            clawDownSpeed: 50,

            /** 爪子上升速度 1-100 default:50  */
            clawUpSpeed: 50,

            /** 爪子回去速度 1-100 default:50  */
            clawBackSpeed: 50,

            /** 爪子抓取速度 1-100 default:50 */
            clawCatchSpeed: 50,

            /** 单次移动距离 1-100 default:10, 值越大,每次移动距离越大,也越不容易抓中 */
            singleMoveDistance: 10,

            /**
             * 抓取到彩球, 捏到球的时候
             * @param ballId 传入的彩球id
             */
            onCatch: (ballId) => {
                console.log('%c ballId', 'color: red', ballId,);
            },

            /**
             * 点击开始按钮 ,promise 返回 true 游戏才开始
             */
            onStartPlay: async () => {
                console.log("start");
                return true;
            },

            /**
             * 没抓到奖品
             */
            onMiss: () => {
                console.log('miss')
            },


            /**
             * 球进洞
             */
            onSuccess: (ballId) => {
                // alert(ballId)
                console.log(ballId)
            },

            /** 调试模式，可以看到刚体形状 */
            debugMode: false,

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