// ======================================================
// JOGNIYA MOTORS - MAIN FRONTEND JAVASCRIPT
// ======================================================

console.log("Jogniya Motors website loaded successfully.");

const API_URL = "https://jogniya-motor.onrender.com";
const IMAGE_SERVER_URL = "https://jogniya-motor.onrender.com";
const showroomWhatsApp = "918949921172";


// ======================================================
// COMMON HELPERS
// ======================================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function formatPrice(price) {
    return "₹" + Number(price || 0).toLocaleString("en-IN");
}

function getBikeImage(image) {

    if (!image) {
        return "";
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
    }

    return IMAGE_SERVER_URL + (
        image.startsWith("/") ? image : "/" + image
    );
}

function openWhatsApp(message) {

    const url =
        "https://wa.me/" +
        showroomWhatsApp +
        "?text=" +
        encodeURIComponent(message);

    window.open(url, "_blank", "noopener");
}


// ======================================================
// WHATSAPP BUTTONS
// ======================================================

document.querySelectorAll(".whatsapp-float, .nav-whatsapp")
    .forEach(button => {

        button.addEventListener("click", function(event) {

            event.preventDefault();

            openWhatsApp(
                "Hello Jogniya Motors, I would like to know more about your bikes and services."
            );

        });

    });


// ======================================================
// LOAD BIKES FROM BACKEND
// ======================================================

async function fetchBikes() {

    const response = await fetch(`${API_URL}/api/bikes`);

    let result;

    try {
        result = await response.json();
    } catch {
        throw new Error("Invalid response from backend.");
    }

    if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to load bikes.");
    }

    if (!Array.isArray(result.data)) {
        throw new Error("Bike inventory response is not valid.");
    }

    return result.data;
}


// ======================================================
// BIKE AVAILABILITY
// ======================================================

function isBikeAvailable(bike) {

    const status = String(bike.status || "available").toLowerCase();

    const hasStock =
        bike.stock === undefined ||
        bike.stock === null ||
        Number(bike.stock) > 0;

    return status === "available" && hasStock;
}


// ======================================================
// NEW BIKES PAGE
// ======================================================

const bikeContainer = document.getElementById("bikeContainer");
const searchInput = document.getElementById("search");
const brandSelect = document.getElementById("brand");
const priceSelect = document.getElementById("price");

let allNewBikes = [];

function displayNewBikes(bikes) {

    if (!bikeContainer) return;

    bikeContainer.replaceChildren();

    if (bikes.length === 0) {
        bikeContainer.innerHTML =
            '<p class="inventory-message">No new bikes are currently available.</p>';
        return;
    }

    bikes.forEach(bike => {

        const imageURL = getBikeImage(bike.image);

        const card = document.createElement("div");
        card.className = "bike-card";

        const imageHTML = imageURL
            ? `<img src="${escapeHTML(imageURL)}"
                    alt="${escapeHTML(bike.name)}"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <span class="image-fallback" style="display:none;">Image unavailable</span>`
            : `<span class="image-fallback">Bike Image</span>`;

        card.innerHTML = `

            <div class="bike-image">
                ${imageHTML}
            </div>

            <div class="bike-info">

                <span class="bike-brand">
                    ${escapeHTML(bike.brand || "HERO")}
                </span>

                <h3>${escapeHTML(bike.name)}</h3>

                <p>
                    ${escapeHTML(bike.description || "Visit Jogniya Motors for more details.")}
                </p>

                <h4>${formatPrice(bike.price)}</h4>

                <p class="inventory-stock">
                    Available in showroom
                </p>

                <button
                    class="bike-button"
                    type="button"
                    data-bike-id="${escapeHTML(bike.id)}">

                    Enquire on WhatsApp

                </button>

            </div>
        `;

        bikeContainer.appendChild(card);

    });

}


// ======================================================
// NEW BIKE FILTERS
// ======================================================

