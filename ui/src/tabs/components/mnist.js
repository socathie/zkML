const mnist = require("easy-mnist").mnist;

export default function MNIST() {
    console.log(mnist[0].labelS);
    console.log(mnist[0].image);
}
