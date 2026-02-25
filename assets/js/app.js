
//sticky header on scroll
function windowScroll() {
   const navbar = document.getElementById("sticky");
   if (navbar) {
       if (document.body.scrollTop >= 50 || document.documentElement.scrollTop >= 50) {
           navbar.classList.add("is-sticky");
       } else {
           navbar.classList.remove("is-sticky");
       }
   }
}

window.addEventListener("scroll", (ev) => {
   ev.preventDefault();
   windowScroll();
});

// 
/* CountDown */
// 

const newDate = new Date('sep 12 23 23:59:59').getTime()
const countdown = setInterval(() =>{
  
const date = new Date().getTime()
const diff = newDate - date

const hours =  Math.floor(diff % (1000 * 60 * 60 * 24) / (1000 * 60 * 60))
const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      document.querySelector(".seconds").innerHTML = seconds < 10 ? '0' + seconds : seconds
      document.querySelector(".minutes").innerHTML = minutes < 10 ? '0' + minutes :minutes
      document.querySelector(".hours").innerHTML = hours < 10 ? '0' + hours : hours

}, 1000)