// import { PixiApp } from "./pixiApp.js";
import { Machine } from "./machine.js";
import { RigidBody } from "./rigidBody.js";
import { RigidBodyRender } from "./rigidBodyRender.js";
import { ConfigSize,  } from "./consts.js";
import { Assets, Sprite, Graphics, Point } from "pixi.js";
import { PixiApp } from "./pixiApp.js";
import * as Matter from "matter-js";

export class ToyClaw {
  constructor(config ) {
    this.isClawRunning = false;
    this._claw = null;
    this._resources = null;
    this._rigidBodyRender = null;
    this.randomFun = null; // 随机数方法
    this._shadowList = []; // 小球阴影
    // 不填的字段都会有默认值
    this._config = config;
    console.log('%c this._config', 'color: red', this._config, );
    if (!config.el) {
      console.log("el is required");
      return;
    }
    this.el = config.el;
    this.el.appendChild(PixiApp.view);
    // 这个写法有点没设计好了
    this.CONFIG_SIZE = new ConfigSize()
    const xp = this.el.clientWidth/this.CONFIG_SIZE.bgImg.width;
    const yp = this.el.clientHeight/this.CONFIG_SIZE.bgImg.height;
    this.yp = yp
    this.xp = xp
    this.moveX = true;
    this.missFlag = false;
    this.CONFIG_SIZE.changeConfigSize(xp, yp);
    PixiApp.renderer.resize(this.CONFIG_SIZE.bgImg.width, this.CONFIG_SIZE.bgImg.height);
    this._machine = new Machine(this.CONFIG_SIZE);
    this.init();
  }
  /**
   * @description: 修正数值为0-100之间，缺省为50
   * @param {*} number
   * @return {*}
   */
  _fix1To100(number) {
    isNaN(number) && (number = 50);
    return Math.min(Math.max(1, number), 100);
  }

  /**
   * @description: 加载所有球的材质
   * @return {*}
   */
  async _loadBallTexture() {
    let urls = this._config.balls.map((item) => [item.image, item.award]);
    const unique = (e) => {
      let array = [];
      e.forEach((item) => {
        array.push(...item)
      });
      return Array.from(new Set(array));
    };
    urls = unique(urls);
    return await Assets.load(urls);
  }

  /**
   * @description:  获取已经加载好的材质
   * @param {*} name 材质名称
   * @return {*}
   */
  _getTexture(name) {
    const { _resources } = this;
    return _resources[name];
  }

  /**
   * @description: 开始游戏
   * @return {*}
   */
  async _startPlay() {
    if (this._config.onStartPlay) {
      const canPlay = await this._config.onStartPlay();
      if (!canPlay) return;
    }

    if (this.isClawRunning) return;
    this.isClawRunning = true;

    // 应用爪子抓取速度
    this._claw.speed = this._config.clawCatchSpeed * 3;
    this.moveX = false
    await this._claw.tweenTo(
      { y: this.CONFIG_SIZE.rodOffset.y },
      65000 / this._config.clawDownSpeed,
      (resolve, ticker) => {
        // 附近有球,停止移动
        const { x, y } = this._claw.judgePoint.toGlobal(new Point(0, 0));
        let nearbyBall = this._rigidBodyRender.rigidBodies.find((item) => {
          // 难度可以在此调整 爪子抓时的容错
          const xDistance = x - item.sprite.position.x;
          const yDistance = y - item.sprite.position.y;
          const distance = Math.sqrt(
            xDistance * xDistance + yDistance * yDistance
          );
          const judgeDistance = 50;
          return distance < judgeDistance;
        });
        if (nearbyBall) {
          PixiApp.ticker.remove(ticker);
          resolve();
        }
      }
    );
    await this._claw.grabTo(10); // 张开
    await this._claw.grabTo(50); // 收紧
    const { x, y } = this._claw.judgePoint.toGlobal(new Point(0, 0));
    this.catchedBall = this._rigidBodyRender.rigidBodies.find((item) => {
      // 难度可以在此调整 爪子抓时的容错
      const xDistance = x - item.sprite.position.x;
      const yDistance = y - item.sprite.position.y;
      const distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
      // const judgeDistance = CONFIG_SIZE.ballImg.width / 2 + CONFIG_SIZE.judgePointOffset;
      const judgeDistance = 80;
      return distance < judgeDistance;
    });
    this.missFlag = false;
    if (this.catchedBall) {
      console.log("%c this.catchedBall", "color: red", this.catchedBall);
      // this._config.onCatch && this._config.onCatch(this.catchedBall.id);
    } else {
      this.missFlag = true;
      // 给附近的一个力
      await this._claw.grabTo(120);
      const { x, y } = this._claw.judgePoint.toGlobal(new Point(0, 0));
      this.catchedBall = this._rigidBodyRender.rigidBodies.forEach((item) => {
        // 难度可以在此调整 爪子抓时的容错
        const xDistance = x - item.sprite.position.x;
        const yDistance = y - item.sprite.position.y;
        const distance = Math.sqrt(
          xDistance * xDistance + yDistance * yDistance
        );
        // const judgeDistance = CONFIG_SIZE.ballImg.width / 2 + CONFIG_SIZE.judgePointOffset;
        const judgeDistance = this._config.catchDistance;
        console.log(
          "%c distance",
          "color: red",
          distance,
          distance < judgeDistance
        );
        if (distance < judgeDistance) {
          const forceMagnitude = this._config.force;
          Matter.Body.applyForce(
            item.body,
            { x: item.body.position.x, y: item.body.position.y },
            { x: forceMagnitude, y: -forceMagnitude }
          );
        }
      });
      this._config.onMiss && this._config.onMiss();
    }
    await this._claw.tweenTo({ y: 0 }, 65000 / this._config.clawUpSpeed);
    this.moveX = true;
    await this._claw.tweenTo({ x: 0 }, 65000 / this._config.clawBackSpeed);
    !this.missFlag && await this._claw.grabTo(30);
    this.catchedBall = null;
    !this.missFlag && await this._claw.grabTo(120);
    this.isClawRunning = false;
  }

