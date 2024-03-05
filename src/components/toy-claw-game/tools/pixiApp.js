/*
 * @Description: 
 * @Author: zhoulx
 * @Date: 2024-03-03 12:35:43
 * @LastEditors: zhoulx
 * @LastEditTime: 2024-03-05 17:22:20
 */
import { Application } from "pixi.js";
export const PixiApp = new Application({
  width: 1920,
  height: 1080,
  antialias: true,
  transparent: false,
  resolution: window.devicePixelRatio,
  autoDensity: true
});
