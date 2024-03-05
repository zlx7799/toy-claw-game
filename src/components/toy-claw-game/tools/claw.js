import { CLAW_TEXTURE_DATA } from "./consts.js";
import { PixiApp } from "./pixiApp.js";
import { Container, Sprite, Assets, Graphics} from "pixi.js";
// import * as decomp from "poly-decomp";
// import * as Matter from "matter-js";

export class Claw {
  constructor(CONFIG_SIZE) {
    this.CONFIG_SIZE = CONFIG_SIZE;
    this._resources = null; // 预加载图片纹理
    this.clawContainer = new Container(); // 爪子杆部分
    this.clawContainer.sortableChildren = true;
    this.clawContainer.zIndex = 4
    this.claw = new Container(); // 爪子容器
    this.clawContainer.addChild(this.claw); // 将爪子添加到爪子杆中
    this.clawBody = null;
    // this._rigidBodyRender = RigidBodyRender.getInstance();
    // 爪子的爪子的部分
    this.judgePoint = null;
    this._leftClaw = null;
    this._rightClaw = null;
    this._leftClawBody = null;
    this._clawRodBody = null;
    this._rod = null;
    // percent/second
    this.speed = 150;
    this._grabPercent = 0;
    /** 是否启用物理效果的爪子 */
    this.isPhySicsClaw = false;
  }
  get positionX() {
    return this.clawContainer.position.x;
  }
  set positionX(value) {
    this.clawContainer.position.x = value;
  }
  get positionY() {
    return this.clawContainer.position.y;
  }
  set positionY(value) {
    this.clawContainer.position.y = value;
  }
  static async create(CONFIG_SIZE) {
    const claw = new Claw(CONFIG_SIZE);
    await claw.init();
    return claw;
  }

  async init() {
    this._resources = await this._loadTexture();
    this._renderClawRod();
    this._renderLeftClaw();
    this._renderRightClaw();
    this._renderJudgePoint();
    this.setGrabPercent(120);
    // this.isPhySicsClaw && this._buildClawBody();
  }
  
  /**
   * @description: 控制爪子抓取
   * @param {*} percent 0 完全打开, 100 完全抓紧
   * @return {*}
   */
  grabTo(percent) {
    const fpsTime = 1000 / 60;
    return new Promise((resolve) => {
      const ticker = (delta) => {
        const offset = this._grabPercent - percent;
        const diff = (this.speed / 1000) * (fpsTime + delta);
        const target =
          offset > 0 ? this._grabPercent - diff : this._grabPercent + diff;

        this.setGrabPercent(target);

        if (Math.abs(this._grabPercent - percent) <= diff) {
          this.setGrabPercent(percent);
          PixiApp.ticker.remove(ticker);
          resolve();
        }
      };

      PixiApp.ticker.add(ticker);
    });
  }

