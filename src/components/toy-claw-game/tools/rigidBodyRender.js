/*
 * @Description: 渲染刚体
 * @Author: zhoulx
 * @Date: 2024-03-02 21:22:07
 * @LastEditors: zhoulx
 * @LastEditTime: 2024-03-04 19:17:08
 */
import { PixiApp } from "./pixiApp.js";
import { IMG_SIZE } from "./consts.js";
// import {RigidBody} from "./rigidBody.js";
import * as Matter from 'matter-js';
export class RigidBodyRender {
  static instance;
  static getInstance() {
    if (!this.instance) {
      this.instance = new RigidBodyRender();
    }
    return this.instance;
  }
  set debugMode(v){
    if(v){
      this.showDebugRender();
    }
  }
  constructor() {
    RigidBodyRender.instance = this;
    // 创建引擎
    this.engine = Matter.Engine.create();
    this.rigidBodies = [];
    // 创建地板
    const groundWidth = IMG_SIZE.bgImg.width - 300;
    this.groundLeft = Matter.Bodies.rectangle(
      groundWidth / 4,
      IMG_SIZE.bgImg.height,
      groundWidth / 2,
      80,
      {
        isStatic: true,
        label: "groundLeft",
      }
    );
    this.groundRight = Matter.Bodies.rectangle(
      groundWidth * 3 / 4 + 300,
      IMG_SIZE.bgImg.height,
      groundWidth / 2,
      80,
      {
        isStatic: true,
        label: "groundRight",
      }
    );
    this.leftWall = Matter.Bodies.rectangle(
      0,
      IMG_SIZE.bgImg.height / 2,
      100,
      IMG_SIZE.bgImg.height,
      {
        isStatic: true,
        label: "leftWall",
      }
    );
    this.rightWall = Matter.Bodies.rectangle(
      IMG_SIZE.bgImg.width,
      IMG_SIZE.bgImg.height / 2,
      100,
      IMG_SIZE.bgImg.height,
      {
        isStatic: true,
        label: "rightWall",
      }
    );
    this.holeLeft = Matter.Bodies.rectangle(
      IMG_SIZE.bgImg.width / 2 - 150,
      IMG_SIZE.bgImg.height - 100,
      50,
      300,
      {
        isStatic: true,
        label: "holeLeft",
      }
    );
    this.holeRight = Matter.Bodies.rectangle(
      IMG_SIZE.bgImg.width / 2 + 210,
      IMG_SIZE.bgImg.height - 100,
      50,
      300,
      {
        isStatic: true,
        label: "holeLeft",
      }
    );
    Matter.World.add(this.engine.world, [this.groundLeft, this.groundRight, this.leftWall, this.rightWall, this.holeLeft, this.holeRight]);
    this.bodyOutsideWorld = null // 超出舞台的物体回调函数
  }

  /**
   * @description: 用于开发查看刚体的数据
   * @return {*}
   */
  showDebugRender() {
    const config = {
      width: IMG_SIZE.bgImg.width,
      height: IMG_SIZE.bgImg.height,
      hasBounds: true,
      showVelocity: true,
      showAngleIndicator: true,
    };

    // 创建渲染器，并将引擎连接到画布上
    const render = Matter.Render.create({
      element: document.getElementById('stage'),
      engine: this.engine,
      options: config,
    });
    console.log('%c render.bounds', 'color: red', render.bounds, );

    // // 平移边界
    // Matter.Bounds.translate(render.bounds, {
    //   x: -119,
    //   y: -300,
    // });
    console.log('%c render.bounds', 'color: red', render.bounds, );
    render.canvas.style.width = `${IMG_SIZE.bgImg.width}px`;
    render.canvas.style.position = "fixed";
    render.canvas.style.top = "0";
    render.canvas.style.left = "0";
    render.canvas.style.zIndex = "9999";
    render.canvas.style.pointerEvents = "none";
    setTimeout(() => {
      render.canvas.style.background = "rgba(0,0,0,0)";
    }, 100);

    Matter.Render.run(render);
  }

  /**
   * @description: 
   * @return {*}
   */
  run() {
    Matter.Engine.run(this.engine);
    PixiApp.ticker.add((delta) => {
      this.runLoop(delta)
    })
  }
  
  /**
   * @description: 
   * @return {*}
   */
  clearEngine(){
    Matter.Engine.clear(this.engine);
  }

  /**
   * @description: 
   * @param {Matter.Body | Matter.Constraint | Matter.Composite} body
   * @return {*}
   */
  addBody(body){
    Matter.World.add(this.engine.world, body);
  }

  /**
   * @description: 
   * @param {Matter.Body} body
   * @return {*}
   */
  removeBody(body){
    Matter.World.remove(this.engine.world, body);
  }

  /**
   * @description: 
   * @param {RigidBody} rigidBody
   * @return {*}
   */
  addRigidBody(rigidBody) {
    this.rigidBodies.push(rigidBody);
    this.addBody(rigidBody.body);
  }

  /**
   * @description: 
   * @param {RigidBody} rigidBody
   * @return {*}
   */
  removeRigidBody(rigidBody) {
    this.rigidBodies.splice(this.rigidBodies.indexOf(rigidBody), 1);
    this.removeBody(rigidBody.body);
  }

  /**
   * @description: 
   * @param {*} delta
   * @return {*}
   */
  runLoop(){
    // console.log('%c delta', 'color: red', delta, );
    this.rigidBodies.forEach((item) => {
      item.loopFunction(this.bodyOutsideWorld);
    });
  }
}