function filterBikes() {

    if (!bikeContainer) return;

    const searchText =
        searchInput?.value.toLowerCase().trim() || "";

    const selectedBrand =
        brandSelect?.value || "all";

    const selectedPrice =
        priceSelect?.value || "all";

    const filtered = allNewBikes.filter(bike => {

        const name = String(bike.name || "").toLowerCase();
        const brand = String(bike.brand || "").toLowerCase();
        const price = Number(bike.price) || 0;

        const matchesSearch =
            name.includes(searchText) ||
            brand.includes(searchText);

        const matchesBrand =
            selectedBrand === "all" ||
            brand === selectedBrand.toLowerCase();

        let matchesPrice = true;

        if (selectedPrice !== "all") {

            const [min, max] = selectedPrice.split("-").map(Number);

            matchesPrice =
                price >= min && price <= max;
        }

        return matchesSearch && matchesBrand && matchesPrice;

    });

    displayNewBikes(filtered);

    const bikeCount = document.getElementById("bikeCount");

    if (bikeCount) {
        bikeCount.textContent = `Showing ${filtered.length} bikes`;
    }

    const noResults = document.getElementById("noResults");

    if (noResults) {
        noResults.style.display =
            filtered.length === 0 ? "block" : "none";
    }

}

function clearFilters() {

    if (searchInput) searchInput.value = "";

    if (brandSelect) brandSelect.value = "all";

    if (priceSelect) priceSelect.value = "all";

    filterBikes();

}

async function loadNewBikes() {

    if (!bikeContainer) return;

    const errorElement = document.getElementById("bikeError");

    try {

        const bikes = await fetchBikes();

        allNewBikes = bikes.filter(bike =>
            bike.category === "new" && isBikeAvailable(bike)
        );

        // Populate brands from actual inventory.
        if (brandSelect) {

            const brands = [...new Set(
                allNewBikes
                    .map(bike => bike.brand)
                    .filter(Boolean)
            )];

            brandSelect.innerHTML =
                '<option value="all">All Brands</option>';

            brands.forEach(brand => {

                const option = document.createElement("option");

                option.value = brand;
                option.textContent = brand;

                brandSelect.appendChild(option);

            });

        }

        filterBikes();

    } catch (error) {

        console.error("New Bike Loading Error:", error);

        bikeContainer.innerHTML =
            '<p class="inventory-message">Unable to connect to the showroom inventory.</p>';

        if (errorElement) {
            errorElement.style.display = "block";
            errorElement.textContent = error.message;
        }

    }

}

if (searchInput) {
    searchInput.addEventListener("input", filterBikes);
}

if (brandSelect) {
    brandSelect.addEventListener("change", filterBikes);
}

if (priceSelect) {
    priceSelect.addEventListener("change", filterBikes);
}


// New bike WhatsApp enquiry.
if (bikeContainer) {

    bikeContainer.addEventListener("click", event => {

        const button = event.target.closest("[data-bike-id]");

        if (!button) return;

        const bike = allNewBikes.find(
            item => String(item.id) === String(button.dataset.bikeId)
        );

        if (!bike) return;

        openWhatsApp(
            `Hello Jogniya Motors, I am interested in ${bike.name}. Price: ${formatPrice(bike.price)}. Please share more details.`
        );

    });

}


// ======================================================
// USED BIKES PAGE
// ======================================================

const usedBikeGrid = document.getElementById("usedBikeGrid");

const usedBikeSearch =
    document.getElementById("usedBikeSearch");

const usedPriceFilter =
    document.getElementById("usedPriceFilter");

let allUsedBikes = [];


