/**
 * ON LOT — create account form (signup.html)
 */
(function () {
    const form = document.querySelector("[data-signup-form]");
    if (!form) {
        return;
    }

    const titleEl = document.querySelector("[data-signup-title]");
    const leadEl = document.querySelector("[data-signup-lead]");
    const messageEl = document.querySelector("[data-signup-message]");
    const accountTypeInputs = form.querySelectorAll("[data-signup-account-type]");
    const shopNameField = form.querySelector(".auth-field--vendor");
    const shopNameInput = form.querySelector("#signup-shop-name");
    const submitBtn = form.querySelector(".auth-submit");

    const COPY = {
        buyer: {
            title: "Create an account",
            lead: "Join ON LOT to shop from lot vendors year-round.",
            submit: "Create account",
        },
        vendor: {
            title: "Create a vendor account",
            lead: "Set up your booth online and reach fans year-round.",
            submit: "Create vendor account",
        },
    };

    function getAccountType() {
        const checked = form.querySelector("[data-signup-account-type]:checked");
        return checked?.value === "vendor" ? "vendor" : "buyer";
    }

    function setAccountType(type) {
        const input = form.querySelector(`[data-signup-account-type][value="${type}"]`);
        if (input) {
            input.checked = true;
        }
        syncAccountTypeUi();
    }

    function syncAccountTypeUi() {
        const type = getAccountType();
        const copy = COPY[type];

        if (titleEl) {
            titleEl.textContent = copy.title;
        }

        if (leadEl) {
            leadEl.textContent = copy.lead;
        }

        if (submitBtn) {
            submitBtn.textContent = copy.submit;
        }

        const isVendor = type === "vendor";

        if (shopNameField) {
            shopNameField.hidden = !isVendor;
        }

        if (shopNameInput) {
            shopNameInput.required = isVendor;
            if (!isVendor) {
                shopNameInput.value = "";
            }
        }
    }

    function showMessage(text, isError) {
        if (!messageEl) {
            return;
        }

        messageEl.textContent = text;
        messageEl.hidden = !text;
        messageEl.classList.toggle("is-error", Boolean(isError));
        messageEl.classList.toggle("is-success", Boolean(text) && !isError);
    }

    function readFormData() {
        const formData = new FormData(form);
        return {
            accountType: getAccountType(),
            firstName: String(formData.get("firstName") || "").trim(),
            lastName: String(formData.get("lastName") || "").trim(),
            shopName: String(formData.get("shopName") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            password: String(formData.get("password") || ""),
            passwordConfirm: String(formData.get("passwordConfirm") || ""),
        };
    }

    function validate(data) {
        if (!data.firstName || !data.lastName) {
            return "Please enter your first and last name.";
        }

        if (data.accountType === "vendor" && !data.shopName) {
            return "Please enter your shop or business name.";
        }

        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            return "Please enter a valid email address.";
        }

        if (data.password.length < 8) {
            return "Password must be at least 8 characters.";
        }

        if (data.password !== data.passwordConfirm) {
            return "Passwords do not match.";
        }

        const terms = form.querySelector('input[name="terms"]');
        if (!terms?.checked) {
            return "Please agree to the terms and privacy policy.";
        }

        return "";
    }

    accountTypeInputs.forEach((input) => {
        input.addEventListener("change", syncAccountTypeUi);
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get("type") === "vendor") {
        setAccountType("vendor");
    } else {
        syncAccountTypeUi();
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        showMessage("");

        const data = readFormData();
        const error = validate(data);

        if (error) {
            showMessage(error, true);
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Creating account…";
        }

        try {
            // Wire this to your auth API (Sharetribe, custom backend, etc.)
            const endpoint = form.getAttribute("data-signup-endpoint");

            if (endpoint) {
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const payload = await response.json().catch(() => ({}));
                    throw new Error(payload.message || "Account creation failed. Please try again.");
                }

                showMessage("Account created! You can log in now.", false);
                form.reset();
                syncAccountTypeUi();
            } else {
                showMessage(
                    "Account signup is not connected yet. Add data-signup-endpoint on the form when your API is ready.",
                    true
                );
            }
        } catch (submitError) {
            showMessage(submitError.message || "Something went wrong. Please try again.", true);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = COPY[getAccountType()].submit;
            }
        }
    });
})();
