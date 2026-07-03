const header = document.getElementById("site-header");
const menuToggle = document.getElementById("menu-toggle");
const siteNav = document.getElementById("site-nav");
const bookingForm = document.getElementById("booking-form");
const bookingMessage = document.getElementById("booking-message");

function setHeaderState(){
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive:true });

if (menuToggle && siteNav){
    menuToggle.addEventListener("click", () => {
        const isOpen = siteNav.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
        menuToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });

    siteNav.addEventListener("click", (event) => {
        if (event.target.closest("a")){
            siteNav.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open menu");
            menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
    });
}

if (bookingForm && bookingMessage){
    const dateInput = bookingForm.querySelector("#date");

    if (dateInput){
        const today = new Date();
        const isoDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0];
        dateInput.min = isoDate;
    }

    bookingForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(bookingForm);
        const request = Object.fromEntries(formData.entries());

        if (!bookingForm.checkValidity()){
            bookingMessage.textContent = "Please fill in the required appointment details.";
            bookingMessage.classList.remove("success");
            bookingForm.reportValidity();
            return;
        }

        const savedRequests = JSON.parse(localStorage.getItem("nailLuxBookings") || "[]");
        savedRequests.push({
            ...request,
            createdAt:new Date().toISOString()
        });
        localStorage.setItem("nailLuxBookings", JSON.stringify(savedRequests));

        bookingMessage.textContent = "Thank you. Your appointment request has been saved and is ready for confirmation.";
        bookingMessage.classList.add("success");
        bookingForm.reset();
    });
}