function displayUsedBikes(bikes) {

    if (!usedBikeGrid) return;

    usedBikeGrid.replaceChildren();

    if (bikes.length === 0) {

        usedBikeGrid.innerHTML =
            '<p class="inventory-message">No used bikes are currently available.</p>';

        return;
    }

    bikes.forEach(bike => {

        const imageURL = getBikeImage(bike.image);

        const card = document.createElement("div");

        card.className = "used-bike-card";

        const imageHTML = imageURL
            ? `<img src="${escapeHTML(imageURL)}"
                    alt="${escapeHTML(bike.name)}"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <span class="image-fallback" style="display:none;">Image unavailable</span>`
            : `<span class="image-fallback">Bike Image</span>`;

        card.innerHTML = `

            <div class="used-bike-image">
                ${imageHTML}
            </div>

            <div class="used-bike-info">

                <h3>${escapeHTML(bike.name)}</h3>

                <p class="used-bike-brand">
                    ${escapeHTML(bike.brand || "")}
                </p>

                <h4>${formatPrice(bike.price)}</h4>

                <div class="used-bike-details">

                    <p>📅 Year: ${escapeHTML(bike.model_year || "Not specified")}</p>

                    <p>🛣️ KM Driven: ${Number(bike.kilometers || 0).toLocaleString("en-IN")} km</p>

                    <p>⚙️ Condition: ${escapeHTML(bike.description || "Contact for details")}</p>

                </div>

                <button
                    type="button"
                    class="used-bike-button"
                    data-used-bike-id="${escapeHTML(bike.id)}">

                    💬 Enquire on WhatsApp

                </button>

            </div>
        `;

        usedBikeGrid.appendChild(card);

    });

}


// ======================================================
// USED BIKE FILTERS
// ======================================================

function filterUsedBikes() {

    if (!usedBikeGrid) return;

    const searchText =
        usedBikeSearch?.value.toLowerCase().trim() || "";

    const priceRange =
        usedPriceFilter?.value || "all";

    const filtered = allUsedBikes.filter(bike => {

        const name = String(bike.name || "").toLowerCase();

        const brand = String(bike.brand || "").toLowerCase();

        const price = Number(bike.price) || 0;

        const matchesSearch =
            name.includes(searchText) ||
            brand.includes(searchText);

        let matchesPrice = true;

        if (priceRange === "under50000") {
            matchesPrice = price < 50000;
        }

        else if (priceRange === "50000to80000") {
            matchesPrice = price >= 50000 && price <= 80000;
        }

        else if (priceRange === "80000to100000") {
            matchesPrice = price > 80000 && price <= 100000;
        }

        else if (priceRange === "above100000") {
            matchesPrice = price > 100000;
        }

        return matchesSearch && matchesPrice;

    });

    displayUsedBikes(filtered);

    const noResults =
        document.getElementById("noUsedBikeResults");

    if (noResults) {
        noResults.style.display =
            filtered.length === 0 ? "block" : "none";
    }

}


async function loadUsedBikes() {

    if (!usedBikeGrid) return;

    const errorElement =
        document.getElementById("usedBikeError");

    try {

        const bikes = await fetchBikes();

        allUsedBikes = bikes.filter(bike =>
            bike.category === "used" && isBikeAvailable(bike)
        );

        filterUsedBikes();

    } catch (error) {

        console.error("Used Bike Loading Error:", error);

        usedBikeGrid.innerHTML =
            '<p class="inventory-message">Unable to connect to the showroom inventory.</p>';

        if (errorElement) {
            errorElement.style.display = "block";
            errorElement.textContent = error.message;
        }

    }

}


if (usedBikeSearch) {
    usedBikeSearch.addEventListener("input", filterUsedBikes);
}

if (usedPriceFilter) {
    usedPriceFilter.addEventListener("change", filterUsedBikes);
}


// Used bike WhatsApp enquiry.
if (usedBikeGrid) {

    usedBikeGrid.addEventListener("click", event => {

        const button = event.target.closest("[data-used-bike-id]");

        if (!button) return;

        const bike = allUsedBikes.find(
            item => String(item.id) === String(button.dataset.usedBikeId)
        );

        if (!bike) return;

        openWhatsApp(
            `Hello Jogniya Motors, I am interested in your used bike ${bike.name}. Price: ${formatPrice(bike.price)}. Year: ${bike.model_year || "Not specified"}. Please share more details.`
        );

    });

}


