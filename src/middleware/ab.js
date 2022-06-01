const complate = async function(a,b){
    return a+b
}
console.log(complate(2,3))

complate(2,3)
.then(data => console.log(data))

let a = async () => console.log(await complate(2,3))
 a()