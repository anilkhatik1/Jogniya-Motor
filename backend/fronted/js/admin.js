// =============================================
// JOGNIYA MOTORS - COMPLETE ADMIN SYSTEM
// =============================================

const API_URL = "http://localhost:5000";
const TOKEN_KEY = "jogniyaAdminToken";

// =============================================
// ADMIN LOGIN
// =============================================

const loginForm = document.getElementById("adminLoginForm");

if (loginForm) {
    if (localStorage.getItem(TOKEN_KEY)) {
        window.location.href = "./admin-dashboard.html";
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const button = document.getElementById("loginButton");
        const message = document.getElementById("loginMessage");

        button.disabled = true;
        button.textContent = "Logging in...";
        message.textContent = "";

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Login failed.");
            }

            localStorage.setItem(TOKEN_KEY, result.token);

            message.textContent = "Login successful!";
            message.className = "login-message success";

            setTimeout(() => {
                window.location.href = "./admin-dashboard.html";
            }, 800);

        } catch (error) {
            message.textContent =
                error.message === "Failed to fetch"
                    ? "Cannot connect to backend server."
                    : error.message;

            message.className = "login-message error";

        } finally {
            button.disabled = false;
            button.textContent = "Login to Dashboard";
        }
    });
}

// =============================================
// ADMIN DASHBOARD
// =============================================