// ======================================================
// EMI CALCULATOR
// ======================================================

function calculateEMI() {

    const bikePriceElement = document.getElementById("bikePrice");
    const downPaymentElement = document.getElementById("downPayment");
    const interestRateElement = document.getElementById("interestRate");
    const loanTenureElement = document.getElementById("loanTenure");

    if (
        !bikePriceElement ||
        !downPaymentElement ||
        !interestRateElement ||
        !loanTenureElement
    ) {
        console.error("EMI calculator elements not found.");
        return;
    }

    const bikePrice = Number(bikePriceElement.value);
    const downPayment = Number(downPaymentElement.value);
    const interestRate = Number(interestRateElement.value);
    const loanTenure = Number(loanTenureElement.value);

    if (!Number.isFinite(bikePrice) || bikePrice <= 0) {
        alert("Please enter a valid bike price.");
        return;
    }

    if (!Number.isFinite(downPayment) ||
        downPayment < 0 ||
        downPayment >= bikePrice) {

        alert("Please enter a valid down payment.");
        return;
    }

    if (!Number.isFinite(interestRate) || interestRate < 0) {
        alert("Please enter a valid interest rate.");
        return;
    }

    if (!Number.isFinite(loanTenure) || loanTenure <= 0) {
        alert("Please select a valid loan tenure.");
        return;
    }

    const principal = bikePrice - downPayment;
    const months = loanTenure * 12;
    const monthlyRate = interestRate / 1200;

    let emi;

    if (monthlyRate === 0) {
        emi = principal / months;
    } else {
        emi =
            principal *
            monthlyRate *
            Math.pow(1 + monthlyRate, months) /
            (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalAmount = emi * months;
    const totalInterest = totalAmount - principal;

    const monthlyEMI = document.getElementById("monthlyEMI");
    const loanAmount = document.getElementById("loanAmount");
    const totalInterestElement = document.getElementById("totalInterest");
    const totalAmountElement = document.getElementById("totalAmount");

    if (monthlyEMI) monthlyEMI.textContent = formatPrice(Math.round(emi));

    if (loanAmount) loanAmount.textContent = formatPrice(Math.round(principal));

    if (totalInterestElement) {
        totalInterestElement.textContent = formatPrice(Math.round(totalInterest));
    }

    if (totalAmountElement) {
        totalAmountElement.textContent = formatPrice(Math.round(totalAmount));
    }

}


// ======================================================
// SPARE PARTS FILTERS
// ======================================================

const partsSearch = document.getElementById("partsSearch");
const partsCategory = document.getElementById("partsCategory");
const partsPrice = document.getElementById("partsPrice");

function filterParts() {

    const searchText =
        partsSearch?.value.toLowerCase().trim() || "";

    const selectedCategory =
        partsCategory?.value || "all";

    const selectedPrice =
        partsPrice?.value || "all";

    const products = document.querySelectorAll(".part-card");

    let visibleProducts = 0;

    products.forEach(product => {

        const name =
            (product.dataset.name || "").toLowerCase();

        const category =
            product.dataset.category || "";

        const price =
            Number(product.dataset.price) || 0;

        const matchesSearch = name.includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            category === selectedCategory;

        let matchesPrice = true;

        if (selectedPrice === "under500") {
            matchesPrice = price < 500;
        }

        else if (selectedPrice === "500to1000") {
            matchesPrice = price >= 500 && price <= 1000;
        }

        else if (selectedPrice === "1000to3000") {
            matchesPrice = price > 1000 && price <= 3000;
        }

        else if (selectedPrice === "above3000") {
            matchesPrice = price > 3000;
        }

        const show =
            matchesSearch &&
            matchesCategory &&
            matchesPrice;

        product.style.display = show ? "" : "none";

        if (show) visibleProducts++;

    });

    const noResults = document.getElementById("noPartsResults");

    if (noResults) {
        noResults.style.display =
            visibleProducts === 0 ? "block" : "none";
    }

}

if (partsSearch) {
    partsSearch.addEventListener("input", filterParts);
}

if (partsCategory) {
    partsCategory.addEventListener("change", filterParts);
}

if (partsPrice) {
    partsPrice.addEventListener("change", filterParts);
}

function enquirePart(partName, partPrice) {

    openWhatsApp(
        `Hello Jogniya Motors, I am interested in ${partName} priced at ${partPrice}. Please let me know if it is available.`
    );

}


// ======================================================
// SERVICE WHATSAPP ENQUIRY
// ======================================================

function enquireService(serviceName) {

    openWhatsApp(
        `Hello Jogniya Motors, I am interested in your ${serviceName}. Please share the details and service charges.`
    );

}


// ======================================================
// CONTACT ENQUIRY FORM
// ======================================================

// =============================================
// CUSTOMER ENQUIRY - MYSQL INTEGRATION
// =============================================

const enquiryForm = document.getElementById("enquiryForm");

if (enquiryForm) {

    enquiryForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("customerName").value.trim();
        const phone = document.getElementById("customerPhone").value.trim();
        const type = document.getElementById("enquiryType").value;
        const message = document.getElementById("customerMessage").value.trim();

        const submitButton = document.getElementById("enquirySubmitBtn");
        const messageBox = document.getElementById("enquiryFormMessage");

        if (!/^[0-9]{10}$/.test(phone)) {

            messageBox.textContent = "Please enter a valid 10-digit mobile number.";
            messageBox.style.color = "red";

            return;
        }

        if (!name || !type || !message) {

            messageBox.textContent = "Please fill in all the required fields.";
            messageBox.style.color = "red";

            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        messageBox.textContent = "";

        try {

            const response = await fetch(
                "https://jogniya-motor.onrender.com/api/enquiries",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        customer_name: name,
                        phone: phone,
                        enquiry_type: type,
                        message: message

                    })

                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to submit enquiry."
                );
            }

            messageBox.textContent =
                "✓ " + result.message + " Our team will contact you soon.";

            messageBox.style.color = "green";

            enquiryForm.reset();

        } catch (error) {

            console.error("Enquiry Submission Error:", error);

            messageBox.textContent =
                error.message || "Something went wrong. Please try again.";

            messageBox.style.color = "red";

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Submit Enquiry";

        }

    });

}


