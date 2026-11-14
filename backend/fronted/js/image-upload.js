// =============================================
// JOGNIYA MOTORS - IMAGE UPLOAD SYSTEM
// =============================================

const IMAGE_UPLOAD_API = "http://localhost:5000/api/upload/image";
const IMAGE_SERVER_URL = "http://localhost:5000";
const IMAGE_TOKEN_KEY = "jogniyaAdminToken";

// =============================================
// IMAGE UPLOAD FUNCTION
// =============================================

async function uploadImage(
    file,
    imageInput,
    messageElement,
    previewElement
) {

    if (!file) {
        return false;
    }

    if (file.size > 5 * 1024 * 1024) {

        messageElement.textContent =
            "Image size must be 5 MB or less.";

        messageElement.style.color = "#ff5555";

        return false;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

        messageElement.textContent =
            "Only JPG, PNG and WEBP images are allowed.";

        messageElement.style.color = "#ff5555";

        return false;
    }

    const token = localStorage.getItem(IMAGE_TOKEN_KEY);

    if (!token) {

        messageElement.textContent =
            "Admin session not found. Please log in again.";

        messageElement.style.color = "#ff5555";

        return false;
    }

    const formData = new FormData();

    formData.append("image", file);

    messageElement.textContent = "Uploading image...";

    messageElement.style.color = "#d7d7d7";

    try {

        const response = await fetch(IMAGE_UPLOAD_API, {

            method: "POST",

            headers: {
                Authorization: `Bearer ${token}`
            },

            body: formData

        });

        const result = await response.json();

        if (!response.ok || !result.success || !result.imageUrl) {

            throw new Error(
                result.message || "Image upload failed."
            );
        }

        // Save image URL in the hidden database field.

        imageInput.value = result.imageUrl;

        // Show uploaded image preview.

        previewElement.onload = function () {
            previewElement.style.display = "block";
        };

        previewElement.onerror = function () {

            previewElement.style.display = "none";

            messageElement.textContent =
                "Image uploaded, but preview could not be loaded.";

            messageElement.style.color = "#ffb347";
        };

        previewElement.src =
            `${IMAGE_SERVER_URL}${result.imageUrl}`;

        previewElement.style.display = "block";

        messageElement.textContent =
    "Image uploaded successfully. Now save the item.";

        messageElement.style.color = "#4caf50";

        return true;

    } catch (error) {

        console.error("Image Upload Error:", error);

        messageElement.textContent =
            error.message || "Image upload failed.";

        messageElement.style.color = "#ff5555";

        return false;
    }
}

// =============================================
// BIKE IMAGE UPLOAD
// =============================================

const bikeImageFileInput =
    document.getElementById("bikeImageFile");

if (bikeImageFileInput) {

    bikeImageFileInput.addEventListener(
        "change",
        async function (event) {

            // Prevent the event from reaching unrelated handlers.
            event.stopPropagation();

            const file = this.files && this.files[0];

            if (!file) {
                return;
            }

            const imageInput =
                document.getElementById("bikeImage");

            const message =
                document.getElementById("bikeImageUploadMessage");

            const preview =
                document.getElementById("bikeImagePreview");

            if (!imageInput || !message || !preview) {

                console.error(
                    "Bike image upload: required HTML elements are missing."
                );

                return;
            }

            await uploadImage(
                file,
                imageInput,
                message,
                preview
            );
        }
    );
}

// =============================================
// SPARE PART IMAGE UPLOAD
// =============================================

const partImageFileInput =
    document.getElementById("partImageFile");

if (partImageFileInput) {

    partImageFileInput.addEventListener(
        "change",
        async function (event) {

            event.stopPropagation();

            const file = this.files && this.files[0];

            if (!file) {
                return;
            }

            const imageInput =
                document.getElementById("partImage");

            const message =
                document.getElementById("partImageUploadMessage");

            const preview =
                document.getElementById("partImagePreview");

            if (!imageInput || !message || !preview) {

                console.error(
                    "Part image upload: required HTML elements are missing."
                );

                return;
            }

            await uploadImage(
                file,
                imageInput,
                message,
                preview
            );
        }
    );
}
// =============================================
// PREVENT UNWANTED BIKE FORM SUBMISSION
// =============================================

(function protectBikeModal() {
    const bikeForm = document.getElementById("bikeForm");
    const saveBikeButton = document.getElementById("saveBikeButton");

    if (!bikeForm || !saveBikeButton) {
        console.error("Bike form or Save Bike button not found.");
        return;
    }

    let saveButtonClicked = false;

    saveBikeButton.addEventListener("click", function () {
        saveButtonClicked = true;
    });

    bikeForm.addEventListener("submit", function (event) {
        if (!saveButtonClicked) {
            event.preventDefault();
            event.stopImmediatePropagation();

            console.warn("Unwanted bike form submission blocked.");
            return;
        }

        saveButtonClicked = false;
    }, true);

    console.log("Bike form submission protection activated.");
})();