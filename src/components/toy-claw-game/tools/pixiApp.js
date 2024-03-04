/*
 * @Description: 
 * @Author: zhoulx
 * @Date: 2024-03-03 12:35:43
 * @LastEditors: zhoulx
 * @LastEditTime: 2024-03-03 13:02:51
 */
import { IMG_SIZE } from "./consts.js";
import { Application } from "pixi.js";
export const PixiApp = new Application({
  width: IMG_SIZE.bgImg.width,
  height: IMG_SIZE.bgImg.height,
  antialias: true,
  transparent: false,
  resolution: 1,
});
// const stage =  PixiApp.stage = new PIXI.display.Stage();
// stage.group.enableSort = true;