// ======================================================
// INITIALIZE CUSTOMER PAGES
// ======================================================

if (bikeContainer) {
    loadNewBikes();
}

if (usedBikeGrid) {
    loadUsedBikes();
}

if (partsSearch || partsCategory || partsPrice) {
    filterParts();
}
// =============================================
// MYSQL SPARE PARTS INTEGRATION
// =============================================

const PARTS_API_URL = "https://jogniya-motor.onrender.com/api/parts";

let allSpareParts = [];

document.addEventListener("DOMContentLoaded", function () {

    const partsGrid = document.getElementById("partsGrid");

    if (!partsGrid) return;

    loadSpareParts();

    const search = document.getElementById("partsSearch");
    const category = document.getElementById("partsCategory");
    const price = document.getElementById("partsPrice");

    if (search) {
        search.addEventListener("input", filterSpareParts);
    }

    if (category) {
        category.addEventListener("change", filterSpareParts);
    }

    if (price) {
        price.addEventListener("change", filterSpareParts);
    }

});


// LOAD PARTS FROM MYSQL

async function loadSpareParts() {

    const partsGrid = document.getElementById("partsGrid");
    const loading = document.getElementById("partsLoading");

    try {

        const response = await fetch(PARTS_API_URL);

        if (!response.ok) {
            throw new Error("Unable to load spare parts. Status: " + response.status);
        }

        const result = await response.json();

        allSpareParts = Array.isArray(result)
            ? result
            : result.data || result.parts || [];

        displaySpareParts(allSpareParts);

    } catch (error) {

        console.error("Spare Parts API Error:", error);

        if (loading) {
            loading.textContent =
                "Unable to load spare parts. Please try again later.";
        }

    }

}


