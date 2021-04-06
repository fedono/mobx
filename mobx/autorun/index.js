const {reactive, effect} = window.autorun;

let originPerson = {
    name: 'yuanxin',
    age: 22
};

// 使用 reactive 来将对象的属性进行绑定监听
let person = reactive(originPerson)

effect(() => {
    console.log('effect:', person.name);
});

const changeName = () => {
    person.name = 'xiaowa'
}

// 通过执行函数来改变属性，来检测 effect 中的函数是否执行
changeName();
