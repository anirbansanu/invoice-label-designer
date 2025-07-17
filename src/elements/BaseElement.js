import React from 'react';

class BaseElement {
  constructor(props) {
    this.id = props.id || this.generateId();
    this.type = props.type || 'base';
    this.x = props.x || 0;
    this.y = props.y || 0;
    this.width = props.width || 100;
    this.height = props.height || 100;
    this.rotation = props.rotation || 0;
    this.opacity = props.opacity || 1;
    this.visible = props.visible !== false;
    this.locked = props.locked || false;
    this.zIndex = props.zIndex || 0;
  }

  generateId() {
    return `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  isPointInside(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }

  move(deltaX, deltaY) {
    this.x += deltaX;
    this.y += deltaY;
  }

  resize(width, height) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
  }

  rotate(angle) {
    this.rotation = angle;
  }

  setOpacity(opacity) {
    this.opacity = Math.max(0, Math.min(1, opacity));
  }

  setVisible(visible) {
    this.visible = visible;
  }

  setLocked(locked) {
    this.locked = locked;
  }

  clone() {
    return new this.constructor({
      ...this,
      id: this.generateId(),
      x: this.x + 20,
      y: this.y + 20
    });
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      opacity: this.opacity,
      visible: this.visible,
      locked: this.locked,
      zIndex: this.zIndex
    };
  }

  static fromJSON(data) {
    return new this(data);
  }
}

export default BaseElement;
