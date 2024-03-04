/*
 * @Description: 自建刚体类
 * @Author: zhoulx
 * @Date: 2024-03-02 21:25:36
 * @LastEditors: zhoulx
 * @LastEditTime: 2024-03-04 19:28:22
 */
import { RigidBodyRender } from "./rigidBodyRender.js";
import * as Matter from 'matter-js';
import { IMG_SIZE } from "./consts.js";
export class RigidBody {
  constructor(sprite, body, options) {
    console.log('%c options', 'color: red', options, );
    let _body = body;
    if (!body){
      _body = Matter.Bodies.rectangle(
        sprite.x,
        sprite.y,
        sprite.texture.width,
        sprite.texture.height,
      );
    }
    this.body = _body;
    this.sprite = sprite;
    this.id = '';
    this.probability = ''
    sprite.anchor.x = 0.52;
    sprite.anchor.y = 0.62;
    this._rigidBody = null;
  }

  static create(sprite, body, options){
    const rigidBody = new RigidBody(sprite, body, options || {});
    rigidBody._rigidBody = rigidBody;
    const render = RigidBodyRender.getInstance();
    render.addRigidBody(rigidBody);
    return rigidBody;
  }

  setPosition(x, y){
    Matter.Body.setPosition(this.body, {x, y});
    Matter.Body.setVelocity(this.body, {x: 0, y: 0});
  }

  loopFunction(cb) {
    this.sprite.position.set(this.body.position.x, this.body.position.y);
    this.sprite.rotation = this.body.angle;
    // console.log('%c this.body.position.y', 'color: red', cb, );
    if (typeof cb === 'function' && this.body.position.y > IMG_SIZE.bgImg.height) {
      cb(this.id);
      const render = RigidBodyRender.getInstance();
      // console.log('%c render', 'color: red', render, );
      render.removeRigidBody(this._rigidBody);
    }
  }
}