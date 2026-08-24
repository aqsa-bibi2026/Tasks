
// Mobile menu
const menuBtn = document.querySelector(".hamburger");
const nav = document.querySelector("nav");

if(menuBtn){
 menuBtn.onclick = ()=>{
   nav.classList.toggle("active");
 };
}

// Sticky navbar shadow
window.addEventListener("scroll",()=>{
 const header=document.querySelector("header");
 if(header){
   header.style.boxShadow = window.scrollY>50 ? "0 10px 25px #0005" : "none";
 }
});

// Booking validation
const bookingForm=document.getElementById("bookingForm");

if(bookingForm){
 bookingForm.addEventListener("submit",(e)=>{
   e.preventDefault();

   let email=bookingForm.querySelector("input[type=email]");
   let dates=bookingForm.querySelectorAll("input[type=date]");

   if(email && !email.value.includes("@")){
      alert("Please enter valid email");
      return;
   }

   if(dates.length===2 && new Date(dates[1].value)<=new Date(dates[0].value)){
      alert("Checkout date must be after check-in date");
      return;
   }

   alert("Your booking has been confirmed successfully!");
   bookingForm.reset();
 });
}

// Room search
function searchRoom(){
 alert("Luxury rooms available for your selected dates.");
}

// Scroll top button
let topBtn=document.createElement("button");
topBtn.innerHTML="↑";
topBtn.className="top-btn";
document.body.appendChild(topBtn);

topBtn.onclick=()=>window.scrollTo({
 top:0,
 behavior:"smooth"
});
