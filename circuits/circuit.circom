pragma circom 2.0.0;

include "mimcsponge.circom";
include "comparators.circom";

//Euclid's Algorithm for finding GCD
function GCD (x,y) {
    var n1;
    var n2;
    n1 = x;
    n2 = y;
    while (n1 != n2) {
        if (n1 > n2){
            n1 = n1 - n2;
        } else {
            n2 = n2 - n1;
        }
    }
    return n2;
}

// returns 1 if prime.
function isPrime(n) {
    if (n == 1) {
        return 0;
    }
    for (var i=2; i<n; i++){
        if (n % i == 0){
            return 0;
        }
    }
    return 1;
}



template Main() {
    signal input x;
    signal input y;

    // r1 = 64, r2 = 32.
    signal input r1;
    signal input r2;

    signal output h;

    /* check x^2 + y^2 < r1^2 */
    component comp64 = LessThan(64);
    signal xSq;
    signal ySq;
    signal r1Sq;
    xSq <== x * x;
    ySq <== y * y;
    r1Sq <== r1 * r1;
    comp64.in[0] <== xSq + ySq;
    comp64.in[1] <== r1Sq;
    comp64.out === 1;

    /* check x^2 + y^2 < r2^2 */
    component comp32 = LessThan(64);
    signal r2Sq;
    r2Sq <== r2 * r2;
    comp32.in[0] <== xSq + ySq;
    comp32.in[1] <== r2Sq;
    comp32.out === 0;

    /* check GCD(x,y) > 1 && not GCD(x,y) not prime */
    signal n1;
    signal n2;
    n1 <== x;
    n2 <== y;
    
    var gcd = GCD(n1,n2);
    signal GCD;

    GCD <-- gcd; 
    signal isPrime; 
    isPrime <-- isPrime(GCD);
    isPrime === 0;

    component comp1 = LessThan(64);
    comp1.in[0] <== 1;
    comp1.in[1] <== GCD;
    comp1.out === 1;


    /* check MiMCSponge(x,y) = pub */
    component mimc = MiMCSponge(2, 220, 1);

    mimc.ins[0] <== x;
    mimc.ins[1] <== y;
    mimc.k <== 0;

    h <== mimc.outs[0];
}

component main = Main();