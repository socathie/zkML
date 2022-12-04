pragma circom 2.0.0;

include "../../node_modules/circomlib-ml/circuits/crypto/encrypt.circom";
include "../../node_modules/circomlib-ml/circuits/crypto/ecdh.circom";

template encrypted_mnist_latest() {
    signal input conv2d_1_weights[3][3][1][4];
    signal input conv2d_1_bias[4];
    signal input bn_1_a[4];
    signal input bn_1_b[4];
    signal input conv2d_2_weights[3][3][4][8];
    signal input conv2d_2_bias[8];
    signal input bn_2_a[8];
    signal input bn_2_b[8];
    signal input dense_weights[200][10];
    signal input dense_bias[10];

    signal input private_key;
    signal input public_key[2];

    component ecdh = Ecdh();

    ecdh.private_key <== private_key;
    ecdh.public_key[0] <== public_key[0];
    ecdh.public_key[1] <== public_key[1];

    signal output message[3*3*1*4+4+4+4+3*3*4*8+8+8+8+200*10+10+1];

    component enc = EncryptBits(3*3*1*4+4+4+4+3*3*4*8+8+8+8+200*10+10);
    enc.shared_key <== ecdh.shared_key;

    var idx = 0;

    for (var i=0; i<3; i++) {
        for (var j=0; j<3; j++) {
            for (var m=0; m<4; m++) {
                enc.plaintext[idx] <== conv2d_1_weights[i][j][0][m];
                idx++;
            }
        }
    }
    
    for (var m=0; m<4; m++) {
        enc.plaintext[idx] <== conv2d_1_bias[m];
        idx++;
    }

    for (var k=0; k<4; k++) {
        enc.plaintext[idx] <== bn_1_a[k];
        idx++;
    }

    for (var k=0; k<4; k++) {
        enc.plaintext[idx] <== bn_1_b[k];
        idx++;
    }
    for (var i=0; i<3; i++) {
        for (var j=0; j<3; j++) {
            for (var k=0; k<4; k++) {   
                for (var m=0; m<8; m++) {
                    enc.plaintext[idx] <== conv2d_2_weights[i][j][k][m];
                    idx++;
                }
            }
        }
    }

    for (var m=0; m<8; m++) {
        enc.plaintext[idx] <== conv2d_2_bias[m];
        idx++;
    }

    for (var k=0; k<8; k++) {
        enc.plaintext[idx] <== bn_2_a[k];
        idx++;
    }

    for (var k=0; k<8; k++) {
        enc.plaintext[idx] <== bn_2_b[k];
        idx++;
    }

    for (var i=0; i<200; i++) {
        for (var j=0; j<10; j++) {
            enc.plaintext[idx] <== dense_weights[i][j];
            idx++;
        }
    }

    for (var i=0; i<10; i++) {
        enc.plaintext[idx] <== dense_bias[i];
        idx++;
    }

    for (var i=0; i<3*3*1*4+4+4+4+3*3*4*8+8+8+8+200*10+10+1; i++) {
        message[i] <== enc.out[i];
    }
}

component main = encrypted_mnist_latest();