  /**
   * 将爪子移动到指定位置
   * @param position 位置
   * @param time 花费的时间 ms
   * @param cb 移动过程的回调函数
   */
  tweenTo(position, time = 2000, cb) {
    const x = position.x !== undefined ? position.x : this.positionX;
    const y = position.y !== undefined ? position.y : this.positionY;
    const speedX = (((x - this.positionX) / time) * 1000) / 60;
    const speedY = (((y - this.positionY) / time) * 1000) / 60;

    return new Promise((resolve) => {
      const ticker = () => {
        this.positionX += speedX;
        this.positionY += speedY;
        cb && typeof cb == 'function' && cb(resolve, ticker)
        if (
          Math.abs(this.positionX - x) <= Math.abs(speedX) &&
          Math.abs(this.positionY - y) <= Math.abs(speedY)
        ) {
          this.positionX = x;
          this.positionY = y;
          PixiApp.ticker.remove(ticker);
          resolve();
        }
      };

      PixiApp.ticker.add(ticker);
    });
  }
  /**
   * @description: 绘制判定点
   * @return {*}
   */
  _renderJudgePoint(){
    const {CONFIG_SIZE} = this;
    let point = new Graphics();
    point.beginFill(0x000000, 0);
    point.drawCircle(CONFIG_SIZE.bgImg.width / 2 + CONFIG_SIZE.clawOffset.x, -CONFIG_SIZE.rodOffset.y + CONFIG_SIZE.clawRodImg.height - CONFIG_SIZE.clawOffset.y + CONFIG_SIZE.judgePointOffset, 1)
    point.endFill();
    this.judgePoint = point
    // toGlobal 方法 必须手动设置下位置 才会计算
    point.position.set(CONFIG_SIZE.bgImg.width / 2 + CONFIG_SIZE.clawOffset.x, -CONFIG_SIZE.rodOffset.y + CONFIG_SIZE.clawRodImg.height - CONFIG_SIZE.clawOffset.y + CONFIG_SIZE.judgePointOffset)
    this.claw.addChild(this.judgePoint)
  }
  /**
   * @description: 渲染左边爪子
   * @return {*}
   */
  _renderLeftClaw() {
    const {CONFIG_SIZE} = this;

    this._leftClaw = new Sprite(this._getTexture(CLAW_TEXTURE_DATA.leftClaw));
    this._leftClaw.width = CONFIG_SIZE.clawImg.width;
    this._leftClaw.height = CONFIG_SIZE.clawImg.height;
    this._leftClaw.position.set(
      CONFIG_SIZE.bgImg.width / 2 - CONFIG_SIZE.clawOffset.x + CONFIG_SIZE.holeAndRodOffset,
      -CONFIG_SIZE.rodOffset.y + CONFIG_SIZE.clawRodImg.height - CONFIG_SIZE.clawOffset.y
    );
    this._leftClaw.anchor.set(0.98, 0.02);
    this.claw.addChild(this._leftClaw);
  }

  /**
   * @description: 渲染右边爪子
   * @return {*}
   */
  _renderRightClaw() {
    const {CONFIG_SIZE} = this;
    this._rightClaw = new Sprite(this._getTexture(CLAW_TEXTURE_DATA.rightClaw));
    this._rightClaw.width = CONFIG_SIZE.clawImg.width;
    this._rightClaw.height = CONFIG_SIZE.clawImg.height
    this._rightClaw.position.set(
      CONFIG_SIZE.bgImg.width / 2 + CONFIG_SIZE.clawOffset.x + CONFIG_SIZE.holeAndRodOffset,
      -CONFIG_SIZE.rodOffset.y + CONFIG_SIZE.clawRodImg.height - CONFIG_SIZE.clawOffset.y
    );
    this._rightClaw.anchor.set(0.02, 0.02);
    this.claw.addChild(this._rightClaw);
  }

  /**
   * @description: 渲染杆
   * @return {*}
   */
  _renderClawRod() {
    const {CONFIG_SIZE} = this;
    this._rod = new Sprite(this._getTexture(CLAW_TEXTURE_DATA.suspenderRod));
    this._rod.width = CONFIG_SIZE.clawRodImg.width;
    this._rod.height = CONFIG_SIZE.clawRodImg.height
    this._rod.position.set(
      CONFIG_SIZE.bgImg.width / 2 - CONFIG_SIZE.clawRodImg.width / 2 + CONFIG_SIZE.holeAndRodOffset,
      -CONFIG_SIZE.rodOffset.y
    );
    this.clawContainer.addChild(this._rod);
  }

