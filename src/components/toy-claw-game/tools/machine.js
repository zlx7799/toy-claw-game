/*
 * @Description: 
 * @Author: zhoulx
 * @Date: 2024-03-03 12:35:43
 * @LastEditors: zhoulx
 * @LastEditTime: 2024-03-04 16:24:34
 */
import { Claw } from "./claw.js";
import { PixiApp } from "./pixiApp.js";
import { MACHINE_TEXTURE_DATA } from "./consts.js";
import { Container, Sprite, Assets } from "pixi.js";

export class Machine {
  constructor() {
    this._resources = null; // 预加载图片纹理
    this.claw = null; // 爪子
    this.machineBox = new Container(); // 娃娃机内部区域 
  }
  async init(){
    // console.log('%c PIXI', 'color: red', PIXI, );
    this._resources = await this._loadTexture()
    this._renderBg()
    this._renderMachineBox();
    await this._renderClaw();
    this._renderFrontBg()
  }
  /**
   * @description: 加载所需纹理数据
   * @return {*}
   */
  async _loadTexture(){
    let urls = []
    for (const key in MACHINE_TEXTURE_DATA){
      if(Object.prototype.hasOwnProperty.call(MACHINE_TEXTURE_DATA, key)){
        const url = MACHINE_TEXTURE_DATA[key];
        urls.push(url);
      }
    }
    return await Assets.load(urls)
  }

  /**
   * @description:  获取已经加载好的材质
   * @param {*} name 材质名称
   * @return {*}
   */
  _getTexture(name){
    const {_resources} = this;
    return _resources[name]
  }

  /**
   * @description: 渲染娃娃机背景
   * @return {*}
   */
  _renderBg(){
    const texture = this._getTexture(MACHINE_TEXTURE_DATA.machineBg);
    const bg = new Sprite(texture);
    bg.width = PixiApp.renderer.width;
    bg.height = PixiApp.renderer.height;
    PixiApp.stage.addChild(bg);
  }

  /**
   * @description: 渲染娃娃机前景
   * @return {*}
   */
  _renderFrontBg(){
    const texture = this._getTexture(MACHINE_TEXTURE_DATA.machineFront);
    const bg = new Sprite(texture);
    bg.width = PixiApp.renderer.width;
    bg.height = PixiApp.renderer.height;
    PixiApp.stage.addChild(bg);
  }

  /**
   * @description: 渲染娃娃机内部区域
   * @return {*}
   */
  _renderMachineBox(){
    this.machineBox.position.set(0, 0);
    PixiApp.stage.addChild(this.machineBox)
  }

  /**
   * @description: 渲染爪子
   * @return {*}
   */
  async _renderClaw(){
    const claw = await Claw.create();
    this.claw = claw;
    this.machineBox.addChild(claw.clawContainer) 
  }
}