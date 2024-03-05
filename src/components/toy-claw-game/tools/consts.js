/*
 * @Description: 
 * @Author: zhoulx
 * @Date: 2024-03-02 19:05:21
 * @LastEditors: zhoulx
 * @LastEditTime: 2024-03-05 19:27:38
 */
import background_img from '../../../assets/background_img.png';
import front_img from '../../../assets/front_img.png';
import suspender_rod from "../../../assets/suspender_rod.png";
import left_hook_claw from "../../../assets/left_hook_claw.png";
import right_hook_claw from "../../../assets/right_hook_claw.png"

export class ConfigSize {
  constructor() {
    this.bgImg = {
      width: 1920,
      height: 1080
    }
    this.clawImg = {
      width: 98,
      height: 146
    }
    this.ballImg = {
      width: 231,
      height: 279
    }
    this.ballImg = {
      width: 231,
      height: 279
    }
    this.clawRodImg = {
      width: 159,
      height: 790
    }
    this.clawOffset = {
      x: 30,
      y: 60
    }
    this.hole = {
      width: 426,
      height: 240
    }
    this.rodOffset = {
      x: 0, // 暂时没用
      y: 500, // 杆子初始化向上偏移量
    }
    this.holeAndRodOffset = 30; // 洞口和杆子偏移量,确保爪子下去在中心
    this.groundHeight = 40;
    this.wallWidth = 40;
    this.ballTop = 54; // 球顶部的凸起
    this.judgePointOffset = 150; // 判断点偏移到爪子中心的距离
  }
  /**
 * @description: 根据传入的长宽缩放比例修改CONFIG_SIZE
 * @param {*} xp 横向放大比
 * @param {*} yp 纵向放大比
 * @return {*}
 */
  changeConfigSize (xp = 1, yp = 1){
    const {bgImg, clawImg, ballImg, clawRodImg, clawOffset, hole, rodOffset, holeAndRodOffset, groundHeight, wallWidth, ballTop, judgePointOffset} = this;
    this.bgImg = {
      width: bgImg.width * xp,
      height: bgImg.height * yp
    }
    this.clawImg = {
      width: clawImg.width * xp,
      height: clawImg.height * yp
    }
    this.ballImg = {
      width: ballImg.width * xp,
      height: ballImg.height * yp,
    }
    this.clawRodImg = {
      width: clawRodImg.width * xp,
      height: clawRodImg.height * yp,
    }
    this.clawOffset = {
      x: clawOffset.x * xp,
      y: clawOffset.y * yp,
    }
    this.hole = {
      width: hole.width * xp,
      height: hole.height * yp,
    }
    this.rodOffset = {
      x: rodOffset.x * xp,
      y: rodOffset.y * yp,
    }
    this.holeAndRodOffset = holeAndRodOffset * xp;
    this.groundHeight = groundHeight * yp;
    this.wallWidth = wallWidth * xp;
    this.ballTop = ballTop * yp;
    this.judgePointOffset = judgePointOffset * yp;
  }
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
  /** 球出现间隔 */
  ballAppearInterval: 300,
  
  ballCount: 6,
  /** 彩球 */
  balls: [
    {
      image: '/img/ball1.png',
      probability: 100, // 掉落概率 0 - 100 default:0, 值越大,在回到洞口之前掉落的几率越大, 100 的时候有极小的概率会被抓起来, 完全抓不起来是 1000
      weight: 1, // 出现权重 0 - 10 默认都是 1
  },
  {
      image: '/img/ball2.png',
      probability: 1,
  },
  {
      image: '/img/ball3.png',
      probability: 1,
  },
  {
      image: '/img/ball4.png',
      probability: 1,
  },
  {
      image: '/img/ball5.png',
      probability: 1,
  },
  {
      image: '/img/ball1.png',
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
   * 球进洞
   */
  onSuccess: (ballId) => {
    // alert(ballId)
    console.log(ballId)
  },

  /** 调试模式，可以看到刚体形状 */
  debugMode: false,
  
};