  /**
   * @description: 加权随机数算法,权重越大,出现几率越高
   * @param {*} weights
   * @return {*}
   */
  randomInProbability(weights) {
    if (arguments.length > 1) {
      weights = [].slice.call(arguments);
    }

    let total,
      current = 0;
    let i = 0;
    const parts = [];
    const l = weights.length;

    total = weights.reduce((a, b) => {
      return a + b;
    });

    for (; i < l; i++) {
      current += weights[i];
      parts.push("if( p < ", current / total, " ) return ", i / l, " + n;");
    }

    return Function(
      "var p = Math.random(), n = Math.random() / " + l + ";" + parts.join("")
    );
  }

  /**
   * @description: 增加球
   * @return {*}
   */
  async addBalls() {
    const ballCount = this._config.ballCount;
    this.randomFun =
      this.randomFun ||
      this.randomInProbability(
        this._config.balls.map((item) => item.weight || 1)
      );

    let balls = [];
    for (let i = 0; i < ballCount; i++) {
      let index = Math.floor(this.randomFun() * this._config.balls.length);

      // 图片数组之内避免重复, 超过图片数量的球随机
      if (balls.length < this._config.balls.length) {
        while (balls.length > 0 && balls.includes(this._config.balls[index])) {
          index = Math.floor(this.randomFun() * this._config.balls.length);
        }
      }
      balls.push(this._config.balls[index]);
    }
    let flag = true;
    for (let item of balls) {
      await this._sleep(this._config.ballAppearInterval);
      const texture = this._getTexture(item.image);
      const ballSprite = new Sprite(texture);
      ballSprite.width = this.CONFIG_SIZE.ballImg.width;
      ballSprite.height = this.CONFIG_SIZE.ballImg.height;
      ballSprite.zIndex = 3;
      const startXList = [
        this.CONFIG_SIZE.wallWidth + this.CONFIG_SIZE.ballImg.width / 2,
        this.CONFIG_SIZE.bgImg.width / 2 + this.CONFIG_SIZE.hole.width,
      ];
      const random1 = flag ? 0 : 1;
      flag = !flag; // 左右均匀给球
      const halfWidth =
        Math.floor((this.CONFIG_SIZE.bgImg.width - this.CONFIG_SIZE.hole.width) / 2) -
        this.CONFIG_SIZE.wallWidth -
        this.CONFIG_SIZE.ballImg.width / 2;
        const x = startXList[random1] + Math.round(Math.random() * halfWidth)
      ballSprite.x = x > this.CONFIG_SIZE.bgImg.width ? this.CONFIG_SIZE.bgImg.width - 2 * this.CONFIG_SIZE.wallWidth - this.CONFIG_SIZE.ballImg.width / 2  : x
      ballSprite.y = 400 * this.yp;
      // console.log("%c ballSprite.x", "color: red", ballSprite.x, ballSprite.y);

      this._machine.machineBox.addChild(ballSprite);

      let body;
      if (item.radius) {
        body = Matter.Bodies.circle(ballSprite.x, ballSprite.y, item.radius, {
          restitution: item.restitution || 0.8,
          mass: item.mass || 10,
        });
      } else {
        body = Matter.Bodies.circle(
          ballSprite.x,
          ballSprite.y,
          this.CONFIG_SIZE.ballImg.width / 2,
          {
            restitution: item.restitution || 0.8, // 设置弹力
            mass: item.mass || 10, // 设置重力
          }
        );
      }

      body.friction = 0.5;

      const rigidBody = RigidBody.create(ballSprite, body, {configSize: this.CONFIG_SIZE});
      // console.log("%c id", "color: red", item.id);
      rigidBody.award = item.award;
      rigidBody.probability = item.probability ? item.probability : this._config.probability;
      console.log('%c rigidBody.probability', 'color: red', rigidBody.probability, );
    }
  }

  async init() {
    this._resources = await this._loadBallTexture();
    await this._machine.init();
    this._claw = this._machine.claw;
    await this._setup();
  }

