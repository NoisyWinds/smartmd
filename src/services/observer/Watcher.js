import Dep from "./Dep";

let uid = 0;

Dep.target = null;
const targetStack = [];

export function pushTarget(target) {
  targetStack.push(target);
  Dep.target = target
}


export function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1]
}

export default class Watcher {
  constructor(obj, exp, cb) {
    this.obj = obj;
    this.exp = exp;
    this.cb = cb;
    this.id = ++uid;
    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();
    this.value = this.get();
  }

  update() {
    this.run();
  }

  run() {
    const value = this.get();
    if (value !== this.value) {
      const oldValue = this.value;
      this.value = value;
      this.cb.apply(this.obj, [value, oldValue]);
    }
  }

  get() {
    pushTarget(this);
    const value = this.obj[this.exp];
    popTarget();
    this.cleanupDeps();
    return value;
  }


  addDep(dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  cleanupDeps() {
    let i = this.deps.length;
    while (i--) {
      const dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0
  }
}