// DISPLAY PARTS

function displaySpareParts(parts) {

    const partsGrid = document.getElementById("partsGrid");
    const noResults = document.getElementById("noPartsResults");

    if (!partsGrid) return;

    partsGrid.innerHTML = "";

    if (!parts || parts.length === 0) {

        if (noResults) {
            noResults.style.display = "block";
        }

        return;

    }

    if (noResults) {
        noResults.style.display = "none";
    }

    parts.forEach(part => {

        const name = part.name || part.part_name || "Spare Part";

        const category = (
            part.category || "parts"
        ).toLowerCase();

        const price = Number(part.price || 0);

        const description =
            part.description || "Genuine quality product from Jogniya Motors.";

        const image = part.image || "";

        const stock = Number(part.stock ?? 0);

        const status = (
            part.status || (stock > 0 ? "available" : "unavailable")
        ).toLowerCase();

        const available = stock > 0 && status === "available";

        const imageURL = image
            ? (image.startsWith("http")
                ? image
                : "https://jogniya-motor.onrender.com" +
                  (image.startsWith("/") ? image : "/" + image))
            : "";

        const card = document.createElement("div");

        card.className = "part-card";

        card.dataset.name = name;
        card.dataset.category = category;
        card.dataset.price = price;

        card.innerHTML = `

            <div class="part-image">

                ${
                    imageURL
                    ? `<img src="${escapePartHTML(imageURL)}"
                            alt="${escapePartHTML(name)}"
                            onerror="this.style.display='none'">`
                    : `<div class="part-no-image">Image unavailable</div>`
                }

            </div>

            <div class="part-info">

                <span class="part-category">
                    ${escapePartHTML(category)}
                </span>

                <h3>${escapePartHTML(name)}</h3>

                <h4>₹${price.toLocaleString("en-IN")}</h4>

                <p>${escapePartHTML(description)}</p>

                <p class="part-stock ${
                    available ? "in-stock" : "out-of-stock"
                }">

                    ${
                        available
                        ? "In Stock"
                        : "Currently Unavailable"
                    }

                </p>

                <a
                    href="#"
                    class="part-button"
                    onclick="enquirePart(
                        ${JSON.stringify(name)},
                        ${JSON.stringify("₹" + price.toLocaleString("en-IN"))}
                    ); return false;"
                    ${!available ? 'style="opacity:0.5"' : ""}
                >

                    💬 Enquire on WhatsApp

                </a>

            </div>

        `;

        partsGrid.appendChild(card);

    });

}


// FILTER PARTS

function filterSpareParts() {

    const search =
        document.getElementById("partsSearch")?.value
        .toLowerCase().trim() || "";

    const category =
        document.getElementById("partsCategory")?.value || "all";

    const priceFilter =
        document.getElementById("partsPrice")?.value || "all";

    const filtered = allSpareParts.filter(part => {

        const name = (
            part.name || part.part_name || ""
        ).toLowerCase();

        const partCategory = (
            part.category || "parts"
        ).toLowerCase();

        const price = Number(part.price || 0);

        const matchesSearch = name.includes(search);

        const matchesCategory =
            category === "all" || partCategory === category;

        let matchesPrice = true;

        if (priceFilter === "under500") {
            matchesPrice = price < 500;
        }

        else if (priceFilter === "500to1000") {
            matchesPrice = price >= 500 && price <= 1000;
        }

        else if (priceFilter === "1000to3000") {
            matchesPrice = price > 1000 && price <= 3000;
        }

        else if (priceFilter === "above3000") {
            matchesPrice = price > 3000;
        }

        return matchesSearch && matchesCategory && matchesPrice;

    });

    displaySpareParts(filtered);

}


// HTML ESCAPE

function escapePartHTML(value) {

    return String(value).replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];

    });

}