  /**
   * @description: 加载所需纹理数据
   * @return {*}
   */
  async _loadTexture() {
    let urls = [];
    for (const key in CLAW_TEXTURE_DATA) {
      if (Object.prototype.hasOwnProperty.call(CLAW_TEXTURE_DATA, key)) {
        const url = CLAW_TEXTURE_DATA[key];
        urls.push(url);
      }
    }
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
   * @description: 设置爪子抓紧的程度
   * @param {*} percent 抓紧的百分比 0:放松 120:抓紧
   * @return {*}
   */
  setGrabPercent(percent) {
    this._grabPercent = percent;

    // 幅度 -0.5 - 0.5
    const rotation = (percent - 50) / 100;

    if (this.isPhySicsClaw) {
      // if (this.clawBody) {
      //   const hasClawCollision = this._rigidBodyRender.engine.pairs.list.some(
      //     (item) => {
      //       return item.bodyA.label === "claw" || item.bodyB.label === "claw";
      //     }
      //   );

      //   if (hasClawCollision) {
      //     // this.clawPartLeft.torque = -0.1;
      //     // this.clawPartRight.torque = 0.1;
      //   }
      //   // Matter.Body.setAngle(this.clawPartLeft, -rotation);
      //   // Matter.Body.setAngle(this.clawPartRight, rotation);
      // }
    } else {
      this._leftClaw.rotation = -rotation;
      this._rightClaw.rotation = rotation;
    }
  }

  /**
   * @description: 构建爪子身体
   * @return {*}
   */
  /* _buildClawBody() {
    const x = CONFIG_SIZE.bgImg.width / 2 + 35;
    const y = CONFIG_SIZE.clawRodImg.height - 500 - 50;

    this.clawBody = Matter.Composite.create();
    this._clawRodBody = Matter.Bodies.rectangle(x, y, 110, 50, {
      isStatic: true,
      label: "clawRod",
    });
    const leftClawVertices = [
      { x: 0, y: 0 },
      { x: 30, y: 0 },
      { x: -10, y: 50 },
      { x: 0, y: 150 },
      { x: -10, y: 150 },
      { x: -30, y: 50 },
    ];

    const clawPartLeft = (this._leftClawBody = Matter.Bodies.fromVertices(
      x - 30,
      y + 80,
      leftClawVertices,
      {
        mass: 1,
        label: "claw",
      }
    ));

    const rightClawVertices = [
      { x: 0, y: 0 },
      { x: 30, y: 0 },
      { x: 60, y: 50 },
      { x: 30, y: 150 },
      { x: 40, y: 150 },
      { x: 40, y: 50 },
    ];

    const clawPartRight = (this._rightClawBody = Matter.Bodies.fromVertices(
      x + 30,
      y + 87,
      rightClawVertices,
      {
        mass: 1,
        label: "claw",
      }
    ));

    const topToClawLeft = Matter.Constraint.create({
      bodyA: clawPartLeft,
      bodyB: this._clawRodBody,
      pointA: {
        x: 15,
        y: -60,
      },
      pointB: {
        x: -30,
        y: 0,
      },
      stiffness: 0.6,
    });

    const topToClawRight = Matter.Constraint.create({
      bodyA: clawPartRight,
      bodyB: this._clawRodBody,
      pointA: {
        x: -17,
        y: -55,
      },
      pointB: {
        x: 30,
        y: 0,
      },
      stiffness: 0.6,
    });

    Matter.Composite.add(this.clawBody, clawPartLeft);
    Matter.Composite.add(this.clawBody, clawPartRight);
    Matter.Composite.add(this.clawBody, topToClawLeft);
    Matter.Composite.add(this.clawBody, topToClawRight);
    Matter.Composite.add(this.clawBody, this._clawRodBody);
    this._rigidBodyRender.addBody(this.clawBody);
    this._renderClaw();
  }

  _renderClaw() {
    PixiApp.ticker.add(() => {
      this._leftClaw.rotation = this._leftClawBody.angle - Math.PI / 6;
      this._rightClaw.rotation = this._rightClawBody.angle + Math.PI / 6;
      this._leftClaw.position.set(
        this._leftClawBody.position.x - 80,
        this._leftClawBody.position.y - 23
      );
      this._rightClaw.position.set(
        this._rightClawBody.position.x - 20,
        this._rightClawBody.position.y - 95
      );
    });
  } */
}