if (document.getElementById("bikesTableBody")) {

    const token = localStorage.getItem(TOKEN_KEY);

    let allBikes = [];
    let allParts = [];
    let allEnquiries = [];

    if (!token) {
        window.location.href = "./admin-login.html";
    } else {
        loadDashboard();
    }

    // =============================================
    // API HELPER
    // =============================================

    async function adminFetch(endpoint, options = {}) {

        const headers = {
            Authorization: `Bearer ${token}`,

            ...(options.body
                ? { "Content-Type": "application/json" }
                : {}),

            ...options.headers
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        const result = await response.json();

        if (response.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            window.location.href = "./admin-login.html";

            throw new Error("Session expired. Please login again.");
        }

        if (!response.ok || result.success === false) {
            throw new Error(result.message || "Request failed.");
        }

        return result;
    }

    // =============================================
    // COMMON TABLE CELL
    // =============================================

    function createCell(value) {
        const cell = document.createElement("td");
        cell.textContent = value ?? "-";
        return cell;
    }

    // =============================================
    // LOAD DASHBOARD
    // =============================================

    async function loadDashboard() {

        try {
            const [bikes, parts, enquiries] = await Promise.all([
                adminFetch("/api/bikes"),
                adminFetch("/api/parts"),
                adminFetch("/api/enquiries")
            ]);

            allBikes = bikes.data || [];
            allParts = parts.data || [];
            allEnquiries = enquiries.data || [];

            document.getElementById("totalBikes").textContent =
                allBikes.length;

            document.getElementById("usedBikes").textContent =
                allBikes.filter(b => b.category === "used").length;

            document.getElementById("totalParts").textContent =
                allParts.length;

            document.getElementById("totalEnquiries").textContent =
                allEnquiries.length;

            displayBikes(allBikes);
            displayParts(allParts);
            displayEnquiries(allEnquiries);
            updateEnquiryStatistics();

        } catch (error) {
            console.error("Dashboard Error:", error);
            showDashboardError(error.message);
        }
    }

    // =============================================
    // BIKE MANAGEMENT
    // =============================================

   function displayBikes(bikes) {

    const table = document.getElementById("bikesTableBody");

    if (!table) return;

    table.replaceChildren();

    if (bikes.length === 0) {
        table.innerHTML =
            '<tr><td colspan="9">No bikes found.</td></tr>';
        return;
    }

    bikes.forEach(bike => {

        const row = document.createElement("tr");

        row.appendChild(createCell(bike.id));

        // BIKE IMAGE
        const imageCell = document.createElement("td");

        if (bike.image) {

            const img = document.createElement("img");

            img.src = bike.image.startsWith("http")
                ? bike.image
                : `${API_URL}${bike.image}`;

            img.alt = bike.name || "Bike";

            img.style.width = "75px";
            img.style.height = "55px";
            img.style.objectFit = "contain";
            img.style.borderRadius = "6px";

            img.onerror = function () {
                this.style.display = "none";
                imageCell.textContent = "Image unavailable";
            };

            imageCell.appendChild(img);

        } else {

            imageCell.textContent = "No Image";

        }

        row.appendChild(imageCell);

        row.appendChild(createCell(bike.name));
        row.appendChild(createCell(bike.brand));
        row.appendChild(createCell(bike.category));
        row.appendChild(createCell("₹" + bike.price));
        row.appendChild(createCell(bike.stock));
        row.appendChild(createCell(bike.status));

        // ACTIONS
        const actions = document.createElement("td");

        const edit = document.createElement("button");

        edit.textContent = "Edit";
        edit.className = "edit-bike-btn";
        edit.dataset.id = bike.id;

        const remove = document.createElement("button");

        remove.textContent = "Delete";
        remove.className = "delete-bike-btn";
        remove.dataset.id = bike.id;

        actions.append(edit, remove);

        row.appendChild(actions);

        table.appendChild(row);

    });

}
    // =============================================
    // BIKE SEARCH AND FILTER
    // =============================================

    const bikeSearch = document.getElementById("bikeSearch");

    const bikeCategoryFilter =
        document.getElementById("bikeCategoryFilter");

    function filterBikes() {

        const search = bikeSearch
            ? bikeSearch.value.toLowerCase().trim()
            : "";

        const category = bikeCategoryFilter
            ? bikeCategoryFilter.value
            : "";

        const filtered = allBikes.filter(bike => {

            const matchesSearch =
                (bike.name || "").toLowerCase().includes(search) ||
                (bike.brand || "").toLowerCase().includes(search);

            const matchesCategory =
                !category || bike.category === category;

            return matchesSearch && matchesCategory;
        });

        displayBikes(filtered);
    }

    if (bikeSearch) {
        bikeSearch.addEventListener("input", filterBikes);
    }

    if (bikeCategoryFilter) {
        bikeCategoryFilter.addEventListener("change", filterBikes);
    }

    // =============================================
    // BIKE MODAL
    // =============================================

    const bikeModal = document.getElementById("bikeModal");
    const bikeForm = document.getElementById("bikeForm");
    const bikeMessage = document.getElementById("bikeFormMessage");
    const bikeSaveButton = document.getElementById("saveBikeButton");

    const bikeImageInput = document.getElementById("bikeImage");
    const bikeImagePreview = document.getElementById("bikeImagePreview");
    const bikeImageFile = document.getElementById("bikeImageFile");
    const bikeImageMessage =
        document.getElementById("bikeImageUploadMessage");

    function resetBikeImage() {

        if (bikeImageInput) {
            bikeImageInput.value = "";
        }

        if (bikeImagePreview) {
            bikeImagePreview.removeAttribute("src");
            bikeImagePreview.style.display = "none";
        }

        if (bikeImageFile) {
            bikeImageFile.value = "";
        }

        if (bikeImageMessage) {
            bikeImageMessage.textContent = "";
        }
    }

    function closeBikeModalWindow() {

        if (!bikeModal) return;

        bikeModal.style.display = "none";

        bikeForm.reset();

        resetBikeImage();

        bikeMessage.textContent = "";

        bikeSaveButton.disabled = false;
        bikeSaveButton.textContent = "Save Bike";
    }

    function openAddBikeModal() {

        bikeForm.reset();

        resetBikeImage();

        document.getElementById("bikeId").value = "";
        document.getElementById("bikeBrand").value = "Hero";
        document.getElementById("bikeStock").value = "1";
        document.getElementById("bikeKilometers").value = "0";
        document.getElementById("bikeStatus").value = "available";

        document.getElementById("bikeModalTitle").textContent =
            "Add New Bike";

        bikeSaveButton.textContent = "Save Bike";
        bikeSaveButton.disabled = false;

        bikeMessage.textContent = "";

        bikeModal.style.display = "flex";
    }

    const addBikeButton = document.getElementById("addBikeButton");

    if (addBikeButton) {
        addBikeButton.addEventListener("click", openAddBikeModal);
    }

    const closeBikeButton = document.getElementById("closeBikeModal");
    const cancelBikeButton = document.getElementById("cancelBikeButton");

    if (closeBikeButton) {
        closeBikeButton.addEventListener(
            "click",
            closeBikeModalWindow
        );
    }

    if (cancelBikeButton) {
        cancelBikeButton.addEventListener(
            "click",
            closeBikeModalWindow
        );
    }

    // =============================================
    // EDIT BIKE
    // =============================================

    function openEditBikeModal(id) {

        const bike = allBikes.find(
            item => String(item.id) === String(id)
        );

        if (!bike) {
            alert("Bike not found!");
            return;
        }

        document.getElementById("bikeId").value = bike.id;
        document.getElementById("bikeName").value = bike.name || "";
        document.getElementById("bikeBrand").value = bike.brand || "Hero";

        document.getElementById("bikeCategory").value =
            bike.category || "new";

        document.getElementById("bikePrice").value =
            bike.price || "";

        document.getElementById("bikeYear").value =
            bike.model_year || "";

        document.getElementById("bikeKilometers").value =
            bike.kilometers || 0;

        document.getElementById("bikeStock").value =
            bike.stock ?? 0;

        document.getElementById("bikeStatus").value =
            bike.status || "available";

        document.getElementById("bikeImage").value =
            bike.image || "";

        document.getElementById("bikeDescription").value =
            bike.description || "";

        if (bike.image) {
            bikeImagePreview.src =
                bike.image.startsWith("http")
                    ? bike.image
                    : `${API_URL}${bike.image}`;

            bikeImagePreview.style.display = "block";
        } else {
            bikeImagePreview.style.display = "none";
        }

        if (bikeImageFile) {
            bikeImageFile.value = "";
        }

        if (bikeImageMessage) {
            bikeImageMessage.textContent = "";
        }

        document.getElementById("bikeModalTitle").textContent =
            "Edit Bike";

        bikeSaveButton.textContent = "Update Bike";
        bikeSaveButton.disabled = false;

        bikeMessage.textContent = "";

        bikeModal.style.display = "flex";
    }

    // =============================================
    // SAVE / UPDATE BIKE
    // =============================================

    bikeForm.addEventListener("submit", async function (event) {

        event.preventDefault();
        event.stopPropagation();

        // Prevent implicit or accidental submission.
        // Only the actual Save Bike button can submit.
        if (event.submitter !== bikeSaveButton) {
            return;
        }

        const id = document.getElementById("bikeId").value;

        const data = {

            name: document.getElementById("bikeName").value.trim(),

            brand: document.getElementById("bikeBrand").value.trim(),

            category: document.getElementById("bikeCategory").value,

            price: Number(
                document.getElementById("bikePrice").value
            ),

            model_year: document.getElementById("bikeYear").value
                ? Number(document.getElementById("bikeYear").value)
                : null,

            kilometers: Number(
                document.getElementById("bikeKilometers").value || 0
            ),

            stock: Number(
                document.getElementById("bikeStock").value || 0
            ),

            status: document.getElementById("bikeStatus").value,

            image: bikeImageInput.value.trim(),

            description:
                document.getElementById("bikeDescription").value.trim()
        };

        if (!data.name || !data.brand || !data.price) {
            bikeMessage.textContent =
                "Please fill all required bike details.";
            return;
        }

        if (data.price <= 0) {
            bikeMessage.textContent = "Price must be greater than zero.";
            return;
        }

        bikeSaveButton.disabled = true;
        bikeSaveButton.textContent = "Saving...";
        bikeMessage.textContent = "";

        try {

            const result = await adminFetch(
                id ? `/api/bikes/${id}` : "/api/bikes",
                {
                    method: id ? "PUT" : "POST",
                    body: JSON.stringify(data)
                }
            );

            bikeMessage.textContent =
                result.message || "Bike saved successfully!";

            await loadDashboard();

            setTimeout(() => {
                closeBikeModalWindow();
            }, 700);

        } catch (error) {

            bikeMessage.textContent = error.message;

            bikeSaveButton.disabled = false;

            bikeSaveButton.textContent =
                id ? "Update Bike" : "Save Bike";
        }
    });

    // =============================================
    // BIKE TABLE ACTIONS
    // =============================================

    const bikesTableBody =
        document.getElementById("bikesTableBody");

    if (bikesTableBody) {

        bikesTableBody.addEventListener("click", function (event) {

            const edit = event.target.closest(".edit-bike-btn");
            const remove = event.target.closest(".delete-bike-btn");

            if (edit) {
                openEditBikeModal(edit.dataset.id);
            }

            if (remove) {
                deleteBike(remove.dataset.id);
            }
        });
    }

    async function deleteBike(id) {

        const confirmed = confirm(
            "Are you sure you want to delete this bike?"
        );

        if (!confirmed) return;

        try {

            const result = await adminFetch(
                `/api/bikes/${id}`,
                {
                    method: "DELETE"
                }
            );

            alert(result.message || "Bike deleted successfully.");

            await loadDashboard();

        } catch (error) {
            alert(error.message);
        }
    }

    // =============================================
   // =============================================
// SPARE PARTS MANAGEMENT
// =============================================

// Convert stored image path into a usable URL
function getPartImageUrl(imagePath) {

    if (!imagePath) return "";

    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {
        return imagePath;
    }

    return `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
}


// =============================================
// DISPLAY SPARE PARTS
// =============================================

function displayParts(parts) {

    const table = document.getElementById("partsTableBody");

    if (!table) return;

    table.replaceChildren();

    if (!parts.length) {

        table.innerHTML =
            '<tr><td colspan="6">No spare parts found.</td></tr>';

        return;
    }

    parts.forEach(part => {

        const row = document.createElement("tr");

        row.appendChild(createCell(part.id));

        // Part name and image in the same cell
        const nameCell = document.createElement("td");

        nameCell.style.display = "flex";
        nameCell.style.alignItems = "center";
        nameCell.style.gap = "10px";

        if (part.image) {

            const image = document.createElement("img");

            image.src = getPartImageUrl(part.image);

            image.alt = part.name || "Spare Part";

            image.style.width = "55px";
            image.style.height = "55px";
            image.style.objectFit = "cover";
            image.style.borderRadius = "6px";

            image.onerror = function () {
                this.style.display = "none";
            };

            nameCell.appendChild(image);

        }

        const name = document.createElement("span");

        name.textContent = part.name || "-";

        nameCell.appendChild(name);

        row.appendChild(nameCell);

        row.appendChild(createCell(part.category));

        row.appendChild(createCell("₹" + part.price));

        row.appendChild(createCell(part.stock));


        // ACTION BUTTONS

        const actions = document.createElement("td");

        const edit = document.createElement("button");

        edit.textContent = "Edit";

        edit.className = "edit-part-btn";

        edit.dataset.id = part.id;


        const remove = document.createElement("button");

        remove.textContent = "Delete";

        remove.className = "delete-part-btn";

        remove.dataset.id = part.id;


        actions.append(edit, remove);

        row.appendChild(actions);

        table.appendChild(row);

    });

}


// =============================================
// PART SEARCH
// =============================================

const partSearch = document.getElementById("partSearch");


function filterParts() {

    const search = partSearch
        ? partSearch.value.toLowerCase().trim()
        : "";

    const filtered = allParts.filter(part => {

        return (
            (part.name || "").toLowerCase().includes(search) ||
            (part.category || "").toLowerCase().includes(search)
        );

    });

    displayParts(filtered);

}


if (partSearch) {

    partSearch.addEventListener("input", filterParts);

}


// =============================================
// PART MODAL
// =============================================

const partModal = document.getElementById("partModal");

const partForm = document.getElementById("partForm");

const partMessage = document.getElementById("partFormMessage");

const partSaveButton = document.getElementById("savePartButton");

const partImagePreview = document.getElementById("partImagePreview");

const partImageFile = document.getElementById("partImageFile");

const partImageUploadMessage =
    document.getElementById("partImageUploadMessage");


// =============================================
// RESET PART IMAGE PREVIEW
// =============================================

function resetPartImagePreview() {

    if (partImagePreview) {

        partImagePreview.src = "";

        partImagePreview.style.display = "none";

    }

    if (partImageFile) {

        partImageFile.value = "";

    }

    if (partImageUploadMessage) {

        partImageUploadMessage.textContent = "";

    }

}


// =============================================
// CLOSE PART MODAL
// =============================================

function closePartModalWindow() {

    if (!partModal) return;

    partModal.style.display = "none";

    partForm.reset();

    resetPartImagePreview();

    partMessage.textContent = "";

}


// =============================================
// OPEN ADD PART MODAL
// =============================================

function openAddPartModal() {

    partForm.reset();

    document.getElementById("partId").value = "";

    document.getElementById("partStock").value = "1";

    document.getElementById("partModalTitle").textContent =
        "Add Spare Part";

    partSaveButton.textContent = "Save Spare Part";

    partMessage.textContent = "";

    resetPartImagePreview();

    partModal.style.display = "flex";

}


const addPartButton = document.getElementById("addPartButton");

if (addPartButton) {

    addPartButton.addEventListener("click", openAddPartModal);

}


// =============================================
// CLOSE AND CANCEL BUTTONS
// =============================================

const closePartButton = document.getElementById("closePartModal");

const cancelPartButton = document.getElementById("cancelPartButton");


if (closePartButton) {

    closePartButton.addEventListener(
        "click",
        closePartModalWindow
    );

}


if (cancelPartButton) {

    cancelPartButton.addEventListener(
        "click",
        closePartModalWindow
    );

}


if (partModal) {

    partModal.addEventListener("click", event => {

        if (event.target === partModal) {

            closePartModalWindow();

        }

    });

}


// =============================================
// OPEN EDIT PART MODAL
// =============================================

function openEditPartModal(id) {

    const part = allParts.find(
        item => String(item.id) === String(id)
    );

    if (!part) {

        alert("Spare part not found.");

        return;

    }

    document.getElementById("partId").value = part.id;

    document.getElementById("partName").value =
        part.name || "";

    document.getElementById("partCategory").value =
        part.category || "";

    document.getElementById("partPrice").value =
        part.price || "";

    document.getElementById("partStock").value =
        part.stock ?? 0;

    // Keep the existing image path.
    // It will be replaced only if a new image is uploaded.
    document.getElementById("partImage").value =
        part.image || "";

    document.getElementById("partDescription").value =
        part.description || "";


    // Clear the file input without clearing the existing image path.
    if (partImageFile) {

        partImageFile.value = "";

    }


    // Show the existing image preview.
    if (partImagePreview) {

        if (part.image) {

            partImagePreview.src = getPartImageUrl(part.image);

            partImagePreview.style.display = "block";

            partImagePreview.onerror = function () {

                this.style.display = "none";

            };

        } else {

            partImagePreview.src = "";

            partImagePreview.style.display = "none";

        }

    }


    if (partImageUploadMessage) {

        partImageUploadMessage.textContent = "";

    }


    document.getElementById("partModalTitle").textContent =
        "Edit Spare Part";

    partSaveButton.textContent = "Update Spare Part";

    partMessage.textContent = "";

    partModal.style.display = "flex";

}


// =============================================
// SAVE / UPDATE SPARE PART
// =============================================

partForm.addEventListener("submit", async event => {

    event.preventDefault();

    const id = document.getElementById("partId").value;


    const data = {

        name: document.getElementById("partName").value.trim(),

        category: document.getElementById("partCategory").value.trim(),

        price: Number(
            document.getElementById("partPrice").value
        ),

        stock: Number(
            document.getElementById("partStock").value
        ),

        // Existing image remains here unless a new image is uploaded.
        image: document.getElementById("partImage").value.trim(),

        description: document.getElementById("partDescription").value.trim()

    };


    partSaveButton.disabled = true;

    partSaveButton.textContent = "Saving...";


    try {

        const result = await adminFetch(

            id ? `/api/parts/${id}` : "/api/parts",

            {

                method: id ? "PUT" : "POST",

                body: JSON.stringify(data)

            }

        );


        partMessage.textContent =
            result.message || "Spare part saved successfully.";

        partMessage.style.color = "#4caf50";


        await loadDashboard();


        setTimeout(closePartModalWindow, 700);


    } catch (error) {

        partMessage.textContent = error.message;

        partMessage.style.color = "#ff5555";

    } finally {

        partSaveButton.disabled = false;

        partSaveButton.textContent =
            id ? "Update Spare Part" : "Save Spare Part";

    }

});


// =============================================
// DELETE SPARE PART
// =============================================

async function deletePart(id) {

    if (!confirm("Are you sure you want to delete this spare part?")) {

        return;

    }

    try {

        const result = await adminFetch(`/api/parts/${id}`, {

            method: "DELETE"

        });

        alert(result.message || "Spare part deleted.");

        await loadDashboard();

    } catch (error) {

        alert(error.message);

    }

}


// =============================================
// PART TABLE BUTTON EVENTS
// =============================================

const partsTableBody = document.getElementById("partsTableBody");

if (partsTableBody) {

    partsTableBody.addEventListener("click", event => {

        const edit = event.target.closest(".edit-part-btn");

        const remove = event.target.closest(".delete-part-btn");


        if (edit) {

            openEditPartModal(edit.dataset.id);

        }


        if (remove) {

            deletePart(remove.dataset.id);

        }

    });

}
    // =============================================
    // CUSTOMER ENQUIRIES
    // =============================================

    const enquirySearch = document.getElementById("enquirySearch");

    const enquiryStatusFilter =
        document.getElementById("enquiryStatusFilter");

    const refreshEnquiriesButton =
        document.getElementById("refreshEnquiriesButton");

    function updateEnquiryStatistics() {

        const newCount = allEnquiries.filter(
            e => e.status === "new"
        ).length;

        const contactedCount = allEnquiries.filter(
            e => e.status === "contacted"
        ).length;

        const completedCount = allEnquiries.filter(
            e => e.status === "completed"
        ).length;

        document.getElementById("newEnquiryCount").textContent =
            newCount;

        document.getElementById("contactedEnquiryCount").textContent =
            contactedCount;

        document.getElementById("completedEnquiryCount").textContent =
            completedCount;
    }

    function formatEnquiryDate(dateValue) {

        if (!dateValue) return "-";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return "-";

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function displayEnquiries(enquiries) {

        const table = document.getElementById("enquiriesTableBody");

        if (!table) return;

        table.replaceChildren();

        if (!enquiries.length) {
            table.innerHTML =
                '<tr><td colspan="8">No customer enquiries found.</td></tr>';
            return;
        }

        enquiries.forEach(enquiry => {

            const row = document.createElement("tr");

            row.appendChild(createCell(enquiry.id));
            row.appendChild(createCell(enquiry.customer_name));
            row.appendChild(createCell(enquiry.phone));
            row.appendChild(createCell(enquiry.enquiry_type));

            const messageCell = createCell(enquiry.message);
            messageCell.classList.add("enquiry-message-cell");

            row.appendChild(messageCell);

            row.appendChild(createCell(
                formatEnquiryDate(enquiry.created_at)
            ));

            const statusCell = document.createElement("td");

            const statusSelect = document.createElement("select");

            statusSelect.className = "enquiry-status-select";
            statusSelect.dataset.id = enquiry.id;

            const statuses = [
                { value: "new", label: "New" },
                { value: "contacted", label: "Contacted" },
                { value: "completed", label: "Completed" }
            ];

            statuses.forEach(status => {

                const option = document.createElement("option");

                option.value = status.value;
                option.textContent = status.label;

                if (enquiry.status === status.value) {
                    option.selected = true;
                }

                statusSelect.appendChild(option);
            });

            statusCell.appendChild(statusSelect);
            row.appendChild(statusCell);

            const actions = document.createElement("td");

            const viewButton = document.createElement("button");

            viewButton.type = "button";
            viewButton.textContent = "View";
            viewButton.className = "view-enquiry-btn";
            viewButton.dataset.id = enquiry.id;

            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-enquiry-btn";
            deleteButton.dataset.id = enquiry.id;

            actions.append(viewButton, deleteButton);
            row.appendChild(actions);

            table.appendChild(row);
        });
    }

    function filterEnquiries() {

        const search = enquirySearch
            ? enquirySearch.value.toLowerCase().trim()
            : "";

        const status = enquiryStatusFilter
            ? enquiryStatusFilter.value
            : "";

        const filtered = allEnquiries.filter(enquiry => {

            const matchesSearch =
                (enquiry.customer_name || "")
                    .toLowerCase()
                    .includes(search) ||

                (enquiry.phone || "")
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                !status || enquiry.status === status;

            return matchesSearch && matchesStatus;
        });

        displayEnquiries(filtered);
    }

    if (enquirySearch) {
        enquirySearch.addEventListener("input", filterEnquiries);
    }

    if (enquiryStatusFilter) {
        enquiryStatusFilter.addEventListener(
            "change",
            filterEnquiries
        );
    }

    // =============================================
    // REFRESH ENQUIRIES
    // =============================================

    if (refreshEnquiriesButton) {

        refreshEnquiriesButton.addEventListener("click", async function () {

            refreshEnquiriesButton.disabled = true;
            refreshEnquiriesButton.textContent = "Refreshing...";

            try {

                const result = await adminFetch("/api/enquiries");

                allEnquiries = result.data || [];

                updateEnquiryStatistics();
                filterEnquiries();

                document.getElementById("totalEnquiries").textContent =
                    allEnquiries.length;

            } catch (error) {

                alert(error.message);

            } finally {

                refreshEnquiriesButton.disabled = false;
                refreshEnquiriesButton.textContent = "Refresh Enquiries";
            }
        });
    }

    // =============================================
    // UPDATE ENQUIRY STATUS
    // =============================================

    const enquiriesTableBody =
        document.getElementById("enquiriesTableBody");

    if (enquiriesTableBody) {

        enquiriesTableBody.addEventListener("change", async function (event) {

            const select = event.target.closest(
                ".enquiry-status-select"
            );

            if (!select) return;

            const id = select.dataset.id;
            const status = select.value;

            select.disabled = true;

            try {

                const result = await adminFetch(
                    `/api/enquiries/${id}/status`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({ status })
                    }
                );

                const enquiry = allEnquiries.find(
                    item => String(item.id) === String(id)
                );

                if (enquiry) {
                    enquiry.status = status;
                }

                updateEnquiryStatistics();

                alert(result.message || "Status updated successfully.");

            } catch (error) {

                alert(error.message);

                await loadDashboard();

            } finally {

                select.disabled = false;
            }
        });
    }

    // =============================================
    // VIEW ENQUIRY DETAILS
    // =============================================

    const enquiryModal =
        document.getElementById("enquiryDetailsModal");

    function closeEnquiryModal() {

        if (enquiryModal) {
            enquiryModal.style.display = "none";
        }
    }

    function openEnquiryDetails(id) {

        const enquiry = allEnquiries.find(
            item => String(item.id) === String(id)
        );

        if (!enquiry) {
            alert("Enquiry not found.");
            return;
        }

        document.getElementById("detailEnquiryId").textContent =
            enquiry.id;

        document.getElementById("detailCustomerName").textContent =
            enquiry.customer_name || "-";

        document.getElementById("detailCustomerPhone").textContent =
            enquiry.phone || "-";

        document.getElementById("detailEnquiryType").textContent =
            enquiry.enquiry_type || "-";

        document.getElementById("detailEnquiryDate").textContent =
            formatEnquiryDate(enquiry.created_at);

        document.getElementById("detailEnquiryStatus").textContent =
            enquiry.status || "-";

        document.getElementById("detailEnquiryMessage").textContent =
            enquiry.message || "No message provided.";

        const callButton =
            document.getElementById("callCustomerButton");

        const phone = String(enquiry.phone || "").replace(
            /[^0-9+]/g,
            ""
        );

        callButton.href = `tel:${phone}`;

        callButton.style.display =
            phone ? "inline-block" : "none";

        enquiryModal.style.display = "flex";
    }

    const closeEnquiryButton =
        document.getElementById("closeEnquiryModal");

    const closeEnquiryDetailsButton =
        document.getElementById("closeEnquiryDetailsButton");

    if (closeEnquiryButton) {
        closeEnquiryButton.addEventListener(
            "click",
            closeEnquiryModal
        );
    }

    if (closeEnquiryDetailsButton) {
        closeEnquiryDetailsButton.addEventListener(
            "click",
            closeEnquiryModal
        );
    }

    if (enquiryModal) {

        enquiryModal.addEventListener("click", function (event) {

            if (event.target === enquiryModal) {
                closeEnquiryModal();
            }
        });
    }

    // =============================================
    // DELETE ENQUIRY
    // =============================================

    async function deleteEnquiry(id) {

        const confirmed = confirm(
            "Are you sure you want to permanently delete this customer enquiry?"
        );

        if (!confirmed) return;

        try {

            const result = await adminFetch(
                `/api/enquiries/${id}`,
                {
                    method: "DELETE"
                }
            );

            alert(result.message || "Enquiry deleted successfully.");

            await loadDashboard();

        } catch (error) {

            alert(error.message);
        }
    }

    if (enquiriesTableBody) {

        enquiriesTableBody.addEventListener("click", function (event) {

            const viewButton = event.target.closest(
                ".view-enquiry-btn"
            );

            const deleteButton = event.target.closest(
                ".delete-enquiry-btn"
            );

            if (viewButton) {
                openEnquiryDetails(viewButton.dataset.id);
            }

            if (deleteButton) {
                deleteEnquiry(deleteButton.dataset.id);
            }
        });
    }

    // =============================================
    // DASHBOARD ERROR HANDLING
    // =============================================

    function showDashboardError(message) {

        const tables = [
            { id: "bikesTableBody", columns: 8 },
            { id: "partsTableBody", columns: 6 },
            { id: "enquiriesTableBody", columns: 8 }
        ];

        tables.forEach(item => {

            const table = document.getElementById(item.id);

            if (!table) return;

            table.replaceChildren();

            const row = document.createElement("tr");

            const cell = document.createElement("td");

            cell.colSpan = item.columns;
            cell.textContent = message;

            row.appendChild(cell);
            table.appendChild(row);
        });
    }

    // =============================================
    // LOGOUT
    // =============================================

    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {

        logoutButton.addEventListener("click", function () {

            localStorage.removeItem(TOKEN_KEY);

            window.location.href = "./admin-login.html";
        });
    }
}