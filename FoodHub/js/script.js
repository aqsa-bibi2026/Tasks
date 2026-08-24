// ===============================
// MOBILE MENU
// ===============================

const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");


if(hamburger){

hamburger.onclick = ()=>{

navLinks.classList.toggle("active");

}

}





// ===============================
// DARK MODE
// ===============================


const themeBtn =
document.getElementById("themeBtn");



if(themeBtn){

themeBtn.onclick=()=>{


document.body.classList.toggle("dark");


if(document.body.classList.contains("dark")){

localStorage.setItem(
"theme",
"dark"
);

themeBtn.innerHTML="☀️";

}

else{

localStorage.setItem(
"theme",
"light"
);

themeBtn.innerHTML="🌙";

}


}


}



if(localStorage.getItem("theme")=="dark"){

document.body.classList.add("dark");

}





// ===============================
// CART SYSTEM
// ===============================


let cart =
JSON.parse(localStorage.getItem("foodCart"))
|| [];




function saveCart(){

localStorage.setItem(
"foodCart",
JSON.stringify(cart)
);

}





function addToCart(product){


let item =
cart.find(
x=>x.name===product.name
);



if(item){

item.quantity++;

}

else{


cart.push({

name:product.name,

price:product.price,

quantity:1

});


}


saveCart();


alert(
product.name+" added to cart 🛒"
);


}







function removeFromCart(index){


cart.splice(index,1);


saveCart();


displayCart();


}




function clearCart(){


cart=[];


saveCart();


displayCart();


}






function increaseQty(index){


cart[index].quantity++;


saveCart();


displayCart();


}





function decreaseQty(index){


if(cart[index].quantity>1){

cart[index].quantity--;

}

else{

cart.splice(index,1);

}


saveCart();


displayCart();


}








function displayCart(){


let box =
document.getElementById("cartItems");


if(!box)return;



box.innerHTML="";


let subtotal=0;



cart.forEach((item,index)=>{


subtotal +=
item.price*item.quantity;



box.innerHTML += `


<div class="cart-item">


<div>

<h3>${item.name}</h3>

<p>
$${item.price}
</p>

</div>


<div>


<button onclick="decreaseQty(${index})">
-
</button>


${item.quantity}


<button onclick="increaseQty(${index})">
+
</button>



<button onclick="removeFromCart(${index})">
Remove
</button>


</div>


</div>


`;



});



if(document.getElementById("subtotal"))

document.getElementById("subtotal").innerHTML=subtotal;



if(document.getElementById("total"))

document.getElementById("total").innerHTML=subtotal;



}






window.onload=()=>{

displayCart();

};







// ===============================
// SEARCH FOOD
// ===============================


const search =
document.getElementById("searchFood");



if(search){


search.addEventListener(
"keyup",
()=>{


let value =
search.value.toLowerCase();



document
.querySelectorAll(".food-card")
.forEach(card=>{


let name =
card.querySelector("h3")
.innerText
.toLowerCase();



card.style.display =
name.includes(value)
?
"block"
:
"none";



});


});


}








// ===============================
// CATEGORY FILTER
// ===============================


function filterFood(category){


document
.querySelectorAll(".food-card")
.forEach(card=>{


if(
category=="All"
||
card.dataset.category==category
){

card.style.display="block";

}

else{

card.style.display="none";

}


});


}








// ===============================
// RESERVATION VALIDATION
// ===============================


const reservationForm =
document.getElementById("reservationForm");



if(reservationForm){


reservationForm.addEventListener(
"submit",
(e)=>{


e.preventDefault();



let name =
document.getElementById("customerName").value;



let email =
document.getElementById("customerEmail").value;



if(name=="" || email==""){


alert(
"Please fill required fields"
);


return;


}



document.getElementById(
"reservationMessage"
).innerHTML =
"✅ Reservation Confirmed! We will contact you soon.";



reservationForm.reset();


});


}








// ===============================
// CONTACT VALIDATION
// ===============================


const contactForm =
document.getElementById("contactForm");



if(contactForm){


contactForm.addEventListener(
"submit",
(e)=>{


e.preventDefault();



document.getElementById(
"contactResult"
).innerHTML =
"✅ Message Sent Successfully!";



contactForm.reset();



});


}







// ===============================
// SCROLL TOP
// ===============================


window.addEventListener(
"scroll",
()=>{


if(window.scrollY>400){

console.log(
"Scroll button visible"
);

}


});
// ===============================
// COUNTDOWN TIMER
// ===============================


let offerDate =
new Date().getTime()
+
(3*24*60*60*1000);



setInterval(()=>{


let now =
new Date().getTime();



let distance =
offerDate-now;



let days =
Math.floor(
distance/(1000*60*60*24)
);



let hours =
Math.floor(
(distance%(1000*60*60*24))
/(1000*60*60)
);



let minutes =
Math.floor(
(distance%(1000*60*60))
/(1000*60)
);



let seconds =
Math.floor(
(distance%(1000*60))
/1000
);



if(document.getElementById("days")){


document.getElementById("days").innerHTML=days;

document.getElementById("hours").innerHTML=hours;

document.getElementById("minutes").innerHTML=minutes;

document.getElementById("seconds").innerHTML=seconds;


}


},1000);