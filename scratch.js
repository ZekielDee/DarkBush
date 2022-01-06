let gcd = (num1, num2) => {
  
    //Loop till both numbers are not equal
    while(num1 != num2){
      
      //check if num1 > num2
      if(num1 > num2){
        //Subtract num2 from num1
        num1 = num1 - num2;
      }else{
        //Subtract num1 from num2
        num2 = num2 - num1;
      }
    }
    
    return num2;
  }

  function isPrime(n) {
    if (n == 1) {
        return 1;
    }
    for (var i=2; i<n; i++){
        if (n % i == 0){
            return 0;
        }
    }
    return 1;
}

console.log(isPrime(8))