(global => {

    // 使用 WeakMap 的可以将key存储为对象，而且在对象不再使用的时候，可以自动清除掉 value
    // 起到内存回收的作用
    const targetDepsMap = new WeakMap();
    let curEffect = () => {};

    const track = (target, key) => {

        let depsMap = targetDepsMap.get(target);
        if (!depsMap) {
            depsMap = new Map();
            targetDepsMap.set(target, depsMap);
        }

        let deps = depsMap.get(key);
        if (!deps) {
            deps = new Set();
            depsMap.set(key, deps);
        }

        deps.add(curEffect);
        console.log('targetDepsMap::', targetDepsMap);
    }

    const trigger = (target, key) => {

        const depsMap = targetDepsMap.get(target);
        if (depsMap) {
            const deps = depsMap.get(key);
            if (deps) {
                deps.forEach(effect => {
                    effect();
                })
            }
        }
    }

    const createReactiveObject= target => {
        return new Proxy(target, {
            get(target, key, receiver) {
                console.log('get happened')
                const res = Reflect.get(target, key);

                // 在每个对象的属性在获取的时候，添加当前的 effect 与当前的属性进行绑定
                // 即使当前的 effect 是个空函数
                track(target, key);

                return typeof res === 'object' ? reactive(res) : res;
            },

            set(target, key, value, receiver) {
                console.log('set happened');
                const res = Reflect.set(target, key, value);

                // 在设置对象属性的时候，将 get 进行绑定的 effect 执行
                trigger(target, key);

                return res;
            }
        })
    }

    const reactive = target => {
        return createReactiveObject(target);
    }

    // createEffect 其实就是直接执行 effect 的函数就可以
    const createEffect = (fn, options) => {
        const effect = () => {
            curEffect = effect;
            // 执行 fn 的时候，这时候就会调用对象的 get 方法，这时候将 curEffect 与当前对象的属性进行绑定
            let res = fn();
            // 执行完成 fn 的时候，将 curEffect 还原
            curEffect = () => {};
            return res;
        };

        effect.raw = fn;
        effect.options = options;

        return effect;
    }

    const effect = (fn, target) => {
        const effect = createEffect(fn, target);
        effect();
        return effect;
    };

    global.autorun = {
        reactive,
        effect
    }
})(window);