  async _setup() {
    this._initPhysicsEngine();
    PixiApp.ticker.add(() => {
      this._gameLoop();
    });
    await this._initBalls();
  }

  _initPhysicsEngine() {
    this._rigidBodyRender = RigidBodyRender.getInstance(this.CONFIG_SIZE);
    this._rigidBodyRender.run();
    this._rigidBodyRender.debugMode = this._config.debugMode;
  }

  /**
   * @description: 绘制小球阴影
   * @return {*}
   */
  _drawBallShadow() {
    if (this._shadowList.length > 0) {
      this._shadowList.forEach((shadow) => {
        this._machine.machineBox.removeChild(shadow);
      });
    }
    if (this._rigidBodyRender && this._rigidBodyRender.rigidBodies.length > 0) {
      this._rigidBodyRender.rigidBodies.forEach((rigidBody) => {
        const { x, y } = rigidBody.body.position;
        const groundY = this.CONFIG_SIZE.bgImg.height - this.CONFIG_SIZE.groundHeight;
        const { width, height } = this._calculateShadowSize(
          Math.abs(y - groundY),
          this.CONFIG_SIZE.ballImg.width / 6
        );
        if (!width || !height) {
          return;
        }
        let ellipse = new Graphics();
        ellipse.zIndex = 1;
        ellipse.beginFill(0x000000, 0.2);
        ellipse.drawEllipse(x, groundY, width, height);
        ellipse.endFill();
        this._shadowList.push(ellipse);
        this._machine.machineBox.addChild(ellipse);
      });
    }
  }

  /**
   * @description:
   * @param {*} height
   * @param {*} radius 球的半径
   * @return {*}
   */
  _calculateShadowSize(height, radius) {
    const value = 300 * this.yp;
    if (height > value) {
      height = 300 * this.yp;
    }
    // 假设光源在球的正上方
    let shadowHeight = radius * ((value - height) / value); // 椭圆阴影在垂直方向的高度
    let shadowWidth = 3 * shadowHeight; // 椭圆阴影在水平方向的宽度，即球的直径

    return { width: shadowWidth, height: shadowHeight };
  }

  _gameLoop() {
    this._drawBallShadow();
    // 同步抓起的球
    if (this.catchedBall) {
      // const x =
      //   this._claw.positionX +
      //   CONFIG_SIZE.bgImg.width / 2 +
      //   CONFIG_SIZE.holeAndRodOffset;
      const { x, y } = this._claw.judgePoint.toGlobal(new Point(0, 0));
      if (this._dropItem(this.catchedBall.probability) && this.moveX) {
        this.missFlag = true;
        this._claw.grabTo(120);
        this.catchedBall = null;
        return;
      }
      this.catchedBall.setPosition(
        // this.catchedBall.body.position.x,
        x,
        y
      );
    }
  }

  /**
   * @description: 是否出发掉落
   * @param {*} probability 0-100之间的数值
   * @return {*}
   */
  _dropItem(probability = 0) {
    let random = Math.floor(Math.random() * 1000) + 1;
    if (random <= probability) {
      // 掉落发生
      return true;
    } else {
      // 未掉落
      return false;
    }
  }
  /**
   * @description: 检测游戏进度
   * @return {*}
   */
  watchGame(url) {
    this.isClawRunning = true;
    let sprite = new Sprite(this._getTexture(url));
    sprite.zIndex = 6;
    sprite.width = this.CONFIG_SIZE.prizeImg.width
    sprite.height = this.CONFIG_SIZE.prizeImg.height
    sprite.x = (this.CONFIG_SIZE.bgImg.width - this.CONFIG_SIZE.prizeImg.width) / 2;
    sprite.y = (this.CONFIG_SIZE.bgImg.height - this.CONFIG_SIZE.prizeImg.height) / 2;
    this._machine.machineBox.addChild(sprite)
    setTimeout(async () => {
      this.isClawRunning = false;
      this._machine.machineBox.removeChild(sprite)
      if (this._rigidBodyRender.rigidBodies.length == 0){
        await this.addBalls();
      }
    }, this._config.prizeImgRemoveTime);
  }
  async _initBalls() {
    await this.addBalls();
    await this._sleep(3000);
    this._rigidBodyRender.bodyOutsideWorld = this._config.onSuccess;
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  leftAction() {
    if (this.isClawRunning) return;
    if (this._claw.positionX < -(this.CONFIG_SIZE.bgImg.width/2 - this.CONFIG_SIZE.wallWidth - this.CONFIG_SIZE.clawRodImg.width / 2)){
      return;
    }
    this._claw.positionX -= this._config.singleMoveDistance;
  }

  rightAction() {
    if (this.isClawRunning) return;
    if (this._claw.positionX > (this.CONFIG_SIZE.bgImg.width/2 - this.CONFIG_SIZE.wallWidth  - this.CONFIG_SIZE.clawRodImg.width / 2)){
      return;
    }
    this._claw.positionX += this._config.singleMoveDistance;
  }

  downAction() {
    if (this.isClawRunning) return;
    this._startPlay();
  }
}
