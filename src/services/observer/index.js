import Dep from "./Dep";
import {def, isObject} from "../utils";


function defineReactive(obj, key, val) {
  const dep = new Dep();
  let property = Reflect.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) return;
  let getter = property && property.get;
  let setter = property && property.set;
  if ((!getter || setter) && arguments.length === 2) val = obj[key];
  let childOb = observe(val);
  Reflect.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      let value = getter ? Reflect.apply(getter, obj, []) : val;
      dep.depend();
      if (childOb) {
        childOb.dep.depend();
      }
      return value;
    },
    set(newVal) {
      let value = getter ? Reflect.apply(getter, obj, []) : val;
      if (newVal === value) return;
      if (getter && !setter) return;
      if (setter) {
        Reflect.apply(setter, obj, [newVal])
      } else {
        val = newVal;
      }
      dep.notify()
    }
  })
}

export default class Observer {
  constructor(value) {
    this.value = value;
    this.dep = new Dep();
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      observeArray(value)
    } else {
      walk(value)
    }
  }
}

function walk(value) {
  let keys = Object.keys(value);
  for (let i = 0; i < keys.length; i++) {
    defineReactive(value, keys[i])
  }
}

function observeArray(items) {
  for (let i = 0; i < items.length; i++) {
    observe(items[i])
  }
}

export function observe(value) {
  if (!isObject(value)) return false;
  return new Observer(value);
}



