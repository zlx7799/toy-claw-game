// import { PixiApp } from "./pixiApp.js";
import { Machine } from "./machine.js";
import { RigidBody } from "./rigidBody.js";
import { RigidBodyRender } from "./rigidBodyRender.js";
import { IMG_SIZE, TOY_CLAW_CONFIG } from "./consts.js";
import { Assets, Sprite, Graphics } from "pixi.js";
import { PixiApp } from "./pixiApp.js";
import * as Matter from "matter-js";

export class ToyClaw {
  constructor(config = TOY_CLAW_CONFIG) {
    this.isClawRunning = false;
    this._claw = null;
    this._machine = new Machine();
    this._resources = null;
    this._rigidBodyRender = null;
    this.randomFun = null; // 随机数方法
    this._shadowList = []; // 小球阴影
    // 不填的字段都会有默认值
    this._config = { ...TOY_CLAW_CONFIG, ...config };
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
    let urls = this._config.balls.map((item) => item.imgUrl);
    const unique = (e) => Array.from(new Set(e));
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

    await this._claw.tweenTo(
      { y: IMG_SIZE.rodOffset.y },
      65000 / this._config.clawDownSpeed
    );
    await this._claw.grabTo(10);
    await this._claw.grabTo(50);

    this.catchedBall = this._rigidBodyRender.rigidBodies.find((item) => {
      // 难度可以在此调整 爪子抓时的容错
      const clawWidth = this._claw.claw.width;
      return (
        Math.abs(
          item.sprite.position.x -
            (this._claw.positionX +
              IMG_SIZE.bgImg.width / 2 +
              IMG_SIZE.holeAndRodOffset)
        ) <=
        (clawWidth - (clawWidth * this._config.catchDifficulty) / 100) / 2
      );
    });

    if (this.catchedBall) {
      console.log("%c this.catchedBall", "color: red", this.catchedBall);
      this._config.onCatch && this._config.onCatch(this.catchedBall.id);
    } else {
      this._config.onMiss && this._config.onMiss();
    }

    await this._claw.tweenTo({ y: 0 }, 65000 / this._config.clawUpSpeed);
    await this._claw.tweenTo({ x: 0 }, 65000 / this._config.clawBackSpeed);
    this.isClawRunning = false;
    this.catchedBall = null;
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
   * @param {*} startX
   * @param {*} ballCount 三个球
   * @return {*}
   */
  addBalls(startX, ballCount = 3) {
    this.randomFun =
      this.randomFun ||
      this.randomInProbability(
        this._config.balls.map((item) => item.weight || 1)
      );

    let balls = [];
    for (let i = 0; i < ballCount; i++) {
      let index = Math.floor(this.randomFun() * this._config.balls.length);

      // 避免同组有重复
      while (balls.length > 0 && balls.includes(this._config.balls[index])) {
        index = Math.floor(this.randomFun() * this._config.balls.length);
      }
      balls.push(this._config.balls[index]);
    }

    balls.forEach((item, index) => {
      const texture = this._getTexture(item.imgUrl);
      const ballSprite = new Sprite(texture);

      ballSprite.x = startX + item.radius * 2 * index;
      ballSprite.y = 800;

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
          IMG_SIZE.ballImg.width / 2,
          {
            restitution: item.restitution || 0.8, // 设置弹力
            mass: item.mass || 10, // 设置重力
          }
        );
      }

      body.frictionStatic = 1;
      body.friction = 1;

      const rigidBody = RigidBody.create(ballSprite, body);
      console.log("%c id", "color: red", item.id);
      rigidBody.id = item.id;
      rigidBody.probability = item.probability || 0;
    });
  }

  async init() {
    this._resources = await this._loadBallTexture();
    await this._machine.init();
    this._claw = this._machine.claw;
    this._setup();
  }

  _setup() {
    this._initPhysicsEngine();
    this._initBalls();
    PixiApp.ticker.add(() => {
      this._gameLoop();
    });
  }

  _initPhysicsEngine() {
    this._rigidBodyRender = RigidBodyRender.getInstance(this._config.onSuccess);
    this._rigidBodyRender.run();
    this._rigidBodyRender.bodyOutsideWorld = this._config.onSuccess;
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
        const { width, height } = this._calculateShadowSize(Math.abs(y - 1040), IMG_SIZE.ballImg.width / 4 )
        if(!width || !height){ return;}
        let ellipse = new Graphics();
        ellipse.beginFill(0x000000, 0.2);
        ellipse.drawEllipse(x, 1040, width, height);
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
    const value = 300
    if (height > value ){
      height = 300
    }
    // 假设光源在球的正上方
    let shadowHeight = radius *  ((value - height) / value); // 椭圆阴影在垂直方向的高度
    let shadowWidth = 2 * shadowHeight; // 椭圆阴影在水平方向的宽度，即球的直径

    return { width: shadowWidth, height: shadowHeight };
  }

  _gameLoop() {
    this._drawBallShadow();
    // 同步抓起的球
    if (this.catchedBall) {
      const x =
        this._claw.positionX +
        IMG_SIZE.bgImg.width / 2 +
        IMG_SIZE.holeAndRodOffset;
      if (this._dropItem(this.catchedBall.probability)) {
        this._claw.grabTo(120)
        this.catchedBall = null;
        return;
      }
      this.catchedBall.setPosition(
        // this.catchedBall.body.position.x,
        x,
        this._claw.positionY + 400
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

  _initBalls() {
    this.addBalls(102);
    this.addBalls(1380);
  }

  leftAction() {
    if (this.isClawRunning) return;
    this._claw.positionX -= this._config.singleMoveDistance;
  }

  rightAction() {
    if (this.isClawRunning) return;
    this._claw.positionX += this._config.singleMoveDistance;
  }

  downAction() {
    if (this.isClawRunning) return;
    this._startPlay();
  }
}
