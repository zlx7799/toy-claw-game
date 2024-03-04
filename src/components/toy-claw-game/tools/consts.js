/*
 * @Description: 
 * @Author: zhoulx
 * @Date: 2024-03-02 19:05:21
 * @LastEditors: zhoulx
 * @LastEditTime: 2024-03-04 21:07:31
 */
import background_img from '../../../assets/background_img.png';
import front_img from '../../../assets/front_img.png';
import suspender_rod from "../../../assets/suspender_rod.png";
import left_hook_claw from "../../../assets/left_hook_claw.png";
import right_hook_claw from "../../../assets/right_hook_claw.png"
import ball1 from "../../../assets/ball1.png"
import ball2 from "../../../assets/ball2.png"
import ball3 from "../../../assets/ball3.png"
import ball4 from "../../../assets/ball4.png"
import ball5 from "../../../assets/ball5.png"
import ball6 from "../../../assets/ball6.png"

export const IMG_SIZE = {
  bgImg: {
    width: 1920,
    height: 1080
  },
  clawImg: {
    width: 98,
    height: 146
  },
  ballImg: {
    width: 231,
    height: 279
  },
  clawRodImg: {
    width: 159,
    height: 790
  },
  clawOffset: {
    x: 30,
    y: 60
  },
  rodOffset: {
    x: 0, // 暂时没用
    y: 500, // 杆子初始化像上偏移量
  },
  holeAndRodOffset: 30, // 洞口和杆子偏移量,确保爪子下去在中心

}
// 娃娃机图片
export const MACHINE_TEXTURE_DATA = {
  machineBg: background_img,
  machineFront: front_img,
}

// 爪子图片
export const CLAW_TEXTURE_DATA = {
  suspenderRod: suspender_rod,
  leftClaw: left_hook_claw,
  rightClaw: right_hook_claw,
};

export const TOY_CLAW_CONFIG = {
  /** 彩球 */
  balls: [
    {
      id: 1,
      imgUrl: ball1,
      radius: IMG_SIZE.ballImg.width / 2,
      /** 掉落概率 0 - 100 default:0, 值越大,在回到洞口之前掉落的几率越大 */
      probability: 100,
      weight: 1, // 出现权重 0 - 10
    },
    {
      id: 2,
      imgUrl: ball2,
      radius: IMG_SIZE.ballImg.width / 2,
      probability: 100,
    },
    {
      id: 3,
      imgUrl: ball3,
      radius: IMG_SIZE.ballImg.width / 2,
      probability: 100,
    },
    {
      id: 4,
      imgUrl: ball4,
      radius: IMG_SIZE.ballImg.width / 2,
      probability: 100,
    },
    {
      id: 5,
      imgUrl: ball5,
      radius: IMG_SIZE.ballImg.width / 2,
      probability: 100,
    },
    {
      id: 6,
      imgUrl: ball6,
      radius: IMG_SIZE.ballImg.width / 2,
      probability: 100,
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

  /** 抓取难度，难度越大，抓取判定区域越小 1-100 default:50 100 就抓不到了 */
  catchDifficulty: 50,

  /** 单次移动距离 1-100 default:10, 值越大,每次移动距离越大,也越不容易抓中 */
  singleMoveDistance: 10,
  
  /**
   * 抓取到彩球
   * @param ballId 传入的彩球id
   */
  onCatch: (ballId) => {
    console.log('%c ballId', 'color: red', ballId, );
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
   * 没抓到奖品
   */
  onSuccess: (ballId) => {
    alert(ballId)
  },



  /** 调试模式，可以看到刚体形状 */
  debugMode: false,
};